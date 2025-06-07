"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getUpdatePreview,
  executeUpdate,
  UpdatePreview,
  UpdateResult,
} from "@/app/actions/updateActions";
import { Loader2, Plus, CheckCircle, XCircle, AlertCircle } from "lucide-react";

type UpdateState =
  | "idle"
  | "loading"
  | "preview"
  | "updating"
  | "success"
  | "error";

export default function UpdateAggregatedButton() {
  const [state, setState] = useState<UpdateState>("idle");
  const [preview, setPreview] = useState<UpdatePreview | null>(null);
  const [result, setResult] = useState<UpdateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStartUpdate = async () => {
    setState("loading");
    setError(null);
    setIsDialogOpen(true);

    try {
      const previewData = await getUpdatePreview();
      setPreview(previewData);
      setState("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
      setState("error");
    }
  };

  const handleConfirmUpdate = async () => {
    if (!preview) return;

    setState("updating");

    try {
      const updateResult = await executeUpdate(preview.newTransactions);
      setResult(updateResult);
      setState(updateResult.success ? "success" : "error");
      if (!updateResult.success) {
        setError(updateResult.error || "Update failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
      setState("error");
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setState("idle");
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("sv-SE");
  };

  return (
    <>
      <Button
        onClick={handleStartUpdate}
        disabled={state === "loading" || state === "updating"}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading Preview...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Update Aggregated Data
          </>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Update Sweden Transactions Aggregated 2025
            </DialogTitle>
            <DialogDescription>
              {state === "preview" && "Review the changes before applying them"}
              {state === "updating" && "Updating database..."}
              {state === "success" && "Update completed successfully"}
              {state === "error" && "An error occurred"}
              {state === "loading" && "Loading preview..."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {state === "loading" && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Analyzing transactions...</span>
              </div>
            )}

            {state === "preview" && preview && (
              <div className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5 text-blue-400" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">New Transactions:</span>
                        <p className="text-white font-semibold">
                          {preview.summary.totalNew}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Total Amount:</span>
                        <p className="text-white font-semibold">
                          {formatCurrency(preview.summary.totalAmount)}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <span className="text-gray-400">Date Range:</span>
                        <p className="text-white font-semibold">
                          {preview.summary.dateRange.from
                            ? formatDate(preview.summary.dateRange.from)
                            : "N/A"}{" "}
                          -{" "}
                          {preview.summary.dateRange.to
                            ? formatDate(preview.summary.dateRange.to)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {preview.newTransactions.length > 0 ? (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        New Transactions to Add
                      </CardTitle>
                      <CardDescription>
                        These transactions will be added to the aggregated table
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-64 overflow-auto">
                        <div className="space-y-2">
                          {preview.newTransactions
                            .slice(0, 50)
                            .map((transaction, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 bg-gray-700 rounded text-sm"
                              >
                                <div className="flex-1">
                                  <p className="text-white font-medium">
                                    {transaction.description}
                                  </p>
                                  <p className="text-gray-400">
                                    {formatDate(transaction.date)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={`font-semibold ${transaction.amount >= 0 ? "text-green-400" : "text-red-400"}`}
                                  >
                                    {formatCurrency(transaction.amount)}
                                  </p>
                                  {transaction.category && (
                                    <p className="text-gray-400 text-xs">
                                      {transaction.category}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          {preview.newTransactions.length > 50 && (
                            <div className="text-center text-gray-400 py-2">
                              ... and {preview.newTransactions.length - 50} more
                              transactions
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="py-8">
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                        <p className="text-white font-semibold">
                          No new transactions to add
                        </p>
                        <p className="text-gray-400">
                          The aggregated table is already up to date
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {state === "updating" && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Updating database...</span>
              </div>
            )}

            {state === "success" && result && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="py-8">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <p className="text-white font-semibold">
                      Update Completed Successfully
                    </p>
                    <p className="text-gray-400">
                      {result.insertedCount} transactions added to the
                      aggregated table
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {state === "error" && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="py-8">
                  <div className="text-center">
                    <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                    <p className="text-white font-semibold">Error Occurred</p>
                    <p className="text-gray-400">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            {state === "preview" && preview && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpdate}
                  disabled={preview.newTransactions.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Confirm Update ({preview.summary.totalNew} transactions)
                </Button>
              </>
            )}
            {(state === "success" || state === "error") && (
              <Button
                onClick={handleClose}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Close
              </Button>
            )}
            {state === "updating" && (
              <Button disabled className="bg-gray-600 text-white">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
