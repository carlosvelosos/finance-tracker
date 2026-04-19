import { useEffect, useState } from "react";
import { Transaction } from "@/types/transaction";
import { useTransactions } from "./useTransactions";

export function useAmexTransactions() {
  return useTransactions({ tableName: "AM_ALL" });
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

// Identical options to useInterTransactions — kept as a separate export for call-site compatibility
export function useInterAccountTransactions() {
  return useInterTransactions();
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
    const processedData = rawTransactions.map((transaction: Transaction) => {
      if (
        transaction.Bank === "SEB SJ Prio" ||
        transaction.Bank === "American Express"
      ) {
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
