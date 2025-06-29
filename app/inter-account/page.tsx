"use client";

import { useInterAccountTransactionsWithBankInfo } from "../../lib/hooks/useTransactions";
import { usePageState } from "../../lib/hooks/usePageState";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import TransactionTable from "@/components/ui/transaction/TransactionTable";
import UpdateAggregatedButton from "@/components/UpdateAggregatedButton";
import UpdateInterAggregatedButton from "@/components/UpdateInterAggregatedButton";
import DataSourceInfo from "@/components/ui/data-source-info";
import { Info } from "lucide-react";

export default function Home() {
  const { transactions, bankInfo, loading, error, user } =
    useInterAccountTransactionsWithBankInfo();
  const { renderContent } = usePageState({
    loading,
    error: error as unknown,
    user,
  });

  // Return early if not ready
  const earlyReturn = renderContent();
  if (earlyReturn) return earlyReturn;

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          Inter Account Transactions
        </h1>
        {/* Info button */}
        <div className="flex justify-center mb-4">
          <Button
            onClick={() => (window.location.href = "./info")}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 border border-gray-500 flex items-center gap-2"
          >
            <Info size={16} />
            Page Info & Component Guide
          </Button>
        </div>
        {/* Data Source Information */}
        <DataSourceInfo
          transactions={transactions}
          bankInfo={bankInfo}
          tableName="Brasil_transactions_agregated_2025"
          tableDescription="Aggregated transactions for Brasil accounts in 2025"
        />
        {/* Chart Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-3">
            <UpdateAggregatedButton />
            <UpdateInterAggregatedButton />
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => (window.location.href = "./category/chart")}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-green-700 border border-green-500"
            >
              Category Chart
            </Button>
            <Button
              onClick={() => (window.location.href = "./overview/chart")}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-green-700 border border-green-500"
            >
              Overview Chart
            </Button>
          </div>
        </div>{" "}
        {/* Use the new TransactionTable component */}
        <TransactionTable
          transactions={transactions}
          bankFilter="Inter-BR"
          initialSortColumn="Date"
          initialSortDirection="desc"
          hiddenColumns={[]} // Show all columns
          showMonthFilter={true}
          showCategoryFilter={true}
          showDescriptionFilter={true}
          showTotalAmount={true}
          TransactionTableName="Brasil_transactions_agregated_2025"
        />
      </div>
    </ProtectedRoute>
  );
}
