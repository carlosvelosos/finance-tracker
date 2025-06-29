import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchTransactions,
  FetchTransactionsOptions,
} from "../utils/transactionFetchers";
import { Transaction } from "@/types/transaction";

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

  useEffect(() => {
    if (!user || !enabled) return;

    const loadTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await fetchTransactions({
          userId: user.id,
          ...fetchOptions,
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
    };

    loadTransactions();
  }, [
    user,
    enabled,
    fetchOptions.tableName,
    fetchOptions.bankFilter,
    fetchOptions.orderBy,
    fetchOptions.orderDirection,
  ]);

  const refetch = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await fetchTransactions({
        userId: user.id,
        ...fetchOptions,
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
  };

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
