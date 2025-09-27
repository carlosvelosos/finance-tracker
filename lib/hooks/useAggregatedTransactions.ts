import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../supabaseClient";
import { Transaction } from "@/types/transaction";

interface UseAggregatedTransactionsOptions {
  selectedTables: string[];
  enabled?: boolean;
}

interface BankInfo {
  uniqueBanks: string[];
  transactionCountsByBank: Record<string, number>;
  newestDatesByBank: Record<string, string>;
}

interface TableNetValueData {
  tableName: string;
  displayName: string;
  netValue: number;
  transactionCount: number;
}

export function useAggregatedTransactions({
  selectedTables,
  enabled = true,
}: UseAggregatedTransactionsOptions) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    uniqueBanks: [],
    transactionCountsByBank: {},
    newestDatesByBank: {},
  });
  const [tableNetValues, setTableNetValues] = useState<TableNetValueData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to adjust transaction amounts based on Comment field (for Brazilian tables)
  const adjustTransactionAmounts = useCallback(
    (transactions: Transaction[]): Transaction[] => {
      return transactions.map((transaction) => {
        // Apply amount adjustment logic for Brazilian tables (like family transactions)
        if (
          transaction.Comment?.includes("Outcome") &&
          transaction.Amount &&
          transaction.Amount > 0
        ) {
          return { ...transaction, Amount: -Math.abs(transaction.Amount) };
        } else if (
          transaction.Comment?.includes("Income") &&
          transaction.Amount &&
          transaction.Amount < 0
        ) {
          return { ...transaction, Amount: Math.abs(transaction.Amount) };
        }
        return transaction;
      });
    },
    [],
  );

  // Helper function to process transactions for Swedish banks (inverse amounts for specific banks)
  const processSwedishTransactions = useCallback(
    (transactions: Transaction[]): Transaction[] => {
      return transactions.map((transaction) => {
        // Check if the bank is "SEB SJ Prio" or "American Express" - invert sign
        if (
          transaction.Bank === "SEB SJ Prio" ||
          transaction.Bank === "American Express"
        ) {
          return {
            ...transaction,
            Amount: transaction.Amount
              ? -transaction.Amount
              : transaction.Amount,
          };
        }
        return transaction;
      });
    },
    [],
  );

  const fetchAggregatedTransactions = useCallback(async () => {
    if (!user || !enabled || selectedTables.length === 0) {
      setTransactions([]);
      setTableNetValues([]);
      setBankInfo({
        uniqueBanks: [],
        transactionCountsByBank: {},
        newestDatesByBank: {},
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        "Fetching aggregated transactions from tables:",
        selectedTables,
      );

      // Fetch data from all selected tables in parallel
      const tableDataPromises = selectedTables.map(async (tableName) => {
        try {
          // First, try with source_table column (for aggregated tables)
          let result: {
            data: Record<string, unknown>[] | null;
            error: { code?: string; message?: string } | null;
          } = await supabase
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
            .eq("user_id", user.id)
            .order('"Date"', { ascending: false });

          // If source_table column doesn't exist, try without it
          if (result.error && result.error.code === "42703") {
            console.log(
              `Table ${tableName} doesn't have source_table column, trying without it`,
            );

            result = await supabase
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
              .eq("user_id", user.id)
              .order('"Date"', { ascending: false });
          }

          const { data, error } = result;

          if (error) {
            console.error(`Error fetching from ${tableName}:`, error);
            return { tableName, data: [], error };
          }

          // Add unique identifiers and source table info to prevent key conflicts
          const dataWithUniqueIds = (data || []).map(
            (transaction: Record<string, unknown>) => ({
              ...transaction,
              id: `${tableName}_${transaction.id}`, // Prefix with table name to make unique
              originalId: transaction.id, // Keep original ID for reference
              sourceTable: tableName, // Table source identifier
            }),
          );

          return { tableName, data: dataWithUniqueIds, error: null };
        } catch (err) {
          console.error(`Error fetching from table ${tableName}:`, err);
          return { tableName, data: [], error: err };
        }
      });

      const tableResults = await Promise.all(tableDataPromises);

      // Log any errors
      const errors = tableResults.filter((result) => result.error);
      if (errors.length > 0) {
        console.warn("Errors fetching from some tables:", errors);
      }

      // Combine all successful data
      let combinedTransactions: Transaction[] = [];

      tableResults.forEach((result) => {
        if (result.data && result.data.length > 0) {
          combinedTransactions = [
            ...combinedTransactions,
            ...(result.data as Transaction[]),
          ];
        }
      });

      console.log(
        `Combined ${combinedTransactions.length} transactions from ${selectedTables.length} tables`,
      );

      // Apply processing based on table types
      let processedTransactions = combinedTransactions;

      // Apply Brazilian adjustments if any Brazilian tables are included
      const hasBrazilianTables = selectedTables.some(
        (tableName) => tableName.includes("Brasil") || tableName === "IN_ALL",
      );

      if (hasBrazilianTables) {
        processedTransactions = adjustTransactionAmounts(processedTransactions);
      }

      // Apply Swedish adjustments if Swedish tables are included
      const hasSwedishTables = selectedTables.some((tableName) =>
        tableName.includes("Sweden"),
      );

      if (hasSwedishTables) {
        processedTransactions = processSwedishTransactions(
          processedTransactions,
        );
      }

      // Sort by date (newest first)
      const sortedTransactions = processedTransactions.sort((a, b) => {
        const dateA = a.Date ? new Date(a.Date) : new Date(0);
        const dateB = b.Date ? new Date(b.Date) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      // Calculate bank information
      const uniqueBanks = [
        ...new Set(
          sortedTransactions
            .map((t) => t.Bank)
            .filter((bank): bank is string => Boolean(bank)),
        ),
      ];

      const transactionCountsByBank: Record<string, number> = {};
      const newestDatesByBank: Record<string, string> = {};

      uniqueBanks.forEach((bank) => {
        const bankTransactions = sortedTransactions.filter(
          (t) => t.Bank === bank,
        );
        transactionCountsByBank[bank] = bankTransactions.length;

        // Find newest date for this bank
        const newestTransaction = bankTransactions.find((t) => t.Date);
        if (newestTransaction?.Date) {
          newestDatesByBank[bank] = newestTransaction.Date;
        }
      });

      // Calculate net values per table (excluding automatic debit transactions)
      const tableNetValuesData: TableNetValueData[] = tableResults
        .filter((result) => result.data && result.data.length > 0)
        .map((result) => {
          const tableTransactions = sortedTransactions.filter(
            (t) => (t as any).sourceTable === result.tableName,
          );

          // Filter out automatic debit transactions for net value calculation
          const nonAutomaticDebitTransactions = tableTransactions.filter(
            (t) => t.Description !== "PAGTO DEBITO AUTOMATICO",
          );

          const netValue = nonAutomaticDebitTransactions.reduce(
            (sum, transaction) => {
              return sum + (transaction.Amount || 0);
            },
            0,
          );

          // Create a simple display name from table name
          const displayName = result.tableName
            .replace(/^INMC_/, "INMC ")
            .replace(/(\d{4})(\d{2})$/, "$1-$2")
            .replace(/_/g, " ");

          return {
            tableName: result.tableName,
            displayName: displayName,
            netValue: netValue,
            transactionCount: nonAutomaticDebitTransactions.length,
          };
        })
        .sort((a, b) => b.netValue - a.netValue); // Sort by net value descending

      setTransactions(sortedTransactions);
      setTableNetValues(tableNetValuesData);
      setBankInfo({
        uniqueBanks,
        transactionCountsByBank,
        newestDatesByBank,
      });
    } catch (err) {
      console.error("Error fetching aggregated transactions:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
      setTransactions([]);
      setTableNetValues([]);
      setBankInfo({
        uniqueBanks: [],
        transactionCountsByBank: {},
        newestDatesByBank: {},
      });
    } finally {
      setLoading(false);
    }
  }, [
    user,
    enabled,
    selectedTables,
    adjustTransactionAmounts,
    processSwedishTransactions,
  ]);

  useEffect(() => {
    fetchAggregatedTransactions();
  }, [user, enabled, selectedTables]); // Remove function dependency to prevent re-runs

  const refetch = useCallback(async () => {
    await fetchAggregatedTransactions();
  }, [fetchAggregatedTransactions]);

  // Memoize the bank info to prevent unnecessary re-renders
  const memoizedBankInfo = useMemo(() => bankInfo, [bankInfo]);

  return {
    transactions,
    bankInfo: memoizedBankInfo,
    tableNetValues,
    loading,
    error,
    refetch,
    user,
    selectedTablesCount: selectedTables.length,
    totalTransactions: transactions.length,
  };
}
