import React from "react";
import { Transaction } from "@/types/transaction";

/**
 * Bank Information Interface
 *
 * Contains metadata about bank accounts and their transaction data
 */
interface BankInfo {
  uniqueBanks: string[];
  transactionCountsByBank: Record<string, number>;
  newestDatesByBank: Record<string, string>;
}

/**
 * Props for DataSourceInfo Component
 */
interface DataSourceInfoProps {
  /** Array of transaction data being displayed */
  transactions: Transaction[];
  /** Bank metadata and statistics */
  bankInfo: BankInfo;
  /** Database table name being used */
  tableName: string;
  /** Human-readable description of the table */
  tableDescription: string;
  /** Optional CSS classes for styling */
  className?: string;
  /** Active bank filter (if any) to show which bank's data is currently displayed */
  activeBankFilter?: string;
}

/**
 * Data Source Information Component
 *
 * Displays comprehensive information about the data sources, transaction counts,
 * and active filters for the current page. Provides users with transparency
 * about what data they're viewing and any active filtering.
 *
 * Features:
 * - Database table information and descriptions
 * - Transaction counts per bank
 * - Active bank filter display
 * - Data freshness indicators (newest transaction dates)
 * - Responsive grid layout for different screen sizes
 *
 * @param props - DataSourceInfoProps configuration object
 * @returns {JSX.Element} Rendered data source information panel
 */
export default function DataSourceInfo({
  transactions,
  bankInfo,
  tableName,
  tableDescription,
  className = "mb-6",
  activeBankFilter,
}: DataSourceInfoProps) {
  return (
    <div className={`${className} p-4 bg-gray-50 rounded-lg border`}>
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Data Sources</h2>

      {/* Database Table Information */}
      <p className="text-sm text-gray-700">
        This page displays transaction data from the following Supabase table:
      </p>
      <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
        <li>
          <strong>{tableName}</strong> - {tableDescription}
        </li>
      </ul>

      {/* Active Filter Information */}
      {activeBankFilter && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Active Filter:</span> Showing
            transactions from{" "}
            <span className="font-semibold text-blue-900">
              {activeBankFilter}
            </span>{" "}
            only
          </p>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* General Statistics */}
        <div>
          <p className="text-xs text-gray-500">
            Total transactions loaded: {transactions.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Unique banks: {bankInfo.uniqueBanks.length} (
            {bankInfo.uniqueBanks.join(", ")})
          </p>
          {activeBankFilter && (
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Filtered transactions:{" "}
              {transactions.filter((t) => t.Bank === activeBankFilter).length}
            </p>
          )}
        </div>

        {/* Transaction Count per Bank */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">
            Transaction count per bank:
          </p>
          {Object.entries(bankInfo.transactionCountsByBank).map(
            ([bank, count]) => (
              <p
                key={bank}
                className={`text-xs ${
                  activeBankFilter === bank
                    ? "text-blue-700 font-medium bg-blue-50 px-1 rounded"
                    : "text-gray-500"
                }`}
              >
                <strong>{bank}:</strong> {count} transactions
                {activeBankFilter === bank && " (filtered)"}
              </p>
            ),
          )}
        </div>

        {/* Newest Transaction per Bank */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">
            Newest transaction per bank:
          </p>
          {Object.entries(bankInfo.newestDatesByBank).map(([bank, date]) => (
            <p
              key={bank}
              className={`text-xs ${
                activeBankFilter === bank
                  ? "text-blue-700 font-medium bg-blue-50 px-1 rounded"
                  : "text-gray-500"
              }`}
            >
              <strong>{bank}:</strong> {new Date(date).toLocaleDateString()}
              {activeBankFilter === bank && " (filtered)"}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
