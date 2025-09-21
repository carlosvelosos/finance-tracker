/**
 * Family Finance Page Component
 *
 * This page provides a comprehensive view of family financial transactions including:
 * - Summary cards showing financial overviews
 * - Detail cards for different spending categories (Personal, Sweden, Brasil, PIX, Wedding)
 * - Interactive transaction tables with sorting and filtering capabilities
 * - Responsive design with carousel for desktop and stacked cards for mobile
 */

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

/**
 * Transaction Type Definition
 * Represents a single financial transaction with all possible fields
 * Maps directly to the Supabase database table structure
 */
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

/**
 * Static Amanda's Transactions Data
 *
 * Hardcoded transaction data for Amanda's US spending during March 2025.
 * This includes expenses for groceries, food delivery, and other personal spending.
 * Used as supplementary data alongside dynamically fetched transactions.
 */
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
];

/**
 * Main Family Finance Page Component
 *
 * Entry point for the family finance page that wraps the main content
 * with authentication protection. Only authenticated users can access this page.
 *
 * @returns JSX.Element - Protected route wrapper with family finance content
 */
export default function FamilyFinancePage() {
  return (
    <ProtectedRoute>
      <FamilyFinanceContent />
    </ProtectedRoute>
  );
}

/**
 * Family Finance Content Component
 *
 * Main content component that renders the family finance dashboard.
 * Handles data fetching, loading states, error states, and renders all UI components.
 *
 * Features:
 * - Fetches family transaction data from multiple sources
 * - Manages sorting state for multiple transaction tables
 * - Controls column visibility (comments, date, ID)
 * - Renders responsive layout with summary cards, detail cards, and transaction tables
 */
