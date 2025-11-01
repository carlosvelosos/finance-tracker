/**
 * API Route: Migrate existing files to monthly format
 * POST /api/smart-fetch/migrate
 */

import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

const EMAIL_DIR_PATH =
  "C:\\Users\\carlo\\GITHUB\\finance-tracker\\privat\\data\\email";
const BACKUP_DIR = path.join(EMAIL_DIR_PATH, "backup");

interface EmailData {
  id: string;
  snippet?: string;
  headers?: { name: string; value: string }[];
  date?: string;
  [key: string]: unknown;
}

interface MigrationResult {
  success: boolean;
  filesProcessed: number;
  emailsMigrated: number;
  duplicatesRemoved: number;
  monthlyFilesCreated: number;
  backupPath: string;
  errors: string[];
  logs: string[];
}

function isOldFormat(filename: string): boolean {
  return filename.includes("-to-") || filename.includes("merged");
}

function getEmailDate(email: EmailData): Date | null {
  try {
    if (email.date) {
      return new Date(email.date);
    }

    const headers = email.headers || [];
    const dateHeader = headers.find((h) => h.name.toLowerCase() === "date");

    if (dateHeader?.value) {
      return new Date(dateHeader.value);
    }

    return null;
  } catch {
    return null;
  }
}

function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

function deduplicateEmails(emails: EmailData[]): EmailData[] {
  const seen = new Set<string>();
  const unique: EmailData[] = [];

  for (const email of emails) {
    if (!seen.has(email.id)) {
      seen.add(email.id);
      unique.push(email);
    }
  }

  return unique;
}

function sortEmailsByDate(emails: EmailData[]): EmailData[] {
  return [...emails].sort((a, b) => {
    const dateA = getEmailDate(a);
    const dateB = getEmailDate(b);

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    return dateA.getTime() - dateB.getTime();
  });
}

function groupEmailsByMonth(emails: EmailData[]): Map<string, EmailData[]> {
  const grouped = new Map<string, EmailData[]>();

  for (const email of emails) {
    const emailDate = getEmailDate(email);
    if (!emailDate) {
      console.warn("Email has no valid date, skipping:", email.id);
      continue;
    }

    const monthKey = getMonthKey(emailDate);

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }

    grouped.get(monthKey)!.push(email);
  }

  return grouped;
}

export async function POST() {
  const result: MigrationResult = {
    success: false,
    filesProcessed: 0,
    emailsMigrated: 0,
    duplicatesRemoved: 0,
    monthlyFilesCreated: 0,
    backupPath: "",
    errors: [],
    logs: [],
  };

  try {
    result.logs.push("Starting migration process...");

    // Ensure directory exists
    try {
      await fs.access(EMAIL_DIR_PATH);
    } catch {
      result.logs.push("Email directory does not exist, nothing to migrate");
      result.success = true;
      return NextResponse.json(result);
    }

    // Scan directory
    const files = await fs.readdir(EMAIL_DIR_PATH);
    const jsonFiles = files.filter(
      (f) => f.endsWith(".json") && f.startsWith("gmail-export"),
    );
    const oldFormatFiles = jsonFiles.filter((f) => isOldFormat(f));

    if (oldFormatFiles.length === 0) {
      result.logs.push("No files need migration");
      result.success = true;
      return NextResponse.json(result);
    }

    result.logs.push(`Found ${oldFormatFiles.length} file(s) to migrate`);

    // Create backup directory with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    await fs.mkdir(backupPath, { recursive: true });
    result.backupPath = path.basename(backupPath);

    result.logs.push(`Created backup directory: ${path.basename(backupPath)}`);

    // Read all emails from old files
    const allEmails: EmailData[] = [];
    const sourceFiles: string[] = [];

    for (const filename of oldFormatFiles) {
      try {
        const filePath = path.join(EMAIL_DIR_PATH, filename);
        const content = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(content);

        if (data.emails && Array.isArray(data.emails)) {
          allEmails.push(...data.emails);
          sourceFiles.push(filename);
          result.filesProcessed++;

          result.logs.push(
            `Read ${data.emails.length} emails from ${filename}`,
          );
        }

        // Backup the file
        await fs.copyFile(filePath, path.join(backupPath, filename));
      } catch (err) {
        const errMsg = `Error processing ${filename}: ${err}`;
        result.errors.push(errMsg);
        result.logs.push(`ERROR: ${errMsg}`);
      }
    }

    result.logs.push(`Total emails collected: ${allEmails.length}`);

    // Deduplicate
    const beforeDedup = allEmails.length;
    const uniqueEmails = deduplicateEmails(allEmails);
    result.duplicatesRemoved = beforeDedup - uniqueEmails.length;
    result.emailsMigrated = uniqueEmails.length;

    if (result.duplicatesRemoved > 0) {
      result.logs.push(`Removed ${result.duplicatesRemoved} duplicate(s)`);
    }

    // Group by month
    const grouped = groupEmailsByMonth(uniqueEmails);
    result.logs.push(`Grouping into ${grouped.size} month(s)`);

    // Create monthly files
    for (const [month, emails] of grouped) {
      try {
        const [year, monthNum] = month.split("-").map(Number);
        const lastDay = new Date(year, monthNum, 0).getDate();

        const fileData = {
          dateRange: {
            start: `${month}-01`,
            end: `${month}-${lastDay.toString().padStart(2, "0")}`,
          },
          totalEmails: emails.length,
          emails: sortEmailsByDate(emails),
          exportDate: new Date().toISOString(),
          fetchedBy: "migration-script",
          migrationInfo: {
            migratedAt: new Date().toISOString(),
            sourceFiles,
            duplicatesRemoved: result.duplicatesRemoved,
          },
        };

        const filename = `gmail-export-${month}.json`;
        const filePath = path.join(EMAIL_DIR_PATH, filename);
        await fs.writeFile(
          filePath,
          JSON.stringify(fileData, null, 2),
          "utf-8",
        );

        result.monthlyFilesCreated++;
        result.logs.push(
          `Created gmail-export-${month}.json (${emails.length} emails)`,
        );
      } catch (err) {
        const errMsg = `Error creating monthly file for ${month}: ${err}`;
        result.errors.push(errMsg);
        result.logs.push(`ERROR: ${errMsg}`);
      }
    }

    // Delete old files after successful migration
    if (result.errors.length === 0) {
      for (const filename of oldFormatFiles) {
        try {
          await fs.unlink(path.join(EMAIL_DIR_PATH, filename));
          result.logs.push(`Removed old file: ${filename}`);
        } catch {
          result.logs.push(`Warning: Could not delete ${filename}`);
        }
      }
    }

    result.success = result.errors.length === 0;

    if (result.success) {
      result.logs.push(
        `Migration complete! ${result.emailsMigrated} emails organized into ${result.monthlyFilesCreated} monthly file(s)`,
      );
    } else {
      result.logs.push(
        `Migration completed with ${result.errors.length} error(s)`,
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    result.errors.push(`Migration failed: ${error}`);
    result.logs.push(`FATAL ERROR: ${error}`);
    return NextResponse.json(result, { status: 500 });
  }
}
