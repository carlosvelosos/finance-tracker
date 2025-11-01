# **Design Requirement: Smart Fetching with Full Email Data Storage**

## **Executive Summary**

Currently, the Smart Fetching system stores **minimal email data** (headers, snippet, ignored flag) in monthly JSON files at `privat/data/email/gmail-export-YYYY-MM.json`. However, this doesn't include the **full email payload** (body content, parts, attachments) needed for the "View Full Email" feature.

This design proposes a **two-tier storage system**:

1. **Index files** (monthly JSON) with minimal data + pointers to full data
2. **Full email data files** (individual files) stored in organized directory structure

---

## **Current State Analysis**

### What's Currently Stored (Monthly JSON):

```json
{
  "id": "19a3c9435c3fb67a",
  "snippet": "Email preview text...",
  "headers": [...],
  "date": "2025-11-01",
  "from": "sender@example.com",
  "subject": "Email Subject",
  "to": "recipient@example.com",
  "ignored": false
}
```

### What's Missing:

- ❌ **Full email payload** (needed for HTML/text body rendering)
- ❌ **Email parts** (multipart structure)
- ❌ **Attachment data** (full metadata, attachmentId for download)
- ❌ **Complete headers** (currently filtered to only essential ones)

---

## **Proposed Architecture**

### **Directory Structure**

```
privat/data/email/
├── gmail-export-2025-11.json          # Monthly index file (minimal data)
├── full/
│   ├── 2025/
│   │   ├── 11/                        # Month folder
│   │   │   ├── 01/                    # Day folder
│   │   │   │   ├── 19a3c9435c3fb67a.json
│   │   │   │   └── 19a3cb4e31219a9a.json
│   │   │   ├── 02/
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── 10/
│   │   └── ...
│   └── ...
└── backup/                             # Existing backup folder
```

### **Monthly Index File Structure** (Updated)

```json
{
  "dateRange": {
    "start": "2025-11-01",
    "end": "2025-11-30"
  },
  "totalEmails": 50,
  "version": "2.0",
  "emails": [
    {
      "id": "19a3c9435c3fb67a",
      "snippet": "Email preview...",
      "headers": [...],              // Essential headers only
      "date": "2025-11-01",
      "from": "sender@example.com",
      "subject": "Email Subject",
      "to": "recipient@example.com",
      "ignored": false,
      "hasAttachments": true,        // NEW: Quick flag
      "attachmentCount": 2,          // NEW: Count
      "fullDataPath": "full/2025/11/01/19a3c9435c3fb67a.json"  // NEW: Pointer
    }
  ],
  "exportDate": "2025-11-01T14:30:00.000Z",
  "fetchedBy": "user@example.com"
}
```

### **Full Email Data File Structure**

```json
{
  "id": "19a3c9435c3fb67a",
  "snippet": "Full snippet text...",
  "payload": {
    "headers": [...],               // ALL headers
    "body": {
      "data": "base64url_encoded_body",
      "size": 12345
    },
    "parts": [...],                 // Multipart structure
    "mimeType": "text/html"
  },
  "threadId": "19a3c9435c3fb67a",
  "labelIds": ["INBOX", "UNREAD"],
  "internalDate": "1730405337000",
  "sizeEstimate": 15000,
  "attachments": [                  // Pre-parsed attachment info
    {
      "filename": "document.pdf",
      "mimeType": "application/pdf",
      "size": 50000,
      "attachmentId": "ANGjd..."
    }
  ],
  "storedDate": "2025-11-01T14:30:00.000Z"
}
```

---

## **Implementation Plan**

### **Phase 1: Core Storage Infrastructure**

#### **1.1 Create File Storage Utility** (`lib/utils/emailStorage.ts`)

```typescript
// Functions to implement:
- saveFullEmail(emailData, date) → saves to full/YYYY/MM/DD/{id}.json
- loadFullEmail(emailId, date) → loads from full/YYYY/MM/DD/{id}.json
- deleteFullEmail(emailId, date) → deletes file
- ensureDirectoryStructure(date) → creates YYYY/MM/DD folders
- getFullEmailPath(emailId, date) → returns relative path
```

#### **1.2 Update Export Functions** (`app/email-client/page.tsx`)

**Modify `exportCurrentEmails` function:**

- When exporting monthly JSON, also save full email data files
- Add `fullDataPath`, `hasAttachments`, `attachmentCount` to index
- Create directory structure: `full/YYYY/MM/DD/`

**Modify `downloadJsonFile` for range exports:**

- Option to include/exclude full data
- Checkbox: "Include full email data for offline viewing"

### **Phase 2: Smart Fetching Integration**

