"use client";

// Custom hooks for data fetching and state management
import { useInterAccountTransactionsWithBankInfo } from "../../lib/hooks/useTransactions";
import { usePageState } from "../../lib/hooks/usePageState";
// Security and authentication components
import ProtectedRoute from "@/components/protected-route";
// Data update action buttons
import UpdateAggregatedButton from "@/components/UpdateAggregatedButton";
import UpdateInterAggregatedButton from "@/components/UpdateInterAggregatedButton";
// UI components for data display and layout
import DataSourceInfo from "@/components/ui/data-source-info";
import BankTablePageHeader from "@/components/ui/bank-table-page-header";
import BankTablePageBody from "@/components/ui/bank-table-page-body";

/**
 * Inter Account Transactions Page Component
 *
 * This is the main page component for displaying Inter Bank Brazil account transactions.
 * It provides a comprehensive financial dashboard specifically designed for Inter-BR transactions
 * with advanced filtering, sorting, and data management capabilities.
 *
 * Key Features:
 * - Displays transactions from Inter Brazil bank accounts
 * - Provides multiple chart visualization options (Category and Overview charts)
 * - Includes data source information and metadata display
 * - Offers data update functionality through aggregation buttons
 * - Implements user authentication and access control
 * - Features comprehensive filtering and sorting capabilities
 * - Shows transaction totals and summaries
 *
 * Data Source: Brasil_transactions_agregated_2025 table
 * Security: Restricted to specific authorized user
 *
 * @returns {JSX.Element} The rendered Inter Account transactions page
 */
