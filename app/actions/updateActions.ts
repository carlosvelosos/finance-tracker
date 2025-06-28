import { supabase } from "@/lib/supabaseClient";
import { Transaction } from "@/types/transaction";

export interface TransactionDiff {
  id?: number;
  amount: number;
  date: string;
  description: string;
  category?: string;
  isNew: boolean;
}

export interface UpdatePreview {
  newTransactions: TransactionDiff[];
  summary: {
    totalNew: number;
    totalAmount: number;
    dateRange: {
      from: string;
      to: string;
    };
  };
}

export interface UpdateResult {
  success: boolean;
  insertedCount?: number;
  error?: string;
}

export async function getUpdatePreview(): Promise<UpdatePreview> {
  try {
    // Get the highest ID from Sweden_transactions_agregated_2025
    const { data: maxIdData, error: maxIdError } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    if (maxIdError) throw maxIdError;

    const maxId = maxIdData?.[0]?.id || 0; // Get transactions from HB_2025 that don't exist in aggregated table
    const { data: hbTransactions, error: hbError } = await supabase
      .from("HB_2025")
      .select('"Amount", "Date", "Description", "Category"')
      .order('"Date"', { ascending: true });

    if (hbError) throw hbError;

    const { data: existingTransactions, error: existingError } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .select('"Amount", "Date", "Description"');

    if (existingError) throw existingError; // Create a set of existing transactions for quick lookup
    const existingSet = new Set(
      existingTransactions?.map(
        (t) => `${t.Amount}_${t.Date}_${t.Description}`,
      ) || [],
    );

    // Filter out duplicates and prepare new transactions
    const newTransactions: TransactionDiff[] = [];
    let nextId = maxId + 1;

    hbTransactions?.forEach((transaction) => {
      const key = `${transaction.Amount}_${transaction.Date}_${transaction.Description}`;
      if (!existingSet.has(key)) {
        newTransactions.push({
          id: nextId++,
          amount: transaction.Amount,
          date: transaction.Date,
          description: transaction.Description,
          category: transaction.Category,
          isNew: true,
        });
      }
    });

    // Calculate summary
    const totalAmount = newTransactions.reduce((sum, t) => sum + t.amount, 0);
    const dates = newTransactions.map((t) => t.date).sort();

    return {
      newTransactions,
      summary: {
        totalNew: newTransactions.length,
        totalAmount,
        dateRange: {
          from: dates[0] || "",
          to: dates[dates.length - 1] || "",
        },
      },
    };
  } catch (error) {
    console.error("Error getting update preview:", error);
    throw error;
  }
}

