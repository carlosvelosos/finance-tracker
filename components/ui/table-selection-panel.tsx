"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TableInfo } from "@/lib/hooks/useSupabaseTables";
import {
  Database,
  Calendar,
  Building2,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface TableSelectionPanelProps {
  tables: TableInfo[];
  selectedTables: string[];
  loading: boolean;
  error: Error | null;
  onToggleTable: (tableName: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRefresh: () => void;
  className?: string;
}

/**
 * Table Selection Panel Component
 *
 * Displays available Supabase tables and allows users to select which tables
 * to aggregate data from. Shows metadata about each table including transaction
 * counts, newest dates, and available banks.
 * Tables are grouped by bank prefix (BANK_YYYYMM pattern) with collapsible groups.
 */
export default function TableSelectionPanel({
  tables,
  selectedTables,
  loading,
  error,
  onToggleTable,
  onSelectAll,
  onDeselectAll,
  onRefresh,
  className = "",
}: TableSelectionPanelProps) {
  // Track which groups are collapsed/expanded
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const toggleGroupSelection = (groupTables: TableInfo[]) => {
    // Check if all tables in the group are selected
    const allSelected = groupTables.every((table) => table.isSelected);

    // Toggle all tables in the group
    groupTables.forEach((table) => {
      if (allSelected) {
        // If all are selected, deselect all
        if (table.isSelected) {
          onToggleTable(table.name);
        }
      } else {
        // If not all are selected, select all
        if (!table.isSelected) {
          onToggleTable(table.name);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className={`${className} p-6 bg-gray-50 rounded-lg border`}>
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span className="text-sm text-gray-600">
            Loading available tables...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${className} p-6 bg-red-50 rounded-lg border border-red-200`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Error Loading Tables
            </h3>
            <p className="text-sm text-red-700">
              {error?.message || "Unknown error occurred"}
            </p>
          </div>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div
        className={`${className} p-6 bg-yellow-50 rounded-lg border border-yellow-200`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              No Transaction Tables Found
            </h3>
            <p className="text-sm text-yellow-700">
              No transaction tables were found in your Supabase database.
            </p>
          </div>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  // Group tables by bank prefix (string before "_")
  const groupedTables = React.useMemo(() => {
    const groups = new Map<string, TableInfo[]>();

    tables.forEach((table) => {
      const match = table.name.match(/^([^_]+)_/);
      const groupName = match ? match[1] : "Other";

      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(table);
    });

    // Sort groups alphabetically and sort tables within each group
    const sortedGroups = Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupName, groupTables]) => ({
        groupName,
        tables: groupTables.sort((a, b) => a.name.localeCompare(b.name)),
      }));

    return sortedGroups;
  }, [tables]);

  // Sort tables by table name (alphabetically)
  const sortedTables = [...tables].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={className}>
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-1 mb-3">
        <Button
          onClick={onSelectAll}
          variant="outline"
          size="sm"
          disabled={tables.length === selectedTables.length}
          className="flex-1 text-xs px-2 py-1 h-7"
        >
          Select All
        </Button>
        <Button
          onClick={onDeselectAll}
          variant="outline"
          size="sm"
          disabled={selectedTables.length === 0}
          className="flex-1 text-xs px-2 py-1 h-7"
        >
          Clear
        </Button>
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="flex-1 text-xs px-2 py-1 h-7"
        >
          Refresh
        </Button>
      </div>

      {/* Selection Status */}
      {selectedTables.length > 0 && (
        <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs text-blue-800">
            <span className="font-medium">{selectedTables.length}</span> table
            {selectedTables.length === 1 ? "" : "s"} selected for aggregation
          </p>
        </div>
      )}

      {/* Grouped Tables List */}
      <div className="space-y-3">
        {groupedTables.map(({ groupName, tables: groupTables }) => {
          const isCollapsed = collapsedGroups.has(groupName);
          const selectedInGroup = groupTables.filter(
            (t) => t.isSelected,
          ).length;
          const allGroupSelected = groupTables.every((t) => t.isSelected);
          const someGroupSelected = selectedInGroup > 0 && !allGroupSelected;

          return (
            <div key={groupName} className="border rounded-lg overflow-hidden">
              {/* Group Header */}
              <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 transition-colors">
                <div
                  className="flex items-center gap-2 flex-1 cursor-pointer hover:opacity-80"
                  onClick={() => toggleGroup(groupName)}
                >
                  {isCollapsed ? (
                    <ChevronRight size={14} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-600" />
                  )}
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {groupName}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0 h-4"
                  >
                    {groupTables.length}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {selectedInGroup > 0 && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs px-1.5 py-0 h-4">
                      {selectedInGroup} selected
                    </Badge>
                  )}

                  <Checkbox
                    checked={
                      someGroupSelected ? "indeterminate" : allGroupSelected
                    }
                    onCheckedChange={(e) => {
                      toggleGroupSelection(groupTables);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="scale-90"
                    title={
                      allGroupSelected
                        ? "Deselect all in group"
                        : "Select all in group"
                    }
                  />
                </div>
              </div>

              {/* Group Tables */}
              {!isCollapsed && (
                <div className="p-2 space-y-2 bg-white dark:bg-gray-900">
                  {groupTables.map((table) => (
                    <div
                      key={table.name}
                      className={`p-2 rounded border transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        table.isSelected
                          ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 shadow-sm"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      }`}
                      onClick={() => onToggleTable(table.name)}
                    >
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          checked={table.isSelected}
                          onChange={() => onToggleTable(table.name)}
                          className="mt-0.5 scale-75"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate text-xs">
                              {table.displayName}
                            </h4>
                            {table.isSelected && (
                              <Badge
                                variant="secondary"
                                className="ml-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs px-1 py-0 h-4"
                              >
                                ✓
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-tight">
                            {table.description}
                          </p>

                          {/* Table Statistics - More Compact */}
                          <div className="space-y-1">
                            {typeof table.transactionCount === "number" && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Database size={10} />
                                <span>
                                  {table.transactionCount.toLocaleString()} txns
                                </span>
                              </div>
                            )}

                            {table.newestDate && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Calendar size={10} />
                                <span>
                                  {new Date(
                                    table.newestDate,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}

                            {table.uniqueBanks &&
                              table.uniqueBanks.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Building2 size={10} />
                                  <span>
                                    {table.uniqueBanks.length} bank
                                    {table.uniqueBanks.length === 1 ? "" : "s"}
                                  </span>
                                </div>
                              )}
                          </div>

                          {/* Technical Details - More Compact */}
                          <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-gray-400 font-mono truncate">
                              {table.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
