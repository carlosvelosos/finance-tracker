"use client";

import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import DataFlowDiagram from "@/components/DataFlowDiagram";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Info,
  Table,
  BarChart3,
  Filter,
  MousePointer,
} from "lucide-react";

export default function InterAccountInfo() {
  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-4">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-center flex-1">
            Inter Account Page - UI Components Guide
          </h1>
          <Button
            onClick={() => (window.location.href = "../")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 border border-blue-500 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Inter Account
          </Button>
        </div>

        <div className="space-y-6">
          {/* Page Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={20} />
                Page Overview
              </CardTitle>
              <CardDescription>
                The Inter Account page provides a comprehensive view of
                transaction data from Brasil accounts, specifically focusing on
                Inter Bank Brasil transactions with tools for data management
                and visualization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This page serves as the central hub for managing Inter Bank
                Brasil transaction data. The main table{" "}
                <strong>Brasil_transactions_agregated_2025</strong> is an
                aggregated table that consolidates transaction data from
                multiple source tables (monthly/yearly tables) into a single
                unified view for easier analysis and reporting.
              </p>
              <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                <h5 className="font-semibold text-sm text-blue-800 mb-1">
                  Key Architecture:
                </h5>
                <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
                  <li>
                    <strong>Source Tables:</strong> Individual monthly/yearly
                    tables (IN_2023, IN_2024, IN_202401, etc.)
                  </li>
                  <li>
                    <strong>Aggregated Table:</strong>{" "}
                    Brasil_transactions_agregated_2025 (unified view)
                  </li>
                  <li>
                    <strong>Purpose:</strong> Consolidate data from multiple
                    time periods for comprehensive analysis
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Source Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table size={20} />
                Data Source Information Panel
              </CardTitle>
              <CardDescription>
                A summary panel displaying key information about the data being
                displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Purpose:</h4>
                <p className="text-sm text-muted-foreground">
                  Provides transparency about the aggregated data structure. The
                  <strong> Brasil_transactions_agregated_2025</strong> table
                  serves as a consolidated view of transactions from multiple
                  source tables (monthly/yearly tables like IN_2023, IN_2024,
                  etc.). This aggregation allows for comprehensive analysis
                  across different time periods.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Components:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Aggregated Table Name:</strong> Shows
                    &quot;Brasil_transactions_agregated_2025&quot; - the unified
                    table containing data from multiple source tables
                  </li>
                  <li>
                    <strong>Transaction Count:</strong> Displays total number of
                    transactions loaded from the aggregated table
                  </li>
                  <li>
                    <strong>Bank Statistics:</strong> Shows unique banks
                    represented in the aggregated data and transaction counts
                    per bank
                  </li>
                  <li>
                    <strong>Date Information:</strong> Displays the newest
                    transaction date for each bank in the aggregated dataset
                  </li>
                  <li>
                    <strong>Source Table Tracking:</strong> Each transaction
                    maintains a reference to its original source table
                    (source_table field)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Layout:</h4>
                <p className="text-sm text-muted-foreground">
                  Responsive grid layout (1 column on mobile, 3 columns on
                  desktop) with gray background and rounded borders for clear
                  visual separation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Update Buttons Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer size={20} />
                Data Update Buttons with Hover Cards
              </CardTitle>
              <CardDescription>
                Interactive buttons for updating transaction data with detailed
                hover explanations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Update Aggregated Data Button:
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Function:</strong> Updates aggregated transaction
                    data from HB_2025 table
                  </li>
                  <li>
                    <strong>Hover Card:</strong> Shows detailed workflow,
                    function stack, and user interaction requirements
                  </li>
                  <li>
                    <strong>Process:</strong> Preview → User Review →
                    Confirmation → Database Update
                  </li>
                  <li>
                    <strong>Automatic:</strong> Data scanning, formatting,
                    categorization, and insertion
                  </li>
                  <li>
                    <strong>Manual:</strong> Start process, review preview,
                    confirm operation
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Update Inter Data Button:
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Function:</strong> Aggregates transaction data from
                    Inter Bank Brasil monthly/yearly source tables (IN_YYYY,
                    IN_YYYYMM patterns) into the main aggregated table
                    Brasil_transactions_agregated_2025
                  </li>
                  <li>
                    <strong>Source Tables:</strong> Scans for available Inter
                    tables like IN_2023, IN_2024, IN_202401, IN_202402, etc.
                  </li>
                  <li>
                    <strong>Hover Card:</strong> Shows table selection process
                    and Inter-specific aggregation workflows
                  </li>
                  <li>
                    <strong>Process:</strong> Table Detection → Selection →
                    Preview → Confirmation → Aggregation into unified table
                  </li>
                  <li>
                    <strong>Automatic:</strong> Table detection, preview
                    loading, data formatting to match aggregated schema,
                    metadata updates
                  </li>
                  <li>
                    <strong>Manual:</strong> Start process, select source tables
                    to aggregate (IN_2023, IN_2024, etc.), review preview,
                    confirm aggregation
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Hover Card Features:
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Color Coding:</strong> Orange (⚠️) for user actions,
                    Green (✓) for automatic operations
                  </li>
                  <li>
                    <strong>Technical Details:</strong> Function call stack and
                    Supabase operations
                  </li>
                  <li>
                    <strong>Step-by-Step:</strong> Numbered lists showing exact
                    process flow
                  </li>
                  <li>
                    <strong>Width:</strong> Fixed 320px (w-80) for consistent
                    display
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Aggregation Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table size={20} />
                Data Aggregation Architecture
              </CardTitle>
              <CardDescription>
                Understanding how the aggregated table works with source tables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Table Structure:</h4>
                <div className="bg-gray-50 p-3 rounded-md border">
                  <div className="text-xs space-y-2">
                    <div>
                      <strong className="text-blue-600">
                        Source Tables (Yearly for Bank Statements):
                      </strong>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>
                          <code>IN_2023</code> - All Inter bank account
                          transactions for 2023
                        </li>
                        <li>
                          <code>IN_2024</code> - All Inter bank account
                          transactions for 2024
                        </li>
                        <li>
                          <code>IN_2025</code> - All Inter bank account
                          transactions for 2025 (up to current date)
                        </li>
                        <li className="text-gray-500 italic">
                          Note: Monthly tables (IN_YYYYMM) are used only for
                          credit card invoices, not bank statements
                        </li>
                      </ul>
                    </div>
                    <div className="pt-2 border-t">
                      <strong className="text-green-600">
                        Aggregated Table:
                      </strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>
                          <code>Brasil_transactions_agregated_2025</code> -
                          Unified view of all transactions
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  How Aggregation Works:
                </h4>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Detection:</strong> System scans for available
                    source tables (IN_* pattern)
                  </li>
                  <li>
                    <strong>Selection:</strong> User chooses which source tables
                    to include
                  </li>
                  <li>
                    <strong>Data Copy:</strong> Transactions are copied from
                    source tables to aggregated table
                  </li>
                  <li>
                    <strong>Source Tracking:</strong> Each transaction maintains
                    a &apos;source_table&apos; field
                  </li>
                  <li>
                    <strong>Unified Access:</strong> All data accessible through
                    single aggregated table
                  </li>
                  <li>
                    <strong>Duplicate Prevention:</strong> System prevents
                    re-importing already included tables
                  </li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Benefits of Aggregation:
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Simplified Queries:</strong> Query one table instead
                    of multiple monthly tables
                  </li>
                  <li>
                    <strong>Cross-Period Analysis:</strong> Analyze transactions
                    across different time periods
                  </li>
                  <li>
                    <strong>Performance:</strong> Faster queries on a single
                    optimized table
                  </li>
                  <li>
                    <strong>Unified Reporting:</strong> Generate reports across
                    all time periods
                  </li>
                  <li>
                    <strong>Data Consistency:</strong> Standardized format
                    across all periods
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Flow Illustration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeft size={20} />
                Interactive Data Flow: From Bank App to Inter Account Page
              </CardTitle>
              <CardDescription>
                Interactive visualization of the complete data journey from
                Brazilian bank statements to your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Interactive Flow Diagram */}
              <div>
                <h4 className="font-semibold text-sm mb-4 text-center">
                  Interactive Data Flow Visualization
                </h4>
                <p className="text-xs text-muted-foreground mb-4 text-center">
                  Explore the complete data journey with this interactive
                  diagram. Drag nodes around, zoom in/out, and click on the
                  links within nodes to navigate directly to the relevant pages.
                </p>
                <DataFlowDiagram />
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <h5 className="font-semibold text-xs text-blue-800 mb-2">
                    🚀 Interactive Features:
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
                        <li>
                          <strong>Drag & Drop:</strong> Move nodes to customize
                          the layout
                        </li>
                        <li>
                          <strong>Zoom Control:</strong> Mouse wheel or controls
                          to zoom
                        </li>
                        <li>
                          <strong>Minimap:</strong> Overview navigation in
                          top-right corner
                        </li>
                      </ul>
                    </div>
                    <div>
                      <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
                        <li>
                          <strong>Direct Navigation:</strong> Click links in
                          nodes to visit pages
                        </li>
                        <li>
                          <strong>Animated Flow Lines:</strong> Watch data flow
                          along color-coded connections
                        </li>
                        <li>
                          <strong>Step Labels:</strong> Each connection shows
                          the action being performed
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-white rounded border border-blue-300">
                    <h6 className="font-semibold text-xs text-blue-800 mb-2">
                      🔗 Flow Line Guide:
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-blue-500 rounded"></div>
                          <span className="text-xs text-blue-700">
                            <strong>Download</strong> - Inter to Local Files
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-purple-500 rounded"></div>
                          <span className="text-xs text-purple-700">
                            <strong>Upload</strong> - Local Files to App
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-green-500 rounded"></div>
                          <span className="text-xs text-green-700">
                            <strong>Parse & Store</strong> - App to Database
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-indigo-500 rounded"></div>
                          <span className="text-xs text-indigo-700">
                            <strong>Aggregate</strong> - Source to Unified Table
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-teal-500 rounded"></div>
                          <span className="text-xs text-teal-700">
                            <strong>Analyze</strong> - Unified Table to
                            Analytics
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-white rounded border border-blue-300">
                    <p className="text-xs text-blue-600">
                      <strong>💡 Pro Tip:</strong> This diagram is fully
                      interactive - you can rearrange it to match your workflow
                      preferences, and it will remember your layout during your
                      session! The animated flow lines help you understand the
                      data journey from start to finish.
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Process Steps */}
              <div>
                <h4 className="font-semibold text-sm mb-3">
                  Detailed Process Steps:
                </h4>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-semibold text-sm text-blue-700">
                      Step 1: Manual Download from Inter Bank Brasil
                    </h5>
                    <div className="bg-blue-50 p-3 rounded-md mt-2 mb-3">
                      <p className="text-xs font-semibold text-blue-800 mb-2">
                        🏦 Inter Bank Brasil Website:{" "}
                        <a
                          href="https://inter.co/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          https://inter.co/
                        </a>
                      </p>
                      <div className="text-xs text-blue-700">
                        <strong>Important:</strong> Inter offers two types of
                        financial data:
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>
                            <strong>Bank Account Statements</strong> - Current
                            account balance and transactions (what we display)
                          </li>
                          <li>
                            <strong>Credit Card Invoices</strong> - Credit card
                            purchases and payments (separate system)
                          </li>
                        </ul>
                        <p className="mt-2 font-medium">
                          For the Inter Account page, we need{" "}
                          <strong>Bank Account Statements</strong> only.
                        </p>
                      </div>
                    </div>
                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
                      <li>
                        <strong>Navigate to Inter:</strong> Go to{" "}
                        <a
                          href="https://inter.co/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          inter.co
                        </a>{" "}
                        and log into your account
                      </li>
                      <li>
                        <strong>Access Statements:</strong> Look for
                        &quot;Extratos&quot; or &quot;Conta Corrente&quot;
                        section
                      </li>
                      <li>
                        <strong>Select Date Range Strategy:</strong> For Inter
                        bank account statements, always download the complete
                        year from January 1st to today&apos;s date
                        <div className="bg-blue-50 p-2 rounded-md mt-1 mb-2 border-l-4 border-blue-400">
                          <p className="text-xs text-blue-700 font-medium mb-1">
                            📅 Yearly Download Strategy:
                          </p>
                          <ul className="list-disc list-inside text-xs text-blue-600 space-y-1">
                            <li>
                              <strong>Date Range:</strong> January 1st, YYYY to
                              Current Date
                            </li>
                            <li>
                              <strong>Supabase Table:</strong> Updates yearly
                              table (IN_YYYY format)
                            </li>
                            <li>
                              <strong>Purpose:</strong> Maintains complete
                              yearly transaction history
                            </li>
                            <li>
                              <strong>Example:</strong> January 1st, 2024 to
                              June 28th, 2025 → IN_2024 table
                            </li>
                          </ul>
                          <p className="text-xs text-blue-600 mt-2 italic">
                            ⚠️ Note: Monthly tables (IN_YYYYMM) are only used
                            for credit card invoices, not bank account
                            statements.
                          </p>
                        </div>
                      </li>
                      <li>
                        <strong>Download Format:</strong> Download all three
                        formats: CSV, PDF, and OFX files
                      </li>
                      <li>
                        <strong>Important:</strong> Ensure you&apos;re
                        downloading bank account statements, NOT credit card
                        invoices
                      </li>
                      <li>
                        <strong>File Storage Location:</strong> Save all
                        downloaded files to your organized Google Drive folder:
                        <div className="bg-blue-50 p-2 rounded-md mt-1 mb-2">
                          <code className="bg-gray-200 px-2 py-1 rounded text-xs block">
                            G:\My
                            Drive\00_Financeiro\00_Brasil\00_BancoInter\Extrato
                          </code>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          This maintains your financial document organization
                          and ensures easy access for future uploads.
                        </p>
                      </li>
                      <li>
                        <strong>File Naming Convention:</strong> Use the
                        standardized format for yearly bank statements:
                        <div className="bg-green-50 p-2 rounded-md mt-1 mb-2">
                          <code className="bg-gray-200 px-2 py-1 rounded text-xs block">
                            Extrato-01-01-YYYY-a-DD-MM-YYYY
                          </code>
                          <p className="text-xs text-green-700 mt-1">
                            Example: &quot;Extrato-01-01-2024-a-28-06-2025&quot;
                            (January 1st, 2024 to June 28th, 2025)
                          </p>
                          <p className="text-xs text-green-600 mt-1 italic">
                            💡 Always start from January 1st to ensure complete
                            yearly data for the IN_YYYY table.
                          </p>
                        </div>
                      </li>
                      <li>
                        <strong>Download All File Formats:</strong> Store all
                        three file types for each statement period:
                        <div className="bg-amber-50 p-2 rounded-md mt-1">
                          <ul className="list-disc list-inside text-xs space-y-1">
                            <li>
                              <strong>CSV file:</strong> Primary format for app
                              upload and data parsing
                            </li>
                            <li>
                              <strong>PDF file:</strong> Human-readable backup
                              for visual reference and records
                            </li>
                            <li>
                              <strong>OFX file:</strong> Universal format for
                              compatibility with other financial software
                            </li>
                          </ul>
                          <p className="text-xs text-amber-700 mt-2 font-medium">
                            💡 Having all formats ensures data redundancy and
                            compatibility with different tools.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h5 className="font-semibold text-sm text-purple-700">
                      Step 2: Upload to Your Application
                    </h5>
                    <div className="bg-purple-50 p-3 rounded-md mt-2 mb-3">
                      <p className="text-xs font-semibold text-purple-800 mb-2">
                        📁 Upload Files Page:{" "}
                        <a
                          href="/upload"
                          className="text-purple-600 underline hover:text-purple-800"
                        >
                          /upload
                        </a>
                      </p>
                      <p className="text-xs text-purple-700">
                        This page handles file parsing and creates/updates
                        Supabase source tables automatically.
                      </p>
                    </div>
                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
                      <li>
                        <strong>Navigate:</strong> Go to your app&apos;s Upload
                        Files page at{" "}
                        <a href="/upload" className="text-purple-600 underline">
                          /upload
                        </a>
                      </li>
                      <li>
                        <strong>Select Bank:</strong> Choose
                        &quot;Inter-BR-Account&quot; from the bank dropdown
                        (important for correct table creation for bank account
                        statements)
                      </li>
                      <li>
                        <strong>Choose File:</strong> Select the downloaded
                        Inter bank statement file
                      </li>
                      <li>
                        <strong>Upload Process:</strong> Click
                        &quot;Upload&quot; - the app will parse CSV/Excel
                        columns and transaction data
                      </li>
                      <li>
                        <strong>Table Creation:</strong> If needed, the app will
                        automatically create new Supabase tables (IN_YYYY or
                        IN_YYYYMM pattern)
                      </li>
                      <li>
                        <strong>Data Validation:</strong> System validates and
                        formats data before storage
                      </li>
                      <li>
                        <strong>Confirmation:</strong> You&apos;ll receive
                        upload success/failure notification
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h5 className="font-semibold text-sm text-green-700">
                      Step 3: Supabase Source Table Management
                    </h5>
                    <div className="bg-green-50 p-3 rounded-md mt-2 mb-3">
                      <p className="text-xs font-semibold text-green-800 mb-2">
                        🗄️ Table Structure in Supabase
                      </p>
                      <p className="text-xs text-green-700">
                        Each upload creates or updates source tables that store
                        raw transaction data before aggregation.
                      </p>
                    </div>
                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
                      <li>
                        <strong>Table Creation Strategy:</strong> Upload process
                        creates yearly tables for bank account statements
                        <div className="bg-green-50 p-2 rounded-md mt-1 mb-2 border-l-4 border-green-400">
                          <p className="text-xs text-green-700 font-medium mb-1">
                            🗄️ Table Naming Convention:
                          </p>
                          <ul className="list-disc list-inside text-xs text-green-600 space-y-1">
                            <li>
                              <strong>Bank Account Statements:</strong> IN_YYYY
                              (yearly tables) - Example: IN_2024, IN_2025
                            </li>
                            <li>
                              <strong>Credit Card Invoices:</strong> IN_YYYYMM
                              (monthly tables) - Example: IN_202401, IN_202402
                            </li>
                          </ul>
                          <p className="text-xs text-green-600 mt-2 italic">
                            💡 Since we download yearly bank statements, only
                            IN_YYYY tables are created for account data.
                          </p>
                        </div>
                      </li>
                      <li>
                        <strong>Data Structure:</strong> Tables maintain
                        original Inter bank statement column structure
                      </li>
                      <li>
                        <strong>Multiple Uploads:</strong> Different periods
                        create separate source tables for organization
                      </li>
                      <li>
                        <strong>Data Integrity:</strong> Each table represents a
                        specific time period from Inter bank
                      </li>
                      <li>
                        <strong>Bank Filter Ready:</strong> All tables tagged
                        with &quot;Inter-BR-Account&quot; bank designation for
                        account statements
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h5 className="font-semibold text-sm text-indigo-700">
                      Step 4: Data Aggregation Process
                    </h5>
                    <div className="bg-indigo-50 p-3 rounded-md mt-2 mb-3">
                      <p className="text-xs font-semibold text-indigo-800 mb-2">
                        🔄 Inter Account Page:{" "}
                        <a
                          href="/inter-account"
                          className="text-indigo-600 underline hover:text-indigo-800"
                        >
                          /inter-account
                        </a>
                      </p>
                      <p className="text-xs text-indigo-700">
                        Use the &quot;Update Inter Data&quot; button to
                        aggregate source tables into the unified view.
                      </p>
                    </div>
                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
                      <li>
                        <strong>Navigate:</strong> Go to Inter Account page at{" "}
                        <a
                          href="/inter-account"
                          className="text-indigo-600 underline"
                        >
                          /inter-account
                        </a>
                      </li>
                      <li>
                        <strong>Click Button:</strong> Use &quot;Update Inter
                        Data&quot; button to start aggregation process
                      </li>
                      <li>
                        <strong>Table Detection:</strong> System automatically
                        detects available IN_* source tables
                      </li>
                      <li>
                        <strong>Selection:</strong> Choose which source
                        tables/periods to include in aggregation
                      </li>
                      <li>
                        <strong>Preview:</strong> Review transactions that will
                        be added to the aggregated table
                      </li>
                      <li>
                        <strong>Confirmation:</strong> Confirm aggregation to
                        copy data to Brasil_transactions_agregated_2025
                      </li>
                      <li>
                        <strong>Source Tracking:</strong> Each transaction
                        maintains reference to its original source table
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-teal-500 pl-4">
                    <h5 className="font-semibold text-sm text-teal-700">
                      Step 5: Data Analysis & Visualization
                    </h5>
                    <div className="bg-teal-50 p-3 rounded-md mt-2 mb-3">
                      <p className="text-xs font-semibold text-teal-800 mb-2">
                        📊 Transaction Analysis Tools
                      </p>
                      <p className="text-xs text-teal-700">
                        The Inter Account page automatically filters and
                        displays only Inter-BR-Account bank account
                        transactions.
                      </p>
                    </div>
                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
                      <li>
                        <strong>Auto-Filter:</strong> Page automatically shows
                        only &quot;Inter-BR-Account&quot; transactions from
                        aggregated table
                      </li>
                      <li>
                        <strong>Month Filter:</strong> Filter transactions by
                        specific months for detailed analysis
                      </li>
                      <li>
                        <strong>Category Filter:</strong> Group and filter by
                        transaction categories
                      </li>
                      <li>
                        <strong>Description Search:</strong> Search within
                        transaction descriptions for specific items
                      </li>
                      <li>
                        <strong>Amount Totals:</strong> Real-time calculation of
                        filtered transaction totals
                      </li>
                      <li>
                        <strong>Sorting:</strong> Sort by date, amount, or any
                        other column
                      </li>
                      <li>
                        <strong>Source Traceability:</strong> See which original
                        source table each transaction came from
                      </li>
                      <li>
                        <strong>Chart Navigation:</strong> Access category and
                        overview charts for visual analysis
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <h4 className="font-semibold text-sm text-yellow-800 mb-2">
                  💡 Key Benefits of This Flow:
                </h4>
                <ul className="list-disc list-inside text-xs text-yellow-700 space-y-1">
                  <li>
                    <strong>Data Ownership:</strong> Your financial data stays
                    in your Supabase instance
                  </li>
                  <li>
                    <strong>Flexibility:</strong> Upload statements at your own
                    pace and schedule
                  </li>
                  <li>
                    <strong>Historical Data:</strong> Maintain separate source
                    tables for different periods
                  </li>
                  <li>
                    <strong>Aggregation Control:</strong> Choose which periods
                    to include in analysis
                  </li>
                  <li>
                    <strong>Traceability:</strong> Always know which source
                    table each transaction came from
                  </li>
                  <li>
                    <strong>Security:</strong> Manual process ensures you
                    control what data is uploaded
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Chart Navigation Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Chart Navigation Buttons
              </CardTitle>
              <CardDescription>
                Navigation buttons for accessing data visualization pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Category Chart Button:
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Destination:</strong> ./category/chart
                  </li>
                  <li>
                    <strong>Purpose:</strong> View transaction data grouped by
                    categories
                  </li>
                  <li>
                    <strong>Styling:</strong> Black background with green hover
                    effect and border
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Overview Chart Button:
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Destination:</strong> ./overview/chart
                  </li>
                  <li>
                    <strong>Purpose:</strong> View comprehensive overview of
                    transaction data
                  </li>
                  <li>
                    <strong>Styling:</strong> Consistent with Category Chart
                    button
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Layout:</h4>
                <p className="text-sm text-muted-foreground">
                  Positioned on the right side of the button container,
                  providing easy access to visualization tools while keeping
                  update functions on the left.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter size={20} />
                Transaction Table Component
              </CardTitle>
              <CardDescription>
                Advanced data table with filtering, sorting, and display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Core Features:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Data Source:</strong>{" "}
                    Brasil_transactions_agregated_2025 - an aggregated table
                    containing transactions from multiple source tables
                  </li>
                  <li>
                    <strong>Bank Filter:</strong> Pre-filtered to show
                    &quot;Inter-BR-Account&quot; transactions from the
                    aggregated dataset
                  </li>
                  <li>
                    <strong>Initial Sort:</strong> Date column, descending order
                    (newest first)
                  </li>
                  <li>
                    <strong>Column Visibility:</strong> All columns visible
                    including source_table field showing origin of each
                    transaction
                  </li>
                  <li>
                    <strong>Multi-Source Display:</strong> Shows transactions
                    that originated from different monthly/yearly tables but are
                    now unified
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Filter Options:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Month Filter:</strong> Enabled - filter transactions
                    by specific months
                  </li>
                  <li>
                    <strong>Category Filter:</strong> Enabled - filter by
                    transaction categories
                  </li>
                  <li>
                    <strong>Description Filter:</strong> Enabled - search within
                    transaction descriptions
                  </li>
                  <li>
                    <strong>Total Amount Display:</strong> Enabled - shows sum
                    of filtered transactions
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Available Columns:
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>ID, Created At, Date, Description, Amount, Balance</li>
                  <li>Category, Responsible, Bank, Comment</li>
                  <li>User ID, Source Table</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  User Interactions:
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Sorting:</strong> Click column headers to sort
                    ascending/descending
                  </li>
                  <li>
                    <strong>Filtering:</strong> Use filter inputs to narrow down
                    displayed data
                  </li>
                  <li>
                    <strong>Pagination:</strong> Navigate through large datasets
                  </li>
                  <li>
                    <strong>Total Calculation:</strong> Real-time sum updates
                    based on filters
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Technical Implementation */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Implementation Details</CardTitle>
              <CardDescription>
                Behind-the-scenes technical information about the page
                implementation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  State Management:
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>transactions:</strong> Array of Transaction objects
                    from database
                  </li>
                  <li>
                    <strong>bankInfo:</strong> Object containing bank statistics
                    and metadata
                  </li>
                  <li>
                    <strong>Real-time Updates:</strong> State updates trigger UI
                    re-renders
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Data Processing:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Bank Analysis:</strong> Calculates unique banks,
                    transaction counts, newest dates
                  </li>
                  <li>
                    <strong>Data Filtering:</strong> Filters by user ID for
                    security
                  </li>
                  <li>
                    <strong>Error Handling:</strong> Console logging for
                    database errors
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Security:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Protected Route:</strong> Restricted to specific
                    user ID
                  </li>
                  <li>
                    <strong>Authentication:</strong> Requires valid user session
                  </li>
                  <li>
                    <strong>Data Isolation:</strong> User-specific data
                    filtering
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Dependencies:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Supabase:</strong> Database operations and real-time
                    subscriptions
                  </li>
                  <li>
                    <strong>React Hooks:</strong> useState, useEffect for state
                    and lifecycle management
                  </li>
                  <li>
                    <strong>Authentication Context:</strong> User session
                    management
                  </li>
                  <li>
                    <strong>UI Components:</strong> Custom button, card, table,
                    and hover card components
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
