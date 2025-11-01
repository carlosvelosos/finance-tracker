# Email Full Content & Attachments Feature - Design Requirements

## Overview

Enhance the email client to display full email content and attachment information, building upon the existing snippet preview functionality.

## Current State Analysis

### What We Have

- Email snippets (140 character preview from Gmail)
- Expandable email cards showing snippet
- Email metadata (from, subject, date, to)
- Ignored email functionality
- Full email payload data already fetched from API

### What's Missing

- Full email body extraction and display
- Attachment detection and information
- HTML vs plain text handling
- Base64url decoding for email content
- UI for viewing full content

## Design Requirements

### 1. User Experience Flow

#### Current Flow

```
[Collapsed Email Card]
  └─> Click → [Expanded Card with Snippet]
```

#### Proposed Enhanced Flow

```
[Collapsed Email Card]
  └─> Click → [Expanded Card with Snippet + Attachment Icons + "View Full Email" Button]
      └─> Click "View Full Email" → [New Page/Modal with Full Content]
```

### 2. Full Email Display Options

#### Option A: New Page (✅ SELECTED)

**Pros:**

- ✅ More screen real estate for content
- ✅ Can view full email without losing place in email list
- ✅ Browser back button works naturally
- ✅ Can open multiple emails in different tabs
- ✅ Shareable URL (could bookmark specific email view)
- ✅ Better for long emails with attachments

**Cons:**

- ❌ Requires navigation away from list
- ❌ Need to implement routing for email detail page

#### Option B: Modal/Dialog

**Pros:**

- ✅ Stay on same page
- ✅ Quick to implement
- ✅ No routing needed

**Cons:**

- ❌ Limited screen space
- ❌ Scroll issues with long emails
- ❌ Can't view multiple emails simultaneously

#### Option C: Inline Expansion

**Pros:**

- ✅ No navigation required
- ✅ Simplest implementation

**Cons:**

- ❌ Can make page very long
- ❌ Poor UX for emails with lots of content
- ❌ Scrolling becomes cumbersome

**Recommendation:** **Option A (New Page)** for best user experience with financial emails that may contain important details and attachments.

### 3. Feature Specifications

#### 3.1 Email Body Extraction

**Requirements:**

- Extract email body from `payload.body.data` or `payload.parts[]`
- Decode base64url encoded content
- Support both plain text and HTML formats
- Handle multipart emails (text + HTML alternatives)
- Preserve email formatting
- Sanitize HTML to prevent XSS attacks

**Content Priority:**

1. HTML version (if available) - better formatting
2. Plain text version (fallback)
3. Snippet (if body extraction fails)

#### 3.2 Attachment Detection & Display

**Requirements:**

- Parse `payload.parts[]` to identify attachments
- Detection criteria:
  - Has `filename` property with non-empty value
  - OR has `Content-Disposition: attachment` header
- Display attachment information:
  - Filename
  - File size (human-readable format: KB, MB)
  - MIME type / file type icon
  - Count of attachments
- Show attachment indicator on collapsed/expanded card
- List all attachments in full email view

**Attachment Actions (Future Enhancement):**

- Download attachment (requires additional API call with `attachmentId`)
- Preview attachment (for images, PDFs)

#### 3.3 UI Components

**A. Email List Card Enhancement**

- Add attachment icon (📎) badge when email has attachments
- Show attachment count: "📎 3 attachments"
- Add "View Full Email" button in expanded state
- Position button prominently but not intrusively

**B. Full Email Page/View**

```
┌─────────────────────────────────────────────────┐
│ [← Back to Emails]                    [✕ Close] │
├─────────────────────────────────────────────────┤
│ Subject: Monthly Bank Statement                  │
│ From: bank@example.com                          │
│ To: user@example.com                            │
│ Date: January 15, 2025 at 10:30 AM             │
├─────────────────────────────────────────────────┤
│ 📎 Attachments (2)                              │
│   • statement.pdf (245 KB)                      │
│   • summary.xlsx (18 KB)                        │
├─────────────────────────────────────────────────┤
│                                                  │
│ [Full Email Content Rendered Here]              │
│ - HTML rendered with proper styling             │
│ - OR plain text with line breaks preserved      │
│                                                  │
└─────────────────────────────────────────────────┘
```

