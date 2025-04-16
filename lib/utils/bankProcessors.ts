export function processDEV(data: string[][]) {
    const transactions = data.slice(1).map((row, index) => {
      // Extract and clean the amount (Valor column)
      const rawAmount = row[4];
      console.log(`Raw Amount (before processing): "${rawAmount}"`);
  
      const cleanedAmount = rawAmount
        ?.replace(/"/g, "") // Remove quotation marks
        .replace("R$", "") // Remove "R$" prefix
        .replace(/\./g, "") // Remove all dots (thousands separators)
        .replace(",", ".") // Replace the comma with a dot for decimals
        .trim(); // Remove any extra spaces
  
      console.log(`Cleaned Amount (after processing): "${cleanedAmount}"`);
  
      const amount = parseFloat(cleanedAmount) || 0; // Convert to float, default to 0 if invalid
      console.log(`Final Amount (parsed): ${amount}`);
  
      // Convert the date from DD/MM/YYYY to YYYY-MM-DD
      const rawDate = row[0]?.trim().replace(/"/g, "") || null; // Remove quotes
      const formattedDate = rawDate
        ? rawDate.split("/").reverse().join("-") // Convert DD/MM/YYYY to YYYY-MM-DD
        : null;
  
      // Clean the description and comment fields
      const description = row[1]?.trim().replace(/"/g, "") || ""; // Remove quotes
      const comment = row[3]?.trim().replace(/"/g, "") || ""; // Remove quotes
  
      return {
        id: index + 1, // Sequential ID
        Date: formattedDate, // Formatted date
        Description: description, // Cleaned description
        Comment: comment, // Cleaned comment
        Amount: amount, // Parsed amount
      };
    });
  
    const tableName = "DEV"; // Define the table name
    return { tableName, transactions };
  }

export function processInterBR(data: string[][]) {
    const transactions = data.slice(1).map((row) => ({
      transaction_date: row[0],
      description: row[1],
      amount: parseFloat(row[2]),
      currency: row[3],
    }));
    const tableName = 'Test';
    return { tableName, transactions };
  }
  
  export function processHandelsbanken(data: string[][]) {
    // Extract the year from row 6: "Period: 2025-01-01 - 2025-03-24"
    const periodRow = data[6]?.[0] || "";
    const yearMatch = periodRow.match(/(\d{4})-/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear(); // Default to current year if missing
  
    // Determine table name
    const tableName = `HB_${year}`;
  
    // Start processing transactions (row 9 onwards)
    const transactions = data.slice(9) // Skip metadata rows
      .filter(row => row.length >= 5) // Ensure row has enough columns
      .map((row, index) => ({
        id: index + 1, // Sequential ID
        Date: row[1], // Transaktionsdatum -> Date
        Description: row[2], // Text -> Description
        Amount: parseFloat(String(row[3]).replace(",", ".")), // Belopp -> Amount (convert to float)
        Balance: parseFloat(String(row[4]).replace(",", ".")), // Saldo -> Balance (convert to float)
      }));
  
    if (transactions.length === 0) {
      throw new Error("No transactions found in the file.");
    }
  
    return { tableName, transactions };
  }
  
  export function processAmex(data: string[][], fileName: string) {
    // Extract table name from filename (e.g., "AM_202503.csv" -> "AM_202503")
    const tableName = fileName.replace(".csv", "");
  
    // Map data to match the required structure
    const transactions = data.slice(1) // Skip header row
      .filter(row => row.length >= 3) // Ensure at least 3 columns
      .map((row, index) => {
        let rawAmount = "";
  
        // Use the final two columns for the amount, merging them with a dot separator
        if (row.length >= 2) {
          rawAmount = `${row[row.length - 2]}.${row[row.length - 1]}`; // Insert "." between the last two columns
        } else {
          rawAmount = String(row[2] || "").trim();
        }
  
        // Remove unwanted characters (quotes, spaces)
        let cleanAmount = rawAmount.replace(/[^0-9.-]/g, ""); 
  
        // Convert to a floating-point number
        let finalAmount = parseFloat(cleanAmount);
  
        console.log(`Row ${index + 1} - Raw: "${rawAmount}", Clean: "${cleanAmount}", Final: ${finalAmount}`);
  
        return {
          id: index + 1, // Sequential ID
          Date: row[0], // Datum -> Date
          Description: row[1].trim(), // Beskrivning -> Trimmed Description
          Amount: finalAmount, // Convert to float
        };
      });
  
    if (transactions.length === 0) {
      throw new Error("No transactions found in the file.");
    }
  
    console.log("Table Name:", tableName);
    console.log("Transactions:", transactions);
  
    return { tableName, transactions };
  }
  
  
  
  export function processSEB(data: string[][], fileName: string) {
    // Extract the table name from the file name (e.g., "SEB_202503.csv" -> "SEB_202503")
    const tableName = fileName.replace(".xls", "");
  
    // Extract the year from row 3 (e.g., "Månad:", <3 empty slots>, "Februari 2025")
    const yearRow = data[3]?.[4] || ""; // The year is in the last column of row 3
    const yearMatch = yearRow.match(/\d{4}/); // Match the 4-digit year
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear(); // Default to current year if missing
  
    // Helper function to convert Excel serial dates to YYYY-MM-DD
    const excelToDate = (serial: number): string => {
      const startDate = new Date(1900, 0, 1); // January 1, 1900
      const excelDate = new Date(startDate.setDate(startDate.getDate() + serial - 2)); // Adjust for the 1900 leap year bug
      return excelDate.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format
    };
  
    // Start processing transactions from row 17 (index 16 is the header)
    const transactions = data.slice(17) // Skip metadata and header rows
      .filter(row => row.length >= 7) // Ensure the row has enough columns
      .map((row, index) => {
        // Handle the Datum column (Excel serial date or MM-DD format)
        let formattedDate: string | null = null;
        if (!isNaN(row[0])) {
          // If Datum is an Excel serial date
          formattedDate = excelToDate(Number(row[0]));
        } else if (typeof row[0] === "string") {
          // If Datum is in MM-DD format
          const [month, day] = row[0].split("-");
          formattedDate = month && day ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` : null;
        }
  
        // Handle the Bokfört column (Excel serial date or MM-DD format)
        let formattedBookedDate: string | null = null;
        if (!isNaN(row[1])) {
          // If Bokfört is an Excel serial date
          formattedBookedDate = excelToDate(Number(row[1]));
        } else if (typeof row[1] === "string") {
          // If Bokfört is in MM-DD format
          const [bookedMonth, bookedDay] = row[1].split("-");
          formattedBookedDate = bookedMonth && bookedDay
            ? `${year}-${bookedMonth.padStart(2, "0")}-${bookedDay.padStart(2, "0")}`
            : null;
        }
  
        // Parse the Belopp column (convert to float)
        const rawAmount = row[6] ? String(row[6]).replace(",", ".").trim() : "0"; // Replace commas with dots
        const amount = parseFloat(rawAmount) || 0; // Convert to float, default to 0 if invalid
  
        return {
          id: index + 1, // Sequential ID
          Date: formattedDate ? new Date(new Date(formattedDate).setDate(new Date(formattedDate).getDate() + 1)).toISOString().split("T")[0] : null, // Formatted Datum column with 1 day added
          Description: row[2]?.trim() || "", // Specifikation column
          Amount: amount, // Belopp column
        };
      });
  
    if (transactions.length === 0) {
      throw new Error("No transactions found in the file.");
    }
  
    console.log("Table Name:", tableName);
    console.log("Transactions:", transactions);
  
    return { tableName, transactions };
  }
  