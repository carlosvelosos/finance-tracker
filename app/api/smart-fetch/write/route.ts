/**
 * API Route: Write monthly file
 * POST /api/smart-fetch/write
 * Body: { month: string, data: MonthlyFileData }
 */

import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

const EMAIL_DIR_PATH =
  "C:\\Users\\carlo\\GITHUB\\finance-tracker\\privat\\data\\email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month, data } = body;

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

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error("Error writing monthly file:", error);
    return NextResponse.json(
      { error: "Failed to write file", details: String(error) },
      { status: 500 },
    );
  }
}
