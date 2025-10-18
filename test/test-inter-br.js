import { processInterBRAccount } from "../lib/utils/bankProcessors.js";
import Papa from "papaparse";
import fs from "fs";

// Read the CSV file
const csvContent = fs.readFileSync(
  "./privat/data/bank/InterBRAccount/Extrato-01-01-2024-a-31-12-2024.csv",
  "utf8",
);

// Parse with semicolon delimiter
const parsed = Papa.parse(csvContent, {
  header: false,
  skipEmptyLines: true,
  delimiter: ";",
});

console.log("First 5 rows of parsed data:");
console.log(parsed.data.slice(0, 5));

// Process with the Inter BR Account processor
try {
  const result = processInterBRAccount(
    parsed.data,
    "Extrato-01-01-2024-a-31-12-2024.csv",
  );
  console.log("\nTable name:", result.tableName);
  console.log("Number of transactions:", result.transactions.length);
  console.log("First transaction:", result.transactions[0]);
} catch (error) {
  console.error("Error processing:", error);
}
