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
  getAmexUpdatePreview,
  previewAmexMonthTransactions,
  executeAmexUpdate,
  AmexUpdatePreview,
  AmexUpdateResult,
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

export default function UpdateAmexAggregatedButton() {
  const [state, setState] = useState<UpdateState>("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [amexPreview, setAmexPreview] = useState<AmexUpdatePreview | null>(
    null,
  );
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [monthTransactions, setMonthTransactions] = useState<Transaction[]>([]);
  const [result, setResult] = useState<AmexUpdateResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleStartUpdate = async () => {
    setState("loading");
    setIsOpen(true);
    setError("");

    try {
      const preview = await getAmexUpdatePreview();
      setAmexPreview(preview);

      if (preview.availableNewMonths.length === 0) {
        setError(
          "No new AMEX months available to include. All existing AM_YYYYMM tables have already been processed.",
        );
        setState("error");
      } else {
        setState("month-selection");
      }
    } catch (err) {
      setError(
        `Failed to get AMEX update preview: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setState("error");
    }
  };

  const handleMonthSelect = async (monthTable: string) => {
    setState("loading");
    setSelectedMonth(monthTable);
    setError("");

    try {
      const transactions = await previewAmexMonthTransactions(monthTable);
      setMonthTransactions(transactions);
      setState("preview");
    } catch (err) {
      setError(
        `Failed to preview transactions for ${monthTable}: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setState("error");
    }
  };

  const handleConfirmUpdate = async () => {
    if (!selectedMonth) return;

    setState("updating");
    setError("");

    try {
      const updateResult = await executeAmexUpdate(selectedMonth);
      setResult(updateResult);

      if (updateResult.success) {
        setState("success");
      } else {
        setError(updateResult.message);
        setState("error");
      }
    } catch (err) {
      setError(
        `Failed to execute update: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setState("error");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setState("idle");
    setAmexPreview(null);
    setSelectedMonth("");
    setMonthTransactions([]);
    setResult(null);
    setError("");
  };

  const formatMonth = (monthTable: string) => {
    // Convert AM_202505 to "May 2025"
    const match = monthTable.match(/AM_(\d{4})(\d{2})/);
    if (!match) return monthTable;

    const year = match[1];
    const month = match[2];
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

    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const renderDialogContent = () => {
    switch (state) {
      case "loading":
        return (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        );

      case "month-selection":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Select AMEX Month to Include
            </h3>{" "}
            {(amexPreview?.sourceMonthsIncluded?.length ?? 0) > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  Already Included Months:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {amexPreview?.sourceMonthsIncluded?.map((month) => (
                    <span
                      key={month}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                    >
                      {formatMonth(month)}
                    </span>
                  )) ?? []}
                </div>
              </div>
            )}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">
                Available New Months:
              </h4>
              <div className="grid gap-2">
                {amexPreview?.availableNewMonths.map((month) => (
                  <Button
                    key={month}
                    variant="outline"
                    onClick={() => handleMonthSelect(month)}
                    className="justify-start"
                  >
                    <span className="font-mono text-sm mr-2">{month}</span>
                    <span>({formatMonth(month)})</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case "preview":
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Preview: {formatMonth(selectedMonth)}
            </h3>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>{monthTransactions.length}</strong> transactions will be
                added from {selectedMonth}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Total Amount:{" "}
                {monthTransactions
                  .reduce((sum, t) => sum + (t.Amount || 0), 0)
                  .toFixed(2)}{" "}
                SEK
              </p>
            </div>

            {monthTransactions.length > 0 && (
              <div className="mb-6 max-h-60 overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-right">Amount</th>
                      <th className="p-2 text-left">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthTransactions
                      .slice(0, 10)
                      .map((transaction, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{transaction.Date}</td>{" "}
                          <td
                            className="p-2 truncate max-w-[200px]"
                            title={transaction.Description || undefined}
                          >
                            {transaction.Description}
                          </td>
                          <td className="p-2 text-right">
                            {transaction.Amount?.toFixed(2)}
                          </td>
                          <td className="p-2">{transaction.Category}</td>
                        </tr>
                      ))}
                    {monthTransactions.length > 10 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-2 text-center text-gray-500"
                        >
                          ... and {monthTransactions.length - 10} more
                          transactions
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setState("month-selection")}
                variant="outline"
              >
                Back to Month Selection
              </Button>
              <Button
                onClick={handleConfirmUpdate}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm and Add {monthTransactions.length} Transactions
              </Button>
            </div>
          </div>
        );

      case "updating":
        return (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>
              Adding {monthTransactions.length} transactions to aggregated
              table...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="p-6 text-center">
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Update Successful!
            </h3>
            <p className="text-green-700 mb-4">{result?.message}</p>
            <Button
              onClick={handleClose}
              className="bg-green-600 hover:bg-green-700"
            >
              Close
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="p-6 text-center">
            <div className="text-red-600 text-4xl mb-4">✗</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleClose} variant="outline">
                Close
              </Button>
              <Button onClick={handleStartUpdate}>Try Again</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Button
        onClick={handleStartUpdate}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        disabled={state === "loading" || state === "updating"}
      >
        {state === "loading" || state === "updating"
          ? "Processing..."
          : "Update Aggregated Data"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update AMEX Aggregated Data</DialogTitle>
          </DialogHeader>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </>
  );
}
