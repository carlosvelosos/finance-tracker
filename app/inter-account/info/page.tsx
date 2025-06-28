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
                Brasil transaction data, allowing users to view, update, and
                analyze their financial information through various interactive
                components and tools.
              </p>
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
                  Provides transparency about which Supabase table is being used
                  as the data source and displays real-time statistics about the
                  loaded transactions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Components:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Table Name:</strong> Shows
                    "Brasil_transactions_agregated_2025" as the source
                  </li>
                  <li>
                    <strong>Transaction Count:</strong> Displays total number of
                    loaded transactions
                  </li>
                  <li>
                    <strong>Bank Statistics:</strong> Shows unique banks and
                    transaction counts per bank
                  </li>
                  <li>
                    <strong>Date Information:</strong> Displays the newest
                    transaction date for each bank
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
                    <strong>Function:</strong> Updates Inter Bank Brasil
                    specific transaction data
                  </li>
                  <li>
                    <strong>Hover Card:</strong> Shows table selection process
                    and Inter-specific workflows
                  </li>
                  <li>
                    <strong>Process:</strong> Table Detection → Selection →
                    Preview → Confirmation → Processing
                  </li>
                  <li>
                    <strong>Automatic:</strong> Table detection, preview
                    loading, formatting, metadata updates
                  </li>
                  <li>
                    <strong>Manual:</strong> Start process, select tables
                    (IN_2023, IN_2024, etc.), review, confirm
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
                    Brasil_transactions_agregated_2025 table
                  </li>
                  <li>
                    <strong>Bank Filter:</strong> Pre-filtered to show
                    "Inter-BR" transactions
                  </li>
                  <li>
                    <strong>Initial Sort:</strong> Date column, descending order
                    (newest first)
                  </li>
                  <li>
                    <strong>Column Visibility:</strong> All columns visible
                    (hiddenColumns: [])
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
