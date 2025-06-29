"use client";

import { useAmexTransactions } from "../../lib/hooks/useTransactions";
import { usePageState } from "../../lib/hooks/usePageState";
import ProtectedRoute from "@/components/protected-route";
import UpdateAmexAggregatedButton from "@/components/UpdateAmexAggregatedButton";
import BankTablePageHeader from "@/components/ui/bank-table-page-header";
import BankTablePageBody from "@/components/ui/bank-table-page-body";
import DataSourceInfo from "@/components/ui/data-source-info";

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

  // Create bankInfo for DataSourceInfo component
  const bankInfo = {
    uniqueBanks: ["American Express"],
    transactionCountsByBank: { "American Express": transactions.length },
    newestDatesByBank: {
      "American Express":
        transactions.length > 0
          ? transactions.reduce(
              (latest, t) => (t.Date && t.Date > latest ? t.Date : latest),
              transactions[0]?.Date || "",
            )
          : "",
    },
  };

  // Define the sections for the accordion
  const tableSections = [
    {
      id: "main-table",
      title: "Main Transactions",
      transactions: transactions,
      bankFilter: "American Express",
      initialSortColumn: "Date",
      initialSortDirection: "desc" as const,
      hiddenColumns: [],
      showMonthFilter: true,
      showCategoryFilter: true,
      showDescriptionFilter: true,
      showTotalAmount: true,
      excludeCategories: ["Amex Invoice"],
    },
    {
      id: "invoice-table",
      title: "Invoice Transactions",
      transactions: transactions,
      bankFilter: "American Express",
      includeCategories: ["Amex Invoice"],
      initialSortColumn: "Date",
      initialSortDirection: "desc" as const,
      hiddenColumns: [],
      showMonthFilter: false,
      showCategoryFilter: false,
      showDescriptionFilter: false,
      showFilters: false,
      showTotalAmount: true,
    },
  ];

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <BankTablePageHeader
          title="American Express Transactions"
          showInfoButton={true}
          infoButtonUrl="./info"
          infoButtonText="Page Info & Component Guide"
          dataSourceComponent={
            <DataSourceInfo
              transactions={transactions}
              bankInfo={bankInfo}
              tableName="Sweden_transactions_agregated_2025"
              tableDescription="Aggregated transactions for American Express accounts in 2025"
            />
          }
          updateButtonComponent={<UpdateAmexAggregatedButton />}
          downloadUrl="https://www.americanexpress.com/en-us/account/login?inav=iNavLnkLog"
          downloadButtonText="Download Invoice"
          chartUrl="./chart"
          chartButtonText="Go to Chart Page"
        />

        <BankTablePageBody sections={tableSections} />
      </div>
    </ProtectedRoute>
  );
}