**C. Visual Design**

- Consistent with existing card design
- Clear visual hierarchy
- Responsive layout for mobile/tablet
- Loading states for content extraction
- Error states if content fails to load

### 4. Technical Implementation Plan

#### Phase 1: Email Body Extraction Utilities

**Files to Create/Modify:**

- `lib/utils/emailParser.ts` (new file)

**Functions Needed:**

```typescript
// Decode base64url encoded data
function decodeBase64Url(data: string): string;

// Extract email body from payload
function extractEmailBody(payload: EmailPayload): {
  html: string | null;
  text: string | null;
  hasContent: boolean;
};

// Recursively parse email parts
function parseEmailParts(parts: EmailPart[]): {
  bodyParts: { type: string; content: string }[];
  attachments: AttachmentInfo[];
};

// Sanitize HTML content
function sanitizeHtmlContent(html: string): string;
```

#### Phase 2: Attachment Detection

**Functions Needed:**

```typescript
// Detect if email part is attachment
function isAttachment(part: EmailPart): boolean;

// Extract attachment metadata
function extractAttachments(payload: EmailPayload): AttachmentInfo[];

// Format file size for display
function formatFileSize(bytes: number): string;

// Get file type icon based on MIME type
function getFileTypeIcon(mimeType: string): string;
```

**New Interface:**

```typescript
interface AttachmentInfo {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId?: string; // For future download functionality
}
```

#### Phase 3: Full Email Page/Route

**Option A (New Page) - SELECTED:**

- Create `app/email-client/[emailId]/page.tsx`
- Implement dynamic routing for email detail view
- Pass email data via URL params or fetch from state
- Add navigation methods

#### Phase 4: UI Integration

**Modify:** `app/email-client/page.tsx`

**Updates:**

1. Add attachment detection to email display logic
2. Add attachment badges to email cards
3. Add "View Full Email" button to expanded cards
4. Implement navigation to full email view
5. Update email state management

#### Phase 5: Styling & Polish

- CSS for HTML email rendering
- Iframe sandbox for HTML emails (security)
- Loading skeletons
- Error boundaries
- Responsive design
- Dark mode compatibility

## Implementation Todo List

### 📋 Phase 1: Core Utilities (Foundation)

- [ ] Create `lib/utils/emailParser.ts`
- [ ] Implement `decodeBase64Url()` function
- [ ] Implement `extractEmailBody()` function
- [ ] Implement `parseEmailParts()` recursive function
- [ ] Implement `sanitizeHtmlContent()` with DOMPurify or similar
- [ ] Add unit tests for email parsing utilities

### 📋 Phase 2: Attachment Detection

- [ ] Add `AttachmentInfo` interface to types
- [ ] Implement `isAttachment()` detection logic
- [ ] Implement `extractAttachments()` function
- [ ] Implement `formatFileSize()` helper
- [ ] Implement `getFileTypeIcon()` with icon mapping
- [ ] Test with various email types (with/without attachments)

### 📋 Phase 3: Email Card Enhancement

- [ ] Add attachment count state to email data
- [ ] Create attachment badge component
- [ ] Add attachment badge to collapsed card view
- [ ] Add attachment list to expanded card view
- [ ] Add "View Full Email" button component
- [ ] Style button to match existing design
- [ ] Add icon to button (e.g., external link, expand icon)

### 📋 Phase 4: Full Email View (New Page Approach)

- [ ] Create route: `app/email-client/[emailId]/page.tsx`
- [ ] Implement email detail page component
- [ ] Add email data retrieval logic (from state or re-fetch)
- [ ] Create email header section (subject, from, to, date)
- [ ] Create attachments section with list
- [ ] Create email body section
- [ ] Implement HTML rendering (with iframe or sanitized div)
- [ ] Implement plain text rendering with formatting
- [ ] Add "Back to Emails" navigation
- [ ] Add close/exit button
- [ ] Handle routing from main email list
- [ ] Test browser back button behavior

