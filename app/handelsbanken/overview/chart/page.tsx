"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useAuth } from "../../../../context/AuthContext";
import { CustomBarChart } from "@/components/ui/custombarchart";
import { TransactionLineChart } from "@/components/ui/bank-line-chart";
import ProtectedRoute from "@/components/protected-route";

type Transaction = {
  id: number;
  Category: string | null;
  Amount: number | null;
  Bank: string | null;
  Description: string | null;
  Date: string | null;
};

export default function CategoryChartPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        const { data, error } = await supabase
          .from("Sweden_transactions_agregated_2025")
          .select("id, Category, Amount, Bank, Description, Date") // Include Date in the query
          .eq("user_id", user.id)
          .eq("Bank", "Handelsbanken");

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
      <div className="text-center mt-10">Please log in to view the chart.</div>
    );
  }

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="flex flex-col items-center justify-center min-h-screen space-y-50">
        <div className="pt-50 w-full max-w-5xl">
          <TransactionLineChart
            transactions={transactions}
            title="Handelsbanken Cumulative Flow"
            description="Showing cumulative income and expenses over time"
          />
        </div>

        <div className="pb-8 w-full max-w-5xl">
          <CustomBarChart
            data={transactions}
            barColor="hsl(var(--chart-1))"
            title="Total Amount per Category"
            description="Showing totals for Handelsbanken transactions"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