export async function executeUpdate(
  newTransactions: TransactionDiff[],
): Promise<UpdateResult> {
  try {
    if (newTransactions.length === 0) {
      return { success: true, insertedCount: 0 };
    } // Prepare transactions for insertion
    const transactionsToInsert = newTransactions.map((t) => ({
      id: t.id,
      Amount: t.amount,
      Date: t.date,
      Description: t.description,
      Category: t.category,
      Bank: "Handelsbanken",
      Responsible: "Carlos",
      user_id: "2b5c5467-04e0-4820-bea9-1645821fa1b7",
      source_table: "HB_2025",
    }));

    // Insert new transactions
    const { data, error } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .insert(transactionsToInsert)
      .select("id");

    if (error) throw error;

    return {
      success: true,
      insertedCount: data?.length || newTransactions.length,
    };
  } catch (error) {
    console.error("Error executing update:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export interface AmexUpdatePreview {
  sourceMonthsIncluded: string[];
  availableNewMonths: string[];
  newTransactionCount?: number;
  previewTransactions?: Transaction[];
}

export interface AmexUpdateResult {
  success: boolean;
  message: string;
  transactionsAdded: number;
  monthIncluded?: string;
}

// Get AMEX update preview with month selection
export async function getAmexUpdatePreview(): Promise<AmexUpdatePreview> {
  try {
    // Get months already included in aggregated table
    const { data: includedMonths, error: includedError } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .select("source_table")
      .like("source_table", "AM_%")
      .order("source_table");

    if (includedError) {
      console.error("Error fetching included months:", includedError);
      return { sourceMonthsIncluded: [], availableNewMonths: [] };
    }

    const sourceMonthsIncluded = [
      ...new Set(includedMonths.map((item) => item.source_table)),
    ];

    // Try to detect available AM tables by attempting to query them
    // We'll check for AM_YYYYMM pattern for recent months
    const availableNewMonths: string[] = [];

    // Check for 2024 and 2025 months (adjust as needed)
    const currentYear = new Date().getFullYear();
    const yearsToCheck = [currentYear - 1, currentYear, currentYear + 1];

    for (const year of yearsToCheck) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, "0");
        const tableName = `AM_${year}${monthStr}`;

        // Skip if already included
        if (sourceMonthsIncluded.includes(tableName)) {
          continue;
        }
        try {
          // Try to query the table to see if it exists
          const { error } = await supabase
            .from(tableName)
            .select("id")
            .limit(1); // If no error, table exists
          if (!error) {
            availableNewMonths.push(tableName);
          }
        } catch {
          // Table doesn't exist, skip
          continue;
        }
      }
    }

    return {
      sourceMonthsIncluded,
      availableNewMonths: availableNewMonths.sort(),
    };
  } catch (error) {
    console.error("Error in getAmexUpdatePreview:", error);
    return { sourceMonthsIncluded: [], availableNewMonths: [] };
  }
}

// Preview transactions for a specific AMEX month
export async function previewAmexMonthTransactions(
  monthTable: string,
): Promise<Transaction[]> {
  try {
    const { data: transactions, error } = await supabase
      .from(monthTable)
      .select(
        `
        id,
        created_at,
        "Date",
        "Description", 
        "Amount",
        "Balance",
        "Category",
        "Responsible",
        "Bank",
        "Comment",
        user_id
      `,
      )
      .order('"Date"');

    if (error) {
      console.error(`Error previewing ${monthTable} transactions:`, error);
      return [];
    }

    return transactions as Transaction[];
  } catch (error) {
    console.error("Error in previewAmexMonthTransactions:", error);
    return [];
  }
}

// Execute AMEX update for a specific month
export async function executeAmexUpdate(
  monthTable: string,
): Promise<AmexUpdateResult> {
  try {
    // First check if this month was already included
    const { data: existingCheck } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .select("id")
      .eq("source_table", monthTable)
      .limit(1);

    if (existingCheck && existingCheck.length > 0) {
      return {
        success: false,
        message: `Month ${monthTable} has already been included in the aggregated table.`,
        transactionsAdded: 0,
      };
    }

    // Get the highest ID in the aggregated table
    const { data: maxIdResult, error: maxIdError } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    if (maxIdError) {
      throw new Error(`Error getting max ID: ${maxIdError.message}`);
    }

    const nextId = (maxIdResult?.[0]?.id || 0) + 1;

    // Get new transactions from the monthly table that don't already exist
    const { data: newTransactions, error: selectError } = await supabase
      .from(monthTable)
      .select(
        `
        created_at,
        "Date",
        "Description",
        "Amount", 
        "Balance",
        "Category",
        "Responsible",
        "Bank",
        "Comment",
        user_id
      `,
      )
      .order('"Date"');

    if (selectError) {
      throw new Error(`Error selecting transactions: ${selectError.message}`);
    }

    if (!newTransactions || newTransactions.length === 0) {
      return {
        success: false,
        message: `No transactions found in ${monthTable}.`,
        transactionsAdded: 0,
      };
    }

    // Prepare data for insertion with sequential IDs
    const transactionsToInsert = newTransactions.map((transaction, index) => ({
      id: nextId + index,
      created_at: new Date().toISOString(),
      Date: transaction.Date,
      Description: transaction.Description,
      Amount: transaction.Amount,
      Balance: transaction.Balance,
      Category: transaction.Category,
      Responsible: transaction.Responsible,
      Bank: "American Express",
      Comment: transaction.Comment,
      user_id: transaction.user_id,
      source_table: monthTable,
    }));

    // Insert new transactions
    const { error: insertError } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .insert(transactionsToInsert);

    if (insertError) {
      throw new Error(`Error inserting transactions: ${insertError.message}`);
    }

    return {
      success: true,
      message: `Successfully added ${newTransactions.length} transactions from ${monthTable} to the aggregated table.`,
      transactionsAdded: newTransactions.length,
      monthIncluded: monthTable,
    };
  } catch (error) {
    console.error("Error in executeAmexUpdate:", error);
    return {
      success: false,
      message: `Error updating aggregated data: ${error instanceof Error ? error.message : "Unknown error"}`,
      transactionsAdded: 0,
    };
  }
}

