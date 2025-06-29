import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string; jsonfile: string }> },
) {
  try {
    const { filename, jsonfile } = await params;

    // Validate filenames to prevent directory traversal
    if (
      !filename ||
      filename.includes("..") ||
      !jsonfile ||
      jsonfile.includes("..")
    ) {
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

    // Construct the JSON file path
    const jsonFileName = jsonfile.endsWith(".json")
      ? jsonfile
      : `${jsonfile}.json`;
    const jsonFilePath = path.join(dirPath, jsonFileName);

    if (!fs.existsSync(jsonFilePath)) {
      return NextResponse.json(
        { error: "JSON file not found" },
        { status: 404 },
      );
    }

    // Read and return the JSON file content
    const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
    const jsonData = JSON.parse(fileContent);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    return NextResponse.json(
      { error: "Failed to read JSON file" },
      { status: 500 },
    );
  }
}
