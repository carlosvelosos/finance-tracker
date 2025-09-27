"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableInfo } from "@/lib/hooks/useSupabaseTables";
import { Database, Calendar, Building2, Loader2 } from "lucide-react";

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

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Database size={20} />
            Select Tables to Aggregate
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={onSelectAll}
              variant="outline"
              size="sm"
              disabled={tables.length === selectedTables.length}
            >
              Select All
            </Button>
            <Button
              onClick={onDeselectAll}
              variant="outline"
              size="sm"
              disabled={selectedTables.length === 0}
            >
              Clear All
            </Button>
            <Button onClick={onRefresh} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>

        {selectedTables.length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">{selectedTables.length}</span> table
              {selectedTables.length === 1 ? "" : "s"} selected for aggregation
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {tables.map((table) => (
          <div
            key={table.name}
            className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
              table.isSelected
                ? "bg-blue-50 border-blue-200 shadow-sm"
                : "bg-white border-gray-200"
            }`}
            onClick={() => onToggleTable(table.name)}
          >
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={table.isSelected}
                onChange={() => onToggleTable(table.name)}
                className="mt-1"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {table.displayName}
                  </h4>
                  {table.isSelected && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-blue-100 text-blue-800"
                    >
                      Selected
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {table.description}
                </p>

                {/* Table Statistics */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {typeof table.transactionCount === "number" && (
                    <div className="flex items-center gap-1">
                      <Database size={12} />
                      <span>
                        {table.transactionCount.toLocaleString()} transactions
                      </span>
                    </div>
                  )}

                  {table.newestDate && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>
                        Latest:{" "}
                        {new Date(table.newestDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {table.uniqueBanks && table.uniqueBanks.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Building2 size={12} />
                      <span>
                        {table.uniqueBanks.length} bank
                        {table.uniqueBanks.length === 1 ? "" : "s"}:{" "}
                        {table.uniqueBanks.join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Technical Details */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-mono">
                    Table: {table.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
