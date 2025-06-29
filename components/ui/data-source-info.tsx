import React from "react";

interface BankInfo {
  uniqueBanks: string[];
  transactionCountsByBank: Record<string, number>;
  newestDatesByBank: Record<string, string>;
}

interface DataSourceInfoProps {
  transactions: any[];
  bankInfo: BankInfo;
  tableName: string;
  tableDescription: string;
  className?: string;
}

export default function DataSourceInfo({
  transactions,
  bankInfo,
  tableName,
  tableDescription,
  className = "mb-6",
}: DataSourceInfoProps) {
  return (
    <div className={`${className} p-4 bg-gray-50 rounded-lg border`}>
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Data Sources</h2>
      <p className="text-sm text-gray-700">
        This page displays transaction data from the following Supabase table:
      </p>
      <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
        <li>
          <strong>{tableName}</strong> - {tableDescription}
        </li>
      </ul>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500">
            Total transactions loaded: {transactions.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Unique banks: {bankInfo.uniqueBanks.length} (
            {bankInfo.uniqueBanks.join(", ")})
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">
            Transaction count per bank:
          </p>
          {Object.entries(bankInfo.transactionCountsByBank).map(
            ([bank, count]) => (
              <p key={bank} className="text-xs text-gray-500">
                <strong>{bank}:</strong> {count} transactions
              </p>
            ),
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">
            Newest transaction per bank:
          </p>
          {Object.entries(bankInfo.newestDatesByBank).map(([bank, date]) => (
            <p key={bank} className="text-xs text-gray-500">
              <strong>{bank}:</strong> {new Date(date).toLocaleDateString()}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
