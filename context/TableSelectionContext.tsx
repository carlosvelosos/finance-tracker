"use client";

import React, { createContext, useContext, ReactNode } from "react";
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

export function TableSelectionProvider({ children }: { children: ReactNode }) {
  const tableSelectionData = useSupabaseTables();

  return (
    <TableSelectionContext.Provider value={tableSelectionData}>
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
