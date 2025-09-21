"use client";

import { useHandelsbankenTransactions } from "../../lib/hooks/useTransactions";
import { usePageState } from "../../lib/hooks/usePageState";
import ProtectedRoute from "@/components/protected-route";
import UpdateAggregatedButton from "@/components/UpdateAggregatedButton";
import BankTablePageHeader from "@/components/ui/bank-table-page-header";
import BankTablePageBody from "@/components/ui/bank-table-page-body";
import DataSourceInfo from "@/components/ui/data-source-info";

export default function Home() {
  const { transactions, loading, error, user } = useHandelsbankenTransactions();
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
    uniqueBanks: ["Handelsbanken"],
    transactionCountsByBank: { Handelsbanken: transactions.length },
    newestDatesByBank: {
      Handelsbanken:
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
      bankFilter: "Handelsbanken",
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
          title="Handelsbanken Transactions"
          showInfoButton={true}
          infoButtonUrl="./info"
          infoButtonText="Page Info & Component Guide"
          dataSourceComponent={
            <DataSourceInfo
              transactions={transactions}
              bankInfo={bankInfo}
              tableName="Sweden_transactions_agregated_2025"
              tableDescription="Aggregated transactions for Handelsbanken accounts in 2025"
              activeBankFilter="Handelsbanken"
            />
          }
          updateButtonComponent={<UpdateAggregatedButton />}
          downloadUrl="https://www.handelsbanken.se/en/login"
          downloadButtonText="Download Invoice"
          chartButtons={[
            {
              url: "./category/chart",
              text: "Category Chart",
            },
            {
              url: "./overview/chart",
              text: "Overview Chart",
            },
          ]}
          layout="split"
        />

        <BankTablePageBody sections={tableSections} />
      </div>
    </ProtectedRoute>
  );
}
