/**
 * API Route: Full Email Data Operations
 * GET /api/smart-fetch/full-data - Fetch single email's full data
 * POST /api/smart-fetch/full-data - Batch fetch full data
 * DELETE /api/smart-fetch/full-data - Delete full data for email
 */

import { NextRequest, NextResponse } from "next/server";
import {
  loadFullEmail,
  deleteFullEmail,
  fullEmailExists,
} from "@/lib/utils/emailStorage";

/**
 * GET - Fetch full email data for a single email
 * Query params: emailId, date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailId = searchParams.get("emailId");
    const date = searchParams.get("date");

    if (!emailId || !date) {
      return NextResponse.json(
        { error: "Missing required parameters: emailId and date" },
        { status: 400 },
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD" },
        { status: 400 },
      );
    }

    // Load full email data
    const fullEmail = await loadFullEmail(emailId, date);

    if (!fullEmail) {
      return NextResponse.json(
        { error: "Email not found", emailId, date },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      email: fullEmail,
    });
  } catch (error) {
    console.error("[API] Error fetching full email:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch full email data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Batch check existence of full email data
 * Body: { emails: [{ id, date }, ...] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        {
          error:
            "Invalid request body. Expected { emails: [{ id, date }, ...] }",
        },
        { status: 400 },
      );
    }

    // Check existence for each email
    const results = await Promise.all(
      emails.map(async ({ id, date }: { id: string; date: string }) => {
        try {
          const exists = await fullEmailExists(id, date);
          return { id, date, exists, error: null };
        } catch (error) {
          return {
            id,
            date,
            exists: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    const summary = {
      total: results.length,
      available: results.filter((r) => r.exists).length,
      missing: results.filter((r) => !r.exists).length,
    };

    return NextResponse.json({
      success: true,
      summary,
      results,
    });
  } catch (error) {
    console.error("[API] Error in batch check:", error);
    return NextResponse.json(
      {
        error: "Failed to check email data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Delete full email data
 * Query params: emailId, date (YYYY-MM-DD)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailId = searchParams.get("emailId");
    const date = searchParams.get("date");

    if (!emailId || !date) {
      return NextResponse.json(
        { error: "Missing required parameters: emailId and date" },
        { status: 400 },
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD" },
        { status: 400 },
      );
    }

    // Check if file exists first
    const exists = await fullEmailExists(emailId, date);

    // Delete full email data
    const deleted = await deleteFullEmail(emailId, date);

    if (!deleted) {
      // Log more detail about why deletion failed
      console.log(
        `[API Delete] Email ${emailId} (${date}) not found - likely never had full data stored`,
      );
      return NextResponse.json(
        {
          error: "Email full data not found",
          emailId,
          date,
          reason: exists
            ? "File exists but deletion failed"
            : "Full data was never stored for this email",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Full email data deleted",
      emailId,
      date,
    });
  } catch (error) {
    console.error("[API] Error deleting full email:", error);
    return NextResponse.json(
      {
        error: "Failed to delete full email data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
