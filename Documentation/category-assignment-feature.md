# Category Assignment Feature (Step 2)

## Overview

Automatic category suggestion system that analyzes newly uploaded transactions against existing categorized data using similarity matching algorithms.

**🆕 Universal Multi-Table Learning**: The system now analyzes **ALL transaction tables across ALL banks** to provide the most accurate category suggestions. This is especially powerful for recurring expenses (like Spotify, Netflix) that may appear on different bank accounts.

## User Flow

### Step 1: Merge Conflict Resolution

1. User uploads bank statement file
2. System analyzes for duplicates (4-level matching: 100%, 90%, 70%, 50%)
3. User reviews and resolves conflicts in MergeConflictDialog
4. User clicks **"Commit Transactions"**
5. Data uploads to Supabase

### Step 2: Category Assignment (NEW)

6. System automatically analyzes newly uploaded transactions
7. **Universal analysis**: System searches ALL transaction tables across ALL banks for categorized data
8. CategoryAssignmentDialog opens with suggestions
9. User reviews categories with confidence scoring:
   - 🟢 **High Confidence (>85%)**: Auto-accepted by default
   - 🟡 **Medium Confidence (50-85%)**: Needs review
   - 🔴 **Low Confidence (<50%)**: Manual required
   - ⚪ **No Match (0%)**: Manual required
10. User actions:
    - **Accept**: Use suggested category
    - **Skip**: Leave as "Unknown"
    - **Edit**: Manually select different category
11. User clicks:
    - **← Back to Upload**: Return to upload page (categories not saved)
    - **Skip Categorization**: Skip all, keep as "Unknown"
    - **Apply Categories →**: Save all decisions to database

## Technical Architecture

### Files Created

1. **app/actions/categoryAnalysis.ts** (338 lines)

   - Backend logic for category matching
   - Similarity algorithms with confidence scoring
   - Batch update operations

2. **components/CategoryAssignmentDialog.tsx** (480 lines)
   - UI component for category review and assignment
   - Side-by-side comparison view (planned)
   - Inline status messages (no toasts)

### Files Modified

3. **app/upload/page.tsx**

   - Added category analysis trigger after successful upload
   - Integrated CategoryAssignmentDialog into upload flow
   - Added handlers: handleCategoryComplete, handleCategorySkip

4. **Documentation/supabase-get-tables-by-prefix-function.sql**
   - Supabase database function for multi-table queries
   - Must be installed in your Supabase database

## Universal Multi-Table Category Learning

### Concept

The system uses **ALL transaction tables** from your database as training data, regardless of bank or time period.

**Why this is powerful:**

✅ **Cross-bank learning**: Same expense (e.g., "Spotify Premium") appears on multiple banks  
✅ **Historical depth**: Years of categorized data improve accuracy  
✅ **Consistency**: Same merchant always gets the same category suggestion  
✅ **Better coverage**: More examples = more accurate matching

**Example Scenario:**

- You have tables: `SEB_202501`, `INMC_202502`, `HB_2024`, `Brasil_transactions_agregated_2025`
- You categorized "Netflix" in `SEB_202501` as "Streaming"
- You categorized "Netflix" in `INMC_202502` as "Streaming"
- Now uploading to `HB_2024` with a "Netflix" transaction
- **System finds**: 2 examples of "Netflix" → "Streaming" across different banks
- **Result**: 95%+ confidence! Automatic accurate suggestion across banks and time periods

### How It Works

1. **Discovers all tables**: Uses `get_user_accessible_tables()` RPC function (same as global_2 page)
2. **Fetches categorized data**: Queries ALL tables for transactions with meaningful categories
3. **Similarity matching**: Compares new transactions against entire historical dataset
4. **Suggests categories**: Highest confidence match becomes the suggestion

**No filtering, no limitations** - the more data you have categorized, the better the suggestions!

### Database Function Required

Multi-table matching uses the **existing** RPC function `get_user_accessible_tables()` that's already used by the `global_2` page.

**No additional installation needed!** If you can access the global_2 aggregated transactions page, the function is already installed.

The function returns all accessible transaction tables across all banks and time periods.

### Fallback Behavior

