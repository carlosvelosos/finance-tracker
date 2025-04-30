"use client";

import { Bill } from "../types/bill";

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

  return (
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
            className={`text-sm ${isPaid ? "text-gray-400" : "text-gray-600"}`}
          >
            Due: {bill.due_day}
          </p>
          <p
            className={`text-sm ${isPaid ? "text-gray-400" : "text-gray-600"}`}
          >
            Payment: {bill.payment_method}
          </p>
        </div>
        <p className={`font-bold text-lg ${isPaid ? "text-gray-500" : ""}`}>
          {formatCurrency(currentValue, bill.country)}
        </p>
      </div>
    </div>
  );
}
