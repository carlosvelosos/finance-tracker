# Merge Conflict Resolution Feature - Design Requirements

**Feature:** Git-style merge conflict resolution for transaction uploads  
**Date:** November 2, 2025  
**Status:** Implementation Phase

---

## Overview

Implement a visual conflict resolution system that allows users to review potential duplicate transactions before committing them to the database. Similar to git merge conflicts, users see a side-by-side comparison with color-coded transactions and can decide individually which transactions to add or skip.

---

## User Experience Flow

### **Step 1: Initial Upload**

1. User navigates to Upload page (`/upload`)
2. Selects bank from dropdown (e.g., "Handelsbanken-SE")
3. Selects one or more CSV/Excel files
4. Optionally checks "Auto-skip exact duplicates" (new checkbox)
5. Clicks "Upload" button

### **Step 2: File Processing & Analysis**

1. App processes file(s) as usual (parsing, bank-specific transformation)
2. **NEW:** Instead of direct upload, app analyzes for conflicts:

   - Fetches existing data from target table (e.g., `HB_2025`)
   - Compares each new transaction against existing ones
   - Categorizes transactions:
     - **Safe to Add**: No matches found
     - **Conflicts**: Potential duplicates detected (4 levels)
     - **Auto-skipped**: Exact duplicates (if auto-resolve enabled)

3. Shows progress indicator: "Analyzing conflicts..."

### **Step 3: Merge Conflict Dialog** (NEW)

#### Dialog Opens If:

- Conflicts found, OR
- Safe transactions to add, OR
- Both

#### Dialog Does NOT Open If:

- All transactions are exact duplicates AND auto-skip is enabled
- Shows toast: "No new transactions to add. All X transactions already exist."

#### Dialog Layout:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Review Upload Conflicts - HB_2025                                   [X]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Found potential duplicates. Review and decide which to add.             │
│                                                                           │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐          │
│  │ 15 New       │ 8 Conflicts  │ 5 Skipped    │ 247 Existing │          │
│  │ (Green)      │ (Yellow)     │ (Gray)       │ (Blue)       │          │
│  └──────────────┴──────────────┴──────────────┴──────────────┘          │
│                                                                           │
│  Bulk Actions:                                                           │
│  [Add All Safe] [Skip All Conflicts] [Reset All Decisions]              │
│                                                                           │
│  Filter: [All ▼] [Safe] [Conflicts] [Skipped]    Sort: [Date ▼]        │
│  Search: [_________________________]                                     │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ LEFT SIDE: Current Database                                        │ │
│  │ ┌────────────────────────────────────────────────────────────────┐ │ │
│  │ │ HB_2025 (247 transactions)                                     │ │ │
│  │ │                                                                 │ │ │
│  │ │ [Blue background] Existing transactions                        │ │ │
│  │ │ [Yellow highlight] Potential duplicates of new data            │ │ │
│  │ │                                                                 │ │ │
│  │ │ 2025-04-30 | LÖN | 33917.00              [ID: 145]            │ │ │
│  │ │ 2025-04-30 | TELIA BREDBAND | -749.00    [ID: 146] ← conflict │ │ │
│  │ │ 2025-04-29 | American Expre | -14535.15  [ID: 144]            │ │ │
│  │ │ ...                                                             │ │ │
│  │ └────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ RIGHT SIDE: New Upload                                             │ │
│  │ ┌────────────────────────────────────────────────────────────────┐ │ │
│  │ │ handelsbanken-2025.xlsx (23 transactions)                      │ │ │
│  │ │                                                                 │ │ │
│  │ │ ── Safe to Add (15) ──────────────────────────────────────────│ │ │
│  │ │ [Green bg] 2025-05-01 | LÖN | 33917.00            [✓ Add]     │ │ │
│  │ │ [Green bg] 2025-05-02 | SPOTIFY | -119.00         [✓ Add]     │ │ │
│  │ │ ...                                                             │ │ │
│  │ │                                                                 │ │ │
│  │ │ ── Conflicts (8) ─────────────────────────────────────────────│ │ │
│  │ │ [Yellow bg, red border-left]                                   │ │ │
│  │ │ ⚠️ 2025-04-30 | TELIA BREDBAND | -749.00                      │ │ │
│  │ │    100% match - Exact duplicate                                │ │ │
│  │ │    Similar to DB ID: 146                                       │ │ │
│  │ │    [✓ Add Anyway] [✗ Skip] ← user decides                     │ │ │
│  │ │    ▼ View 1 similar transaction                                │ │ │
│  │ │       [Blue bg] 2025-04-30 | TELIA BREDBAND | -749.00 [ID:146]│ │ │
│  │ │                                                                 │ │ │
│  │ │ [Yellow bg, orange border-left]                                │ │ │
│  │ │ ⚠️ 2025-04-28 | TELIA | -749.00                               │ │ │
│  │ │    90% match - Same date/amount, similar description           │ │ │
│  │ │    Similar to DB ID: 146                                       │ │ │
│  │ │    [✓ Add Anyway] [✗ Skip]                                    │ │ │
│  │ │                                                                 │ │ │
│  │ │ [Yellow bg, yellow border-left]                                │ │ │
│  │ │ ⚠️ 2025-04-29 | NETFLIX | -149.00                             │ │ │
│  │ │    70% match - Adjacent date, same amount                      │ │ │
│  │ │    Similar to DB ID: 143                                       │ │ │
│  │ │    [✓ Add Anyway] [✗ Skip]                                    │ │ │
│  │ │                                                                 │ │ │
│  │ │ [Yellow bg, gray border-left]                                  │ │ │
│  │ │ ⚠️ 2025-04-27 | BIXIA AB | -152.00                            │ │ │
│  │ │    50% match - Similar date/amount/description                 │ │ │
│  │ │    Similar to DB ID: 140                                       │ │ │
│  │ │    [✓ Add Anyway] [✗ Skip]                                    │ │ │
│  │ │                                                                 │ │ │
│  │ │ ── Auto-Skipped (5) ──────────────────────────────────────────│ │ │
│  │ │ [Gray bg] 2025-04-30 | American Expre | -16295.41 [Skipped]  │ │ │
│  │ │           (100% match - Auto-skipped)                          │ │ │
│  │ └────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Summary: 15 to add, 0 conflicts unresolved, 13 to skip            │ │
│  │ [Cancel Upload]                    [Commit 15 Transactions →]     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