If the database function is not available (unlikely, since it's used by global_2 page), the system automatically falls back to **single-table mode**:

- ⚠️ Warning logged in console
- Only the current table is analyzed
- Feature continues to work (just with less historical data)
- No errors or crashes

### Performance Considerations

**Query Efficiency:**

- Single RPC call to get table list
- One query per related table to fetch categorized transactions
- All similarity matching done in-memory on client

**Expected Performance:**

- 1-3 tables: ~200-500ms
- 4-6 tables: ~500ms-1s
- 7-12 tables: ~1-2s
- 12+ tables: May need optimization (consider limiting to recent tables)

**Optimization Tips:**

- System only fetches transactions with meaningful categories (not "Unknown")
- Consider limiting to last 12 months of tables if performance becomes an issue
- Client-side caching could be implemented for repeated analyses

## Category Matching Algorithm

### Scoring System

```typescript
// 1. Exact description match
if (descriptions identical) → 100% confidence

// 2. String similarity (Jaro-Winkler)
baseSimilarity = jaroWinkler(desc1, desc2) * 100  // 0-100

// 3. Amount match bonus
if (amounts identical) → +15 points

// 4. Date proximity bonus
if (within same month) → +10 points
if (within same year) → +5 points

// 5. Final score (capped at 100)
finalScore = min(baseSimilarity + bonuses, 100)
```

### Match Reasons

- **exact** (100%): Identical description
- **high** (>85%): Very similar transaction
- **partial** (50-85%): Somewhat similar
- **amount** (>0%): Same amount, different description
- **none** (<50%): No good match found

## Data Structures

### CategoryMatch Interface

```typescript
interface CategoryMatch {
  newTransaction: Transaction;
  suggestedCategory: string;
  confidence: number; // 0-100
  similarTransactions: Transaction[];
  matchReason: "exact" | "high" | "partial" | "amount" | "none";
}
```

### CategoryAnalysis Interface

```typescript
interface CategoryAnalysis {
  tableName: string;
  matches: CategoryMatch[];
  stats: {
    highConfidence: number; // >85%
    mediumConfidence: number; // 50-85%
    lowConfidence: number; // 1-49%
    noMatch: number; // 0%
    alreadyCategorized: number;
  };
  availableCategories: string[];
}
```

### CategoryDecision Interface

```typescript
interface CategoryDecision {
  transactionId: number;
  category: string;
  action: "accept" | "edit" | "skip";
}
```

## Key Functions

### analyzeCategoryMatches()

```typescript
async function analyzeCategoryMatches(
  tableName: string,
  newTransactions: Transaction[],
): Promise<CategoryAnalysis>;
```

- Fetches existing categorized transactions from Supabase
- Compares each new transaction against existing data
- Returns CategoryAnalysis with suggestions

### findBestCategoryMatch()

```typescript
function findBestCategoryMatch(
  newTxn: Transaction,
  existingTransactions: Transaction[],
): CategoryMatch;
```

- Finds most similar transaction using similarity scoring
- Calculates confidence percentage
- Returns best match with reason

### applyCategoryDecisions()

```typescript
async function applyCategoryDecisions(
  tableName: string,
  decisions: Map<number, CategoryDecision>,
): Promise<{ success: boolean; updated: number; message: string }>;
```

- Batch updates categories in Supabase
- Only updates transactions with 'accept' or 'edit' actions
- Skips transactions with 'skip' action

### initializeCategoryDecisions()

```typescript
function initializeCategoryDecisions(
  matches: CategoryMatch[],
): Map<number, CategoryDecision>;
```

- Auto-accepts high confidence matches (>85%)
- Sets others to 'skip' by default
- Returns default decision map

## UI Features

### Summary Cards

- 🟢 High Confidence count
- 🟡 Medium Confidence count
- 🔴 Low/No Match count
- 🔵 To Apply count

### Bulk Actions

- **Accept All High Confidence**: Auto-accept all >85% matches
- **Skip All Low Confidence**: Skip all <50% matches

### Filter Options

- All Matches
- High Confidence only
- Medium Confidence only
- Low Confidence only
- No Match only

### Search

- Filter by description, date, or category

### Inline Status Display

- Loading: Blue with progress bar
- Success: Green confirmation
- Error: Red with error details
- Warning: Yellow for confirmations
- Info: Gray for informational messages

## Error Handling

### Graceful Degradation

- If category analysis fails, upload still succeeds
- User sees: "Upload Successful! (Category analysis skipped due to error)"
- Categories remain as "Unknown" - can be manually categorized later

### Edge Cases

1. **No existing categorized data**: All matches will be 0% confidence
2. **All transactions already categorized**: Step 2 skipped, success message shown
3. **Database errors**: Caught and displayed inline (no toasts)
4. **Empty analysis**: Step 2 dialog not shown

## Future Enhancements

### Phase 2 Features (Not Yet Implemented)

1. **Side-by-side comparison view**

   - Left table: Similar existing transactions with categories
   - Right table: New transaction with suggested category
   - Visual alignment like MergeConflictDialog

2. **Edit dropdown per row**

   - Inline category selection from available categories
   - Real-time decision tracking

3. **Machine learning integration**

   - Train model on user corrections
   - Improve suggestions over time

4. **Category rules**

   - User-defined rules (e.g., "Description contains 'Spotify' → Music")
   - Rule priority system

5. **Bulk edit**
   - Select multiple transactions
   - Apply same category to all selected

## Testing Guide

### Test Case 1: High Confidence Match

1. Upload file with transaction: "Spotify Premium"
2. Ensure existing transaction: "Spotify Premium" categorized as "Music"
3. Expected: 100% confidence, auto-accepted, category = "Music"

### Test Case 2: Medium Confidence Match

1. Upload file with transaction: "ICA Supermarket Stockholm"
2. Ensure existing transaction: "ICA Supermarket Göteborg" categorized as "Groceries"
3. Expected: 70-85% confidence, needs review, suggested category = "Groceries"

### Test Case 3: No Match

1. Upload file with completely new merchant never seen before
2. Expected: 0% confidence, manual categorization required

### Test Case 4: Skip Categorization

1. Complete Step 1 (merge conflicts)
2. In Step 2, click "Skip Categorization"
3. Confirm skip
4. Expected: All transactions remain "Unknown", success message shown

### Test Case 5: Apply Categories

1. Complete Step 1 (merge conflicts)
2. In Step 2, review suggestions
3. Accept some, edit some, skip some
4. Click "Apply Categories →"
5. Expected: Database updated with decisions, success message shown

### Test Case 6: Multi-Table Learning (NEW)

**Setup:**

1. Create tables: `SEB_202501`, `SEB_202502`, `SEB_202503`
2. In `SEB_202501`, add transaction: "Spotify" → Category: "Music"
3. In `SEB_202502`, add transaction: "Netflix" → Category: "Streaming"
4. Upload new file for March (will go to `SEB_202503` or create new `SEB_202504`)

**Test Scenarios:**

**A. With Database Function Installed:**

1. Upload file with transactions: "Spotify Premium" and "Netflix Subscription"
2. Check browser console logs
3. Expected console output:
   ```
   Found 3 related tables for prefix 'SEB_': ['SEB_202501', 'SEB_202502', 'SEB_202503']
   Analyzing categories using 3 table(s): ['SEB_202501', 'SEB_202502', 'SEB_202503']
   Found 1 categorized transactions in 'SEB_202501'
   Found 1 categorized transactions in 'SEB_202502'
   Found 0 categorized transactions in 'SEB_202503'
   ```
4. Expected results:
   - "Spotify Premium" → 85-100% confidence, suggested "Music"
   - "Netflix Subscription" → 85-100% confidence, suggested "Streaming"

**B. Without Database Function (Fallback Mode):**

1. Don't install the SQL function
2. Upload same file
3. Expected console output:
   ```
   RPC function 'get_tables_by_prefix' not found, falling back to single table
   To enable multi-table category matching, create this function...
   ```
4. Expected behavior:
   - Still works, but only looks at current table
   - If current table has no categorized data → 0% confidence matches
   - Feature gracefully degrades

**C. Performance Test:**

1. Create 6+ tables with the same prefix (e.g., `SEB_202501` through `SEB_202506`)
2. Add 50+ categorized transactions in each table
3. Upload new file
4. Monitor network tab and console
5. Expected: Should complete in under 2 seconds

## Performance Considerations

### Database Queries (Updated for Multi-Table)

**Single Table Mode:**

- 1 query to fetch categorized transactions
- Typical: 50-500 transactions, ~100-200ms

**Multi-Table Mode:**

- 1 RPC call to get table list (~50ms)
- N queries (one per related table) to fetch categorized transactions
- 3 tables: ~300-600ms total
- 6 tables: ~600ms-1.2s total
- 12 tables: ~1.2-2.5s total

**Batch Operations:**

- Single batch update query when applying decisions
- Applies all accepted/edited categories in one transaction

### Client-Side Processing

- String matching algorithms run on client
- Multi-table: May process 500-3000+ transactions from historical data
- Jaro-Winkler similarity: ~0.01ms per comparison
- Typical performance: 1000 comparisons in ~10-20ms
- Bottleneck: Network queries, not similarity matching

### Optimization Opportunities

1. **Cache historical data** (not yet implemented)

   - Store categorized transactions in browser memory
   - Invalidate cache when user adds/edits categories
   - Could reduce queries from N to 0 on subsequent uploads

2. **Limit to recent tables** (not yet implemented)

   - Only fetch last 6-12 months of tables
   - Add date range filter to `get_tables_by_prefix()`
   - Reduces query count for banks with 3+ years of data

3. **Database optimizations**

   - Add index on `Category` column for faster filtering
   - Add index on `Description` for potential server-side matching
   - Consider materialized view of all categorized transactions

4. **Server-side similarity matching** (future enhancement)

   - Move string matching to PostgreSQL using trigram similarity
   - Would reduce client processing but increase database load
   - Example: `SELECT *, similarity(Description, 'Spotify') AS score`

5. **Parallel queries** (not yet implemented)
   - Use `Promise.all()` to fetch from multiple tables simultaneously
   - Could reduce total time by 50-70%
   - Trade-off: More concurrent database connections

## Related Documentation

- [Conflict Analysis System](./rpc-function-explanation.md)
- [String Matching Utilities](./references.md)
- [Upload Flow Overview](./webapp-user-guide.md)
- [Design Requirements](./TESTING_PLAN.md)
