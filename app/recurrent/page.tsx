"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProtectedRoute from "@/components/protected-route";
import BillCard from "../components/bill-card";
import { Bill } from "../types/bill";
import { supabase } from "@/lib/supabaseClient";

// Mapping of countries to their respective currencies
const countryCurrencyMap: Record<string, string> = {
  Sweden: "SEK",
  Brazil: "BRL",
};

export default function BillsPage() {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    months[new Date().getMonth()]
  );
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth()
  );

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase.from("recurrent_2025").select("*");

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        console.error("Error fetching bills:", JSON.stringify(error, null, 2));
      } else {
        console.error("Error fetching bills:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaid = async (id: number) => {
    if (updating) return; // Prevent multiple simultaneous updates
    try {
      setUpdating(true);
      const monthField = months[currentMonthIndex]
        .toLowerCase()
        .substring(0, 3);
      const statusField = `${monthField}_status` as keyof Bill;
      const currentBill = bills.find((bill) => bill.id === id);
      if (!currentBill) throw new Error("Bill not found");

      const newStatus = !currentBill[statusField];
      if (typeof newStatus !== "boolean") return;

      // Optimistically update UI
      setBills((prevBills) =>
        prevBills.map((bill) =>
          bill.id === id
            ? ({ ...bill, [statusField]: newStatus } as Bill)
            : bill
        )
      );

      const { error } = await supabase
        .from("recurrent_2025")
        .update({ [statusField]: newStatus })
        .eq("id", id);

      if (error) {
        // Revert optimistic update on error
        setBills((prevBills) =>
          prevBills.map((bill) =>
            bill.id === id
              ? ({ ...bill, [statusField]: currentBill[statusField] } as Bill)
              : bill
          )
        );
        throw error;
      }
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        console.error(
          "Error toggling bill status:",
          JSON.stringify(error, null, 2)
        );
      } else {
        console.error("Error toggling bill status:", error);
      }
    } finally {
      setUpdating(false);
    }
  };

  // Handler for direct month selection from carousel
  const handleMonthChange = (monthName: string) => {
    const newIndex = months.findIndex((m) => m === monthName);
    if (newIndex !== -1 && newIndex !== currentMonthIndex) {
      setCurrentMonthIndex(newIndex);
      setCurrentMonth(monthName);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const nextMonth = () => {
    const newIndex = (currentMonthIndex + 1) % 12;
    setCurrentMonthIndex(newIndex);
    setCurrentMonth(months[newIndex]);
  };

  const prevMonth = () => {
    const newIndex = (currentMonthIndex - 1 + 12) % 12;
    setCurrentMonthIndex(newIndex);
    setCurrentMonth(months[newIndex]);
  };

  // Calculate total per country
  const monthAbbr = months[currentMonthIndex].toLowerCase().substring(0, 3);
  const statusField = `${monthAbbr}_status` as keyof Bill;
  const valueField = `${monthAbbr}_value` as keyof Bill;

  const totalsPerCountry = bills.reduce((acc, bill) => {
    if (!bill[statusField]) {
      const monthValue = bill[valueField];
      acc[bill.country] =
        (acc[bill.country] || 0) +
        (typeof monthValue === "number" ? monthValue : bill.base_value);
    }
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#898989]">
          Bills to Be Paid
        </h1>

        {/* Cards Section */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <BillCard
            month={currentMonth}
            bills={bills}
            onNextMonth={nextMonth}
            onPrevMonth={prevMonth}
            onTogglePaid={handleTogglePaid}
            title="Sweden"
            country="Sweden"
            valueColor="text-blue-600"
            onMonthChange={handleMonthChange}
          />
          <BillCard
            month={currentMonth}
            bills={bills}
            onNextMonth={nextMonth}
            onPrevMonth={prevMonth}
            onTogglePaid={handleTogglePaid}
            title="Brazil"
            country="Brazil"
            valueColor="text-green-600"
            onMonthChange={handleMonthChange}
          />
        </div>

        {/* Display totals per country */}
        <div className="mb-4 flex gap-4 bg-gray-50 p-4 rounded-md">
          {Object.entries(totalsPerCountry).map(([country, total]) => (
            <div key={country} className="text-lg font-medium">
              <span className="font-bold">{country}:</span>{" "}
              {total.toLocaleString("en-US", {
                style: "currency",
                currency: countryCurrencyMap[country] || "USD", // Default to USD if country is not mapped
              })}
            </div>
          ))}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Due Day</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => {
              const monthAbbr = months[currentMonthIndex]
                .toLowerCase()
                .substring(0, 3);
              const statusField = `${monthAbbr}_status` as keyof Bill;
              const valueField = `${monthAbbr}_value` as keyof Bill;
              const currentValue =
                typeof bill[valueField] === "number"
                  ? (bill[valueField] as number)
                  : bill.base_value;
              const isPaid = bill[statusField];

              return (
                <TableRow
                  key={bill.id}
                  className={isPaid ? "bg-gray-100 text-gray-500" : ""}
                >
                  <TableCell className={isPaid ? "line-through" : ""}>
                    {bill.description}
                  </TableCell>
                  <TableCell>{bill.due_day}</TableCell>
                  <TableCell>{bill.payment_method}</TableCell>
                  <TableCell>{bill.country}</TableCell>
                  <TableCell>
                    {bill.country === "Brazil"
                      ? `R$ ${currentValue.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : currentValue.toLocaleString("en-US", {
                          style: "currency",
                          currency: "SEK",
                        })}
                  </TableCell>
                  <TableCell>{isPaid ? "Paid" : "Pending"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ProtectedRoute>
  );
}
