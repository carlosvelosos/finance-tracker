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
8. [Troubleshooting](#troubleshooting)
9. [Data Schema Reference](#data-schema-reference)

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
INSERT INTO "public"."HB_2025" ("created_at", "Date", "Description", "Amount", "Balance", "Category", "Responsable", "Comment", "user_id", "Bank")
VALUES
-- March 2025 transactions
('2025-05-03 00:00:00+00', '2025-03-24', 'LÖN', 33917.00, NULL, 'Salary', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
('2025-05-03 00:00:00+00', '2025-03-26', 'American Expre', -16295.41, NULL, 'Amex Invoice', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
('2025-05-03 00:00:00+00', '2025-03-26', 'MATTIAS LÖVGRE', -100.00, NULL, 'Personal Transactions', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
('2025-05-03 00:00:00+00', '2025-03-26', 'Telia Faktura', -749.00, NULL, 'Apartment', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),

-- April 2025 transactions
('2025-05-03 00:00:00+00', '2025-04-04', 'Tekniska Verke', -194.00, NULL, 'Apartment', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
('2025-05-03 00:00:00+00', '2025-04-05', 'RODRIGO SAAR D', -95.00, NULL, 'Personal Transactions', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
('2025-05-03 00:00:00+00', '2025-04-25', 'NIRA', 32476.00, NULL, 'Salary', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
('2025-05-03 00:00:00+00', '2025-04-29', 'American Expre', -14535.15, NULL, 'Amex Invoice', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken');
```

### Constructing the Statement from Images

To create this statement from your bank statement images:

1. **Review the screenshots** and make note of all transactions
2. **Create the SQL statement** following this structure:
   - Specify the table name (`HB_2025` for 2025 Handelsbanken transactions)
   - List all columns you're inserting data into
   - For each transaction, create a VALUES row with the transaction details
3. **Categorize transactions** based on patterns:
   - "LÖN" and "NIRA" entries → "Salary"
   - "American Expre" entries → "Amex Invoice"
   - "Telia" and "Tekniska Verke" entries → "Apartment"
   - Personal names → "Personal Transactions"
4. **Format the data correctly**:
   - Dates in YYYY-MM-DD format
   - Amounts in decimal format with a period (`.`) as separator
   - Negative values for expenses, positive for income
   - NULL for any missing values

### Running the SQL Statement

1. Paste your SQL statement into the SQL Editor
2. Review the statement for accuracy
3. Click "Run" to execute the statement
4. Check for any error messages and fix as needed
5. If successful, you'll see a confirmation message with the number of rows inserted

### Tips for SQL Insertion

- Group transactions by month or statement period for easier management
- Use consistent naming conventions for categories
- Include comments in your SQL to document the source of the data
- Consider adding a unique identifier (like transaction date + description) to avoid duplicates
- Create a backup of your data before making large insertions

## Step 5: Verifying Your Data

After uploading, you should verify that your data appears correctly:

1. Navigate to "Handelsbanken" in the main menu
2. Check that your transactions appear in the table
3. For visual verification, go to "Handelsbanken Overview" to see charts of your data
4. Verify that the amounts and dates match your original bank statement

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
