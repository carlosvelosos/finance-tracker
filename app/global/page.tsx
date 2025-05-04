"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import TransactionTable from "@/components/ui/transaction/TransactionTable";
import { Transaction } from "@/types/transaction";

export default function Home() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        const { data, error } = await supabase
          .from("Sweden_transactions_agregated_2025")
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
          `
          )
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching transactions:", error);
        } else {
          setTransactions(data as Transaction[]);
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
          Your Transactions
        </h1>

        {/* Category Chart */}
        <div className="text-right mb-4">
          <Button
            onClick={() => (window.location.href = "./chart")}
            className="px-4 py-2 text-white rounded-md hover:bg-gray-300"
          >
            Go to Chart Page
          </Button>
        </div>

        {/* Use the new TransactionTable component */}
        <TransactionTable
          transactions={transactions}
          initialSortColumn="ChronologicalDate"
          initialSortDirection="desc"
          hiddenColumns={["Balance", "Date"]} // Hide Balance and Date columns, showing Year/Month/Day instead
          showMonthFilter={true}
          showCategoryFilter={true}
          showDescriptionFilter={true}
          showTotalAmount={true}
        />
      </div>
    </ProtectedRoute>
  );
}
