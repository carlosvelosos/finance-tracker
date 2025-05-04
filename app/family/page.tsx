"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Switch } from "@/components/ui/switch";
import TableCardFamily from "@/components/ui/table-card-family";
import ProtectedRoute from "@/components/protected-route";
import { Separator } from "@/components/ui/separator";
import { FinanceSummaryCard } from "@/components/ui/finance-summary-card";
import { FinanceDetailCard } from "@/components/ui/finance-detail-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDotsResponsive,
} from "@/components/ui/carousel";

type Transaction = {
  id: number; // Corresponds to the `id` column (bigint, primary key)
  created_at: string | null; // Corresponds to the `created_at` column (timestamp with time zone)
  Date: string | null; // Corresponds to the `Date` column (date, nullable)
  Description: string | null; // Corresponds to the `Description` column (text, nullable)
  Amount: number | null; // Corresponds to the `Amount` column (numeric, nullable)
  Balance: number | null; // Corresponds to the `Balance` column (numeric, nullable)
  Category: string | null; // Corresponds to the `Category` column (text, default 'Unknown')
  Responsible: string | null; // Corresponds to the `Responsible` column (text, default 'Carlos')
  Bank: string | null; // Corresponds to the `Bank` column (text, default 'Inter Black')
  Comment: string | null; // Corresponds to the `Comment` column (text, nullable)
  user_id: string | null; // Corresponds to the `user_id` column (uuid, nullable)
};

