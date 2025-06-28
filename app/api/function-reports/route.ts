import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const reportsDir = path.join(process.cwd(), "scan-functions-reports");

    // Check if the directory exists
    if (!fs.existsSync(reportsDir)) {
      return NextResponse.json([]);
    }

    // Read all JSON files in the directory
    const files = fs.readdirSync(reportsDir);
    const jsonFiles = files
      .filter(
        (file) => file.endsWith(".json") && file.startsWith("function_report_"),
      )
      .sort()
      .reverse(); // Most recent first

    return NextResponse.json(jsonFiles);
  } catch (error) {
    console.error("Error reading reports directory:", error);
    return NextResponse.json(
      { error: "Failed to read reports directory" },
      { status: 500 },
    );
  }
}
