"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import TransactionTable from "@/components/ui/transaction/TransactionTable";
import UpdateAggregatedButton from "@/components/UpdateAggregatedButton";
import { Transaction } from "@/types/transaction";

export default function Home() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        try {
          // Fetch from IN_2024 table
          const { data: data2024, error: error2024 } = await supabase
            .from("IN_2024")
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

          // Fetch from IN_2025 table
          const { data: data2025, error: error2025 } = await supabase
            .from("IN_2025")
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

          if (error2024 || error2025) {
            console.error(
              "Error fetching transactions:",
              error2024 || error2025,
            );
          } else {
            // Combine data from both tables
            const combinedData = [...(data2024 || []), ...(data2025 || [])];
            setTransactions(combinedData as Transaction[]);
          }
        } catch (error) {
          console.error("Error fetching transactions:", error);
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
        </h1>
        {/* Data Source Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Data Sources</h2>
          <p className="text-sm text-gray-700">
            This page displays transaction data from the following Supabase
            tables:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
            <li>
              <strong>IN_2024</strong> - Inter account transactions for year
              2024
            </li>
            <li>
              <strong>IN_2025</strong> - Inter account transactions for year
              2025
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            Total transactions loaded: {transactions.length}
          </p>
        </div>
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
