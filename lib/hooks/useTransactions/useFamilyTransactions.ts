import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Transaction } from "@/types/transaction";
import { supabase } from "../../supabaseClient";

// Shared helper: normalises Brasil transaction amounts based on Comment field
function adjustTransactionAmounts(transactions: Transaction[]): Transaction[] {
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
}

// Shared helper: fetches and merges both Brasil yearly tables with stable unique IDs
async function fetchBrasilTransactions(): Promise<Transaction[]> {
  const [
    { data: data2024, error: error2024 },
    { data: data2025, error: error2025 },
  ] = await Promise.all([
    supabase.from("Brasil_transactions_agregated_2024").select("*"),
    supabase.from("Brasil_transactions_agregated_2025").select("*"),
  ]);

  if (error2024 || error2025) {
    throw new Error(
      `Error fetching transactions: ${error2024?.message || error2025?.message}`,
    );
  }

  const data2024WithUniqueIds = (data2024 || []).map((transaction) => ({
    ...transaction,
    id: `2024_${transaction.id}`,
    originalId: transaction.id,
    sourceTable: "Brasil_transactions_agregated_2024",
  }));

  const data2025WithUniqueIds = (data2025 || []).map((transaction) => ({
    ...transaction,
    id: `2025_${transaction.id}`,
    originalId: transaction.id,
    sourceTable: "Brasil_transactions_agregated_2025",
  }));

  return [...data2024WithUniqueIds, ...data2025WithUniqueIds] as Transaction[];
}

export function useFamilyTransactions() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amandaTransactions, setAmandaTransactions] = useState<Transaction[]>(
    [],
  );
  const [usTransactions, setUsTransactions] = useState<Transaction[]>([]);
  const [meTransactions, setMeTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAndProcessTransactions = useCallback(async () => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const combinedData = await fetchBrasilTransactions();
      const adjustedTransactions = adjustTransactionAmounts(combinedData);

      setTransactions(adjustedTransactions);
      setAmandaTransactions(
        adjustedTransactions.filter((t) => t.Responsible === "Amanda"),
      );
      setUsTransactions(
        adjustedTransactions.filter((t) => t.Responsible === "us"),
      );
      setMeTransactions(
        adjustedTransactions.filter((t) => t.Responsible === "Carlos"),
      );
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

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
    loading: authLoading || loading,
    error,
    user,
    refetch,
  };
}

export function useFamilyTableTransactions() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAndProcessTransactions = useCallback(async () => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const combinedData = await fetchBrasilTransactions();
      const adjustedTransactions = adjustTransactionAmounts(combinedData);

      const sortedTransactions = adjustedTransactions.sort((a, b) => {
        const dateA = a.Date ? new Date(a.Date) : new Date(0);
        const dateB = b.Date ? new Date(b.Date) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setTransactions(sortedTransactions);
    } catch (err) {
      console.error("Error fetching family table transactions:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    fetchAndProcessTransactions();
  }, [fetchAndProcessTransactions]);

  const refetch = useCallback(async () => {
    await fetchAndProcessTransactions();
  }, [fetchAndProcessTransactions]);

  return {
    transactions,
    loading: authLoading || loading,
    error,
    user,
    refetch,
  };
}
