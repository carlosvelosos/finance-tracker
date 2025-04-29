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
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth()
  );

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

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from("current_month_bills")
        .select("*");

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentMonthIndex((prev) => (prev + 1) % 12);
  };

  const prevMonth = () => {
    setCurrentMonthIndex((prev) => (prev - 1 + 12) % 12);
  };

  const handleTogglePaid = async (id: number) => {
    try {
      const { error } = await supabase.rpc("toggle_current_month_status", {
        bill_id: id,
      });

      if (error) throw error;
      await fetchBills(); // Refresh the bills after update
    } catch (error) {
      console.error("Error toggling bill status:", error);
    }
  };

  // Calculate total per country
  const totalsPerCountry = bills.reduce((acc, bill) => {
    if (!bill.current_month_status) {
      acc[bill.country] =
        (acc[bill.country] || 0) +
        (bill.current_month_value || bill.base_value);
    }
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          Bills to Be Paid
        </h1>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <BillCard
            month={months[currentMonthIndex]}
            bills={bills}
            onNextMonth={nextMonth}
            onPrevMonth={prevMonth}
            onTogglePaid={handleTogglePaid}
            title="Sweden Bills"
            country="Sweden"
            valueColor="text-blue-600"
          />
          <BillCard
            month={months[currentMonthIndex]}
            bills={bills}
            onNextMonth={nextMonth}
            onPrevMonth={prevMonth}
            onTogglePaid={handleTogglePaid}
            title="Brazil Bills"
            country="Brazil"
            valueColor="text-green-600"
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
            <TableRow className="border-b-4 border-gray-600">
              <TableHead className="font-bold">Description</TableHead>
              <TableHead className="font-bold">Due Day</TableHead>
              <TableHead className="font-bold">Payment Method</TableHead>
              <TableHead className="font-bold">Country</TableHead>
              <TableHead className="font-bold">Value</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow
                key={bill.id}
                className={
                  bill.current_month_status ? "bg-gray-100 text-gray-500" : ""
                }
              >
                <TableCell
                  className={bill.current_month_status ? "line-through" : ""}
                >
                  {bill.description}
                </TableCell>
                <TableCell>{bill.due_day}</TableCell>
                <TableCell>{bill.payment_method}</TableCell>
                <TableCell
                  style={{
                    color:
                      bill.country === "Brazil"
                        ? "green"
                        : bill.country === "Sweden"
                        ? "blue"
                        : "black",
                    fontWeight: "bold",
                  }}
                >
                  {bill.country}
                </TableCell>
                <TableCell>
                  {(bill.current_month_value || bill.base_value).toLocaleString(
                    "en-US",
                    {
                      style: "currency",
                      currency: countryCurrencyMap[bill.country] || "USD",
                    }
                  )}
                </TableCell>
                <TableCell>
                  {bill.current_month_status ? "Paid" : "Pending"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ProtectedRoute>
  );
}
