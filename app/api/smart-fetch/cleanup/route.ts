import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const BASE_PATH = path.join(process.cwd(), "privat", "data", "email");

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("file");

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: "File path is required" },
        { status: 400 },
      );
    }

    // Security: Ensure the file path is within BASE_PATH
    const fullPath = path.join(BASE_PATH, filePath);
    const normalizedPath = path.normalize(fullPath);

    if (!normalizedPath.startsWith(BASE_PATH)) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 403 },
      );
    }

    // Delete the file
    await fs.unlink(normalizedPath);

    return NextResponse.json({
      success: true,
      message: `Deleted ${filePath}`,
    });
  } catch (error) {
    console.error("Error deleting orphaned file:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Batch delete orphaned files
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files } = body;

    if (!Array.isArray(files)) {
      return NextResponse.json(
        { success: false, error: "Files array is required" },
        { status: 400 },
      );
    }

    const deleted: string[] = [];
    const errors: { file: string; error: string }[] = [];

    for (const filePath of files) {
      try {
        // Security: Ensure the file path is within BASE_PATH
        const fullPath = path.join(BASE_PATH, filePath);
        const normalizedPath = path.normalize(fullPath);

        if (!normalizedPath.startsWith(BASE_PATH)) {
          errors.push({ file: filePath, error: "Invalid file path" });
          continue;
        }

        await fs.unlink(normalizedPath);
        deleted.push(filePath);
      } catch (error) {
        errors.push({
          file: filePath,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deleted.length,
      errors: errors.length,
      deletedFiles: deleted,
      errorDetails: errors,
    });
  } catch (error) {
    console.error("Error in batch delete:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
