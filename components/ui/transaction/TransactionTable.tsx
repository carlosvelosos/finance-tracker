"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transaction } from "@/types/transaction";

interface TransactionTableProps {
  transactions: Transaction[];
  initialSortColumn?: keyof Transaction | string | null;
  initialSortDirection?: "asc" | "desc";
  hiddenColumns?: string[];
  bankFilter?: string;
  showMonthFilter?: boolean;
  showCategoryFilter?: boolean;
  showDescriptionFilter?: boolean;
  showTotalAmount?: boolean;
  showFilters?: boolean;
  excludeCategories?: string[];
  onRowClick?: (transaction: Transaction) => void;
  TransactionTableName?: string; // Added new prop
}

export default function TransactionTable({
  transactions,
  initialSortColumn = null,
  initialSortDirection = "asc",
  hiddenColumns = [],
  bankFilter,
  showMonthFilter = true,
  showCategoryFilter = true,
  showDescriptionFilter = true,
  showTotalAmount = true,
  showFilters = true,
  excludeCategories = [],
  onRowClick,
  TransactionTableName = "Sweden_transactions_agregated_2025", // Destructured with default
}: TransactionTableProps) {
  const [sortColumn, setSortColumn] = useState<
    keyof Transaction | string | null
  >(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSortDirection,
  );
  const [categoryFilter, setCategoryFilter] = useState("");
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [editingCategory, setEditingCategory] = useState<{
    id: number;
    value: string;
  } | null>(null);
  const [editingComment, setEditingComment] = useState<{
    id: number;
    value: string;
  } | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Need to manage local transactions state since props are read-only
  const [localTransactions, setLocalTransactions] =
    useState<Transaction[]>(transactions);

  // Update local transactions when props change
  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  // Handle sorting
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

  // Handle category update
  const handleUpdateCategory = async (id: number, newCategory: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from(TransactionTableName) // Use the prop here
        .update({ Category: newCategory })
        .eq("id", id);

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

  // Handle comment update
  const handleUpdateComment = async (id: number, newComment: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from(TransactionTableName) // Use the prop here
        .update({ Comment: newComment })
        .eq("id", id);

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

  // Apply filters to transactions
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

  // Calculate the sum of the Amount column
  const totalAmount = filteredTransactions.reduce((sum, transaction) => {
    return sum + (transaction.Amount || 0);
  }, 0);

  // Sort the filtered transactions
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

  // Determine if we're showing the date as separate Year/Month/Day columns or as a single Date column
  const showSplitDateColumns =
    hiddenColumns.includes("Date") &&
    !hiddenColumns.includes("Year") &&
    !hiddenColumns.includes("Month") &&
    !hiddenColumns.includes("Day");

  return (
    <div>
      {showTotalAmount && (
        <div className="mt-4 text-right font-bold">
          Total Amount:{" "}
          {new Intl.NumberFormat("sv-SE", {
            style: "currency",
            currency: "SEK",
          }).format(totalAmount)}
        </div>
      )}

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

      {showFilters && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      )}

      <Table>
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
