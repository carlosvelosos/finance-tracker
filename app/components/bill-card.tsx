"use client";

import { Bill } from "../types/bill";
import BillItem from "./bill-item";

interface BillCardProps {
  month: string;
  bills: Bill[];
  onNextMonth: () => void;
  onPrevMonth: () => void;
  title: string;
  country: string;
  valueColor?: string;
}

export default function BillCard({
  month,
  bills,
  onNextMonth,
  onPrevMonth,
  title,
  country,
  valueColor = "text-blue-600",
}: BillCardProps) {
  const countryBills = bills.filter((bill) => bill.country === country);
  const totalValue = countryBills.reduce((sum, bill) => sum + bill.value, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          ←
        </button>
        <p className="text-2xl font-medium">{month}</p>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          →
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className={`text-3xl font-bold ${valueColor}`}>
            {totalValue.toLocaleString("en-US", {
              style: "currency",
              currency: country === "Sweden" ? "SEK" : "BRL",
            })}
          </p>
          <p className="text-sm text-gray-600">{countryBills.length} bills</p>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {countryBills.map((bill) => (
            <BillItem key={bill.id} bill={bill} />
          ))}
        </div>
      </div>
    </div>
  );
}
