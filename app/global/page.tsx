"use client";

import { useGlobalTransactionsWithProcessing } from "../../lib/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import TransactionTable from "@/components/ui/transaction/TransactionTable";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function Home() {
  const { transactions, loading, error, user } =
    useGlobalTransactionsWithProcessing();

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
                    ),
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
                    t.Category === "SJ PRIO MASTER Invoice",
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
                  (t) => t.Category === "Investment",
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
                  (t) => t.Category === "Sek to Reais",
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
                    t.Category === "Income - Skat",
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