#### **2.1 Update Smart Fetch Scan** (`app/api/smart-fetch/scan/route.ts`)

- Check for existence of `full/` directory
- Report statistics: emails with/without full data
- Detect orphaned full data files (no index entry)

#### **2.2 Create Full Data Fetch API** (`app/api/smart-fetch/full-data/route.ts`)

```typescript
// Endpoints:
GET /api/smart-fetch/full-data?emailId={id}&date={YYYY-MM-DD}
  → Returns full email data for specific email

POST /api/smart-fetch/full-data/batch
  → Fetches full data for multiple emails
  → Used when user uploads monthly JSON without full data

DELETE /api/smart-fetch/full-data?emailId={id}&date={YYYY-MM-DD}
  → Deletes full data file for ignored emails
```

### **Phase 3: UI Integration**

#### **3.1 Update "View Full Email" Flow** (`app/email-client/[emailId]/page.tsx`)

**Current flow:**

1. Check `gmail-full-emails` (localStorage)
2. Check `gmail-client-cache` (localStorage)
3. Check `cachedEmails` / `uploadedEmails` (localStorage)

**New flow:**

1. Check `gmail-full-emails` (localStorage) - temporary cache
2. Check if uploaded file has `fullDataPath` pointer
3. If pointer exists → fetch from `/api/smart-fetch/full-data`
4. If not → show snippet only + warning: "Full email data not available"

#### **3.2 Add Download Options UI**

In Export section, add checkbox:

```
□ Include full email data (larger file size, enables offline viewing)
```

#### **3.3 Add Full Data Status Indicator**

In email cards, show icons:

- 📧 = Full data available
- 📋 = Snippet only

### **Phase 4: Ignored Email Cleanup**

#### **4.1 Update Export with Ignored Cleanup**

When user clicks "Export All Emails" button:

1. Update monthly JSON with new `ignored` statuses
2. **Delete full data files** for newly ignored emails
3. Show confirmation: "Cleaned up X full email files for ignored emails"

#### **4.2 Create Cleanup Utility**

```typescript
// Function to scan and clean orphaned files:
- Find full data files with no index entry
- Find full data files for ignored=true emails
- Batch delete with user confirmation
```

---

## **Detailed Implementation Steps**

### **TODO List for Implementation**

#### **Step 1: Storage Infrastructure**

- [ ] 1.1 Create `lib/utils/emailStorage.ts` utility file
- [ ] 1.2 Implement `saveFullEmail()` function
- [ ] 1.3 Implement `loadFullEmail()` function
- [ ] 1.4 Implement `deleteFullEmail()` function
- [ ] 1.5 Implement `ensureDirectoryStructure()` function
- [ ] 1.6 Implement `getFullEmailPath()` helper
- [ ] 1.7 Add TypeScript interfaces for FullEmailData

#### **Step 2: Export Functionality**

- [ ] 2.1 Update `exportCurrentEmails()` to save full data files
- [ ] 2.2 Add `fullDataPath`, `hasAttachments`, `attachmentCount` to email objects
- [ ] 2.3 Update monthly JSON schema version to "2.0"
- [ ] 2.4 Add progress indicator for full data file creation
- [ ] 2.5 Add checkbox UI for "Include full email data" option
- [ ] 2.6 Handle export errors gracefully (partial saves)

#### **Step 3: API Routes**

- [ ] 3.1 Create `/api/smart-fetch/full-data/route.ts`
- [ ] 3.2 Implement GET endpoint for single email
- [ ] 3.3 Implement POST endpoint for batch fetch
- [ ] 3.4 Implement DELETE endpoint
- [ ] 3.5 Add error handling and validation
- [ ] 3.6 Add rate limiting for API endpoints

#### **Step 4: Smart Fetch Integration**

- [ ] 4.1 Update scan route to detect full data directory
- [ ] 4.2 Add statistics: emails with/without full data
- [ ] 4.3 Detect orphaned full data files
- [ ] 4.4 Add "Clean Orphaned Files" button in UI

#### **Step 5: Email Detail Page**

- [ ] 5.1 Update `[emailId]/page.tsx` to check for `fullDataPath`
- [ ] 5.2 Add API call to fetch full data from server
- [ ] 5.3 Add loading state while fetching from API
- [ ] 5.4 Add fallback message when full data unavailable
- [ ] 5.5 Cache fetched full data in localStorage

#### **Step 6: UI Enhancements**

- [ ] 6.1 Add full data status icons to email cards
- [ ] 6.2 Add tooltip explaining full data availability
- [ ] 6.3 Update export dialog with size estimates
- [ ] 6.4 Add progress bar for full data file operations
- [ ] 6.5 Add storage usage statistics

