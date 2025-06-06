const fs = require("fs");
const path = require("path");

try {
  console.log("Starting Gmail export merge process...");

  // Define file paths
  const file1Path = path.join(
    __dirname,
    "public/data/email/gmail-export-2025-01-01-to-2025-05-31.json",
  );
  const file2Path = path.join(
    __dirname,
    "public/data/email/gmail-export-2025-05-31-to-2025-06-06.json",
  );
  const outputPath = path.join(
    __dirname,
    "public/data/email/gmail-export-merged-2025-01-01-to-2025-06-06.json",
  );

  console.log("Reading file 1...");
  const file1 = JSON.parse(fs.readFileSync(file1Path, "utf8"));

  console.log("Reading file 2...");
  const file2 = JSON.parse(fs.readFileSync(file2Path, "utf8"));

  console.log("File 1 loaded:", file1.emails?.length || 0, "emails");
  console.log("File 2 loaded:", file2.emails?.length || 0, "emails");

  // Create the merged data structure
  const merged = {
    dateRange: {
      start: file1.dateRange.start,
      end: file2.dateRange.end,
    },
    totalEmails: 0,
    weeklyBreakdown: [
      ...(file1.weeklyBreakdown || []),
      ...(file2.weeklyBreakdown || []),
    ],
    emails: [],
    exportDate: new Date().toISOString(),
    fetchedBy: file1.fetchedBy || file2.fetchedBy,
  };

  // Create a Set to track email IDs we've already added
  const seenIds = new Set();
  let duplicatesSkipped = 0;

  console.log("Processing emails from file 1...");
  // Add emails from file1
  for (const email of file1.emails || []) {
    if (email.id) {
      if (!seenIds.has(email.id)) {
        seenIds.add(email.id);
        merged.emails.push(email);
      }
    } else {
      // Add emails without IDs (can't deduplicate these reliably)
      merged.emails.push(email);
    }
  }

  console.log("Processing emails from file 2...");
  // Add emails from file2, skipping duplicates
  for (const email of file2.emails || []) {
    if (email.id) {
      if (!seenIds.has(email.id)) {
        seenIds.add(email.id);
        merged.emails.push(email);
      } else {
        duplicatesSkipped++;
        console.log("Skipping duplicate email ID:", email.id);
      }
    } else {
      // Add emails without IDs
      merged.emails.push(email);
    }
  }

  merged.totalEmails = merged.emails.length;

  console.log("\n=== MERGE COMPLETE ===");
  console.log("Original file 1 emails:", file1.emails?.length || 0);
  console.log("Original file 2 emails:", file2.emails?.length || 0);
  console.log("Duplicates removed:", duplicatesSkipped);
  console.log("Final merged emails:", merged.totalEmails);
  console.log(
    "Date range:",
    merged.dateRange.start,
    "to",
    merged.dateRange.end,
  );
  console.log("Weekly breakdown periods:", merged.weeklyBreakdown.length);

  // Write the merged file
  console.log("\nWriting merged file...");
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  console.log("SUCCESS! Merged file saved as:", outputPath);
} catch (error) {
  console.error("ERROR:", error.message);
  if (error.code === "ENOENT") {
    console.error("File not found. Please check that the input files exist.");
  }
  console.error("Stack trace:", error.stack);
  process.exit(1);
}
