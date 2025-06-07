"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getSjUpdatePreview,
  previewSjMonthTransactions,
  executeSjUpdate,
  SjUpdatePreview,
  SjUpdateResult,
} from "@/app/actions/updateActions";
import { Transaction } from "@/types/transaction";

type UpdateState =
  | "idle"
  | "loading"
  | "month-selection"
  | "preview"
  | "updating"
  | "success"
  | "error";

export default function UpdateSjAggregatedButton() {
  const [state, setState] = useState<UpdateState>("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [sjPreview, setSjPreview] = useState<SjUpdatePreview | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [monthTransactions, setMonthTransactions] = useState<Transaction[]>([]);
  const [result, setResult] = useState<SjUpdateResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleStartUpdate = async () => {
    setState("loading");
    setIsOpen(true);
    setError("");

    try {
      const preview = await getSjUpdatePreview();
      setSjPreview(preview);

      if (preview.availableNewMonths.length === 0) {
        setError(
          "No new SJ Prio months available to include. All existing SJ_YYYYMM tables have already been processed.",
        );
        setState("error");
        return;
      }

      setState("month-selection");
    } catch (error) {
      console.error("Error getting SJ preview:", error);
      setError("Failed to load SJ month data. Please try again.");
      setState("error");
    }
  };

  const handleMonthSelect = async (monthTable: string) => {
    setSelectedMonth(monthTable);
    setState("loading");

    try {
      const transactions = await previewSjMonthTransactions(monthTable);
      setMonthTransactions(transactions);
      setState("preview");
    } catch (error) {
      console.error("Error previewing month transactions:", error);
      setError("Failed to preview transactions for selected month.");
      setState("error");
    }
  };

  const handleConfirmUpdate = async () => {
    if (!selectedMonth) return;

    setState("updating");

    try {
      const updateResult = await executeSjUpdate(selectedMonth);
      setResult(updateResult);

      if (updateResult.success) {
        setState("success");
      } else {
        setError(updateResult.message);
        setState("error");
      }
    } catch (error) {
      console.error("Error executing SJ update:", error);
      setError("Failed to update aggregated data. Please try again.");
      setState("error");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setState("idle");
    setSjPreview(null);
    setSelectedMonth("");
    setMonthTransactions([]);
    setResult(null);
    setError("");
  };

  const formatTableName = (tableName: string): string => {
    // Convert SJ_202501 to "January 2025"
    const match = tableName.match(/SJ_(\d{4})(\d{2})/);
    if (!match) return tableName;

    const year = match[1];
    const month = parseInt(match[2], 10);
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return `${monthNames[month - 1]} ${year}`;
  };

  const getStateMessage = () => {
    switch (state) {
      case "loading":
        return "Loading SJ Prio data...";
      case "month-selection":
        return "Select a month to include in the aggregated table";
      case "preview":
        return "Review transactions before updating";
      case "updating":
        return "Updating aggregated data...";
      case "success":
        return "Update completed successfully!";
      case "error":
        return "Error occurred during update";
      default:
        return "";
    }
  };

  return (
    <>
      <Button
        onClick={handleStartUpdate}
        disabled={state === "loading" || state === "updating"}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {state === "loading" || state === "updating"
          ? "Processing..."
          : "Update Aggregated Data"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update SJ Prio Aggregated Data</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-gray-600">{getStateMessage()}</div>

            {state === "month-selection" && sjPreview && (
              <div className="space-y-4">
                {sjPreview.sourceMonthsIncluded.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-green-700">
                      Already Included Months:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {sjPreview.sourceMonthsIncluded.map((month) => (
                        <span
                          key={month}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {formatTableName(month)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm mb-2 text-blue-700">
                    Available New Months:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {sjPreview.availableNewMonths.map((month) => (
                      <Button
                        key={month}
                        onClick={() => handleMonthSelect(month)}
                        variant="outline"
                        className="text-left justify-start"
                      >
                        {formatTableName(month)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {state === "preview" && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Preview: {formatTableName(selectedMonth)}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {monthTransactions.length} transactions will be added to the
                    aggregated table.
                  </p>
                </div>

                {monthTransactions.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h5 className="font-medium text-sm">
                        Transaction Preview
                      </h5>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left">Date</th>
                            <th className="px-3 py-2 text-left">Description</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                            <th className="px-3 py-2 text-left">Category</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthTransactions.slice(0, 10).map((transaction) => (
                            <tr key={transaction.id} className="border-t">
                              <td className="px-3 py-2">
                                {transaction.Date
                                  ? new Date(
                                      transaction.Date,
                                    ).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td className="px-3 py-2 truncate max-w-xs">
                                {transaction.Description}
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                {typeof transaction.Amount === "number"
                                  ? transaction.Amount.toFixed(2)
                                  : transaction.Amount}
                              </td>
                              <td className="px-3 py-2">
                                {transaction.Category || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {monthTransactions.length > 10 && (
                        <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50">
                          ... and {monthTransactions.length - 10} more
                          transactions
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmUpdate}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Confirm Update
                  </Button>
                  <Button
                    onClick={() => setState("month-selection")}
                    variant="outline"
                  >
                    Back to Month Selection
                  </Button>
                </div>
              </div>
            )}

            {state === "success" && result && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Update Successful!
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{result.message}</p>
                        {result.monthIncluded && (
                          <p className="mt-1">
                            Month included:{" "}
                            {formatTableName(result.monthIncluded)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={handleClose} className="w-full">
                  Close
                </Button>
              </div>
            )}

            {state === "error" && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Update Failed
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleStartUpdate} variant="outline">
                    Try Again
                  </Button>
                  <Button onClick={handleClose}>Close</Button>
                </div>
              </div>
            )}

            {(state === "loading" || state === "updating") && (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
