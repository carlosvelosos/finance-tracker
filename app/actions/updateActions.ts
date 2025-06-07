import { supabase } from "@/lib/supabaseClient";

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
      Responsable: "Carlos",
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
