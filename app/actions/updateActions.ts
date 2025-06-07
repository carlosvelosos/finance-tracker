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
            .limit(1);

          // If no error, table exists
          if (!error) {
            availableNewMonths.push(tableName);
          }
        } catch (_err) {
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
