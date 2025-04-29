"use client";

import { Bill } from "../types/bill";
import BillItem from "./bill-item";

interface BillCardProps {
  month: string;
  bills: Bill[];
  onNextMonth: () => void;
  onPrevMonth: () => void;
  onTogglePaid: (id: number) => void;
  title: string;
  country: string;
  valueColor?: string;
}

export default function BillCard({
  month,
  bills,
  onNextMonth,
  onPrevMonth,
  onTogglePaid,
  title,
  country,
  valueColor = "text-blue-600",
}: BillCardProps) {
  const countryBills = bills.filter((bill) => bill.country === country);
  const totalValue = countryBills
    .filter((bill) => !bill.paid)
    .reduce((sum, bill) => sum + bill.value, 0);

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

  const unpaidBillsCount = countryBills.filter((bill) => !bill.paid).length;

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
            {formatCurrency(totalValue, country)}
          </p>
          <p className="text-sm text-gray-600">
            {unpaidBillsCount} unpaid bills
          </p>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {countryBills.map((bill) => (
            <BillItem key={bill.id} bill={bill} onTogglePaid={onTogglePaid} />
          ))}
        </div>
      </div>
    </div>
  );
}
