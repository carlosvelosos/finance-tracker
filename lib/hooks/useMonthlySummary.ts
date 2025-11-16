import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../supabaseClient";

export interface MonthlyData {
  month: string;
  interAcc: number;
  interCreditCard: number;
  b3: number;
  ricoCreditCard: number;
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
  Balance?: number;
}

interface UseMonthlySummaryOptions {
  year?: number;
}

export function useMonthlySummary(options: UseMonthlySummaryOptions = {}) {
  const { user } = useAuth();
  const { year = new Date().getFullYear() } = options;
  const [data, setData] = useState<MonthlyData[]>([]);
  const [yearlyBalances, setYearlyBalances] = useState<Record<number, number>>(
    {},
  );
  const [yearlyInvestTotals, setYearlyInvestTotals] = useState<
    Record<number, number>
  >({});
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

      // Discover INACC, INMCPDF, AM, SJ, B3, and HB tables for the specified year
      let inaccTables: string[] = [];
      let inmcpdfTables: string[] = [];
      let amTables: string[] = [];
      let sjTables: string[] = [];
      let b3Tables: string[] = [];
      let hbTables: string[] = [];

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
          amTables = (rpcTables || [])
            .map((table: { table_name: string }) => table.table_name)
            .filter((tableName: string) => tableName.startsWith(`AM_${year}`));
          sjTables = (rpcTables || [])
            .map((table: { table_name: string }) => table.table_name)
            .filter((tableName: string) => tableName.startsWith(`SJ_${year}`));
          b3Tables = (rpcTables || [])
            .map((table: { table_name: string }) => table.table_name)
            .filter((tableName: string) => tableName.startsWith(`B3_${year}`));
          hbTables = (rpcTables || [])
            .map((table: { table_name: string }) => table.table_name)
            .filter((tableName: string) => {
              // Only include yearly HB tables (HB_YYYY), not monthly ones (HB_YYYYMM)
              const match = tableName.match(/^HB_(\d+)$/);
              return (
                match && match[1] === String(year) && match[1].length === 4
              );
            });
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
          console.log("Found AM tables via RPC for year", year, ":", amTables);
          console.log("Found SJ tables via RPC for year", year, ":", sjTables);
          console.log("Found B3 tables via RPC for year", year, ":", b3Tables);
          console.log("Found HB tables via RPC for year", year, ":", hbTables);
        } else {
          console.warn("RPC function not available:", rpcError?.message);
          throw new Error("RPC not available");
        }
      } catch (rpcErr) {
        console.warn("RPC approach failed, trying fallback approach:", rpcErr);

        // Fallback: Try known table patterns (generate table names for the year)
        const knownInaccTableNames: string[] = [];
        const knownInmcpdfTableNames: string[] = [];
        const knownAmTableNames: string[] = [];
        const knownSjTableNames: string[] = [];
        const knownB3TableNames: string[] = [];
        const knownHbTableNames: string[] = [`HB_${year}`]; // HB tables are per year

        // Generate table names for the specified year (all 12 months)
        for (let i = 1; i <= 12; i++) {
          const month = String(i).padStart(2, "0");
          knownInaccTableNames.push(`INACC_${year}${month}`);
          knownInmcpdfTableNames.push(`INMCPDF_${year}${month}`);
          knownAmTableNames.push(`AM_${year}${month}`);
          knownSjTableNames.push(`SJ_${year}${month}`);
          knownB3TableNames.push(`B3_${year}${month}`);
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
              console.error(`Error checking INACC table ${tableName}:`, err);
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
              console.error(`Error checking INMCPDF table ${tableName}:`, err);
              return null;
            }
          }),
        );

        inmcpdfTables = inmcpdfExistenceTests.filter(
          (table): table is string => table !== null,
        );

        // Test which AM tables actually exist
        const amExistenceTests = await Promise.all(
          knownAmTableNames.map(async (tableName) => {
            try {
              const { error } = await supabase
                .from(tableName)
                .select("*", { count: "exact", head: true })
                .limit(0);

              return error ? null : tableName;
            } catch (err) {
              console.error(`Error checking AM table ${tableName}:`, err);
              return null;
            }
          }),
        );

        amTables = amExistenceTests.filter(
          (table): table is string => table !== null,
        );

        // Test which SJ tables actually exist
        const sjExistenceTests = await Promise.all(
          knownSjTableNames.map(async (tableName) => {
            try {
              const { error } = await supabase
                .from(tableName)
                .select("*", { count: "exact", head: true })
                .limit(0);

              return error ? null : tableName;
            } catch (err) {
              console.error(`Error checking SJ table ${tableName}:`, err);
              return null;
            }
          }),
        );

        sjTables = sjExistenceTests.filter(
          (table): table is string => table !== null,
        );

        // Test which B3 tables actually exist
        const b3ExistenceTests = await Promise.all(
          knownB3TableNames.map(async (tableName) => {
            try {
              const { error } = await supabase
                .from(tableName)
                .select("*", { count: "exact", head: true })
                .limit(0);

              return error ? null : tableName;
            } catch (err) {
              console.error(`Error checking B3 table ${tableName}:`, err);
              return null;
            }
          }),
        );

        b3Tables = b3ExistenceTests.filter(
          (table): table is string => table !== null,
        );

        // Test which HB tables actually exist
        const hbExistenceTests = await Promise.all(
          knownHbTableNames.map(async (tableName) => {
            try {
              const { error } = await supabase
                .from(tableName)
                .select("*", { count: "exact", head: true })
                .limit(0);

              return error ? null : tableName;
            } catch (err) {
              console.error(`Error checking HB table ${tableName}:`, err);
              return null;
            }
          }),
        );

        hbTables = hbExistenceTests.filter(
          (table): table is string => table !== null,
        );

        console.log("Fallback approach found INACC tables:", inaccTables);
        console.log("Fallback approach found INMCPDF tables:", inmcpdfTables);
        console.log("Fallback approach found AM tables:", amTables);
        console.log("Fallback approach found SJ tables:", sjTables);
        console.log("Fallback approach found B3 tables:", b3Tables);
        console.log("Fallback approach found HB tables:", hbTables);
      }

      console.log("Found INACC tables:", inaccTables);
      console.log("Found INMCPDF tables:", inmcpdfTables);
      console.log("Found AM tables:", amTables);
      console.log("Found HB tables (before filtering):", hbTables);

      // Additional safety filter: ensure HB tables are yearly format only (HB_YYYY)
      hbTables = hbTables.filter((tableName) => {
        const match = tableName.match(/^HB_(\d+)$/);
        const isYearlyFormat = match && match[1].length === 4;
        if (!isYearlyFormat) {
          console.log(`Filtering out non-yearly HB table: ${tableName}`);
        }
        return isYearlyFormat;
      });

      console.log("Found HB tables (after filtering):", hbTables);

      if (
        inaccTables.length === 0 &&
        inmcpdfTables.length === 0 &&
        amTables.length === 0
      ) {
        console.warn("No INACC, INMCPDF, or AM tables found");
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

      // Fetch data from each AM table
      const amDataPromises = amTables.map(async (tableName: string) => {
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
      });

      // Fetch data from each SJ table
      const sjDataPromises = sjTables.map(async (tableName: string) => {
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
      });

      // Fetch data from each B3 table
      const b3DataPromises = b3Tables.map(async (tableName: string) => {
        try {
          const { data: transactions, error } = await supabase
            .from(tableName)
            .select('"Date", "Amount"')
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
      });

      // Fetch data from each HB table (yearly tables)
      const hbDataPromises = hbTables.map(async (tableName: string) => {
        try {
          const { data: transactions, error } = await supabase
            .from(tableName)
            .select('"Date", "Amount", "Category", "Balance"')
            .eq("user_id", user.id)
            .order('"Date"', { ascending: false });

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
      });

      const [
        inaccResults,
        inmcpdfResults,
        amResults,
        sjResults,
        b3Results,
        hbResults,
      ] = await Promise.all([
        Promise.all(inaccDataPromises),
        Promise.all(inmcpdfDataPromises),
        Promise.all(amDataPromises),
        Promise.all(sjDataPromises),
        Promise.all(b3DataPromises),
        Promise.all(hbDataPromises),
      ]);

      // Group transactions by month and calculate totals
      const monthlyInaccTotals: Record<string, number> = {};
      const monthlyInmcpdfTotals: Record<string, number> = {};
      const monthlyAmTotals: Record<string, number> = {};
      const monthlySjTotals: Record<string, number> = {};
      const monthlyB3Totals: Record<string, number> = {};
      const monthlyHbTotals: Record<string, number> = {};
      const monthlyHbInvestTotals: Record<string, number> = {};

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

      amResults.forEach((result) => {
        if (result.transactions && result.transactions.length > 0) {
          // Extract year-month from table name (AM_YYYYMM)
          const match = result.tableName.match(/AM_(\d{4})(\d{2})/);
          if (match) {
            const year = match[1];
            const month = match[2];
            const monthKey = `${year}-${month}`;

            // Calculate total for this month, excluding "Pagamento fatura anterior"
            // Invert the sign since expenses show as positive in invoices
            const total = -(result.transactions as Transaction[])
              .filter(
                (transaction) =>
                  transaction.Category !== "Pagamento fatura anterior",
              )
              .reduce((sum, transaction) => sum + (transaction.Amount || 0), 0);

            monthlyAmTotals[monthKey] = total;
          }
        }
      });

      sjResults.forEach((result) => {
        if (result.transactions && result.transactions.length > 0) {
          // Extract year-month from table name (SJ_YYYYMM)
          const match = result.tableName.match(/SJ_(\d{4})(\d{2})/);
          if (match) {
            const year = match[1];
            const month = match[2];
            const monthKey = `${year}-${month}`;

            // Calculate total for this month, excluding "Pagamento fatura anterior"
            // Invert the sign since expenses show as positive in invoices
            const total = -(result.transactions as Transaction[])
              .filter(
                (transaction) =>
                  transaction.Category !== "Pagamento fatura anterior",
              )
              .reduce((sum, transaction) => sum + (transaction.Amount || 0), 0);

            monthlySjTotals[monthKey] = total;
          }
        }
      });

      b3Results.forEach((result) => {
        if (result.transactions && result.transactions.length > 0) {
          // Extract year-month from table name (B3_YYYYMM)
          const match = result.tableName.match(/B3_(\d{4})(\d{2})/);
          if (match) {
            const year = match[1];
            const month = match[2];
            const monthKey = `${year}-${month}`;

            // Calculate total for this month
            const total = (result.transactions as Transaction[]).reduce(
              (sum, transaction) => sum + (transaction.Amount || 0),
              0,
            );

            monthlyB3Totals[monthKey] = total;
          }
        }
      });

      // Process HB (Handelsbanken) results - yearly table with transactions
      const yearlyHbBalances: Record<number, number> = {};

      hbResults.forEach((result) => {
        console.log(
          `Processing HB table: ${result.tableName}, transactions count: ${result.transactions?.length || 0}`,
        );

        if (result.transactions && result.transactions.length > 0) {
          // Extract year from table name and get latest balance (first transaction since ordered by date desc)
          const yearMatch = result.tableName.match(/HB_(\d{4})/);
          if (yearMatch && result.transactions[0]?.Balance !== undefined) {
            const tableYear = parseInt(yearMatch[1]);
            yearlyHbBalances[tableYear] = result.transactions[0].Balance;
            console.log(
              `Latest balance for ${result.tableName}: ${result.transactions[0].Balance}`,
            );
          }
          // HB tables are yearly (HB_YYYY), so we need to group by month from Date field
          (result.transactions as Transaction[]).forEach(
            (transaction, index) => {
              if (transaction.Date) {
                // Extract year-month from the Date field (YYYY-MM-DD)
                const dateMatch = transaction.Date.match(/^(\d{4})-(\d{2})/);
                if (dateMatch) {
                  const transYear = dateMatch[1];
                  const transMonth = dateMatch[2];
                  const monthKey = `${transYear}-${transMonth}`;
                  const amount = transaction.Amount || 0;

                  // Check if this is an Investment transaction
                  if (transaction.Category === "Investment") {
                    // Add to Investment totals (as positive value)
                    if (!monthlyHbInvestTotals[monthKey]) {
                      monthlyHbInvestTotals[monthKey] = 0;
                    }
                    monthlyHbInvestTotals[monthKey] += Math.abs(amount);

                    // Also add to account totals (as negative - money leaving account)
                    if (!monthlyHbTotals[monthKey]) {
                      monthlyHbTotals[monthKey] = 0;
                    }
                    monthlyHbTotals[monthKey] += amount; // Keep as negative

                    // Log investment transactions
                    if (index < 5 || index >= result.transactions!.length - 5) {
                      console.log(
                        `  HB Investment [${index}]: Date=${transaction.Date}, Amount=${amount}, Category=${transaction.Category}, MonthKey=${monthKey}, AccTotal=${monthlyHbTotals[monthKey]}, InvestTotal=${monthlyHbInvestTotals[monthKey]}`,
                      );
                    }
                  } else {
                    // Add to regular account totals
                    if (!monthlyHbTotals[monthKey]) {
                      monthlyHbTotals[monthKey] = 0;
                    }
                    monthlyHbTotals[monthKey] += amount;

                    // Log first 5 and last 5 regular transactions
                    if (index < 5 || index >= result.transactions!.length - 5) {
                      console.log(
                        `  HB Account [${index}]: Date=${transaction.Date}, Amount=${amount}, Category=${transaction.Category || "None"}, MonthKey=${monthKey}, AccTotal=${monthlyHbTotals[monthKey]}`,
                      );
                    }
                  }
                } else {
                  console.warn(
                    `  HB Transaction date format invalid: ${transaction.Date}`,
                  );
                }
              } else {
                console.warn(`  HB Transaction missing date at index ${index}`);
              }
            },
          );

          console.log(
            `HB Monthly Account Totals after processing ${result.tableName}:`,
            monthlyHbTotals,
          );
          console.log(
            `HB Monthly Investment Totals after processing ${result.tableName}:`,
            monthlyHbInvestTotals,
          );
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

      console.log(
        "Final monthly HB Account totals before creating data array:",
        monthlyHbTotals,
      );
      console.log(
        "Final monthly HB Investment totals before creating data array:",
        monthlyHbInvestTotals,
      );

      const monthlyDataArray: MonthlyData[] = allMonths.map(
        (monthName, index) => {
          // Create month key in format YYYY-MM
          const monthNumber = String(index + 1).padStart(2, "0");
          const monthKey = `${year}-${monthNumber}`;

          const interAccTotal = monthlyInaccTotals[monthKey] || 0;
          const interCreditCardTotal = monthlyInmcpdfTotals[monthKey] || 0;
          const amexCreditCardTotal = monthlyAmTotals[monthKey] || 0;
          const sjPrioCreditCardTotal = monthlySjTotals[monthKey] || 0;
          const b3Total = monthlyB3Totals[monthKey] || 0;
          const hbAccTotal = monthlyHbTotals[monthKey] || 0;
          const hbInvestTotal = monthlyHbInvestTotals[monthKey] || 0;

          console.log(
            `Month ${monthName} (${monthKey}): HB Acc = ${hbAccTotal}, HB Invest = ${hbInvestTotal}`,
          );

          return {
            month: monthName,
            interAcc: interAccTotal,
            interCreditCard: interCreditCardTotal,
            b3: b3Total,
            ricoCreditCard: 0,
            fgts: 0,
            mae: 0,
            handelsbankenAcc: hbAccTotal,
            handelsbankenInvest: hbInvestTotal,
            amexCreditCard: amexCreditCardTotal,
            sjPrioCreditCard: sjPrioCreditCardTotal,
            total:
              interAccTotal +
              interCreditCardTotal +
              amexCreditCardTotal +
              sjPrioCreditCardTotal +
              b3Total +
              hbAccTotal +
              hbInvestTotal,
          };
        },
      );

      console.log(
        `Processed ${monthlyDataArray.length} months of data from ${inaccTables.length} INACC tables, ${inmcpdfTables.length} INMCPDF tables, ${amTables.length} AM tables, ${sjTables.length} SJ tables, ${b3Tables.length} B3 tables, and ${hbTables.length} HB tables`,
      );
      console.log("Yearly HB Balances:", yearlyHbBalances);

      // Calculate yearly investment total from monthly data
      const yearlyInvestTotal = monthlyDataArray.reduce(
        (sum, month) => sum + month.handelsbankenInvest,
        0,
      );
      const yearlyInvestTotalsObj: Record<number, number> = {
        [year]: yearlyInvestTotal,
      };
      console.log("Yearly HB Investment Total:", yearlyInvestTotalsObj);

      setData(monthlyDataArray);
      setYearlyBalances(yearlyHbBalances);
      setYearlyInvestTotals(yearlyInvestTotalsObj);
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
    yearlyBalances,
    yearlyInvestTotals,
    loading,
    error,
    refetch,
  };
}
