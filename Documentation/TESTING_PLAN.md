# Update Aggregated Data Testing Plan

## Overview

Both Handelsbanken and AMEX pages now have "Update Aggregated Data" buttons that allow users to preview and update the `Sweden_transactions_agregated_2025` table.

## ✅ COMPLETED IMPLEMENTATION

### 1. Core Components

- **Dialog Component**: `components/ui/dialog.tsx` - Custom modal functionality
- **Database Actions**: `app/actions/updateActions.ts` - All database operations
- **Handelsbanken Button**: `components/UpdateAggregatedButton.tsx` - HB_2025 → aggregated
- **AMEX Button**: `components/UpdateAmexAggregatedButton.tsx` - AM_YYYYMM → aggregated
- **Page Integrations**: Both buttons added to respective pages

### 2. Handelsbanken Functionality

- **Source**: `HB_2025` table
- **Process**: Find highest ID, detect duplicates, show preview, insert with sequential IDs
- **Duplicate Detection**: Based on Amount + Date + Description combination
- **UI Flow**: Idle → Loading → Preview → Updating → Success/Error

### 3. AMEX Functionality

- **Source**: Monthly tables (`AM_YYYYMM` pattern)
- **Process**: Detect available months, allow month selection, preview transactions, insert
- **Month Detection**: Scans 2024-2026 for existing AM\_ tables
- **Duplicate Prevention**: Checks `source_table` field in aggregated table
- **UI Features**: Month selection grid, formatted display names (AM_202505 → "May 2025")

## 🧪 TESTING CHECKLIST

### Phase 1: UI Testing

- [x] ✅ Server running on localhost:3001
- [x] ✅ Handelsbanken page loads with Update button
- [x] ✅ AMEX page loads with Update button
- [ ] 🔄 Click Handelsbanken "Update Aggregated Data" button
- [ ] 🔄 Click AMEX "Update Aggregated Data" button
- [ ] 🔄 Test dialog opening/closing
- [ ] 🔄 Test loading states

### Phase 2: Database Connectivity

- [ ] 🔄 Verify connection to Supabase
- [ ] 🔄 Test `HB_2025` table access
- [ ] 🔄 Test `Sweden_transactions_agregated_2025` table access
- [ ] 🔄 Test AM table detection (AM_202401, AM_202402, etc.)
- [ ] 🔄 Verify user authentication and RLS policies

### Phase 3: Handelsbanken Flow

- [ ] 🔄 Get update preview from HB_2025
- [ ] 🔄 Show transaction count and total amount
- [ ] 🔄 Display date range of new transactions
- [ ] 🔄 Show sample transactions in preview table
- [ ] 🔄 Test confirmation and execution
- [ ] 🔄 Verify success message with inserted count

### Phase 4: AMEX Flow

- [ ] 🔄 Detect available AM tables
- [ ] 🔄 Show already included months vs. available new months
- [ ] 🔄 Month selection UI with formatted names
- [ ] 🔄 Preview selected month's transactions
- [ ] 🔄 Show transaction count and total for selected month
- [ ] 🔄 Test confirmation and execution
- [ ] 🔄 Verify duplicate month prevention

### Phase 5: Error Handling

- [ ] 🔄 Test with non-existent tables
- [ ] 🔄 Test with empty tables
- [ ] 🔄 Test with network errors
- [ ] 🔄 Test with invalid user permissions
- [ ] 🔄 Test duplicate transaction detection
- [ ] 🔄 Test already included month scenarios

### Phase 6: Data Integrity

- [ ] 🔄 Verify sequential ID assignment
- [ ] 🔄 Confirm proper source_table field population
- [ ] 🔄 Check column name mapping (Amount, Date, Description, etc.)
- [ ] 🔄 Validate user_id assignment
- [ ] 🔄 Confirm Bank field assignment ("Handelsbanken" vs "American Express")

## 🔧 KNOWN CONFIGURATION

### Database Tables Expected

- `HB_2025` - Handelsbanken transactions
- `Sweden_transactions_agregated_2025` - Combined transactions
- `AM_202401` through `AM_202412` - AMEX 2024 months (if they exist)
- `AM_202501` through `AM_202512` - AMEX 2025 months (if they exist)
- `AM_202601` through `AM_202612` - AMEX 2026 months (if they exist)

### User Configuration

- User ID: `2b5c5467-04e0-4820-bea9-1645821fa1b7`
- Authentication required for both pages
- RLS policies should allow access to user's own data

### Column Mappings

**Source → Aggregated**:

- `"Amount"` → `"Amount"`
- `"Date"` → `"Date"`
- `"Description"` → `"Description"`
- `"Category"` → `"Category"`
- `"Responsible"` → `"Responsible"` (fixed from "Responsable")
- `"Balance"` → `"Balance"`
- `"Comment"` → `"Comment"`
- `user_id` → `user_id`
- Generated: `id`, `created_at`, `"Bank"`, `source_table`

## 🚀 READY FOR TESTING

The implementation is complete and compiled successfully. The application is running on localhost:3001 with both update buttons integrated into their respective pages. All TypeScript errors have been resolved and the code follows best practices for error handling, type safety, and user experience.

**Next Steps**: Begin testing with the actual database to verify functionality with real data.
