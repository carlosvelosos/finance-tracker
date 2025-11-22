import assert from "assert";
import path from "path";
import fs from "fs/promises";

import {
  batchSaveFullEmails,
  batchDeleteFullEmails,
  fullEmailExists,
  getFullEmailRelativePath,
  getFullEmailPath,
} from "../lib/utils/emailStorage";

import { POST as writeRoute } from "../app/api/smart-fetch/write/route";

async function run() {
  console.log("Starting smart-fetch repeat test...");

  const ts = Date.now();
  const month = new Date().toISOString().slice(0, 7); // e.g. 2025-11

  // Pick two days in the same month for the test
  const dayA = "15";
  const dayB = "20";

  const dateA = `${month}-${dayA.padStart(2, "0")}`;
  const dateB = `${month}-${dayB.padStart(2, "0")}`;

  const emailAId = `test-a-${ts}`;
  const emailBId = `test-b-${ts}`;

  const emailA = {
    id: emailAId,
    snippet: "Test email A",
    payload: {
      headers: [
        { name: "Date", value: new Date(`${dateA}T12:00:00Z`).toISOString() },
      ],
    },
  } as any;

  const emailB = {
    id: emailBId,
    snippet: "Test email B",
    payload: {
      headers: [
        { name: "Date", value: new Date(`${dateB}T12:00:00Z`).toISOString() },
      ],
    },
  } as any;

  // Helper to extract date (same shape as server uses)
  const getEmailDate = (e: any) => {
    if (e.date) return e.date.split("T")[0];
    if (e.payload?.headers) {
      const h = e.payload.headers.find(
        (x: any) => x.name.toLowerCase() === "date",
      );
      if (h?.value) return new Date(h.value).toISOString().split("T")[0];
    }
    return null;
  };

  try {
    // --- First run: save full email A and write index referencing it ---
    console.log("Saving full email A...");
    const resA = await batchSaveFullEmails([emailA], getEmailDate);
    assert.strictEqual(
      resA.errors.length,
      0,
      `Errors saving A: ${resA.errors.join(", ")}`,
    );

    // Compute base email dir from saved path
    const fullPathA = getFullEmailPath(emailA.id, dateA);
    const emailBase = path.join(fullPathA, "..", "..", "..", "..");
    const emailBaseResolved = path.resolve(emailBase);

    // Build index data with only email A
    const indexPath = path.join(
      emailBaseResolved,
      `gmail-export-${month}.json`,
    );
    const fileDataA = {
      dateRange: { start: `${month}-01`, end: `${month}-31` },
      totalEmails: 1,
      version: "2.0",
      emails: [
        {
          id: emailA.id,
          snippet: emailA.snippet,
          date: dateA,
          headers: emailA.payload.headers,
          fullDataPath: getFullEmailRelativePath(emailA.id, dateA),
        },
      ],
      exportDate: new Date().toISOString(),
      fetchedBy: "test",
      lastUpdated: new Date().toISOString(),
    } as any;

    await fs.mkdir(path.dirname(indexPath), { recursive: true });
    await fs.writeFile(indexPath, JSON.stringify(fileDataA, null, 2), "utf-8");

    const existsA = await fullEmailExists(emailA.id, dateA);
    assert.ok(existsA, "Full email A should exist after first save");

    console.log("First run complete: full email A saved and index written.");

    // --- Second run: simulate smart-fetch adding email B and writing merged index via server write route ---
    console.log("Running server write route for second run (adds B)...");

    // Prepare merged data (existing A metadata + new B metadata)
    const mergedData = {
      ...fileDataA,
      totalEmails: 2,
      emails: [
        ...fileDataA.emails,
        {
          id: emailB.id,
          snippet: emailB.snippet,
          date: dateB,
          headers: emailB.payload.headers,
          fullDataPath: getFullEmailRelativePath(emailB.id, dateB),
        },
      ],
    };

    // Call server write route with only fullEmails = [emailB]
    const mockReq = {
      json: async () => ({
        month,
        data: mergedData,
        fullEmails: [emailB],
        saveFullData: true,
      }),
    } as any;

    const resp = await writeRoute(mockReq);
    // resp is NextResponse but we don't need to inspect it deeply here
    console.log("Server write route finished for second run.");

    // After server write, both full files should exist
    const existsA2 = await fullEmailExists(emailA.id, dateA);
    const existsB = await fullEmailExists(emailB.id, dateB);

    assert.ok(existsA2, "Full email A should remain after second run");
    assert.ok(existsB, "Full email B should exist after second run");

    console.log(
      "Assertion passed: both A and B full data files exist after repeated runs.",
    );

    // Cleanup: remove created full files and index
    console.log("Cleaning up test artifacts...");
    await batchDeleteFullEmails([
      { id: emailA.id, date: dateA },
      { id: emailB.id, date: dateB },
    ]);

    // Remove index file
    try {
      await fs.unlink(indexPath);
      console.log("Removed index file");
    } catch (err) {
      console.warn("Failed to remove index file:", err);
    }

    console.log("Test completed successfully.");
  } catch (err) {
    console.error("Test failed:", err);
    process.exitCode = 1;
  }
}

// Run when executed directly
if (require.main === module) {
  run();
}

export default run;