### **Step 4: User Review & Decision**

#### For Each Conflict:

1. User sees transaction details
2. Sees match percentage and reason
3. Clicks to expand and view similar existing transactions
4. Makes decision:
   - **Add Anyway**: Insert this transaction despite similarity
   - **Skip**: Don't insert this transaction

#### Decision States:

- **Undecided** (default): Yellow background, requires action
- **Add**: Green background with checkmark
- **Skip**: Gray background with X mark

#### Bulk Actions:

- **Add All Safe**: Approves all green (safe) transactions
- **Skip All Conflicts**: Skips all yellow (conflict) transactions
- **Reset All Decisions**: Clears all user decisions back to defaults

#### Smart Defaults (Applied Automatically):

- **Level 1 (100% match)**: Default to "Skip" (unless user changes)
- **Level 2 (90% match)**: Default to "Skip"
- **Level 3 (70% match)**: Default to "Add"
- **Level 4 (50% match)**: Default to "Add"
- User can override any default

#### Validation:

- "Commit" button disabled if unresolved conflicts exist
- Shows count: "3 conflicts need your decision"
- Safe transactions are auto-approved (no user action needed)

### **Step 5: Commit Changes**

1. User clicks "Commit X Transactions"
2. Confirmation dialog (optional): "Add X transactions to HB_2025?"
3. App uploads only approved transactions
4. Shows progress: "Uploading 15 transactions..."
5. Success message: "Successfully added 15 new transactions to HB_2025"
6. Returns to upload page

### **Step 6: Post-Upload**

1. Dialog closes
2. Upload summary shows:
   - "✅ Upload successful! 15 records added, 13 skipped"
3. File input is cleared
4. User can upload another file or navigate away

---

## Color Coding System

### Transaction Status Colors:

| Status                 | Background     | Border                         | Icon | Meaning                |
| ---------------------- | -------------- | ------------------------------ | ---- | ---------------------- |
| **Safe to Add**        | `bg-green-50`  | `border-l-4 border-green-500`  | ✓    | No duplicates found    |
| **Conflict (Level 1)** | `bg-yellow-50` | `border-l-4 border-red-500`    | ⚠️   | 100% exact match       |
| **Conflict (Level 2)** | `bg-yellow-50` | `border-l-4 border-orange-500` | ⚠️   | 90% high confidence    |
| **Conflict (Level 3)** | `bg-yellow-50` | `border-l-4 border-yellow-500` | ⚠️   | 70% possible duplicate |
| **Conflict (Level 4)** | `bg-yellow-50` | `border-l-4 border-gray-400`   | ⚠️   | 50% suspicious         |
| **User Decided: Add**  | `bg-green-100` | `border-l-4 border-green-600`  | ✓    | User approved          |
| **User Decided: Skip** | `bg-gray-100`  | `border-l-4 border-gray-500`   | ✗    | User rejected          |
| **Auto-Skipped**       | `bg-gray-50`   | `border-l-4 border-gray-400`   | ✗    | Auto-resolved          |
| **Existing (DB)**      | `bg-blue-50`   | none                           | —    | Already in database    |
| **Existing (Matched)** | `bg-blue-100`  | `border-l-4 border-blue-500`   | 🔗   | Has matching new data  |

