"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import TransactionTable from "@/components/ui/transaction/TransactionTable";
import UpdateAggregatedButton from "@/components/UpdateAggregatedButton";
import UpdateInterAggregatedButton from "@/components/UpdateInterAggregatedButton";
import { Transaction } from "@/types/transaction";

export default function Home() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankInfo, setBankInfo] = useState<{
    uniqueBanks: string[];
    newestDatesByBank: Record<string, string>;
    transactionCountsByBank: Record<string, number>;
  }>({
    uniqueBanks: [],
    newestDatesByBank: {},
    transactionCountsByBank: {},
  });

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        const { data, error } = await supabase
          .from("Brasil_transactions_agregated_2025")
          .select(
            `
            id,
            created_at,
            "Date",
            "Description",
            "Amount",
            "Balance",
            "Category",
            "Responsible",
            "Bank",
            "Comment",
            user_id,
            source_table
          `,
          )
          .eq("user_id", user.id);
        if (error) {
          console.error("Error fetching transactions:", error);
        } else {
          setTransactions(data as Transaction[]); // Calculate bank information
          if (data && data.length > 0) {
            const uniqueBanks = [
              ...new Set(data.map((t) => t.Bank).filter(Boolean)),
            ];
            const newestDatesByBank: Record<string, string> = {};
            const transactionCountsByBank: Record<string, number> = {};

            uniqueBanks.forEach((bank) => {
              const bankTransactions = data.filter((t) => t.Bank === bank);
              transactionCountsByBank[bank] = bankTransactions.length;
              const newestTransaction = bankTransactions.reduce(
                (newest, current) => {
                  return new Date(current.Date) > new Date(newest.Date)
                    ? current
                    : newest;
                },
              );
              newestDatesByBank[bank] = newestTransaction.Date;
            });

            setBankInfo({
              uniqueBanks,
              newestDatesByBank,
              transactionCountsByBank,
            });
          }
        }
      };

      fetchTransactions();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center mt-10">
        Please log in to view your transactions.
      </div>
    );
  }
  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          Inter Account Transactions
        </h1>{" "}
        {/* Data Source Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            Data Sources
          </h2>
          <p className="text-sm text-gray-700">
            This page displays transaction data from the following Supabase
            table:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
            <li>
              <strong>Brasil_transactions_agregated_2025</strong> - Aggregated
              transactions for Brasil accounts in 2025
            </li>
          </ul>{" "}
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
              {Object.entries(bankInfo.newestDatesByBank).map(
                ([bank, date]) => (
                  <p key={bank} className="text-xs text-gray-500">
                    <strong>{bank}:</strong>{" "}
                    {new Date(date).toLocaleDateString()}
                  </p>
                ),
              )}
            </div>
          </div>
        </div>{" "}
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
        />
      </div>
    </ProtectedRoute>
  );
}
