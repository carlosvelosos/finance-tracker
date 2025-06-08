# Inter Bank Data Aggregation System - Complete Documentation

## Overview

The Inter Bank Data Aggregation System is a comprehensive feature that enables automated aggregation of transaction data from multiple Inter bank source tables following specific naming patterns (`IN_YYYY` and `IN_YYYYMM`) into the unified `Brasil_transactions_agregated_2025` table. This system provides users with a seamless interface to discover, preview, and aggregate Inter bank transaction data with full duplicate prevention and error handling.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Component Overview](#component-overview)
4. [Backend Functions](#backend-functions)
5. [User Interface Flow](#user-interface-flow)
6. [Features](#features)
7. [Error Handling](#error-handling)
8. [Integration](#integration)
9. [Usage Guide](#usage-guide)
10. [Technical Implementation](#technical-implementation)

## System Architecture

### High-Level Flow

```
1. User clicks "Update Inter Data" button
2. System scans for available Inter tables (IN_YYYY, IN_YYYYMM patterns)
3. System checks which tables are already included in aggregated table
4. User selects which new tables to aggregate
5. System previews transactions from selected tables
6. User confirms and system executes batch aggregation
7. System provides success feedback with detailed results
```

### Pattern Recognition

The system automatically detects Inter bank tables using two patterns:

- **Yearly Tables**: `IN_YYYY` (e.g., `IN_2024`, `IN_2025`)
- **Monthly Tables**: `IN_YYYYMM` (e.g., `IN_202401`, `IN_202412`)

### Year Range Scanning

The system scans tables across a 4-year window:

- Current year - 2
- Current year - 1
- Current year
- Current year + 1

Example: In 2025, it scans for tables from 2023 to 2026.

## Database Schema

### Source Tables

- **Pattern 1**: `IN_YYYY` (yearly aggregated data)
- **Pattern 2**: `IN_YYYYMM` (monthly breakdown data)

### Target Table

- **Table**: `Brasil_transactions_agregated_2025`
- **Purpose**: Unified aggregated transaction data for Brasil accounts

### Key Fields

```sql
id                INTEGER PRIMARY KEY
created_at        TIMESTAMP
Date              DATE
Description       TEXT
Amount            DECIMAL
Balance           DECIMAL
Category          TEXT
Responsible       TEXT
Bank              TEXT
Comment           TEXT
user_id           UUID
source_table      TEXT -- Tracks source table for audit and duplicate prevention
```

### Tracking Field

The `source_table` field is crucial for:

- **Duplicate Prevention**: Ensures tables aren't processed twice
- **Audit Trail**: Tracks which source table each transaction came from
- **Rollback Capability**: Enables future selective data removal

## Component Overview

### UpdateInterAggregatedButton Component

**File**: `components/UpdateInterAggregatedButton.tsx`

**Purpose**: Main UI component that provides the complete Inter aggregation workflow.

**Key Features**:

- Auto-detection of available Inter tables
- Multi-table selection with checkboxes
- Real-time transaction preview
- Progress tracking through multiple states
- Brazilian currency formatting (BRL)
- Comprehensive error handling

**Component States**:

```typescript
type UpdateState =
  | "idle" // Initial state, button ready
  | "loading" // Scanning for available tables
  | "preview" // Showing table selection and preview
  | "updating" // Executing aggregation
  | "success" // Successful completion
  | "error"; // Error occurred
```

### State Management

```typescript
const [state, setState] = useState<UpdateState>("idle");
const [preview, setPreview] = useState<InterUpdatePreview | null>(null);
const [result, setResult] = useState<InterUpdateResult | null>(null);
const [selectedTables, setSelectedTables] = useState<string[]>([]);
const [previewTransactions, setPreviewTransactions] = useState<Transaction[]>(
  [],
);
```

## Backend Functions

### 1. getInterUpdatePreview()

**Purpose**: Scans for available Inter tables and identifies which are already included.

**Process**:

1. Query `Brasil_transactions_agregated_2025` for existing `source_table` entries with `IN_%` pattern
2. Scan for `IN_YYYY` tables across year range
3. Scan for `IN_YYYYMM` tables across year/month combinations
4. Filter out already included tables
5. Return summary of included vs. available tables

**Return Type**:

```typescript
interface InterUpdatePreview {
  sourceTablesIncluded: string[]; // Already processed tables
  availableNewTables: string[]; // New tables ready for processing
}
```

### 2. previewInterTableTransactions()

**Purpose**: Retrieves and combines transaction previews from selected tables.

**Process**:

1. Query each selected table for all transaction data
2. Add `source_table` metadata to each transaction
3. Combine and sort all transactions by date
4. Return unified transaction list for preview

**Parameters**:

- `tableNames: string[]` - Array of selected table names

**Return Type**: `Transaction[]`

### 3. executeInterUpdate()

**Purpose**: Performs the actual aggregation of selected tables into the target table.

**Process**:

1. Validate selected tables list
2. For each table:
   - Check if already included (double-check for safety)
   - Get next available ID in aggregated table
   - Fetch all transactions from source table
   - Transform data format and add metadata
   - Insert transactions with sequential IDs
   - Track processing results
3. Return comprehensive results

**Parameters**:

- `selectedTables: string[]` - Array of table names to process

**Return Type**:

```typescript
interface InterUpdateResult {
  success: boolean;
  message: string;
  transactionsAdded: number;
  tablesIncluded?: string[];
}
```

### ID Management

The system maintains proper ID sequencing by:

1. Finding the highest existing ID in the aggregated table
2. Calculating the next available ID considering already processed transactions in the current batch
3. Assigning sequential IDs to ensure no conflicts

### Bank Assignment

All Inter transactions are automatically assigned:

- **Bank**: `"Inter-BR"`
- **Responsible**: `"Carlos"`
- **Category**: `"Uncategorized"` (if not provided)

## User Interface Flow

### 1. Idle State

- Green "Update Inter Data" button visible
- Button shows Plus icon and "Update Inter Data" text

### 2. Loading State

- Modal dialog opens
- Spinning loader with "Analyzing Inter tables..." message
- Button shows "Loading Preview..." with spinner

### 3. Preview State

The modal displays several sections:

#### A. Inter Tables Summary Card

- **Already Included Tables**: Count and list of processed tables
- **Available New Tables**: Count and list of ready-to-process tables
- Two-column responsive grid layout

#### B. Table Selection Card (if new tables available)

- **Checkbox Grid**: 2-4 column responsive layout
- **Auto-Selection**: All available tables pre-selected
- **Dynamic Preview**: Updates as tables are selected/deselected
- **Selection Summary**: Shows count of selected tables and preview transactions

#### C. Transaction Preview Card (if transactions available)

- **Sample Display**: First 20 transactions from selected tables
- **Formatted Data**: Brazilian currency (BRL) and date formatting
- **Transaction Details**: Description, date, amount, source table, bank
- **Color Coding**: Green for positive amounts, red for negative
- **Scrollable**: Max height with overflow handling
- **Overflow Indicator**: Shows "...and X more transactions" for large datasets

#### D. No New Tables State

- **Success Icon**: Green checkmark
- **Clear Message**: "No new Inter tables to aggregate"
- **Explanation**: All available tables already included

### 4. Updating State

- **Progress Indicator**: Spinning loader with "Updating database..." message
- **Disabled Button**: Shows "Updating..." with spinner

### 5. Success State

- **Success Icon**: Large green checkmark
- **Success Message**: Details of operation results
- **Statistics**: Number of transactions added from how many tables
- **Table List**: Names of successfully processed tables

### 6. Error State

- **Error Icon**: Red X circle
- **Error Message**: Detailed error description
- **Retry Option**: Close button to return to idle state

## Features

### 1. Automatic Table Detection

- **Pattern Recognition**: Automatically finds `IN_YYYY` and `IN_YYYYMM` tables
- **Range Scanning**: Checks multiple years automatically
- **Existence Verification**: Only lists tables that actually exist in database

### 2. Duplicate Prevention

- **Source Table Tracking**: Uses `source_table` field to prevent reprocessing
- **Pre-Processing Check**: Verifies table hasn't been included before aggregation
- **Runtime Check**: Double-checks during execution for safety

### 3. Multi-Table Selection

- **Checkbox Interface**: Easy selection of multiple tables
- **Auto-Selection**: All available tables pre-selected for convenience
- **Dynamic Preview**: Real-time update of preview as selection changes

### 4. Transaction Preview

- **Sample Display**: Shows representative transactions before commitment
- **Formatted Display**: Brazilian currency and date formatting
- **Source Attribution**: Shows which table each transaction comes from
- **Scrollable Interface**: Handles large datasets gracefully

### 5. Brazilian Localization

- **Currency Formatting**: Uses `pt-BR` locale for BRL currency display
- **Date Formatting**: Brazilian date format (DD/MM/YYYY)
- **Decimal Handling**: Proper Brazilian number formatting

### 6. Progress Tracking

- **Multi-State UI**: Clear indication of current operation phase
- **Loading Indicators**: Spinners and progress messages
- **Result Feedback**: Detailed success/error information

### 7. Error Recovery

- **Graceful Degradation**: Continues processing other tables if one fails
- **Error Reporting**: Detailed error messages for troubleshooting
- **Retry Capability**: Users can close and retry operations

## Error Handling

### Frontend Error Handling

```typescript
// Network/API errors
try {
  const previewData = await getInterUpdatePreview();
  setPreview(previewData);
} catch (err) {
  setError(err instanceof Error ? err.message : "Failed to load preview");
  setState("error");
}

// Table selection errors
try {
  const transactions = await previewInterTableTransactions(newSelectedTables);
  setPreviewTransactions(transactions);
} catch (err) {
  console.error("Error loading preview transactions:", err);
  setPreviewTransactions([]); // Graceful fallback
}
```

### Backend Error Handling

```typescript
// Individual table processing errors
for (const tableName of selectedTables) {
  try {
    // Process table
  } catch (error) {
    console.error(`Error processing table ${tableName}:`, error);
    continue; // Continue with other tables
  }
}

// Overall operation error handling
try {
  // Main processing logic
} catch (error) {
  return {
    success: false,
    message: `Error updating aggregated data: ${error.message}`,
    transactionsAdded: 0,
  };
}
```

### Error Types Handled

1. **Database Connection Errors**: Network issues, authentication failures
2. **Table Not Found**: Selected table doesn't exist or was deleted
3. **Permission Errors**: User lacks access to source or target tables
4. **Data Format Errors**: Unexpected data structure in source tables
5. **Transaction Conflicts**: ID conflicts or constraint violations
6. **Memory Issues**: Large dataset processing problems

## Integration

### Page Integration

**File**: `app/inter-account/page.tsx`

The button is integrated into the Inter Account page alongside existing functionality:

```tsx
{
  /* Chart Buttons */
}
<div className="flex justify-between items-center mb-4">
  <div className="flex space-x-3">
    <UpdateAggregatedButton /> {/* Existing HB functionality */}
    <UpdateInterAggregatedButton /> {/* New Inter functionality */}
  </div>
  <div className="flex space-x-4">{/* Chart navigation buttons */}</div>
</div>;
```

### Enhanced Bank Information Display

The page also displays transaction counts per bank:

```tsx
<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Transaction count per bank including Inter-BR */}
  {Object.entries(bankInfo.transactionCountsByBank).map(([bank, count]) => (
    <p key={bank} className="text-xs text-gray-500">
      <strong>{bank}:</strong> {count} transactions
    </p>
  ))}
</div>
```

### UI Dependencies

- **Radix UI Checkbox**: `@radix-ui/react-checkbox` for accessible checkboxes
- **Lucide React Icons**: Loading, success, error, and action icons
- **Custom UI Components**: Cards, dialogs, buttons using project's design system

## Usage Guide

### For End Users

#### Step 1: Access the Feature

1. Navigate to the Inter Account page
2. Locate the "Update Inter Data" button (green button with plus icon)
3. Click to start the aggregation process

#### Step 2: Review Available Tables

1. The system will automatically scan for available Inter tables
2. Review the summary showing:
   - Already included tables (already processed)
   - Available new tables (ready for processing)

#### Step 3: Select Tables to Aggregate

1. All available tables are pre-selected by default
2. Uncheck any tables you don't want to include
3. Watch the preview update as you change selections

#### Step 4: Review Transaction Preview

1. Review the sample transactions shown
2. Verify the data looks correct
3. Note the transaction count and source tables

#### Step 5: Confirm and Execute

1. Click "Confirm Update" button
2. Wait for processing to complete
3. Review the success message and statistics

#### Step 6: Verify Results

1. Check the transaction table for new data
2. Verify transaction counts in the bank summary
3. Confirm data integrity and completeness

### For Developers

#### Adding New Table Patterns

To support additional Inter table patterns:

1. **Update Pattern Detection** in `getInterUpdatePreview()`:

```typescript
// Add new pattern scanning logic
for (const year of yearsToCheck) {
  const tableName = `IN_NEW_PATTERN_${year}`;
  // ... rest of detection logic
}
```

2. **Update UI Labels** if needed in the component
3. **Test thoroughly** with the new pattern

#### Modifying Year Range

To scan different year ranges:

```typescript
// In getInterUpdatePreview()
const yearsToCheck = [
  currentYear - 3, // Extend backwards
  currentYear - 2,
  currentYear - 1,
  currentYear,
  currentYear + 1,
  currentYear + 2, // Extend forwards
];
```

#### Customizing Bank Assignment

To change default bank assignment:

```typescript
// In executeInterUpdate()
Bank: transaction.Bank || "Inter-BR",  // Change default here
```

## Technical Implementation

### Database Operations

The system uses Supabase client for all database operations:

```typescript
// Table existence check
const { error } = await supabase.from(tableName).select("id").limit(1);

// Transaction query
const { data: transactions, error } = await supabase
  .from(tableName)
  .select(
    `
    id, created_at, "Date", "Description", "Amount", 
    "Balance", "Category", "Responsible", "Bank", 
    "Comment", user_id
  `,
  )
  .order('"Date"');

// Batch insert
const { error: insertError } = await supabase
  .from("Brasil_transactions_agregated_2025")
  .insert(transactionsToInsert);
```

### Performance Considerations

#### Memory Management

- **Streaming Processing**: Tables processed one at a time
- **Limited Preview**: Only first 20 transactions shown in UI
- **Efficient Queries**: Select only needed columns

#### Network Optimization

- **Batch Operations**: Insert all transactions from a table at once
- **Error Isolation**: Continue processing other tables if one fails
- **Connection Reuse**: Single Supabase client instance

#### Scalability

- **Year Range Limits**: Prevents scanning infinite table ranges
- **Table Count Limits**: Practical limits on simultaneous table processing
- **Transaction Limits**: Handles large tables gracefully

### Security Considerations

#### Authentication

- **User ID Verification**: All operations require authenticated user
- **Protected Routes**: Page access controlled by authentication
- **User ID Assignment**: Transactions tagged with current user's ID

#### Data Integrity

- **Source Tracking**: Every transaction tagged with source table
- **Duplicate Prevention**: Multiple layers of duplicate checking
- **Transaction Atomicity**: Each table processing is atomic

#### Input Validation

- **Table Name Validation**: Only expected patterns accepted
- **Data Type Validation**: Proper typing throughout the system
- **Error Boundaries**: Graceful handling of malformed data

### Monitoring and Logging

#### Console Logging

```typescript
console.log(
  `Successfully added ${newTransactions.length} transactions from ${tableName}`,
);
console.error("Error in getInterUpdatePreview:", error);
```

#### User Feedback

- Real-time progress updates
- Detailed success/error messages
- Transaction count reporting

#### Audit Trail

- Source table tracking in aggregated data
- Processing timestamp in `created_at` field
- User ID association for all transactions

## Conclusion

The Inter Bank Data Aggregation System represents a comprehensive solution for managing Inter bank transaction data within the finance tracker application. It provides automated discovery, user-controlled selection, real-time preview, and safe execution of data aggregation operations.

The system's design prioritizes data integrity, user experience, and operational safety while maintaining flexibility for future enhancements. Its modular architecture allows for easy extension to support additional bank types or table patterns as needed.

Key strengths include:

- **Automated Discovery**: No manual table management required
- **Safe Operations**: Multiple layers of duplicate prevention
- **User Control**: Clear preview and confirmation workflow
- **Error Resilience**: Graceful handling of various failure modes
- **Brazilian Localization**: Proper formatting for regional requirements
- **Scalable Design**: Efficient processing of large datasets

This documentation serves as both a user guide and technical reference for understanding, using, and maintaining the Inter aggregation functionality.
