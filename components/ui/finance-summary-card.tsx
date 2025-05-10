import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Transaction } from "@/types/transaction"; // Assuming you have a types file

interface FinanceSummaryCardProps {
  amandaTransactions: Transaction[];
  usTransactions: Transaction[];
  usTransactionsAmanda: Transaction[];
}

export function FinanceSummaryCard({
  amandaTransactions,
  usTransactions,
  usTransactionsAmanda,
}: FinanceSummaryCardProps) {
  // Calculate the balance once to avoid repetition
  const amandaBalance =
    amandaTransactions.reduce(
      (total, transaction) => total + (transaction.Amount || 0),
      0,
    ) +
    usTransactions.reduce(
      (total, transaction) => total + (transaction.Amount || 0),
      0,
    ) /
      2 -
    usTransactionsAmanda.reduce(
      (total, transaction) => total + (transaction.Amount || 0),
      0,
    ) /
      2;

  // Format the balance
  const formattedBalance = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    signDisplay: "always",
  }).format(amandaBalance);

  return (
    <Card className="border border-gray-300 shadow-none">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stack vertically on all screens for simplicity */}
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Amanda&apos;s balance:</span>
            <span
              className={`font-semibold text-lg break-words ${
                amandaBalance >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {formattedBalance}
            </span>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="summary">
              <AccordionTrigger>Summary Description</AccordionTrigger>
              <AccordionContent>
                {" "}
                <p className="text-xs mb-6">
                  This page provides a detailed breakdown of Amanda&apos;s and
                  Carlos&apos; shared and individual expenses. Amanda can view
                  her personal transactions, shared expenses, and the total
                  amounts calculated for each category.
                </p>{" "}
                <p className="text-xs mb-6">
                  <strong>Amanda&apos;s Balance:</strong> The amount displayed
                  at the top represents Amanda&apos;s current financial
                  standing. It&apos;s calculated by adding Amanda&apos;s
                  personal transactions, plus half of shared expenses that
                  Carlos paid (which Amanda owes), minus half of shared expenses
                  that Amanda paid (which Carlos owes), and also includes
                  expenses that Carlos paid but should be fully paid by Amanda.
                  A positive balance (green) means Carlos owes Amanda money,
                  while a negative balance (red) means Amanda owes Carlos.
                </p>
                <p className="text-xs mb-6">
                  The carousel section displays financial data organized by
                  events and purposes. It includes cards for: Amanda&apos;s
                  personal expenses, Sweden trip (Dec 24 - Jan 25), Brazil trip
                  (Feb - Mar 25), Amanda&apos;s PIX transactions, and wedding
                  expenses for Karlinha and Perna. Each card summarizes the
                  expenses related to these specific events and time periods.
                </p>
                <p className="text-xs mb-6">
                  The tables section at the bottom shows two complementary
                  views: &quot;Carlos&apos; Transactions&quot; displays expenses
                  categorized by who should pay (Amanda, shared expenses, or
                  Carlos), while &quot;Amanda&apos;s Transactions&quot; shows
                  expenses that should be accounted for in Amanda&apos;s
                  finances, including her portion of shared expenses. This dual
                  view helps track both who initially paid for expenses and how
                  they should be distributed between Amanda and Carlos.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
