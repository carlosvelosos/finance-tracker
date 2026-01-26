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
// Checkbox deprecated: monthly payment method field is used instead
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [currentTableYear, setCurrentTableYear] = useState(2025);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedYearToCreate, setSelectedYearToCreate] = useState(2026);
  const [validationStatus, setValidationStatus] = useState<{
    type: "idle" | "checking" | "ready" | "error" | "warning";
    message: string;
    sourceTableExists: boolean;
    targetTableExists: boolean;
    sourceBillCount: number;
  }>({
    type: "idle",
    message: "",
    sourceTableExists: false,
    targetTableExists: false,
    sourceBillCount: 0,
  });
  const [isCreating, setIsCreating] = useState(false);
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBills = async (year?: number) => {
    const tableYear = year ?? currentTableYear;
    try {
      const { data, error } = await supabase
        .from(`recurrent_${tableYear}`)
        .select("*");

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        console.error("Error fetching bills:", JSON.stringify(error, null, 2));
      } else {
        console.error("Error fetching bills:", error);
      }
      setBills([]); // Set empty array if table doesn't exist
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
        .from(`recurrent_${currentTableYear}`)
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
        .from(`recurrent_${currentTableYear}`)
        .insert({
          description: newExpense.description,
          due_day: newExpense.due_day,
          payment_method: newExpense.payment_method,
          country: newExpense.country,
          base_value: newExpense.base_value,
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

  // Function to update future month values based on mean of past months
  const updateFutureMonthsWithMean = async () => {
    try {
      setIsSubmitting(true);
      const currentMonthIdx = new Date().getMonth();
      const updatedBills: Bill[] = [];

      // Process each bill
      for (const bill of bills) {
        const pastMonthValues: number[] = [];

        // Collect values from past months (January to current month)
        for (let i = 0; i <= currentMonthIdx; i++) {
          const monthAbbr = MONTHS[i].toLowerCase().substring(0, 3);
          const valueField = `${monthAbbr}_value` as keyof Bill;
          const monthValue = bill[valueField];

          if (typeof monthValue === "number") {
            pastMonthValues.push(monthValue);
          } else {
            pastMonthValues.push(bill.base_value);
          }
        }

        // Calculate mean of past months
        const meanValue =
          pastMonthValues.length > 0
            ? pastMonthValues.reduce((sum, val) => sum + val, 0) /
              pastMonthValues.length
            : bill.base_value;

        // Round to 2 decimal places
        const roundedMean = Math.round(meanValue * 100) / 100;

        // Prepare update object for future months
        const updateData: Record<string, number> = {};
        let hasUpdates = false;

        // Update future months (from next month to December)
        for (let i = currentMonthIdx + 1; i < 12; i++) {
          const monthAbbr = MONTHS[i].toLowerCase().substring(0, 3);
          const valueField = `${monthAbbr}_value`;
          updateData[valueField] = roundedMean;
          hasUpdates = true;
        }

        // Only update if there are future months to update
        if (hasUpdates) {
          const { error } = await supabase
            .from(`recurrent_${currentTableYear}`)
            .update({
              ...updateData,
              updated_at: new Date().toISOString(),
            })
            .eq("id", bill.id);

          if (error) throw error;

          // Update local state
          const updatedBill = { ...bill };
          Object.entries(updateData).forEach(([key, value]) => {
            (updatedBill as Record<string, unknown>)[key] = value;
          });
          updatedBills.push(updatedBill);
        }
      }

      // Update local bills state
      setBills((prevBills) =>
        prevBills.map(
          (bill) =>
            updatedBills.find((updated) => updated.id === bill.id) || bill,
        ),
      );

      toast.success("Future months updated successfully", {
        description: `Updated ${updatedBills.length} bills with mean values from past months`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error updating future months:", error);
      toast.error("Failed to update future months", {
        description: "Please try again.",
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

  // Validate table creation prerequisites
  const validateTableCreation = async (targetYear: number) => {
    setValidationStatus({
      type: "checking",
      message: "Validating...",
      sourceTableExists: false,
      targetTableExists: false,
      sourceBillCount: 0,
    });

    const sourceYear = targetYear - 1;
    const sourceTableName = `recurrent_${sourceYear}`;
    const targetTableName = `recurrent_${targetYear}`;

    try {
      // Check if source table exists
      const { data: sourceData, error: sourceError } = await supabase
        .from(sourceTableName)
        .select("id")
        .limit(1);

      const sourceExists = !sourceError;

      if (!sourceExists) {
        setValidationStatus({
          type: "error",
          message: `Source table ${sourceTableName} does not exist. Please create it first.`,
          sourceTableExists: false,
          targetTableExists: false,
          sourceBillCount: 0,
        });
        return;
      }

      // Get count of bills in source table
      const { count: sourceBillCount } = await supabase
        .from(sourceTableName)
        .select("*", { count: "exact", head: true });

      // Check if target table exists
      const { error: targetError } = await supabase
        .from(targetTableName)
        .select("id")
        .limit(1);

      const targetExists = !targetError;

      if (targetExists) {
        // Get count of bills in target table
        const { count: targetBillCount } = await supabase
          .from(targetTableName)
          .select("*", { count: "exact", head: true });

        setValidationStatus({
          type: "warning",
          message: `Table ${targetTableName} already exists with ${targetBillCount || 0} bills. Creating will DELETE all existing data and replace with ${sourceBillCount || 0} bills from ${sourceTableName}.`,
          sourceTableExists: true,
          targetTableExists: true,
          sourceBillCount: sourceBillCount || 0,
        });
      } else {
        setValidationStatus({
          type: "ready",
          message: `Ready to create ${targetTableName} from ${sourceTableName} (${sourceBillCount || 0} bills)`,
          sourceTableExists: true,
          targetTableExists: false,
          sourceBillCount: sourceBillCount || 0,
        });
      }
    } catch (error) {
      console.error("Validation error:", error);
      setValidationStatus({
        type: "error",
        message: "Error during validation. Please try again.",
        sourceTableExists: false,
        targetTableExists: false,
        sourceBillCount: 0,
      });
    }
  };

  // Create new year table from previous year
  const createYearTable = async () => {
    if (
      validationStatus.type === "error" ||
      validationStatus.type === "idle" ||
      validationStatus.type === "checking"
    ) {
      return;
    }

    setIsCreating(true);
    const targetYear = selectedYearToCreate;
    const sourceYear = targetYear - 1;
    const sourceTableName = `recurrent_${sourceYear}`;
    const targetTableName = `recurrent_${targetYear}`;

    try {
      // Step 1: Drop target table if it exists (try with exec_sql, handle gracefully if not available)
      if (validationStatus.targetTableExists) {
        setValidationStatus((prev) => ({
          ...prev,
          message: "Deleting existing table...",
        }));

        try {
          await supabase.rpc("exec_sql", {
            sql: `DROP TABLE IF EXISTS ${targetTableName} CASCADE;`,
          });
        } catch (dropErr) {
          console.warn(
            "Could not drop table automatically (will attempt to overwrite):",
            dropErr,
          );
        }
      }

      // Step 2: Try to create new table with schema using exec_sql
      setValidationStatus((prev) => ({
        ...prev,
        message: "Creating new table...",
      }));

      const createTableSQL = `
        CREATE TABLE ${targetTableName} (
          id SERIAL PRIMARY KEY,
          description TEXT NOT NULL,
          due_day INTEGER NOT NULL,
          payment_method TEXT NOT NULL,
          country TEXT NOT NULL,
          base_value NUMERIC NOT NULL DEFAULT 0,
          is_credit_card BOOLEAN DEFAULT FALSE,
          credit_card_name TEXT,
          jan_value NUMERIC,
          feb_value NUMERIC,
          mar_value NUMERIC,
          apr_value NUMERIC,
          may_value NUMERIC,
          jun_value NUMERIC,
          jul_value NUMERIC,
          aug_value NUMERIC,
          sep_value NUMERIC,
          oct_value NUMERIC,
          nov_value NUMERIC,
          dec_value NUMERIC,
          jan_status BOOLEAN DEFAULT FALSE,
          feb_status BOOLEAN DEFAULT FALSE,
          mar_status BOOLEAN DEFAULT FALSE,
          apr_status BOOLEAN DEFAULT FALSE,
          may_status BOOLEAN DEFAULT FALSE,
          jun_status BOOLEAN DEFAULT FALSE,
          jul_status BOOLEAN DEFAULT FALSE,
          aug_status BOOLEAN DEFAULT FALSE,
          sep_status BOOLEAN DEFAULT FALSE,
          oct_status BOOLEAN DEFAULT FALSE,
          nov_status BOOLEAN DEFAULT FALSE,
          dec_status BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        ALTER TABLE ${targetTableName} ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Enable read access for all users" ON ${targetTableName}
          FOR SELECT USING (true);

        CREATE POLICY "Enable insert for authenticated users only" ON ${targetTableName}
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Enable update for authenticated users only" ON ${targetTableName}
          FOR UPDATE USING (true);

        CREATE POLICY "Enable delete for authenticated users only" ON ${targetTableName}
          FOR DELETE USING (true);
      `;

      let tableCreated = false;
      try {
        const { error: createError } = await supabase.rpc("exec_sql", {
          sql: createTableSQL,
        });

        if (createError) {
          throw createError;
        }
        tableCreated = true;
      } catch (execError) {
        // exec_sql not available - provide manual SQL instructions
        console.error("Table creation with exec_sql failed:", execError);

        setValidationStatus({
          type: "error",
          message: `Automatic table creation not supported. Please run this SQL in Supabase SQL Editor:\n\n${createTableSQL}\n\nThen try again.`,
          sourceTableExists: validationStatus.sourceTableExists,
          targetTableExists: false,
          sourceBillCount: validationStatus.sourceBillCount,
        });
        setIsCreating(false);
        return;
      }

      // Step 3: Wait for REST API cache
      if (tableCreated) {
        setValidationStatus((prev) => ({
          ...prev,
          message: "Waiting for database cache...",
        }));
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Step 4: Fetch bills from source table
      setValidationStatus((prev) => ({
        ...prev,
        message: "Fetching source data...",
      }));
      const { data: sourceBills, error: fetchError } = await supabase
        .from(sourceTableName)
        .select("*");

      if (fetchError || !sourceBills) {
        throw new Error(`Failed to fetch source bills: ${fetchError?.message}`);
      }

      // Step 5: Insert bills one by one
      setValidationStatus((prev) => ({
        ...prev,
        message: `Inserting bills (0/${sourceBills.length})...`,
      }));

      for (let i = 0; i < sourceBills.length; i++) {
        const sourceBill = sourceBills[i];

        // Use December value as new base_value, fallback to current base_value
        const newBaseValue = sourceBill.dec_value ?? sourceBill.base_value;

        // Initialize all status fields to false
        const statusFields: Record<string, boolean> = {};
        MONTHS.forEach((month) => {
          const monthAbbr = month.toLowerCase().substring(0, 3);
          statusFields[`${monthAbbr}_status`] = false;
        });

        const { error: insertError } = await supabase
          .from(targetTableName)
          .insert({
            description: sourceBill.description || "Unnamed",
            due_day: sourceBill.due_day || 1,
            payment_method: sourceBill.payment_method || "Not specified",
            country: sourceBill.country || "Sweden",
            base_value: newBaseValue || 0,
            is_credit_card: sourceBill.is_credit_card || false,
            credit_card_name: sourceBill.credit_card_name || null,
            ...statusFields,
          });

        if (insertError) {
          throw new Error(
            `Failed to insert bill "${sourceBill.description}": ${insertError.message}`,
          );
        }

        setValidationStatus((prev) => ({
          ...prev,
          message: `Inserting bills (${i + 1}/${sourceBills.length})...`,
        }));
      }

      // Success!
      setValidationStatus({
        type: "ready",
        message: `Successfully created ${targetTableName} with ${sourceBills.length} bills!`,
        sourceTableExists: true,
        targetTableExists: true,
        sourceBillCount: sourceBills.length,
      });

      // Switch to the newly created year
      setTimeout(() => {
        setCurrentTableYear(targetYear);
        setLoading(true);
        fetchBills(targetYear);
        setCreateDialogOpen(false);
        setIsCreating(false);
      }, 1500);
    } catch (error) {
      console.error("Error creating year table:", error);
      setValidationStatus({
        type: "error",
        message: `Failed to create table: ${error instanceof Error ? error.message : "Unknown error"}`,
        sourceTableExists: validationStatus.sourceTableExists,
        targetTableExists: validationStatus.targetTableExists,
        sourceBillCount: validationStatus.sourceBillCount,
      });
      setIsCreating(false);
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
  // Excludes bills paid by credit card (Amex, SJ Prio, Inter MC, Rico) to avoid double-counting
  const cumulativeTotalsPerCountry = bills.reduce(
    (acc, bill) => {
      const relevantMonths = MONTHS.slice(0, currentMonthIndex + 1).map(
        (month) => month.toLowerCase().substring(0, 3),
      );

      let totalForBill = 0;

      relevantMonths.forEach((monthAbbr) => {
        const valueField = `${monthAbbr}_value` as keyof Bill;
        const paymentMethodField = `${monthAbbr}_payment_method` as keyof Bill;
        const monthValue =
          typeof bill[valueField] === "number"
            ? (bill[valueField] as number)
            : bill.base_value;
        const paymentMethod = bill[paymentMethodField];
        // If paid by credit card for this month, skip this bill for that month
        if (
          typeof paymentMethod === "string" &&
          ["amex", "sj prio", "inter mc", "rico"].some((card) =>
            paymentMethod.toLowerCase().includes(card),
          )
        ) {
          return; // skip this month for this bill
        }
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
        <div className="flex items-center justify-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[#898989]">
            Bills to Be Paid
          </h1>
          <div className="flex items-center gap-2">
            <Label className="text-[#898989]">Year:</Label>
            <Select
              value={currentTableYear.toString()}
              onValueChange={(value) => {
                const year = parseInt(value);
                setCurrentTableYear(year);
                setLoading(true);
                fetchBills(year);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }, (_, i) => 2025 + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
        <div className="flex justify-center gap-4 mt-6 mb-16">
          <Button
            onClick={updateFutureMonthsWithMean}
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isSubmitting ? "Updating..." : "Update Future Months with Mean"}
          </Button>

          {/* Create New Year Table Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => {
                  setSelectedYearToCreate(currentTableYear + 1);
                  setValidationStatus({
                    type: "idle",
                    message: "",
                    sourceTableExists: false,
                    targetTableExists: false,
                    sourceBillCount: 0,
                  });
                }}
              >
                Create New Year Table
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Year Table</DialogTitle>
                <DialogDescription>
                  Create a new recurrent bills table for a specific year by
                  copying data from the previous year.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="target-year" className="text-right">
                    Target Year
                  </Label>
                  <Select
                    value={selectedYearToCreate.toString()}
                    onValueChange={(value) => {
                      const year = parseInt(value);
                      setSelectedYearToCreate(year);
                      setValidationStatus({
                        type: "idle",
                        message: "",
                        sourceTableExists: false,
                        targetTableExists: false,
                        sourceBillCount: 0,
                      });
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 6 }, (_, i) => 2025 + i).map(
                        (year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm mb-2">
                    <strong>Source:</strong> recurrent_
                    {selectedYearToCreate - 1}
                  </div>
                  <div className="text-sm mb-4">
                    <strong>Target:</strong> recurrent_{selectedYearToCreate}
                  </div>

                  {validationStatus.type === "idle" && (
                    <Button
                      onClick={() =>
                        validateTableCreation(selectedYearToCreate)
                      }
                      className="w-full"
                      variant="outline"
                    >
                      Check Prerequisites
                    </Button>
                  )}

                  {validationStatus.type === "checking" && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                      <p className="text-sm">{validationStatus.message}</p>
                    </div>
                  )}

                  {validationStatus.type === "error" && (
                    <div className="p-3 bg-red-100 dark:bg-red-900 rounded">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {validationStatus.message}
                      </p>
                    </div>
                  )}

                  {validationStatus.type === "warning" && (
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold">
                        ⚠️ Warning
                      </p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                        {validationStatus.message}
                      </p>
                    </div>
                  )}

                  {validationStatus.type === "ready" && !isCreating && (
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✓ {validationStatus.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createYearTable}
                  disabled={
                    (validationStatus.type !== "ready" &&
                      validationStatus.type !== "warning") ||
                    isCreating
                  }
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {isCreating
                    ? "Creating..."
                    : validationStatus.targetTableExists
                      ? "Overwrite & Create"
                      : "Create Table"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                    placeholder="e.g. Amex, SJ Prio, Inter MC, Rico Visa, Bank Transfer"
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