---

## Conflict Detection Algorithm

### Match Levels (All 4 Implemented):

#### **Level 1: Exact Duplicate (100% match)**

```typescript
match =
  Date === existing.Date &&
  Description.toLowerCase().trim() ===
    existing.Description.toLowerCase().trim() &&
  Math.abs(Amount - existing.Amount) < 0.01; // Float comparison tolerance

reason = "Exact duplicate (same date, description, and amount)";
defaultAction = "skip";
borderColor = "red";
```

#### **Level 2: High Confidence Duplicate (90% match)**

```typescript
match =
  Date === existing.Date &&
  Math.abs(Amount - existing.Amount) < 0.01 &&
  levenshteinDistance(Description, existing.Description) <= 2;

reason = "Same date and amount, very similar description";
defaultAction = "skip";
borderColor = "orange";
```

#### **Level 3: Possible Duplicate (70% match)**

```typescript
match =
  Math.abs(dateDifferenceInDays(Date, existing.Date)) <= 1 &&
  Math.abs(Amount - existing.Amount) < 0.01;

reason = "Adjacent date (±1 day), same amount";
defaultAction = "add";
borderColor = "yellow";
```

#### **Level 4: Suspicious Similarity (50% match)**

```typescript
match =
  Math.abs(dateDifferenceInDays(Date, existing.Date)) <= 2 &&
  Math.abs(Amount - existing.Amount) <= 10.0 &&
  stringSimilarity(Description, existing.Description) > 0.8;

reason = "Similar date (±2 days), similar amount (±10), similar description";
defaultAction = "add";
borderColor = "gray";
```

### Matching Order:

1. Check Level 1 first (exact match)
2. If no match, check Level 2
3. If no match, check Level 3
4. If no match, check Level 4
5. If no match at any level → Mark as "Safe to Add"

### One Transaction Can Match Multiple Existing:

- Show all possible duplicates
- List DB IDs: "Similar to DB ID: 146, 147, 148"
- User sees all matches when expanding details

---

## Auto-Resolve Feature

### New Checkbox on Upload Page:

```
☐ Auto-skip exact duplicates (100% match)
   Automatically skip transactions that already exist in the database
```

### Behavior When Enabled:

1. Level 1 (100%) matches are automatically set to "Skip"
2. They appear in "Auto-Skipped" section (collapsed by default)
3. User can still expand and change decision to "Add Anyway"
4. Other levels (90%, 70%, 50%) still require manual review

### Behavior When Disabled:

1. All conflicts require user decision
2. No auto-skipped section
3. Everything goes to "Conflicts" section

---

## Performance Considerations

### Large Dataset Handling:

#### Pagination Strategy:

- **DO**: Paginate conflict view if > 50 conflicts

  - Show 25 conflicts per page
  - Pagination controls at bottom
  - Jump to page with unresolved conflicts

- **DON'T**: Limit what conflicts are shown
  - Always show ALL conflicts (paginated)
  - Always show ALL safe transactions (paginated)
  - User must see complete picture

#### Optimization Techniques:

1. **Virtual Scrolling**: Render only visible rows
2. **Lazy Loading**: Load existing DB data on-demand when expanding conflict details
3. **Background Processing**: Run conflict analysis in Web Worker
4. **Progressive Disclosure**: Collapse "Auto-Skipped" and "Safe" sections by default
5. **Debounced Search**: 300ms delay on search input

#### Performance Targets:

- **File Processing**: < 2 seconds for 500 transactions
- **Conflict Analysis**: < 3 seconds for 1000 transactions
- **Dialog Render**: < 1 second for 100 conflicts
- **User Decision Update**: Instant (< 100ms)

---

## Technical Implementation Details

### New Files to Create:

