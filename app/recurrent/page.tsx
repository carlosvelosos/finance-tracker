"use client";

import { useState, useEffect } from "react";
import React from "react";
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
import { BillChart } from "@/components/ui/bill-chart";
import { Label } from "../../components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  const [selectedCountry, setSelectedCountry] = useState<
    "Sweden" | "Brazil" | "Both" | "None"
  >("Both");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Bill | "currentValue" | "";
    direction: "ascending" | "descending";
  }>({ key: "", direction: "ascending" });

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

  const handleBillUpdate = (updatedBill: Bill) => {
    // Update the bills array with the updated bill
    setBills((prevBills) =>
      prevBills.map((bill) => (bill.id === updatedBill.id ? updatedBill : bill))
    );
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

  // Sort function that handles different data types
  const sortedBills = React.useMemo(() => {
    if (!sortConfig.key) return bills;

    return [...bills].sort((a, b) => {
      let aValue, bValue;

      // Handle special case for current month's value
      if (sortConfig.key === "currentValue") {
        const monthAbbr = months[currentMonthIndex]
          .toLowerCase()
          .substring(0, 3);
        const valueField = `${monthAbbr}_value` as keyof Bill;

        aValue =
          typeof a[valueField] === "number" ? a[valueField] : a.base_value;
        bValue =
          typeof b[valueField] === "number" ? b[valueField] : b.base_value;
      } else {
        aValue = a[sortConfig.key as keyof Bill];
        bValue = b[sortConfig.key as keyof Bill];
      }

      // Handle different data types for sorting
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // For boolean, numbers, etc.
      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [bills, sortConfig, currentMonthIndex, months]);

  // Handle column header click for sorting
  const handleSort = (key: keyof Bill | "currentValue") => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        // Toggle direction if same key
        return {
          key,
          direction:
            prevConfig.direction === "ascending" ? "descending" : "ascending",
        };
      } else {
        // New sort key, default to ascending
        return { key, direction: "ascending" };
      }
    });
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#898989]">
          Bills to Be Paid
        </h1>

        {/* Country Selection with ToggleGroup */}
        <div className="flex items-center justify-between mb-4 p-4 rounded-md text-[#898989]">
          <div className="flex items-center">
            <Label className="mr-3 font-medium">Select Country:</Label>
            <ToggleGroup
              type="multiple"
              value={
                selectedCountry === "None"
                  ? []
                  : selectedCountry === "Both"
                  ? ["Sweden", "Brazil"]
                  : [selectedCountry]
              }
              onValueChange={(values) => {
                if (values.length === 0) {
                  // Allow "None" selection
                  setSelectedCountry("None");
                } else if (
                  values.includes("Sweden") &&
                  values.includes("Brazil")
                ) {
                  setSelectedCountry("Both");
                } else if (values.includes("Sweden")) {
                  setSelectedCountry("Sweden");
                } else if (values.includes("Brazil")) {
                  setSelectedCountry("Brazil");
                }
              }}
              className="border-none flex gap-3"
            >
              <ToggleGroupItem
                value="Sweden"
                className="border-none rounded-md text-[#4d4d4d] data-[state=on]:bg-[#00fd42] data-[state=on]:text-[#051526]"
              >
                Sweden
              </ToggleGroupItem>
              <ToggleGroupItem
                value="Brazil"
                className="border-none rounded-md text-[#4d4d4d] data-[state=on]:bg-[#00fd42] data-[state=on]:text-[#051526]"
              >
                Brazil
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Display totals per country */}
          <div className="flex gap-4">
            {Object.entries(totalsPerCountry).map(([country, total]) => (
              <div key={country} className="text-lg font-medium">
                <span className="font-bold">{country}:</span>{" "}
                {total.toLocaleString("en-US", {
                  style: "currency",
                  currency: countryCurrencyMap[country] || "USD",
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(selectedCountry === "Sweden" || selectedCountry === "Both") && (
              <BillChart
                bills={bills}
                months={months}
                country="Sweden"
                className={selectedCountry === "Both" ? "" : "md:col-span-2"}
                color="hsl(var(--chart-1))"
              />
            )}
            {(selectedCountry === "Brazil" || selectedCountry === "Both") && (
              <BillChart
                bills={bills}
                months={months}
                country="Brazil"
                className={selectedCountry === "Both" ? "" : "md:col-span-2"}
                color="hsl(var(--chart-3))"
              />
            )}
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {(selectedCountry === "Sweden" || selectedCountry === "Both") && (
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
              onBillUpdate={handleBillUpdate}
            />
          )}
          {(selectedCountry === "Brazil" || selectedCountry === "Both") && (
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
              onBillUpdate={handleBillUpdate}
            />
          )}
        </div>

        {/* Table Section */}
        <Table className="mb-10">
          <TableHeader className="[&_tr]:border-[#00fd42]">
            <TableRow>
              <TableHead
                className="text-white cursor-pointer hover:bg-gray-800 transition-colors w-[20%]"
                onClick={() => handleSort("description")}
              >
                <div className="flex items-center">
                  <span className="flex-1">Description</span>
                  {sortConfig.key === "description" && (
                    <span className="ml-1 inline-block w-4">
                      {sortConfig.direction === "ascending" ? "↑" : "↓"}
                    </span>
                  )}
                  {sortConfig.key !== "description" && (
                    <span className="ml-1 inline-block w-4"></span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="text-white cursor-pointer hover:bg-gray-800 transition-colors w-[10%]"
                onClick={() => handleSort("due_day")}
              >
                <div className="flex items-center">
                  <span className="flex-1">Due Day</span>
                  {sortConfig.key === "due_day" && (
                    <span className="ml-1 inline-block w-4">
                      {sortConfig.direction === "ascending" ? "↑" : "↓"}
                    </span>
                  )}
                  {sortConfig.key !== "due_day" && (
                    <span className="ml-1 inline-block w-4"></span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="text-white cursor-pointer hover:bg-gray-800 transition-colors w-[15%]"
                onClick={() => handleSort("payment_method")}
              >
                <div className="flex items-center">
                  <span className="flex-1">Payment Method</span>
                  {sortConfig.key === "payment_method" && (
                    <span className="ml-1 inline-block w-4">
                      {sortConfig.direction === "ascending" ? "↑" : "↓"}
                    </span>
                  )}
                  {sortConfig.key !== "payment_method" && (
                    <span className="ml-1 inline-block w-4"></span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="text-white cursor-pointer hover:bg-gray-800 transition-colors w-[10%]"
                onClick={() => handleSort("country")}
              >
                <div className="flex items-center">
                  <span className="flex-1">Country</span>
                  {sortConfig.key === "country" && (
                    <span className="ml-1 inline-block w-4">
                      {sortConfig.direction === "ascending" ? "↑" : "↓"}
                    </span>
                  )}
                  {sortConfig.key !== "country" && (
                    <span className="ml-1 inline-block w-4"></span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="text-white cursor-pointer hover:bg-gray-800 transition-colors w-[15%]"
                onClick={() => handleSort("currentValue")}
              >
                <div className="flex items-center">
                  <span className="flex-1">Value</span>
                  {sortConfig.key === "currentValue" && (
                    <span className="ml-1 inline-block w-4">
                      {sortConfig.direction === "ascending" ? "↑" : "↓"}
                    </span>
                  )}
                  {sortConfig.key !== "currentValue" && (
                    <span className="ml-1 inline-block w-4"></span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="text-white cursor-pointer hover:bg-gray-800 transition-colors w-[10%]"
                onClick={() => handleSort(statusField)}
              >
                <div className="flex items-center">
                  <span className="flex-1">Status</span>
                  {sortConfig.key === statusField && (
                    <span className="ml-1 inline-block w-4">
                      {sortConfig.direction === "ascending" ? "↑" : "↓"}
                    </span>
                  )}
                  {sortConfig.key !== statusField && (
                    <span className="ml-1 inline-block w-4"></span>
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:not(:last-child)]:border-[#232323] text-[#898989] hover:text-[#000000]">
            {sortedBills
              .filter((bill) => {
                if (selectedCountry === "Both") return true;
                if (selectedCountry === "None") return false;
                return bill.country === selectedCountry;
              })
              .map((bill, index, filteredArray) => {
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
                const isLastRow = index === filteredArray.length - 1;

                return (
                  <TableRow
                    key={bill.id}
                    className={`${isPaid ? "bg-gray-100 text-gray-500" : ""} ${
                      isLastRow ? "!border-b-2 !border-b-green-500" : ""
                    }`}
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
