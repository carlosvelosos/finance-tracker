import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../supabaseClient";

export interface SupabaseTable {
  table_name: string;
  table_type: string;
  is_insertable_into: string;
}

export interface TableInfo {
  name: string;
  displayName: string;
  description: string;
  isSelected: boolean;
  transactionCount?: number;
  newestDate?: string;
  uniqueBanks?: string[];
}

export function useSupabaseTables() {
  const { user } = useAuth();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Predefined tables with descriptions (add more as needed)
  const knownTables = useMemo(
    () =>
      ({
        Sweden_transactions_agregated_2025: {
          displayName: "Sweden 2025",
          description:
            "Swedish bank transactions aggregated for 2025 (Handelsbanken, American Express, SEB SJ Prio)",
        },
        Brasil_transactions_agregated_2025: {
          displayName: "Brasil 2025",
          description:
            "Brazilian bank transactions aggregated for 2025 (Inter Black)",
        },
        Brasil_transactions_agregated_2024: {
          displayName: "Brasil 2024",
          description:
            "Brazilian bank transactions aggregated for 2024 (Inter Black)",
        },
        IN_ALL: {
          displayName: "Inter All",
          description: "All Inter bank transaction data consolidated",
        },
        // INMC Monthly Tables - 2024
        INMC_202401: {
          displayName: "INMC Jan 2024",
          description: "Inter MasterCard transactions for January 2024",
        },
        INMC_202402: {
          displayName: "INMC Feb 2024",
          description: "Inter MasterCard transactions for February 2024",
        },
        INMC_202403: {
          displayName: "INMC Mar 2024",
          description: "Inter MasterCard transactions for March 2024",
        },
        INMC_202404: {
          displayName: "INMC Apr 2024",
          description: "Inter MasterCard transactions for April 2024",
        },
        INMC_202405: {
          displayName: "INMC May 2024",
          description: "Inter MasterCard transactions for May 2024",
        },
        INMC_202406: {
          displayName: "INMC Jun 2024",
          description: "Inter MasterCard transactions for June 2024",
        },
        INMC_202407: {
          displayName: "INMC Jul 2024",
          description: "Inter MasterCard transactions for July 2024",
        },
        INMC_202408: {
          displayName: "INMC Aug 2024",
          description: "Inter MasterCard transactions for August 2024",
        },
        INMC_202409: {
          displayName: "INMC Sep 2024",
          description: "Inter MasterCard transactions for September 2024",
        },
        INMC_202410: {
          displayName: "INMC Oct 2024",
          description: "Inter MasterCard transactions for October 2024",
        },
        INMC_202411: {
          displayName: "INMC Nov 2024",
          description: "Inter MasterCard transactions for November 2024",
        },
        INMC_202412: {
          displayName: "INMC Dec 2024",
          description: "Inter MasterCard transactions for December 2024",
        },
        // INMC Monthly Tables - 2025
        INMC_202501: {
          displayName: "INMC Jan 2025",
          description: "Inter MasterCard transactions for January 2025",
        },
        INMC_202502: {
          displayName: "INMC Feb 2025",
          description: "Inter MasterCard transactions for February 2025",
        },
        INMC_202503: {
          displayName: "INMC Mar 2025",
          description: "Inter MasterCard transactions for March 2025",
        },
        INMC_202504: {
          displayName: "INMC Apr 2025",
          description: "Inter MasterCard transactions for April 2025",
        },
        INMC_202505: {
          displayName: "INMC May 2025",
          description: "Inter MasterCard transactions for May 2025",
        },
        INMC_202506: {
          displayName: "INMC Jun 2025",
          description: "Inter MasterCard transactions for June 2025",
        },
        INMC_202507: {
          displayName: "INMC Jul 2025",
          description: "Inter MasterCard transactions for July 2025",
        },
        INMC_202508: {
          displayName: "INMC Aug 2025",
          description: "Inter MasterCard transactions for August 2025",
        },
        INMC_202509: {
          displayName: "INMC Sep 2025",
          description: "Inter MasterCard transactions for September 2025",
        },
        // INMCPDF Monthly Tables - 2024 (PDF-converted statements)
        INMCPDF_202401: {
          displayName: "INMCPDF Jan 2024",
          description:
            "Inter MasterCard PDF-converted transactions for January 2024",
        },
        INMCPDF_202402: {
          displayName: "INMCPDF Feb 2024",
          description:
            "Inter MasterCard PDF-converted transactions for February 2024",
        },
        INMCPDF_202403: {
          displayName: "INMCPDF Mar 2024",
          description:
            "Inter MasterCard PDF-converted transactions for March 2024",
        },
        INMCPDF_202404: {
          displayName: "INMCPDF Apr 2024",
          description:
            "Inter MasterCard PDF-converted transactions for April 2024",
        },
        INMCPDF_202405: {
          displayName: "INMCPDF May 2024",
          description:
            "Inter MasterCard PDF-converted transactions for May 2024",
        },
        INMCPDF_202406: {
          displayName: "INMCPDF Jun 2024",
          description:
            "Inter MasterCard PDF-converted transactions for June 2024",
        },
        INMCPDF_202407: {
          displayName: "INMCPDF Jul 2024",
          description:
            "Inter MasterCard PDF-converted transactions for July 2024",
        },
        INMCPDF_202408: {
          displayName: "INMCPDF Aug 2024",
          description:
            "Inter MasterCard PDF-converted transactions for August 2024",
        },
        INMCPDF_202409: {
          displayName: "INMCPDF Sep 2024",
          description:
            "Inter MasterCard PDF-converted transactions for September 2024",
        },
        INMCPDF_202410: {
          displayName: "INMCPDF Oct 2024",
          description:
            "Inter MasterCard PDF-converted transactions for October 2024",
        },
        INMCPDF_202411: {
          displayName: "INMCPDF Nov 2024",
          description:
            "Inter MasterCard PDF-converted transactions for November 2024",
        },
        INMCPDF_202412: {
          displayName: "INMCPDF Dec 2024",
          description:
            "Inter MasterCard PDF-converted transactions for December 2024",
        },
        // INMCPDF Monthly Tables - 2025 (PDF-converted statements)
        INMCPDF_202501: {
          displayName: "INMCPDF Jan 2025",
          description:
            "Inter MasterCard PDF-converted transactions for January 2025",
        },
        INMCPDF_202502: {
          displayName: "INMCPDF Feb 2025",
          description:
            "Inter MasterCard PDF-converted transactions for February 2025",
        },
        INMCPDF_202503: {
          displayName: "INMCPDF Mar 2025",
          description:
            "Inter MasterCard PDF-converted transactions for March 2025",
        },
        INMCPDF_202504: {
          displayName: "INMCPDF Apr 2025",
          description:
            "Inter MasterCard PDF-converted transactions for April 2025",
        },
        INMCPDF_202505: {
          displayName: "INMCPDF May 2025",
          description:
            "Inter MasterCard PDF-converted transactions for May 2025",
        },
        INMCPDF_202506: {
          displayName: "INMCPDF Jun 2025",
          description:
            "Inter MasterCard PDF-converted transactions for June 2025",
        },
        INMCPDF_202507: {
          displayName: "INMCPDF Jul 2025",
          description:
            "Inter MasterCard PDF-converted transactions for July 2025",
        },
        INMCPDF_202508: {
          displayName: "INMCPDF Aug 2025",
          description:
            "Inter MasterCard PDF-converted transactions for August 2025",
        },
        INMCPDF_202509: {
          displayName: "INMCPDF Sep 2025",
          description:
            "Inter MasterCard PDF-converted transactions for September 2025",
        },
        INMCPDF_202510: {
          displayName: "INMCPDF Oct 2025",
          description:
            "Inter MasterCard PDF-converted transactions for October 2025",
        },
      }) as Record<string, { displayName: string; description: string }>,
    [],
  );

  const fetchAvailableTables = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Try using RPC call to a custom PostgreSQL function first
      // This function would need to be created in Supabase SQL editor:
      /*
      CREATE OR REPLACE FUNCTION get_user_accessible_tables()
      RETURNS TABLE(table_name text, row_count bigint) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          t.table_name::text,
          (SELECT count(*) FROM information_schema.tables ist WHERE ist.table_name = t.table_name)::bigint as row_count
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND (t.table_name LIKE '%transaction%' OR t.table_name = 'IN_ALL');
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      */

      let transactionTables: TableInfo[] = [];

      // First, try the RPC approach
      try {
        const { data: rpcTables, error: rpcError } = await supabase.rpc(
          "get_user_accessible_tables",
        );

        if (!rpcError && rpcTables) {
          console.log("Successfully fetched tables via RPC:", rpcTables);
          transactionTables = rpcTables.map(
            (table: { table_name: string }) => ({
              name: table.table_name,
              displayName:
                knownTables[table.table_name]?.displayName || table.table_name,
              description:
                knownTables[table.table_name]?.description ||
                `Transaction data from ${table.table_name}`,
              isSelected: false,
              transactionCount: undefined,
              newestDate: undefined,
              uniqueBanks: undefined,
            }),
          );
        } else {
          console.warn("RPC function not available:", rpcError?.message);
          throw new Error("RPC function not available");
        }
      } catch (rpcErr) {
        console.warn("RPC approach failed, trying fallback approach:", rpcErr);

        // Fallback: Try to query known tables directly to see which exist
        const knownTableNames = Object.keys(knownTables);
        const tableExistenceTests = await Promise.all(
          knownTableNames.map(async (tableName) => {
            try {
              // Try to get table schema/structure instead of data
              const { error } = await supabase
                .from(tableName)
                .select("*", { count: "exact", head: true })
                .limit(0);

              return error
                ? null
                : {
                    name: tableName,
                    displayName: knownTables[tableName].displayName,
                    description: knownTables[tableName].description,
                    isSelected: false,
                    transactionCount: undefined,
                    newestDate: undefined,
                    uniqueBanks: undefined,
                  };
            } catch (err) {
              console.warn(`Table ${tableName} not accessible:`, err);
              return null;
            }
          }),
        );

        transactionTables = tableExistenceTests.filter(
          (table) => table !== null,
        ) as TableInfo[];
        console.log(
          "Fallback approach found tables:",
          transactionTables.map((t) => t.name),
        );
      }

      // Fetch metadata for each table
      const tablesWithMetadata = await Promise.all(
        transactionTables.map(async (table) => {
          try {
            // Get count and sample data
            const { data: sampleData, error: sampleError } = await supabase
              .from(table.name)
              .select("id, Date, Bank, user_id")
              .eq("user_id", user.id)
              .limit(1000); // Limit for performance

            if (sampleError) {
              console.warn(
                `Error fetching sample data from ${table.name}:`,
                sampleError,
              );
              return table;
            }

            const transactionCount = sampleData?.length || 0;
            const uniqueBanks = [
              ...new Set(
                sampleData
                  ?.map((item) => item.Bank)
                  .filter((bank): bank is string => Boolean(bank)),
              ),
            ];

            // Get newest date
            let newestDate: string | undefined;
            if (sampleData && sampleData.length > 0) {
              const dates = sampleData
                .map((item) => item.Date)
                .filter((date): date is string => Boolean(date))
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

              newestDate = dates[0];
            }

            return {
              ...table,
              transactionCount,
              newestDate,
              uniqueBanks,
            };
          } catch (err) {
            console.warn(`Error processing table ${table.name}:`, err);
            return table;
          }
        }),
      );

      setTables(tablesWithMetadata);
    } catch (err) {
      console.error("Error fetching Supabase tables:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
    } finally {
      setLoading(false);
    }
  }, [user, knownTables]);

  useEffect(() => {
    fetchAvailableTables();
  }, [user, knownTables, fetchAvailableTables]);

  const toggleTableSelection = useCallback((tableName: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((name) => name !== tableName)
        : [...prev, tableName],
    );

    setTables((prev) =>
      prev.map((table) =>
        table.name === tableName
          ? { ...table, isSelected: !table.isSelected }
          : table,
      ),
    );
  }, []);

  const selectAllTables = useCallback(() => {
    const allTableNames = tables.map((table) => table.name);
    setSelectedTables(allTableNames);
    setTables((prev) => prev.map((table) => ({ ...table, isSelected: true })));
  }, [tables]);

  const deselectAllTables = useCallback(() => {
    setSelectedTables([]);
    setTables((prev) => prev.map((table) => ({ ...table, isSelected: false })));
  }, []);

  const refetch = useCallback(async () => {
    await fetchAvailableTables();
  }, [fetchAvailableTables]);

  return {
    tables,
    selectedTables,
    loading,
    error,
    toggleTableSelection,
    selectAllTables,
    deselectAllTables,
    refetch,
    user,
  };
}
