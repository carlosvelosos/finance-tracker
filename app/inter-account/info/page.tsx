"use client";

import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
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
                    "Brasil_transactions_agregated_2025" - the unified table
                    containing data from multiple source tables
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
                        Source Tables (Monthly/Yearly):
                      </strong>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>
                          <code>IN_2023</code> - All Inter transactions for 2023
                        </li>
                        <li>
                          <code>IN_2024</code> - All Inter transactions for 2024
                        </li>
                        <li>
                          <code>IN_202401</code> - Inter transactions for
                          January 2024
                        </li>
                        <li>
                          <code>IN_202402</code> - Inter transactions for
                          February 2024
                        </li>
                        <li>... (and so on for other months/years)</li>
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
                    a 'source_table' field
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
                    "Inter-BR" transactions from the aggregated dataset
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
