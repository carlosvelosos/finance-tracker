# From Bank Statement to Supabase: Complete Guide

This guide explains the end-to-end process of capturing a bank statement (from images like screenshots) and uploading it to your Supabase database for use in the Finance Tracker application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Capturing Bank Statements as Images](#step-1-capturing-bank-statements-as-images)
4. [Step 2: Converting Images to Structured Data](#step-2-converting-images-to-structured-data)
5. [Step 3: Uploading Data to Supabase](#step-3-uploading-data-to-supabase)
6. [Step 4: Direct SQL Insert Method](#step-4-direct-sql-insert-method)
7. [Step 5: Verifying Your Data](#step-5-verifying-your-data)
8. [Updating the Sweden_transactions_agregated_2025 Table](#updating-the-sweden_transactions_agregated_2025-table)
9. [Troubleshooting](#troubleshooting)
10. [Data Schema Reference](#data-schema-reference)

## Overview

The Finance Tracker application visualizes transaction data from various bank accounts. To get your bank statement data into the system, you'll need to:

1. Capture your bank statement as images (PNG, screenshots, etc.)
2. Convert these images to structured data (Excel/CSV)
3. Upload the data through the application's upload interface
4. Verify that the data appears correctly in the application

## Prerequisites

- Access to your bank's online banking portal
- Ability to take screenshots or download statements
- Microsoft Excel, Google Sheets, or similar spreadsheet software
- Access to the Finance Tracker application with upload permissions

## Step 1: Capturing Bank Statements as Images

### For Handelsbanken Statements

1. Log in to your Handelsbanken online banking portal
2. Navigate to "Accounts" > "Account Details" > "Transaction History"
3. Select the date range you want to capture (e.g., last month)
4. Take screenshots of the transaction list:
   - On Windows: Use `Win+Shift+S` or the Snipping Tool
   - On Mac: Use `Cmd+Shift+4`
   - On Linux: Use the Screenshot tool or `PrtScn` key
5. Save the images in a dedicated folder (e.g., `handelsbanken-statements-2025-04`)

**Tip**: For a cleaner conversion later, try to capture the entire table and ensure column headers are visible.

### Example of Handelsbanken Statement Format

Your screenshot should show a table with columns similar to:

| Bokföringsdatum | Transaktionsdatum | Text/Referens  | Belopp  | Saldo    |
| --------------- | ----------------- | -------------- | ------- | -------- |
| 2025-04-30      | 2025-04-30        | TELIA BREDBAND | -749,00 | 12345,67 |
| 2025-04-30      | 2025-04-30        | SVERIGES INGEN | -265,00 | 11596,67 |
| ...             | ...               | ...            | ...     | ...      |

## Step 2: Converting Images to Structured Data

### Option A: Manual Transcription (Recommended for accuracy)

1. Create a new Excel spreadsheet
2. Set up columns matching the format expected by the Finance Tracker:
   - Date
   - Description
   - Amount
   - Balance
3. Manually transcribe the transactions from your screenshots into the spreadsheet
4. Save the file as `.xlsx` or `.csv` format (e.g., `handelsbanken-april-2025.xlsx`)

### Option B: OCR Software (Faster but requires verification)

1. Use OCR (Optical Character Recognition) software such as:
   - Microsoft OneNote
   - Google Docs (Insert > Image > "Text from image")
   - Adobe Acrobat
   - Free online OCR tools
2. Upload your bank statement screenshots to the OCR tool
3. Extract the text and transfer it to a spreadsheet
4. Format the data according to the expected structure
5. Check carefully for OCR errors
6. Save as `.xlsx` or `.csv`

### Required Excel/CSV Format for Handelsbanken

Your final Excel/CSV file should look similar to this:

| Transaktionsdatum | Text           | Belopp    | Saldo    |
| ----------------- | -------------- | --------- | -------- |
| 2025-04-30        | TELIA BREDBAND | -749,00   | 12345,67 |
| 2025-04-30        | SVERIGES INGEN | -265,00   | 11596,67 |
| 2025-04-29        | American Expre | -14535,15 | 11331,67 |
| ...               | ...            | ...       | ...      |

**Note**: The column names should match exactly what's expected by the processor. For Handelsbanken, use the Swedish column names.

## Step 3: Uploading Data to Supabase

1. Log in to the Finance Tracker application
2. Navigate to the "Upload" page (accessible from the navigation menu)
3. Select "Handelsbanken-SE" from the bank dropdown menu
4. Click "Choose File" and select your prepared Excel/CSV file
5. Click "Upload" and wait for the confirmation message

### Behind the Scenes

When you upload a file:

1. The application processes your Excel/CSV file using the `processHandelsbanken()` function
2. It extracts the year from the period information (e.g., `2025`)
3. It creates a table name in the format `HB_2025`
4. It maps columns from your file to the database schema
5. The data is uploaded to Supabase with a unique ID for each transaction

## Step 4: Direct SQL Insert Method

If you prefer to bypass the application's upload interface, you can directly insert transaction data using the Supabase SQL Editor. This is particularly useful when:

- You only have a few transactions to add
- You're working with transaction data from images or screenshots
- The application's upload mechanism is not available
- You need to perform custom data transformations

### Accessing the SQL Editor

1. Log in to your Supabase dashboard
2. Select your Finance Tracker project
3. Click on "SQL Editor" in the left sidebar
4. Create a new query or use an existing one

### Creating the SQL Insert Statement

When adding transactions directly from images, you'll need to create an SQL INSERT statement based on the data you've extracted.

Here's an example SQL statement for adding transactions from screenshots:

```sql
-- First check the highest ID value
SELECT MAX(id) as last_id FROM "public"."HB_2025";

-- Then use OVERRIDING SYSTEM VALUE with IDs starting from 20
INSERT INTO "public"."HB_2025" (id, "Date", "Description", "Amount", "Balance", "Category", "Responsable", "Comment", "user_id", "Bank")
OVERRIDING SYSTEM VALUE
VALUES
-- March 2025 transactions
(20, '2025-03-24', 'LÖN', 33917.00, NULL, 'Salary', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(21, '2025-03-26', 'American Expre', -16295.41, NULL, 'Amex Invoice', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(22, '2025-03-26', 'MATTIAS LÖVGRE', -100.00, NULL, 'Personal Transactions', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(23, '2025-03-26', 'Telia Faktura', -749.00, NULL, 'Apartment', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(24, '2025-03-27', 'BIXIA AB', -154.00, NULL, 'Apartment', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(25, '2025-03-27', 'Tekniska Verke', -192.00, NULL, 'Apartment', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(26, '2025-03-27', 'Unionens a-kas', -160.00, NULL, 'Union', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(27, '2025-03-31', 'SJ PRIO MASTER', -3622.34, NULL, 'SEB SJ Prio Invoice', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(28, '2025-03-31', 'SVERIGES INGEN', -265.00, NULL, 'Union', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),

-- April 2025 transactions
(29, '2025-04-04', 'Tekniska Verke', -194.00, NULL, 'Apartment', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(30, '2025-04-05', 'RODRIGO SAAR D', -95.00, NULL, 'Personal Transactions', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(31, '2025-04-05', 'AB STORSTOCKHO', -43.00, NULL, 'Unknown', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(32, '2025-04-07', 'Bixia AB', -105.00, NULL, 'Apartment', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(33, '2025-04-08', 'SK9006154091', 9679.00, NULL, 'Income', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(34, '2025-04-13', 'MARQUES DE FRE', -128.00, NULL, 'Personal Transactions', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(35, '2025-04-14', 'first', -100.00, NULL, 'Unknown', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(36, '2025-04-14', 'second', -9900.00, NULL, 'Unknown', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(37, '2025-04-15', 'Unionens a-kas', -160.00, NULL, 'Union', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(38, '2025-04-25', 'NIRA', 32476.00, NULL, 'Salary', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(39, '2025-04-29', 'American Expre', -14535.15, NULL, 'Amex Invoice', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(40, '2025-04-29', 'SEB KORT BANK', -852.70, NULL, 'SEB SJ Prio Invoice', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(41, '2025-04-29', 'Telia Company', -749.00, NULL, 'Apartment', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(42, '2025-04-30', 'TELIA BREDBAND', -749.00, NULL, 'Apartment', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(43, '2025-04-30', 'SVERIGES INGEN', -265.00, NULL, 'Union', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(44, '2025-04-30', 'SJ PRIO MASTER', -852.70, NULL, 'SEB SJ Prio Invoice', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken');
```

## Step 5: Verifying Your Data

After uploading, you should verify that your data appears correctly:

1. Navigate to "Handelsbanken" in the main menu
2. Check that your transactions appear in the table
3. For visual verification, go to "Handelsbanken Overview" to see charts of your data
4. Verify that the amounts and dates match your original bank statement

## Updating the Sweden_transactions_agregated_2025 Table

After adding transactions to individual bank tables (like `HB_2025`), you'll want to update the aggregated table that combines transactions from all banks. Here's how to do this safely:

### Understanding the Aggregated Table

The `Sweden_transactions_agregated_2025` table combines transactions from multiple sources:

- Handelsbanken (`HB_2025`)
- American Express (`AM_202501`, `AM_202502`, etc.)
- SEB SJ Prio (`SJ_202501`, `SJ_202502`, etc.)

This gives you a comprehensive view of all your financial activities across different accounts.

### Step 1: Check Current Maximum ID

First, find the highest ID currently in use in the aggregated table:

```sql
SELECT MAX(id) as last_id FROM "public"."Sweden_transactions_agregated_2025";
```

### Step 2: Insert New Transactions

Use this SQL script to safely insert only new transactions that don't already exist in the aggregated table:

```sql
-- Use a WITH clause to find the highest ID in the aggregated table
WITH max_id AS (
  SELECT COALESCE(MAX(id), 0) + 1 as next_id
  FROM "public"."Sweden_transactions_agregated_2025"
)

-- Insert new transactions from HB_2025 into the aggregated table
INSERT INTO "public"."Sweden_transactions_agregated_2025"
("id", "created_at", "Date", "Description", "Amount", "Balance", "Category", "Responsable", "Bank", "Comment", "user_id", "source_table")
SELECT
  -- Use the next_id value from the CTE plus ROW_NUMBER() to ensure sequential IDs
  (SELECT next_id FROM max_id) + ROW_NUMBER() OVER (ORDER BY h."Date", h."Description") - 1 as id,
  NOW() as created_at,
  h."Date",
  h."Description",
  h."Amount",
  h."Balance",
  h."Category",
  h."Responsable",
  'Handelsbanken' as "Bank",
  h."Comment",
  h.user_id,
  'HB_2025' as source_table
FROM "public"."HB_2025" h
WHERE NOT EXISTS (
  SELECT 1
  FROM "public"."Sweden_transactions_agregated_2025" a
  WHERE a."Date" = h."Date"
  AND a."Description" = h."Description"
  AND a."Amount" = h."Amount"
  AND a."source_table" = 'HB_2025'
)
ORDER BY h."Date", h."Description";

-- Verify the insertion was successful
SELECT COUNT(*) FROM "public"."Sweden_transactions_agregated_2025"
WHERE "source_table" = 'HB_2025';
```

### Adding American Express Transactions to the Aggregated Table

After processing American Express transactions, you'll need to add them to the aggregated table. This ensures all your financial data is available in one place for comprehensive analysis.

#### Step 1: Process the American Express Invoice

1. Capture the American Express invoice as an image/screenshot
2. Extract all transactions from the "Nya köp" tables
3. Create a structured table with these columns:
   - Transaction date
   - Process date
   - Transaction details (Description)
   - Amount in SEK (Belopp)
4. Verify the total matches the statement total

#### Step 2: Create Table-Specific Inserts

For each month's invoice, insert the transactions into a month-specific table (e.g., `AM_202505` for May 2025):

```sql
-- First check if the table exists and is empty
SELECT COUNT(*) FROM "public"."AM_202505";

-- Insert transactions from the American Express statement
INSERT INTO "public"."AM_202505" (
  "Date",
  "Description",
  "Amount",
  "Balance",
  "Category",
  "Responsible",
  "Bank",
  "Comment",
  "user_id"
)
VALUES
('2025-04-02', 'Hemkop Linkoping Luc 02 Linkoping', -328.22, NULL, 'Groceries', 'Carlos', 'American Express', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7'),
-- Additional transactions here
('2025-05-02', 'Periodens Del Av Arsavgift For Kontot', -500.00, NULL, 'Fee', 'Carlos', 'American Express', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7');

-- Verify the data was inserted correctly and total amount
SELECT SUM(ABS("Amount")) AS total_amount FROM "public"."AM_202505";
```

Use the `Sweden_transactions_agregated_2025_rows.csv` file as a reference for properly categorizing transactions.

#### Step 3: Update the Aggregated Table

After inserting the transactions into the month-specific table, update the aggregated table using the following pattern:

```sql
-- Step 0: Define the source table name as a variable
DO $$
DECLARE
   source_table_name TEXT := 'AM_202505';
   bank_name TEXT := 'American Express';
BEGIN

-- Step 1: Use a WITH clause to find the highest ID in the aggregated table
WITH max_id AS (
  SELECT COALESCE(MAX(id), 0) + 1 as next_id
  FROM "public"."Sweden_transactions_agregated_2025"
)

-- Step 2: Insert new transactions from the source table into the aggregated table
INSERT INTO "public"."Sweden_transactions_agregated_2025"
("id", "created_at", "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", "user_id", "source_table")
SELECT
  -- Use the next_id value from the CTE plus ROW_NUMBER() to ensure sequential IDs
  (SELECT next_id FROM max_id) + ROW_NUMBER() OVER (ORDER BY h."Date", h."Description") - 1 as id,
  NOW() as created_at,
  h."Date",
  h."Description",
  h."Amount",
  h."Balance",
  h."Category",
  h."Responsible",
  bank_name as "Bank",
  h."Comment",
  h.user_id,
  source_table_name as source_table
FROM "public"."" || source_table_name || "" h
WHERE NOT EXISTS (
  SELECT 1
  FROM "public"."Sweden_transactions_agregated_2025" a
  WHERE a."Date" = h."Date"
  AND a."Description" = h."Description"
  AND a."Amount" = h."Amount"
  AND a."source_table" = source_table_name
)
ORDER BY h."Date", h."Description";

-- Step 3: Verify the insertion was successful
RAISE NOTICE 'Inserted transactions count: %', (
  SELECT COUNT(*) FROM "public"."Sweden_transactions_agregated_2025"
  WHERE "source_table" = source_table_name
);

END $$;
```

This approach:

- Uses a variable for the source table name, making it easy to reuse for different months
- Avoids duplicates by checking if transactions already exist in the aggregated table
- Automatically calculates the next available ID
- Preserves the categorization you applied in the source table
- Provides verification of successful insertion

#### Step 4: Review the Aggregated Data

After updating the aggregated table:

1. Navigate to the "Global" view in the Finance Tracker
2. Verify that American Express transactions appear alongside other bank data
3. Check that the categories are correct and consistent
4. Confirm that the monthly totals match your American Express statement

By following this process, you'll maintain a comprehensive view of all your financial transactions across multiple accounts, enabling better financial tracking and analysis.

## Troubleshooting

### Common Upload Errors

| Error                         | Possible Cause                      | Solution                                       |
| ----------------------------- | ----------------------------------- | ---------------------------------------------- |
| "Invalid file"                | Wrong file format                   | Ensure you're uploading .xlsx or .csv          |
| "No transactions found"       | Empty or incorrectly formatted file | Check your file structure against the examples |
| "Error uploading to Supabase" | Network or database issue           | Try again or contact support                   |
| "Unknown bank type"           | Incorrect bank selection            | Ensure you've selected "Handelsbanken-SE"      |

### Data Format Issues

- **Date format**: Ensure dates are in the format used in the original statement (typically YYYY-MM-DD)
- **Decimal separator**: Handelsbanken uses commas as decimal separators (e.g., `749,00`). The processor will handle this conversion.
- **Negative amounts**: Expenses should include a minus sign (e.g., `-749,00`)

## Data Schema Reference

The Handelsbanken data is stored in a table with the following structure:

```sql
create table public."HB_2025" (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone not null default now(),
  "Date" date null,
  "Description" text null,
  "Amount" numeric null,
  "Balance" numeric null,
  "Category" text null default 'Unknown'::text,
  "Responsable" text null default 'Carlos'::text,
  "Comment" text null,
  user_id uuid null default '2b5c5467-04e0-4820-bea9-1645821fa1b7'::uuid,
  "Bank" text null default 'Handelsbanken'::text,
  constraint HB_2025_pkey primary key (id),
  constraint HB_2025_id_key unique (id)
)
```

The application displays this data in various charts and tables, including:

- Transaction lists in the Handelsbanken page
- Category breakdown charts
- Cumulative flow charts showing income and expenses over time

By following this guide, you can successfully transfer your bank statement information from screenshots to fully functional, interactive visualizations in the Finance Tracker application.