export default function FamilyFinancePage() {
  const [amandaTransactions, setAmandaTransactions] = useState<Transaction[]>(
    []
  );
  const [usTransactions, setUsTransactions] = useState<Transaction[]>([]);
  const [meTransactions, setMeTransactions] = useState<Transaction[]>([]);
  const [showComments, setShowComments] = useState(false); // State to toggle "Comment" column visibility
  const [showDate, setShowDate] = useState(false); // State to toggle "Date" column visibility
  const [showId, setShowId] = useState(false); // State to toggle "Id" column visibility

  // Helper function to adjust the amount based on the Balance
  const adjustTransactionAmounts = (
    transactions: Transaction[]
  ): Transaction[] => {
    return transactions.map((transaction) => {
      if (
        transaction.Comment?.includes("Outcome") &&
        transaction.Amount &&
        transaction.Amount > 0
      ) {
        return { ...transaction, Amount: -Math.abs(transaction.Amount) };
      } else if (
        transaction.Comment?.includes("Income") &&
        transaction.Amount &&
        transaction.Amount < 0
      ) {
        return { ...transaction, Amount: Math.abs(transaction.Amount) };
      }
      return transaction;
    });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      console.log("Fetching transactions from Supabase..."); // Debug log

      // Fetch data from both tables
      const { data: data2024, error: error2024 } = await supabase
        .from("Brasil_transactions_agregated_2024")
        .select("*");

      const { data: data2025, error: error2025 } = await supabase
        .from("Brasil_transactions_agregated_2025")
        .select("*");

      if (error2024 || error2025) {
        console.error("Error fetching transactions:", error2024 || error2025);
      } else {
        console.log("Fetched transactions from 2024:", data2024); // Log 2024 data
        console.log("Fetched transactions from 2025:", data2025); // Log 2025 data

        // Combine data from both years
        const combinedData = [...(data2024 || []), ...(data2025 || [])];

        const adjustedTransactions = adjustTransactionAmounts(
          combinedData as Transaction[]
        );
        console.log("Adjusted transactions:", adjustedTransactions);

        setAmandaTransactions(
          adjustedTransactions.filter(
            (transaction) => transaction.Responsible === "Amanda"
          )
        );
        setUsTransactions(
          adjustedTransactions.filter(
            (transaction) => transaction.Responsible === "us"
          )
        );
        setMeTransactions(
          adjustedTransactions.filter(
            (transaction) => transaction.Responsible === "Carlos"
          )
        );
      }
    };

    fetchTransactions();
  }, []);

  const [usTransactionsAmanda] = useState<Transaction[]>([
    {
      id: 1,
      created_at: null,
      Date: "2025-03-01",
      Description: "Verde Mar",
      Amount: -323.64,
      Balance: null,
      Category: "Groceries",
      Responsible: "us",
      Bank: null,
      Comment: "Alelo",
      user_id: null,
    },
    {
      id: 2,
      created_at: null,
      Date: "2025-03-03",
      Description: "iFood",
      Amount: -51.01,
      Balance: null,
      Category: "Food Delivery",
      Responsible: "us",
      Bank: null,
      Comment: "Nubank",
      user_id: null,
    },
    {
      id: 3,
      created_at: null,
      Date: "2025-03-04",
      Description: "Verde Mar",
      Amount: -281.7,
      Balance: null,
      Category: "Groceries",
      Responsible: "us",
      Bank: null,
      Comment: "Alelo",
      user_id: null,
    },
    {
      id: 4,
      created_at: null,
      Date: "2025-03-04",
      Description: "Verde Mar",
      Amount: -5.69,
      Balance: null,
      Category: "Groceries",
      Responsible: "us",
      Bank: null,
      Comment: "Alelo",
      user_id: null,
    },
    {
      id: 5,
      created_at: null,
      Date: "2025-03-04",
      Description: "Uber",
      Amount: -9.52,
      Balance: null,
      Category: "Transport",
      Responsible: "us",
      Bank: null,
      Comment: "Nubank",
      user_id: null,
    },
    {
      id: 6,
      created_at: null,
      Date: "2025-03-05",
      Description: "Verde Mar",
      Amount: -57.47,
      Balance: null,
      Category: "Groceries",
      Responsible: "us",
      Bank: null,
      Comment: "Alelo",
      user_id: null,
    },
    {
      id: 7,
      created_at: null,
      Date: "2025-03-05",
      Description: "Uber",
      Amount: -8.91,
      Balance: null,
      Category: "Transport",
      Responsible: "us",
      Bank: null,
      Comment: "Nubank",
      user_id: null,
    },
    {
      id: 8,
      created_at: null,
      Date: "2025-03-06",
      Description: "Grupo Kflit",
      Amount: -89.9,
      Balance: null,
      Category: "Shopping",
      Responsible: "us",
      Bank: null,
      Comment: "Itaú",
      user_id: null,
    },
    {
      id: 9,
      created_at: null,
      Date: "2025-03-06",
      Description: "Pousada",
      Amount: -598.0,
      Balance: null,
      Category: "Lodging",
      Responsible: "us",
      Bank: null,
      Comment: "Itaú",
      user_id: null,
    },
    {
      id: 10,
      created_at: null,
      Date: "2025-03-07",
      Description: "Tuna Pagamentos",
      Amount: -18.0,
      Balance: null,
      Category: "Other",
      Responsible: "us",
      Bank: null,
      Comment: "Nubank",
      user_id: null,
    },
    {
      id: 11,
      created_at: null,
      Date: "2025-03-07",
      Description: "Café Geraes (Jantar)",
      Amount: -244.2,
      Balance: null,
      Category: "Dining Out",
      Responsible: "us",
      Bank: null,
      Comment: "Nubank",
      user_id: null,
    },
    {
      id: 12,
      created_at: null,
      Date: "2025-03-08",
      Description: "Araujo OP",
      Amount: -21.08,
      Balance: null,
      Category: "Pharmacy",
      Responsible: "us",
      Bank: null,
      Comment: "Nubank",
      user_id: null,
    },
    {
      id: 13,
      created_at: null,
      Date: "2025-03-11",
      Description: "Daki",
      Amount: -87.38,
      Balance: null,
      Category: "Groceries",
      Responsible: "us",
      Bank: null,
      Comment: "Itaú",
      user_id: null,
    },
    {
      id: 14,
      created_at: null,
      Date: "2025-03-12",
      Description: "Uber",
      Amount: -10.88,
      Balance: null,
      Category: "Transport",
      Responsible: "us",
      Bank: null,
      Comment: "Nubank",
      user_id: null,
    },
    {
      id: 15,
      created_at: null,
      Date: "2025-03-14",
      Description: "Verde Mar",
      Amount: -98.35,
      Balance: null,
      Category: "Groceries",
      Responsible: "us",
      Bank: null,
      Comment: "Alelo",
      user_id: null,
    },
    {
      id: 16,
      created_at: null,
      Date: "2025-03-14",
      Description: "Uber",
      Amount: -34.79,
      Balance: null,
      Category: "Transport",
      Responsible: "us",
      Bank: null,
      Comment: "Nubank",
      user_id: null,
    },
    {
      id: 17,
      created_at: null,
      Date: "2025-03-15",
      Description: "Restaurante 65",
      Amount: -56.39,
      Balance: null,
      Category: "Dining Out",
      Responsible: "us",
      Bank: null,
      Comment: "Nubank",
      user_id: null,
    },
    {
      id: 18,
      created_at: null,
      Date: "2025-03-15",
      Description: "Três Irmãos",
      Amount: -195.09,
      Balance: null,
      Category: "Groceries",
      Responsible: "us",
      Bank: null,
      Comment: "Nubank",
      user_id: null,
    },
    {
      id: 19,
      created_at: null,
      Date: "2025-03-16",
      Description: "Três Irmãos",
      Amount: -77.42,
      Balance: null,
      Category: "Groceries",
      Responsible: "us",
      Bank: null,
      Comment: "Itaú",
      user_id: null,
    },
    {
      id: 20,
      created_at: null,
      Date: "2025-03-16",
      Description: "Picolito",
      Amount: -19.25,
      Balance: null,
      Category: "Snacks",
      Responsible: "us",
      Bank: null,
      Comment: "Itaú",
      user_id: null,
    },
    {
      id: 21,
      created_at: null,
      Date: "2025-03-16",
      Description: "Três Irmãos",
      Amount: -21.99,
      Balance: null,
      Category: "Groceries",
      Responsible: "us",
      Bank: null,
      Comment: "Nubank",
      user_id: null,
    },
    {
      id: 22,
      created_at: null,
      Date: "2025-03-17",
      Description: "iFood",
      Amount: -27.8,
      Balance: null,
      Category: "Food Delivery",
      Responsible: "us",
      Bank: null,
      Comment: "Itaú",
      user_id: null,
    },
    {
      id: 23,
      created_at: null,
      Date: "2025-03-17",
      Description: "iFood",
      Amount: -78.26,
      Balance: null,
      Category: "Food Delivery",
      Responsible: "us",
      Bank: null,
      Comment: "Itaú",
      user_id: null,
    },
    {
      id: 24,
      created_at: null,
      Date: "2025-03-19",
      Description: "iFood",
      Amount: -49.89,
      Balance: null,
      Category: "Food Delivery",
      Responsible: "us",
      Bank: null,
      Comment: "Itaú",
      user_id: null,
    },
    {
      id: 25,
      created_at: null,
      Date: "2025-03-19",
      Description: "iFood",
      Amount: -27.17,
      Balance: null,
      Category: "Food Delivery",
      Responsible: "us",
      Bank: null,
      Comment: "Itaú",
      user_id: null,
    },
    {
      id: 26,
      created_at: null,
      Date: "2025-03-19",
      Description: "iFood",
      Amount: -54.8,
      Balance: null,
      Category: "Food Delivery",
      Responsible: "us",
      Bank: null,
      Comment: "Itaú",
      user_id: null,
    },
  ]);

  const [amandaSortConfig, setAmandaSortConfig] = useState<{
    key: keyof Transaction;
    direction: "asc" | "desc";
  } | null>(null);
  const [usSortConfig, setUsSortConfig] = useState<{
    key: keyof Transaction;
    direction: "asc" | "desc";
  } | null>(null);
  const [meSortConfig, setMeSortConfig] = useState<{
    key: keyof Transaction;
    direction: "asc" | "desc";
  } | null>(null);
  const [usAmandaSortConfig, setUsAmandaSortConfig] = useState<{
    key: keyof Transaction;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (
    key: keyof Transaction,
    setSortConfig: React.Dispatch<
      React.SetStateAction<{
        key: keyof Transaction;
        direction: "asc" | "desc";
      } | null>
    >
  ) => {
    setSortConfig((prev) => {
      if (prev?.key === key && prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortTransactions = (
    transactions: Transaction[],
    sortConfig: { key: keyof Transaction; direction: "asc" | "desc" } | null
  ) => {
    if (!sortConfig) return transactions;

    const { key, direction } = sortConfig;
    const sorted = [...transactions].sort((a, b) => {
      const order = direction === "asc" ? 1 : -1;

      const aValue = a[key] ?? ""; // Handle undefined or null values
      const bValue = b[key] ?? "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * order;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * order;
      }

      return 0;
    });

    return sorted;
  };

  return (
    <ProtectedRoute>
      <div className="p-6 min-h-screen">
        {/* Main Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Left Column: Summary Card (25% width) */}
          <div className="md:col-span-1">
            <FinanceSummaryCard
              amandaTransactions={amandaTransactions}
              usTransactions={usTransactions}
              usTransactionsAmanda={usTransactionsAmanda}
            />
          </div>

          {/* Right Column: Detail Cards (75% width) */}
          <div className="md:col-span-3">
            {/* Carousel on all screens except mobile */}
            <div className="hidden md:block px-4">
              <Carousel
                opts={{
                  align: "center",
                  loop: false,
                  containScroll: "trimSnaps",
                  slidesToScroll: 1,
                }}
                className="w-full relative"
              >
                {/* Carousel content with responsive behavior */}
                <CarouselContent>
                  {/* Amanda Personal Card */}
                  <CarouselItem className="basis-full md:basis-full lg:basis-full xl:basis-full 2xl:basis-1/3 pl-4 ">
                    <FinanceDetailCard
                      className="bg-[#171717] text-white"
                      title="Amanda - Personal"
                      amandaTransactions={amandaTransactions}
                      usTransactions={usTransactions}
                      usTransactionsAmanda={usTransactionsAmanda}
                      cardType="personal"
                    />
                  </CarouselItem>

                  {/* Sweden Card */}
                  <CarouselItem className="basis-full md:basis-full lg:basis-full xl:basis-full 2xl:basis-1/3 pl-4">
                    <FinanceDetailCard
                      title="Sweden Dec 24 - Jan 25"
                      amandaTransactions={amandaTransactions}
                      usTransactions={usTransactions}
                      usTransactionsAmanda={usTransactionsAmanda}
                      cardType="sweden"
                    />
                  </CarouselItem>

                  {/* Brasil Card */}
                  <CarouselItem className="basis-full md:basis-full lg:basis-full xl:basis-full 2xl:basis-1/3 pl-4">
                    <FinanceDetailCard
                      title="Brasil Fev - Mar 25"
                      amandaTransactions={amandaTransactions}
                      usTransactions={usTransactions}
                      usTransactionsAmanda={usTransactionsAmanda}
                      cardType="brasil"
                    />
                  </CarouselItem>

                  {/* PIX Card */}
                  <CarouselItem className="basis-full md:basis-full lg:basis-full xl:basis-full 2xl:basis-1/3 pl-4">
                    <FinanceDetailCard
                      title="Amanda - PIX"
                      amandaTransactions={amandaTransactions}
                      usTransactions={usTransactions}
                      usTransactionsAmanda={usTransactionsAmanda}
                      cardType="pix"
                    />
                  </CarouselItem>

                  {/* Wedding Card - Add this new card */}
                  <CarouselItem className="basis-full md:basis-full lg:basis-full xl:basis-full 2xl:basis-1/3 pl-4">
                    <FinanceDetailCard
                      title="Casamento Karlinha e Perna"
                      amandaTransactions={amandaTransactions}
                      usTransactions={usTransactions}
                      usTransactionsAmanda={usTransactionsAmanda}
                      cardType="Casamento Karlinha e Perna"
                    />
                  </CarouselItem>
                </CarouselContent>

                {/* Navigation row with aligned elements */}
                <div className="flex items-center justify-between mt-4 px-2">
                  <CarouselPrevious
                    className="static translate-y-0 opacity-70 hover:opacity-100 hover:bg-white transition-all pointer-events-auto"
                    variant="ghost"
                    size="sm"
                  />

                  {/* Replace standard dots with responsive dots */}
                  <CarouselDotsResponsive className="flex-1" />

                  <CarouselNext
                    className="static translate-y-0 opacity-70 hover:opacity-100 hover:bg-white transition-all pointer-events-auto"
                    variant="ghost"
                    size="sm"
                  />
                </div>
              </Carousel>
            </div>

            {/* Mobile view - stack the cards vertically (unchanged) */}
            <div className="md:hidden space-y-4">
              {/* Personal Card */}
              <FinanceDetailCard
                title="Amanda - Personal"
                amandaTransactions={amandaTransactions}
                usTransactions={usTransactions}
                usTransactionsAmanda={usTransactionsAmanda}
                cardType="personal"
              />

              {/* Sweden Card */}
              <FinanceDetailCard
                title="Sweden Dec 24 - Jan 25"
                amandaTransactions={amandaTransactions}
                usTransactions={usTransactions}
                usTransactionsAmanda={usTransactionsAmanda}
                cardType="sweden"
              />

              {/* Brazil Card */}
              <FinanceDetailCard
                title="Brasil Fev - Mar 25"
                amandaTransactions={amandaTransactions}
                usTransactions={usTransactions}
                usTransactionsAmanda={usTransactionsAmanda}
                cardType="brasil"
              />

              {/* PIX Card */}
              <FinanceDetailCard
                title="Amanda - PIX"
                amandaTransactions={amandaTransactions}
                usTransactions={usTransactions}
                usTransactionsAmanda={usTransactionsAmanda}
                cardType="pix"
              />

              {/* Wedding Card - Add this new card */}
              <FinanceDetailCard
                title="Casamento Karlinha e Perna"
                amandaTransactions={amandaTransactions}
                usTransactions={usTransactions}
                usTransactionsAmanda={usTransactionsAmanda}
                cardType="Casamento Karlinha e Perna"
              />
            </div>
          </div>
        </div>

        {/* Separator between sections */}
        <Separator className="my-12" />

        {/* Switches to toggle columns */}
        <div className="flex items-center mb-4 space-x-4">
          <div className="flex items-center">
            <Switch
              checked={showComments}
              onCheckedChange={setShowComments}
              className="mr-2"
            />
            <span className="text-sm">Show Comments</span>
          </div>
          <div className="flex items-center">
            <Switch
              checked={showDate}
              onCheckedChange={setShowDate}
              className="mr-2"
            />
            <span className="text-sm">Show Date</span>
          </div>
          <div className="flex items-center">
            <Switch
              checked={showId}
              onCheckedChange={setShowId}
              className="mr-2"
            />
            <span className="text-sm">Show Id</span>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carlos' Transactions */}
          <TableCardFamily
            title="Carlos' Transactions"
            sections={[
              {
                name: "Amanda",
                transactions: amandaTransactions,
                sortConfig: amandaSortConfig,
                setSortConfig: setAmandaSortConfig,
              },
              {
                name: "US",
                transactions: usTransactions,
                sortConfig: usSortConfig,
                setSortConfig: setUsSortConfig,
              },
              {
                name: "Carlos",
                transactions: meTransactions,
                sortConfig: meSortConfig,
                setSortConfig: setMeSortConfig,
              },
            ]}
            showComments={showComments}
            showDate={showDate}
            showId={showId}
            handleSort={handleSort}
            sortTransactions={sortTransactions}
          />

          {/* Amanda's Transactions */}
          <TableCardFamily
            title="Amanda's Transactions"
            sections={[
              {
                name: "Amanda",
                transactions: [], // No data for this section
                sortConfig: null,
                setSortConfig: () => {}, // No sorting needed for an empty section
              },
              {
                name: "US",
                transactions: usTransactionsAmanda,
                sortConfig: usAmandaSortConfig,
                setSortConfig: setUsAmandaSortConfig,
              },
              {
                name: "Carlos",
                transactions: [], // No data for this section
                sortConfig: null,
                setSortConfig: () => {}, // No sorting needed for an empty section
              },
            ]}
            showComments={showComments}
            handleSort={handleSort}
            showDate={showDate}
            showId={showId}
            sortTransactions={sortTransactions}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
