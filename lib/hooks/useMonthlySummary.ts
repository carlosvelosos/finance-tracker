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
  Category?: string;
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

      // Discover INACC and INMCPDF tables for the specified year
      let inaccTables: string[] = [];
      let inmcpdfTables: string[] = [];

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
          inmcpdfTables = (rpcTables || [])
            .map((table: { table_name: string }) => table.table_name)
            .filter((tableName: string) =>
              tableName.startsWith(`INMCPDF_${year}`),
            );
          console.log(
            "Found INACC tables via RPC for year",
            year,
            ":",
            inaccTables,
          );
          console.log(
            "Found INMCPDF tables via RPC for year",
            year,
            ":",
            inmcpdfTables,
          );
        } else {
          console.warn("RPC function not available:", rpcError?.message);
          throw new Error("RPC not available");
        }
      } catch (rpcErr) {
        console.warn("RPC approach failed, trying fallback approach:", rpcErr);

        // Fallback: Try known table patterns (generate table names for the year)
        const knownInaccTableNames: string[] = [];
        const knownInmcpdfTableNames: string[] = [];

        // Generate table names for the specified year (all 12 months)
        for (let i = 1; i <= 12; i++) {
          const month = String(i).padStart(2, "0");
          knownInaccTableNames.push(`INACC_${year}${month}`);
          knownInmcpdfTableNames.push(`INMCPDF_${year}${month}`);
        }

        // Test which INACC tables actually exist
        const inaccExistenceTests = await Promise.all(
          knownInaccTableNames.map(async (tableName) => {
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

        inaccTables = inaccExistenceTests.filter(
          (table): table is string => table !== null,
        );

        // Test which INMCPDF tables actually exist
        const inmcpdfExistenceTests = await Promise.all(
          knownInmcpdfTableNames.map(async (tableName) => {
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

        inmcpdfTables = inmcpdfExistenceTests.filter(
          (table): table is string => table !== null,
        );

        console.log("Fallback approach found INACC tables:", inaccTables);
        console.log("Fallback approach found INMCPDF tables:", inmcpdfTables);
      }

      console.log("Found INACC tables:", inaccTables);
      console.log("Found INMCPDF tables:", inmcpdfTables);

      if (inaccTables.length === 0 && inmcpdfTables.length === 0) {
        console.warn("No INACC or INMCPDF tables found");
        setData([]);
        setLoading(false);
        return;
      }

      // Fetch data from each INACC table
      const inaccDataPromises = inaccTables.map(async (tableName: string) => {
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

      // Fetch data from each INMCPDF table
      const inmcpdfDataPromises = inmcpdfTables.map(
        async (tableName: string) => {
          try {
            const { data: transactions, error } = await supabase
              .from(tableName)
              .select('"Date", "Amount", "Category"')
              .eq("user_id", user.id);

            if (error) {
              console.error(`Error fetching from ${tableName}:`, error);
              return { tableName, transactions: [], error };
            }

            return {
              tableName,
              transactions: transactions || [],
              error: null,
            };
          } catch (err) {
            console.error(`Error fetching from table ${tableName}:`, err);
            return { tableName, transactions: [], error: err };
          }
        },
      );

      const [inaccResults, inmcpdfResults] = await Promise.all([
        Promise.all(inaccDataPromises),
        Promise.all(inmcpdfDataPromises),
      ]);

      // Group transactions by month and calculate totals
      const monthlyInaccTotals: Record<string, number> = {};
      const monthlyInmcpdfTotals: Record<string, number> = {};

      inaccResults.forEach((result) => {
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

            monthlyInaccTotals[monthKey] = total;
          }
        }
      });

      inmcpdfResults.forEach((result) => {
        if (result.transactions && result.transactions.length > 0) {
          // Extract year-month from table name (INMCPDF_YYYYMM)
          const match = result.tableName.match(/INMCPDF_(\d{4})(\d{2})/);
          if (match) {
            const year = match[1];
            const month = match[2];
            const monthKey = `${year}-${month}`;

            // Calculate total for this month, excluding "Pagamento fatura anterior"
            const total = (result.transactions as Transaction[])
              .filter(
                (transaction) =>
                  transaction.Category !== "Pagamento fatura anterior",
              )
              .reduce((sum, transaction) => sum + (transaction.Amount || 0), 0);

            monthlyInmcpdfTotals[monthKey] = total;
          }
        }
      });

      // Create entries for all 12 months
      const allMonths = [
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

      const monthlyDataArray: MonthlyData[] = allMonths.map(
        (monthName, index) => {
          // Create month key in format YYYY-MM
          const monthNumber = String(index + 1).padStart(2, "0");
          const monthKey = `${year}-${monthNumber}`;

          const interAccTotal = monthlyInaccTotals[monthKey] || 0;
          const interCreditCardTotal = monthlyInmcpdfTotals[monthKey] || 0;

          return {
            month: monthName,
            interAcc: interAccTotal,
            interCreditCard: interCreditCardTotal,
            interInvest: 0,
            ricoCreditCard: 0,
            ricoInvest: 0,
            fgts: 0,
            mae: 0,
            handelsbankenAcc: 0,
            handelsbankenInvest: 0,
            amexCreditCard: 0,
            sjPrioCreditCard: 0,
            total: interAccTotal + interCreditCardTotal,
          };
        },
      );

      console.log(
        `Processed ${monthlyDataArray.length} months of data from ${inaccTables.length} INACC tables and ${inmcpdfTables.length} INMCPDF tables`,
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
