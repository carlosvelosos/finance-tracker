/**
 * API Route: Read monthly file
 * GET /api/smart-fetch/read?month=YYYY-MM
 */

import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

const EMAIL_DIR_PATH =
  "C:\\Users\\carlo\\GITHUB\\finance-tracker\\privat\\data\\email";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { error: "Month parameter is required" },
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

    const filename = `gmail-export-${month}.json`;
    const filePath = path.join(EMAIL_DIR_PATH, filename);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content);
      return NextResponse.json(data);
    } catch {
      // File doesn't exist or is corrupted
      return NextResponse.json(null, { status: 404 });
    }
  } catch (error) {
    console.error("Error reading monthly file:", error);
    return NextResponse.json(
      { error: "Failed to read file", details: String(error) },
      { status: 500 },
    );
  }
}
