"use client";

import { Bill } from "../types/bill";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface BillItemProps {
  bill: Bill;
  onTogglePaid: (id: number) => void;
  month: string;
}

export default function BillItem({ bill, onTogglePaid, month }: BillItemProps) {
  const monthAbbr = month.toLowerCase().substring(0, 3);
  const statusField = `${monthAbbr}_status` as keyof Bill;
  const valueField = `${monthAbbr}_value` as keyof Bill;

  const isPaid = bill[statusField];
  const currentValue =
    typeof bill[valueField] === "number"
      ? (bill[valueField] as number)
      : bill.base_value;

  const formatCurrency = (value: number, country: string) => {
    if (country === "Brazil") {
      return `R$ ${value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "SEK",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={`p-4 rounded-lg border transition-colors cursor-pointer ${
            isPaid
              ? "bg-gray-200 border-gray-300 text-gray-500"
              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          }`}
          onClick={() => onTogglePaid(bill.id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-medium ${isPaid ? "line-through" : ""}`}>
                {bill.description}
              </h3>
              <p
                className={`text-sm ${
                  isPaid ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Due: {bill.due_day}
              </p>
              <p
                className={`text-sm ${
                  isPaid ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Payment: {bill.payment_method}
              </p>
            </div>
            <p className={`font-bold text-lg ${isPaid ? "text-gray-500" : ""}`}>
              {formatCurrency(currentValue, bill.country)}
            </p>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-lg font-semibold">{bill.description}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Country:</div>
            <div>{bill.country}</div>

            <div className="font-medium">Due Day:</div>
            <div>{bill.due_day}</div>

            <div className="font-medium">Payment Method:</div>
            <div>{bill.payment_method}</div>

            <div className="font-medium">Base Value:</div>
            <div>{formatCurrency(bill.base_value, bill.country)}</div>

            <div className="font-medium">Current Value:</div>
            <div>{formatCurrency(currentValue, bill.country)}</div>

            <div className="font-medium">Current Status:</div>
            <div className={isPaid ? "text-green-600" : "text-red-600"}>
              {isPaid ? "Paid" : "Pending"}
            </div>

            <div className="font-medium">Created:</div>
            <div>{formatDate(bill.created_at)}</div>

            <div className="font-medium">Last Updated:</div>
            <div>{formatDate(bill.updated_at)}</div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Click to toggle payment status
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
