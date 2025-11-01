import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const BASE_PATH = path.join(process.cwd(), "privat", "data", "email");

// Helper to get directory size recursively
async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0;

  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        totalSize += await getDirectorySize(itemPath);
      } else if (item.isFile()) {
        const stats = await fs.stat(itemPath);
        totalSize += stats.size;
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
    return 0;
  }

  return totalSize;
}

// Helper to count files recursively
async function countFiles(dirPath: string): Promise<number> {
  let count = 0;

  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        count += await countFiles(itemPath);
      } else if (item.isFile() && item.name.endsWith(".json")) {
        count++;
      }
    }
  } catch {
    return 0;
  }

  return count;
}

// Helper to find orphaned files
async function findOrphanedFiles(): Promise<string[]> {
  const orphaned: string[] = [];
  const fullDataPath = path.join(BASE_PATH, "full");

  try {
    // Get all monthly index files
    const monthlyFiles = await fs.readdir(BASE_PATH);
    const indexedEmailIds = new Set<string>();

    for (const file of monthlyFiles) {
      if (file.startsWith("gmail-export-") && file.endsWith(".json")) {
        try {
          const content = await fs.readFile(
            path.join(BASE_PATH, file),
            "utf-8",
          );
          const data = JSON.parse(content);

          if (data.emails && Array.isArray(data.emails)) {
            data.emails.forEach((email: { id?: string }) => {
              if (email.id) {
                indexedEmailIds.add(email.id);
              }
            });
          }
        } catch (err) {
          console.error(`Error reading ${file}:`, err);
        }
      }
    }

    // Check all full data files
    const years = await fs.readdir(fullDataPath);

    for (const year of years) {
      const yearPath = path.join(fullDataPath, year);
      const yearStat = await fs.stat(yearPath);

      if (!yearStat.isDirectory()) continue;

      const months = await fs.readdir(yearPath);

      for (const month of months) {
        const monthPath = path.join(yearPath, month);
        const monthStat = await fs.stat(monthPath);

        if (!monthStat.isDirectory()) continue;

        const days = await fs.readdir(monthPath);

        for (const day of days) {
          const dayPath = path.join(monthPath, day);
          const dayStat = await fs.stat(dayPath);

          if (!dayStat.isDirectory()) continue;

          const files = await fs.readdir(dayPath);

          for (const file of files) {
            if (file.endsWith(".json")) {
              const emailId = file.replace(".json", "");

              if (!indexedEmailIds.has(emailId)) {
                orphaned.push(
                  path.relative(BASE_PATH, path.join(dayPath, file)),
                );
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error finding orphaned files:", error);
  }

  return orphaned;
}

export async function GET() {
  try {
    // Get total size of email directory
    const totalSize = await getDirectorySize(BASE_PATH);

    // Get size of full data directory
    const fullDataPath = path.join(BASE_PATH, "full");
    const fullDataSize = await getDirectorySize(fullDataPath);

    // Count files
    const totalFiles = await countFiles(BASE_PATH);
    const fullDataFiles = await countFiles(fullDataPath);

    // Count monthly index files
    const monthlyFiles = await fs.readdir(BASE_PATH);
    const indexFileCount = monthlyFiles.filter(
      (f) => f.startsWith("gmail-export-") && f.endsWith(".json"),
    ).length;

    // Find orphaned files
    const orphaned = await findOrphanedFiles();

    return NextResponse.json({
      success: true,
      stats: {
        totalSize,
        fullDataSize,
        indexSize: totalSize - fullDataSize,
        totalFiles,
        fullDataFiles,
        indexFileCount,
        orphanedFiles: orphaned.length,
        orphanedFilesList: orphaned,
      },
    });
  } catch (error) {
    console.error("Error getting storage stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