// SJ Prio interfaces (similar to AMEX)
export interface SjUpdatePreview {
  sourceMonthsIncluded: string[];
  availableNewMonths: string[];
  newTransactionCount?: number;
  previewTransactions?: Transaction[];
}

export interface SjUpdateResult {
  success: boolean;
  message: string;
  transactionsAdded: number;
  monthIncluded?: string;
}

// Get SJ update preview with month selection
export async function getSjUpdatePreview(): Promise<SjUpdatePreview> {
  try {
    // Get months already included in aggregated table
    const { data: includedMonths, error: includedError } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .select("source_table")
      .like("source_table", "SJ_%")
      .order("source_table");

    if (includedError) {
      console.error("Error fetching included months:", includedError);
      return { sourceMonthsIncluded: [], availableNewMonths: [] };
    }

    const sourceMonthsIncluded = [
      ...new Set(includedMonths.map((item) => item.source_table)),
    ];

    // Try to detect available SJ tables by attempting to query them
    // We'll check for SJ_YYYYMM pattern for recent months
    const availableNewMonths: string[] = [];

    // Check for 2024, 2025, and 2026 months
    const currentYear = new Date().getFullYear();
    const yearsToCheck = [currentYear - 1, currentYear, currentYear + 1];

    for (const year of yearsToCheck) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, "0");
        const tableName = `SJ_${year}${monthStr}`;

        // Skip if already included
        if (sourceMonthsIncluded.includes(tableName)) {
          continue;
        }

        try {
          // Try to query the table to see if it exists
          const { error } = await supabase
            .from(tableName)
            .select("id")
            .limit(1);

          // If no error, table exists
          if (!error) {
            availableNewMonths.push(tableName);
          }
        } catch {
          // Table doesn't exist, skip
          continue;
        }
      }
    }

    return {
      sourceMonthsIncluded,
      availableNewMonths: availableNewMonths.sort(),
    };
  } catch (error) {
    console.error("Error in getSjUpdatePreview:", error);
    return { sourceMonthsIncluded: [], availableNewMonths: [] };
  }
}

// Preview transactions for a specific SJ month
export async function previewSjMonthTransactions(
  monthTable: string,
): Promise<Transaction[]> {
  try {
    const { data: transactions, error } = await supabase
      .from(monthTable)
      .select(
        `
        id,
        created_at,
        "Date",
        "Description", 
        "Amount",
        "Balance",
        "Category",
        "Responsible",
        "Bank",
        "Comment",
        user_id
      `,
      )
      .order('"Date"');

    if (error) {
      console.error(`Error previewing ${monthTable} transactions:`, error);
      return [];
    }

    return transactions as Transaction[];
  } catch (error) {
    console.error("Error in previewSjMonthTransactions:", error);
    return [];
  }
}

