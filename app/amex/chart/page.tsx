"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import { CustomBarChart } from "@/components/ui/custombarchart";
import ProtectedRoute from "@/components/protected-route";

type Transaction = {
  id: number;
  Category: string | null;
  Amount: number | null;
  Bank: string | null;
  Description: string | null;
  Date: string | null; // Add Date field to match the expected type in CustomBarChart
};

export default function CategoryChartPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        const { data, error } = await supabase
          .from("Sweden_transactions_agregated_2025")
          .select("id, Category, Amount, Bank, Description, Date") // Added id and Date fields
          .eq("user_id", user.id)
          .eq("Bank", "American Express"); // Filter by Bank = American Express

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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="pt-8 pb-8">
          <CustomBarChart
            // data={transactions} // Pass raw transaction data
            data={transactions.filter(
              (t) =>
                !(
                  t.Category === "Amex Invoice" ||
                  t.Category === "SEB SJ Prio Invoice" ||
                  t.Category === "Investment" ||
                  t.Category === "Sek to Reais" ||
                  t.Category === "SJ PRIO MASTER Invoice" ||
                  t.Category === "Income - Salary" ||
                  t.Category === "Income - Skat"
                )
            )}
            // height={400}
            barColor="hsl(var(--chart-1))"
            title="Total Amount per Category"
            description="Showing totals for American Express transactions"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
