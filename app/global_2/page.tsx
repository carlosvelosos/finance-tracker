"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSupabaseTables } from "../../lib/hooks/useSupabaseTables";
import { useAggregatedTransactions } from "../../lib/hooks/useAggregatedTransactions";
import { usePageState } from "../../lib/hooks/usePageState";
import ProtectedRoute from "@/components/protected-route";
import UpdateAggregatedButton from "@/components/UpdateAggregatedButton";
import BankTablePageHeader from "@/components/ui/bank-table-page-header";
import BankTablePageBody from "@/components/ui/bank-table-page-body";
import TableSelectionPanel from "@/components/ui/table-selection-panel";
import AggregatedDataSourceInfo from "@/components/ui/aggregated-data-source-info";
import TableNetValueChart from "../../components/ui/table-net-value-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

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
    tableNetValues,
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

  // Create table sections for BankTablePageBody (memoized to prevent re-renders)
  const tableSections = useMemo(() => {
    if (selectedTables.length === 0 || transactions.length === 0) {
      return [];
    }

    const nonAutomaticDebitTransactions = transactions.filter(
      (t) =>
        t.Description !== "PAGTO DEBITO AUTOMATICO" &&
        t.Category !== "Pagamento fatura anterior",
    );
    const automaticDebitTransactions = transactions.filter(
      (t) =>
        t.Description === "PAGTO DEBITO AUTOMATICO" ||
        t.Category === "Pagamento fatura anterior",
    );

    return [
      {
        id: "aggregated-table",
        title: `Aggregated Transactions (${nonAutomaticDebitTransactions.length} transactions)`,
        transactions: nonAutomaticDebitTransactions,
        bankFilter: undefined, // No bank filter for aggregated view
        initialSortColumn: "Date",
        initialSortDirection: "desc" as const,
        hiddenColumns: [], // Show all columns for comprehensive view
        showMonthFilter: true,
        showCategoryFilter: true,
        showDescriptionFilter: true,
        showTotalAmount: true,
      },
      {
        id: "automatic-debit-table",
        title: `Automatic Debit & Invoice Payment Transactions (${automaticDebitTransactions.length} transactions)`,
        transactions: automaticDebitTransactions,
        bankFilter: undefined,
        initialSortColumn: "Date",
        initialSortDirection: "desc" as const,
        hiddenColumns: [], // Show all columns to distinguish between different types
        showMonthFilter: true,
        showCategoryFilter: true,
        showDescriptionFilter: true, // Show description filter to distinguish between types
        showTotalAmount: true,
      },
    ];
  }, [selectedTables, transactions]);

  // Handle refresh of all data (memoized to prevent re-renders)
  const handleRefreshAll = useCallback(async () => {
    await refetchTables();
    await refetchTransactions();
  }, [refetchTables, refetchTransactions]);

  // Return early if not ready (AFTER all hooks have been declared)
  const earlyReturn = renderContent();
  if (earlyReturn) return earlyReturn;

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="flex min-h-screen">
        {/* Main Content Area */}
        <div
          className={`flex-1 p-4 space-y-6 transition-all duration-300 ${
            showTableSelection ? "pr-80" : "pr-4"
          }`}
        >
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

          {/* Net Value Chart - Show when data is available */}
          {!transactionsLoading &&
            !transactionsError &&
            selectedTables.length > 0 &&
            tableNetValues.length > 0 && (
              <TableNetValueChart
                data={tableNetValues}
                loading={transactionsLoading}
                height="300px"
                width="full"
                responsive={true}
                className="mb-6"
              />
            )}

          {/* Table Net Values Summary - Show when data is available */}
          {!transactionsLoading &&
            !transactionsError &&
            selectedTables.length > 0 &&
            tableNetValues.length > 0 && (
              <Card className="mb-6">
                <Accordion type="single" collapsible defaultValue="summary">
                  <AccordionItem value="summary" className="border-none">
                    <CardHeader className="pb-3">
                      <AccordionTrigger className="hover:no-underline py-0">
                        <CardTitle className="text-lg font-semibold">
                          Table Net Values Summary
                        </CardTitle>
                      </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent>
                      <CardContent>
                        <div className="space-y-3">
                          {[...tableNetValues]
                            .sort((a, b) =>
                              a.tableName.localeCompare(b.tableName),
                            )
                            .map((table) => {
                              const isPositive = table.netValue >= 0;
                              const formattedValue = new Intl.NumberFormat(
                                "en-US",
                                {
                                  style: "currency",
                                  currency: "USD",
                                  minimumFractionDigits: 2,
                                },
                              ).format(Math.abs(table.netValue));

                              return (
                                <div
                                  key={table.tableName}
                                  className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                                >
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                      {table.displayName || table.tableName}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {table.transactionCount.toLocaleString()}{" "}
                                      transactions (excl. automatic debits)
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div
                                      className={`text-lg font-semibold ${
                                        isPositive
                                          ? "text-green-600 dark:text-green-400"
                                          : "text-red-600 dark:text-red-400"
                                      }`}
                                    >
                                      {isPositive ? "+" : "-"}
                                      {formattedValue}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {table.tableName}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>

                        {/* Summary Totals */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(
                                  tableNetValues.reduce(
                                    (sum, t) => sum + Math.max(0, t.netValue),
                                    0,
                                  ),
                                )}
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-400">
                                Total Positive
                              </div>
                            </div>
                            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <div className="text-lg font-semibold text-red-700 dark:text-red-300">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(
                                  Math.abs(
                                    tableNetValues.reduce(
                                      (sum, t) => sum + Math.min(0, t.netValue),
                                      0,
                                    ),
                                  ),
                                )}
                              </div>
                              <div className="text-sm text-red-600 dark:text-red-400">
                                Total Negative
                              </div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(
                                  tableNetValues.reduce(
                                    (sum, t) => sum + t.netValue,
                                    0,
                                  ),
                                )}
                              </div>
                              <div className="text-sm text-blue-600 dark:text-blue-400">
                                Net Total
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            )}

          {/* Transaction Table */}
          {!transactionsLoading &&
            !transactionsError &&
            tableSections.length > 0 && (
              <BankTablePageBody sections={tableSections} />
            )}

          {/* Transactions by Responsible - Three Tables Side by Side */}
          {!transactionsLoading &&
            !transactionsError &&
            selectedTables.length > 0 &&
            transactions.length > 0 && (
              <Card className="mb-6">
                <Accordion
                  type="single"
                  collapsible
                  defaultValue="by-responsible"
                >
                  <AccordionItem value="by-responsible" className="border-none">
                    <CardHeader className="pb-3">
                      <AccordionTrigger className="hover:no-underline py-0">
                        <CardTitle className="text-lg font-semibold">
                          Transactions by Responsible Person
                        </CardTitle>
                      </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(() => {
                            // Get unique responsible persons
                            const responsiblePersons = [
                              ...new Set(
                                transactions
                                  .map((t) => t.Responsible)
                                  .filter((r): r is string => Boolean(r)),
                              ),
                            ].sort();

                            // Take up to 3 responsible persons
                            const topThree = responsiblePersons.slice(0, 3);

                            return topThree.map((person) => {
                              // Descriptions to exclude
                              const excludedDescriptions = [
                                "PAGAMENTO ON LINE",
                                "PAGTO DEBITO AUTOMATICO",
                                "CRED COMPRA INTERNAC",
                                "EST IOF TRANS INTERNAC",
                              ];

                              const personTransactions = transactions
                                .filter((t) => t.Responsible === person)
                                .filter(
                                  (t) =>
                                    !excludedDescriptions.includes(
                                      t.Description || "",
                                    ),
                                )
                                .sort(
                                  (a, b) =>
                                    new Date(b.Date || "").getTime() -
                                    new Date(a.Date || "").getTime(),
                                );

                              const totalAmount = personTransactions.reduce(
                                (sum, t) => sum + (t.Amount || 0),
                                0,
                              );

                              return (
                                <div
                                  key={person}
                                  className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                                >
                                  <div className="mb-3 pb-2 border-b">
                                    <h3 className="font-semibold text-base">
                                      {person}
                                    </h3>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {personTransactions.length} transactions
                                      </span>
                                      <span
                                        className={`text-sm font-semibold ${
                                          totalAmount >= 0
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                        }`}
                                      >
                                        {new Intl.NumberFormat("en-US", {
                                          style: "currency",
                                          currency: "USD",
                                        }).format(totalAmount)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="overflow-auto max-h-96">
                                    <table className="w-full text-xs">
                                      <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                          <th className="text-left p-2 font-semibold">
                                            Date
                                          </th>
                                          <th className="text-left p-2 font-semibold">
                                            Description
                                          </th>
                                          <th className="text-right p-2 font-semibold">
                                            Amount
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {personTransactions.map(
                                          (transaction, idx) => (
                                            <tr
                                              key={`${transaction.id}-${idx}`}
                                              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                              <td className="p-2 whitespace-nowrap">
                                                {transaction.Date
                                                  ? new Date(
                                                      transaction.Date,
                                                    ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                        month: "short",
                                                        day: "numeric",
                                                      },
                                                    )
                                                  : "N/A"}
                                              </td>
                                              <td className="p-2">
                                                <div className="truncate max-w-xs">
                                                  {transaction.Description ||
                                                    "N/A"}
                                                </div>
                                              </td>
                                              <td
                                                className={`p-2 text-right font-medium whitespace-nowrap ${
                                                  (transaction.Amount || 0) >= 0
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400"
                                                }`}
                                              >
                                                {new Intl.NumberFormat(
                                                  "en-US",
                                                  {
                                                    style: "currency",
                                                    currency: "USD",
                                                    minimumFractionDigits: 2,
                                                  },
                                                ).format(
                                                  transaction.Amount || 0,
                                                )}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            )}

          {/* Transactions by Responsible Person and Month - Grid Layout */}
          {!transactionsLoading &&
            !transactionsError &&
            selectedTables.length > 0 &&
            transactions.length > 0 && (
              <Card className="mb-6">
                <Accordion
                  type="single"
                  collapsible
                  defaultValue="by-month-responsible"
                >
                  <AccordionItem
                    value="by-month-responsible"
                    className="border-none"
                  >
                    <CardHeader className="pb-3">
                      <AccordionTrigger className="hover:no-underline py-0">
                        <CardTitle className="text-lg font-semibold">
                          Transactions by Month and Responsible Person
                        </CardTitle>
                      </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent>
                      <CardContent>
                        {(() => {
                          // Descriptions to exclude
                          const excludedDescriptions = [
                            "PAGAMENTO ON LINE",
                            "PAGTO DEBITO AUTOMATICO",
                            "CRED COMPRA INTERNAC",
                            "EST IOF TRANS INTERNAC",
                          ];

                          // Filter transactions
                          const filteredTransactions = transactions.filter(
                            (t) =>
                              !excludedDescriptions.includes(
                                t.Description || "",
                              ),
                          );

                          // Get unique responsible persons
                          const responsiblePersons = [
                            ...new Set(
                              filteredTransactions
                                .map((t) => t.Responsible)
                                .filter((r): r is string => Boolean(r)),
                            ),
                          ].sort();

                          // Take up to 3 responsible persons
                          const topThree = responsiblePersons.slice(0, 3);

                          // Get all unique year-months and sort chronologically
                          const yearMonths = [
                            ...new Set(
                              filteredTransactions
                                .map((t) => {
                                  if (!t.Date) return null;
                                  const date = new Date(t.Date);
                                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                                })
                                .filter((ym): ym is string => Boolean(ym)),
                            ),
                          ].sort();

                          return (
                            <div className="space-y-6">
                              {yearMonths.map((yearMonth) => {
                                const [year, month] = yearMonth.split("-");
                                const monthName = new Date(
                                  parseInt(year),
                                  parseInt(month) - 1,
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                });

                                return (
                                  <div key={yearMonth}>
                                    <h3 className="text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
                                      {monthName}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {topThree.map((person) => {
                                        const personMonthTransactions =
                                          filteredTransactions
                                            .filter((t) => {
                                              if (
                                                !t.Date ||
                                                t.Responsible !== person
                                              )
                                                return false;
                                              const date = new Date(t.Date);
                                              const tYearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                                              return tYearMonth === yearMonth;
                                            })
                                            .sort(
                                              (a, b) =>
                                                new Date(
                                                  b.Date || "",
                                                ).getTime() -
                                                new Date(
                                                  a.Date || "",
                                                ).getTime(),
                                            );

                                        const totalAmount =
                                          personMonthTransactions.reduce(
                                            (sum, t) => sum + (t.Amount || 0),
                                            0,
                                          );

                                        return (
                                          <div
                                            key={`${yearMonth}-${person}`}
                                            className="border rounded-lg p-4 bg-white dark:bg-gray-800"
                                          >
                                            <div className="mb-3 pb-2 border-b">
                                              <h4 className="font-semibold text-sm">
                                                {person}
                                              </h4>
                                              <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                  {
                                                    personMonthTransactions.length
                                                  }{" "}
                                                  transactions
                                                </span>
                                                <span
                                                  className={`text-sm font-semibold ${
                                                    totalAmount >= 0
                                                      ? "text-green-600 dark:text-green-400"
                                                      : "text-red-600 dark:text-red-400"
                                                  }`}
                                                >
                                                  {new Intl.NumberFormat(
                                                    "en-US",
                                                    {
                                                      style: "currency",
                                                      currency: "USD",
                                                    },
                                                  ).format(totalAmount)}
                                                </span>
                                              </div>
                                            </div>

                                            {personMonthTransactions.length >
                                            0 ? (
                                              <div className="overflow-auto max-h-80">
                                                <table className="w-full text-xs">
                                                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                      <th className="text-left p-2 font-semibold">
                                                        Date
                                                      </th>
                                                      <th className="text-left p-2 font-semibold">
                                                        Description
                                                      </th>
                                                      <th className="text-right p-2 font-semibold">
                                                        Amount
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {personMonthTransactions.map(
                                                      (transaction, idx) => (
                                                        <tr
                                                          key={`${transaction.id}-${idx}`}
                                                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                          <td className="p-2 whitespace-nowrap">
                                                            {transaction.Date
                                                              ? new Date(
                                                                  transaction.Date,
                                                                ).toLocaleDateString(
                                                                  "en-US",
                                                                  {
                                                                    month:
                                                                      "short",
                                                                    day: "numeric",
                                                                  },
                                                                )
                                                              : "N/A"}
                                                          </td>
                                                          <td className="p-2">
                                                            <div className="truncate max-w-xs">
                                                              {transaction.Description ||
                                                                "N/A"}
                                                            </div>
                                                          </td>
                                                          <td
                                                            className={`p-2 text-right font-medium whitespace-nowrap ${
                                                              (transaction.Amount ||
                                                                0) >= 0
                                                                ? "text-green-600 dark:text-green-400"
                                                                : "text-red-600 dark:text-red-400"
                                                            }`}
                                                          >
                                                            {new Intl.NumberFormat(
                                                              "en-US",
                                                              {
                                                                style:
                                                                  "currency",
                                                                currency: "USD",
                                                                minimumFractionDigits: 2,
                                                              },
                                                            ).format(
                                                              transaction.Amount ||
                                                                0,
                                                            )}
                                                          </td>
                                                        </tr>
                                                      ),
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            ) : (
                                              <div className="text-center text-gray-400 text-xs py-4">
                                                No transactions
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
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
        <div
          className={`fixed top-0 h-full w-80 bg-transparent border-l border-gray-800 p-3 overflow-y-auto text-sm transition-all duration-300 ${
            showTableSelection ? "right-0" : "-right-80"
          }`}
        >
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
                  title={showTableSelection ? "Hide sidebar" : "Show sidebar"}
                >
                  {showTableSelection ? (
                    <ChevronRight size={14} />
                  ) : (
                    <ChevronLeft size={14} />
                  )}
                </Button>
              </div>
            </CardHeader>

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
