"use client";

import { useSjPrioTransactions } from "../../lib/hooks/useTransactions";
import { usePageState } from "../../lib/hooks/usePageState";
import ProtectedRoute from "@/components/protected-route";
import UpdateSjAggregatedButton from "@/components/UpdateSjAggregatedButton";
import BankTablePageHeader from "@/components/ui/bank-table-page-header";
import BankTablePageBody from "@/components/ui/bank-table-page-body";
import DataSourceInfo from "@/components/ui/data-source-info";

export default function Home() {
  const { transactions, loading, error, user } = useSjPrioTransactions();
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
    uniqueBanks: ["SEB SJ Prio"],
    transactionCountsByBank: { "SEB SJ Prio": transactions.length },
    newestDatesByBank: {
      "SEB SJ Prio":
        transactions.length > 0
          ? transactions.reduce(
              (latest, t) => (t.Date && t.Date > latest ? t.Date : latest),
              transactions[0]?.Date || "",
            )
          : "",
    },
  };

  // Define the sections for the table
  const tableSections = [
    {
      id: "main-table",
      title: "All Transactions",
      transactions: transactions,
      bankFilter: "SEB SJ Prio",
      initialSortColumn: "Date",
      initialSortDirection: "desc" as const,
      hiddenColumns: [],
      showMonthFilter: true,
      showCategoryFilter: true,
      showDescriptionFilter: true,
      showTotalAmount: true,
    },
  ];

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <BankTablePageHeader
          title="SEB SJ Prio Transactions"
          showInfoButton={true}
          infoButtonUrl="./info"
          infoButtonText="Page Info & Component Guide"
          dataSourceComponent={
            <DataSourceInfo
              transactions={transactions}
              bankInfo={bankInfo}
              tableName="Sweden_transactions_agregated_2025"
              tableDescription="Aggregated transactions for SEB SJ Prio accounts in 2025"
              activeBankFilter="SEB SJ Prio"
            />
          }
          updateButtonComponent={<UpdateSjAggregatedButton />}
          downloadUrl="https://secure.sebkort.com/nis/m/sjse/external/t/login/index"
          downloadButtonText="Download Invoice"
          chartUrl="./chart"
          chartButtonText="Go to Chart Page"
        />

        <BankTablePageBody sections={tableSections} />
      </div>
    </ProtectedRoute>
  );
}
