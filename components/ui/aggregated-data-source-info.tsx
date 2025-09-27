import React from "react";
import { Transaction } from "@/types/transaction";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Building2, Calendar, TrendingUp } from "lucide-react";

/**
 * Bank Information Interface for Aggregated Data
 */
interface BankInfo {
  uniqueBanks: string[];
  transactionCountsByBank: Record<string, number>;
  newestDatesByBank: Record<string, string>;
}

/**
 * Props for AggregatedDataSourceInfo Component
 */
interface AggregatedDataSourceInfoProps {
  /** Array of aggregated transaction data being displayed */
  transactions: Transaction[];
  /** Bank metadata and statistics */
  bankInfo: BankInfo;
  /** List of selected table names being aggregated */
  selectedTables: string[];
  /** Number of selected tables */
  selectedTablesCount: number;
  /** Total number of transactions across all tables */
  totalTransactions: number;
  /** Optional CSS classes for styling */
  className?: string;
}

/**
 * Aggregated Data Source Information Component
 *
 * Displays comprehensive information about aggregated data from multiple Supabase tables,
 * including source table information, transaction counts, bank distributions, and data freshness.
 * Designed specifically for multi-table aggregation scenarios.
 */
export default function AggregatedDataSourceInfo({
  transactions,
  bankInfo,
  selectedTables,
  selectedTablesCount,
  totalTransactions,
  className = "mb-6",
}: AggregatedDataSourceInfoProps) {
  // Calculate additional statistics
  const totalAmount = transactions.reduce((sum, t) => sum + (t.Amount || 0), 0);
  const sourceTables = [
    ...new Set(transactions.map((t) => t.sourceTable).filter(Boolean)),
  ];

  // Group transactions by source table for detailed breakdown
  const transactionsByTable = transactions.reduce(
    (acc, transaction) => {
      const table = transaction.sourceTable || "Unknown";
      if (!acc[table]) {
        acc[table] = 0;
      }
      acc[table]++;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Database size={20} />
          Aggregated Data Sources
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overview Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {selectedTablesCount}
            </div>
            <div className="text-xs text-blue-600">Tables Selected</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {totalTransactions.toLocaleString()}
            </div>
            <div className="text-xs text-green-600">Total Transactions</div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">
              {bankInfo.uniqueBanks.length}
            </div>
            <div className="text-xs text-purple-600">Unique Banks</div>
          </div>

          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">
              {totalAmount >= 0 ? "+" : ""}
              {totalAmount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs text-orange-600">Net Amount</div>
          </div>
        </div>

        {/* Selected Tables Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Database size={16} />
            Source Tables ({selectedTablesCount})
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTables.map((tableName) => (
              <Badge
                key={tableName}
                variant="secondary"
                className="bg-blue-100 text-blue-800"
              >
                {tableName} ({transactionsByTable[tableName] || 0})
              </Badge>
            ))}
          </div>

          {selectedTables.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No tables selected. Choose tables above to view aggregated data.
            </p>
          )}
        </div>

        {/* Bank Distribution */}
        {bankInfo.uniqueBanks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Building2 size={16} />
              Bank Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bankInfo.uniqueBanks.map((bank) => {
                const count = bankInfo.transactionCountsByBank[bank] || 0;
                const percentage =
                  totalTransactions > 0
                    ? ((count / totalTransactions) * 100).toFixed(1)
                    : "0";
                const newestDate = bankInfo.newestDatesByBank[bank];

                return (
                  <div key={bank} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {bank}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {percentage}%
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} />
                        <span>{count.toLocaleString()} transactions</span>
                      </div>

                      {newestDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>
                            Latest: {new Date(newestDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Data Quality Indicators */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Data Quality
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-gray-50 rounded text-center">
              <div className="font-medium text-gray-900">
                {transactions.filter((t) => t.Date).length}
              </div>
              <div className="text-gray-600">With Dates</div>
            </div>

            <div className="p-2 bg-gray-50 rounded text-center">
              <div className="font-medium text-gray-900">
                {transactions.filter((t) => t.Amount !== null).length}
              </div>
              <div className="text-gray-600">With Amounts</div>
            </div>

            <div className="p-2 bg-gray-50 rounded text-center">
              <div className="font-medium text-gray-900">
                {transactions.filter((t) => t.Category).length}
              </div>
              <div className="text-gray-600">Categorized</div>
            </div>

            <div className="p-2 bg-gray-50 rounded text-center">
              <div className="font-medium text-gray-900">
                {transactions.filter((t) => t.Bank).length}
              </div>
              <div className="text-gray-600">With Bank</div>
            </div>
          </div>
        </div>

        {/* Technical Information */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <strong>Data Processing:</strong> Transactions are aggregated from
            multiple Supabase tables with automatic deduplication and amount
            adjustments applied based on source table types.
            {sourceTables.length > 0 && (
              <span> Active source tables: {sourceTables.join(", ")}.</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
