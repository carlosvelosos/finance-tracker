/**
 * Email Storage Utilities
 *
 * Server-side utilities for managing full email data storage in the file system.
 * Implements two-tier storage: minimal index files + full data files.
 *
 * Directory structure:
 * privat/data/email/
 * ├── gmail-export-YYYY-MM.json (index files)
 * └── full/
 *     └── YYYY/
 *         └── MM/
 *             └── DD/
 *                 └── {emailId}.json (full email data)
 */

import * as fs from "fs/promises";
import * as path from "path";

const EMAIL_BASE_PATH =
  "C:\\Users\\carlo\\GITHUB\\finance-tracker\\privat\\data\\email";
const FULL_DATA_DIR = "full";

/**
 * Interface for full email data
 */
interface EmailPart {
  body?: { data?: string; size?: number; attachmentId?: string };
  filename?: string;
  mimeType?: string;
  parts?: EmailPart[];
}

export interface FullEmailData {
  id: string;
  snippet: string;
  payload?: {
    headers?: { name: string; value: string }[];
    body?: { data?: string; size?: number };
    parts?: EmailPart[];
    mimeType?: string;
  };
  threadId?: string;
  labelIds?: string[];
  internalDate?: string;
  sizeEstimate?: number;
  attachments?: {
    filename: string;
    mimeType: string;
    size: number;
    attachmentId?: string;
  }[];
  storedDate: string;
}

/**
 * Get the full path for storing email data
 * @param emailId - Email ID
 * @param date - Email date (YYYY-MM-DD format)
 * @returns Full file system path
 */
export function getFullEmailPath(emailId: string, date: string): string {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  return path.join(
    EMAIL_BASE_PATH,
    FULL_DATA_DIR,
    String(year),
    month,
    day,
    `${emailId}.json`,
  );
}

/**
 * Get the relative path for storing in index file
 * @param emailId - Email ID
 * @param date - Email date (YYYY-MM-DD format)
 * @returns Relative path from email directory
 */
