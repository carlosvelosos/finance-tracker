/**
 * Smart Fetching Utilities
 *
 * Handles intelligent email fetching and organization into monthly JSON files.
 * Includes migration, scanning, fetching, grouping, and deduplication logic.
 */

import * as fs from "fs/promises";
import * as path from "path";

// ============================================================================
// Types
// ============================================================================

export interface EmailData {
  id: string;
  snippet: string;
  headers: { name: string; value: string }[];
  date?: string;
  from?: string;
  subject?: string;
  to?: string;
  ignored?: boolean;
  payload?: {
    headers: { name: string; value: string }[];
    body?: unknown;
    parts?: unknown[];
  };
}

export interface MonthlyFileData {
  dateRange: {
    start: string;
    end: string;
  };
  totalEmails: number;
  emails: EmailData[];
  exportDate: string;
  fetchedBy: string;
  lastUpdated?: string;
  migrationInfo?: {
    migratedAt: string;
    sourceFiles: string[];
    duplicatesRemoved: number;
  };
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface MigrationResult {
  success: boolean;
  filesProcessed: number;
  emailsMigrated: number;
  duplicatesRemoved: number;
  monthlyFilesCreated: number;
  backupPath: string;
  errors: string[];
}

export interface ScanResult {
  files: string[];
  latestFile: string | null;
  latestEmailDate: Date | null;
  totalFiles: number;
  needsMigration: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const EMAIL_DIR_PATH =
  "C:\\Users\\carlo\\GITHUB\\finance-tracker\\privat\\data\\email";
const BACKUP_DIR = path.join(EMAIL_DIR_PATH, "backup");

// Check if running in browser or Node.js environment
const isBrowser = typeof window !== "undefined";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a log entry with timestamp
 */
export function createLogEntry(
  message: string,
  type: LogEntry["type"] = "info",
): LogEntry {
  const now = new Date();
  const timestamp = now.toLocaleTimeString("en-US", { hour12: false });

  let icon = "ℹ️";
  switch (type) {
    case "success":
      icon = "✅";
      break;
    case "warning":
      icon = "⚠️";
      break;
    case "error":
      icon = "❌";
      break;
  }

  return {
    timestamp,
    message: `${icon} ${message}`,
    type,
  };
}

/**
 * Get month key in YYYY-MM format
 */
export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Get the last day of a month
 */
function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Parse date from filename
 * Supports formats: gmail-export-YYYY-MM.json and gmail-export-YYYY-MM-DD-to-YYYY-MM-DD.json
 */
export function parseFilenameDate(filename: string): Date | null {
  try {
    // Remove .json extension
    const nameWithoutExt = filename.replace(".json", "");

    // Try monthly format first: gmail-export-YYYY-MM
    const monthlyMatch = nameWithoutExt.match(/gmail-export-(\d{4})-(\d{2})$/);
    if (monthlyMatch) {
      const [, year, month] = monthlyMatch;
      // Return the last day of the month for sorting purposes
      const lastDay = getLastDayOfMonth(parseInt(year), parseInt(month));
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

/**
 * Check if a filename follows the old format (needs migration)
 */
function isOldFormat(filename: string): boolean {
  return filename.includes("-to-") || filename.includes("merged");
}

/**
 * Extract date from email headers
 */
function getEmailDate(email: EmailData): Date | null {
  try {
    // Try the date field first
    if (email.date) {
      return new Date(email.date);
    }

    // Try headers
    const headers = email.headers || email.payload?.headers || [];
    const dateHeader = headers.find((h) => h.name.toLowerCase() === "date");

    if (dateHeader?.value) {
      return new Date(dateHeader.value);
    }

    return null;
  } catch (err) {
    console.error("Error parsing email date:", email.id, err);
    return null;
  }
}

/**
 * Sort emails by date (ascending)
 */
export function sortEmailsByDate(emails: EmailData[]): EmailData[] {
  return [...emails].sort((a, b) => {
    const dateA = getEmailDate(a);
    const dateB = getEmailDate(b);

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Deduplicate emails by ID
 */
export function deduplicateEmails(emails: EmailData[]): EmailData[] {
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

// ============================================================================
// File System Operations (Browser-safe)
// ============================================================================

/**
 * Scan email directory for JSON files
 * In browser environment, this needs to be called via API route
 */
export async function scanEmailDirectory(): Promise<ScanResult> {
  if (isBrowser) {
    // In browser, call API route
    try {
      const response = await fetch("/api/smart-fetch/scan");
      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error scanning directory:", error);
      return {
        files: [],
        latestFile: null,
        latestEmailDate: null,
        totalFiles: 0,
        needsMigration: false,
      };
    }
  }

  // Server-side implementation
  try {
    const files = await fs.readdir(EMAIL_DIR_PATH);
    const jsonFiles = files.filter(
      (f) => f.endsWith(".json") && f.startsWith("gmail-export"),
    );

    // Check if any files need migration
    const needsMigration = jsonFiles.some((f) => isOldFormat(f));

    // Find latest file
    let latestFile: string | null = null;
    let latestDate: Date | null = null;

    for (const file of jsonFiles) {
      const fileDate = parseFilenameDate(file);
      if (fileDate && (!latestDate || fileDate > latestDate)) {
        latestDate = fileDate;
        latestFile = file;
      }
    }

    // Get latest email date from latest file
    let latestEmailDate: Date | null = null;
    if (latestFile) {
      latestEmailDate = await getLatestEmailDateFromFile(latestFile);
    }

    return {
      files: jsonFiles,
      latestFile,
      latestEmailDate,
      totalFiles: jsonFiles.length,
      needsMigration,
    };
  } catch (error) {
    console.error("Error scanning directory:", error);
    throw error;
  }
}

/**
 * Get the latest email date from a specific file
 */
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

    // Find the latest date among all emails
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

/**
 * Read a monthly file
 */
export async function readMonthlyFile(
  month: string,
): Promise<MonthlyFileData | null> {
  if (isBrowser) {
    // In browser, call API route
    const response = await fetch(`/api/smart-fetch/read?month=${month}`);
    if (!response.ok) return null;
    return await response.json();
  }

  try {
    const filename = `gmail-export-${month}.json`;
    const filePath = path.join(EMAIL_DIR_PATH, filename);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    // File doesn't exist or is corrupted
    return null;
  }
}

/**
 * Write a monthly file
 */
export async function writeMonthlyFile(
  month: string,
  data: MonthlyFileData,
): Promise<void> {
  if (isBrowser) {
    // In browser, call API route
    const response = await fetch("/api/smart-fetch/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, data }),
    });
    if (!response.ok) {
      throw new Error(`Failed to write file: ${response.statusText}`);
    }
    return;
  }

  try {
    const filename = `gmail-export-${month}.json`;
    const filePath = path.join(EMAIL_DIR_PATH, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing file:", month, error);
    throw error;
  }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Group emails by month
 */
export function groupEmailsByMonth(
  emails: EmailData[],
): Map<string, EmailData[]> {
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

/**
 * Update or create a monthly file with new emails
 */
export async function updateMonthlyFile(
  month: string,
  newEmails: EmailData[],
  userEmail: string,
  onLog?: (log: LogEntry) => void,
): Promise<void> {
  try {
    // Read existing file if it exists
    const existing = await readMonthlyFile(month);

    let allEmails: EmailData[];
    let duplicatesRemoved = 0;

    if (existing) {
      // Merge with existing emails
      const existingIds = new Set(existing.emails.map((e) => e.id));
      const uniqueNew = newEmails.filter((e) => {
        if (existingIds.has(e.id)) {
          duplicatesRemoved++;
          return false;
        }
        return true;
      });

      allEmails = [...existing.emails, ...uniqueNew];

      if (onLog && duplicatesRemoved > 0) {
        onLog(
          createLogEntry(
            `Skipped ${duplicatesRemoved} duplicate(s) in ${month}`,
            "info",
          ),
        );
      }
    } else {
      allEmails = newEmails;
    }

    // Sort by date
    allEmails = sortEmailsByDate(allEmails);

    // Parse month to get date range
    const [year, monthNum] = month.split("-").map(Number);
    const lastDay = getLastDayOfMonth(year, monthNum);

    // Create file data
    const fileData: MonthlyFileData = {
      dateRange: {
        start: `${month}-01`,
        end: `${month}-${lastDay.toString().padStart(2, "0")}`,
      },
      totalEmails: allEmails.length,
      emails: allEmails,
      exportDate: existing?.exportDate || new Date().toISOString(),
      fetchedBy: userEmail,
      lastUpdated: new Date().toISOString(),
    };

    // Write file
    await writeMonthlyFile(month, fileData);

    if (onLog) {
      const action = existing ? "Updated" : "Created";
      const count = existing
        ? newEmails.length - duplicatesRemoved
        : newEmails.length;
      onLog(
        createLogEntry(
          `${action} gmail-export-${month}.json (${count} new email(s), ${allEmails.length} total)`,
          "success",
        ),
      );
    }
  } catch (error) {
    console.error("Error updating monthly file:", month, error);
    if (onLog) {
      onLog(createLogEntry(`Failed to update ${month}: ${error}`, "error"));
    }
    throw error;
  }
}

/**
 * Migrate existing files to monthly format
 * This should be called via API route in browser environment
 */
export async function migrateExistingFiles(
  onLog?: (log: LogEntry) => void,
): Promise<MigrationResult> {
  if (isBrowser) {
    // In browser, call API route
    const response = await fetch("/api/smart-fetch/migrate", {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Migration failed: ${response.statusText}`);
    }
    return await response.json();
  }

  const result: MigrationResult = {
    success: false,
    filesProcessed: 0,
    emailsMigrated: 0,
    duplicatesRemoved: 0,
    monthlyFilesCreated: 0,
    backupPath: "",
    errors: [],
  };

  try {
    if (onLog) onLog(createLogEntry("Starting migration process...", "info"));

    // Scan directory
    const scanResult = await scanEmailDirectory();
    const oldFormatFiles = scanResult.files.filter((f) => isOldFormat(f));

    if (oldFormatFiles.length === 0) {
      if (onLog) onLog(createLogEntry("No files need migration", "success"));
      result.success = true;
      return result;
    }

    if (onLog)
      onLog(
        createLogEntry(
          `Found ${oldFormatFiles.length} file(s) to migrate`,
          "info",
        ),
      );

    // Create backup directory with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    await fs.mkdir(backupPath, { recursive: true });
    result.backupPath = backupPath;

    if (onLog)
      onLog(
        createLogEntry(
          `Created backup directory: ${path.basename(backupPath)}`,
          "info",
        ),
      );

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

          if (onLog)
            onLog(
              createLogEntry(
                `Read ${data.emails.length} emails from ${filename}`,
                "info",
              ),
            );
        }

        // Backup the file
        await fs.copyFile(filePath, path.join(backupPath, filename));
      } catch (err) {
        const errMsg = `Error processing ${filename}: ${err}`;
        result.errors.push(errMsg);
        if (onLog) onLog(createLogEntry(errMsg, "error"));
      }
    }

    if (onLog)
      onLog(
        createLogEntry(`Total emails collected: ${allEmails.length}`, "info"),
      );

    // Deduplicate
    const beforeDedup = allEmails.length;
    const uniqueEmails = deduplicateEmails(allEmails);
    result.duplicatesRemoved = beforeDedup - uniqueEmails.length;
    result.emailsMigrated = uniqueEmails.length;

    if (result.duplicatesRemoved > 0 && onLog) {
      onLog(
        createLogEntry(
          `Removed ${result.duplicatesRemoved} duplicate(s)`,
          "info",
        ),
      );
    }

    // Group by month
    const grouped = groupEmailsByMonth(uniqueEmails);
    if (onLog)
      onLog(createLogEntry(`Grouping into ${grouped.size} month(s)`, "info"));

    // Create monthly files
    for (const [month, emails] of grouped) {
      try {
        const [year, monthNum] = month.split("-").map(Number);
        const lastDay = getLastDayOfMonth(year, monthNum);

        const fileData: MonthlyFileData = {
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

        await writeMonthlyFile(month, fileData);
        result.monthlyFilesCreated++;

        if (onLog)
          onLog(
            createLogEntry(
              `Created gmail-export-${month}.json (${emails.length} emails)`,
              "success",
            ),
          );
      } catch (err) {
        const errMsg = `Error creating monthly file for ${month}: ${err}`;
        result.errors.push(errMsg);
        if (onLog) onLog(createLogEntry(errMsg, "error"));
      }
    }

    // Delete old files after successful migration
    if (result.errors.length === 0) {
      for (const filename of oldFormatFiles) {
        try {
          await fs.unlink(path.join(EMAIL_DIR_PATH, filename));
          if (onLog)
            onLog(createLogEntry(`Removed old file: ${filename}`, "info"));
        } catch {
          if (onLog)
            onLog(
              createLogEntry(
                `Warning: Could not delete ${filename}`,
                "warning",
              ),
            );
        }
      }
    }

    result.success = result.errors.length === 0;

    if (onLog) {
      if (result.success) {
        onLog(
          createLogEntry(
            `Migration complete! ${result.emailsMigrated} emails organized into ${result.monthlyFilesCreated} monthly file(s)`,
            "success",
          ),
        );
      } else {
        onLog(
          createLogEntry(
            `Migration completed with ${result.errors.length} error(s)`,
            "warning",
          ),
        );
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Migration failed: ${error}`);
    if (onLog) onLog(createLogEntry(`Migration failed: ${error}`, "error"));
    return result;
  }
}

// ============================================================================
// Export all functions
// ============================================================================

export default {
  // Migration
  migrateExistingFiles,

  // Scanning
  scanEmailDirectory,
  parseFilenameDate,

  // File operations
  readMonthlyFile,
  writeMonthlyFile,
  updateMonthlyFile,

  // Organization
  groupEmailsByMonth,
  deduplicateEmails,
  sortEmailsByDate,
  getMonthKey,

  // Utilities
  createLogEntry,
} as const;
