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
          Your Transactions
        </h1>

        {/* Category Chart */}
        <div className="text-right mb-4">
          <Button
            onClick={() => (window.location.href = "./chart")}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-green-700 border border-green-500"
          >
            Go to Chart Page
          </Button>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible defaultValue="main-table">
          {/* Main Table Section */}
          <AccordionItem value="main-table">
            <AccordionTrigger>Main Transactions</AccordionTrigger>
            <AccordionContent>
              {/* Use the TransactionTable component for all transactions */}
              <TransactionTable
                transactions={transactions.filter(
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
                initialSortColumn="ChronologicalDate"
                initialSortDirection="desc"
                hiddenColumns={["Balance", "Date"]}
                showMonthFilter={true}
                showCategoryFilter={true}
                showDescriptionFilter={true}
                showTotalAmount={true}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Credit Card Invoice Table Section */}
          <AccordionItem value="credit-card-invoice-table">
            <AccordionTrigger>Credit Card Invoices</AccordionTrigger>
            <AccordionContent>
              {/* Use the TransactionTable component for Amex invoice transactions */}
              <TransactionTable
                transactions={transactions.filter(
                  (t) =>
                    t.Category === "Amex Invoice" ||
                    t.Category === "SEB SJ Prio Invoice" ||
                    t.Category === "SJ PRIO MASTER Invoice"
                )}
                initialSortColumn="Date"
                initialSortDirection="desc"
                hiddenColumns={[]}
                showMonthFilter={false}
                showCategoryFilter={false}
                showDescriptionFilter={false}
                showFilters={false}
                showTotalAmount={true}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Inveestment Table Section */}
          <AccordionItem value="investment-table">
            <AccordionTrigger>Investment</AccordionTrigger>
            <AccordionContent>
              {/* Use the TransactionTable component for Amex invoice transactions */}
              <TransactionTable
                transactions={transactions.filter(
                  (t) => t.Category === "Investment"
                )}
                initialSortColumn="Date"
                initialSortDirection="desc"
                hiddenColumns={[]}
                showMonthFilter={false}
                showCategoryFilter={false}
                showDescriptionFilter={false}
                showFilters={false}
                showTotalAmount={true}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Sek to Reais Table Section */}
          <AccordionItem value="sek-to-reais-table">
            <AccordionTrigger>Sek to Reais</AccordionTrigger>
            <AccordionContent>
              {/* Use the TransactionTable component for Amex invoice transactions */}
              <TransactionTable
                transactions={transactions.filter(
                  (t) => t.Category === "Sek to Reais"
                )}
                initialSortColumn="Date"
                initialSortDirection="desc"
                hiddenColumns={[]}
                showMonthFilter={false}
                showCategoryFilter={false}
                showDescriptionFilter={false}
                showFilters={false}
                showTotalAmount={true}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Income Table Section */}
          <AccordionItem value="Income-table">
            <AccordionTrigger>Income</AccordionTrigger>
            <AccordionContent>
              {/* Use the TransactionTable component for Amex invoice transactions */}
              <TransactionTable
                transactions={transactions.filter(
                  (t) =>
                    t.Category === "Income - Salary" ||
                    t.Category === "Income - Skat"
                )}
                initialSortColumn="Date"
                initialSortDirection="desc"
                hiddenColumns={[]}
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
