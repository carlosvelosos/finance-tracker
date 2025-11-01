/**
 * API Route: Scan email directory
 * GET /api/smart-fetch/scan
 */

import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

const EMAIL_DIR_PATH =
  "C:\\Users\\carlo\\GITHUB\\finance-tracker\\privat\\data\\email";

function parseFilenameDate(filename: string): Date | null {
  try {
    const nameWithoutExt = filename.replace(".json", "");

    // Try monthly format: gmail-export-YYYY-MM
    const monthlyMatch = nameWithoutExt.match(/gmail-export-(\d{4})-(\d{2})$/);
    if (monthlyMatch) {
      const [, year, month] = monthlyMatch;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      return new Date(parseInt(year), parseInt(month) - 1, lastDay, 23, 59, 59);
    }

    // Try range format: gmail-export-YYYY-MM-DD-to-YYYY-MM-DD
    const rangeMatch = nameWithoutExt.match(
      /gmail-export-\d{4}-\d{2}-\d{2}-to-(\d{4})-(\d{2})-(\d{2})$/,
    );
    if (rangeMatch) {
      const [, year, month, day] = rangeMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    return null;
  } catch (error) {
    console.error("Error parsing filename date:", filename, error);
    return null;
  }
}

function isOldFormat(filename: string): boolean {
  return filename.includes("-to-") || filename.includes("merged");
}

function getEmailDate(email: {
  id: string;
  date?: string;
  headers?: { name: string; value: string }[];
}): Date | null {
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

async function getLatestEmailDateFromFile(
  filename: string,
): Promise<Date | null> {
  try {
    const filePath = path.join(EMAIL_DIR_PATH, filename);
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);

    if (
      !data.emails ||
      !Array.isArray(data.emails) ||
      data.emails.length === 0
    ) {
      return null;
    }

    let latestDate: Date | null = null;

    for (const email of data.emails) {
      const emailDate = getEmailDate(email);
      if (emailDate && (!latestDate || emailDate > latestDate)) {
        latestDate = emailDate;
      }
    }

    return latestDate;
  } catch (error) {
    console.error("Error reading file:", filename, error);
    return null;
  }
}

export async function GET() {
  try {
    // Check if directory exists
    try {
      await fs.access(EMAIL_DIR_PATH);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(EMAIL_DIR_PATH, { recursive: true });
      return NextResponse.json({
        files: [],
        latestFile: null,
        latestEmailDate: null,
        totalFiles: 0,
        needsMigration: false,
      });
    }

    const files = await fs.readdir(EMAIL_DIR_PATH);
    const jsonFiles = files.filter(
      (f) => f.endsWith(".json") && f.startsWith("gmail-export"),
    );

    const needsMigration = jsonFiles.some((f) => isOldFormat(f));

    let latestFile: string | null = null;
    let latestDate: Date | null = null;

    for (const file of jsonFiles) {
      const fileDate = parseFilenameDate(file);
      if (fileDate && (!latestDate || fileDate > latestDate)) {
        latestDate = fileDate;
        latestFile = file;
      }
    }

    let latestEmailDate: Date | null = null;
    if (latestFile) {
      latestEmailDate = await getLatestEmailDateFromFile(latestFile);
    }

    return NextResponse.json({
      files: jsonFiles,
      latestFile,
      latestEmailDate: latestEmailDate?.toISOString() || null,
      totalFiles: jsonFiles.length,
      needsMigration,
    });
  } catch (error) {
    console.error("Error scanning directory:", error);
    return NextResponse.json(
      { error: "Failed to scan directory", details: String(error) },
      { status: 500 },
    );
  }
}
