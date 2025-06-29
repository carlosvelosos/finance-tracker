"use client";

import { useHandelsbankenTransactions } from "../../lib/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import TransactionTable from "@/components/ui/transaction/TransactionTable";
import UpdateAggregatedButton from "@/components/UpdateAggregatedButton";

export default function Home() {
  const { transactions, loading, error, user } = useHandelsbankenTransactions();

  if (!user) {
    return (
      <div className="text-center mt-10">
        Please log in to view your transactions.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center mt-10">Loading transactions...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error loading transactions:{" "}
        {(error as Error)?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          Handelsbanken Transactions
        </h1>{" "}
        {/* Chart Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <UpdateAggregatedButton />
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
        </div>
        {/* Use the new TransactionTable component */}
        <TransactionTable
          transactions={transactions}
          bankFilter="Handelsbanken"
          initialSortColumn="Date"
          initialSortDirection="desc"
          hiddenColumns={[]} // Show all columns
          showMonthFilter={true}
          showCategoryFilter={true}
          showDescriptionFilter={true}
          showTotalAmount={true}
        />
      </div>
    </ProtectedRoute>
  );
}
