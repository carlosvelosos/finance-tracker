/**
 * API Route: Write monthly file
 * POST /api/smart-fetch/write
 * Body: { month: string, data: MonthlyFileData, fullEmails?: any[], saveFullData?: boolean }
 */

import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import { batchSaveFullEmails } from "@/lib/utils/emailStorage";

const EMAIL_DIR_PATH =
  "C:\\Users\\carlo\\GITHUB\\finance-tracker\\privat\\data\\email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month, data, fullEmails, saveFullData = false } = body;

    console.log(`[Write API] Received request for ${month}:`);
    console.log(`  - saveFullData: ${saveFullData}`);
    console.log(
      `  - fullEmails array: ${fullEmails ? `${fullEmails.length} emails` : "not provided"}`,
    );
    console.log(`  - data.version: ${data.version || "not set"}`);

    if (!month || !data) {
      return NextResponse.json(
        { error: "Month and data are required" },
        { status: 400 },
      );
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "Invalid month format. Expected: YYYY-MM" },
        { status: 400 },
      );
    }

    // Ensure directory exists
    await fs.mkdir(EMAIL_DIR_PATH, { recursive: true });

    const filename = `gmail-export-${month}.json`;
    const filePath = path.join(EMAIL_DIR_PATH, filename);

    // Save monthly index file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    const result: {
      success: boolean;
      filename: string;
      fullData?: { saved: number; errors: string[] };
    } = { success: true, filename };

    // Optionally save full email data
    if (saveFullData && fullEmails && Array.isArray(fullEmails)) {
      console.log(
        `[Write API] Saving full data for ${fullEmails.length} emails...`,
      );

      const getEmailDate = (email: {
        date?: string;
        payload?: { headers?: Array<{ name: string; value: string }> };
      }): string | null => {
        try {
          if (email.date) {
            const date = new Date(email.date);
            return date.toISOString().split("T")[0];
          }
          if (email.payload?.headers) {
            const dateHeader = email.payload.headers.find(
              (h) => h.name.toLowerCase() === "date",
            );
            if (dateHeader?.value) {
              const date = new Date(dateHeader.value);
              return date.toISOString().split("T")[0];
            }
          }
          return null;
        } catch {
          return null;
        }
      };

      const fullDataResult = await batchSaveFullEmails(
        fullEmails,
        getEmailDate,
      );

      result.fullData = {
        saved: fullDataResult.saved,
        errors: fullDataResult.errors,
      };

      console.log(
        `[Write API] Full data saved: ${fullDataResult.saved} success, ${fullDataResult.errors.length} errors`,
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error writing monthly file:", error);
    return NextResponse.json(
      { error: "Failed to write file", details: String(error) },
      { status: 500 },
    );
  }
}
