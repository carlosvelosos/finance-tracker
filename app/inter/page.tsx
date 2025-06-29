"use client";

import { useInAllTransactions } from "../../lib/hooks/useTransactions";
import { usePageState } from "../../lib/hooks/usePageState";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import TransactionTable from "@/components/ui/transaction/TransactionTable";

export default function Home() {
  const { transactions, loading, error, user } = useInAllTransactions();
  const { renderContent } = usePageState({
    loading,
    error: error as unknown,
    user,
  });
  const TransactionTableName = "IN_ALL";

  // Return early if not ready
  const earlyReturn = renderContent();
  if (earlyReturn) return earlyReturn;

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          Inter Transactions
        </h1>

        {/* Category Chart and Login Buttons */}
        <div className="text-right mb-4 flex justify-end gap-3">
          <Button
            onClick={() =>
              window.open("https://contadigital.inter.co/extrato", "_blank")
            }
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-green-300"
          >
            Download Invoice
          </Button>
          <Button
            onClick={() => (window.location.href = "./chart")}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-green-700 border border-green-500"
          >
            Go to Chart Page
          </Button>
        </div>

        {/* Use the new TransactionTable component */}
        <TransactionTable
          transactions={transactions}
          TransactionTableName={TransactionTableName}
          bankFilter="Inter Black"
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
