import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../supabaseClient";

export interface MonthlyData {
  month: string;
  interAcc: number;
  interCreditCard: number;
  interInvest: number;
  ricoCreditCard: number;
  ricoInvest: number;
  fgts: number;
  mae: number;
  handelsbankenAcc: number;
  handelsbankenInvest: number;
  amexCreditCard: number;
  sjPrioCreditCard: number;
  total: number;
}

interface Transaction {
  Date?: string;
  Amount?: number;
}

interface UseMonthlySummaryOptions {
  year?: number;
}

export function useMonthlySummary(options: UseMonthlySummaryOptions = {}) {
  const { user } = useAuth();
  const { year = new Date().getFullYear() } = options;
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasFetchedRef = useRef(false);
  const lastYearRef = useRef<number | null>(null);

  const fetchMonthlySummary = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Skip if already fetched for this year
    if (hasFetchedRef.current && lastYearRef.current === year) {
      console.log(
        "Skipping monthly summary fetch - data already loaded for this year",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching monthly summary data from Supabase...");

      // Filter for INACC tables for the specified year
      let inaccTables: string[] = [];

      try {
        const { data: rpcTables, error: rpcError } = await supabase.rpc(
          "get_user_accessible_tables",
        );

        if (!rpcError && rpcTables) {
          inaccTables = (rpcTables || [])
            .map((table: { table_name: string }) => table.table_name)
            .filter((tableName: string) =>
              tableName.startsWith(`INACC_${year}`),
            );
          console.log(
            "Found INACC tables via RPC for year",
            year,
            ":",
            inaccTables,
          );
        } else {
          console.warn("RPC function not available:", rpcError?.message);
          throw new Error("RPC not available");
        }
      } catch (rpcErr) {
        console.warn("RPC approach failed, trying fallback approach:", rpcErr);

        // Fallback: Try known table patterns (generate table names for recent months)
        const currentDate = new Date();
        const knownTableNames: string[] = [];

        // Generate table names for the specified year (all 12 months)
        for (let i = 1; i <= 12; i++) {
          const month = String(i).padStart(2, "0");
          knownTableNames.push(`INACC_${year}${month}`);
        }

        // Test which tables actually exist
        const tableExistenceTests = await Promise.all(
          knownTableNames.map(async (tableName) => {
            try {
              const { error } = await supabase
                .from(tableName)
                .select("*", { count: "exact", head: true })
                .limit(0);

              return error ? null : tableName;
            } catch (err) {
              return null;
            }
          }),
        );

        inaccTables = tableExistenceTests.filter(
          (table): table is string => table !== null,
        );
        console.log("Fallback approach found tables:", inaccTables);
      }

      console.log("Found INACC tables:", inaccTables);

      if (inaccTables.length === 0) {
        console.warn("No INACC tables found");
        setData([]);
        setLoading(false);
        return;
      }

      // Fetch data from each INACC table
      const tableDataPromises = inaccTables.map(async (tableName: string) => {
        try {
          const { data: transactions, error } = await supabase
            .from(tableName)
            .select('"Date", "Amount"')
            .eq("user_id", user.id);

          if (error) {
            console.error(`Error fetching from ${tableName}:`, error);
            return { tableName, transactions: [], error };
          }

          return { tableName, transactions: transactions || [], error: null };
        } catch (err) {
          console.error(`Error fetching from table ${tableName}:`, err);
          return { tableName, transactions: [], error: err };
        }
      });

      const tableResults = await Promise.all(tableDataPromises);

      // Group transactions by month and calculate totals
      const monthlyTotals: Record<string, number> = {};

      tableResults.forEach((result) => {
        if (result.transactions && result.transactions.length > 0) {
          // Extract year-month from table name (INACC_YYYYMM)
          const match = result.tableName.match(/INACC_(\d{4})(\d{2})/);
          if (match) {
            const year = match[1];
            const month = match[2];
            const monthKey = `${year}-${month}`;

            // Calculate total for this month
            const total = (result.transactions as Transaction[]).reduce(
              (sum, transaction) => sum + (transaction.Amount || 0),
              0,
            );

            monthlyTotals[monthKey] = total;
          }
        }
      });

      // Convert to MonthlyData format
      const monthlyDataArray: MonthlyData[] = Object.entries(monthlyTotals)
        .map(([monthKey, interAccTotal]) => {
          // Parse the month key to create a readable month string (only month name)
          const [yearStr, month] = monthKey.split("-");
          const monthDate = new Date(parseInt(yearStr), parseInt(month) - 1);
          const monthName = monthDate.toLocaleDateString("en-US", {
            month: "short",
          });

          return {
            month: monthName,
            interAcc: interAccTotal,
            interCreditCard: 0, // TODO: Add other account types when available
            interInvest: 0,
            ricoCreditCard: 0,
            ricoInvest: 0,
            fgts: 0,
            mae: 0,
            handelsbankenAcc: 0,
            handelsbankenInvest: 0,
            amexCreditCard: 0,
            sjPrioCreditCard: 0,
            total: interAccTotal, // For now, total equals interAcc
          };
        })
        .sort((a, b) => {
          // Sort by month order (January to December)
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          return months.indexOf(a.month) - months.indexOf(b.month);
        });

      console.log(
        `Processed ${monthlyDataArray.length} months of data from ${inaccTables.length} tables`,
      );

      setData(monthlyDataArray);
      hasFetchedRef.current = true;
      lastYearRef.current = year;
    } catch (err) {
      console.error("Error fetching monthly summary data:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user, year]);

  // Reset fetch flag when year changes
  useEffect(() => {
    if (lastYearRef.current !== null && lastYearRef.current !== year) {
      hasFetchedRef.current = false;
      lastYearRef.current = null;
    }
  }, [year]);

  useEffect(() => {
    fetchMonthlySummary();
  }, [fetchMonthlySummary]);

  const refetch = useCallback(async () => {
    hasFetchedRef.current = false;
    lastYearRef.current = null;
    await fetchMonthlySummary();
  }, [fetchMonthlySummary]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