function FamilyFinanceContent() {
  // Fetch family transaction data from the custom hook
  const { amandaTransactions, usTransactions, meTransactions, loading, error } =
    useFamilyTransactions();

  // UI State Management - Controls which columns are visible in transaction tables
  const [showComments, setShowComments] = useState(false); // State to toggle "Comment" column visibility
  const [showDate, setShowDate] = useState(false); // State to toggle "Date" column visibility
  const [showId, setShowId] = useState(false); // State to toggle "Id" column visibility

  // Sorting State Management - Each transaction table has its own sort configuration
  // These states store the current sort column and direction (asc/desc) for each table section
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

  // Loading State - Show loading message while data is being fetched
  // ProtectedRoute handles authentication, so we only need to handle data loading here
  if (loading) {
    return (
      <div className="text-center mt-10">Loading family transactions...</div>
    );
  }

  // Error State - Display error message if data fetching fails
  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error loading transactions:{" "}
        {(error as Error)?.message || "Unknown error"}
      </div>
    );
  }

  /**
   * Handle Sort Function
   *
   * Manages sorting logic for transaction tables. When called, it toggles
   * between ascending, descending, and no sort states for a given column.
   *
   * @param key - The transaction property to sort by
   * @param setSortConfig - State setter function for the specific table's sort config
   */
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

  /**
   * Sort Transactions Function
   *
   * Applies sorting to a transaction array based on the provided sort configuration.
   * Handles both string and numeric sorting with proper null/undefined value handling.
   *
   * @param transactions - Array of transactions to sort
   * @param sortConfig - Sort configuration object with key and direction
   * @returns Sorted array of transactions
   */
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
      {/* ===== MAIN SUMMARY SECTION ===== */}
      {/* 
        Two-column layout for desktop:
        - Left column (25%): Financial summary card showing totals and overviews
        - Right column (75%): Carousel of detailed finance cards for different categories
      */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Left Column: Summary Card (25% width on desktop) */}
        <div className="md:col-span-1">
          <FinanceSummaryCard
            amandaTransactions={amandaTransactions}
            usTransactions={usTransactions}
            usTransactionsAmanda={usTransactionsAmanda}
          />
        </div>

        {/* Right Column: Detail Cards (75% width on desktop) */}
        <div className="md:col-span-3">
          {/* ===== DESKTOP CAROUSEL VIEW ===== */}
          {/* 
            Responsive carousel that shows finance detail cards:
            - Hidden on mobile (md:hidden)
            - Shows 1 card at a time on medium/large screens
            - Shows up to 3 cards at once on 2xl screens
          */}
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
              <CarouselContent>
                {/* Amanda Personal Card - Shows Amanda's personal expenses and statistics */}
                <CarouselItem className="basis-full md:basis-full lg:basis-full xl:basis-full 2xl:basis-1/3 pl-4">
                  <FinanceDetailCard
                    title="Amanda - Personal"
                    amandaTransactions={amandaTransactions}
                    usTransactions={usTransactions}
                    usTransactionsAmanda={usTransactionsAmanda}
                    cardType="personal"
                  />
                </CarouselItem>

                {/* Sweden Card - Shows expenses during Sweden trip (Dec 24 - Jan 25) */}
                <CarouselItem className="basis-full md:basis-full lg:basis-full xl:basis-full 2xl:basis-1/3 pl-4">
                  <FinanceDetailCard
                    title="Sweden Dec 24 - Jan 25"
                    amandaTransactions={amandaTransactions}
                    usTransactions={usTransactions}
                    usTransactionsAmanda={usTransactionsAmanda}
                    cardType="sweden"
                  />
                </CarouselItem>

                {/* Brasil Card - Shows expenses during Brasil trip (Feb - Mar 25) */}
                <CarouselItem className="basis-full md:basis-full lg:basis-full xl:basis-full 2xl:basis-1/3 pl-4">
                  <FinanceDetailCard
                    title="Brasil Fev - Mar 25"
                    amandaTransactions={amandaTransactions}
                    usTransactions={usTransactions}
                    usTransactionsAmanda={usTransactionsAmanda}
                    cardType="brasil"
                  />
                </CarouselItem>

                {/* PIX Card - Shows Amanda's PIX transactions (Brazilian instant payment system) */}
                <CarouselItem className="basis-full md:basis-full lg:basis-full xl:basis-full 2xl:basis-1/3 pl-4">
                  <FinanceDetailCard
                    title="Amanda - PIX"
                    amandaTransactions={amandaTransactions}
                    usTransactions={usTransactions}
                    usTransactionsAmanda={usTransactionsAmanda}
                    cardType="pix"
                  />
                </CarouselItem>

                {/* Wedding Card - Shows expenses related to Karlinha and Perna's wedding */}
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

              {/* Carousel Navigation Controls */}
              <div className="flex items-center justify-between mt-4 px-2">
                {/* Previous Button - Custom styled with green theme */}
                <CarouselPrevious
                  className="static translate-y-0 transition-all pointer-events-auto 
                      disabled:text-[#898989] text-green-600 
                      hover:text-white hover:bg-green-600
                      focus:text-white focus:bg-green-600
                      disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#898989]"
                  variant="ghost"
                  size="sm"
                />

                {/* Carousel Dots - Responsive pagination indicators */}
                <CarouselDotsResponsive className="flex-1" />

                {/* Next Button - Custom styled with green theme */}
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

          {/* ===== MOBILE STACK VIEW ===== */}
          {/* 
            Mobile layout that stacks all finance detail cards vertically
            - Only visible on mobile screens (md:hidden)
            - Same cards as carousel but in a simple vertical stack
          */}
          <div className="md:hidden space-y-4">
            <FinanceDetailCard
              title="Amanda - Personal"
              amandaTransactions={amandaTransactions}
              usTransactions={usTransactions}
              usTransactionsAmanda={usTransactionsAmanda}
              cardType="personal"
            />

            <FinanceDetailCard
              title="Sweden Dec 24 - Jan 25"
              amandaTransactions={amandaTransactions}
              usTransactions={usTransactions}
              usTransactionsAmanda={usTransactionsAmanda}
              cardType="sweden"
            />

            <FinanceDetailCard
              title="Brasil Fev - Mar 25"
              amandaTransactions={amandaTransactions}
              usTransactions={usTransactions}
              usTransactionsAmanda={usTransactionsAmanda}
              cardType="brasil"
            />

            <FinanceDetailCard
              title="Amanda - PIX"
              amandaTransactions={amandaTransactions}
              usTransactions={usTransactions}
              usTransactionsAmanda={usTransactionsAmanda}
              cardType="pix"
            />

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

      {/* Visual separator between summary section and transaction tables */}
      <Separator className="my-12" />

      {/* ===== COLUMN VISIBILITY CONTROLS ===== */}
      {/* 
        Toggle switches that control which columns are visible in the transaction tables below.
        Users can show/hide: Comments, Date, and ID columns across all tables.
      */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-black">
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

        {/* Link to detailed table view */}
        <div className="flex items-center">
          <a
            href="/family/table"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M3 6h18m-9 8h9"
              />
            </svg>
            View All Data Table
          </a>
        </div>
      </div>

      {/* ===== TRANSACTION TABLES SECTION ===== */}
      {/* 
        Two-column layout showing detailed transaction tables:
        - Left: Carlos' Transactions (with Amanda, US, and Carlos sections)
        - Right: Amanda's Transactions (with US section and empty Amanda/Carlos sections)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carlos' Transactions Table */}
        {/* 
          Displays transactions where Carlos is responsible, organized into three sections:
          1. Amanda section - transactions Carlos made for Amanda
          2. US section - transactions Carlos made in the US
          3. Carlos section - Carlos' personal transactions
        */}
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

        {/* Amanda's Transactions Table */}
        {/* 
          Displays transactions where Amanda is responsible.
          Currently only has data in the US section (static data from usTransactionsAmanda).
          Amanda and Carlos sections are empty but kept for consistent UI structure.
        */}
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
              transactions: usTransactionsAmanda, // Static transaction data for Amanda's US expenses
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