// Execute SJ update for a specific month
export async function executeSjUpdate(
  monthTable: string,
): Promise<SjUpdateResult> {
  try {
    // First check if this month was already included
    const { data: existingCheck } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .select("id")
      .eq("source_table", monthTable)
      .limit(1);

    if (existingCheck && existingCheck.length > 0) {
      return {
        success: false,
        message: `Month ${monthTable} has already been included in the aggregated table.`,
        transactionsAdded: 0,
      };
    }

    // Get the highest ID in the aggregated table
    const { data: maxIdResult, error: maxIdError } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    if (maxIdError) {
      throw new Error(`Error getting max ID: ${maxIdError.message}`);
    }

    const nextId = (maxIdResult?.[0]?.id || 0) + 1;

    // Get new transactions from the monthly table
    const { data: newTransactions, error: selectError } = await supabase
      .from(monthTable)
      .select(
        `
        created_at,
        "Date",
        "Description",
        "Amount", 
        "Balance",
        "Category",
        "Responsible",
        "Bank",
        "Comment",
        user_id
      `,
      )
      .order('"Date"');

    if (selectError) {
      throw new Error(`Error selecting transactions: ${selectError.message}`);
    }

    if (!newTransactions || newTransactions.length === 0) {
      return {
        success: false,
        message: `No transactions found in ${monthTable}.`,
        transactionsAdded: 0,
      };
    }

    // Prepare data for insertion with sequential IDs
    const transactionsToInsert = newTransactions.map((transaction, index) => ({
      id: nextId + index,
      created_at: new Date().toISOString(),
      Date: transaction.Date,
      Description: transaction.Description,
      Amount: transaction.Amount,
      Balance: transaction.Balance,
      Category: transaction.Category,
      Responsible: transaction.Responsible,
      Bank: "SEB SJ Prio",
      Comment: transaction.Comment,
      user_id: transaction.user_id,
      source_table: monthTable,
    }));

    // Insert new transactions
    const { error: insertError } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .insert(transactionsToInsert);

    if (insertError) {
      throw new Error(`Error inserting transactions: ${insertError.message}`);
    }

    return {
      success: true,
      message: `Successfully added ${newTransactions.length} transactions from ${monthTable} to the aggregated table.`,
      transactionsAdded: newTransactions.length,
      monthIncluded: monthTable,
    };
  } catch (error) {
    console.error("Error in executeSjUpdate:", error);
    return {
      success: false,
      message: `Error updating aggregated data: ${error instanceof Error ? error.message : "Unknown error"}`,
      transactionsAdded: 0,
    };
  }
}

// Inter Bank Update Functions for Brasil_transactions_agregated_2025

export interface InterUpdatePreview {
  sourceTablesIncluded: string[];
  availableNewTables: string[];
  newTransactionCount?: number;
  previewTransactions?: Transaction[];
}

export interface InterUpdateResult {
  success: boolean;
  message: string;
  transactionsAdded: number;
  tablesIncluded?: string[];
}

// Get Inter update preview with table detection
export async function getInterUpdatePreview(): Promise<InterUpdatePreview> {
  try {
    // Get tables already included in aggregated table
    const { data: includedTables, error: includedError } = await supabase
      .from("Brasil_transactions_agregated_2025")
      .select("source_table")
      .like("source_table", "IN_%")
      .order("source_table");

    if (includedError) {
      console.error("Error fetching included tables:", includedError);
      return { sourceTablesIncluded: [], availableNewTables: [] };
    }

    const sourceTablesIncluded = [
      ...new Set(includedTables.map((item) => item.source_table)),
    ];

    // Try to detect available IN tables by attempting to query them
    const availableNewTables: string[] = [];

    // Check for IN_YYYY pattern (yearly tables) for recent years
    const currentYear = new Date().getFullYear();
    const yearsToCheck = [
      currentYear - 2,
      currentYear - 1,
      currentYear,
      currentYear + 1,
    ];

    for (const year of yearsToCheck) {
      const tableName = `IN_${year}`;

      // Skip if already included
      if (sourceTablesIncluded.includes(tableName)) {
        continue;
      }

      try {
        // Try to query the table to see if it exists
        const { error } = await supabase.from(tableName).select("id").limit(1);

        // If no error, table exists
        if (!error) {
          availableNewTables.push(tableName);
        }
      } catch {
        // Table doesn't exist, skip
        continue;
      }
    }

    // Check for IN_YYYYMM pattern (monthly tables) for recent years
    for (const year of yearsToCheck) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, "0");
        const tableName = `IN_${year}${monthStr}`;

        // Skip if already included
        if (sourceTablesIncluded.includes(tableName)) {
          continue;
        }

        try {
          // Try to query the table to see if it exists
          const { error } = await supabase
            .from(tableName)
            .select("id")
            .limit(1);

          // If no error, table exists
          if (!error) {
            availableNewTables.push(tableName);
          }
        } catch {
          // Table doesn't exist, skip
          continue;
        }
      }
    }

    return {
      sourceTablesIncluded,
      availableNewTables: availableNewTables.sort(),
    };
  } catch (error) {
    console.error("Error in getInterUpdatePreview:", error);
    return { sourceTablesIncluded: [], availableNewTables: [] };
  }
}

