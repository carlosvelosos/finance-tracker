"use client";

// Import custom hooks for fetching transactions and managing page state
import { useInAllTransactions } from "../../lib/hooks/useTransactions";
import { usePageState } from "../../lib/hooks/usePageState";
// Import UI components
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import TransactionTable from "@/components/ui/transaction/TransactionTable";

/**
 * Inter Bank Transactions Page Component
 *
 * This is the main page component for displaying Inter Bank transactions.
 * It provides a comprehensive view of all Inter bank account transactions
 * with filtering capabilities, sorting, and direct access to external banking services.
 *
 * Key Features:
 * - Displays transactions from Inter bank in a sortable, filterable table
 * - Provides quick access buttons to Inter's online banking platform
 * - Includes navigation to chart visualization page
 * - Implements user authentication and authorization
 * - Shows transaction totals and supports various filtering options
 *
 * @returns {JSX.Element} The rendered Inter transactions page
 */
export default function Home() {
  // Custom hook to fetch all Inter bank transactions
  // Returns transactions data, loading state, error state, and user authentication info
  const { transactions, loading, error, user } = useInAllTransactions();

  // Custom hook to manage page rendering states (loading, error, authentication)
  // Provides centralized state management for common page conditions
  const { renderContent } = usePageState({
    loading,
    error: error as unknown,
    user,
  });

  // Identifier for the transaction table - used for filtering and identification
  const TransactionTableName = "IN_ALL";

  /**
   * Early Return Handler
   *
   * Checks if the page should render alternative content based on current state.
   * This handles loading states, error conditions, and authentication issues.
   * If any of these conditions are met, it returns the appropriate UI component
   * instead of the main page content.
   *
   * @returns {JSX.Element | null} Loading spinner, error message, login prompt, or null
   */
  const earlyReturn = renderContent();
  if (earlyReturn) return earlyReturn;

  /**
   * Main Page Render
   *
   * Renders the complete Inter transactions page with the following structure:
   * 1. Protected Route wrapper - restricts access to authorized users only
   * 2. Page header with title
   * 3. Action buttons for external banking access and navigation
   * 4. Transaction table with comprehensive filtering and sorting capabilities
   *
   * Security: Only allows access to specific user ID for data protection
   *
   * @returns {JSX.Element} The complete Inter transactions page UI
   */
  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-center mb-6">
          Inter Transactions
        </h1>

        {/* 
          Action Buttons Section
          Provides quick access to external services and internal navigation
        */}
        <div className="text-right mb-4 flex justify-end gap-3">
          {/* 
            Download Invoice Button
            Opens Inter's online banking platform in a new tab for downloading statements
            Provides direct access to the official Inter digital account platform
          */}
          <Button
            onClick={() =>
              window.open("https://contadigital.inter.co/extrato", "_blank")
            }
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-green-300"
          >
            Download Invoice
          </Button>

          {/* 
            Chart Navigation Button
            Redirects user to the chart visualization page for graphical analysis
            Uses window.location.href for full page navigation
          */}
          <Button
            onClick={() => (window.location.href = "./chart")}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-green-700 border border-green-500"
          >
            Go to Chart Page
          </Button>
        </div>

        {/* 
          Transaction Table Component
          
          Main data display component that renders all Inter bank transactions.
          Configured with comprehensive features:
          
          Props Explanation:
          - transactions: Array of transaction data fetched from the database
          - TransactionTableName: Identifier for table filtering and operations
          - bankFilter: Filters transactions to show only "Inter Black" account data
          - initialSortColumn: Sets default sorting by "Date" column
          - initialSortDirection: Default descending order (newest transactions first)
          - hiddenColumns: Empty array means all columns are visible
          - showMonthFilter: Enables month-based filtering dropdown
          - showCategoryFilter: Enables transaction category filtering
          - showDescriptionFilter: Enables text-based description search
          - showTotalAmount: Displays calculated totals for filtered transactions
        */}
        <TransactionTable
          transactions={transactions}
          TransactionTableName={TransactionTableName}
          bankFilter="Inter Black"
          initialSortColumn="Date"
          initialSortDirection="desc"
          hiddenColumns={[]} // Show all columns
          showMonthFilter={true}
          showCategoryFilter={true}
          showDescriptionFilter={true}
          showTotalAmount={true}
        />
      </div>
    </ProtectedRoute>
  );
}