export function getFullEmailRelativePath(
  emailId: string,
  date: string,
): string {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${FULL_DATA_DIR}/${year}/${month}/${day}/${emailId}.json`;
}

/**
 * Ensure directory structure exists
 * @param date - Email date (YYYY-MM-DD format)
 */
export async function ensureDirectoryStructure(date: string): Promise<void> {
  const filePath = getFullEmailPath("dummy", date);
  const dir = path.dirname(filePath);

  try {
    await fs.access(dir);
  } catch {
    // Directory doesn't exist, create it
    await fs.mkdir(dir, { recursive: true });
    console.log(`[EmailStorage] Created directory: ${dir}`);
  }
}

/**
 * Save full email data to file system
 * @param emailData - Full email data object
 * @param date - Email date (YYYY-MM-DD format)
 * @returns Relative path to the saved file
 */
export async function saveFullEmail(
  emailData: Partial<FullEmailData> & { id: string },
  date: string,
): Promise<string> {
  try {
    // Ensure directory exists
    await ensureDirectoryStructure(date);

    // Prepare full email data with metadata
    const fullData: FullEmailData = {
      id: emailData.id,
      snippet: emailData.snippet || "",
      payload: emailData.payload,
      threadId: emailData.threadId,
      labelIds: emailData.labelIds,
      internalDate: emailData.internalDate,
      sizeEstimate: emailData.sizeEstimate,
      storedDate: new Date().toISOString(),
    };

    // Parse attachments if payload exists
    if (emailData.payload) {
      const attachments = extractAttachmentInfo(emailData.payload);
      if (attachments.length > 0) {
        fullData.attachments = attachments;
      }
    }

    // Get file path
    const filePath = getFullEmailPath(emailData.id, date);

    // Write to file
    await fs.writeFile(filePath, JSON.stringify(fullData, null, 2), "utf-8");

    console.log(`[EmailStorage] Saved full email: ${emailData.id}`);

    // Return relative path
    return getFullEmailRelativePath(emailData.id, date);
  } catch (error) {
    console.error(`[EmailStorage] Error saving email ${emailData.id}:`, error);
    throw error;
  }
}

/**
 * Load full email data from file system
 * @param emailId - Email ID
 * @param date - Email date (YYYY-MM-DD format)
 * @returns Full email data or null if not found
 */
export async function loadFullEmail(
  emailId: string,
  date: string,
): Promise<FullEmailData | null> {
  try {
    const filePath = getFullEmailPath(emailId, date);
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content) as FullEmailData;

    console.log(`[EmailStorage] Loaded full email: ${emailId}`);
    return data;
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === "ENOENT") {
      console.log(`[EmailStorage] Full email not found: ${emailId}`);
      return null;
    }
    console.error(`[EmailStorage] Error loading email ${emailId}:`, error);
    throw error;
  }
}

/**
 * Delete full email data file
 * @param emailId - Email ID
 * @param date - Email date (YYYY-MM-DD format)
 * @returns True if deleted, false if not found
 */
export async function deleteFullEmail(
  emailId: string,
  date: string,
): Promise<boolean> {
  try {
    const filePath = getFullEmailPath(emailId, date);
    await fs.unlink(filePath);

    console.log(`[EmailStorage] Deleted full email: ${emailId}`);
    return true;
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === "ENOENT") {
      console.log(
        `[EmailStorage] Full email not found for deletion: ${emailId}`,
      );
      return false;
    }
    console.error(`[EmailStorage] Error deleting email ${emailId}:`, error);
    throw error;
  }
}

/**
 * Check if full email data exists
 * @param emailId - Email ID
 * @param date - Email date (YYYY-MM-DD format)
 * @returns True if file exists
 */
export async function fullEmailExists(
  emailId: string,
  date: string,
): Promise<boolean> {
  try {
    const filePath = getFullEmailPath(emailId, date);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Batch save full email data
 * @param emails - Array of email objects
 * @param getEmailDate - Function to extract date from email
 * @returns Object with success count and errors
 */
export async function batchSaveFullEmails(
  emails: Array<Partial<FullEmailData> & { id: string }>,
  getEmailDate: (
    email: Partial<FullEmailData> & { id: string },
  ) => string | null,
): Promise<{ saved: number; errors: string[] }> {
  console.log(
    `[EmailStorage] batchSaveFullEmails called with ${emails.length} emails`,
  );
  const result = { saved: 0, errors: [] as string[] };

  for (const email of emails) {
    try {
      const date = getEmailDate(email);
      if (!date) {
        result.errors.push(`Email ${email.id}: No valid date`);
        console.log(`[EmailStorage] Skipping email ${email.id}: no valid date`);
        continue;
      }

      await saveFullEmail(email, date);
      result.saved++;
    } catch (error) {
      result.errors.push(
        `Email ${email.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return result;
}

/**
 * Batch delete full email data
 * @param emailIds - Array of email IDs with dates
 * @returns Object with deleted count and errors
 */
export async function batchDeleteFullEmails(
  emailIds: { id: string; date: string }[],
): Promise<{ deleted: number; errors: string[] }> {
  const result = { deleted: 0, errors: [] as string[] };

  for (const { id, date } of emailIds) {
    try {
      const deleted = await deleteFullEmail(id, date);
      if (deleted) {
        result.deleted++;
      }
    } catch (error) {
      result.errors.push(
        `Email ${id}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return result;
}

/**
 * Extract attachment information from email payload
 * @param payload - Email payload
 * @returns Array of attachment info
 */
function extractAttachmentInfo(payload: EmailPart): {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId?: string;
}[] {
  const attachments: {
    filename: string;
    mimeType: string;
    size: number;
    attachmentId?: string;
  }[] = [];

  function traverse(part: EmailPart) {
    if (!part) return;

    // Check if this part is an attachment
    if (part.filename && part.body) {
      attachments.push({
        filename: part.filename,
        mimeType: part.mimeType || "application/octet-stream",
        size: part.body.size || 0,
        attachmentId: part.body.attachmentId,
      });
    }

    // Recursively check nested parts
    if (part.parts && Array.isArray(part.parts)) {
      for (const nestedPart of part.parts) {
        traverse(nestedPart);
      }
    }
  }

  traverse(payload);
  return attachments;
}

/**
 * Get statistics about full email storage
 * @returns Storage statistics
 */
export async function getStorageStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  byYear: Record<string, { files: number; size: number }>;
}> {
  const stats = {
    totalFiles: 0,
    totalSize: 0,
    byYear: {} as Record<string, { files: number; size: number }>,
  };

  try {
    const fullDataPath = path.join(EMAIL_BASE_PATH, FULL_DATA_DIR);

    // Check if directory exists
    try {
      await fs.access(fullDataPath);
    } catch {
      return stats;
    }

    // Read years
    const years = await fs.readdir(fullDataPath);

    for (const year of years) {
      const yearPath = path.join(fullDataPath, year);
      const yearStat = await fs.stat(yearPath);

      if (!yearStat.isDirectory()) continue;

      stats.byYear[year] = { files: 0, size: 0 };

      // Read months
      const months = await fs.readdir(yearPath);

      for (const month of months) {
        const monthPath = path.join(yearPath, month);
        const monthStat = await fs.stat(monthPath);

        if (!monthStat.isDirectory()) continue;

        // Read days
        const days = await fs.readdir(monthPath);

        for (const day of days) {
          const dayPath = path.join(monthPath, day);
          const dayStat = await fs.stat(dayPath);

          if (!dayStat.isDirectory()) continue;

          // Read files
          const files = await fs.readdir(dayPath);

          for (const file of files) {
            if (!file.endsWith(".json")) continue;

            const filePath = path.join(dayPath, file);
            const fileStat = await fs.stat(filePath);

            stats.totalFiles++;
            stats.totalSize += fileStat.size;
            stats.byYear[year].files++;
            stats.byYear[year].size += fileStat.size;
          }
        }
      }
    }
  } catch (error) {
    console.error("[EmailStorage] Error getting storage stats:", error);
  }

  return stats;
}
