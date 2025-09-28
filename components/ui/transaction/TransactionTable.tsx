"use client";

// React imports for state management and lifecycle hooks
import { useState, useEffect } from "react";
// Supabase client for database operations
import { supabase } from "@/lib/supabaseClient";
// Toast notifications for user feedback
import { toast } from "sonner";
// UI component imports for table structure
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Button component for interactive elements
import { Button } from "@/components/ui/button";
// Tab components for filter navigation
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Transaction type definition
import { Transaction } from "@/types/transaction";

/**
 * Props interface for TransactionTable component
 *
 * Defines all possible configuration options for the transaction table,
 * including data source, display options, filtering capabilities, and interaction handlers.
 */
interface TransactionTableProps {
  /** Array of transaction objects to display in the table */
  transactions: Transaction[];
  /** Initial column to sort by when table first loads */
  initialSortColumn?: keyof Transaction | string | null;
  /** Initial sort direction (ascending or descending) */
  initialSortDirection?: "asc" | "desc";
  /** Array of column names to hide from display */
  hiddenColumns?: string[];
  /** Filter transactions by specific bank name */
  bankFilter?: string;
  /** Whether to show year selection tabs */
  showYearFilter?: boolean;
  /** Whether to show month selection tabs */
  showMonthFilter?: boolean;
  /** Whether to show category text filter input */
  showCategoryFilter?: boolean;
  /** Whether to show description text filter input */
  showDescriptionFilter?: boolean;
  /** Whether to show responsible person text filter input */
  showResponsibleFilter?: boolean;
  /** Whether to show comment text filter input */
  showCommentFilter?: boolean;
  /** Whether to display total amount calculation */
  showTotalAmount?: boolean;
  /** Whether to show all filter inputs */
  showFilters?: boolean;
  /** Categories to exclude from the table display */
  excludeCategories?: string[];
  /** Callback function when a table row is clicked */
  onRowClick?: (transaction: Transaction) => void;
  /** Database table name for update operations */
  TransactionTableName?: string;
}

/**
 * TransactionTable Component
 *
 * A comprehensive, feature-rich table component for displaying and managing financial transactions.
 * This component provides advanced functionality including:
 * - Multi-column sorting with special date handling
 * - Real-time text filtering across multiple fields
 * - Year and month-based filtering via tab interfaces
 * - Inline editing of categories and comments with database persistence
 * - Automatic total amount calculations
 * - Responsive design with customizable column visibility
 * - Bank-specific filtering and category exclusion
 * - Row click handlers for additional interactions
 *
 * @param props - TransactionTableProps configuration object
 * @returns {JSX.Element} Rendered transaction table with all features
 */
