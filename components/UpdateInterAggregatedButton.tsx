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
  getInterUpdatePreview,
  executeInterUpdate,
  previewInterTableTransactions,
  InterUpdatePreview,
  InterUpdateResult,
} from "@/app/actions/updateActions";
import { Loader2, Plus, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { Checkbox } from "@/components/ui/checkbox";

type UpdateState =
  | "idle"
  | "loading"
  | "preview"
  | "updating"
  | "success"
  | "error";

export default function UpdateInterAggregatedButton() {
  const [state, setState] = useState<UpdateState>("idle");
  const [preview, setPreview] = useState<InterUpdatePreview | null>(null);
  const [result, setResult] = useState<InterUpdateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [previewTransactions, setPreviewTransactions] = useState<Transaction[]>(
    [],
  );

  const handleStartUpdate = async () => {
    setState("loading");
    setError(null);
    setIsDialogOpen(true);

    try {
      const previewData = await getInterUpdatePreview();
      setPreview(previewData);
      // Start with no tables selected by default - user must choose
      setSelectedTables([]);
      setState("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
      setState("error");
    }
  };

  const handleTableSelection = async (tableName: string, checked: boolean) => {
    let newSelectedTables: string[];
    if (checked) {
      newSelectedTables = [...selectedTables, tableName];
    } else {
      newSelectedTables = selectedTables.filter((t) => t !== tableName);
    }
    setSelectedTables(newSelectedTables);

    // Update preview transactions
    if (newSelectedTables.length > 0) {
      try {
        const transactions =
          await previewInterTableTransactions(newSelectedTables);
        setPreviewTransactions(transactions);
      } catch (err) {
        console.error("Error loading preview transactions:", err);
        setPreviewTransactions([]);
      }
    } else {
      setPreviewTransactions([]);
    }
  };

  const handleConfirmUpdate = async () => {
    if (selectedTables.length === 0) return;

    setState("updating");

    try {
      const updateResult = await executeInterUpdate(selectedTables);
      setResult(updateResult);
      setState(updateResult.success ? "success" : "error");
      if (!updateResult.success) {
        setError(updateResult.message);
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
    setSelectedTables([]);
    setPreviewTransactions([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <>
      <Button
        onClick={handleStartUpdate}
        disabled={state === "loading" || state === "updating"}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading Preview...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Update Inter Data
          </>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Update Brasil Transactions Aggregated 2025 - Inter Bank Data
            </DialogTitle>
            <DialogDescription>
              {state === "preview" &&
                "Select Inter tables to aggregate into Brasil_transactions_agregated_2025"}
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
                <span>Analyzing Inter tables...</span>
              </div>
            )}

            {state === "preview" && preview && (
              <div className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5 text-green-400" />
                      Inter Tables Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">
                          Already Included Tables:
                        </span>
                        <p className="text-white font-semibold">
                          {preview.sourceTablesIncluded.length}
                        </p>
                        {preview.sourceTablesIncluded.length > 0 && (
                          <div className="text-xs text-gray-400 max-h-20 overflow-y-auto">
                            {preview.sourceTablesIncluded.join(", ")}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-400">
                          Available New Tables:
                        </span>
                        <p className="text-white font-semibold">
                          {preview.availableNewTables.length}
                        </p>
                        {preview.availableNewTables.length > 0 && (
                          <div className="text-xs text-gray-400 max-h-20 overflow-y-auto">
                            {preview.availableNewTables.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {preview.availableNewTables.length > 0 ||
                preview.sourceTablesIncluded.length > 0 ? (
                  <>
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Select Tables to Process
                        </CardTitle>
                        <CardDescription>
                          Choose which Inter tables to aggregate/synchronize
                          with Brasil_transactions_agregated_2025. Already
                          included tables can be re-processed to find and add
                          any new transactions that weren&apos;t previously
                          included.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {preview.sourceTablesIncluded.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-yellow-400 mb-2">
                                Already Included Tables (can be re-processed to
                                find new transactions):
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {preview.sourceTablesIncluded.map((table) => (
                                  <div
                                    key={table}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={table}
                                      checked={selectedTables.includes(table)}
                                      onCheckedChange={(checked) =>
                                        handleTableSelection(table, !!checked)
                                      }
                                    />
                                    <label
                                      htmlFor={table}
                                      className="text-sm text-yellow-300 cursor-pointer"
                                    >
                                      {table}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {preview.availableNewTables.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-green-400 mb-2">
                                New Tables (never been aggregated):
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {preview.availableNewTables.map((table) => (
                                  <div
                                    key={table}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={table}
                                      checked={selectedTables.includes(table)}
                                      onCheckedChange={(checked) =>
                                        handleTableSelection(table, !!checked)
                                      }
                                    />
                                    <label
                                      htmlFor={table}
                                      className="text-sm text-green-300 cursor-pointer"
                                    >
                                      {table}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedTables.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-400">
                              Selected: {selectedTables.length} table(s)
                            </p>
                            <p className="text-sm text-gray-400">
                              New transactions to add:{" "}
                              {previewTransactions.length}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {previewTransactions.length > 0 && (
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white">
                            Preview New Transactions (
                            {previewTransactions.length})
                          </CardTitle>
                          <CardDescription>
                            Shows only transactions from selected tables that
                            are NOT yet in Brasil_transactions_agregated_2025
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-64 overflow-auto">
                            <div className="space-y-2">
                              {previewTransactions
                                .slice(0, 20)
                                .map((transaction, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-2 bg-gray-700 rounded text-sm"
                                  >
                                    <div className="flex-1">
                                      <p className="text-white font-medium">
                                        {transaction.Description}
                                      </p>
                                      <p className="text-gray-400">
                                        {transaction.Date
                                          ? formatDate(transaction.Date)
                                          : "No date"}{" "}
                                        • {transaction.source_table}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p
                                        className={`font-semibold ${
                                          (transaction.Amount || 0) >= 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }`}
                                      >
                                        {formatCurrency(
                                          transaction.Amount || 0,
                                        )}
                                      </p>
                                      {transaction.Bank && (
                                        <p className="text-gray-400 text-xs">
                                          {transaction.Bank}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              {previewTransactions.length > 20 && (
                                <div className="text-center text-gray-400 py-2">
                                  ... and {previewTransactions.length - 20} more
                                  transactions
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="py-8">
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                        <p className="text-white font-semibold">
                          No new Inter tables to aggregate
                        </p>
                        <p className="text-gray-400">
                          All available Inter tables are already included in
                          Brasil_transactions_agregated_2025
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
                    <p className="text-gray-400 mb-2">{result.message}</p>
                    {result.tablesIncluded &&
                      result.tablesIncluded.length > 0 && (
                        <div className="text-xs text-gray-400 max-h-20 overflow-y-auto">
                          Tables processed: {result.tablesIncluded.join(", ")}
                        </div>
                      )}
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
                  disabled={selectedTables.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Confirm Update ({selectedTables.length} tables,{" "}
                  {previewTransactions.length} new transactions)
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