1. **`app/actions/conflictAnalysis.ts`**

   - `analyzeUploadConflicts()` - Main analysis function
   - `detectDuplicates()` - Matching algorithm
   - `calculateMatchScore()` - Scoring logic
   - Helper functions for Levenshtein distance, string similarity

2. **`components/MergeConflictDialog.tsx`**

   - Main dialog component
   - Manages state for user decisions
   - Handles bulk actions
   - Pagination logic

3. **`components/ConflictRow.tsx`**

   - Individual conflict display
   - Action buttons (Add/Skip)
   - Expandable similar transactions view
   - Color coding based on match level

4. **`components/TransactionComparisonTable.tsx`**

   - Side-by-side comparison view
   - Left: Existing DB data
   - Right: New upload data
   - Synchronized scrolling (optional)

5. **`lib/utils/stringMatching.ts`**
   - Levenshtein distance implementation
   - String similarity algorithm (Jaro-Winkler or similar)
   - Date comparison utilities

### Modified Files:

1. **`app/upload/page.tsx`**

   - Add "Auto-skip exact duplicates" checkbox
   - Replace direct upload with conflict analysis
   - Show MergeConflictDialog when conflicts exist
   - Handle resolved decisions

2. **`app/actions/fileActions.ts`**
   - Keep existing `uploadToSupabase()` - no changes
   - New wrapper function to orchestrate flow

### Data Structures:

```typescript
interface Transaction {
  id: number;
  Date: string;
  Description: string;
  Amount: number;
  Balance?: number;
  Category?: string;
  Responsible?: string;
  Comment?: string;
  user_id?: string;
  Bank?: string;
}

interface ConflictMatch {
  newTransaction: Transaction;
  possibleDuplicates: Transaction[]; // From DB
  matchLevel: 1 | 2 | 3 | 4;
  matchScore: number; // 100, 90, 70, or 50
  matchReason: string;
  defaultAction: "add" | "skip";
  borderColor: "red" | "orange" | "yellow" | "gray";
}

interface ConflictAnalysis {
  tableName: string;
  totalNewTransactions: number;
  safeToAdd: Transaction[];
  conflicts: ConflictMatch[];
  autoSkipped: Transaction[]; // Only if auto-resolve enabled
  existingTransactions: Transaction[];
}

interface TransactionDecision {
  transaction: Transaction;
  action: "add" | "skip";
  wasAutoResolved: boolean;
}

interface MergeConflictState {
  analysis: ConflictAnalysis;
  decisions: Map<number, "add" | "skip">; // Key = transaction.id
  currentPage: number;
  filter: "all" | "safe" | "conflicts" | "skipped";
  sortBy: "date" | "amount" | "matchScore";
  searchQuery: string;
}
```

---

## User Interface Components

### Summary Stats Bar:

```tsx
<div className="grid grid-cols-4 gap-4 mb-4">
  <StatCard
    label="New Transactions"
    count={analysis.safeToAdd.length}
    color="green"
    icon="✓"
  />
  <StatCard
    label="Conflicts"
    count={analysis.conflicts.length}
    color="yellow"
    icon="⚠️"
    subtitle={`${unresolvedCount} need your decision`}
  />
  <StatCard label="To Skip" count={skippedCount} color="gray" icon="✗" />
  <StatCard
    label="In Database"
    count={analysis.existingTransactions.length}
    color="blue"
    icon="—"
  />
</div>
```

### Bulk Action Toolbar:

```tsx
<div className="flex gap-2 mb-4">
  <Button variant="outline" onClick={handleAddAllSafe}>
    <CheckCircle className="mr-2" /> Add All Safe ({safeCount})
  </Button>
  <Button variant="outline" onClick={handleSkipAllConflicts}>
    <XCircle className="mr-2" /> Skip All Conflicts ({conflictCount})
  </Button>
  <Button variant="ghost" onClick={handleResetDecisions}>
    <RotateCcw className="mr-2" /> Reset All
  </Button>
</div>
```

### Filter & Sort Bar:

```tsx
<div className="flex gap-4 mb-4">
  <Select value={filter} onValueChange={setFilter}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Filter" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Transactions</SelectItem>
      <SelectItem value="safe">Safe to Add</SelectItem>
      <SelectItem value="conflicts">Conflicts Only</SelectItem>
      <SelectItem value="skipped">Skipped</SelectItem>
    </SelectContent>
  </Select>

  <Select value={sortBy} onValueChange={setSortBy}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Sort by" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="date">Date</SelectItem>
      <SelectItem value="amount">Amount</SelectItem>
      <SelectItem value="matchScore">Match Score</SelectItem>
    </SelectContent>
  </Select>

  <Input
    type="text"
    placeholder="Search transactions..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="flex-1"
  />
</div>
```