### 📋 Phase 5: Content Rendering

- [ ] Create HTML email renderer component
- [ ] Implement iframe sandbox for HTML emails
- [ ] Style iframe content (CSS injection if needed)
- [ ] Create plain text renderer with preserved formatting
- [ ] Add content type toggle (if both HTML and text available)
- [ ] Implement loading states
- [ ] Implement error states
- [ ] Add "Content not available" fallback

### 📋 Phase 6: Security & Safety

- [ ] Implement HTML sanitization (remove scripts, dangerous tags)
- [ ] Set up iframe sandbox with restricted permissions
- [ ] Block external image loading (or add privacy option)
- [ ] Sanitize inline styles
- [ ] Add Content Security Policy headers
- [ ] Test with malicious email samples

### 📋 Phase 7: Uploaded Files Support

- [ ] Update uploaded email JSON structure to include body data
- [ ] Ensure `exportCurrentEmails()` includes full payload
- [ ] Update file upload handler to preserve email parts
- [ ] Test full email view with uploaded files
- [ ] Update Smart Fetching to preserve full content

### 📋 Phase 8: Polish & UX

- [ ] Add loading skeletons for email detail page
- [ ] Implement responsive design for mobile/tablet
- [ ] Add dark mode styles for email content
- [ ] Add print stylesheet for email view
- [ ] Optimize for long emails (virtual scrolling?)
- [ ] Add keyboard shortcuts (ESC to close, etc.)
- [ ] Add email metadata (size, labels if available)
- [ ] Show ignored status in full view

### 📋 Phase 9: Testing & Edge Cases

- [ ] Test with plain text only emails
- [ ] Test with HTML only emails
- [ ] Test with multipart (text + HTML) emails
- [ ] Test with emails containing attachments
- [ ] Test with emails without body content
- [ ] Test with very long emails
- [ ] Test with emails containing inline images
- [ ] Test with forwarded/replied emails
- [ ] Test with various email clients (Gmail, Outlook, etc.)
- [ ] Test navigation flow thoroughly

### 📋 Phase 10: Documentation

- [ ] Update code comments
- [ ] Document email parsing logic
- [ ] Add JSDoc to new functions
- [ ] Update README with new features
- [ ] Create user guide for full email view

## Dependencies & Libraries

### Recommended Additions:

```json
{
  "dompurify": "^3.0.0", // HTML sanitization
  "isomorphic-dompurify": "^2.0.0", // For SSR compatibility
  "@types/dompurify": "^3.0.0" // TypeScript types
}
```

### Alternatives:

- `sanitize-html` - More configurable but heavier
- Custom regex-based sanitizer - Lightweight but risky

## Future Enhancements (Out of Scope)

- [ ] Download attachments functionality
- [ ] Attachment preview (images, PDFs)
- [ ] Reply to email
- [ ] Forward email
- [ ] Print email
- [ ] Share email link
- [ ] Search within email content
- [ ] Email thread view (conversations)

## Questions for Review

1. **New Page vs Modal**: ✅ New Page approach selected
2. **HTML Rendering**: Should we render HTML in an iframe (safer) or sanitized div (better performance)?
3. **Attachments**: Do we need download functionality now, or just display info?
4. **Uploaded Files**: Should exported files include full email body data?
5. **Priority**: Which phase should we start with, or tackle all at once?

## Estimated Effort

- **Phase 1-3**: 2-3 hours (Core utilities + UI enhancement)
- **Phase 4**: 2-3 hours (New page/route)
- **Phase 5-6**: 2-3 hours (Rendering + Security)
- **Phase 7-9**: 2-3 hours (Upload support + Testing)
- **Total**: ~8-12 hours for complete implementation

## Implementation Status

**Status**: In Progress  
**Started**: November 1, 2025  
**Approach**: New Page (Option A)

---

_This document will be updated as implementation progresses._