// Preview transactions for specific Inter tables
export async function previewInterTableTransactions(
  tableNames: string[],
): Promise<Transaction[]> {
  try {
    const allNewTransactions: Transaction[] = [];

    for (const tableName of tableNames) {
      try {
        // Get all transactions from the source table
        const { data: sourceTransactions, error } = await supabase
          .from(tableName)
          .select(
            `
            id,
            created_at,
            "Date",
            "Description", 
            "Amount",
            "Balance",
            "Category",
            "Responsible",
            "Bank",
            "Comment",
            user_id
          `,
          )
          .order('"Date"');

        if (error) {
          console.error(`Error previewing ${tableName} transactions:`, error);
          continue;
        }

        if (!sourceTransactions || sourceTransactions.length === 0) {
          continue;
        }

        // Get existing transactions from this source table in the aggregated table
        const { data: existingTransactions, error: existingError } =
          await supabase
            .from("Brasil_transactions_agregated_2025")
            .select(
              `
            "Date",
            "Description", 
            "Amount",
            "Balance"
          `,
            )
            .eq("source_table", tableName);

        if (existingError) {
          console.error(
            `Error checking existing transactions for ${tableName}:`,
            existingError,
          );
          // If we can't check for existing transactions, skip this table to avoid duplicates
          continue;
        }

        // Create a set of existing transaction signatures for fast lookup
        const existingSignatures = new Set(
          (existingTransactions || []).map(
            (t) => `${t.Date}|${t.Description}|${t.Amount}|${t.Balance}`,
          ),
        );

        // Filter out transactions that already exist in the aggregated table
        const newTransactions = sourceTransactions.filter((t) => {
          const signature = `${t.Date}|${t.Description}|${t.Amount}|${t.Balance}`;
          return !existingSignatures.has(signature);
        });

        // Add source_table info for display
        const transactionsWithSource = newTransactions.map((t) => ({
          ...t,
          source_table: tableName,
        }));

        allNewTransactions.push(...transactionsWithSource);
      } catch (error) {
        console.error(`Error querying table ${tableName}:`, error);
        continue;
      }
    }

    // Sort all new transactions by date
    allNewTransactions.sort((a, b) => {
      const dateA = a.Date ? new Date(a.Date).getTime() : 0;
      const dateB = b.Date ? new Date(b.Date).getTime() : 0;
      return dateA - dateB;
    });

    return allNewTransactions as Transaction[];
  } catch (error) {
    console.error("Error in previewInterTableTransactions:", error);
    return [];
  }
}

