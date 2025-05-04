"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";

type Transaction = {
  id: number;
  created_at: string;
  Date: string | null;
  Description: string | null;
  Amount: number | null;
  Balance: number | null;
  Category: string | null;
  Responsible: string | null;
  Bank: string | null;
  Comment: string | null;
  user_id: string;
  source_table: string | null;
};

export default function Home() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sortColumn, setSortColumn] = useState<
    keyof Transaction | string | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingCategory, setEditingCategory] = useState<{
    id: number;
    value: string;
  } | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        const { data, error } = await supabase
          .from("Sweden_transactions_agregated_2025")
          .select(
            `
            id,
            created_at,
            "Date",
            "Description",
            "Amount",
            "Balance",
            "Category",
            "Responsible",
            "Bank",
            "Comment",
            user_id,
            source_table
          `
          )
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching transactions:", error);
        } else {
          setTransactions(data as Transaction[]);
        }
      };

      fetchTransactions();
    }
  }, [user]);

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

  const handleUpdateCategory = async (id: number, newCategory: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("Sweden_transactions_agregated_2025")
        .update({ Category: newCategory })
        .eq("id", id);

      if (error) {
        console.error("Error updating category:", error);
        alert("Failed to update category: " + error.message);
      } else {
        // Update the local state to reflect the change
        setTransactions(
          transactions.map((t) =>
            t.id === id ? { ...t, Category: newCategory } : t
          )
        );
      }
    } catch (error) {
      console.error("Error in update operation:", error);
      alert("An unexpected error occurred");
    } finally {
      setUpdatingId(null);
      setEditingCategory(null);
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
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

  if (!user) {
    return (
      <div className="text-center mt-10">
        Please log in to view your transactions.
      </div>
    );
  }

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          Your Transactions
        </h1>

        {/* Category Chart */}
        <div className="text-right mb-4">
          <Button
            onClick={() => (window.location.href = "./chart")}
            className="px-4 py-2 text-white rounded-md hover:bg-gray-300"
          >
            Go to Chart Page
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("id")}>
                ID{" "}
                {sortColumn === "id" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              {/* Replaced Date column with Year, Month, Day columns */}
              <TableHead onClick={() => handleSort("Year")}>
                Year{" "}
                {sortColumn === "ChronologicalDate" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("Month")}>
                Month{" "}
                {sortColumn === "ChronologicalDate" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("Day")}>
                Day{" "}
                {sortColumn === "ChronologicalDate" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("Description")}>
                Description{" "}
                {sortColumn === "Description" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("Amount")}>
                Amount{" "}
                {sortColumn === "Amount" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("Category")}>
                Category{" "}
                {sortColumn === "Category" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("Responsible")}>
                Responsible{" "}
                {sortColumn === "Responsible" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("Bank")}>
                Bank{" "}
                {sortColumn === "Bank" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead onClick={() => handleSort("Comment")}>
                Comment{" "}
                {sortColumn === "Comment" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className={
                  transaction.Category === "Unknown" ? "bg-yellow-100" : ""
                }
              >
                <TableCell>{transaction.id}</TableCell>
                {/* Split Date into Year, Month, Day */}
                <TableCell>
                  {transaction.Date
                    ? new Date(transaction.Date).getFullYear()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {transaction.Date
                    ? new Intl.DateTimeFormat("en-US", {
                        month: "long",
                      }).format(new Date(transaction.Date))
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {transaction.Date
                    ? new Date(transaction.Date).getDate()
                    : "N/A"}
                </TableCell>
                <TableCell>{transaction.Description || "N/A"}</TableCell>
                <TableCell className="text-right">
                  {transaction.Amount !== null
                    ? new Intl.NumberFormat("sv-SE", {
                        style: "currency",
                        currency: "SEK",
                      }).format(transaction.Amount)
                    : "N/A"}
                </TableCell>
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
                            editingCategory.value
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
                      onClick={() =>
                        setEditingCategory({
                          id: transaction.id,
                          value: transaction.Category || "",
                        })
                      }
                    >
                      {transaction.Category || "N/A"}
                    </div>
                  )}
                </TableCell>
                <TableCell>{transaction.Responsible || "N/A"}</TableCell>
                <TableCell>{transaction.Bank || "N/A"}</TableCell>
                <TableCell>{transaction.Comment || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ProtectedRoute>
  );
}
