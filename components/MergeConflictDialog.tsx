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
          return dateB.localeCompare(dateA);
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
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Safe to Add Section */}
          {(filter === "all" || filter === "safe") &&
            analysis.safeToAdd.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-3">
                  Safe to Add ({analysis.safeToAdd.length})
                </h3>
                <div className="space-y-2">
                  {analysis.safeToAdd.slice(0, 5).map((txn) => (
                    <TransactionRow
                      key={txn.id}
                      transaction={txn}
                      status="safe"
                    />
                  ))}
                  {analysis.safeToAdd.length > 5 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      ... and {analysis.safeToAdd.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Conflicts Section */}
          {(filter === "all" || filter === "conflicts") &&
            filteredConflicts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-700 mb-3">
                  Conflicts ({filteredConflicts.length})
                </h3>
                <div className="space-y-3">
                  {filteredConflicts.map((conflict) => (
                    <ConflictRow
                      key={conflict.newTransaction.id}
                      conflict={conflict}
                      decision={decisions.get(conflict.newTransaction.id)}
                      onDecide={(action) => handleDecision(conflict, action)}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Auto-Skipped Section */}
          {(filter === "all" || filter === "skipped") &&
            analysis.autoSkipped.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-3">
                  Auto-Skipped ({analysis.autoSkipped.length})
                </h3>
                <div className="space-y-2">
                  {analysis.autoSkipped.slice(0, 3).map((txn) => (
                    <TransactionRow
                      key={txn.id}
                      transaction={txn}
                      status="skipped"
                    />
                  ))}
                  {analysis.autoSkipped.length > 3 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      ... and {analysis.autoSkipped.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}
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