export default function Home() {
  /**
   * Data Fetching Hook
   *
   * Custom hook that fetches Inter Brazil account transactions along with bank metadata.
   * This hook provides comprehensive data including:
   * - transactions: Array of transaction records from Inter-BR accounts
   * - bankInfo: Metadata about the bank accounts and data sources
   * - loading: Boolean indicating if data is still being fetched
   * - error: Any error that occurred during data fetching
   * - user: Current authenticated user information
   *
   * The hook handles all the complex logic for combining transaction data
   * with bank information and managing the loading states.
   */
  const { transactions, bankInfo, loading, error, user } =
    useInterAccountTransactionsWithBankInfo();

  /**
   * Page State Management Hook
   *
   * Custom hook that centralizes the handling of common page states including:
   * - Loading states: Shows loading spinners while data is being fetched
   * - Error states: Displays error messages and retry options when data fetching fails
   * - Authentication states: Handles user authentication and redirects if needed
   *
   * This hook returns a renderContent function that can provide alternative
   * UI components (loading, error, auth prompts) instead of the main page content.
   */
  const { renderContent } = usePageState({
    loading,
    error: error as unknown,
    user,
  });

  /**
   * Early Return Handler
   *
   * Checks if the page should render alternative content based on current state.
   * This prevents rendering the main page content when:
   * - Data is still loading (shows loading spinner)
   * - An error occurred (shows error message with retry options)
   * - User is not authenticated (shows login prompt)
   *
   * @returns {JSX.Element | null} Alternative UI component or null if ready to render main content
   */
  const earlyReturn = renderContent();
  if (earlyReturn) return earlyReturn;

  /**
   * Table Configuration Definition
   *
   * Defines the configuration for the transaction table display.
   * This configuration object specifies:
   * - Data source: Which transactions to display
   * - Filtering: Bank-specific filtering (Inter-BR)
   * - Sorting: Initial sort column and direction (Date, descending for newest first)
   * - Column visibility: Which columns to show/hide
   * - Filter options: Which filtering capabilities to enable
   * - Database table: Source table for data updates
   *
   * The configuration is structured as an array to support multiple table sections
   * if needed in the future, though currently only one section is used.
   */
  const tableSections = [
    {
      /** Unique identifier for this table section */
      id: "main-table",
      /** Display title for this section */
      title: "All Transactions",
      /** Transaction data to display */
      transactions: transactions,
      /** Filter to show only Inter-BR bank transactions */
      bankFilter: "Inter-BR",
      /** Initial column to sort by when table loads */
      initialSortColumn: "Date",
      /** Initial sort direction (desc = newest transactions first) */
      initialSortDirection: "desc" as const,
      /** Array of column names to hide (empty = show all columns) */
      hiddenColumns: [],
      /** Enable month-based filtering dropdown */
      showMonthFilter: true,
      /** Enable category text filtering */
      showCategoryFilter: true,
      /** Enable description text filtering */
      showDescriptionFilter: true,
      /** Display total amount calculation */
      showTotalAmount: true,
      /** Database table name for update operations */
      TransactionTableName: "Brasil_transactions_agregated_2025",
    },
  ];

  /**
   * Main Page Render
   *
   * Renders the complete Inter Account transactions page with a two-part structure:
   * 1. Protected Route wrapper for security
   * 2. Page header with navigation and action buttons
   * 3. Page body with the transaction table
   *
   * The page uses a modular component architecture where:
   * - BankTablePageHeader handles all top-level UI (title, buttons, data info)
   * - BankTablePageBody handles the transaction table display
   * - ProtectedRoute ensures only authorized users can access the data
   *
   * @returns {JSX.Element} Complete Inter Account transactions page
   */
  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        {/* 
          Page Header Component
          
          Comprehensive header that includes:
          - Page title and branding
          - Info button linking to documentation
          - Data source information display
          - Update/refresh action buttons
          - Chart navigation buttons
          - Responsive layout management
        */}
        <BankTablePageHeader
          /** Main page title displayed in the header */
          title="Inter Account Transactions"
          /** Whether to show the info/help button */
          showInfoButton={true}
          /** URL for the info button navigation */
          infoButtonUrl="./info"
          /** Text displayed on the info button */
          infoButtonText="Page Info & Component Guide"
          /**
           * Data Source Information Component
           *
           * Displays metadata about the current dataset including:
           * - Number of transactions loaded
           * - Bank account information and sources
           * - Database table information
           * - Data freshness and update timestamps
           */
          dataSourceComponent={
            <DataSourceInfo
              transactions={transactions}
              bankInfo={bankInfo}
              tableName="Brasil_transactions_agregated_2025"
              tableDescription="Aggregated transactions for Brasil accounts in 2025"
            />
          }
          /**
           * Primary Update Button Component
           *
           * Main aggregation button for updating all transaction data.
           * Typically triggers a comprehensive data refresh from all sources.
           */
          updateButtonComponent={<UpdateAggregatedButton />}
          /**
           * Additional Update Buttons Array
           *
           * Specific update buttons for targeted data refresh operations.
           * Inter-specific button focuses on Inter bank data aggregation.
           */
          additionalUpdateButtons={[
            <UpdateInterAggregatedButton key="inter-update" />,
          ]}
          /**
           * Chart Navigation Buttons Configuration
           *
           * Array of buttons that provide quick navigation to different
           * chart visualization pages for data analysis:
           * - Category Chart: Breakdown by transaction categories
           * - Overview Chart: High-level financial overview and trends
           */
          chartButtons={[
            {
              url: "./category/chart",
              text: "Category Chart",
            },
            {
              url: "./overview/chart",
              text: "Overview Chart",
            },
          ]}
          /**
           * Layout Configuration
           *
           * "split" layout provides a two-column responsive design:
           * - Left side: Title, info, and data source information
           * - Right side: Action buttons and chart navigation
           * - Mobile: Stacks vertically for better usability
           */
          layout="split"
        />

        {/* 
          Page Body Component
          
          Renders the main transaction table with all configured features:
          - Sortable columns with visual indicators
          - Multi-level filtering (month, category, description)
          - Inline editing capabilities for categories and comments
          - Total amount calculations
          - Responsive design with mobile optimization
          - Export and data management features
        */}
        <BankTablePageBody sections={tableSections} />
      </div>
    </ProtectedRoute>
  );
}