export default function TransactionTable({
  transactions,
  initialSortColumn = null,
  initialSortDirection = "asc",
  hiddenColumns = [],
  bankFilter,
  showYearFilter = true,
  showMonthFilter = true,
  showCategoryFilter = true,
  showDescriptionFilter = true,
  showResponsibleFilter = true,
  showCommentFilter = true,
  showTotalAmount = true,
  showFilters = true,
  excludeCategories = [],
  onRowClick,
  TransactionTableName = "Sweden_transactions_agregated_2025", // Destructured with default
}: TransactionTableProps) {
  // ========== STATE MANAGEMENT ==========

  /** Current column being used for sorting */
  const [sortColumn, setSortColumn] = useState<
    keyof Transaction | string | null
  >(initialSortColumn);

  /** Current sort direction (ascending or descending) */
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSortDirection,
  );

  /** Text filter for transaction categories */
  const [categoryFilter, setCategoryFilter] = useState("");

  /** Text filter for transaction descriptions */
  const [descriptionFilter, setDescriptionFilter] = useState("");

  /** Text filter for responsible person field */
  const [responsibleFilter, setResponsibleFilter] = useState("");

  /** Text filter for transaction comments */
  const [commentFilter, setCommentFilter] = useState("");

  /** Currently selected year for filtering ("All" for no filter) */
  const [selectedYear, setSelectedYear] = useState("All");

  /** Currently selected month for filtering ("All" for no filter) */
  const [selectedMonth, setSelectedMonth] = useState("All");

  /** Track which category cell is currently being edited */
  const [editingCategory, setEditingCategory] = useState<{
    id: string | number;
    value: string;
  } | null>(null);

  /** Track which comment cell is currently being edited */
  const [editingComment, setEditingComment] = useState<{
    id: string | number;
    value: string;
  } | null>(null);

  /** Track which transaction is currently being updated in the database */
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  /**
   * Local Transactions State Management
   *
   * Since props are read-only, we maintain a local copy of transactions
   * that can be updated when inline edits are made. This allows for
   * immediate UI feedback while database operations are in progress.
   */
  const [localTransactions, setLocalTransactions] =
    useState<Transaction[]>(transactions);

  // ========== LIFECYCLE EFFECTS ==========

  /**
   * Synchronize Local Transactions with Props
   *
   * Updates the local transaction state whenever the parent component
   * passes new transaction data. This ensures the table stays in sync
   * with external data changes while preserving local edits.
   */
  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  // ========== SORTING FUNCTIONALITY ==========

  /**
   * Handle Table Column Sorting
   *
   * Manages sorting logic for all table columns with special handling for date-related columns.
   * Features:
   * - Standard column sorting with direction toggling
   * - Special chronological date sorting for Year/Month/Day columns
   * - Maintains sort direction state across column changes
   * - Provides visual feedback through sort indicators
   *
   * @param {keyof Transaction | string} column - The column name to sort by
   */
  const handleSort = (column: keyof Transaction | string) => {
    // For date-related columns, always sort by full date chronologically
    if (column === "Year" || column === "Month" || column === "Day") {
      if (sortColumn === "ChronologicalDate") {
        // Toggle the direction if already sorting chronologically
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        // Set to chronological date sorting when first clicked
        setSortColumn("ChronologicalDate");
        setSortDirection("asc");
      }
    } else {
      if (sortColumn === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    }
  };

  // ========== DATABASE UPDATE FUNCTIONS ==========

  /**
   * Update Transaction Category
   *
   * Handles inline editing of transaction categories with database persistence.
   * Features:
   * - Optimistic UI updates for immediate feedback
   * - Error handling with user notifications
   * - Support for both string and numeric transaction IDs
   * - Loading state management during database operations
   *
   * @param {string | number} id - Transaction ID to update
   * @param {string} newCategory - New category value to set
   */
  const handleUpdateCategory = async (
    id: string | number,
    newCategory: string,
  ) => {
    setUpdatingId(id);
    try {
      // Find the transaction to get its source table and database ID
      const transaction = localTransactions.find((t) => t.id === id);
      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // Determine the table name and database ID
      const tableName = transaction.sourceTable || TransactionTableName;
      const dbId =
        transaction.originalId ||
        (typeof id === "number" ? id : parseInt(id.toString()));

      if (!tableName) {
        throw new Error("Cannot determine table name for update");
      }

      const { error } = await supabase
        .from(tableName)
        .update({ Category: newCategory })
        .eq("id", dbId);

      if (error) {
        console.error("Error updating category:", error);
        toast.error(`Failed to update category: ${error.message}`, {
          duration: 3000,
          position: "top-right",
        });
      } else {
        // Update local state to reflect the change immediately
        setLocalTransactions((prevTransactions) =>
          prevTransactions.map((t) =>
            t.id === id ? { ...t, Category: newCategory } : t,
          ),
        );
        toast.success("Category updated successfully", {
          duration: 2000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error in update operation:", error);
      toast.error("An unexpected error occurred", {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setUpdatingId(null);
      setEditingCategory(null);
    }
  };

  /**
   * Update Transaction Comment
   *
   * Handles inline editing of transaction comments with database persistence.
   * Similar to category updates but specifically for the comment field.
   * Features:
   * - Optimistic UI updates for immediate feedback
   * - Error handling with user notifications
   * - Support for both string and numeric transaction IDs
   * - Loading state management during database operations
   *
   * @param {string | number} id - Transaction ID to update
   * @param {string} newComment - New comment value to set
   */
  const handleUpdateComment = async (
    id: string | number,
    newComment: string,
  ) => {
    setUpdatingId(id);
    try {
      // Find the transaction to get its source table and database ID
      const transaction = localTransactions.find((t) => t.id === id);
      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // Determine the table name and database ID
      const tableName = transaction.sourceTable || TransactionTableName;
      const dbId =
        transaction.originalId ||
        (typeof id === "number" ? id : parseInt(id.toString()));

      if (!tableName) {
        throw new Error("Cannot determine table name for update");
      }

      const { error } = await supabase
        .from(tableName)
        .update({ Comment: newComment })
        .eq("id", dbId);

      if (error) {
        console.error("Error updating comment:", error);
        toast.error(`Failed to update comment: ${error.message}`, {
          duration: 3000,
          position: "top-right",
        });
      } else {
        // Update local state to reflect the change immediately
        setLocalTransactions((prevTransactions) =>
          prevTransactions.map((t) =>
            t.id === id ? { ...t, Comment: newComment } : t,
          ),
        );
        toast.success("Comment updated successfully", {
          duration: 2000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error in update operation:", error);
      toast.error("An unexpected error occurred", {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setUpdatingId(null);
      setEditingComment(null);
    }
  };

  // ========== DATA FILTERING AND PROCESSING ==========

  /**
   * Apply Multiple Filters to Transaction Data
   *
   * Processes the transaction array through a series of filter chains to provide
   * a comprehensive filtering system. Each filter is applied sequentially and
   * only executes if the corresponding feature is enabled.
   *
   * Filters applied in order:
   * 1. Bank filtering - Show only transactions from specified bank
   * 2. Category exclusion - Remove specified categories from display
   * 3. Category text search - Filter by category name containing search term
   * 4. Description text search - Filter by description containing search term
   * 5. Responsible person text search - Filter by responsible person name
   * 6. Comment text search - Filter by comment containing search term
   * 7. Year filtering - Show only transactions from selected year
   * 8. Month filtering - Show only transactions from selected month
   *
   * @returns {Transaction[]} Filtered array of transactions
   */
  const filteredTransactions = localTransactions
    .filter((transaction) =>
      bankFilter ? transaction.Bank === bankFilter : true,
    )
    .filter((transaction) =>
      excludeCategories.length > 0
        ? !excludeCategories.includes(transaction.Category || "")
        : true,
    )
    .filter((transaction) => {
      if (!showCategoryFilter || !categoryFilter) return true;
      const categoryQuery = categoryFilter.toLowerCase();
      return (
        transaction.Category?.toLowerCase().includes(categoryQuery) || false
      );
    })
    .filter((transaction) => {
      if (!showDescriptionFilter || !descriptionFilter) return true;
      const descriptionQuery = descriptionFilter.toLowerCase();
      return (
        transaction.Description?.toLowerCase().includes(descriptionQuery) ||
        false
      );
    })
    .filter((transaction) => {
      if (!showResponsibleFilter || !responsibleFilter) return true;
      const responsibleQuery = responsibleFilter.toLowerCase();
      return (
        transaction.Responsible?.toLowerCase().includes(responsibleQuery) ||
        false
      );
    })
    .filter((transaction) => {
      if (!showCommentFilter || !commentFilter) return true;
      const commentQuery = commentFilter.toLowerCase();
      return transaction.Comment?.toLowerCase().includes(commentQuery) || false;
    })
    .filter((transaction) => {
      if (!showYearFilter || selectedYear === "All") return true;
      if (transaction.Date) {
        const transactionYear = new Date(transaction.Date).getFullYear();
        return transactionYear.toString() === selectedYear;
      }
      return false;
    })
    .filter((transaction) => {
      if (!showMonthFilter || selectedMonth === "All") return true;
      if (transaction.Date) {
        const transactionMonth = new Date(transaction.Date).getMonth(); // Get month (0-11)
        const selectedMonthIndex = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ].indexOf(selectedMonth);
        return transactionMonth === selectedMonthIndex;
      }
      return false;
    });

  /**
   * Calculate Total Amount of Filtered Transactions
   *
   * Computes the sum of all transaction amounts in the currently filtered dataset.
   * Handles null/undefined amounts gracefully by treating them as 0.
   * Used for displaying financial summaries and totals.
   *
   * @returns {number} Sum of all filtered transaction amounts
   */
  const totalAmount = filteredTransactions.reduce((sum, transaction) => {
    return sum + (transaction.Amount || 0);
  }, 0);

  /**
   * Sort Filtered Transactions
   *
   * Applies sorting logic to the filtered transaction data based on current sort settings.
   * Features comprehensive sorting capabilities including:
   * - Chronological date sorting (special handling for date-related columns)
   * - Individual Year, Month, Day sorting
   * - String-based alphabetical sorting with locale support
   * - Numeric sorting for amounts and IDs
   * - Null/undefined value handling
   *
   * @returns {Transaction[]} Sorted array of filtered transactions
   */
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortColumn) return 0;

    // Handle chronological date sorting (triggered from Year, Month, or Day header clicks)
    if (sortColumn === "ChronologicalDate") {
      if (!a.Date && !b.Date) return 0;
      if (!a.Date) return sortDirection === "asc" ? 1 : -1;
      if (!b.Date) return sortDirection === "asc" ? -1 : 1;

      const aDate = new Date(a.Date).getTime();
      const bDate = new Date(b.Date).getTime();
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    }

    // Handle Year, Month, and Day sorting individually if needed
    if (sortColumn === "Year" && a.Date && b.Date) {
      const aYear = new Date(a.Date).getFullYear();
      const bYear = new Date(b.Date).getFullYear();
      return sortDirection === "asc" ? aYear - bYear : bYear - aYear;
    }

    if (sortColumn === "Month" && a.Date && b.Date) {
      const aMonth = new Date(a.Date).getMonth();
      const bMonth = new Date(b.Date).getMonth();
      return sortDirection === "asc" ? aMonth - bMonth : bMonth - aMonth;
    }

    if (sortColumn === "Day" && a.Date && b.Date) {
      const aDay = new Date(a.Date).getDate();
      const bDay = new Date(b.Date).getDate();
      return sortDirection === "asc" ? aDay - bDay : bDay - aDay;
    }

    // Handle standard column sorting
    if (sortColumn in a) {
      const aValue = a[sortColumn as keyof Transaction] ?? "";
      const bValue = b[sortColumn as keyof Transaction] ?? "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
    }

    return 0;
  });

  // ========== DISPLAY LOGIC AND CALCULATIONS ==========

  /**
   * Determine Date Column Display Mode
   *
   * Analyzes the hiddenColumns configuration to determine whether to show
   * date information as a single "Date" column or split into separate
   * "Year", "Month", and "Day" columns. This allows for flexible date
   * display based on user preferences or screen space constraints.
   *
   * @returns {boolean} True if date should be split into separate columns
   */
  const showSplitDateColumns =
    hiddenColumns.includes("Date") &&
    !hiddenColumns.includes("Year") &&
    !hiddenColumns.includes("Month") &&
    !hiddenColumns.includes("Day");

  /**
   * Generate Year Filter Options
   *
   * Creates an array of year strings for the year filter tabs.
   * Generates options for current year ± 2 years to provide reasonable
   * filtering range without overwhelming the interface.
   *
   * @returns {string[]} Array of year strings for filter options
   */
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    yearOptions.push(i.toString());
  }

  // ========== COMPONENT RENDER ==========

  /**
   * Main Component Render Method
   *
   * Renders the complete transaction table interface with all features:
   * - Total amount display (conditional)
   * - Year and month filter tabs (conditional)
   * - Text-based filter inputs (conditional)
   * - Sortable table with all transaction data
   * - Inline editing capabilities for categories and comments
   * - Responsive design with proper styling
   *
   * The render is organized into distinct sections:
   * 1. Total amount display (top)
   * 2. Filter controls (year tabs, month tabs, text inputs)
   * 3. Main data table with sortable headers
   * 4. Table body with formatted data and inline editing
   * 5. Total amount display (bottom)
   *
   * @returns {JSX.Element} Complete transaction table interface
   */
  return (
    <div>
      {/* 
        Top Total Amount Display
        Shows the calculated sum of filtered transactions at the top of the component
        Only displays when showTotalAmount prop is true
      */}
      {showTotalAmount && (
        <div className="mt-4 text-right font-bold">
          Total Amount:{" "}
          {new Intl.NumberFormat("sv-SE", {
            style: "currency",
            currency: "SEK",
          }).format(totalAmount)}
        </div>
      )}

      {/* 
        Year Filter Tabs
        Provides tab-based navigation for filtering transactions by year
        Shows current year ± 2 years plus "All Years" option
      */}
      {showYearFilter && (
        <Tabs
          defaultValue="All"
          onValueChange={(value) => setSelectedYear(value)}
          className="mb-4"
        >
          <TabsList>
            <TabsTrigger value="All">All Years</TabsTrigger>
            {yearOptions.map((year) => (
              <TabsTrigger key={year} value={year}>
                {year}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* 
        Month Filter Tabs
        Provides tab-based navigation for filtering transactions by month
        Shows all 12 months plus "All" option for comprehensive filtering
      */}
      {showMonthFilter && (
        <Tabs
          defaultValue="All"
          onValueChange={(value) => setSelectedMonth(value)}
          className="mb-4"
        >
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Jan">Jan</TabsTrigger>
            <TabsTrigger value="Feb">Feb</TabsTrigger>
            <TabsTrigger value="Mar">Mar</TabsTrigger>
            <TabsTrigger value="Apr">Apr</TabsTrigger>
            <TabsTrigger value="May">May</TabsTrigger>
            <TabsTrigger value="Jun">Jun</TabsTrigger>
            <TabsTrigger value="Jul">Jul</TabsTrigger>
            <TabsTrigger value="Aug">Aug</TabsTrigger>
            <TabsTrigger value="Sep">Sep</TabsTrigger>
            <TabsTrigger value="Oct">Oct</TabsTrigger>
            <TabsTrigger value="Nov">Nov</TabsTrigger>
            <TabsTrigger value="Dec">Dec</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* 
        Text-Based Filter Controls
        Grid of input fields for filtering transactions by different text criteria
        Each filter searches within its respective field using case-insensitive matching
        Responsive design: 1 column on mobile, 2 on tablet, 4 on desktop
      */}
      {showFilters && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {showCategoryFilter && (
            <input
              type="text"
              placeholder="Filter by Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          )}
          {showDescriptionFilter && (
            <input
              type="text"
              placeholder="Filter by Description"
              value={descriptionFilter}
              onChange={(e) => setDescriptionFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          )}
          {showResponsibleFilter && (
            <input
              type="text"
              placeholder="Filter by Responsible"
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          )}
          {showCommentFilter && (
            <input
              type="text"
              placeholder="Filter by Comment"
              value={commentFilter}
              onChange={(e) => setCommentFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          )}
        </div>
      )}

      {/* 
        Main Transaction Table
        
        The core table component displaying all transaction data with:
        - Sortable headers with visual sort indicators (↑↓)
        - Conditional column display based on hiddenColumns prop
        - Special handling for date columns (split or combined display)
        - Custom styling with green accent border
      */}
      <Table>
        {/* 
          Table Header Section
          
          Renders column headers with sorting functionality and visual indicators.
          Conditionally displays columns based on hiddenColumns configuration.
          Special handling for date columns (can be shown as single Date column
          or split into Year/Month/Day columns).
        */}
        <TableHeader className="[&_tr]:border-[#00fd42]">
          <TableRow>
            {!hiddenColumns.includes("id") && (
              <TableHead
                onClick={() => handleSort("id")}
                className="text-white"
              >
                ID{" "}
                {sortColumn === "id" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}

            {/* Date Column(s) */}
            {!hiddenColumns.includes("Date") && !showSplitDateColumns && (
              <TableHead
                onClick={() => handleSort("Date")}
                className="text-white"
              >
                Date{" "}
                {sortColumn === "Date" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}

            {/* Split Date Columns */}
            {!hiddenColumns.includes("Year") && (
              <TableHead
                onClick={() => handleSort("Year")}
                className="text-white"
              >
                Year{" "}
                {sortColumn === "ChronologicalDate" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}
            {!hiddenColumns.includes("Month") && (
              <TableHead
                onClick={() => handleSort("Month")}
                className="text-white"
              >
                Month{" "}
                {sortColumn === "ChronologicalDate" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}
            {!hiddenColumns.includes("Day") && (
              <TableHead
                onClick={() => handleSort("Day")}
                className="text-white"
              >
                Day{" "}
                {sortColumn === "ChronologicalDate" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}

            {!hiddenColumns.includes("Description") && (
              <TableHead
                onClick={() => handleSort("Description")}
                className="text-white"
              >
                Description{" "}
                {sortColumn === "Description" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}

            {!hiddenColumns.includes("Amount") && (
              <TableHead
                onClick={() => handleSort("Amount")}
                className="text-white"
              >
                Amount{" "}
                {sortColumn === "Amount" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}

            {!hiddenColumns.includes("Balance") && (
              <TableHead
                onClick={() => handleSort("Balance")}
                className="text-white"
              >
                Balance{" "}
                {sortColumn === "Balance" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}

            {!hiddenColumns.includes("Category") && (
              <TableHead
                onClick={() => handleSort("Category")}
                className="text-white"
              >
                Category{" "}
                {sortColumn === "Category" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}

            {!hiddenColumns.includes("Responsible") && (
              <TableHead
                onClick={() => handleSort("Responsible")}
                className="text-white"
              >
                Responsible{" "}
                {sortColumn === "Responsible" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}

            {!hiddenColumns.includes("Bank") && (
              <TableHead
                onClick={() => handleSort("Bank")}
                className="text-white"
              >
                Bank{" "}
                {sortColumn === "Bank" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}

            {!hiddenColumns.includes("Comment") && (
              <TableHead
                onClick={() => handleSort("Comment")}
                className="text-white"
              >
                Comment{" "}
                {sortColumn === "Comment" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        {/* 
          Table Body Section
          
          Renders all transaction rows with:
          - Formatted data display (dates, currencies, etc.)
          - Conditional styling (Unknown categories highlighted in yellow)
          - Inline editing for Category and Comment fields
          - Click handlers for row interactions
          - Special styling for the last row (green border)
          - Responsive design considerations
        */}
        <TableBody>
          {sortedTransactions.map((transaction, index, array) => (
            <TableRow
              key={transaction.id}
              className={`${
                transaction.Category === "Unknown"
                  ? "bg-yellow-100 text-black"
                  : ""
              } ${
                index === array.length - 1
                  ? "!border-b-2 !border-b-green-500"
                  : ""
              }`}
              onClick={() => onRowClick && onRowClick(transaction)}
            >
              {!hiddenColumns.includes("id") && (
                <TableCell>{transaction.id}</TableCell>
              )}

              {/* Date Cell(s) */}
              {!hiddenColumns.includes("Date") && !showSplitDateColumns && (
                <TableCell>
                  {transaction.Date
                    ? new Date(transaction.Date).toLocaleDateString()
                    : "N/A"}
                </TableCell>
              )}

              {/* Split Date Cells */}
              {!hiddenColumns.includes("Year") && (
                <TableCell>
                  {transaction.Date
                    ? new Date(transaction.Date).getFullYear()
                    : "N/A"}
                </TableCell>
              )}

              {!hiddenColumns.includes("Month") && (
                <TableCell>
                  {transaction.Date
                    ? new Intl.DateTimeFormat("en-US", {
                        month: "long",
                      }).format(new Date(transaction.Date))
                    : "N/A"}
                </TableCell>
              )}

              {!hiddenColumns.includes("Day") && (
                <TableCell>
                  {transaction.Date
                    ? new Date(transaction.Date).getDate()
                    : "N/A"}
                </TableCell>
              )}

              {!hiddenColumns.includes("Description") && (
                <TableCell>{transaction.Description || "N/A"}</TableCell>
              )}

              {!hiddenColumns.includes("Amount") && (
                <TableCell className="text-right">
                  {transaction.Amount !== null
                    ? new Intl.NumberFormat("sv-SE", {
                        style: "currency",
                        currency: "SEK",
                      }).format(transaction.Amount)
                    : "N/A"}
                </TableCell>
              )}

              {!hiddenColumns.includes("Balance") && (
                <TableCell>
                  {transaction.Balance !== null
                    ? new Intl.NumberFormat("sv-SE", {
                        style: "currency",
                        currency: "SEK",
                      }).format(transaction.Balance)
                    : "N/A"}
                </TableCell>
              )}

              {!hiddenColumns.includes("Category") && (
                <TableCell
                  className={
                    transaction.Category === "Unknown"
                      ? "text-yellow-500 font-bold"
                      : ""
                  }
                >
                  {editingCategory && editingCategory.id === transaction.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingCategory.value}
                        onChange={(e) =>
                          setEditingCategory({
                            id: transaction.id,
                            value: e.target.value,
                          })
                        }
                        className="w-full p-1 border border-gray-300 rounded-md"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateCategory(
                            transaction.id,
                            editingCategory.value,
                          )
                        }
                        disabled={updatingId === transaction.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {updatingId === transaction.id ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCategory(null)}
                        className="text-gray-700 border-gray-300 hover:bg-gray-100"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategory({
                          id: transaction.id,
                          value: transaction.Category || "",
                        });
                      }}
                    >
                      {transaction.Category || "N/A"}
                    </div>
                  )}
                </TableCell>
              )}

              {!hiddenColumns.includes("Responsible") && (
                <TableCell>{transaction.Responsible || "N/A"}</TableCell>
              )}

              {!hiddenColumns.includes("Bank") && (
                <TableCell>{transaction.Bank || "N/A"}</TableCell>
              )}

              {!hiddenColumns.includes("Comment") && (
                <TableCell>
                  {editingComment && editingComment.id === transaction.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingComment.value}
                        onChange={(e) =>
                          setEditingComment({
                            id: transaction.id,
                            value: e.target.value,
                          })
                        }
                        className="w-full p-1 border border-gray-300 rounded-md"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateComment(
                            transaction.id,
                            editingComment.value,
                          )
                        }
                        disabled={updatingId === transaction.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {updatingId === transaction.id ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingComment(null)}
                        className="text-gray-700 border-gray-300 hover:bg-gray-100"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingComment({
                          id: transaction.id,
                          value: transaction.Comment || "",
                        });
                      }}
                    >
                      {transaction.Comment || "N/A"}
                    </div>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 
        Bottom Total Amount Display
        
        Duplicate of the top total amount display, shown at the bottom
        for easy reference after scrolling through large datasets.
        Uses Swedish locale formatting for currency display.
      */}
      {showTotalAmount && (
        <div className="mt-4 text-right font-bold">
          Total Amount:{" "}
          {new Intl.NumberFormat("sv-SE", {
            style: "currency",
            currency: "SEK",
          }).format(totalAmount)}
        </div>
      )}
    </div>
  );
}
