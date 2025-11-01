# Smart Fetching Feature - Design Requirements

**Version:** 1.0  
**Date:** November 1, 2025  
**Author:** System Design  
**Status:** Implementation Ready

---

## Overview

Add a "Smart Fetching" functionality to the email-client page that intelligently fetches new emails and organizes them into monthly JSON files at `C:\Users\carlo\GITHUB\finance-tracker\privat\data\email`. This feature improves file organization by grouping emails per month while maintaining data integrity and preventing duplicates.

---

## Key Requirements

### Phase 0: Migration (CRITICAL - Run First)

**Goal:** Migrate existing JSON files to the new monthly format before implementing smart fetching.

#### Current State

- Files exist with date range naming: `gmail-export-YYYY-MM-DD-to-YYYY-MM-DD.json`
- Files may span multiple months
- No consistent monthly organization

#### Target State

- Files organized by month: `gmail-export-YYYY-MM.json`
- Each file contains only emails from that specific month
- No duplicate emails across files
- All email IDs preserved and tracked

#### Migration Strategy

1. Scan all existing JSON files in the email directory
2. Read and parse each file
3. Extract all emails from each file
4. Group emails by month (based on email Date header)
5. Deduplicate emails by ID (keep first occurrence)
6. Create new monthly JSON files: `gmail-export-YYYY-MM.json`
7. Backup original files to `backup/` subdirectory (timestamped)
8. Delete old files after successful migration
9. Log migration results (files processed, emails migrated, duplicates removed)

#### Migration File Structure

```json
{
  "dateRange": {
    "start": "YYYY-MM-01",
    "end": "YYYY-MM-31"
  },
  "totalEmails": 123,
  "emails": [...],
  "exportDate": "2025-11-01T12:00:00.000Z",
  "fetchedBy": "migration-script",
  "migrationInfo": {
    "migratedAt": "2025-11-01T12:00:00.000Z",
    "sourceFiles": ["original-file-1.json", "original-file-2.json"],
    "duplicatesRemoved": 5
  }
}
```

---

### Phase 1: Background Scanning (On Page Load)

#### Goal

Pre-load information about existing email cache before user authentication.

#### Implementation

- **When:** Component mount (useEffect)
- **What to scan:**
  - Directory: `C:\Users\carlo\GITHUB\finance-tracker\privat\data\email`
  - Find all JSON files matching pattern: `gmail-export-*.json`
  - Identify latest file by date
  - Extract latest email date from that file

#### Display to User

- Show information banner before authentication options
- Display:
  - Total JSON files found
  - Latest file name
  - Latest email date
  - Suggestion to use Smart Fetching if data is old

#### Example Display

```
📧 Email Cache Status
━━━━━━━━━━━━━━━━━━━━
Files: 5 monthly archives found
Latest: gmail-export-2025-10.json
Last Email: October 26, 2025, 3:42 PM
Status: Ready for Smart Fetching
```

---

### Phase 2: Smart Fetching UI

#### Location

Add to existing "Export Email Data" card section

#### Components

1. **Smart Fetching Button**

   - Label: "Smart Fetching"
   - Icon: Sparkles or Zap icon
   - Position: Below existing export date range controls
   - State: Disabled when not signed in or already running

2. **Expandable Console Display**

   - Accordion-style or collapsible section
   - Auto-expands when fetching starts
   - Shows real-time logs
   - Auto-scrolls to bottom
   - Fixed max height with scroll

3. **Console Log Entry Format**
   ```
   [HH:MM:SS] ℹ️ Scanning email directory...
   [HH:MM:SS] ✅ Found 5 existing monthly files
   [HH:MM:SS] 📅 Latest email date: 2025-10-26
   [HH:MM:SS] 🔍 Fetching emails from Oct 26 to Nov 1...
   [HH:MM:SS] 📊 Processing batch 1/3 (33%)
   [HH:MM:SS] 💾 Updating gmail-export-2025-10.json (15 new emails)
   [HH:MM:SS] 💾 Creating gmail-export-2025-11.json (3 new emails)
   [HH:MM:SS] ✅ Smart fetching complete! 18 emails added across 2 months
   ```

#### Log Types

- `info` (ℹ️ blue): Regular progress updates
- `success` (✅ green): Successful operations
- `warning` (⚠️ yellow): Non-critical issues
- `error` (❌ red): Errors that need attention

---

### Phase 3: Core Smart Fetching Logic

#### Step-by-Step Process

1. **Initialize**

   - Check authentication status
   - Verify Gmail API access
   - Log: "Starting Smart Fetching process..."

2. **Scan Existing Files**

   - Read all monthly JSON files
   - Identify latest email date
   - Log: "Found X monthly files, latest email: [date]"

3. **Calculate Fetch Range**

   - Start: Latest email date (inclusive)
   - End: Current date
   - Log: "Fetching emails from [start] to [end]"

