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

export function processInterBRMastercard(data: string[][], fileName: string) {
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
    const comment = `Outcome - ${row[3]?.trim().replace(/"/g, "") || ""}`; // Add "Outcome - " prefix to the comment

    return {
      id: index + 1, // Sequential ID
      Date: formattedDate, // Formatted date
      Description: description, // Cleaned description
      Comment: comment, // Cleaned comment
      Amount: amount, // Parsed amount
    };
  });

  // Extract the year and month from the file name
  const match = fileName.match(/fatura-inter-(\d{4})-(\d{2})\.csv/i);
  if (!match) {
    throw new Error(
      "Invalid file name format. Expected format: fatura-inter-YYYY-MM.csv",
    );
  }

  const year = match[1]; // Extracted year (e.g., "2025")
  const month = match[2]; // Extracted month (e.g., "01")

  // Construct the table name in the format INMC_YYYYMM
  const tableName = `INMC_${year}${month}`;

  return { tableName, transactions };
}

export function processInterBRMastercardPDF(
  data: string[][],
  fileName: string,
) {
  // Helper function to parse Portuguese dates
  const parsePortugueseDate = (dateStr: string): string | null => {
    if (!dateStr || dateStr.trim() === "") return null;

    // Mapping Portuguese months to numbers
    const monthMap: { [key: string]: string } = {
      jan: "01",
      janeiro: "01",
      fev: "02",
      fevereiro: "02",
      mar: "03",
      março: "03",
      abr: "04",
      abril: "04",
      mai: "05",
      maio: "05",
      jun: "06",
      junho: "06",
      jul: "07",
      julho: "07",
      ago: "08",
      agosto: "08",
      set: "09",
      setembro: "09",
      out: "10",
      outubro: "10",
      nov: "11",
      novembro: "11",
      dez: "12",
      dezembro: "12",
    };

    // Parse format like "11 de dez. 2024"
    const match = dateStr.match(/(\d{1,2})\s+de\s+(\w+)\.?\s+(\d{4})/);
    if (match) {
      const day = match[1].padStart(2, "0");
      const monthStr = match[2].toLowerCase();
      const year = match[3];
      const month = monthMap[monthStr];

      if (month) {
        return `${year}-${month}-${day}`;
      }
    }

    return null;
  };

  const transactions: Array<{
    id: number;
    Date: string | null;
    Description: string;
    Comment: string;
    Amount: number;
    Balance: number | null;
  }> = [];

  let transactionId = 1;

  // Process each row, skipping headers and total rows
  data.slice(1).forEach((row) => {
    // Skip empty rows
    if (!row || row.length === 0 || !row[0]) return;

    const rawDate = row[0]?.trim().replace(/"/g, "") || "";
    const movimentacao = row[1]?.trim().replace(/"/g, "") || "";
    const beneficiario = row[2]?.trim().replace(/"/g, "") || "";
    const rawAmount = row[3]?.trim().replace(/"/g, "") || "";

    // Skip rows that are totals (like "Total CARTÃO 53614414")
    if (
      rawDate.toLowerCase().includes("total") ||
      movimentacao.toLowerCase().includes("total")
    ) {
      return;
    }

    // Skip rows without valid dates
    const formattedDate = parsePortugueseDate(rawDate);
    if (!formattedDate) return;

    // Parse amount
    let cleanedAmount = rawAmount;
    let amount = 0;

    if (cleanedAmount) {
      // Remove + or - signs and R$ prefix
      const isPositive = cleanedAmount.includes("+");
      cleanedAmount = cleanedAmount
        .replace(/[+\-]/g, "") // Remove + and - signs
        .replace("R$", "") // Remove R$ prefix
        .replace(/\s/g, "") // Remove spaces
        .replace(/\./g, "") // Remove dots (thousands separators)
        .replace(",", "."); // Replace comma with dot for decimals

      amount = parseFloat(cleanedAmount) || 0;

      // Apply sign - in the PDF, credits are shown with +, but they should be positive
      // debits are shown without sign and should be negative
      if (!isPositive && amount > 0) {
        amount = -amount; // Make it negative if it's a debit
      }
    }

    // Create transaction record
    transactions.push({
      id: transactionId++,
      Date: formattedDate,
      Description: movimentacao || "Unknown Transaction",
      Comment: beneficiario ? `Beneficiary: ${beneficiario}` : "",
      Amount: amount,
      Balance: null, // PDF statements don't include balance information
    });
  });

  // Extract the year and month from the file name
  const match = fileName.match(/fatura-inter-(\d{4})-(\d{2})_fromPDF\.csv/i);
  if (!match) {
    throw new Error(
      "Invalid file name format. Expected format: fatura-inter-YYYY-MM_fromPDF.csv",
    );
  }

  const year = match[1]; // Extracted year (e.g., "2025")
  const month = match[2]; // Extracted month (e.g., "01")

  // Construct the table name in the format INMCPDF_YYYYMM
  const tableName = `INMCPDF_${year}${month}`;

  console.log(
    `Processed ${transactions.length} transactions from PDF for table ${tableName}`,
  );
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
  const transactions = data
    .slice(9) // Skip metadata rows
    .filter((row) => row.length >= 5) // Ensure row has enough columns
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
  const transactions = data
    .slice(1) // Skip header row
    .filter((row) => row.length >= 3) // Ensure at least 3 columns
    .map((row, index) => {
      // Parse date (converting from MM/DD/YYYY to YYYY-MM-DD)
      const rawDate = row[0]?.trim() || "";
      let formattedDate = null;
      if (rawDate) {
        const dateParts = rawDate.split("/");
        if (dateParts.length === 3) {
          // Convert from MM/DD/YYYY to YYYY-MM-DD
          formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`;
        }
      }

      // Clean description
      const description = row[1]?.trim().replace(/"/g, "") || "";

      // Extract and clean the amount (Belopp column)
      const rawAmount = row[2]?.trim().replace(/"/g, "") || "0";
      console.log(`Row ${index + 1} - Raw Amount: "${rawAmount}"`);

      // Clean amount - handle European format with comma as decimal separator
      const cleanedAmount = rawAmount
        .replace(/\s/g, "") // Remove spaces
        .replace(/\./g, "") // Remove thousand separators (dots)
        .replace(",", "."); // Replace comma with dot for decimal point

      console.log(`Row ${index + 1} - Cleaned Amount: "${cleanedAmount}"`);

      // Parse as float
      const amount = parseFloat(cleanedAmount) || 0;
      console.log(`Row ${index + 1} - Final Amount: ${amount}`);

      return {
        id: index + 1, // Sequential ID
        Date: formattedDate, // Formatted date in YYYY-MM-DD
        Description: description, // Cleaned description
        Amount: amount, // Parsed amount
        // Additional fields from the new format can be added here if needed
        // Comment: row[3]?.trim() || row[4]?.trim() || null // Using "Utökade specifikationer" or "Visas på ditt kontoutdrag som" as comment
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
    const excelDate = new Date(
      startDate.setDate(startDate.getDate() + serial - 2),
    ); // Adjust for the 1900 leap year bug
    return excelDate.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format
  };

  // Start processing transactions from row 17 (index 16 is the header)
  const transactions = data
    .slice(17) // Skip metadata and header rows
    .filter((row) => row.length >= 7) // Ensure the row has enough columns
    .map((row, index) => {
      // Handle the Datum column (Excel serial date or MM-DD format)
      let formattedDate: string | null = null;
      if (!isNaN(Number(row[0]))) {
        // If Datum is an Excel serial date
        formattedDate = excelToDate(Number(row[0]));
      } else if (typeof row[0] === "string") {
        // If Datum is in MM-DD format
        const [month, day] = row[0].split("-");
        formattedDate =
          month && day
            ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
            : null;
      }

      // // Handle the Bokfört column (Excel serial date or MM-DD format)
      // let formattedBookedDate: string | null = null;
      // if (!isNaN(row[1])) {
      //   // If Bokfört is an Excel serial date
      //   formattedBookedDate = excelToDate(Number(row[1]));
      // } else if (typeof row[1] === "string") {
      //   // If Bokfört is in MM-DD format
      //   const [bookedMonth, bookedDay] = row[1].split("-");
      //   formattedBookedDate = bookedMonth && bookedDay
      //     ? `${year}-${bookedMonth.padStart(2, "0")}-${bookedDay.padStart(2, "0")}`
      //     : null;
      // }

      // Parse the Belopp column (convert to float)
      const rawAmount = row[6] ? String(row[6]).replace(",", ".").trim() : "0"; // Replace commas with dots
      const amount = parseFloat(rawAmount) || 0; // Convert to float, default to 0 if invalid

      return {
        id: index + 1, // Sequential ID
        Date: formattedDate
          ? new Date(
              new Date(formattedDate).setDate(
                new Date(formattedDate).getDate() + 1,
              ),
            )
              .toISOString()
              .split("T")[0]
          : null, // Formatted Datum column with 1 day added
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

export function processInterBRAccount(data: string[][], fileName: string) {
  // Find the header row that contains "Data Lançamento;Descrição;Valor;Saldo"
  let headerRowIndex = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row.length > 0 && row[0].includes("Data Lançamento")) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error("Header row with 'Data Lançamento' not found in the file.");
  }

  // Start processing transactions from the row after the header
  const transactions = data
    .slice(headerRowIndex + 1)
    .filter((row) => row.length >= 4 && row[0].trim()) // Ensure row has enough columns and a date
    .map((row, index) => {
      // Parse the date from DD/MM/YYYY to YYYY-MM-DD
      const rawDate = row[0]?.trim() || "";
      let formattedDate: string | null = null;
      if (rawDate) {
        const dateParts = rawDate.split("/");
        if (dateParts.length === 3) {
          // Convert from DD/MM/YYYY to YYYY-MM-DD
          formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, "0")}-${dateParts[0].padStart(2, "0")}`;
        }
      }

      // Clean the description
      const description = row[1]?.trim().replace(/"/g, "") || "";

      // Extract and clean the amount (Valor column) - Brazilian format with comma as decimal separator
      const rawAmount = row[2]?.trim() || "0";
      console.log(`Row ${index + 1} - Raw Amount: "${rawAmount}"`);

      // Clean amount - handle Brazilian format with comma as decimal separator and dots as thousand separators
      const cleanedAmount = rawAmount
        .replace(/"/g, "") // Remove quotation marks
        .replace(/\./g, "") // Remove thousand separators (dots)
        .replace(",", ".") // Replace comma with dot for decimal point
        .trim();

      console.log(`Row ${index + 1} - Cleaned Amount: "${cleanedAmount}"`);

      const amount = parseFloat(cleanedAmount) || 0;
      console.log(`Row ${index + 1} - Final Amount: ${amount}`);

      // Extract and clean the balance (Saldo column)
      const rawBalance = row[3]?.trim() || "0";
      const cleanedBalance = rawBalance
        .replace(/"/g, "") // Remove quotation marks
        .replace(/\./g, "") // Remove thousand separators (dots)
        .replace(",", ".") // Replace comma with dot for decimal point
        .trim();

      const balance = parseFloat(cleanedBalance) || 0;

      return {
        id: index + 1, // Sequential ID
        Date: formattedDate, // Formatted date in YYYY-MM-DD
        Description: description, // Cleaned description
        Amount: amount, // Parsed amount
        Balance: balance, // Parsed balance
        Bank: "Inter-BR", // Set bank name
        Comment: null, // No comment field in this format
      };
    });

  if (transactions.length === 0) {
    throw new Error("No transactions found in the file.");
  }

  // Extract year from the first transaction date or filename
  let year = new Date().getFullYear().toString(); // Default to current year
  if (transactions.length > 0 && transactions[0].Date) {
    year = transactions[0].Date.split("-")[0];
  } else {
    // Try to extract year from filename if available
    const yearMatch = fileName.match(/(\d{4})/);
    if (yearMatch) {
      year = yearMatch[1];
    }
  }

  // Construct the table name in the format IN_YYYY
  const tableName = `IN_${year}`;

  console.log("Table Name:", tableName);
  console.log("Transactions:", transactions);

  return { tableName, transactions };
}
