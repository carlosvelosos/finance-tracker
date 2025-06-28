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
- [`app/inter`](#appinter)
- [`app/inter-account`](#appinter-account)
- [`app/inter-account/category`](#appinter-accountcategory)
- [`app/inter-account/category/chart`](#appinter-accountcategorychart)
- [`app/inter-account/info`](#appinter-accountinfo)
- [`app/profile`](#appprofile)
- [`app/recurrent`](#apprecurrent)
- [`app/sjprio`](#appsjprio)
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

### `app/global`

- **Parent Directory:** `app`
- **Path:** `app/global`
- **Summary:** This could be for global settings or data that applies across the entire application.
- **Files:**
  - `page.tsx` - Global page component

### `app/global/chart`

- **Parent Directory:** `global`
- **Path:** `app/global/chart`
- **Summary:** Contains chart components that are used globally across the application.
- **Files:**
  - `page.tsx` - Global chart page component

### `app/handelsbanken`

- **Parent Directory:** `app`
- **Path:** `app/handelsbanken`
- **Summary:** This directory is dedicated to features for Handelsbanken accounts.
- **Files:**
  - `page.tsx` - Handelsbanken main page component
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

### `app/inter`

- **Parent Directory:** `app`
- **Path:** `app/inter`
- **Summary:** This directory is likely for features related to Inter bank accounts.
- **Files:**
  - `page.tsx` - Inter bank main page component

### `app/inter-account`

- **Parent Directory:** `app`
- **Path:** `app/inter-account`
- **Summary:** This directory likely contains features for managing Inter bank accounts.
- **Files:**
  - `page.tsx` - Inter account main page component
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

### `app/inter-account/info`

- **Parent Directory:** `inter-account`
- **Path:** `app/inter-account/info`
- **Summary:** Displays information about Inter bank accounts.
- **Files:**
  - `page.tsx` - Inter account information page component

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
- **Summary:** This directory is dedicated to features for SJPrio accounts.
- **Files:**
  - `page.tsx` - SJPrio main page component
- **Subdirectories:**
  - `chart/` - Chart visualizations for SJPrio

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
| `inter`           | `app`            | `app/inter`                        |
| `inter-account`   | `app`            | `app/inter-account`                |
| `category`        | `inter-account`  | `app/inter-account/category`       |
| `chart`           | `category`       | `app/inter-account/category/chart` |
| `info`            | `inter-account`  | `app/inter-account/info`           |
| `profile`         | `app`            | `app/profile`                      |
| `recurrent`       | `app`            | `app/recurrent`                    |
| `sjprio`          | `app`            | `app/sjprio`                       |
| `types`           | `app`            | `app/types`                        |
| `unauthorized`    | `app`            | `app/unauthorized`                 |
| `upload`          | `app`            | `app/upload`                       |
| `welcome`         | `app`            | `app/welcome`                      |