### Conflict Row Details:

```tsx
<div
  className={`border-l-4 ${getBorderColor(conflict)} p-4 mb-2 rounded ${getBackgroundColor(decision)}`}
>
  {/* Header */}
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-lg">{getStatusIcon(conflict.matchLevel)}</span>
        <span className="font-medium text-lg">
          {conflict.newTransaction.Date}
        </span>
        <Badge variant={getMatchBadgeVariant(conflict.matchLevel)}>
          {conflict.matchScore}% match
        </Badge>
      </div>
      <div className="mt-1 text-gray-700">
        {conflict.newTransaction.Description}
      </div>
      <div className="mt-1 text-lg font-bold">
        {formatCurrency(conflict.newTransaction.Amount)}
      </div>
    </div>

    {/* Decision Buttons */}
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={decision === "add" ? "default" : "outline"}
        className={decision === "add" ? "bg-green-600" : ""}
        onClick={() => handleDecision(conflict, "add")}
      >
        <CheckIcon className="mr-1" /> Add Anyway
      </Button>
      <Button
        size="sm"
        variant={decision === "skip" ? "default" : "outline"}
        className={decision === "skip" ? "bg-gray-600" : ""}
        onClick={() => handleDecision(conflict, "skip")}
      >
        <XIcon className="mr-1" /> Skip
      </Button>
    </div>
  </div>

  {/* Match Info */}
  <div className="mt-2 text-sm text-gray-600">{conflict.matchReason}</div>
  <div className="mt-1 text-xs text-blue-600">
    Similar to DB ID: {conflict.possibleDuplicates.map((d) => d.id).join(", ")}
  </div>

  {/* Expandable Details */}
  <Collapsible className="mt-3">
    <CollapsibleTrigger className="text-sm text-blue-600 hover:underline flex items-center gap-1">
      <ChevronDown className="h-4 w-4" />
      View {conflict.possibleDuplicates.length} similar transaction(s)
    </CollapsibleTrigger>
    <CollapsibleContent className="mt-2">
      {conflict.possibleDuplicates.map((dup) => (
        <div
          key={dup.id}
          className="bg-blue-50 border border-blue-200 rounded p-3 mb-2"
        >
          <div className="flex justify-between">
            <div>
              <div className="text-sm font-medium">DB ID: {dup.id}</div>
              <div className="text-sm text-gray-600">
                {dup.Date} | {dup.Description}
              </div>
              <div className="text-sm font-bold">
                {formatCurrency(dup.Amount)}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {dup.Category && <div>Category: {dup.Category}</div>}
              {dup.Comment && <div>Comment: {dup.Comment}</div>}
            </div>
          </div>
        </div>
      ))}
    </CollapsibleContent>
  </Collapsible>
</div>
```

---

## Error Handling

### Scenarios & Responses:

1. **Table doesn't exist in Supabase**

   - Show conflict dialog anyway
   - When committing, trigger automatic table creation
   - Then upload all approved transactions

2. **No existing data in table (empty table)**

   - All new transactions marked as "Safe to Add"
   - No conflicts possible
   - Show simplified view: "All X transactions are new"

3. **Large file (>1000 transactions)**

   - Show warning: "Large file detected. Analysis may take a moment..."
   - Use Web Worker for processing
   - Show progress bar during analysis

4. **Browser memory issues**

   - Catch errors during analysis
   - Fallback to direct upload (old behavior)
   - Show message: "Conflict analysis unavailable for large datasets. Proceeding with direct upload."

5. **User closes dialog without deciding**

   - Confirm: "You have unresolved conflicts. Cancel upload?"
   - Options: "Continue Reviewing" | "Cancel Upload"

