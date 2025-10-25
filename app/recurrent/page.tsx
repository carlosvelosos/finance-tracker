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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

// Mapping of countries to their respective currencies
const countryCurrencyMap: Record<string, string> = {
  Sweden: "SEK",
  Brazil: "BRL",
};

// Move MONTHS array outside component to avoid recreating on every render
const MONTHS = [
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

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    MONTHS[new Date().getMonth()],
  );
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth(),
  );
  const [selectedCountry, setSelectedCountry] = useState<
    "Sweden" | "Brazil" | "Both" | "None"
  >("Both");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Bill | "currentValue" | "";
    direction: "ascending" | "descending";
  }>({ key: "", direction: "ascending" });

  // State for the new expense form
  const [newExpense, setNewExpense] = useState({
    description: "",
    due_day: 1,
    payment_method: "",
    country: "Sweden",
    base_value: 0,
    is_credit_card: false,
    credit_card_name: null as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const monthField = MONTHS[currentMonthIndex]
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
            : bill,
        ),
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
              : bill,
          ),
        );
        throw error;
      }
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        console.error(
          "Error toggling bill status:",
          JSON.stringify(error, null, 2),
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
      prevBills.map((bill) =>
        bill.id === updatedBill.id ? updatedBill : bill,
      ),
    );
  };

  // Handle adding a new expense
  const handleExpenseSubmit = async () => {
    if (
      !newExpense.description ||
      !newExpense.payment_method ||
      newExpense.base_value <= 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      // Initialize all month statuses to false (unpaid)
      const statusFields: Record<string, boolean> = {};
      MONTHS.forEach((month) => {
        const monthAbbr = month.toLowerCase().substring(0, 3);
        statusFields[`${monthAbbr}_status`] = false;
      });

      // Insert the new expense into Supabase
      const { data, error } = await supabase
        .from("recurrent_2025")
        .insert({
          description: newExpense.description,
          due_day: newExpense.due_day,
          payment_method: newExpense.payment_method,
          country: newExpense.country,
          base_value: newExpense.base_value,
          is_credit_card: newExpense.is_credit_card,
          credit_card_name: newExpense.credit_card_name,
          ...statusFields,
        })
        .select();

      if (error) throw error;

      // Add the new bill to the state
      if (data && data.length > 0) {
        setBills((prevBills) => [...prevBills, data[0] as Bill]);

        // Show success toast notification
        toast.success(
          `New expense "${newExpense.description}" was added successfully`,
          {
            description: `${
              newExpense.country
            } - ${newExpense.base_value.toLocaleString("en-US", {
              style: "currency",
              currency: countryCurrencyMap[newExpense.country] || "USD",
            })}`,
            duration: 5000,
          },
        );
      }

      // Reset the form
      setNewExpense({
        description: "",
        due_day: 1,
        payment_method: "",
        country: "Sweden",
        base_value: 0,
        is_credit_card: false,
        credit_card_name: null,
      });
    } catch (error) {
      console.error("Error adding expense:", error);

      // Show error toast notification
      toast.error("Failed to add expense", {
        description:
          "There was an error saving your expense to the database. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for direct month selection from carousel
  const handleMonthChange = (monthName: string) => {
    const newIndex = MONTHS.findIndex((m) => m === monthName);
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
    setCurrentMonth(MONTHS[newIndex]);
  };

  const prevMonth = () => {
    const newIndex = (currentMonthIndex - 1 + 12) % 12;
    setCurrentMonthIndex(newIndex);
    setCurrentMonth(MONTHS[newIndex]);
  };

  // Calculate cumulative totals per country (from January to current month)
  const cumulativeTotalsPerCountry = bills.reduce(
    (acc, bill) => {
      // Create an array of month abbreviations from January to the current month
      const relevantMonths = MONTHS.slice(0, currentMonthIndex + 1).map(
        (month) => month.toLowerCase().substring(0, 3),
      );

      let totalForBill = 0;

      // Sum up values for all MONTHS from January to current month
      relevantMonths.forEach((monthAbbr) => {
        const valueField = `${monthAbbr}_value` as keyof Bill;
        const monthValue =
          typeof bill[valueField] === "number"
            ? (bill[valueField] as number)
            : bill.base_value;

        totalForBill += monthValue;
      });

      // Add to country total
      acc[bill.country] = (acc[bill.country] || 0) + totalForBill;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Calculate total per country for current month (for table filtering and sorting)
  const monthAbbr = MONTHS[currentMonthIndex].toLowerCase().substring(0, 3);
  const statusField = `${monthAbbr}_status` as keyof Bill;

  // Sort function that handles different data types
  const sortedBills = React.useMemo(() => {
    if (!sortConfig.key) return bills;

    return [...bills].sort((a, b) => {
      let aValue, bValue;

      // Handle special case for current month's value
      if (sortConfig.key === "currentValue") {
        const monthAbbr = MONTHS[currentMonthIndex]
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

      // Add null checks to handle possible null values
      // Convert null/undefined to empty string or 0 for comparison
      const safeAValue = aValue ?? (typeof bValue === "string" ? "" : 0);
      const safeBValue = bValue ?? (typeof aValue === "string" ? "" : 0);

      if (safeAValue < safeBValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (safeAValue > safeBValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [bills, sortConfig, currentMonthIndex]);

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

        <div className="flex items-center justify-between mb-4 p-4">
          {/* Country Selection with ToggleGroup */}
          <div className="flex items-center">
            <Label className="mr-3 font-medium">Select Country:</Label>
            <ToggleGroup
              type="multiple"
              variant={"green"}
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
            >
              <ToggleGroupItem value="Sweden">Sweden</ToggleGroupItem>
              <ToggleGroupItem value="Brazil">Brazil</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Display cumulative totals from January to current month */}
          <div className="flex gap-4">
            {Object.entries(cumulativeTotalsPerCountry).map(
              ([country, total]) => (
                <div key={country} className="text-lg font-medium">
                  <span className="font-bold">{country}:</span>{" "}
                  {total.toLocaleString("en-US", {
                    style: "currency",
                    currency: countryCurrencyMap[country] || "USD",
                  })}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Line Chart Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(selectedCountry === "Sweden" || selectedCountry === "Both") && (
              <BillChart
                bills={bills}
                months={MONTHS}
                country="Sweden"
                className={selectedCountry === "Both" ? "" : "md:col-span-2"}
                color="hsl(var(--chart-1))"
              />
            )}
            {(selectedCountry === "Brazil" || selectedCountry === "Both") && (
              <BillChart
                bills={bills}
                months={MONTHS}
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
                  <span className="ml-1 inline-block w-4">
                    {sortConfig.key === "description" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </span>
                </div>
              </TableHead>
              <TableHead
                className="text-white cursor-pointer hover:bg-gray-800 transition-colors w-[10%]"
                onClick={() => handleSort("due_day")}
              >
                <div className="flex items-center">
                  <span className="flex-1">Due Day</span>
                  <span className="ml-1 inline-block w-4">
                    {sortConfig.key === "due_day" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </span>
                </div>
              </TableHead>
              <TableHead
                className="text-white cursor-pointer hover:bg-gray-800 transition-colors w-[15%]"
                onClick={() => handleSort("payment_method")}
              >
                <div className="flex items-center">
                  <span className="flex-1">Payment Method</span>
                  <span className="ml-1 inline-block w-4">
                    {sortConfig.key === "payment_method" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </span>
                </div>
              </TableHead>
              <TableHead
                className="text-white cursor-pointer hover:bg-gray-800 transition-colors w-[10%]"
                onClick={() => handleSort("country")}
              >
                <div className="flex items-center">
                  <span className="flex-1">Country</span>
                  <span className="ml-1 inline-block w-4">
                    {sortConfig.key === "country" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </span>
                </div>
              </TableHead>
              <TableHead
                className="text-white cursor-pointer hover:bg-gray-800 transition-colors w-[15%]"
                onClick={() => handleSort("currentValue")}
              >
                <div className="flex items-center">
                  <span className="flex-1">Value</span>
                  <span className="ml-1 inline-block w-4">
                    {sortConfig.key === "currentValue" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </span>
                </div>
              </TableHead>
              <TableHead
                className="text-white cursor-pointer hover:bg-gray-800 transition-colors w-[10%]"
                onClick={() => handleSort(statusField)}
              >
                <div className="flex items-center">
                  <span className="flex-1">Status</span>
                  <span className="ml-1 inline-block w-4">
                    {sortConfig.key === statusField &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </span>
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
                const monthAbbr = MONTHS[currentMonthIndex]
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

        {/* Add Expense Button & Sheet */}
        <div className="flex justify-center mt-6 mb-16">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                Add New Expense
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Add New Recurrent Expense</SheetTitle>
                <SheetDescription>
                  Add a new recurrent expense to your finance tracker. This will
                  appear in all MONTHS.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="description"
                    className="text-right text-black"
                  >
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3 text-black"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="due_day" className="text-right text-black">
                    Due Day
                  </Label>
                  <Input
                    id="due_day"
                    type="number"
                    min="1"
                    max="31"
                    value={newExpense.due_day}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        due_day: parseInt(e.target.value),
                      })
                    }
                    className="col-span-3 text-black"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="payment_method"
                    className="text-right text-black"
                  >
                    Payment Method
                  </Label>
                  <Input
                    id="payment_method"
                    value={newExpense.payment_method}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        payment_method: e.target.value,
                      })
                    }
                    className="col-span-3 text-black"
                    placeholder="e.g. Credit Card, Bank Transfer"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="country" className="text-right text-black">
                    Country
                  </Label>
                  <Select
                    value={newExpense.country}
                    onValueChange={(value) =>
                      setNewExpense({ ...newExpense, country: value })
                    }
                  >
                    <SelectTrigger className="col-span-3 text-black">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent className="text-black">
                      <SelectItem value="Sweden">Sweden</SelectItem>
                      <SelectItem value="Brazil">Brazil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right text-black">
                    Base Value
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExpense.base_value || ""}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        base_value: parseFloat(e.target.value),
                      })
                    }
                    className="col-span-3 text-black"
                    placeholder={`Value in ${
                      newExpense.country === "Brazil" ? "BRL" : "SEK"
                    }`}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="is_credit_card"
                    className="text-right text-black"
                  >
                    Credit Card
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <Checkbox
                      id="is_credit_card"
                      checked={newExpense.is_credit_card}
                      onCheckedChange={(checked) => {
                        setNewExpense({
                          ...newExpense,
                          is_credit_card: checked === true,
                          credit_card_name: checked === true ? null : null,
                        });
                      }}
                    />
                  </div>
                </div>
                {newExpense.is_credit_card && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="credit_card_name"
                      className="text-right text-black"
                    >
                      Card Name
                    </Label>
                    <Select
                      value={newExpense.credit_card_name || ""}
                      onValueChange={(value) =>
                        setNewExpense({
                          ...newExpense,
                          credit_card_name: value,
                        })
                      }
                    >
                      <SelectTrigger className="col-span-3 text-black">
                        <SelectValue placeholder="Select a credit card" />
                      </SelectTrigger>
                      <SelectContent className="text-black">
                        {newExpense.country === "Sweden" ? (
                          <>
                            <SelectItem value="Amex">Amex</SelectItem>
                            <SelectItem value="SJ Prio">SJ Prio</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="Inter MC">Inter MC</SelectItem>
                            <SelectItem value="Rico Visa">Rico Visa</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="button" variant="default">
                    Cancel
                  </Button>
                </SheetClose>
                <Button
                  onClick={handleExpenseSubmit}
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSubmitting ? "Adding..." : "Add Expense"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </ProtectedRoute>
  );
}
