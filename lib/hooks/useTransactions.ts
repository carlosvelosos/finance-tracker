import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchTransactions,
  FetchTransactionsOptions,
} from "../utils/transactionFetchers";
import { Transaction } from "@/types/transaction";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/auth-helpers-nextjs";

interface UseTransactionsOptions
  extends Omit<FetchTransactionsOptions, "userId"> {
  enabled?: boolean;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const { enabled = true, ...fetchOptions } = options;

  // Memoize the fetch options properly to prevent infinite re-renders
  const memoizedFetchOptions = useMemo(
    () => ({
      tableName: fetchOptions.tableName,
      bankFilter: fetchOptions.bankFilter,
      additionalFilters: fetchOptions.additionalFilters,
      orderBy: fetchOptions.orderBy,
      orderDirection: fetchOptions.orderDirection,
    }),
    [
      fetchOptions.tableName,
      fetchOptions.bankFilter,
      fetchOptions.additionalFilters,
      fetchOptions.orderBy,
      fetchOptions.orderDirection,
    ],
  );

  const loadTransactions = useCallback(async () => {
    if (!user || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await fetchTransactions({
        userId: user.id,
        ...memoizedFetchOptions,
      });

      if (fetchError) {
        setError(fetchError);
      } else {
        setTransactions(data || []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, enabled, memoizedFetchOptions]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const refetch = useCallback(async () => {
    await loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch,
    user,
  };
}

// Specialized hooks for common use cases
export function useAmexTransactions() {
  return useTransactions({ bankFilter: "American Express" });
}

export function useHandelsbankenTransactions() {
  return useTransactions({ bankFilter: "Handelsbanken" });
}

export function useSjPrioTransactions() {
  return useTransactions({ bankFilter: "SEB SJ Prio" });
}

export function useInterTransactions() {
  return useTransactions({
    tableName: "Brasil_transactions_agregated_2025",
  });
}

export function useInterAccountTransactions() {
  return useTransactions({
    tableName: "Brasil_transactions_agregated_2025",
  });
}

export function useGlobalTransactions() {
  return useTransactions({
    tableName: "Sweden_transactions_agregated_2025",
  });
}

export function useInAllTransactions() {
  return useTransactions({
    tableName: "IN_ALL",
  });
}

// Hook for chart pages with specific bank filters
export function useHandelsbankenChartTransactions() {
  return useTransactions({
    bankFilter: "Handelsbanken",
    orderBy: '"Date"',
    orderDirection: "desc",
  });
}

export function useAmexChartTransactions() {
  return useTransactions({
    bankFilter: "American Express",
    orderBy: '"Date"',
    orderDirection: "desc",
  });
}

export function useInterChartTransactions() {
  return useTransactions({
    tableName: "IN_ALL",
    bankFilter: "Inter Black",
    orderBy: '"Date"',
    orderDirection: "desc",
  });
}

export function useSjPrioChartTransactions() {
  return useTransactions({
    bankFilter: "SEB SJ Prio",
    orderBy: '"Date"',
    orderDirection: "desc",
  });
}

export function useGlobalChartTransactions() {
  return useTransactions({
    tableName: "Sweden_transactions_agregated_2025",
    orderBy: '"Date"',
    orderDirection: "desc",
  });
}

// Specialized hooks for Handelsbanken chart pages
export function useHandelsbankenCategoryChartTransactions() {
  return useTransactions({
    bankFilter: "Handelsbanken",
    orderBy: '"Date"',
    orderDirection: "desc",
  });
}

export function useHandelsbankenOverviewChartTransactions() {
  return useTransactions({
    bankFilter: "Handelsbanken",
    orderBy: '"Date"',
    orderDirection: "desc",
  });
}

// Specialized hooks for Inter-account chart pages
export function useInterAccountCategoryChartTransactions() {
  return useTransactions({
    tableName: "Brasil_transactions_agregated_2025",
    bankFilter: "Handelsbanken",
    orderBy: '"Date"',
    orderDirection: "desc",
  });
}

export function useInterAccountOverviewChartTransactions() {
  return useTransactions({
    tableName: "Brasil_transactions_agregated_2025",
    orderBy: '"Date"',
    orderDirection: "desc",
  });
}

// Special hook for global page that processes amounts for specific banks
export function useGlobalTransactionsWithProcessing() {
  const {
    transactions: rawTransactions,
    loading,
    error,
    user,
    refetch,
  } = useGlobalTransactions();

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Process the data to invert the sign for specific banks
    const processedData = rawTransactions.map((transaction: Transaction) => {
      // Check if the bank is "SEB SJ Prio" or "American Express"
      if (
        transaction.Bank === "SEB SJ Prio" ||
        transaction.Bank === "American Express"
      ) {
        // Invert the sign of the Amount by multiplying by -1
        return {
          ...transaction,
          Amount: transaction.Amount ? -transaction.Amount : transaction.Amount,
        };
      }
      return transaction;
    });

    setTransactions(processedData);
  }, [rawTransactions]);

  return {
    transactions,
    loading,
    error,
    user,
    refetch,
  };
}

// Special hook for inter-account page that calculates bank info
export function useInterAccountTransactionsWithBankInfo() {
  const {
    transactions: rawTransactions,
    loading,
    error,
    user,
    refetch,
  } = useInterAccountTransactions();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankInfo, setBankInfo] = useState<{
    uniqueBanks: string[];
    newestDatesByBank: Record<string, string>;
    transactionCountsByBank: Record<string, number>;
  }>({
    uniqueBanks: [],
    newestDatesByBank: {},
    transactionCountsByBank: {},
  });

  useEffect(() => {
    setTransactions(rawTransactions);

    // Calculate bank information
    if (rawTransactions && rawTransactions.length > 0) {
      const uniqueBanks = [
        ...new Set(
          rawTransactions
            .map((t) => t.Bank)
            .filter((bank): bank is string => Boolean(bank)),
        ),
      ];
      const newestDatesByBank: Record<string, string> = {};
      const transactionCountsByBank: Record<string, number> = {};

      uniqueBanks.forEach((bank) => {
        const bankTransactions = rawTransactions.filter((t) => t.Bank === bank);
        transactionCountsByBank[bank] = bankTransactions.length;
        const newestTransaction = bankTransactions.reduce((newest, current) => {
          const currentDate = current.Date
            ? new Date(current.Date)
            : new Date(0);
          const newestDate = newest.Date ? new Date(newest.Date) : new Date(0);
          return currentDate > newestDate ? current : newest;
        });
        if (newestTransaction.Date) {
          newestDatesByBank[bank] = newestTransaction.Date;
        }
      });

      setBankInfo({
        uniqueBanks,
        newestDatesByBank,
        transactionCountsByBank,
      });
    }
  }, [rawTransactions]);

  return {
    transactions,
    bankInfo,
    loading,
    error,
    user,
    refetch,
  };
}

// Hook for family page that fetches from both Brazilian tables and applies custom logic
export function useFamilyTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amandaTransactions, setAmandaTransactions] = useState<Transaction[]>(
    [],
  );
  const [usTransactions, setUsTransactions] = useState<Transaction[]>([]);
  const [meTransactions, setMeTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const supabase = createClientComponentClient();

  // Helper function to adjust the amount based on the Balance
  const adjustTransactionAmounts = (
    transactions: Transaction[],
  ): Transaction[] => {
    return transactions.map((transaction) => {
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
  };

  const fetchAndProcessTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      console.log("Fetching transactions from Supabase..."); // Debug log

      // Fetch data from both tables
      const { data: data2024, error: error2024 } = await supabase
        .from("Brasil_transactions_agregated_2024")
        .select("*");

      const { data: data2025, error: error2025 } = await supabase
        .from("Brasil_transactions_agregated_2025")
        .select("*");

      if (error2024 || error2025) {
        throw new Error(
          `Error fetching transactions: ${error2024?.message || error2025?.message}`,
        );
      }

      console.log("Fetched transactions from 2024:", data2024); // Log 2024 data
      console.log("Fetched transactions from 2025:", data2025); // Log 2025 data

      // Combine data from both years
      const combinedData = [...(data2024 || []), ...(data2025 || [])];

      const adjustedTransactions = adjustTransactionAmounts(
        combinedData as Transaction[],
      );
      console.log("Adjusted transactions:", adjustedTransactions);

      setTransactions(adjustedTransactions);
      setAmandaTransactions(
        adjustedTransactions.filter(
          (transaction) => transaction.Responsible === "Amanda",
        ),
      );
      setUsTransactions(
        adjustedTransactions.filter(
          (transaction) => transaction.Responsible === "us",
        ),
      );
      setMeTransactions(
        adjustedTransactions.filter(
          (transaction) => transaction.Responsible === "Carlos",
        ),
      );
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAndProcessTransactions();
  }, [fetchAndProcessTransactions]);

  const refetch = useCallback(async () => {
    await fetchAndProcessTransactions();
  }, [fetchAndProcessTransactions]);

  return {
    transactions,
    amandaTransactions,
    usTransactions,
    meTransactions,
    loading,
    error,
    user,
    refetch,
  };
}
