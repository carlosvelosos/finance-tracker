import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchTransactions,
  FetchTransactionsOptions,
} from "../../utils/transactionFetchers";
import { Transaction } from "@/types/transaction";

export interface UseTransactionsOptions
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
