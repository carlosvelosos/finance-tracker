"use client";

import { useAmexTransactions } from "../../lib/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import TransactionTable from "@/components/ui/transaction/TransactionTable";
import UpdateAmexAggregatedButton from "@/components/UpdateAmexAggregatedButton";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function Home() {
  const { transactions, loading, error, user } = useAmexTransactions();

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
          American Express Transactions
        </h1>{" "}
        {/* Category Chart and Login Buttons */}
        <div className="text-right mb-4 flex justify-end gap-3">
          <UpdateAmexAggregatedButton />
          <Button
            onClick={() =>
              window.open(
                "https://www.americanexpress.com/en-us/account/login?inav=iNavLnkLog",
                "_blank",
              )
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
                excludeCategories={["Amex Invoice"]} // Exclude Invoice category
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
                    t.Category === "Amex Invoice" &&
                    t.Bank === "American Express",
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
