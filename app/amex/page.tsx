"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import TransactionTable from "@/components/ui/transaction/TransactionTable";
import { Transaction } from "@/types/transaction";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

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
          American Express Transactions
        </h1>

        {/* Category Chart and Login Buttons */}
        <div className="text-right mb-4 flex justify-end gap-3">
          <Button
            onClick={() =>
              window.open(
                "https://www.americanexpress.com/en-us/account/login?inav=iNavLnkLog",
                "_blank"
              )
            }
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Download Invoice
          </Button>
          <Button
            onClick={() => (window.location.href = "./chart")}
            className="px-4 py-2 text-white rounded-md hover:bg-gray-300"
          >
            Go to Chart Page
          </Button>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible>
          {/* Main Table Section */}
          <AccordionItem value="main-table">
            <AccordionTrigger>Main Transactions</AccordionTrigger>
            <AccordionContent>
              {/* Use the new TransactionTable component for main transactions */}
              <TransactionTable
                transactions={transactions}
                bankFilter="American Express"
                initialSortColumn="Date"
                initialSortDirection="desc"
                hiddenColumns={[]} // Show all columns
                showMonthFilter={true}
                showCategoryFilter={true}
                showDescriptionFilter={true}
                showTotalAmount={true}
                excludeCategories={["Invoice"]} // Exclude Invoice category
              />
            </AccordionContent>
          </AccordionItem>

          {/* Invoice Table Section */}
          <AccordionItem value="invoice-table">
            <AccordionTrigger>Invoice Transactions</AccordionTrigger>
            <AccordionContent>
              {/* Use the new TransactionTable component for invoice transactions */}
              <TransactionTable
                transactions={transactions.filter(
                  (t) =>
                    t.Category === "Invoice" && t.Bank === "American Express"
                )}
                initialSortColumn="Date"
                initialSortDirection="desc"
                hiddenColumns={[]} // Show all columns
                showMonthFilter={false}
                showCategoryFilter={false}
                showDescriptionFilter={false}
                showFilters={false}
                showTotalAmount={true}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ProtectedRoute>
  );
}
