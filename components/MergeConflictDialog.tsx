/**
 * MERGE CONFLICT DIALOG COMPONENT
 *
 * Main dialog for reviewing and resolving transaction conflicts.
 * Features:
 * - Summary statistics
 * - Bulk action buttons
 * - Filter/sort/search controls
 * - Side-by-side comparison view
 * - Commit validation
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ConflictAnalysis,
  ConflictMatch,
  Transaction,
  initializeDefaultDecisions,
  applyUserDecisions,
} from "@/app/actions/conflictAnalysis";
import { ConflictRow } from "@/components/ConflictRow";
import { TransactionRow } from "@/components/TransactionRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  CheckCircleIcon,
  XCircleIcon,
  RotateCcwIcon,
  AlertCircleIcon,
  DatabaseIcon,
} from "lucide-react";

interface MergeConflictDialogProps {
  analysis: ConflictAnalysis;
  onResolve: (transactionsToAdd: Transaction[]) => void;
  onCancel: () => void;
  open: boolean;
}

type FilterType = "all" | "safe" | "conflicts" | "skipped";
type SortType = "date" | "amount" | "matchScore";

export function MergeConflictDialog({
  analysis,
  onResolve,
  onCancel,
  open,
}: MergeConflictDialogProps) {
  // State for user decisions (conflict ID -> action)
  const [decisions, setDecisions] = useState<Map<number, "add" | "skip">>(
    new Map(),
  );

  // UI state
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize decisions with defaults when analysis changes
  useEffect(() => {
    const defaultDecisions = initializeDefaultDecisions(analysis.conflicts);
    setDecisions(defaultDecisions);
  }, [analysis]);

  // Calculate counts
  const counts = useMemo(() => {
    const toAdd =
      analysis.safeToAdd.length +
      Array.from(decisions.values()).filter((d) => d === "add").length;
    const toSkip =
      analysis.autoSkipped.length +
      Array.from(decisions.values()).filter((d) => d === "skip").length;

    return {
      safe: analysis.safeToAdd.length,
      conflicts: analysis.conflicts.length,
      skipped: analysis.autoSkipped.length,
      existing: analysis.existingTransactions.length,
      toAdd,
      toSkip,
    };
  }, [analysis, decisions]);

  // Handle decision change
  const handleDecision = (conflict: ConflictMatch, action: "add" | "skip") => {
    const newDecisions = new Map(decisions);
    newDecisions.set(conflict.newTransaction.id, action);
    setDecisions(newDecisions);
  };

  // Bulk actions
  const handleAddAllSafe = () => {
    // Safe transactions are already auto-approved, nothing to do
    // This is more for user feedback
  };

  const handleSkipAllConflicts = () => {
    const newDecisions = new Map(decisions);
    analysis.conflicts.forEach((conflict) => {
      newDecisions.set(conflict.newTransaction.id, "skip");
    });
    setDecisions(newDecisions);
  };

  const handleResetDecisions = () => {
    const defaultDecisions = initializeDefaultDecisions(analysis.conflicts);
    setDecisions(defaultDecisions);
  };

  // Filter and sort conflicts
  const filteredConflicts = useMemo(() => {
    let filtered = [...analysis.conflicts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.newTransaction.Description.toLowerCase().includes(query) ||
          (c.newTransaction.Date && c.newTransaction.Date.includes(query)) ||
          c.newTransaction.Amount.toString().includes(query),
      );
    }

    // Apply filter type
    if (filter === "conflicts") {
      // Already showing only conflicts
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          const dateA = a.newTransaction.Date || "";
          const dateB = b.newTransaction.Date || "";
          return dateA.localeCompare(dateB); // Oldest first
        case "amount":
          return (
            Math.abs(b.newTransaction.Amount) -
            Math.abs(a.newTransaction.Amount)
          );
        case "matchScore":
          return b.matchScore - a.matchScore;
        default:
          return 0;
      }
    });

    return filtered;
  }, [analysis.conflicts, filter, sortBy, searchQuery]);

  // Handle commit
  const handleCommit = () => {
    const transactionsToAdd = applyUserDecisions(analysis, decisions);
    onResolve(transactionsToAdd);
  };

  // Handle cancel with confirmation if there are changes
  const handleCancel = () => {
    // TODO: Add confirmation dialog if user has made decisions
    onCancel();
  };

  // Check if user can commit
  const canCommit = counts.toAdd > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Review Upload Conflicts - {analysis.tableName}
          </DialogTitle>
          <DialogDescription>
            {analysis.conflicts.length > 0
              ? `Found ${analysis.conflicts.length} potential duplicate${analysis.conflicts.length > 1 ? "s" : ""}. Review and decide which transactions to add.`
              : "No conflicts found. All transactions are new."}
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <StatCard
            label="New Transactions"
            count={counts.safe}
            color="green"
            icon={<CheckCircleIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Conflicts"
            count={counts.conflicts}
            color="yellow"
            icon={<AlertCircleIcon className="h-5 w-5" />}
            subtitle={counts.conflicts > 0 ? "Need your review" : undefined}
          />
          <StatCard
            label="To Skip"
            count={counts.skipped}
            color="gray"
            icon={<XCircleIcon className="h-5 w-5" />}
          />
          <StatCard
            label="In Database"
            count={counts.existing}
            color="blue"
            icon={<DatabaseIcon className="h-5 w-5" />}
          />
        </div>

        {/* Bulk Actions Toolbar */}
        {analysis.conflicts.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleAddAllSafe}>
              <CheckCircleIcon className="mr-2 h-4 w-4" />
              Add All Safe ({counts.safe})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipAllConflicts}
            >
              <XCircleIcon className="mr-2 h-4 w-4" />
              Skip All Conflicts ({counts.conflicts})
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetDecisions}>
              <RotateCcwIcon className="mr-2 h-4 w-4" />
              Reset Decisions
            </Button>
          </div>
        )}

        {/* Filter, Sort, Search Bar */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as FilterType)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="safe">Safe to Add</SelectItem>
              <SelectItem value="conflicts">Conflicts Only</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortType)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="matchScore">Match Score</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
        </div>

        {/* Side-by-Side Table Comparison View */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4">
            {/* LEFT SIDE: Current Database Table */}
            <div className="border rounded-lg bg-blue-50 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-blue-200 bg-blue-50 sticky top-0">
                <h3 className="text-base font-bold text-blue-800">
                  📊 Current Database ({analysis.tableName})
                </h3>
                <div className="text-xs text-blue-700 mt-1">
                  {analysis.existingTransactions.length} existing transaction
                  {analysis.existingTransactions.length !== 1 ? "s" : ""}
                </div>
              </div>

              {analysis.existingTransactions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <DatabaseIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Empty table - no existing data</p>
                </div>
              ) : (
                <div className="flex-1">
                  <table className="w-full text-xs border-collapse">
                    <thead className="bg-blue-100">
                      <tr className="border-b-2 border-blue-300">
                        <th className="px-2 py-2 text-left font-semibold text-blue-900">
                          ID
                        </th>
                        <th className="px-2 py-2 text-left font-semibold text-blue-900">
                          Date
                        </th>
                        <th className="px-2 py-2 text-left font-semibold text-blue-900">
                          Description
                        </th>
                        <th className="px-2 py-2 text-right font-semibold text-blue-900">
                          Amount
                        </th>
                        <th className="px-2 py-2 text-left font-semibold text-blue-900">
                          Category
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.existingTransactions
                        .slice()
                        .sort((a, b) => {
                          const dateA = a.Date || "";
                          const dateB = b.Date || "";
                          return dateA.localeCompare(dateB); // Oldest first
                        })
                        .map((txn) => {
                          const isHighlighted = analysis.conflicts.some((c) =>
                            c.possibleDuplicates.some((d) => d.id === txn.id),
                          );
                          return (
                            <ExistingTransactionRow
                              key={txn.id}
                              transaction={txn}
                              isHighlighted={isHighlighted}
                            />
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Future State Table (New Upload) */}
            <div className="border rounded-lg bg-gray-50 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-base font-bold text-gray-800">
                  ⬆️ New Upload + Decisions
                </h3>
                <div className="text-xs text-gray-700 mt-1">
                  {counts.toAdd} transaction{counts.toAdd !== 1 ? "s" : ""} will
                  be added
                </div>
              </div>

              <div className="flex-1">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-100">
                    <tr className="border-b-2 border-gray-300">
                      <th className="px-2 py-2 text-left font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-900">
                        Description
                      </th>
                      <th className="px-2 py-2 text-right font-semibold text-gray-900">
                        Amount
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Combine all new transactions
                      const allNewTransactions: Array<{
                        transaction: Transaction;
                        type: "safe" | "conflict" | "skipped";
                        conflict?: ConflictMatch;
                      }> = [
                        ...analysis.safeToAdd.map((txn) => ({
                          transaction: txn,
                          type: "safe" as const,
                        })),
                        ...analysis.conflicts.map((c) => ({
                          transaction: c.newTransaction,
                          type: "conflict" as const,
                          conflict: c,
                        })),
                        ...analysis.autoSkipped.map((txn) => ({
                          transaction: txn,
                          type: "skipped" as const,
                        })),
                      ];

                      // Sort by date
                      allNewTransactions.sort((a, b) => {
                        const dateA = a.transaction.Date || "";
                        const dateB = b.transaction.Date || "";
                        return dateA.localeCompare(dateB); // Oldest first
                      });

                      // Render rows
                      return allNewTransactions.map((item, index) => {
                        if (item.type === "conflict" && item.conflict) {
                          return (
                            <ConflictTransactionRow
                              key={item.transaction.id}
                              conflict={item.conflict}
                              decision={decisions.get(item.transaction.id)}
                              onDecide={(action) =>
                                handleDecision(item.conflict!, action)
                              }
                            />
                          );
                        } else {
                          return (
                            <NewTransactionRow
                              key={item.transaction.id}
                              transaction={item.transaction}
                              status={item.type === "safe" ? "safe" : "skipped"}
                            />
                          );
                        }
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Summary and Actions */}
        <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-700 pt-4 mt-4">
          <div className="flex-1 text-sm text-gray-400">
            Summary: {counts.toAdd} to add, {counts.toSkip} to skip
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel Upload
            </Button>
            <Button onClick={handleCommit} disabled={!canCommit}>
              Commit {counts.toAdd} Transaction{counts.toAdd !== 1 ? "s" : ""} →
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  label: string;
  count: number;
  color: "green" | "yellow" | "gray" | "blue";
  icon: React.ReactNode;
  subtitle?: string;
}

function StatCard({ label, count, color, icon, subtitle }: StatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "green":
        return "bg-green-50 border-green-200 text-green-700";
      case "yellow":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "gray":
        return "bg-gray-50 border-gray-200 text-gray-700";
      case "blue":
        return "bg-blue-50 border-blue-200 text-blue-700";
    }
  };

  return (
    <Card className={`p-4 border ${getColorClasses()}`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold">{count}</div>
          <div className="text-sm font-medium truncate">{label}</div>
          {subtitle && <div className="text-xs opacity-75">{subtitle}</div>}
        </div>
      </div>
    </Card>
  );
}

/**
 * Formatting helper functions
 */
const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("sv-SE");
  } catch {
    return dateStr;
  }
};

/**
 * Table Row Components
 */

// Existing transaction row for LEFT panel
interface ExistingTransactionRowProps {
  transaction: Transaction;
  isHighlighted: boolean;
}

function ExistingTransactionRow({
  transaction,
  isHighlighted,
}: ExistingTransactionRowProps) {
  return (
    <tr
      className={`border-b hover:bg-blue-100 h-8 ${
        isHighlighted ? "bg-yellow-100" : "bg-white"
      }`}
    >
      <td className="px-2 py-2 text-gray-700 whitespace-nowrap">
        {transaction.id}
      </td>
      <td className="px-2 py-2 text-gray-900 whitespace-nowrap">
        {formatDate(transaction.Date)}
      </td>
      <td
        className="px-2 py-2 max-w-xs truncate text-gray-900"
        title={transaction.Description || "N/A"}
      >
        {transaction.Description || "N/A"}
      </td>
      <td className="px-2 py-2 text-right whitespace-nowrap font-medium text-gray-900">
        {formatCurrency(transaction.Amount)}
      </td>
      <td className="px-2 py-2 text-gray-700 whitespace-nowrap">
        {transaction.Category || "Uncategorized"}
      </td>
    </tr>
  );
}

// New transaction row for safe/skipped items in RIGHT panel
interface NewTransactionRowProps {
  transaction: Transaction;
  status: "safe" | "skipped";
}

function NewTransactionRow({ transaction, status }: NewTransactionRowProps) {
  return (
    <tr
      className={`border-b h-8 ${
        status === "safe"
          ? "bg-green-50 hover:bg-green-100"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
    >
      <td className="px-2 py-2 whitespace-nowrap text-gray-900">
        {formatDate(transaction.Date)}
      </td>
      <td
        className="px-2 py-2 max-w-xs truncate text-gray-900"
        title={transaction.Description || "N/A"}
      >
        {transaction.Description || "N/A"}
      </td>
      <td className="px-2 py-2 text-right whitespace-nowrap font-medium text-gray-900">
        {formatCurrency(transaction.Amount)}
      </td>
      <td className="px-2 py-2 text-center whitespace-nowrap">
        {status === "safe" ? (
          <CheckCircleIcon className="h-4 w-4 text-green-600 inline" />
        ) : (
          <XCircleIcon className="h-4 w-4 text-gray-500 inline" />
        )}
      </td>
      <td className="px-2 py-2 text-center whitespace-nowrap">
        <span className="text-xs text-gray-500">
          {status === "safe" ? "Auto-add" : "Auto-skip"}
        </span>
      </td>
    </tr>
  );
}

// Conflict transaction row with action buttons for RIGHT panel
interface ConflictTransactionRowProps {
  conflict: ConflictMatch;
  decision: "add" | "skip" | undefined;
  onDecide: (action: "add" | "skip") => void;
}

function ConflictTransactionRow({
  conflict,
  decision,
  onDecide,
}: ConflictTransactionRowProps) {
  const getBorderColor = () => {
    if (conflict.matchLevel === 1) return "border-l-4 border-l-red-500";
    if (conflict.matchLevel === 2) return "border-l-4 border-l-orange-500";
    if (conflict.matchLevel === 3) return "border-l-4 border-l-yellow-500";
    return "border-l-4 border-l-gray-400";
  };

  return (
    <tr
      className={`border-b h-8 bg-yellow-50 hover:bg-yellow-100 ${getBorderColor()}`}
    >
      <td className="px-2 py-2 whitespace-nowrap text-gray-900">
        {formatDate(conflict.newTransaction.Date)}
      </td>
      <td
        className="px-2 py-2 max-w-xs truncate text-gray-900"
        title={conflict.newTransaction.Description || "N/A"}
      >
        {conflict.newTransaction.Description || "N/A"}
      </td>
      <td className="px-2 py-2 text-right whitespace-nowrap font-medium text-gray-900">
        {formatCurrency(conflict.newTransaction.Amount)}
      </td>
      <td className="px-2 py-2 text-center whitespace-nowrap">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            conflict.matchLevel === 1
              ? "bg-red-200 text-red-800"
              : conflict.matchLevel === 2
                ? "bg-orange-200 text-orange-800"
                : conflict.matchLevel === 3
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-gray-200 text-gray-700"
          }`}
        >
          {conflict.matchLevel === 1
            ? "100%"
            : conflict.matchLevel === 2
              ? "90%"
              : conflict.matchLevel === 3
                ? "70%"
                : "50%"}
        </span>
      </td>
      <td className="px-2 py-2 text-center whitespace-nowrap">
        <div className="flex gap-1 justify-center">
          <Button
            size="sm"
            variant={decision === "add" ? "default" : "outline"}
            onClick={() => onDecide("add")}
            className="h-6 px-2 text-[10px]"
          >
            Add
          </Button>
          <Button
            size="sm"
            variant={decision === "skip" ? "default" : "outline"}
            onClick={() => onDecide("skip")}
            className="h-6 px-2 text-[10px]"
          >
            Skip
          </Button>
        </div>
      </td>
    </tr>
  );
}
