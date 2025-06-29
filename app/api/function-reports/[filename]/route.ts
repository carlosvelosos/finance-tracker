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

    // Check if it's a directory (new format) or a JSON file (old format)
    if (filename.startsWith("scan-functions-report-")) {
      // New directory-based format
      const dirPath = path.join(reportsDir, filename);

      if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
        return NextResponse.json(
          { error: "Directory not found" },
          { status: 404 },
        );
      }

      // Read all JSON files in the directory (except _SUMMARY.json)
      const files = fs.readdirSync(dirPath);
      const jsonFiles = files.filter(
        (file) => file.endsWith(".json") && file !== "_SUMMARY.json",
      );

      const reportData: Record<string, any> = {};

      // Load each JSON file and extract the analysis data
      for (const jsonFile of jsonFiles) {
        try {
          const filePath = path.join(dirPath, jsonFile);
          const fileContent = fs.readFileSync(filePath, "utf-8");
          const jsonData = JSON.parse(fileContent);

          // Extract original file path from metadata
          const originalFilePath =
            jsonData.metadata?.originalFilePath ||
            jsonFile.replace(".json", "");

          // Store the analysis data using the original file path as key
          reportData[originalFilePath] = jsonData.analysis;
        } catch (error) {
          console.error(`Error reading file ${jsonFile}:`, error);
          // Continue with other files even if one fails
        }
      }

      return NextResponse.json(reportData);
    } else if (filename.endsWith(".json")) {
      // Old single JSON file format
      const filePath = path.join(reportsDir, filename);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      const fileContent = fs.readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);

      return NextResponse.json(jsonData);
    } else {
      return NextResponse.json(
        { error: "Invalid filename format" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error reading report:", error);
    return NextResponse.json(
      { error: "Failed to read report" },
      { status: 500 },
    );
  }
}
