# Project Directory Structure

This document outlines the directory structure of the project.

## Table of Contents

- [`app/about`](#appabout)
- [`app/actions`](#appactions)
- [`app/amex`](#appamex)
- [`app/amex/chart`](#appamexchart)
- [`app/auth`](#appauth)
- [`app/auth/callback`](#appauthcallback)
- [`app/auth/forgot-password`](#appauthforgot-password)
- [`app/auth/login`](#appauthlogin)
- [`app/auth/reset-password`](#appauthreset-password)
- [`app/auth/signup`](#appauthsignup)
- [`app/components`](#appcomponents)
- [`app/email-client`](#appemail-client)
- [`app/email-merge`](#appemail-merge)
- [`app/family`](#appfamily)
- [`app/global`](#appglobal)
- [`app/global/chart`](#appglobalchart)
- [`app/handelsbanken`](#apphandelsbanken)
- [`app/handelsbanken/category`](#apphandelsbankencategory)
- [`app/handelsbanken/category/chart`](#apphandelsbankencategorychart)
- [`app/handelsbanken/overview`](#apphandelsbankenview)
- [`app/handelsbanken/overview/chart`](#apphandelsbankenoverviewchart)
- [`app/inter`](#appinter)
- [`app/inter/chart`](#appinterchart)
- [`app/inter-account`](#appinter-account)
- [`app/inter-account/category`](#appinter-accountcategory)
- [`app/inter-account/category/chart`](#appinter-accountcategorychart)
- [`app/inter-account/info`](#appinter-accountinfo)
- [`app/inter-account/overview`](#appinter-accountoverview)
- [`app/inter-account/overview/chart`](#appinter-accountoverviewchart)
- [`app/profile`](#appprofile)
- [`app/recurrent`](#apprecurrent)
- [`app/sjprio`](#appsjprio)
- [`app/sjprio/chart`](#appsjpriochart)
- [`app/types`](#apptypes)
- [`app/unauthorized`](#appunauthorized)
- [`app/upload`](#appupload)
- [`app/welcome`](#appwelcome)

---

### `app/about`

- **Parent Directory:** `app`
- **Path:** `app/about`
- **Summary:** This directory likely contains the UI and logic for the "About" page of the application.
- **Files:**
  - `page.tsx` - About page component

### `app/actions`

- **Parent Directory:** `app`
- **Path:** `app/actions`
- **Summary:** This directory probably holds server-side actions or functions that handle data manipulation and business logic, such as updating database records.
- **Files:**
  - `fileActions.ts` - File handling actions
    - **Functions:**
      - `uploadExcel()` - Main function to upload and process Excel/CSV files from different banks
      - `createTableInSupabase()` - Returns SQL instructions for manually creating tables in Supabase
      - `executeTableCreation()` - Attempts to automatically create tables with proper RLS policies
      - `uploadToSupabase()` - Private function to upload processed transactions to Supabase tables
      - `clearTableData()` - Function to clear all data from a specified table
  - `updateActions.ts` - Update operations actions
    - **Functions:**
      - `getUpdatePreview()` - Gets preview of new Handelsbanken transactions to be added to aggregated table
      - `executeUpdate()` - Executes the update to add new Handelsbanken transactions to aggregated table
      - `getAmexUpdatePreview()` - Gets preview of available American Express monthly tables for aggregation
      - `previewAmexMonthTransactions()` - Previews transactions from a specific AMEX monthly table
      - `executeAmexUpdate()` - Executes update to add AMEX monthly data to aggregated table
      - `getSjUpdatePreview()` - Gets preview of available SJ Prio monthly tables for aggregation
      - `previewSjMonthTransactions()` - Previews transactions from a specific SJ monthly table
      - `executeSjUpdate()` - Executes update to add SJ Prio monthly data to aggregated table
      - `getInterUpdatePreview()` - Gets preview of available Inter bank tables for Brazil aggregation
      - `previewInterTableTransactions()` - Previews transactions from selected Inter bank tables
      - `executeInterUpdate()` - Executes update to add Inter bank data to Brazil aggregated table

### `app/amex`

- **Parent Directory:** `app`
- **Path:** `app/amex`
- **Summary:** This directory is likely dedicated to features related to American Express accounts, such as displaying transactions and account details.
- **Files:**
  - `page.tsx` - Main American Express page component
    - **Functions:**
      - `fetchTransactions()` - Fetches American Express transactions from Sweden aggregated table
    - **Features:**
      - Protected route for authorized users only
      - Two accordion sections: Main Transactions and Invoice Transactions
      - Transaction filtering by bank (American Express)
      - Separate views for regular transactions (excluding invoices) and invoice-only transactions
      - Integration with UpdateAmexAggregatedButton for data updates
      - External link to American Express login page for invoice downloads
      - Navigation to chart visualization page
      - Uses TransactionTable component with customizable filters and sorting
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with allowed user ID validation
      - Container div with responsive padding
      - Page title: "American Express Transactions" (h1, centered)
      - Action buttons row (right-aligned, horizontal layout):
        - `UpdateAmexAggregatedButton` - Updates aggregated data
        - "Download Invoice" button - Opens AMEX login page in new tab
        - "Go to Chart Page" button - Navigates to chart visualization
      - `Accordion` component (single collapsible type):
        - **First Section: "Main Transactions"**
          - `AccordionItem` with value "main-table"
          - `AccordionTrigger` with section title
          - `AccordionContent` containing:
            - `TransactionTable` with full feature set:
              - Bank filter: "American Express"
              - Initial sort: Date descending
              - All columns visible
              - Month, category, and description filters enabled
              - Total amount display enabled
              - Excludes "Invoice" category transactions
        - **Second Section: "Invoice Transactions"**
          - `AccordionItem` with value "invoice-table"
          - `AccordionTrigger` with section title
          - `AccordionContent` containing:
            - `TransactionTable` with simplified configuration:
              - Pre-filtered for Invoice category + American Express bank
              - Initial sort: Date descending
              - All columns visible
              - No filters enabled (showFilters: false)
              - Total amount display enabled

### `app/amex/chart`

- **Parent Directory:** `amex`
- **Path:** `app/amex/chart`
- **Summary:** Contains components for visualizing American Express account data.
- **Files:**
  - `page.tsx` - American Express chart visualization component
    - **Functions:**
      - `fetchTransactions()` - Fetches American Express transactions from Sweden aggregated table with bank filtering
    - **Features:**
      - Protected route for authorized users only
      - Data visualization using CustomBarChart component
      - Bank-specific filtering (American Express only)
      - Category-based transaction filtering with exclusions
      - Responsive chart display with full-screen layout
      - Real-time data fetching from Supabase
    - **Data Filtering:**
      - Excludes specific categories:
        - "Amex Invoice"
        - "SEB SJ Prio Invoice"
        - "Investment"
        - "Sek to Reais"
        - "SJ PRIO MASTER Invoice"
        - "Income - Salary"
        - "Income - Skat"
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with allowed user ID validation
      - Flexbox container with full-screen height and center alignment
      - Padding wrapper div (pt-8 pb-8)
      - `CustomBarChart` component with configuration:
        - Data: Filtered transaction data (excluding specified categories)
        - Bar color: CSS variable --chart-1
        - Title: "Total Amount per Category"
        - Description: "Showing totals for American Express transactions"
        - Displays aggregated amounts by transaction category

### `app/auth`

- **Parent Directory:** `app`
- **Path:** `app/auth`
- **Summary:** This directory contains all authentication-related pages and logic.
- **Subdirectories:**
  - `callback/` - Authentication callback handling
  - `forgot-password/` - Password recovery
  - `login/` - User login
  - `reset-password/` - Password reset
  - `signup/` - User registration

### `app/auth/callback`

- **Parent Directory:** `auth`
- **Path:** `app/auth/callback`
- **Summary:** Handles the callback from the authentication provider.
- **Files:**
  - `route.ts` - Authentication callback route handler

### `app/auth/forgot-password`

- **Parent Directory:** `auth`
- **Path:** `app/auth/forgot-password`
- **Summary:** The page where users can request a password reset.
- **Files:**
  - `page.tsx` - Forgot password page component

### `app/auth/login`

- **Parent Directory:** `auth`
- **Path:** `app/auth/login`
- **Summary:** The login page for users.
- **Files:**
  - `page.tsx` - Login page component

### `app/auth/reset-password`

- **Parent Directory:** `auth`
- **Path:** `app/auth/reset-password`
- **Summary:** The page where users can reset their password.
- **Files:**
  - `page.tsx` - Reset password page component

### `app/auth/signup`

- **Parent Directory:** `auth`
- **Path:** `app/auth/signup`
- **Summary:** The signup page for new users.
- **Files:**
  - `page.tsx` - Signup page component

### `app/components`

- **Parent Directory:** `app`
- **Path:** `app/components`
- **Summary:** Contains reusable React components that are specific to certain pages or features within the `app` directory.
- **Files:**
  - `bill-card.tsx` - Bill card component
  - `bill-item.tsx` - Bill item component

### `app/email-client`

- **Parent Directory:** `app`
- **Path:** `app/email-client`
- **Summary:** This directory likely contains the UI and logic for an email client feature within the application.
- **Files:**
  - `page.tsx` - Email client page component

### `app/email-merge`

- **Parent Directory:** `app`
- **Path:** `app/email-merge`
- **Summary:** This directory is probably for a feature that merges emails, possibly for consolidating financial reports from different sources.
- **Files:**
  - `page.tsx` - Email merge page component

### `app/family`

- **Parent Directory:** `app`
- **Path:** `app/family`
- **Summary:** This directory may contain features related to family finance management, such as shared accounts or budgets.
- **Files:**
  - `layout.tsx` - Family section layout component
  - `page.tsx` - Family page component
    - **Functions:**
      - `fetchTransactions()` - Fetches transactions from Brasil aggregated tables (2024 & 2025)
      - `adjustTransactionAmounts()` - Adjusts transaction amounts based on Comment field (Income/Outcome)
      - `handleSort()` - Generic sorting handler for transaction tables
      - `sortTransactions()` - Sorts transactions based on specified column and direction
    - **Features:**
      - Protected route access for all authenticated users
      - Multi-year data aggregation (Brasil 2024 & 2025)
      - Family expense tracking with multiple responsible parties (Amanda, Carlos, "us")
      - Responsive design with mobile and desktop layouts
      - Interactive carousel for detail cards on desktop
      - Column visibility toggles (Comments, Date, ID)
      - Transaction amount adjustment based on transaction type
      - Hardcoded sample data for Amanda's transactions (March 2025)
      - Multiple financial categories (Personal, Sweden, Brasil, PIX, Wedding)
    - **Data Management:**
      - Fetches from both `Brasil_transactions_agregated_2024` and `Brasil_transactions_agregated_2025`
      - Filters transactions by responsible party: "Amanda", "us", "Carlos"
      - Includes hardcoded `usTransactionsAmanda` array with 26 sample transactions
      - Sorting configurations for each transaction section
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper (no specific user ID restriction)
      - Main container with full-screen height and gray background
      - **Main Summary Section** (Grid layout: 1 column mobile, 4 columns desktop):
        - **Left Column (25% width)**:
          - `FinanceSummaryCard` with all transaction data
        - **Right Column (75% width)**:
          - **Desktop View**: `Carousel` component with:
            - `CarouselContent` containing 5 detail cards:
              - "Amanda - Personal" (`FinanceDetailCard`)
              - "Sweden Dec 24 - Jan 25" (`FinanceDetailCard`)
              - "Brasil Fev - Mar 25" (`FinanceDetailCard`)
              - "Amanda - PIX" (`FinanceDetailCard`)
              - "Casamento Karlinha e Perna" (`FinanceDetailCard`)
            - Navigation controls:
              - `CarouselPrevious` button (green theme)
              - `CarouselDotsResponsive` for pagination
              - `CarouselNext` button (green theme)
          - **Mobile View**: Vertical stack of the same 5 `FinanceDetailCard` components
      - `Separator` component for visual section division
      - **Toggle Controls Section**:
        - Three `Switch` components for column visibility:
          - "Show Comments" toggle
          - "Show Date" toggle
          - "Show Id" toggle
      - **Transactions Section** (Grid layout: 1 column mobile, 2 columns desktop):
        - **Carlos' Transactions** (`TableCardFamily`):
          - 3 sections: Amanda, US, Carlos transactions
          - Individual sort configurations for each section
        - **Amanda's Transactions** (`TableCardFamily`):
          - 3 sections: Amanda (empty), US (hardcoded data), Carlos (empty)
          - Sort configuration for US section only

### `app/global`

- **Parent Directory:** `app`
- **Path:** `app/global`
- **Summary:** This could be for global settings or data that applies across the entire application.
- **Files:**
  - `page.tsx` - Global page component
    - **Functions:**
      - `fetchTransactions()` - Fetches all transactions from Sweden aggregated table for authenticated user
      - `processedData.map()` - Processes transaction data to invert amount signs for specific banks (SEB SJ Prio, American Express)
    - **Features:**
      - Protected route for specific authorized user only
      - Multi-bank transaction aggregation and display
      - Amount sign inversion for credit card transactions
      - Categorized transaction filtering with accordion sections
      - Chart visualization integration
      - Real-time data fetching from Supabase
      - Multiple transaction categories with separate tables
      - Comprehensive transaction filtering and sorting capabilities
    - **Data Processing:**
      - Fetches from `Sweden_transactions_agregated_2025` table
      - Inverts amount signs for "SEB SJ Prio" and "American Express" banks
      - Filters transactions by various categories for different sections
      - Excludes specific categories from main table view
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Container div with responsive padding and margins
      - Page title: "Your Transactions" (h1, centered, bold)
      - Action button (right-aligned):
        - "Go to Chart Page" button - Navigates to chart visualization (./chart)
      - `Accordion` component (single collapsible type, default open: "main-table"):
        - **Section 1: "Main Transactions"**
          - `AccordionItem` with value "main-table"
          - `AccordionTrigger` with section title
          - `AccordionContent` containing:
            - `TransactionTable` with full filtering capabilities:
              - Excludes categories: "Amex Invoice", "SEB SJ Prio Invoice", "Investment", "Sek to Reais", "SJ PRIO MASTER Invoice", "Income - Salary", "Income - Skat"
              - Initial sort: ChronologicalDate descending
              - Hidden columns: "Balance", "Date"
              - Month, category, and description filters enabled
              - Total amount display enabled
        - **Section 2: "Credit Card Invoices"**
          - `AccordionItem` with value "credit-card-invoice-table"
          - `AccordionTrigger` with section title
          - `AccordionContent` containing:
            - `TransactionTable` for invoice transactions:
              - Includes only: "Amex Invoice", "SEB SJ Prio Invoice", "SJ PRIO MASTER Invoice"
              - Initial sort: Date descending
              - All columns visible
              - No filters enabled (showFilters: false)
              - Total amount display enabled
        - **Section 3: "Investment"**
          - `AccordionItem` with value "investment-table"
          - `AccordionTrigger` with section title
          - `AccordionContent` containing:
            - `TransactionTable` for investment transactions:
              - Filters for "Investment" category only
              - Initial sort: Date descending
              - No filters enabled
              - Total amount display enabled
        - **Section 4: "Sek to Reais"**
          - `AccordionItem` with value "sek-to-reais-table"
          - `AccordionTrigger` with section title
          - `AccordionContent` containing:
            - `TransactionTable` for currency exchange:
              - Filters for "Sek to Reais" category only
              - Initial sort: Date descending
              - No filters enabled
              - Total amount display enabled
        - **Section 5: "Income"**
          - `AccordionItem` with value "Income-table"
          - `AccordionTrigger` with section title
          - `AccordionContent` containing:
            - `TransactionTable` for income transactions:
              - Includes: "Income - Salary", "Income - Skat"
              - Initial sort: Date descending
              - No filters enabled
              - Total amount display enabled

### `app/global/chart`

- **Parent Directory:** `global`
- **Path:** `app/global/chart`
- **Summary:** Contains chart components that are used globally across the application.
- **Files:**
  - `page.tsx` - Global chart page component
    - **Functions:**
      - `CategoryChartPage()` - Main component function for category chart visualization
      - `fetchTransactions()` - Async function to fetch transaction data from Supabase
      - `transactions.filter()` - Filters out specific invoice and administrative categories
    - **Features:**
      - Protected route for specific authorized user only
      - Real-time transaction data fetching from Sweden aggregated table
      - Category-based chart visualization with filtered data
      - Responsive chart display with centered layout
      - Authentication-based access control
      - Automatic data refresh on user authentication
      - Category filtering to exclude invoice and administrative transactions
    - **Data Processing:**
      - Fetches from `Sweden_transactions_agregated_2025` table
      - Filters out categories: "Amex Invoice", "SEB SJ Prio Invoice", "Investment", "Sek to Reais", "SJ PRIO MASTER Invoice", "Income - Salary", "Income - Skat"
      - Uses TypeScript Transaction interface with fields: id, Category, Amount, Bank, Description, Date
      - Real-time state management with React hooks
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Main container div with centered flex layout and full screen height
      - Conditional rendering:
        - **Unauthenticated State**: Center-aligned message "Please log in to view the chart."
        - **Authenticated State**:
          - Container div with vertical padding (pt-8 pb-8)
          - `CustomBarChart` component with configuration:
            - **Data**: Filtered transaction data (excludes invoice/administrative categories)
            - **Styling**: Custom bar color using CSS variable `hsl(var(--chart-1))`
            - **Title**: "Total Amount per Category"
            - **Description**: "Showing totals for American Express, SJ Prio and Handelsbanken transactions"

### `app/handelsbanken`

- **Parent Directory:** `app`
- **Path:** `app/handelsbanken`
- **Summary:** This directory is dedicated to features for Handelsbanken accounts.
- **Files:**
  - `page.tsx` - Handelsbanken main page component
    - **Functions:**
      - `Home()` - Main component function for Handelsbanken transactions page
      - `fetchTransactions()` - Async function to fetch Handelsbanken transaction data from Supabase
    - **Features:**
      - Protected route for specific authorized user only
      - Real-time transaction data fetching from Sweden aggregated table
      - Bank-specific filtering (Handelsbanken only)
      - Comprehensive transaction filtering and sorting capabilities
      - Navigation to category and overview chart visualizations
      - Data update functionality through UpdateAggregatedButton
      - Authentication-based access control
      - Responsive design with container layout
    - **Data Processing:**
      - Fetches from `Sweden_transactions_agregated_2025` table
      - Filters transactions by user ID for authenticated user
      - Uses TypeScript Transaction interface with comprehensive field mapping
      - Real-time state management with React hooks
      - Bank-specific filtering applied to TransactionTable component
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Main container div with responsive padding (mx-auto p-4)
      - Conditional rendering:
        - **Unauthenticated State**: Center-aligned message "Please log in to view your transactions."
        - **Authenticated State**:
          - Page title: "Handelsbanken Transactions" (h1, centered, bold, mb-6)
          - **Action Buttons Section** (Flexbox with space-between layout):
            - **Left Side**: `UpdateAggregatedButton` component for data updates
            - **Right Side**: Two navigation buttons with space-x-4 gap:
              - "Category Chart" button - Navigates to `./category/chart`
              - "Overview Chart" button - Navigates to `./overview/chart`
            - **Button Styling**: Black background, white text, green hover and border effects
          - `TransactionTable` component with full configuration:
            - **Data**: All fetched transactions
            - **Bank Filter**: "Handelsbanken" (pre-filtered)
            - **Initial Sort**: Date column, descending order
            - **Column Visibility**: All columns visible (hiddenColumns: [])
            - **Filters Enabled**: Month, category, and description filters
            - **Features**: Total amount display enabled
            - **Responsive**: Full-width table layout
- **Subdirectories:**
  - `category/` - Transaction categories for Handelsbanken
  - `overview/` - Overview features for Handelsbanken

### `app/handelsbanken/category`

- **Parent Directory:** `handelsbanken`
- **Path:** `app/handelsbanken/category`
- **Summary:** Manages transaction categories for Handelsbanken accounts.
- **Subdirectories:**
  - `chart/` - Chart visualizations for categories

### `app/handelsbanken/category/chart`

- **Parent Directory:** `category`
- **Path:** `app/handelsbanken/category/chart`
- **Summary:** Chart components for visualizing Handelsbanken transaction categories.
- **Files:**
  - `page.tsx` - Handelsbanken category chart component
    - **Functions:**
      - `CategoryChartPage()` - Main component function for Handelsbanken category chart visualization
      - `fetchTransactions()` - Async function to fetch Handelsbanken transaction data from Supabase
      - `transactions.filter()` - Filters out specific invoice and administrative categories from chart data
    - **Features:**
      - Protected route for specific authorized user only
      - Real-time transaction data fetching from Sweden aggregated table
      - Bank-specific filtering (Handelsbanken only)
      - Category-based chart visualization with filtered data
      - Responsive chart display with centered layout
      - Authentication-based access control
      - Automatic data refresh on user authentication
      - Category filtering to exclude invoice and administrative transactions
    - **Data Processing:**
      - Fetches from `Sweden_transactions_agregated_2025` table
      - Applies dual filtering: user ID and bank ("Handelsbanken")
      - Filters out categories: "Amex Invoice", "SEB SJ Prio Invoice", "Investment", "Sek to Reais", "SJ PRIO MASTER Invoice", "Income - Salary", "Income - Skat"
      - Uses TypeScript Transaction interface with fields: id, Category, Amount, Bank, Description, Date
      - Real-time state management with React hooks
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Main container div with centered flex layout and full screen height
      - Conditional rendering:
        - **Unauthenticated State**: Center-aligned message "Please log in to view the chart."
        - **Authenticated State**:
          - Container div with vertical padding (pt-8 pb-8)
          - `CustomBarChart` component with configuration:
            - **Data**: Filtered Handelsbanken transaction data (excludes invoice/administrative categories)
            - **Styling**: Custom bar color using CSS variable `hsl(var(--chart-1))`
            - **Title**: "Total Amount per Category"
            - **Description**: "Showing totals for Handelsbanken transactions"
            - **Layout**: Responsive chart with automatic sizing

### `app/handelsbanken/overview`

- **Parent Directory:** `handelsbanken`
- **Path:** `app/handelsbanken/overview`
- **Summary:** Overview features for Handelsbanken accounts.
- **Subdirectories:**
  - `chart/` - Chart visualizations for overview data

### `app/handelsbanken/overview/chart`

- **Parent Directory:** `overview`
- **Path:** `app/handelsbanken/overview/chart`
- **Summary:** Chart components for visualizing Handelsbanken overview data with multiple chart types.
- **Files:**
  - `page.tsx` - Handelsbanken overview chart component
    - **Functions:**
      - `CategoryChartPage()` - Main component function for Handelsbanken overview chart visualization
      - `fetchTransactions()` - Async function to fetch Handelsbanken transaction data from Supabase
    - **Features:**
      - Protected route for specific authorized user only
      - Real-time transaction data fetching from Sweden aggregated table
      - Bank-specific filtering (Handelsbanken only)
      - Dual chart visualization with line and bar charts
      - Responsive chart display with centered layout and vertical stacking
      - Authentication-based access control
      - Automatic data refresh on user authentication
      - Full transaction data visualization (no category filtering)
    - **Data Processing:**
      - Fetches from `Sweden_transactions_agregated_2025` table
      - Applies dual filtering: user ID and bank ("Handelsbanken")
      - No category filtering applied (shows all transaction data)
      - Uses TypeScript Transaction interface with fields: id, Category, Amount, Bank, Description, Date
      - Real-time state management with React hooks
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Main container div with centered flex layout, full screen height, and vertical spacing (space-y-50)
      - Conditional rendering:
        - **Unauthenticated State**: Center-aligned message "Please log in to view the chart."
        - **Authenticated State**:
          - **First Chart Section**:
            - Container div with top padding (pt-20) and full width with max-width constraint (max-w-7xl)
            - `TransactionLineChart` component with configuration:
              - **Data**: All Handelsbanken transaction data (unfiltered)
              - **Title**: "Handelsbanken Cumulative Flow"
              - **Description**: Empty string (no description)
              - **Styling**: Border-none, transparent background, no shadow (className: "border-none bg-transparent shadow-none")
              - **Layout**: Responsive line chart showing cumulative transaction flow over time
          - **Second Chart Section**:
            - Container div with bottom padding (pb-8) and full width with max-width constraint (max-w-5xl)
            - `CustomBarChart` component with configuration:
              - **Data**: All Handelsbanken transaction data (unfiltered)
              - **Styling**: Custom bar color using CSS variable `hsl(var(--chart-1))`
              - **Title**: "Total Amount per Category"
              - **Description**: "Showing totals for Handelsbanken transactions"
              - **Layout**: Responsive bar chart displaying category-based aggregation

### `app/inter`

- **Parent Directory:** `app`
- **Path:** `app/inter`
- **Summary:** This directory is likely for features related to Inter bank accounts.
- **Files:**
  - `page.tsx` - Inter bank main page component
    - **Functions:**
      - `Home()` - Main component function for Inter bank transactions page
      - `fetchTransactions()` - Async function to fetch Inter bank transaction data from Supabase
    - **Features:**
      - Protected route for specific authorized user only
      - Real-time transaction data fetching from Inter-specific table
      - Bank-specific filtering (Inter Black only)
      - Comprehensive transaction filtering and sorting capabilities
      - External link to Inter bank statement download
      - Navigation to chart visualization page
      - Authentication-based access control
      - Responsive design with container layout
      - Uses custom table name configuration
    - **Data Processing:**
      - Fetches from `IN_ALL` table (Inter-specific table)
      - Filters transactions by user ID for authenticated user
      - Uses TypeScript Transaction interface with comprehensive field mapping
      - Real-time state management with React hooks
      - Bank-specific filtering applied to TransactionTable component
      - Custom TransactionTableName parameter passed to table component
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Main container div with responsive padding (mx-auto p-4)
      - Conditional rendering:
        - **Unauthenticated State**: Center-aligned message "Please log in to view your transactions."
        - **Authenticated State**:
          - Page title: "Inter Transactions" (h1, centered, bold, mb-6)
          - **Action Buttons Section** (Right-aligned with gap-3 spacing):
            - "Download Invoice" button - Opens Inter bank statement page in new tab (https://contadigital.inter.co/extrato)
              - **Styling**: Black background, white text, green hover effect (hover:bg-green-300)
            - "Go to Chart Page" button - Navigates to chart visualization (./chart)
              - **Styling**: Black background, white text, green hover and border effects
          - `TransactionTable` component with full configuration:
            - **Data**: All fetched transactions from IN_ALL table
            - **TransactionTableName**: "IN_ALL" (custom table identifier)
            - **Bank Filter**: "Inter Black" (pre-filtered)
            - **Initial Sort**: Date column, descending order
            - **Column Visibility**: All columns visible (hiddenColumns: [])
            - **Filters Enabled**: Month, category, and description filters
            - **Features**: Total amount display enabled
            - **Responsive**: Full-width table layout

### `app/inter/chart`

- **Parent Directory:** `inter`
- **Path:** `app/inter/chart`
- **Summary:** Chart components for visualizing Inter bank transaction data.
- **Files:**
  - `page.tsx` - Inter bank chart visualization component
    - **Functions:**
      - `CategoryChartPage()` - Main component function for Inter bank category chart visualization
      - `fetchTransactions()` - Async function to fetch Inter bank transaction data from Supabase
      - `transactions.filter()` - Filters out specific invoice and administrative categories from chart data
    - **Features:**
      - Protected route for specific authorized user only
      - Real-time transaction data fetching from Inter-specific table
      - Bank-specific filtering (Inter Black only)
      - Category-based chart visualization with filtered data
      - Responsive chart display with centered layout
      - Authentication-based access control
      - Automatic data refresh on user authentication
      - Category filtering to exclude invoice and administrative transactions
      - Uses custom table name configuration
    - **Data Processing:**
      - Fetches from `IN_ALL` table (Inter-specific table)
      - Applies dual filtering: user ID and bank ("Inter Black")
      - Filters out categories: "Amex Invoice", "SEB SJ Prio Invoice", "Investment", "Sek to Reais", "SJ PRIO MASTER Invoice", "Income - Salary", "Income - Skat"
      - Uses TypeScript Transaction interface with fields: id, Category, Amount, Bank, Description, Date
      - Real-time state management with React hooks
      - Custom TransactionTableName constant set to "IN_ALL"
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Main container div with centered flex layout and full screen height
      - Conditional rendering:
        - **Unauthenticated State**: Center-aligned message "Please log in to view the chart."
        - **Authenticated State**:
          - Container div with vertical padding (pt-8 pb-8)
          - `CustomBarChart` component with configuration:
            - **Data**: Filtered Inter bank transaction data (excludes invoice/administrative categories)
            - **Styling**: Custom bar color using CSS variable `hsl(var(--chart-1))`
            - **Title**: "Total Amount per Category"
            - **Description**: "Showing totals for Inter transactions"
            - **Layout**: Responsive chart with automatic sizing

### `app/inter-account`

- **Parent Directory:** `app`
- **Path:** `app/inter-account`
- **Summary:** This directory likely contains features for managing Inter bank accounts.
- **Files:**
  - `page.tsx` - Inter account main page component
    - **Functions:**
      - `Home()` - Main component function for Inter account transactions page
      - `fetchTransactions()` - Async function to fetch Inter account transaction data from Supabase
      - `calculateBankInfo()` - Processes transaction data to extract bank statistics and metadata
    - **Features:**
      - Protected route for specific authorized user only
      - Real-time transaction data fetching from Brasil aggregated table
      - Bank information dashboard with comprehensive statistics
      - Data source transparency with table information display
      - Bank-specific filtering (Inter-BR only)
      - Comprehensive transaction filtering and sorting capabilities
      - Multiple update buttons for data aggregation
      - Navigation to category and overview chart visualizations
      - Info page integration for component guidance
      - Authentication-based access control
      - Responsive design with container layout
    - **Data Processing:**
      - Fetches from `Brasil_transactions_agregated_2025` table
      - Filters transactions by user ID for authenticated user
      - Calculates unique banks from transaction data
      - Determines newest transaction date per bank
      - Counts transactions per bank
      - Uses TypeScript Transaction interface with comprehensive field mapping
      - Real-time state management with React hooks for transactions and bank info
      - Bank-specific filtering applied to TransactionTable component
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Main container div with responsive padding (mx-auto p-4)
      - Conditional rendering:
        - **Unauthenticated State**: Center-aligned message "Please log in to view your transactions."
        - **Authenticated State**:
          - Page title: "Inter Account Transactions" (h1, centered, bold, mb-6)
          - **Info Button Section** (Centered):
            - "Page Info & Component Guide" button with Info icon - Navigates to ./info
            - **Styling**: Gray background, white text, gray hover effects, Info icon from Lucide
          - **Data Sources Information Panel Card** (Gray background container):
            - Section title: "Data Sources" (h2, semibold)
            - Description of Supabase table usage
            - **Table Information**:
              - Brasil_transactions_agregated_2025 table description
            - **Statistics Grid** (1 column mobile, 3 columns desktop):
              - **Column 1**: Total transactions and unique banks summary
              - **Column 2**: Transaction count per bank breakdown
              - **Column 3**: Newest transaction date per bank
          - **Action Buttons Section** (Flexbox with space-between layout):
            - **Left Side**: Two update buttons with space-x-3 gap:
              - `UpdateAggregatedButton` component for general data updates
              - `UpdateInterAggregatedButton` component for Inter-specific updates
            - **Right Side**: Two navigation buttons with space-x-4 gap:
              - "Category Chart" button - Navigates to `./category/chart`
              - "Overview Chart" button - Navigates to `./overview/chart`
            - **Button Styling**: Black background, white text, green hover and border effects
          - `TransactionTable` component with full configuration:
            - **Data**: All fetched transactions from Brasil aggregated table
            - **Bank Filter**: "Inter-BR" (pre-filtered)
            - **Initial Sort**: Date column, descending order
            - **Column Visibility**: All columns visible (hiddenColumns: [])
            - **Filters Enabled**: Month, category, and description filters
            - **Features**: Total amount display enabled
            - **TransactionTableName**: "Brasil_transactions_agregated_2025" (custom table identifier)
            - **Responsive**: Full-width table layout
- **Subdirectories:**
  - `category/` - Transaction categories for Inter accounts
  - `info/` - Account information
  - `overview/` - Overview features for Inter accounts

### `app/inter-account/category`

- **Parent Directory:** `inter-account`
- **Path:** `app/inter-account/category`
- **Summary:** Manages transaction categories for Inter bank accounts.
- **Subdirectories:**
  - `chart/` - Chart visualizations for categories

### `app/inter-account/category/chart`

- **Parent Directory:** `category`
- **Path:** `app/inter-account/category/chart`
- **Summary:** Chart components for visualizing Inter bank account transaction categories.
- **Files:**
  - `page.tsx` - Inter account category chart component
    - **Functions:**
      - `CategoryChartPage()` - Main component function for Inter account category chart visualization
      - `fetchTransactions()` - Async function to fetch transaction data from Supabase
      - `transactions.filter()` - Filters out specific invoice and administrative categories from chart data
    - **Features:**
      - Protected route for specific authorized user only
      - Real-time transaction data fetching from Sweden aggregated table
      - Bank-specific filtering (configured for Handelsbanken - appears to be misconfigured)
      - Category-based chart visualization with filtered data
      - Responsive chart display with centered layout
      - Authentication-based access control
      - Automatic data refresh on user authentication
      - Category filtering to exclude invoice and administrative transactions
    - **Data Processing:**
      - Fetches from `Sweden_transactions_agregated_2025` table (Note: This appears inconsistent with Inter-account context)
      - Applies dual filtering: user ID and bank ("Handelsbanken" - likely should be "Inter-BR")
      - Filters out categories: "Amex Invoice", "SEB SJ Prio Invoice", "Investment", "Sek to Reais", "SJ PRIO MASTER Invoice", "Income - Salary", "Income - Skat"
      - Uses TypeScript Transaction interface with fields: id, Category, Amount, Bank, Description, Date
      - Real-time state management with React hooks
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Main container div with centered flex layout and full screen height
      - Conditional rendering:
        - **Unauthenticated State**: Center-aligned message "Please log in to view the chart."
        - **Authenticated State**:
          - Container div with vertical padding (pt-8 pb-8)
          - `CustomBarChart` component with configuration:
            - **Data**: Filtered transaction data (excludes invoice/administrative categories)
            - **Styling**: Custom bar color using CSS variable `hsl(var(--chart-1))`
            - **Title**: "Total Amount per Category"
            - **Description**: "Showing totals for Handelsbanken transactions" (Note: Inconsistent with Inter-account context)
            - **Layout**: Responsive chart with automatic sizing
    - **⚠️ Configuration Issues:**
      - Bank filter is set to "Handelsbanken" instead of expected "Inter-BR"
      - Table source is "Sweden_transactions_agregated_2025" instead of expected "Brasil_transactions_agregated_2025"
      - Chart description mentions "Handelsbanken transactions" instead of "Inter account transactions"
      - This appears to be copied from Handelsbanken chart without proper Inter-account customization

### `app/inter-account/info`

- **Parent Directory:** `inter-account`
- **Path:** `app/inter-account/info`
- **Summary:** Comprehensive UI guide and documentation page for Inter account functionality, providing detailed information about data flow, aggregation architecture, and UI components.
- **Files:**
  - `page.tsx` - Inter account information and UI guide page component

#### Functions, Features, and UI Components in `app/inter-account/info/page.tsx`:

**Main Component:**

- `InterAccountInfo()` - Main component for the Inter account information and UI guide page

**Core Features:**

- **Comprehensive Documentation** - Detailed UI guide for Inter account functionality
- **Data Flow Visualization** - Interactive diagram showing complete data journey from bank to app
- **Aggregation Architecture Explanation** - Detailed breakdown of how source tables work with aggregated table
- **Process Documentation** - Step-by-step guide for the complete workflow
- **Technical Implementation Details** - Behind-the-scenes information about page functionality

**UI Component Hierarchy:**

```
ProtectedRoute (User ID restriction)
└── Container (mx-auto p-4)
    ├── Header Section
    │   ├── Page Title
    │   └── Back Button (→ Inter Account)
    ├── Page Overview Card
    │   ├── Info Icon + Title
    │   ├── Description (Inter Brasil transaction management)
    │   └── Key Architecture Breakdown
    ├── Data Source Information Panel Card
    │   ├── Table Icon + Title
    │   ├── Purpose Explanation (Aggregated table structure)
    │   ├── Components List (Table name, counts, statistics)
    │   └── Layout Information
    ├── Update Buttons with Hover Cards
    │   ├── Update Aggregated Data Button
    │   │   └── Hover Card (Detailed workflow explanation)
    │   ├── Update Inter Data Button
    │   │   └── Hover Card (Aggregation process details)
    │   └── Color-coded Features Guide
    ├── Data Aggregation Architecture Card
    │   ├── Table Structure (Source vs Aggregated)
    │   ├── How Aggregation Works (6-step process)
    │   └── Benefits of Aggregation
    ├── Interactive Data Flow Card
    │   ├── DataFlowDiagram Component (Interactive)
    │   ├── Interactive Features Guide
    │   ├── Flow Line Guide (Color-coded connections)
    │   ├── Pro Tip Section
    │   └── Detailed Process Steps (5 main steps)
    │       ├── Step 1: Manual Download from Inter Bank
    │       │   ├── Inter Bank Website Link
    │       │   ├── Statement vs Credit Card Distinction
    │       │   ├── Date Range Strategy (Yearly downloads)
    │       │   ├── File Storage Location (Google Drive)
    │       │   ├── File Naming Convention
    │       │   └── Multiple Format Downloads (CSV, PDF, OFX)
    │       ├── Step 2: Upload to Application
    │       │   ├── Upload Page Link
    │       │   ├── Bank Selection Process
    │       │   ├── File Processing Details
    │       │   └── Table Creation Process
    │       ├── Step 3: Supabase Source Table Management
    │       │   ├── Table Naming Convention (IN_YYYY vs IN_YYYYMM)
    │       │   ├── Data Structure Maintenance
    │       │   └── Bank Filter Tagging
    │       ├── Step 4: Data Aggregation Process
    │       │   ├── Inter Account Page Link
    │       │   ├── Update Inter Data Button Process
    │       │   └── Source Tracking System
    │       └── Step 5: Data Analysis & Visualization
    │           ├── Auto-filter System
    │           ├── Filter Options (Month, Category, Description)
    │           ├── Analysis Tools
    │           └── Chart Navigation
    ├── Chart Navigation Buttons Card
    │   ├── BarChart Icon + Title
    │   ├── Category Chart Button (→ ./category/chart)
    │   ├── Overview Chart Button (→ ./overview/chart)
    │   └── Layout Information
    ├── Transaction Table Component Card
    │   ├── Filter Icon + Title
    │   ├── Core Features (Data source, bank filter, sorting)
    │   ├── Filter Options (Month, category, description)
    │   ├── Available Columns
    │   └── User Interactions
    └── Technical Implementation Details Card
        ├── State Management
        ├── Data Processing
        ├── Security Features
        └── Dependencies

**Key Interactive Elements:**
- Interactive DataFlowDiagram with drag & drop, zoom, and direct navigation
- Hover cards with detailed workflow explanations
- Color-coded process steps and flow lines
- Direct links to relevant pages throughout the documentation
- Comprehensive step-by-step guides for the complete data workflow

**Special Features:**
- **Aggregation Focus** - Explains how Brasil_transactions_agregated_2025 table consolidates data from multiple source tables
- **File Format Documentation** - Details about CSV, PDF, and OFX file handling
- **Google Drive Integration** - Documented file storage organization
- **Table Naming Strategy** - Clear distinction between bank statements (IN_YYYY) and credit card invoices (IN_YYYYMM)
- **Interactive Visualization** - Real data flow diagram with navigation capabilities
```

### `app/inter-account/overview`

- **Parent Directory:** `inter-account`
- **Path:** `app/inter-account/overview`
- **Summary:** Overview features for Inter bank accounts.
- **Subdirectories:**
  - `chart/` - Chart visualizations for overview data

### `app/inter-account/overview/chart`

- **Parent Directory:** `overview`
- **Path:** `app/inter-account/overview/chart`
- **Summary:** Chart components for visualizing Inter account overview data with multiple chart types.
- **Files:**
  - `page.tsx` - Inter account overview chart component
    - **Functions:**
      - `CategoryChartPage()` - Main component function for Inter account overview chart visualization
      - `fetchTransactions()` - Async function to fetch transaction data from Supabase
    - **Features:**
      - Protected route for specific authorized user only
      - Real-time transaction data fetching from Sweden aggregated table
      - Bank-specific filtering (configured for Handelsbanken - appears to be misconfigured)
      - Dual chart visualization with line and bar charts
      - Responsive chart display with centered layout and vertical spacing
      - Authentication-based access control
      - Automatic data refresh on user authentication
      - Full transaction data visualization (no category filtering)
    - **Data Processing:**
      - Fetches from `Sweden_transactions_agregated_2025` table (Note: This appears inconsistent with Inter-account context)
      - Applies dual filtering: user ID and bank ("Handelsbanken" - likely should be "Inter-BR")
      - No category filtering applied (shows all transaction data)
      - Uses TypeScript Transaction interface with fields: id, Category, Amount, Bank, Description, Date
      - Real-time state management with React hooks
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Main container div with centered flex layout, full screen height, and vertical spacing (space-y-8)
      - Conditional rendering:
        - **Unauthenticated State**: Center-aligned message "Please log in to view the chart."
        - **Authenticated State**:
          - **First Chart Section**:
            - Container div with top padding (pt-8) and full width with max-width constraint (max-w-5xl)
            - `TransactionLineChart` component with configuration:
              - **Data**: All transaction data (unfiltered)
              - **Title**: "Handelsbanken Cumulative Flow"
              - **Description**: "Showing cumulative income and expenses over time"
              - **Layout**: Responsive line chart showing cumulative transaction flow over time
          - **Second Chart Section**:
            - Container div with bottom padding (pb-8) and full width with max-width constraint (max-w-5xl)
            - `CustomBarChart` component with configuration:
              - **Data**: All transaction data (unfiltered)
              - **Styling**: Custom bar color using CSS variable `hsl(var(--chart-1))`
              - **Title**: "Total Amount per Category"
              - **Description**: "Showing totals for Handelsbanken transactions"
              - **Layout**: Responsive bar chart displaying category-based aggregation
    - **⚠️ Configuration Issues:**
      - Bank filter is set to "Handelsbanken" instead of expected "Inter-BR"
      - Table source is "Sweden_transactions_agregated_2025" instead of expected "Brasil_transactions_agregated_2025"
      - Chart titles and descriptions mention "Handelsbanken" instead of "Inter account"
      - This appears to be copied from Handelsbanken overview chart without proper Inter-account customization

### `app/profile`

- **Parent Directory:** `app`
- **Path:** `app/profile`
- **Summary:** This directory contains the user profile page, where users can view and edit their information.
- **Files:**
  - `page.tsx` - User profile page component

### `app/recurrent`

- **Parent Directory:** `app`
- **Path:** `app/recurrent`
- **Summary:** This directory is likely for managing recurrent transactions, such as subscriptions or recurring bills.
- **Files:**
  - `page.tsx` - Recurrent transactions page component

### `app/sjprio`

- **Parent Directory:** `app`
- **Path:** `app/sjprio`
- **Summary:** This directory is dedicated to features for SEB SJ Prio accounts (credit card and travel rewards).
- **Files:**
  - `page.tsx` - SEB SJ Prio main page component
    - **Functions:**
      - `Home()` - Main component function for SEB SJ Prio transactions page
      - `fetchTransactions()` - Async function to fetch SEB SJ Prio transaction data from Supabase
    - **Features:**
      - Protected route for specific authorized user only
      - Real-time transaction data fetching from Sweden aggregated table
      - Bank-specific filtering (SEB SJ Prio only)
      - Comprehensive transaction filtering and sorting capabilities
      - External link to SEB SJ Prio invoice download
      - Navigation to chart visualization page
      - Data update functionality through UpdateSjAggregatedButton
      - Authentication-based access control
      - Responsive design with container layout
    - **Data Processing:**
      - Fetches from `Sweden_transactions_agregated_2025` table
      - Filters transactions by user ID for authenticated user
      - Uses TypeScript Transaction interface with comprehensive field mapping
      - Real-time state management with React hooks
      - Bank-specific filtering applied to TransactionTable component
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Main container div with responsive padding (mx-auto p-4)
      - Conditional rendering:
        - **Unauthenticated State**: Center-aligned message "Please log in to view your transactions."
        - **Authenticated State**:
          - Page title: "SEB SJ Prio Transactions" (h1, centered, bold, mb-6)
          - **Action Buttons Section** (Right-aligned with gap-3 spacing):
            - `UpdateSjAggregatedButton` component for data updates
            - "Download Invoice" button - Opens SEB SJ Prio login page in new tab (https://secure.sebkort.com/nis/m/sjse/external/t/login/index)
              - **Styling**: Black background, white text, green hover effect (hover:bg-green-300)
            - "Go to Chart Page" button - Navigates to chart visualization (./chart)
              - **Styling**: Black background, white text, green hover and border effects
          - `TransactionTable` component with full configuration:
            - **Data**: All fetched transactions from Sweden aggregated table
            - **Bank Filter**: "SEB SJ Prio" (pre-filtered)
            - **Initial Sort**: Date column, descending order
            - **Column Visibility**: All columns visible (hiddenColumns: [])
            - **Filters Enabled**: Month, category, and description filters
            - **Features**: Total amount display enabled
            - **Responsive**: Full-width table layout
- **Subdirectories:**
  - `chart/` - Chart visualizations for SJPrio

### `app/sjprio/chart`

- **Parent Directory:** `sjprio`
- **Path:** `app/sjprio/chart`
- **Summary:** Chart components for visualizing SEB SJ Prio transaction data.
- **Files:**
  - `page.tsx` - SEB SJ Prio chart visualization component
    - **Functions:**
      - `CategoryChartPage()` - Main component function for SEB SJ Prio category chart visualization
      - `fetchTransactions()` - Async function to fetch SEB SJ Prio transaction data from Supabase
      - `transactions.filter()` - Filters out specific invoice and administrative categories from chart data
    - **Features:**
      - Protected route for specific authorized user only
      - Real-time transaction data fetching from Sweden aggregated table
      - Bank-specific filtering (SEB SJ Prio only)
      - Category-based chart visualization with filtered data
      - Responsive chart display with centered layout
      - Authentication-based access control
      - Automatic data refresh on user authentication
      - Category filtering to exclude invoice and administrative transactions
    - **Data Processing:**
      - Fetches from `Sweden_transactions_agregated_2025` table
      - Applies dual filtering: user ID and bank ("SEB SJ Prio")
      - Filters out categories: "Amex Invoice", "SEB SJ Prio Invoice", "Investment", "Sek to Reais", "SJ PRIO MASTER Invoice", "Income - Salary", "Income - Skat"
      - Uses TypeScript Transaction interface with fields: id, Category, Amount, Bank, Description, Date
      - Real-time state management with React hooks
    - **UI Components (Top to Bottom):**
      - `ProtectedRoute` wrapper with specific allowed user ID: "2b5c5467-04e0-4820-bea9-1645821fa1b7"
      - Main container div with centered flex layout and full screen height
      - Conditional rendering:
        - **Unauthenticated State**: Center-aligned message "Please log in to view the chart."
        - **Authenticated State**:
          - Container div with vertical padding (pt-8 pb-8)
          - `CustomBarChart` component with configuration:
            - **Data**: Filtered SEB SJ Prio transaction data (excludes invoice/administrative categories)
            - **Styling**: Custom bar color using CSS variable `hsl(var(--chart-1))`
            - **Title**: "Total Amount per Category"
            - **Description**: "Showing totals for SEB SJ Prio transactions"
            - **Layout**: Responsive chart with automatic sizing

### `app/types`

- **Parent Directory:** `app`
- **Path:** `app/types`
- **Summary:** Contains TypeScript type definitions used within the `app` directory.
- **Files:**
  - `bill.ts` - Bill-related type definitions
  - `window.d.ts` - Window object type extensions

### `app/unauthorized`

- **Parent Directory:** `app`
- **Path:** `app/unauthorized`
- **Summary:** This directory likely contains a page that is shown to users who are not authorized to access a certain resource.
- **Files:**
  - `page.tsx` - Unauthorized access page component

### `app/upload`

- **Parent Directory:** `app`
- **Path:** `app/upload`
- **Summary:** This directory contains the UI and logic for uploading files, such as bank statements.
- **Files:**
  - `page.tsx` - File upload page component

### `app/welcome`

- **Parent Directory:** `app`
- **Path:** `app/welcome`
- **Summary:** This directory likely contains a welcome page for new users.
- **Files:**
  - `page.tsx` - Welcome page component

---

## Directory Summary Table

| Directory         | Parent Directory | Path                               |
| :---------------- | :--------------- | :--------------------------------- |
| `about`           | `app`            | `app/about`                        |
| `actions`         | `app`            | `app/actions`                      |
| `amex`            | `app`            | `app/amex`                         |
| `chart`           | `amex`           | `app/amex/chart`                   |
| `auth`            | `app`            | `app/auth`                         |
| `callback`        | `auth`           | `app/auth/callback`                |
| `forgot-password` | `auth`           | `app/auth/forgot-password`         |
| `login`           | `auth`           | `app/auth/login`                   |
| `reset-password`  | `auth`           | `app/auth/reset-password`          |
| `signup`          | `auth`           | `app/auth/signup`                  |
| `components`      | `app`            | `app/components`                   |
| `email-client`    | `app`            | `app/email-client`                 |
| `email-merge`     | `app`            | `app/email-merge`                  |
| `family`          | `app`            | `app/family`                       |
| `global`          | `app`            | `app/global`                       |
| `chart`           | `global`         | `app/global/chart`                 |
| `handelsbanken`   | `app`            | `app/handelsbanken`                |
| `category`        | `handelsbanken`  | `app/handelsbanken/category`       |
| `chart`           | `category`       | `app/handelsbanken/category/chart` |
| `overview`        | `handelsbanken`  | `app/handelsbanken/overview`       |
| `chart`           | `overview`       | `app/handelsbanken/overview/chart` |
| `inter`           | `app`            | `app/inter`                        |
| `chart`           | `inter`          | `app/inter/chart`                  |
| `inter-account`   | `app`            | `app/inter-account`                |
| `category`        | `inter-account`  | `app/inter-account/category`       |
| `chart`           | `category`       | `app/inter-account/category/chart` |
| `info`            | `inter-account`  | `app/inter-account/info`           |
| `overview`        | `inter-account`  | `app/inter-account/overview`       |
| `chart`           | `overview`       | `app/inter-account/overview/chart` |
| `profile`         | `app`            | `app/profile`                      |
| `recurrent`       | `app`            | `app/recurrent`                    |
| `sjprio`          | `app`            | `app/sjprio`                       |
| `chart`           | `sjprio`         | `app/sjprio/chart`                 |
| `types`           | `app`            | `app/types`                        |
| `unauthorized`    | `app`            | `app/unauthorized`                 |
| `upload`          | `app`            | `app/upload`                       |
| `welcome`         | `app`            | `app/welcome`                      |

---

## Function Mapping Table

This table shows where functions are **defined** (O) and where they are **called** (X) across all documented files.

| File Path                                   | `uploadExcel()` | `createTableInSupabase()` | `executeTableCreation()` | `uploadToSupabase()` | `clearTableData()` | `getUpdatePreview()` | `executeUpdate()` | `getAmexUpdatePreview()` | `previewAmexMonthTransactions()` | `executeAmexUpdate()` | `getSjUpdatePreview()` | `previewSjMonthTransactions()` | `executeSjUpdate()` | `getInterUpdatePreview()` | `previewInterTableTransactions()` | `executeInterUpdate()` | `fetchTransactions()` | `adjustTransactionAmounts()` | `handleSort()` | `sortTransactions()` | `processedData.map()` | `transactions.filter()` | `CategoryChartPage()` | `Home()` | `calculateBankInfo()` | `InterAccountInfo()` |
| :------------------------------------------ | :-------------: | :-----------------------: | :----------------------: | :------------------: | :----------------: | :------------------: | :---------------: | :----------------------: | :------------------------------: | :-------------------: | :--------------------: | :----------------------------: | :-----------------: | :-----------------------: | :-------------------------------: | :--------------------: | :-------------------: | :--------------------------: | :------------: | :------------------: | :-------------------: | :---------------------: | :-------------------: | :------: | :-------------------: | :------------------: |
| `app/actions/fileActions.ts`                |        O        |             O             |            O             |          X           |         O          |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |                       |                              |                |                      |                       |                         |                       |          |                       |                      |
| `app/actions/updateActions.ts`              |                 |                           |                          |                      |                    |          O           |         O         |            O             |                O                 |           O           |           O            |               O                |          O          |             O             |                 O                 |           O            |                       |                              |                |                      |                       |                         |                       |          |                       |                      |
| `app/amex/page.tsx`                         |                 |                           |                          |                      |                    |                      |                   |            X             |                                  |           X           |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |                       |                         |                       |          |                       |                      |
| `app/amex/chart/page.tsx`                   |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |                       |            O            |                       |          |                       |
| `app/family/page.tsx`                       |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |              O               |       O        |          X           |                       |                         |                       |          |                       |                      |
| `app/global/page.tsx`                       |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |           O           |                         |                       |          |                       |                      |
| `app/global/chart/page.tsx`                 |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |                       |            O            |           O           |          |                       |                      |
| `app/handelsbanken/page.tsx`                |                 |                           |                          |                      |                    |          X           |         X         |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |                       |                         |                       |    O     |                       |                      |
| `app/handelsbanken/category/chart/page.tsx` |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |                       |            O            |           O           |          |                       |                      |
| `app/handelsbanken/overview/chart/page.tsx` |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |                       |                         |           O           |          |                       |                      |
| `app/inter/page.tsx`                        |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |                       |                         |                       |    O     |                       |                      |
| `app/inter/chart/page.tsx`                  |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |                       |            O            |           O           |          |                       |                      |
| `app/inter-account/page.tsx`                |                 |                           |                          |                      |                    |          X           |         X         |                          |                                  |                       |                        |                                |                     |             X             |                 X                 |           X            |           O           |                              |                |                      |                       |                         |                       |    O     |           O           |                      |
| `app/inter-account/category/chart/page.tsx` |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |                       |            O            |           O           |          |                       |                      |
| `app/inter-account/info/page.tsx`           |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |                       |                              |                |                      |                       |                         |                       |          |                       |          O           |
| `app/inter-account/overview/chart/page.tsx` |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |                       |                         |           O           |          |                       |                      |
| `app/sjprio/page.tsx`                       |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |           X            |               X                |          X          |                           |                                   |                        |           O           |                              |                |                      |                       |                         |                       |    O     |                       |                      |
| `app/sjprio/chart/page.tsx`                 |                 |                           |                          |                      |                    |                      |                   |                          |                                  |                       |                        |                                |                     |                           |                                   |                        |           O           |                              |                |                      |                       |            O            |           O           |          |                       |                      |

### Legend:

- **O** = Function is **defined** in this file
- **X** = Function is **called** in this file (if different from definition)
- **Empty** = Function is not used in this file

### Notes:

1. Most `fetchTransactions()` functions are defined locally within each component file
2. Action files (`fileActions.ts` and `updateActions.ts`) contain the main business logic functions
3. Chart pages primarily use `CategoryChartPage()` as their main component function
4. Main pages typically use `Home()` as their main component function
5. Some functions like `transactions.filter()` and `processedData.map()` are inline operations rather than named functions
6. The `InterAccountInfo()` function is unique to the info page which serves as a documentation component