4. **Fetch Emails from Gmail**

   - Use existing Gmail API integration
   - Batch size: 10 emails per batch
   - Delay: 200ms between batches
   - Query: `after:[start_date] before:[end_date]`
   - Log progress: "Processing batch X/Y (Z%)"

5. **Group by Month**

   - Parse Date header from each email
   - Group into Map<month_string, emails[]>
   - Month format: "YYYY-MM"
   - Log: "Grouping X emails into Y months"

6. **Update Monthly Files**

   - For each month group:
     - Check if file exists
     - If exists: Read, merge, deduplicate
     - If new: Create new structure
     - Sort emails chronologically
     - Write to file
   - Log: "Updated/Created gmail-export-[month].json (X emails)"

7. **Complete**
   - Summary statistics
   - Log: "✅ Smart fetching complete! X emails added across Y months"

---

### Phase 4: File Structure & Deduplication

#### Monthly File Naming

```
gmail-export-YYYY-MM.json
```

Examples:

- `gmail-export-2025-01.json` (January 2025)
- `gmail-export-2025-10.json` (October 2025)
- `gmail-export-2025-11.json` (November 2025)

#### File Structure

```json
{
  "dateRange": {
    "start": "2025-10-01",
    "end": "2025-10-31"
  },
  "totalEmails": 213,
  "emails": [
    {
      "id": "199c0a22e5fd37ca",
      "snippet": "...",
      "headers": [...],
      "date": "2025-10-07T...",
      "from": "...",
      "subject": "...",
      "to": "...",
      "ignored": false
    }
  ],
  "exportDate": "2025-11-01T12:00:00.000Z",
  "fetchedBy": "user@gmail.com",
  "lastUpdated": "2025-11-01T14:30:00.000Z"
}
```

#### Deduplication Strategy

1. **Primary Key:** Email ID (`id` field)
2. **Process:**
   - Read existing emails from monthly file
   - Create Set of existing IDs
   - Filter new emails: only those not in Set
   - Merge: existing + filtered new
   - Sort by date (ascending)
3. **Tracking:** Log number of duplicates skipped

---

### Phase 5: Edge Cases & Error Handling

#### Edge Cases to Handle

1. **No Existing Files (First Run)**

   - Create directory if needed
   - Start fetching from user-specified date or default range
   - Log: "No existing files found, starting fresh"

2. **Empty Directory**

   - Same as first run
   - Prompt user for date range

3. **Corrupted JSON Files**

   - Try to parse each file
   - Skip corrupted files with warning
   - Log: "⚠️ Skipping corrupted file: [filename]"
   - Continue with valid files

4. **No New Emails**

   - Log: "✅ Already up to date! No new emails to fetch"
   - Show success message

5. **Gap Spanning Multiple Months**

   - Example: Last email Oct 15, current date Nov 1
   - Fetch all emails in range
   - Create/update both October and November files
   - Log progress for each month

6. **Same Month Multiple Fetches**

   - Deduplication prevents duplicates
   - Only new emails added
   - Log: "X new emails, Y duplicates skipped"

7. **Date Parsing Errors**
   - Skip emails with invalid dates
   - Log warning with email ID
   - Continue processing

#### Error Handling

1. **Network Errors**

   - Catch and display user-friendly message
   - Log: "❌ Network error: [message]"
   - Suggest retry

2. **Gmail API Errors**

   - Handle 401 (auth): Prompt re-authentication
   - Handle 429 (rate limit): Wait and retry
   - Handle 403 (permission): Display permission error
   - Log specific error codes

3. **File System Errors**

   - Catch write errors
   - Display error message
   - Log: "❌ Failed to write file: [filename]"

4. **API Rate Limiting**
   - Implement exponential backoff
   - Show progress: "Rate limited, waiting..."
   - Automatically retry

---

### Phase 6: Technical Implementation

#### New File: `lib/utils/smartFetching.ts`

**Functions to Implement:**

```typescript
// Migration
export async function migrateExistingFiles(): Promise<MigrationResult>;

// Directory Operations
export async function scanEmailDirectory(): Promise<string[]>;
export async function getLatestEmailDate(files: string[]): Promise<Date | null>;
export function parseFilenameDate(filename: string): Date | null;

// Fetching
export async function fetchEmailsFromDate(
  startDate: Date,
  endDate: Date,
  onProgress: (log: LogEntry) => void,
): Promise<EmailData[]>;

// Grouping & Organization
export function groupEmailsByMonth(
  emails: EmailData[],
): Map<string, EmailData[]>;
export function getMonthKey(date: Date): string; // Returns "YYYY-MM"

// File Operations
export async function readMonthlyFile(
  month: string,
): Promise<MonthlyFileData | null>;
export async function updateMonthlyFile(
  month: string,
  newEmails: EmailData[],
  userEmail: string,
): Promise<void>;

// Deduplication
export function deduplicateEmails(emails: EmailData[]): EmailData[];
export function sortEmailsByDate(emails: EmailData[]): EmailData[];

// Backup
export async function backupExistingFiles(files: string[]): Promise<void>;
```

