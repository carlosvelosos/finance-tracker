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
              ? "bg-gray-800 border-gray-700 text-gray-400"
              : "bg-[#2f2f2f] border-gray-700 hover:bg-gray-800"
          }`}
          onClick={() => onTogglePaid(bill.id)}
        >
          <div className="flex items-center">
            <p
              className={`font-medium text-gray-400 ${
                isPaid ? "line-through" : ""
              }`}
            >
              {bill.due_day}
            </p>
            <span className="mx-2 text-gray-500">|</span>
            <h3
              className={`font-medium text-gray-200 ${
                isPaid ? "line-through" : ""
              }`}
            >
              {bill.description}
            </h3>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-[#212121] border-gray-700 text-gray-200">
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">
            {bill.description}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium text-gray-300">Country:</div>
            <div>{bill.country}</div>

            <div className="font-medium text-gray-300">Due Day:</div>
            <div>{bill.due_day}</div>

            <div className="font-medium text-gray-300">Payment Method:</div>
            <div>{bill.payment_method}</div>

            <div className="font-medium text-gray-300">Base Value:</div>
            <div>{formatCurrency(bill.base_value, bill.country)}</div>

            <div className="font-medium text-gray-300">Current Value:</div>
            <div>{formatCurrency(currentValue, bill.country)}</div>

            <div className="font-medium text-gray-300">Current Status:</div>
            <div className={isPaid ? "text-green-400" : "text-red-400"}>
              {isPaid ? "Paid" : "Pending"}
            </div>

            <div className="font-medium text-gray-300">Created:</div>
            <div>{formatDate(bill.created_at)}</div>

            <div className="font-medium text-gray-300">Last Updated:</div>
            <div>{formatDate(bill.updated_at)}</div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              Click to toggle payment status
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
