"use client";

import { useState } from "react";
import { useSupabaseTables } from "../../lib/hooks/useSupabaseTables";
import { useAggregatedTransactions } from "../../lib/hooks/useAggregatedTransactions";
import { usePageState } from "../../lib/hooks/usePageState";
import ProtectedRoute from "@/components/protected-route";
import UpdateAggregatedButton from "@/components/UpdateAggregatedButton";
import BankTablePageHeader from "@/components/ui/bank-table-page-header";
import BankTablePageBody from "@/components/ui/bank-table-page-body";
import TableSelectionPanel from "@/components/ui/table-selection-panel";
import AggregatedDataSourceInfo from "@/components/ui/aggregated-data-source-info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Settings } from "lucide-react";

export default function AggregatedTransactionsPage() {
  const [showTableSelection, setShowTableSelection] = useState(true);

  // Table discovery and selection
  const {
    tables,
    selectedTables,
    loading: tablesLoading,
    error: tablesError,
    toggleTableSelection,
    selectAllTables,
    deselectAllTables,
    refetch: refetchTables,
    user,
  } = useSupabaseTables();

  // Aggregated transactions data
  const {
    transactions,
    bankInfo,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
    selectedTablesCount,
    totalTransactions,
  } = useAggregatedTransactions({
    selectedTables,
    enabled: selectedTables.length > 0,
  });

  // Page state management (handles loading states and authentication)
  const { renderContent } = usePageState({
    loading: tablesLoading,
    error: tablesError || transactionsError,
    user,
  });

  // Return early if not ready
  const earlyReturn = renderContent();
  if (earlyReturn) return earlyReturn;

  // Create table sections for BankTablePageBody
  const tableSections =
    selectedTables.length > 0 && transactions.length > 0
      ? [
          {
            id: "aggregated-table",
            title: `Aggregated Transactions (${selectedTablesCount} table${selectedTablesCount === 1 ? "" : "s"})`,
            transactions: transactions,
            bankFilter: undefined, // No bank filter for aggregated view
            initialSortColumn: "Date",
            initialSortDirection: "desc" as const,
            hiddenColumns: [], // Show all columns for comprehensive view
            showMonthFilter: true,
            showCategoryFilter: true,
            showDescriptionFilter: true,
            showTotalAmount: true,
          },
        ]
      : [];

  // Handle refresh of all data
  const handleRefreshAll = async () => {
    await refetchTables();
    await refetchTransactions();
  };

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="flex min-h-screen">
        {/* Main Content Area */}
        <div className="flex-1 p-4 space-y-6 pr-80">
          {/* Page Header */}
          <BankTablePageHeader
            title="Multi-Table Aggregated Transactions"
            showInfoButton={false} // Could add info page later
            dataSourceComponent={
              selectedTables.length > 0 ? (
                <AggregatedDataSourceInfo
                  transactions={transactions}
                  bankInfo={bankInfo}
                  selectedTables={selectedTables}
                  selectedTablesCount={selectedTablesCount}
                  totalTransactions={totalTransactions}
                />
              ) : (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <Settings
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <h3 className="text-lg font-medium mb-2">
                        No Tables Selected
                      </h3>
                      <p className="text-sm">
                        Select one or more tables from the panel below to view
                        aggregated transaction data.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            }
            updateButtonComponent={
              <div className="flex gap-2">
                <UpdateAggregatedButton />
                <Button
                  onClick={handleRefreshAll}
                  variant="outline"
                  className="px-4 py-2"
                >
                  Refresh Data
                </Button>
              </div>
            }
            // Chart buttons - could be expanded to show aggregated charts
            chartButtons={[
              {
                url: "./category/chart",
                text: "Category Analysis",
              },
              {
                url: "./overview/chart",
                text: "Overview Chart",
              },
            ]}
            layout="split"
          />

          {/* Loading State for Transactions */}
          {transactionsLoading && selectedTables.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">
                    Loading transactions from {selectedTablesCount} table
                    {selectedTablesCount === 1 ? "" : "s"}...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State for Transactions */}
          {transactionsError && selectedTables.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Error Loading Transaction Data
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    {transactionsError?.message ||
                      "Unknown error occurred while loading transactions"}
                  </p>
                  <Button
                    onClick={refetchTransactions}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction Table */}
          {!transactionsLoading &&
            !transactionsError &&
            tableSections.length > 0 && (
              <BankTablePageBody sections={tableSections} />
            )}

          {/* Empty State - No data */}
          {!transactionsLoading &&
            !transactionsError &&
            selectedTables.length > 0 &&
            transactions.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-lg font-medium mb-2">
                      No Transaction Data Found
                    </h3>
                    <p className="text-sm">
                      The selected tables don&apos;t contain any transaction
                      data, or the data may not be accessible with your current
                      permissions.
                    </p>
                    <div className="mt-4 text-xs text-gray-400">
                      Selected tables: {selectedTables.join(", ")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Right Sidebar - Table Selection & Configuration */}
        <div className="fixed right-0 top-0 h-full w-80 bg-transparent border-l border-gray-800 p-3 overflow-y-auto text-sm">
          <Card className="h-full">
            <CardHeader className="pb-2 px-3 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Settings size={16} />
                  Table Selection
                </CardTitle>
                <Button
                  onClick={() => setShowTableSelection(!showTableSelection)}
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                >
                  {showTableSelection ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </Button>
              </div>
            </CardHeader>

            {showTableSelection && (
              <CardContent className="flex-1 overflow-y-auto px-3 pb-3 text-xs">
                <TableSelectionPanel
                  tables={tables}
                  selectedTables={selectedTables}
                  loading={tablesLoading}
                  error={tablesError}
                  onToggleTable={toggleTableSelection}
                  onSelectAll={selectAllTables}
                  onDeselectAll={deselectAllTables}
                  onRefresh={refetchTables}
                />
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
