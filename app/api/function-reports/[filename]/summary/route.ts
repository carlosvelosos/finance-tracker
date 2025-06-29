import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;

    // Validate filename to prevent directory traversal
    if (!filename || filename.includes("..")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const reportsDir = path.join(process.cwd(), "scan-functions-reports");

    // Only handle directory-based format
    if (!filename.startsWith("scan-functions-report-")) {
      return NextResponse.json(
        { error: "Invalid directory format" },
        { status: 400 },
      );
    }

    const dirPath = path.join(reportsDir, filename);

    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      return NextResponse.json(
        { error: "Directory not found" },
        { status: 404 },
      );
    }

    // Read the _SUMMARY.json file
    const summaryPath = path.join(dirPath, "_SUMMARY.json");
    if (!fs.existsSync(summaryPath)) {
      return NextResponse.json(
        { error: "Summary file not found" },
        { status: 404 },
      );
    }

    const summaryContent = fs.readFileSync(summaryPath, "utf-8");
    const summaryData = JSON.parse(summaryContent);

    // Get all JSON files in the directory (excluding _SUMMARY.json)
    const files = fs.readdirSync(dirPath);
    const jsonFiles = files
      .filter((file) => file.endsWith(".json") && file !== "_SUMMARY.json")
      .sort();

    return NextResponse.json({
      summary: summaryData,
      jsonFiles: jsonFiles,
    });
  } catch (error) {
    console.error("Error reading directory summary:", error);
    return NextResponse.json(
      { error: "Failed to read directory summary" },
      { status: 500 },
    );
  }
}
