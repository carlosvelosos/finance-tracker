/**
 * TRANSACTION ROW COMPONENT
 *
 * Displays a transaction that is either:
 * - Safe to add (no conflicts)
 * - Auto-skipped (exact duplicate)
 *
 * Simpler than ConflictRow since no user action is needed
 */

"use client";

import { Transaction } from "@/app/actions/conflictAnalysis";
import { CheckIcon, XIcon } from "lucide-react";

interface TransactionRowProps {
  transaction: Transaction;
  status: "safe" | "skipped";
}

export function TransactionRow({ transaction, status }: TransactionRowProps) {
  const getBackgroundColor = (): string => {
    return status === "safe" ? "bg-green-50" : "bg-gray-50";
  };

  const getBorderColor = (): string => {
    return status === "safe" ? "border-green-500" : "border-gray-400";
  };

  const getIcon = () => {
    return status === "safe" ? (
      <CheckIcon className="h-5 w-5 text-green-600" />
    ) : (
      <XIcon className="h-5 w-5 text-gray-500" />
    );
  };

  const getStatusText = (): string => {
    return status === "safe" ? "✓ Will be added" : "✗ Skipped";
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
      className={`border-l-4 ${getBorderColor()} ${getBackgroundColor()} p-3 mb-2 rounded-r-md`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">
                {formatDate(transaction.Date)}
              </span>
              <span className="text-xs text-gray-500">{getStatusText()}</span>
            </div>
            <div className="text-sm text-gray-700 truncate">
              {transaction.Description}
            </div>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {formatCurrency(transaction.Amount)}
            </div>
          </div>
        </div>
      </div>
      {status === "skipped" && (
        <div className="mt-2 text-xs text-gray-500">
          (100% match - Auto-skipped)
        </div>
      )}
    </div>
  );
}
