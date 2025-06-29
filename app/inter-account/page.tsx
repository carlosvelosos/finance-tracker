"use client";

import { useInterAccountTransactionsWithBankInfo } from "../../lib/hooks/useTransactions";
import { usePageState } from "../../lib/hooks/usePageState";
import ProtectedRoute from "@/components/protected-route";
import UpdateAggregatedButton from "@/components/UpdateAggregatedButton";
import UpdateInterAggregatedButton from "@/components/UpdateInterAggregatedButton";
import DataSourceInfo from "@/components/ui/data-source-info";
import BankTablePageHeader from "@/components/ui/bank-table-page-header";
import BankTablePageBody from "@/components/ui/bank-table-page-body";

export default function Home() {
  // Fetch transactions and bank info
  // This hook should return transactions, bankInfo, loading, error, and user
  const { transactions, bankInfo, loading, error, user } =
    useInterAccountTransactionsWithBankInfo();

  // Handle loading and error states
  const { renderContent } = usePageState({
    loading,
    error: error as unknown,
    user,
  });

  // Return early if not ready
  const earlyReturn = renderContent();
  if (earlyReturn) return earlyReturn;

  // Define the sections for the table
  const tableSections = [
    {
      id: "main-table",
      title: "All Transactions",
      transactions: transactions,
      bankFilter: "Inter-BR",
      initialSortColumn: "Date",
      initialSortDirection: "desc" as const,
      hiddenColumns: [],
      showMonthFilter: true,
      showCategoryFilter: true,
      showDescriptionFilter: true,
      showTotalAmount: true,
      TransactionTableName: "Brasil_transactions_agregated_2025",
    },
  ];

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <BankTablePageHeader
          title="Inter Account Transactions"
          showInfoButton={true}
          infoButtonUrl="./info"
          infoButtonText="Page Info & Component Guide"
          dataSourceComponent={
            <DataSourceInfo
              transactions={transactions}
              bankInfo={bankInfo}
              tableName="Brasil_transactions_agregated_2025"
              tableDescription="Aggregated transactions for Brasil accounts in 2025"
            />
          }
          updateButtonComponent={<UpdateAggregatedButton />}
          additionalUpdateButtons={[<UpdateInterAggregatedButton />]}
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