6. **Network error during commit**
   - Retry logic (3 attempts)
   - Show error: "Upload failed. Please try again."
   - Preserve user decisions (don't reset)

---

## Success Metrics

### What Success Looks Like:

- ✅ Zero duplicate transactions uploaded accidentally
- ✅ Users can safely re-upload full-year files
- ✅ No manual categorization work is lost
- ✅ < 5 seconds to analyze 500 transactions
- ✅ Intuitive UI requiring no training
- ✅ 95%+ of users successfully resolve conflicts on first try

---

## Future Enhancements (Not in Initial Implementation)

1. **Update Action**: Allow overwriting existing transaction fields
2. **Rule-Based Auto-Resolution**: "Always skip transactions from SPOTIFY"
3. **Undo Last Upload**: Revert committed transactions
4. **Conflict History**: Log of all resolution decisions
5. **Export Skipped Transactions**: Download CSV of skipped items
6. **Machine Learning**: Suggest decisions based on past patterns
7. **Multi-user Collaboration**: Show what other users decided for similar conflicts

---

## Testing Plan

### Unit Tests:

- Match level detection (all 4 levels)
- Levenshtein distance calculation
- String similarity scoring
- Date comparison edge cases
- Amount comparison with float precision

### Integration Tests:

- Full upload flow with conflicts
- Auto-resolve functionality
- Bulk actions
- Pagination

### E2E Tests:

- Upload file → Resolve conflicts → Verify DB
- Auto-skip exact duplicates
- Cancel upload with unresolved conflicts
- Large file handling (1000+ transactions)

### Manual Testing Checklist:

- [ ] Upload file with 0 conflicts
- [ ] Upload file with all conflicts
- [ ] Upload file with mix of safe/conflicts
- [ ] Test all 4 match levels
- [ ] Test bulk actions
- [ ] Test filter/sort/search
- [ ] Test pagination (>50 conflicts)
- [ ] Test auto-resolve checkbox
- [ ] Test with empty database table
- [ ] Test with non-existent table
- [ ] Test with multiple files sequentially
- [ ] Test cancellation flow
- [ ] Test commit success/failure

---

## Implementation Checklist

### Phase 1: Core Analysis Engine

- [ ] Create `lib/utils/stringMatching.ts`
  - [ ] Levenshtein distance function
  - [ ] String similarity function (Jaro-Winkler)
  - [ ] Date difference calculator
- [ ] Create `app/actions/conflictAnalysis.ts`
  - [ ] `analyzeUploadConflicts()` main function
  - [ ] Level 1 matcher (100% exact)
  - [ ] Level 2 matcher (90% high confidence)
  - [ ] Level 3 matcher (70% possible)
  - [ ] Level 4 matcher (50% suspicious)
  - [ ] `categorizeTransactions()` helper

### Phase 2: UI Components

- [ ] Create `components/ui/stat-card.tsx` (reusable)
- [ ] Create `components/ConflictRow.tsx`
  - [ ] Color coding
  - [ ] Action buttons
  - [ ] Expandable details
- [ ] Create `components/TransactionRow.tsx` (safe/skipped)
- [ ] Create `components/MergeConflictDialog.tsx`
  - [ ] Summary stats
  - [ ] Bulk actions toolbar
  - [ ] Filter/sort/search bar
  - [ ] Scrollable transaction lists
  - [ ] Pagination (if needed)
  - [ ] Commit button with validation

### Phase 3: Upload Page Integration

- [ ] Modify `app/upload/page.tsx`
  - [ ] Add "Auto-skip exact duplicates" checkbox
  - [ ] Add state for conflict dialog
  - [ ] Replace direct upload with analysis
  - [ ] Handle conflict resolution flow
  - [ ] Show loading during analysis
  - [ ] Update success/error messages

### Phase 4: Testing & Polish

- [ ] Unit tests for matching algorithms
- [ ] Integration tests for full flow
- [ ] Performance testing with large files
- [ ] UI/UX polish and animations
- [ ] Accessibility review (keyboard nav, screen readers)
- [ ] Mobile responsive design
- [ ] Error handling for edge cases

### Phase 5: Documentation

- [ ] Update user guide with conflict resolution steps
- [ ] Add screenshots to documentation
- [ ] Update FAQ with common questions
- [ ] Code comments and JSDoc

---

## Development Notes

### Libraries Needed:

- **Existing**: All UI components from shadcn/ui
- **New**: None (implement string matching from scratch)

### No Breaking Changes:

- Old "Clear Data" functionality still works
- Direct upload still possible (if no conflicts)
- All existing bank processors unchanged
- Database schema unchanged

### Backwards Compatible:

- Works with existing Supabase tables
- No migration needed
- Can be rolled back easily

---

## Conclusion

This feature transforms the upload process from a risky "hope there are no duplicates" operation to a safe, controlled merge with full user oversight. Users gain confidence uploading full-year files repeatedly, knowing they'll see exactly what's changing before committing.

The git-style conflict resolution is familiar to developers and intuitive to non-technical users. Color coding and clear visual hierarchy make decisions obvious. Auto-resolve handles the easy cases, while manual review catches edge cases.

**Ready for implementation. ✓**
