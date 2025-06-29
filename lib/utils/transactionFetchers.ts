import { supabase } from "../supabaseClient";
import { Transaction } from "@/types/transaction";

export interface FetchTransactionsOptions {
  tableName?: string;
  userId: string;
  bankFilter?: string;
  additionalFilters?: Record<string, unknown>;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export async function fetchTransactions({
  tableName = "Sweden_transactions_agregated_2025",
  userId,
  bankFilter,
  additionalFilters = {},
  orderBy = '"Date"',
  orderDirection = "desc",
}: FetchTransactionsOptions): Promise<{
  data: Transaction[] | null;
  error: unknown;
}> {
  try {
    let query = supabase
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
        user_id,
        source_table
      `,
      )
      .eq("user_id", userId);

    // Apply bank filter if specified
    if (bankFilter) {
      query = query.eq("Bank", bankFilter);
    }

    // Apply additional filters
    Object.entries(additionalFilters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    // Apply ordering
    query = query.order(orderBy, { ascending: orderDirection === "asc" });

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching transactions from ${tableName}:`, error);
      return { data: null, error };
    }

    return { data: data as Transaction[], error: null };
  } catch (error) {
    console.error("Unexpected error in fetchTransactions:", error);
    return { data: null, error };
  }
}

// Specialized fetchers for common use cases
export async function fetchAmexTransactions(userId: string) {
  return fetchTransactions({
    userId,
    bankFilter: "American Express",
  });
}

export async function fetchHandelsbankenTransactions(userId: string) {
  return fetchTransactions({
    userId,
    bankFilter: "Handelsbanken",
  });
}

export async function fetchInterTransactions(userId: string) {
  return fetchTransactions({
    tableName: "Brasil_transactions_agregated_2025",
    userId,
  });
}
