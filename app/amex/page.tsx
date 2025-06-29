"use client";

import { useAmexTransactions } from "../../lib/hooks/useTransactions";
import { usePageState } from "../../lib/hooks/usePageState";
import ProtectedRoute from "@/components/protected-route";
import TransactionTable from "@/components/ui/transaction/TransactionTable";
import UpdateAmexAggregatedButton from "@/components/UpdateAmexAggregatedButton";
import BankTablePageHeader from "@/components/ui/bank-table-page-header";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function Home() {
  const { transactions, loading, error, user } = useAmexTransactions();
  const { renderContent } = usePageState({
    loading,
    error: error as unknown,
    user,
  });

  // Return early if not ready
  const earlyReturn = renderContent();
  if (earlyReturn) return earlyReturn;

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <BankTablePageHeader
          title="American Express Transactions"
          updateButtonComponent={<UpdateAmexAggregatedButton />}
          downloadUrl="https://www.americanexpress.com/en-us/account/login?inav=iNavLnkLog"
          downloadButtonText="Download Invoice"
          chartUrl="./chart"
          chartButtonText="Go to Chart Page"
        />

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
