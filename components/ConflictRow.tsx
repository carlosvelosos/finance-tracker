/**
 * CONFLICT ROW COMPONENT
 *
 * Displays an individual transaction conflict with:
 * - Color-coded border based on match level
 * - Transaction details (date, description, amount)
 * - Match information (score, reason)
 * - Action buttons (Add Anyway / Skip)
 * - Expandable view of similar existing transactions
 */

"use client";

import { useState } from "react";
import { ConflictMatch, Transaction } from "@/app/actions/conflictAnalysis";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckIcon,
  XIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react";

interface ConflictRowProps {
  conflict: ConflictMatch;
  decision?: "add" | "skip";
  onDecide: (action: "add" | "skip") => void;
}

export function ConflictRow({
  conflict,
  decision,
  onDecide,
}: ConflictRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get styling based on match level and user decision
  const getBorderColor = (): string => {
    if (decision === "add") return "border-green-600";
    if (decision === "skip") return "border-gray-500";

    switch (conflict.borderColor) {
      case "red":
        return "border-red-500";
      case "orange":
        return "border-orange-500";
      case "yellow":
        return "border-yellow-500";
      case "gray":
        return "border-gray-400";
      default:
        return "border-yellow-500";
    }
  };

  const getBackgroundColor = (): string => {
    if (decision === "add") return "bg-green-100";
    if (decision === "skip") return "bg-gray-100";
    return "bg-yellow-50";
  };

  const getStatusIcon = (): string => {
    if (decision === "add") return "✓";
    if (decision === "skip") return "✗";
    return "⚠️";
  };

  const getMatchBadgeVariant = ():
    | "default"
    | "secondary"
    | "destructive"
    | "outline" => {
    if (conflict.matchLevel === 1) return "destructive";
    if (conflict.matchLevel === 2) return "destructive";
    if (conflict.matchLevel === 3) return "secondary";
    return "outline";
  };

  const formatCurrency = (amount: number): string => {
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

  return (
    <div
      className={`border-l-4 ${getBorderColor()} ${getBackgroundColor()} p-4 mb-3 rounded-r-md transition-all duration-200`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Date and Status Icon */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl" role="img" aria-label="status">
              {getStatusIcon()}
            </span>
            <span className="font-semibold text-lg text-gray-900">
              {formatDate(conflict.newTransaction.Date)}
            </span>
            <Badge variant={getMatchBadgeVariant()}>
              {conflict.matchScore}% match
            </Badge>
          </div>

          {/* Description */}
          <div className="mt-2 text-gray-800 font-medium truncate">
            {conflict.newTransaction.Description}
          </div>

          {/* Amount */}
          <div className="mt-1 text-lg font-bold text-gray-900">
            {formatCurrency(conflict.newTransaction.Amount)}
          </div>

          {/* Match Information */}
          <div className="mt-2 text-sm text-gray-600">
            {conflict.matchReason}
          </div>
          <div className="mt-1 text-xs text-blue-600">
            Similar to DB ID:{" "}
            {conflict.possibleDuplicates.map((d) => d.id).join(", ")}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant={decision === "add" ? "default" : "outline"}
            className={
              decision === "add"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "border-green-600 text-green-600 hover:bg-green-50"
            }
            onClick={() => onDecide("add")}
          >
            <CheckIcon className="mr-1 h-4 w-4" />
            Add Anyway
          </Button>
          <Button
            size="sm"
            variant={decision === "skip" ? "default" : "outline"}
            className={
              decision === "skip"
                ? "bg-gray-600 hover:bg-gray-700 text-white"
                : "border-gray-600 text-gray-600 hover:bg-gray-50"
            }
            onClick={() => onDecide("skip")}
          >
            <XIcon className="mr-1 h-4 w-4" />
            Skip
          </Button>
        </div>
      </div>

      {/* Expandable Details - Similar Transactions */}
      <Collapsible
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="mt-3"
      >
        <CollapsibleTrigger className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors">
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
          View {conflict.possibleDuplicates.length} similar transaction
          {conflict.possibleDuplicates.length > 1 ? "s" : ""} in database
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2">
          {conflict.possibleDuplicates.map((dup) => (
            <SimilarTransactionCard key={dup.id} transaction={dup} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * Card showing a similar existing transaction from the database
 */
function SimilarTransactionCard({ transaction }: { transaction: Transaction }) {
  const formatCurrency = (amount: number): string => {
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

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              DB ID: {transaction.id}
            </span>
            <span className="text-sm text-gray-700">
              {formatDate(transaction.Date)}
            </span>
          </div>
          <div className="text-sm text-gray-800 truncate">
            {transaction.Description}
          </div>
          <div className="text-sm font-bold text-gray-900 mt-1">
            {formatCurrency(transaction.Amount)}
          </div>
        </div>
        <div className="text-xs text-gray-500 text-right flex-shrink-0">
          {transaction.Category && (
            <div className="mb-1">
              <span className="font-medium">Category:</span>{" "}
              {transaction.Category}
            </div>
          )}
          {transaction.Comment && (
            <div className="mb-1">
              <span className="font-medium">Comment:</span>{" "}
              {transaction.Comment}
            </div>
          )}
          {transaction.Balance !== undefined && (
            <div>
              <span className="font-medium">Balance:</span>{" "}
              {formatCurrency(transaction.Balance)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