// Execute Inter update for selected tables
export async function executeInterUpdate(
  selectedTables: string[],
): Promise<InterUpdateResult> {
  try {
    if (selectedTables.length === 0) {
      return {
        success: false,
        message: "No tables selected for update.",
        transactionsAdded: 0,
      };
    }

    let totalTransactionsAdded = 0;
    const tablesProcessed: string[] = [];

    for (const tableName of selectedTables) {
      try {
        // Get all transactions from the source table
        const { data: sourceTransactions, error: selectError } = await supabase
          .from(tableName)
          .select(
            `
            created_at,
            "Date",
            "Description",
            "Amount", 
            "Balance",
            "Category",
            "Responsible",
            "Bank",
            "Comment",
            user_id
          `,
          )
          .order('"Date"');

        if (selectError) {
          throw new Error(
            `Error selecting transactions from ${tableName}: ${selectError.message}`,
          );
        }

        if (!sourceTransactions || sourceTransactions.length === 0) {
          console.log(`No transactions found in ${tableName}, skipping...`);
          continue;
        }

        // Get existing transactions from this source table in the aggregated table
        const { data: existingTransactions, error: existingError } =
          await supabase
            .from("Brasil_transactions_agregated_2025")
            .select(
              `
            "Date",
            "Description", 
            "Amount",
            "Balance"
          `,
            )
            .eq("source_table", tableName);

        if (existingError) {
          throw new Error(
            `Error checking existing transactions for ${tableName}: ${existingError.message}`,
          );
        }

        // Create a set of existing transaction signatures for fast lookup
        const existingSignatures = new Set(
          (existingTransactions || []).map(
            (t) => `${t.Date}|${t.Description}|${t.Amount}|${t.Balance}`,
          ),
        );

        // Filter out transactions that already exist in the aggregated table
        const newTransactions = sourceTransactions.filter((t) => {
          const signature = `${t.Date}|${t.Description}|${t.Amount}|${t.Balance}`;
          return !existingSignatures.has(signature);
        });

        if (newTransactions.length === 0) {
          console.log(`No new transactions found in ${tableName}, skipping...`);
          continue;
        }

        // Get the highest ID in the aggregated table
        const { data: maxIdResult, error: maxIdError } = await supabase
          .from("Brasil_transactions_agregated_2025")
          .select("id")
          .order("id", { ascending: false })
          .limit(1);

        if (maxIdError) {
          throw new Error(`Error getting max ID: ${maxIdError.message}`);
        }

        const nextId = (maxIdResult?.[0]?.id || 0) + totalTransactionsAdded + 1;

        // Prepare data for insertion with sequential IDs
        const transactionsToInsert = newTransactions.map(
          (transaction, index) => ({
            id: nextId + index,
            created_at: new Date().toISOString(),
            Date: transaction.Date,
            Description: transaction.Description,
            Amount: transaction.Amount,
            Balance: transaction.Balance,
            Category: transaction.Category || "Uncategorized",
            Responsible: transaction.Responsible || "Carlos",
            Bank: transaction.Bank || "Inter-BR",
            Comment: transaction.Comment,
            user_id:
              transaction.user_id || "2b5c5467-04e0-4820-bea9-1645821fa1b7",
            source_table: tableName,
          }),
        );

        // Insert new transactions
        const { error: insertError } = await supabase
          .from("Brasil_transactions_agregated_2025")
          .insert(transactionsToInsert);

        if (insertError) {
          throw new Error(
            `Error inserting transactions from ${tableName}: ${insertError.message}`,
          );
        }

        totalTransactionsAdded += newTransactions.length;
        tablesProcessed.push(tableName);
        console.log(
          `Successfully added ${newTransactions.length} new transactions from ${tableName}`,
        );
      } catch (error) {
        console.error(`Error processing table ${tableName}:`, error);
        // Continue with other tables even if one fails
        continue;
      }
    }

    if (totalTransactionsAdded === 0) {
      return {
        success: false,
        message:
          "No new transactions were added. All selected tables may already be included or contain no data.",
        transactionsAdded: 0,
      };
    }

    return {
      success: true,
      message: `Successfully added ${totalTransactionsAdded} transactions from ${tablesProcessed.length} Inter tables to Brasil_transactions_agregated_2025.`,
      transactionsAdded: totalTransactionsAdded,
      tablesIncluded: tablesProcessed,
    };
  } catch (error) {
    console.error("Error in executeInterUpdate:", error);
    return {
      success: false,
      message: `Error updating aggregated data: ${error instanceof Error ? error.message : "Unknown error"}`,
      transactionsAdded: 0,
    };
  }
}
