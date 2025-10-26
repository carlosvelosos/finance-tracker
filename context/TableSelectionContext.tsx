"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSupabaseTables } from "@/lib/hooks/useSupabaseTables";
import { TableInfo } from "@/lib/hooks/useSupabaseTables";

interface TableSelectionContextType {
  // Table discovery and selection
  tables: TableInfo[];
  selectedTables: string[];
  loading: boolean;
  error: Error | null;
  toggleTableSelection: (tableName: string) => void;
  selectAllTables: () => void;
  deselectAllTables: () => void;
  refetch: () => Promise<void>;
  user: any;
}

const TableSelectionContext = createContext<
  TableSelectionContextType | undefined
>(undefined);

const STORAGE_KEY = "global2_selected_tables";

export function TableSelectionProvider({ children }: { children: ReactNode }) {
  const baseTableData = useSupabaseTables();

  // Initialize from localStorage if available
  const [persistentSelectedTables, setPersistentSelectedTables] = useState<
    string[]
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved table selection:", e);
        }
      }
    }
    return [];
  });

  // Save to localStorage whenever selection changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(persistentSelectedTables),
      );
    }
  }, [persistentSelectedTables]);

  // Save to localStorage whenever selection changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(persistentSelectedTables),
      );
    }
  }, [persistentSelectedTables]);

  // When tables are loaded, apply persistent selection to base hook
  useEffect(() => {
    if (
      baseTableData.tables.length > 0 &&
      persistentSelectedTables.length > 0
    ) {
      // Find which tables need to be selected
      const currentlySelected = baseTableData.selectedTables;
      const shouldBeSelected = persistentSelectedTables.filter((tableName) =>
        baseTableData.tables.some((t) => t.name === tableName),
      );

      // Toggle tables that should be selected but aren't
      shouldBeSelected.forEach((tableName) => {
        if (!currentlySelected.includes(tableName)) {
          baseTableData.toggleTableSelection(tableName);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTableData.tables.length]); // Only run when tables are loaded

  // Sync with the base hook's initial state (only if we don't have persistent data)
  useEffect(() => {
    if (
      baseTableData.selectedTables.length > 0 &&
      persistentSelectedTables.length === 0
    ) {
      setPersistentSelectedTables(baseTableData.selectedTables);
    }
  }, [baseTableData.selectedTables, persistentSelectedTables.length]);

  // Custom toggle function that updates our persistent state
  const toggleTableSelection = useCallback(
    (tableName: string) => {
      setPersistentSelectedTables((prev) =>
        prev.includes(tableName)
          ? prev.filter((name) => name !== tableName)
          : [...prev, tableName],
      );
      // Also call the original to keep tables' isSelected in sync
      baseTableData.toggleTableSelection(tableName);
    },
    [baseTableData],
  );

  // Custom select all
  const selectAllTables = useCallback(() => {
    const allTableNames = baseTableData.tables.map((table) => table.name);
    setPersistentSelectedTables(allTableNames);
    baseTableData.selectAllTables();
  }, [baseTableData]);

  // Custom deselect all
  const deselectAllTables = useCallback(() => {
    setPersistentSelectedTables([]);
    baseTableData.deselectAllTables();
  }, [baseTableData]);

  // Update tables to reflect persistent selection
  const tablesWithPersistentSelection = baseTableData.tables.map((table) => ({
    ...table,
    isSelected: persistentSelectedTables.includes(table.name),
  }));

  const contextValue: TableSelectionContextType = {
    ...baseTableData,
    tables: tablesWithPersistentSelection,
    selectedTables: persistentSelectedTables,
    toggleTableSelection,
    selectAllTables,
    deselectAllTables,
  };

  return (
    <TableSelectionContext.Provider value={contextValue}>
      {children}
    </TableSelectionContext.Provider>
  );
}

export function useTableSelection() {
  const context = useContext(TableSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useTableSelection must be used within a TableSelectionProvider",
    );
  }
  return context;
}
