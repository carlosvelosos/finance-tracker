"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import ProtectedRoute from "@/components/protected-route";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Example SQL code from the documentation
  const exampleSqlCode = `INSERT INTO "public"."HB_2025" ("created_at", "Date", "Description", "Amount", "Balance", "Category", "Responsable", "Comment", "user_id", "Bank")
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="images">Statement Images</TabsTrigger>
            <TabsTrigger value="sql-method">SQL Method</TabsTrigger>
            <TabsTrigger value="upload-method">Upload Method</TabsTrigger>
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
                      src="/private/drive-download-20250503T093045Z-1-001/2025-05-03-11-21-48.PNG"
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
                      src="/private/drive-download-20250503T093045Z-1-001/2025-05-03-11-22-31.PNG"
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
                      src="/private/drive-download-20250503T093045Z-1-001/2025-05-03-11-22-40.PNG"
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
                      src="/private/drive-download-20250503T093045Z-1-001/2025-05-03-11-22-51.PNG"
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

              <h3 className="text-lg font-medium mt-6 mb-2">
                How to Use the SQL Editor
              </h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to your Supabase dashboard</li>
                <li>Select your Finance Tracker project</li>
                <li>Click on &quot;SQL Editor&quot; in the left sidebar</li>
                <li>Create a new query</li>
                <li>Paste your SQL statement</li>
                <li>Click &quot;Run&quot; to execute</li>
              </ol>

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