#### State Variables in page.tsx

```typescript
// Pre-loaded cache info
const [emailCacheInfo, setEmailCacheInfo] = useState<{
  latestFile: string | null;
  latestEmailDate: Date | null;
  totalFiles: number;
  scanning: boolean;
  error: string | null;
} | null>(null);

// Smart fetching state
const [isSmartFetching, setIsSmartFetching] = useState(false);
const [smartFetchLogs, setSmartFetchLogs] = useState<LogEntry[]>([]);
const [showSmartFetchConsole, setShowSmartFetchConsole] = useState(false);

// Migration state
const [needsMigration, setNeedsMigration] = useState(false);
const [isMigrating, setIsMigrating] = useState(false);

// Types
interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}
```

---

### Phase 7: Testing Scenarios

#### Test Cases

1. **Migration Test**

   - ✅ Migrate 5 existing files to monthly format
   - ✅ Verify no data loss
   - ✅ Verify deduplication works
   - ✅ Verify backup created

2. **First Run (No Files)**

   - ✅ Directory empty
   - ✅ Fetch last 30 days
   - ✅ Create monthly files

3. **Same Month Fetch**

   - ✅ Latest email: Oct 20
   - ✅ Current date: Oct 25
   - ✅ Fetch 5 days worth
   - ✅ Update October file only
   - ✅ No duplicates

4. **Multi-Month Span**

   - ✅ Latest email: Oct 28
   - ✅ Current date: Nov 1
   - ✅ Update October file
   - ✅ Create November file

5. **Large Gap**

   - ✅ Latest email: Aug 15
   - ✅ Current date: Nov 1
   - ✅ Create/update Sept, Oct, Nov files
   - ✅ Handle many emails efficiently

6. **No New Emails**

   - ✅ Latest email: Today
   - ✅ Run smart fetch
   - ✅ Show "up to date" message

7. **Error Recovery**
   - ✅ Network error mid-fetch
   - ✅ Partial data saved
   - ✅ Can resume safely

---

### Phase 8: UI/UX Considerations

#### Before Authentication

```
┌─────────────────────────────────────────────┐
│ 📧 Email Cache Status                       │
├─────────────────────────────────────────────┤
│ 📁 5 monthly archives found                 │
│ 📅 Latest: October 2025                     │
│ 📧 Last email: Oct 26, 2025, 3:42 PM       │
│ ⏱️  6 days behind                           │
│                                             │
│ 💡 Tip: Sign in to use Smart Fetching and  │
│    automatically sync your latest emails    │
└─────────────────────────────────────────────┘
```

#### During Smart Fetching

```
┌─────────────────────────────────────────────┐
│ ⚡ Smart Fetching Console                   │
├─────────────────────────────────────────────┤
│ [14:30:15] ℹ️ Starting Smart Fetching...    │
│ [14:30:16] ✅ Found 5 monthly files         │
│ [14:30:16] 📅 Latest: Oct 26, 2025          │
│ [14:30:17] 🔍 Fetching Oct 26 - Nov 1...    │
│ [14:30:18] 📊 Batch 1/2 (50%)               │
│ [14:30:20] 📊 Batch 2/2 (100%)              │
│ [14:30:21] 📦 Found 18 new emails           │
│ [14:30:22] 💾 Updating October file...      │
│ [14:30:23] 💾 Creating November file...     │
│ [14:30:24] ✅ Complete! 18 emails synced    │
└─────────────────────────────────────────────┘
```

---

## Success Criteria

- ✅ Existing files successfully migrated to monthly format
- ✅ Cache info displayed before authentication
- ✅ Smart fetching fetches from latest email date
- ✅ Files organized monthly with no duplicates
- ✅ Can run multiple times safely (idempotent)
- ✅ Handles gaps and edge cases gracefully
- ✅ Clear progress feedback to user
- ✅ No data loss during migration or updates
- ✅ Error messages are user-friendly
- ✅ Performance: Handles 1000+ emails efficiently

---

## Future Enhancements

1. **Auto-sync on Login**

   - Automatically trigger smart fetch on sign-in if data is old

2. **Scheduled Fetching**

   - Background sync every X hours

3. **Compression**

   - Compress old monthly files to save space

4. **Email Statistics**

   - Show trends: emails per month, sender breakdown

5. **Selective Sync**

   - Filter by sender during smart fetch
   - Only fetch from specific institutions

6. **Cloud Backup**
   - Option to backup monthly files to cloud storage

---

## Implementation Order

1. ✅ **Create this documentation**
2. ⏳ Create migration function
3. ⏳ Create directory scanning functions
4. ⏳ Add background scanning to page
5. ⏳ Implement Smart Fetching UI
6. ⏳ Implement core fetching logic
7. ⏳ Add error handling
8. ⏳ Test all scenarios
9. ⏳ Deploy and monitor

---

**Document Status:** Ready for Implementation  
**Next Step:** Begin Phase 0 - Migration Implementation
