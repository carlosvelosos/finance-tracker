"use client";

import { Bill } from "../types/bill";

interface BillItemProps {
  bill: Bill;
}

export default function BillItem({ bill }: BillItemProps) {
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
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{bill.description}</h3>
          <p className="text-sm text-gray-600">
            Due: {new Date(bill.dueDay).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">Payment: {bill.paymentMethod}</p>
        </div>
        <p className="font-bold text-lg">
          {formatCurrency(bill.value, bill.country)}
        </p>
      </div>
    </div>
  );
}
