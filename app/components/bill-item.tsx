"use client";

import { Bill } from "../types/bill";

interface BillItemProps {
  bill: Bill;
  onTogglePaid: (id: number) => void;
}

export default function BillItem({ bill, onTogglePaid }: BillItemProps) {
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
        bill.paid
          ? "bg-gray-200 border-gray-300 text-gray-500"
          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
      }`}
      onClick={() => onTogglePaid(bill.id)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-medium ${bill.paid ? "line-through" : ""}`}>
            {bill.description}
          </h3>
          <p
            className={`text-sm ${
              bill.paid ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Due: {new Date(bill.dueDay).toLocaleDateString()}
          </p>
          <p
            className={`text-sm ${
              bill.paid ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Payment: {bill.paymentMethod}
          </p>
        </div>
        <p className={`font-bold text-lg ${bill.paid ? "text-gray-500" : ""}`}>
          {formatCurrency(bill.value, bill.country)}
        </p>
      </div>
    </div>
  );
}
