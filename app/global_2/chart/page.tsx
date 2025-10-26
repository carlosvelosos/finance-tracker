"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTableSelection } from "@/context/TableSelectionContext";
import { useAggregatedTransactions } from "../../../lib/hooks/useAggregatedTransactions";
import { usePageState } from "../../../lib/hooks/usePageState";
import { CustomBarChart } from "@/components/ui/custombarchart";
import ProtectedRoute from "@/components/protected-route";
import TableSelectionPanel from "@/components/ui/table-selection-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Settings, ArrowLeft } from "lucide-react";

export default function Global2CategoryChartPage() {
  const router = useRouter();
  const [showTableSelection, setShowTableSelection] = useState(true);

  // Table discovery and selection - using shared context
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
  } = useTableSelection();

  // Aggregated transactions data
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useAggregatedTransactions({
    selectedTables,
    enabled: selectedTables.length > 0,
  });

  // Page state management
  const { renderContent } = usePageState({
    loading: tablesLoading,
    error: tablesError || transactionsError,
    user,
  });

  // Return early if not ready (AFTER all hooks have been declared)
  const earlyReturn = renderContent();
  if (earlyReturn) return earlyReturn;

  // Filter transactions similar to global/chart
  const filteredTransactions = transactions.filter(
    (t) =>
      !(
        t.Category === "Amex Invoice" ||
        t.Category === "SEB SJ Prio Invoice" ||
        t.Category === "Investment" ||
        t.Category === "Sek to Reais" ||
        t.Category === "SJ PRIO MASTER Invoice" ||
        t.Category === "Income - Salary" ||
        t.Category === "Income - Skat" ||
        t.Category === "Pagamento fatura anterior" ||
        t.Category === "Inter MC Credit card" ||
        t.Category === "Rico Visa Credit card"
      ),
  );

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="flex min-h-screen">
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ${
            showTableSelection ? "pr-80" : "pr-4"
          }`}
        >
          {/* Back Button */}
          <div className="p-4">
            <Button
              onClick={() => router.push("/global_2")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Tables
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center min-h-screen">
            {/* Loading State */}
            {transactionsLoading && selectedTables.length > 0 && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">
                      Loading transactions from {selectedTables.length} table
                      {selectedTables.length === 1 ? "" : "s"}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Tables Selected */}
            {selectedTables.length === 0 && (
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
                      Select one or more tables from the panel on the right to
                      view aggregated chart data.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chart Display */}
            {!transactionsLoading &&
              !transactionsError &&
              selectedTables.length > 0 &&
              filteredTransactions.length > 0 && (
                <div className="pt-8 pb-8 w-full max-w-7xl px-4">
                  <CustomBarChart
                    data={filteredTransactions}
                    barColor="hsl(var(--chart-1))"
                    title="Total Amount per Category"
                    description={`Showing totals for ${selectedTables.length} selected table${selectedTables.length === 1 ? "" : "s"}`}
                  />
                </div>
              )}

            {/* No Data */}
            {!transactionsLoading &&
              !transactionsError &&
              selectedTables.length > 0 &&
              filteredTransactions.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="text-lg font-medium mb-2">
                        No Transaction Data Found
                      </h3>
                      <p className="text-sm">
                        The selected tables don&apos;t contain any transaction
                        data after filtering.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>

        {/* Right Sidebar - Table Selection & Configuration */}
        <div
          className={`fixed top-0 h-full w-80 bg-transparent border-l border-gray-800 p-3 overflow-y-auto text-sm transition-all duration-300 ${
            showTableSelection ? "right-0" : "-right-80"
          }`}
        >
          <Card className="h-full">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={16} />
                <h2 className="text-base font-semibold">Table Selection</h2>
              </div>
              <Button
                onClick={() => setShowTableSelection(!showTableSelection)}
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
                title={showTableSelection ? "Hide sidebar" : "Show sidebar"}
              >
                {showTableSelection ? (
                  <ChevronRight size={14} />
                ) : (
                  <ChevronLeft size={14} />
                )}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 pt-3 text-xs">
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
            </div>
          </Card>
        </div>

        {/* Toggle Button - Visible when sidebar is hidden */}
        {!showTableSelection && (
          <Button
            onClick={() => setShowTableSelection(true)}
            variant="outline"
            size="sm"
            className="fixed right-4 top-4 z-50 shadow-lg"
            title="Show table selection"
          >
            <Settings size={16} className="mr-2" />
            <ChevronLeft size={16} />
          </Button>
        )}
      </div>
    </ProtectedRoute>
  );
}
