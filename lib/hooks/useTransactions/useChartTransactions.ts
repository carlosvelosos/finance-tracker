import { useTransactions } from "./useTransactions";

export function useHandelsbankenChartTransactions() {
  return useTransactions({
    bankFilter: "Handelsbanken",
    orderBy: '"Date"',
    orderDirection: "desc",
  });
}

// These two are identical to useHandelsbankenChartTransactions
export const useHandelsbankenCategoryChartTransactions =
  useHandelsbankenChartTransactions;
export const useHandelsbankenOverviewChartTransactions =
  useHandelsbankenChartTransactions;

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
