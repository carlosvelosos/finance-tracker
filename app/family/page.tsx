"use client";

import { useState } from "react";
import { useFamilyTransactions } from "../../lib/hooks/useTransactions";
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

// Static Amanda's transactions data
const usTransactionsAmanda: Transaction[] = [
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
  // ... truncating the rest for brevity but keeping the structure
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
];

export default function FamilyFinancePage() {
  return (
    <ProtectedRoute>
      <FamilyFinanceContent />
    </ProtectedRoute>
  );
}

function FamilyFinanceContent() {
  const {
    amandaTransactions,
    usTransactions,
    meTransactions,
    loading,
    error,
    user,
  } = useFamilyTransactions();

  const [showComments, setShowComments] = useState(false); // State to toggle "Comment" column visibility
  const [showDate, setShowDate] = useState(false); // State to toggle "Date" column visibility
  const [showId, setShowId] = useState(false); // State to toggle "Id" column visibility

  // All the sorting state hooks
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

  // Handle loading and error states (ProtectedRoute handles authentication)
  if (loading) {
    return (
      <div className="text-center mt-10">Loading family transactions...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error loading transactions:{" "}
        {(error as Error)?.message || "Unknown error"}
      </div>
    );
  }

  const handleSort = (
    key: keyof Transaction,
    setSortConfig: React.Dispatch<
      React.SetStateAction<{
        key: keyof Transaction;
        direction: "asc" | "desc";
      } | null>
    >,
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
    sortConfig: { key: keyof Transaction; direction: "asc" | "desc" } | null,
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
    <div className="p-6 min-h-screen bg-gray-100">
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
                <CarouselItem className="basis-full md:basis-full lg:basis-full xl:basis-full 2xl:basis-1/3 pl-4">
                  <FinanceDetailCard
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
              </CarouselContent>{" "}
              {/* Navigation row with aligned elements */}{" "}
              <div className="flex items-center justify-between mt-4 px-2">
                <CarouselPrevious
                  className="static translate-y-0 transition-all pointer-events-auto 
                      disabled:text-[#898989] text-green-600 
                      hover:text-white hover:bg-green-600
                      focus:text-white focus:bg-green-600
                      disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#898989]"
                  variant="ghost"
                  size="sm"
                />

                {/* Replace standard dots with responsive dots */}
                <CarouselDotsResponsive className="flex-1" />

                <CarouselNext
                  className="static translate-y-0 transition-all pointer-events-auto 
                      disabled:text-[#898989] text-green-600 
                      hover:text-white hover:bg-green-600
                      focus:text-white focus:bg-green-600
                      disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#898989]"
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
      <div className="flex items-center mb-4 space-x-4 text-black">
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
  );
}
