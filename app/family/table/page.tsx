/**
 * Family Table Page Component
 *
 * This page displays all family transactions in a unified table format, aggregating data from:
 * - Brasil_transactions_agregated_2024 table
 * - Brasil_transactions_agregated_2025 table
 *
 * Features:
 * - Unified view of all family transactions across both years
 * - Sortable columns with date sorting (newest first by default)
 * - Comprehensive filtering capabilities:
 *   - Month and year filters
 *   - Category and description filters
 *   - Responsible person filter
 *   - Comment filter
 * - Amount adjustments based on Income/Outcome comments
 * - Follows the same design pattern as other bank table pages
 */

"use client";

import { useFamilyTableTransactions } from "../../../lib/hooks/useTransactions";
import { usePageState } from "../../../lib/hooks/usePageState";
import ProtectedRoute from "@/components/protected-route";
import UpdateAggregatedButton from "@/components/UpdateAggregatedButton";
import BankTablePageHeader from "@/components/ui/bank-table-page-header";
import BankTablePageBody from "@/components/ui/bank-table-page-body";
import DataSourceInfo from "@/components/ui/data-source-info";

/**
 * Family Table Page Component
 *
 * Main component that renders the family transactions table page.
 * Uses the same structure as other bank pages but aggregates Brazilian transaction data.
 */
export default function FamilyTablePage() {
  const { transactions, loading, error, user } = useFamilyTableTransactions();
  const { renderContent } = usePageState({
    loading,
    error: error as unknown,
    user,
  });

  // Return early if not ready (loading, error, or authentication issues)
  const earlyReturn = renderContent();
  if (earlyReturn) return earlyReturn;

  // Calculate bank information for DataSourceInfo component
  // Get unique banks and their statistics from the combined transaction data
  const uniqueBanks = [
    ...new Set(
      transactions
        .map((t) => t.Bank)
        .filter((bank): bank is string => Boolean(bank)),
    ),
  ];

  const transactionCountsByBank: Record<string, number> = {};
  const newestDatesByBank: Record<string, string> = {};

  // Calculate statistics for each bank
  uniqueBanks.forEach((bank) => {
    const bankTransactions = transactions.filter((t) => t.Bank === bank);
    transactionCountsByBank[bank] = bankTransactions.length;

    // Find the newest transaction date for this bank
    const newestTransaction = bankTransactions.reduce((newest, current) => {
      const currentDate = current.Date ? new Date(current.Date) : new Date(0);
      const newestDate = newest.Date ? new Date(newest.Date) : new Date(0);
      return currentDate > newestDate ? current : newest;
    });

    if (newestTransaction.Date) {
      newestDatesByBank[bank] = newestTransaction.Date;
    }
  });

  const bankInfo = {
    uniqueBanks,
    transactionCountsByBank,
    newestDatesByBank,
  };

  // Define the table sections - single section showing all transactions
  const tableSections = [
    {
      id: "all-family-transactions",
      title: "All Family Transactions",
      transactions: transactions,
      bankFilter: "", // No specific bank filter - show all
      initialSortColumn: "Date",
      initialSortDirection: "desc" as const,
      hiddenColumns: [], // Show all columns
      showMonthFilter: true,
      showCategoryFilter: true,
      showDescriptionFilter: true,
      showResponsibleFilter: true,
      showCommentFilter: true,
      showTotalAmount: true,
    },
  ];

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <BankTablePageHeader
          title="Family Transactions - All Data"
          showInfoButton={true}
          infoButtonUrl="./info"
          infoButtonText="Page Info & Data Sources"
          dataSourceComponent={
            <DataSourceInfo
              transactions={transactions}
              bankInfo={bankInfo}
              tableName="Brasil_transactions_agregated_2024 + Brasil_transactions_agregated_2025"
              tableDescription="Combined transactions from Brazilian accounts (2024 and 2025)"
            />
          }
          updateButtonComponent={<UpdateAggregatedButton />}
          downloadUrl="/family"
          downloadButtonText="Back to Family Dashboard"
          chartButtons={[
            {
              url: "/family",
              text: "Family Dashboard",
            },
          ]}
          layout="split"
        />

        <BankTablePageBody sections={tableSections} />
      </div>
    </ProtectedRoute>
  );
}