#### **Step 7: Ignored Email Cleanup**

- [ ] 7.1 Implement cleanup on export button click
- [ ] 7.2 Show confirmation dialog before deletion
- [ ] 7.3 Add "Cleanup Full Data" utility function
- [ ] 7.4 Add batch delete API call
- [ ] 7.5 Update monthly JSON after cleanup
- [ ] 7.6 Show success message with file count

#### **Step 8: Testing & Validation**

- [ ] 8.1 Test export with 50+ emails
- [ ] 8.2 Test API endpoints with various scenarios
- [ ] 8.3 Test ignored email cleanup workflow
- [ ] 8.4 Test migration from old format to new format
- [ ] 8.5 Test storage quota handling
- [ ] 8.6 Test error recovery scenarios

#### **Step 9: Documentation**

- [ ] 9.1 Update user guide with new features
- [ ] 9.2 Document file structure in README
- [ ] 9.3 Add JSDoc comments to new functions
- [ ] 9.4 Create migration guide for existing users

#### **Step 10: Optional Enhancements**

- [ ] 10.1 Add compression for full data files (gzip)
- [ ] 10.2 Add lazy loading for attachment data
- [ ] 10.3 Add bulk operations UI (delete, export, etc.)
- [ ] 10.4 Add search within full email bodies

---

## **Benefits**

### **Performance**

- ✅ Fast email list loading (minimal data from monthly JSON)
- ✅ On-demand full data loading (only when user clicks)
- ✅ Reduced localStorage usage (server-side storage)

### **Storage**

- ✅ Organized file structure (easy to browse/backup)
- ✅ Automatic cleanup of ignored emails
- ✅ No localStorage quota issues

### **Features**

- ✅ Full email viewing with HTML rendering
- ✅ Attachment information display
- ✅ Offline viewing capability (with full data export)
- ✅ Complete email headers available

### **Maintenance**

- ✅ Easy to clean up old data (delete entire year folders)
- ✅ Orphaned file detection and cleanup
- ✅ Version control for data format

---

## **Migration Strategy**

### **Backward Compatibility**

- Detect monthly JSON version (missing = "1.0", has version field = "2.0")
- Version 1.0 files work as before (snippet only)
- Version 2.0 files support full data pointers
- **No breaking changes** to existing functionality

### **Gradual Migration**

- New exports automatically use version 2.0
- Old exports remain functional
- Optional: "Upgrade to v2.0" button to regenerate with full data

---

## **Security Considerations**

### **File Access**

- All files stored in `privat/` directory (excluded from git)
- API routes validate email ownership via Supabase auth
- No direct file system access from client

### **Storage Limits**

- Monitor directory size
- Add warning at 1GB storage usage
- Implement automatic cleanup of old data (>6 months)

---

## **Estimated Effort**

| Phase                           | Complexity | Time Estimate   |
| ------------------------------- | ---------- | --------------- |
| Phase 1: Storage Infrastructure | Medium     | 3-4 hours       |
| Phase 2: Smart Fetching         | Medium     | 2-3 hours       |
| Phase 3: UI Integration         | Low        | 2-3 hours       |
| Phase 4: Cleanup                | Low        | 1-2 hours       |
| Testing & Documentation         | Medium     | 2-3 hours       |
| **Total**                       |            | **10-15 hours** |

---

## **Risks & Mitigation**

| Risk            | Impact | Mitigation                          |
| --------------- | ------ | ----------------------------------- |
| Large file size | High   | Implement compression, lazy loading |
| API performance | Medium | Add caching, rate limiting          |
| Orphaned files  | Low    | Automatic cleanup utility           |
| Storage quota   | Medium | Monitor usage, cleanup old data     |

---

## **Success Criteria**

1. ✅ Users can view full email content including HTML body
2. ✅ Attachment information is displayed correctly
3. ✅ Export size remains reasonable (<100MB for 1000 emails)
4. ✅ Ignored emails' full data is automatically cleaned up
5. ✅ No breaking changes to existing workflows
6. ✅ API response time <500ms for single email fetch

---

## **Approval Status**

✅ **APPROVED** - November 1, 2025

**Answers to Implementation Questions:**

1. **Storage location**: `privat/data/email/full/` - Approved ✅
2. **Compression**: Not in initial implementation (can add later)
3. **Retention**: Same as monthly JSON, indefinite
4. **Batch operations**: Yes, add "Download All Full Data" for convenience
5. **Attachment files**: Metadata only (actual files require Gmail API download)

---

## **Implementation Status**

**Current Phase**: Starting Phase 1 - Core Storage Infrastructure
**Started**: November 1, 2025
