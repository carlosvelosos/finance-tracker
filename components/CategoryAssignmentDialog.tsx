/**
 * CATEGORY ASSIGNMENT DIALOG COMPONENT
 *
 * Step 2 of upload process: Suggest and apply categories to newly uploaded transactions
 * Features:
 * - Side-by-side comparison (similar transactions vs new transaction)
 * - Confidence-based suggestions
 * - Accept/Edit/Skip actions per transaction
 * - Bulk actions for high confidence matches
 * - Inline status messages (no toasts)
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CategoryAnalysis,
  CategoryMatch,
  CategoryDecision,
  initializeCategoryDecisions,
  applyCategoryDecisions,
} from "@/app/actions/categoryAnalysis";
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
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon } from "lucide-react";

interface CategoryAssignmentDialogProps {
  analysis: CategoryAnalysis;
  onComplete: () => void;
  onSkip: () => void;
  open: boolean;
}

type FilterType = "all" | "high" | "medium" | "low" | "none";
type StatusType = "loading" | "success" | "error" | "info" | "warning" | null;

export function CategoryAssignmentDialog({
  analysis,
  onComplete,
  onSkip,
  open,
}: CategoryAssignmentDialogProps) {
  // State for user decisions (transaction ID -> decision)
  const [decisions, setDecisions] = useState<Map<number, CategoryDecision>>(
    new Map(),
  );

  // UI state
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Status state
  const [status, setStatus] = useState<{
    type: StatusType;
    message: string;
    detail?: string;
    progress?: { current: number; total: number; label: string };
  }>({ type: null, message: "" });

  // Initialize decisions when analysis changes
  useEffect(() => {
    if (open && analysis) {
      const defaultDecisions = initializeCategoryDecisions(analysis.matches);
      setDecisions(defaultDecisions);
      setStatus({ type: null, message: "" });
    }
  }, [analysis, open]);

  // Filter matches based on confidence and search
  const filteredMatches = useMemo(() => {
    let filtered = [...analysis.matches];

    // Apply confidence filter
    switch (filter) {
      case "high":
        filtered = filtered.filter((m) => m.confidence > 85);
        break;
      case "medium":
        filtered = filtered.filter(
          (m) => m.confidence >= 50 && m.confidence <= 85,
        );
        break;
      case "low":
        filtered = filtered.filter(
          (m) => m.confidence > 0 && m.confidence < 50,
        );
        break;
      case "none":
        filtered = filtered.filter((m) => m.confidence === 0);
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.newTransaction.Description.toLowerCase().includes(query) ||
          (m.newTransaction.Date && m.newTransaction.Date.includes(query)) ||
          m.suggestedCategory.toLowerCase().includes(query),
      );
    }

    // Sort by date (oldest first)
    filtered.sort((a, b) => {
      const dateA = a.newTransaction.Date || "";
      const dateB = b.newTransaction.Date || "";
      return dateA.localeCompare(dateB);
    });

    return filtered;
  }, [analysis.matches, filter, searchQuery]);

  // Calculate counts based on current decisions
  const counts = useMemo(() => {
    const accepted = Array.from(decisions.values()).filter(
      (d) => d.action === "accept",
    ).length;
    const edited = Array.from(decisions.values()).filter(
      (d) => d.action === "edit",
    ).length;
    const skipped = Array.from(decisions.values()).filter(
      (d) => d.action === "skip",
    ).length;

    return { accepted, edited, skipped, total: decisions.size };
  }, [decisions]);

  // Handle decision change for a single transaction
  const handleDecision = (
    match: CategoryMatch,
    action: "accept" | "edit" | "skip",
    newCategory?: string,
  ) => {
    const newDecisions = new Map(decisions);
    newDecisions.set(match.newTransaction.id, {
      transactionId: match.newTransaction.id,
      category: newCategory || match.suggestedCategory,
      action,
    });
    setDecisions(newDecisions);
  };

  // Bulk actions
  const handleAcceptAllHigh = () => {
    const newDecisions = new Map(decisions);
    analysis.matches
      .filter((m) => m.confidence > 85)
      .forEach((m) => {
        newDecisions.set(m.newTransaction.id, {
          transactionId: m.newTransaction.id,
          category: m.suggestedCategory,
          action: "accept",
        });
      });
    setDecisions(newDecisions);
  };

  const handleSkipAllLow = () => {
    const newDecisions = new Map(decisions);
    analysis.matches
      .filter((m) => m.confidence < 50)
      .forEach((m) => {
        newDecisions.set(m.newTransaction.id, {
          transactionId: m.newTransaction.id,
          category: "Unknown",
          action: "skip",
        });
      });
    setDecisions(newDecisions);
  };

  // Apply categories to Supabase
  const handleApplyCategories = async () => {
    setStatus({
      type: "loading",
      message: "Applying categories to transactions...",
      progress: { current: 0, total: counts.total, label: "updated" },
    });

    try {
      const decisionsArray = Array.from(decisions.values());
      const result = await applyCategoryDecisions(
        analysis.tableName,
        decisionsArray,
      );

      if (result.success) {
        setStatus({
          type: "success",
          message: `Successfully categorized ${result.updated} transactions!`,
          detail: `${counts.accepted} accepted, ${counts.edited} edited, ${counts.skipped} skipped`,
        });

        // Wait a moment to show success message, then complete
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setStatus({
          type: "error",
          message: "Failed to update categories",
          detail: result.message,
        });
      }
    } catch (error) {
      console.error("Error applying categories:", error);
      setStatus({
        type: "error",
        message: "Failed to update categories",
        detail:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  // Handle skip with confirmation
  const handleSkipClick = () => {
    setStatus({
      type: "warning",
      message: 'Categories will remain as "Unknown"',
      detail: "You can manually categorize them later in the app.",
    });
  };

  const handleConfirmSkip = () => {
    onSkip();
  };

  // Get confidence badge
  const getConfidenceBadge = (confidence: number) => {
    if (confidence > 85) {
      return (
        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
          🟢 {confidence}%
        </span>
      );
    } else if (confidence >= 50) {
      return (
        <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
          🟡 {confidence}%
        </span>
      );
    } else if (confidence > 0) {
      return (
        <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded">
          🔴 {confidence}%
        </span>
      );
    } else {
      return (
        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
          ⚪ No match
        </span>
      );
    }
  };

  const statusStyles = {
    loading: "bg-blue-900/20 border-blue-700 text-blue-300",
    success: "bg-green-900/20 border-green-700 text-green-300",
    error: "bg-red-900/20 border-red-700 text-red-300",
    info: "bg-gray-800 border-gray-600 text-gray-300",
    warning: "bg-yellow-900/20 border-yellow-700 text-yellow-300",
  };

  const isApplying = status.type === "loading";
  const isSuccess = status.type === "success";
  const isWarning = status.type === "warning";

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            📂 Assign Categories - Step 2 of 2
          </DialogTitle>
          <DialogDescription>
            Reviewing {analysis.matches.length} newly added transaction
            {analysis.matches.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Card className="p-3 bg-green-900/20 border-green-700">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {analysis.stats.highConfidence}
                </div>
                <div className="text-xs text-green-300">High Confidence</div>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-yellow-900/20 border-yellow-700">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {analysis.stats.mediumConfidence}
                </div>
                <div className="text-xs text-yellow-300">Needs Review</div>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-red-900/20 border-red-700">
            <div className="flex items-center gap-2">
              <XCircleIcon className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {analysis.stats.lowConfidence + analysis.stats.noMatch}
                </div>
                <div className="text-xs text-red-300">Low/No Match</div>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-blue-900/20 border-blue-700">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {counts.accepted + counts.edited}
                </div>
                <div className="text-xs text-blue-300">To Apply</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAcceptAllHigh}
            disabled={isApplying || isSuccess}
          >
            <CheckCircleIcon className="mr-2 h-4 w-4" />
            Accept All High Confidence ({analysis.stats.highConfidence})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipAllLow}
            disabled={isApplying || isSuccess}
          >
            <XCircleIcon className="mr-2 h-4 w-4" />
            Skip All Low Confidence (
            {analysis.stats.lowConfidence + analysis.stats.noMatch})
          </Button>
        </div>

        {/* Filter and Search */}
        <div className="flex gap-2 mb-4">
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as FilterType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Matches</SelectItem>
              <SelectItem value="high">High Confidence</SelectItem>
              <SelectItem value="medium">Medium Confidence</SelectItem>
              <SelectItem value="low">Low Confidence</SelectItem>
              <SelectItem value="none">No Match</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Transactions List - All items, no pagination */}
        <div className="mb-4 border border-gray-700 rounded-lg p-4 bg-[#1E1E1E] max-h-96 overflow-y-auto">
          <p className="text-sm text-gray-300 mb-4">
            Showing {filteredMatches.length} transaction
            {filteredMatches.length !== 1 ? "s" : ""}
          </p>
          {filteredMatches.map((match) => {
            const decision = decisions.get(match.newTransaction.id);
            return (
              <div
                key={match.newTransaction.id}
                className="mb-3 p-3 border border-gray-600 rounded bg-[#121212]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {match.newTransaction.Description}
                    </div>
                    <div className="text-sm text-gray-400">
                      {match.newTransaction.Date} |{" "}
                      {match.newTransaction.Amount} kr
                    </div>
                  </div>
                  {getConfidenceBadge(match.confidence)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-300">
                    Suggested:{" "}
                    <strong className="text-green-400">
                      {match.suggestedCategory}
                    </strong>
                  </span>
                  <div className="flex gap-1 ml-auto">
                    <Button
                      size="sm"
                      variant={
                        decision?.action === "accept" ? "default" : "outline"
                      }
                      onClick={() => handleDecision(match, "accept")}
                      disabled={isApplying || isSuccess}
                      className="h-6 px-2 text-xs"
                    >
                      ✓ Accept
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        decision?.action === "skip" ? "default" : "outline"
                      }
                      onClick={() => handleDecision(match, "skip")}
                      disabled={isApplying || isSuccess}
                      className="h-6 px-2 text-xs"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Area */}
        {status.type && (
          <div
            className={`mb-4 p-3 rounded-lg border ${statusStyles[status.type]}`}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="font-medium">{status.message}</div>
                {status.detail && (
                  <div className="text-sm opacity-80 mt-1">{status.detail}</div>
                )}
              </div>
            </div>
            {status.progress && (
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(status.progress.current / status.progress.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {status.progress.current} / {status.progress.total}{" "}
                  {status.progress.label}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-gray-300 pt-4 flex justify-between">
          <Button
            variant="ghost"
            onClick={onComplete}
            disabled={isApplying}
            className="text-gray-600"
          >
            ← Back to Upload
          </Button>

          <div className="flex gap-2">
            {isWarning ? (
              <Button
                onClick={handleConfirmSkip}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Confirm Skip →
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleSkipClick}
                  disabled={isApplying || isSuccess}
                >
                  Skip Categorization
                </Button>
                <Button
                  onClick={handleApplyCategories}
                  disabled={
                    isApplying ||
                    isSuccess ||
                    counts.accepted + counts.edited === 0
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSuccess
                    ? "Done"
                    : isApplying
                      ? "Applying..."
                      : `Apply Categories →`}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
