"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import ProtectedRoute from "@/components/protected-route";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Example SQL code from the documentation
  const exampleSqlCode = `INSERT INTO "public"."HB_2025" ("created_at", "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Comment", "user_id", "Bank")
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
('2025-05-03 00:00:00+00', '2025-04-29', 'American Expre', -14535.15, NULL, 'Amex Invoice', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken');`;

  // Example SQL code for checking last used ID
  const sqlCheckLastId = `-- Query to find the highest ID currently in use
SELECT MAX(id) as last_id FROM "public"."HB_2025";`;

  // Updated SQL code with OVERRIDING SYSTEM VALUE
  const sqlWithCustomIds = `-- First check the highest ID value
SELECT MAX(id) as last_id FROM "public"."HB_2025";

-- Then use OVERRIDING SYSTEM VALUE with IDs higher than the max
INSERT INTO "public"."HB_2025" (id, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Comment", "user_id", "Bank")
OVERRIDING SYSTEM VALUE
VALUES
-- Start with ID 100 (or higher than the MAX(id) from previous query)
(100, '2025-03-24', 'LÖN', 33917.00, NULL, 'Salary', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(101, '2025-03-26', 'American Expre', -16295.41, NULL, 'Amex Invoice', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
(102, '2025-03-26', 'MATTIAS LÖVGRE', -100.00, NULL, 'Personal Transactions', 'Carlos', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7', 'Handelsbanken'),
-- Continue with sequential IDs...`;

  // SQL code for updating the aggregated table
  const aggregatedTableSql = `-- Use a WITH clause to find the highest ID in the aggregated table
WITH max_id AS (
  SELECT COALESCE(MAX(id), 0) + 1 as next_id 
  FROM "public"."Sweden_transactions_agregated_2025"
)

-- Insert new transactions from HB_2025 into the aggregated table
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
ORDER BY h."Date", h."Description";`;

  // Add new AmEx SQL code example
  const amexInsertSql = `-- First check if the table exists and is empty
SELECT COUNT(*) FROM "public"."AM_202505";

-- Insert transactions from the American Express statement (May 2025)
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
('2025-04-04', 'Systembolaget 0505 Stockholm', -356.00, NULL, 'System Bolaget', 'Carlos', 'American Express', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7'),
('2025-04-04', 'Hornan Bar O Kak I Link Linkoping', -79.00, NULL, 'Bar', 'Carlos', 'American Express', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7'),
-- Additional transactions here...
('2025-05-02', 'Periodens Del Av Arsavgift For Kontot', -500.00, NULL, 'Fee', 'Carlos', 'American Express', NULL, '2b5c5467-04e0-4820-bea9-1645821fa1b7');

-- Verify the data was inserted correctly and total amount
SELECT SUM(ABS("Amount")) AS total_amount FROM "public"."AM_202505";`;

  // Add new AmEx aggregation SQL code
  const amexAggregationSql = `-- Step 0: Define the source table name as a variable
DO $$
DECLARE
   source_table_name TEXT := 'AM_202505';
   bank_name TEXT := 'American Express';
   dynamic_sql TEXT;
BEGIN

-- Step 1: Build and execute the dynamic SQL statement
dynamic_sql := '
WITH max_id AS (
  SELECT COALESCE(MAX(id), 0) + 1 as next_id 
  FROM "public"."Sweden_transactions_agregated_2025"
)
INSERT INTO "public"."Sweden_transactions_agregated_2025" 
("id", "created_at", "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", "user_id", "source_table")
SELECT 
  (SELECT next_id FROM max_id) + ROW_NUMBER() OVER (ORDER BY h."Date", h."Description") - 1 as id,
  NOW() as created_at,
  h."Date", 
  h."Description", 
  h."Amount", 
  h."Balance", 
  h."Category", 
  h."Responsible", 
  ''' || bank_name || ''' as "Bank",
  h."Comment", 
  h.user_id, 
  ''' || source_table_name || ''' as source_table
FROM "public"."' || source_table_name || '" h
WHERE NOT EXISTS (
  SELECT 1 
  FROM "public"."Sweden_transactions_agregated_2025" a 
  WHERE a."Date" = h."Date" 
  AND a."Description" = h."Description" 
  AND a."Amount" = h."Amount" 
  AND a."source_table" = ''' || source_table_name || '''
)
ORDER BY h."Date", h."Description"';

EXECUTE dynamic_sql;

-- Step 4: Verify the insertion was successful
RAISE NOTICE \'Inserted transactions count: %\', (
  SELECT COUNT(*) FROM "public"."Sweden_transactions_agregated_2025" 
  WHERE "source_table" = source_table_name
);

END $$;`;

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          From Bank Statement to Supabase
        </h1>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="images">Statement Images</TabsTrigger>
            <TabsTrigger value="sql-method">SQL Method</TabsTrigger>
            <TabsTrigger value="upload-method">Upload Method</TabsTrigger>
            <TabsTrigger value="amex">American Express</TabsTrigger>
            <TabsTrigger value="aggregated">Aggregated Table</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "overview" && (
          <Card>
            <CardHeader>
              <CardTitle>Process Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Finance Tracker application visualizes transaction data from
                various bank accounts. This guide explains how to get your bank
                statement data into the system:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Capture your bank statement as images (PNG, screenshots)
                </li>
                <li>Convert these images to structured data (Excel/CSV)</li>
                <li>
                  Upload the data through the application&apos;s upload
                  interface or direct SQL insertion
                </li>
                <li>
                  Verify that the data appears correctly in the application
                </li>
              </ol>
              <p className="italic text-gray-500 mt-4">
                Last updated: May 3, 2025
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === "images" && (
          <Card>
            <CardHeader>
              <CardTitle>Bank Statement Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                Below are examples of bank statement images that were used to
                extract transaction data. These screenshots from Handelsbanken
                show transactions from March and April 2025.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-2 font-medium">
                    March 2025 - Image 1
                  </div>
                  <div className="p-2">
                    <Image
                      src="/2025-05-03-11-21-48.PNG"
                      alt="March 2025 Bank Statement"
                      width={500}
                      height={300}
                      className="rounded-md"
                    />
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-2 font-medium">
                    March 2025 - Image 2
                  </div>
                  <div className="p-2">
                    <Image
                      src="/2025-05-03-11-22-31.PNG"
                      alt="March 2025 Bank Statement Continued"
                      width={500}
                      height={300}
                      className="rounded-md"
                    />
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-2 font-medium">
                    April 2025 - Image 1
                  </div>
                  <div className="p-2">
                    <Image
                      src="/2025-05-03-11-22-40.PNG"
                      alt="April 2025 Bank Statement"
                      width={500}
                      height={300}
                      className="rounded-md"
                    />
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-2 font-medium">
                    April 2025 - Image 2
                  </div>
                  <div className="p-2">
                    <Image
                      src="/2025-05-03-11-22-51.PNG"
                      alt="April 2025 Bank Statement Continued"
                      width={500}
                      height={300}
                      className="rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-amber-50 p-4 rounded-md border border-amber-200">
                <h3 className="font-medium text-amber-800">Important Tips</h3>
                <ul className="list-disc pl-6 mt-2 text-amber-700">
                  <li>
                    Make sure the column headers are visible in your screenshots
                  </li>
                  <li>Capture the entire transaction table when possible</li>
                  <li>Save images with descriptive names including the date</li>
                  <li>
                    Higher resolution screenshots will provide better results
                    when using OCR
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "sql-method" && (
          <Card>
            <CardHeader>
              <CardTitle>Direct SQL Insert Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You can directly insert transaction data using the Supabase SQL
                Editor. This is particularly useful when:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You only have a few transactions to add</li>
                <li>
                  You&apos;re working with transaction data from images or
                  screenshots
                </li>
                <li>
                  The application&apos;s upload mechanism is not available
                </li>
                <li>You need to perform custom data transformations</li>
              </ul>

              <h3 className="text-lg font-medium mt-6 mb-2">
                Example SQL Statement
              </h3>
              <p className="mb-4">
                Below is the SQL statement generated from the bank statement
                images above. This adds transactions from March and April 2025
                to the HB_2025 table:
              </p>

              <div className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {exampleSqlCode}
                </pre>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">
                  Finding the Last Used ID
                </h3>
                <p className="mb-2">
                  Before inserting new records, check the highest ID currently
                  in use:
                </p>
                <div className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {sqlCheckLastId}
                  </pre>
                </div>
                <p className="mt-4 mb-2">
                  Then use OVERRIDING SYSTEM VALUE with IDs higher than the max:
                </p>
                <div className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {sqlWithCustomIds}
                  </pre>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-6">
                <h3 className="font-medium text-blue-800">
                  Categorization Guide
                </h3>
                <p className="text-blue-700 mt-1">
                  When categorizing transactions, follow these patterns:
                </p>
                <ul className="list-disc pl-6 mt-2 text-blue-700">
                  <li>
                    &quot;LÖN&quot; and &quot;NIRA&quot; entries →
                    &quot;Salary&quot;
                  </li>
                  <li>
                    &quot;American Expre&quot; entries → &quot;Amex
                    Invoice&quot;
                  </li>
                  <li>
                    &quot;Telia&quot; and &quot;Tekniska Verke&quot; entries →
                    &quot;Apartment&quot;
                  </li>
                  <li>Personal names → &quot;Personal Transactions&quot;</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "upload-method" && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The application provides an upload interface for Excel/CSV
                files, which is ideal for handling multiple transactions at
                once.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">
                Converting Images to Excel/CSV
              </h3>
              <p>
                Before uploading, you need to convert your bank statement images
                to structured data:
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Manual Transcription</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Recommended for accuracy
                  </p>
                  <ol className="list-decimal pl-6 space-y-1 text-sm">
                    <li>Create a new Excel spreadsheet</li>
                    <li>Set up columns matching the expected format</li>
                    <li>Manually transcribe the transactions</li>
                    <li>Save as .xlsx or .csv</li>
                  </ol>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">OCR Software</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Faster but requires verification
                  </p>
                  <ol className="list-decimal pl-6 space-y-1 text-sm">
                    <li>
                      Use OCR software (Microsoft OneNote, Google Docs, etc.)
                    </li>
                    <li>Upload your screenshots to extract text</li>
                    <li>Transfer to a spreadsheet and format properly</li>
                    <li>Check carefully for OCR errors</li>
                  </ol>
                </div>
              </div>

              <h3 className="text-lg font-medium mt-6 mb-2">Upload Steps</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to the Finance Tracker application</li>
                <li>Navigate to the &quot;Upload&quot; page</li>
                <li>
                  Select &quot;Handelsbanken-SE&quot; from the bank dropdown
                </li>
                <li>
                  Click &quot;Choose File&quot; and select your Excel/CSV file
                </li>
                <li>Click &quot;Upload&quot; and wait for confirmation</li>
              </ol>

              <div className="bg-gray-50 p-4 rounded-md border mt-6">
                <h4 className="font-medium">Required Excel/CSV Format</h4>
                <p className="text-sm mt-2">
                  Your file should have these columns:
                </p>
                <table className="min-w-full mt-2 border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-sm">
                        Transaktionsdatum
                      </th>
                      <th className="px-4 py-2 text-left text-sm">Text</th>
                      <th className="px-4 py-2 text-left text-sm">Belopp</th>
                      <th className="px-4 py-2 text-left text-sm">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2 text-sm">2025-04-30</td>
                      <td className="border px-4 py-2 text-sm">
                        TELIA BREDBAND
                      </td>
                      <td className="border px-4 py-2 text-sm">-749,00</td>
                      <td className="border px-4 py-2 text-sm">12345,67</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border px-4 py-2 text-sm">2025-04-29</td>
                      <td className="border px-4 py-2 text-sm">
                        American Expre
                      </td>
                      <td className="border px-4 py-2 text-sm">-14535,15</td>
                      <td className="border px-4 py-2 text-sm">11331,67</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "amex" && (
          <Card>
            <CardHeader>
              <CardTitle>American Express Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Processing American Express statements requires a slightly
                different approach than Handelsbanken statements. This guide
                explains how to extract transaction data from American Express
                invoices and integrate it into your finance tracking system.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">
                Extracting Transactions from American Express Invoices
              </h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Capture the American Express invoice as an image/screenshot
                </li>
                <li>
                  Focus on the "Nya köp" (New Purchases) tables in the statement
                </li>
                <li>
                  Create a structured table with the following columns:
                  <ul className="list-disc pl-6 mt-1">
                    <li>Transaction date (Transaktions-datum)</li>
                    <li>Process date (Process-datum)</li>
                    <li>Transaction details (Transaktionsuppgifter)</li>
                    <li>Amount in SEK (Belopp i SEK)</li>
                  </ul>
                </li>
                <li>
                  Verify that the total matches the statement total amount
                </li>
              </ol>

              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mt-6">
                <h4 className="font-medium text-yellow-800">
                  Transaction Categorization Tips
                </h4>
                <p className="text-yellow-700 mt-1">
                  When categorizing American Express transactions, follow these
                  patterns:
                </p>
                <ul className="list-disc pl-6 mt-2 text-yellow-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <li>
                    &quot;Hemkop&quot; and &quot;ICA&quot; →
                    &quot;Groceries&quot;
                  </li>
                  <li>
                    &quot;Systembolaget&quot; → &quot;System Bolaget&quot;
                  </li>
                  <li>
                    &quot;Hornan Bar&quot; and &quot;Olearys&quot; →
                    &quot;Bar&quot;
                  </li>
                  <li>&quot;Espresso House&quot; → &quot;Cafe&quot;</li>
                  <li>&quot;Betalo Ab-fastighets&quot; → &quot;Rent&quot;</li>
                  <li>
                    &quot;Klarna*kolmarden&quot; → &quot;Entertainment&quot;
                  </li>
                  <li>
                    &quot;Periodens Del Av Arsavgift&quot; → &quot;Fee&quot;
                  </li>
                  <li>&quot;Bolt Operations&quot; → &quot;Cab&quot;</li>
                </ul>
              </div>

              <h3 className="text-lg font-medium mt-6 mb-2">
                SQL Insert for American Express Transactions
              </h3>
              <p>
                For each month's invoice, insert the transactions into a
                month-specific table (e.g., <code>AM_202505</code> for May
                2025):
              </p>

              <div className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mt-2">
                <pre className="text-sm whitespace-pre-wrap">
                  {amexInsertSql}
                </pre>
              </div>

              <h3 className="text-lg font-medium mt-6 mb-2">
                Updating the Aggregated Table with AmEx Transactions
              </h3>
              <p>
                After inserting transactions into the month-specific AmEx table,
                update the aggregated table using dynamic SQL:
              </p>

              <div className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mt-2">
                <pre className="text-sm whitespace-pre-wrap">
                  {amexAggregationSql}
                </pre>
              </div>

              <h3 className="text-lg font-medium mt-6 mb-2">
                The Dynamic SQL Approach
              </h3>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-2">
                <h4 className="font-medium text-blue-800">Key Benefits</h4>
                <ul className="list-disc pl-6 mt-2 text-blue-700">
                  <li>
                    <span className="font-medium">Reusability:</span> Change
                    only the variable values to process different months
                  </li>
                  <li>
                    <span className="font-medium">Error prevention:</span>{" "}
                    Properly handles dynamic table names
                  </li>
                  <li>
                    <span className="font-medium">Duplicate detection:</span>{" "}
                    Prevents inserting the same transaction twice
                  </li>
                  <li>
                    <span className="font-medium">ID management:</span>{" "}
                    Automatically calculates sequential IDs
                  </li>
                </ul>
              </div>

              <p className="mt-4">
                The dynamic SQL approach is necessary because we need to
                reference table names as variables. This allows you to reuse the
                same code for different months by simply changing the{" "}
                <code>source_table_name</code> variable from
                <code>AM_202505</code> to <code>AM_202506</code>, etc.
              </p>

              <div className="bg-purple-50 p-4 rounded-md border border-purple-200 mt-6">
                <h3 className="font-medium text-purple-800">
                  Complete Process Overview
                </h3>
                <ol className="list-decimal pl-6 mt-2 text-purple-700">
                  <li>
                    Extract and categorize all transactions from the AmEx
                    invoice
                  </li>
                  <li>
                    Create a monthly table (e.g., AM_202505) and insert
                    transactions
                  </li>
                  <li>Verify the total amount matches the invoice</li>
                  <li>Use the dynamic SQL to update the aggregated table</li>
                  <li>Check the data in the Finance Tracker application</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "aggregated" && (
          <Card>
            <CardHeader>
              <CardTitle>Aggregated Table</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                After adding transactions to individual bank tables (like{" "}
                <code>HB_2025</code>), you need to update the{" "}
                <code>Sweden_transactions_agregated_2025</code> table. This
                aggregated table combines transactions from multiple sources
                into a unified view for comprehensive reporting.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">
                Understanding the Aggregated Table
              </h3>
              <p>
                The <code>Sweden_transactions_agregated_2025</code> table
                combines transactions from multiple sources:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Handelsbanken (<code>HB_2025</code>)
                </li>
                <li>
                  American Express (<code>AM_202501</code>,{" "}
                  <code>AM_202502</code>, etc.)
                </li>
                <li>
                  SEB SJ Prio (<code>SJ_202501</code>, <code>SJ_202502</code>,
                  etc.)
                </li>
              </ul>
              <p className="mt-2">
                This gives you a comprehensive view of all your financial
                activities across different accounts.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">
                SQL Code for Updating the Aggregated Table
              </h3>
              <p>
                Use this SQL script to safely insert only new transactions that
                don&apos;t already exist in the aggregated table:
              </p>

              <div className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {aggregatedTableSql}
                </pre>
              </div>

              <h3 className="text-lg font-medium mt-6 mb-2">
                How This Script Works
              </h3>

              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <span className="font-medium">
                    Finding the Next Available ID:
                  </span>{" "}
                  The <code>WITH max_id AS</code> clause creates a Common Table
                  Expression (CTE) that gets the maximum ID from the aggregated
                  table and adds 1 to determine the next available ID.
                </li>

                <li>
                  <span className="font-medium">Avoiding Duplicates:</span> The{" "}
                  <code>WHERE NOT EXISTS</code> condition ensures that only new
                  transactions are inserted, preventing duplicates based on
                  date, description, and amount.
                </li>

                <li>
                  <span className="font-medium">
                    Generating Sequential IDs:
                  </span>{" "}
                  The <code>ROW_NUMBER()</code> function combined with the next
                  available ID ensures that new entries get sequential IDs
                  without conflicts.
                </li>

                <li>
                  <span className="font-medium">
                    Setting the Current Timestamp:
                  </span>{" "}
                  The <code>NOW()</code> function sets the{" "}
                  <code>created_at</code> field to the current date and time.
                </li>
              </ol>

              <h3 className="text-lg font-medium mt-6 mb-2">
                Verifying the Update
              </h3>
              <p>
                After running the update script, you can verify that the
                transactions were added correctly:
              </p>
              <div className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mt-2">
                <pre className="text-sm whitespace-pre-wrap">
                  {`-- Count the total transactions from HB_2025 in the aggregated table
SELECT COUNT(*) FROM "public"."Sweden_transactions_agregated_2025" 
WHERE "source_table" = 'HB_2025';

-- View the most recently added transactions
SELECT * FROM "public"."Sweden_transactions_agregated_2025"
ORDER BY id DESC
LIMIT 10;`}
                </pre>
              </div>

              <div className="bg-purple-50 p-4 rounded-md border border-purple-200 mt-6">
                <h3 className="font-medium text-purple-800">
                  Benefits of This Approach
                </h3>
                <ul className="list-disc pl-6 mt-2 text-purple-700">
                  <li>
                    <span className="font-medium">Safety:</span> No risk of
                    duplicate entries or ID conflicts
                  </li>
                  <li>
                    <span className="font-medium">Automation:</span>{" "}
                    Automatically calculates the next available ID
                  </li>
                  <li>
                    <span className="font-medium">Efficiency:</span> Single SQL
                    statement for the entire operation
                  </li>
                  <li>
                    <span className="font-medium">Maintainability:</span> Works
                    consistently even as your database grows
                  </li>
                </ul>
              </div>

              <p className="mt-6">
                Run this script whenever you&apos;ve added new transactions to
                one of your bank-specific tables (like <code>HB_2025</code>) and
                want to update the aggregated view. This ensures that your
                combined analysis and reporting will include the latest data
                from all your accounts.
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === "verification" && (
          <Card>
            <CardHeader>
              <CardTitle>Verifying Your Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                After uploading or directly inserting data, verify that your
                transactions appear correctly in the Finance Tracker
                application:
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">
                Verification Steps
              </h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Navigate to &quot;Handelsbanken&quot; in the main menu</li>
                <li>Check that your transactions appear in the table</li>
                <li>
                  Go to &quot;Handelsbanken Overview&quot; to see charts of your
                  data
                </li>
                <li>
                  Verify amounts and dates match your original bank statement
                </li>
              </ol>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Common Issues</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Wrong date format (should be YYYY-MM-DD)</li>
                    <li>Decimal separator issues (comma vs. period)</li>
                    <li>Missing negative signs for expenses</li>
                    <li>Duplicate transactions</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Data Quality Checks</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>
                      Compare total sum of transactions with bank statement
                    </li>
                    <li>Check for missing transactions</li>
                    <li>Verify categories are assigned correctly</li>
                    <li>
                      Ensure beginning and ending balance match your statement
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-md border border-green-200 mt-6">
                <h3 className="font-medium text-green-800">
                  Success Indicators
                </h3>
                <p className="text-green-700 mt-1">
                  Your data upload is successful when:
                </p>
                <ul className="list-disc pl-6 mt-2 text-green-700">
                  <li>All transactions from your images appear in the table</li>
                  <li>Charts show accurate expense and income data</li>
                  <li>Category distributions reflect your spending patterns</li>
                  <li>Transaction dates and amounts match your screenshots</li>
                </ul>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                If you encounter any issues during verification, check the
                troubleshooting section in the documentation or contact the
                application administrator.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
