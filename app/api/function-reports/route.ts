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

    // Read all directories and JSON files in the directory
    const items = fs.readdirSync(reportsDir, { withFileTypes: true });

    // Get both directories (new format) and JSON files (old format)
    const directories = items
      .filter(
        (item) =>
          item.isDirectory() && item.name.startsWith("scan-functions-report-"),
      )
      .map((item) => ({
        name: item.name,
        type: "directory",
        isNew: true,
      }));

    const jsonFiles = items
      .filter(
        (item) =>
          item.isFile() &&
          item.name.endsWith(".json") &&
          item.name.startsWith("function_report_"),
      )
      .map((item) => ({
        name: item.name,
        type: "file",
        isNew: false,
      }));

    // Combine and sort by date (newest first)
    const allReports = [...directories, ...jsonFiles].sort((a, b) => {
      // Extract timestamp from name for sorting
      const getTimestamp = (name: string) => {
        const match = name.match(/(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/);
        return match ? match[1] : "0000-00-00_00-00-00";
      };

      return getTimestamp(b.name).localeCompare(getTimestamp(a.name));
    });

    return NextResponse.json(allReports);
  } catch (error) {
    console.error("Error reading reports directory:", error);
    return NextResponse.json(
      { error: "Failed to read reports directory" },
      { status: 500 },
    );
  }
}
