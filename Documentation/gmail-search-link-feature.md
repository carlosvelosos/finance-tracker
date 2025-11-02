# Gmail Search Link Feature - Design Requirements

## Overview

Add functionality to the "Emails by Sender" section that allows users to quickly open Gmail's advanced search with a pre-configured query for the currently selected domain.

## Feature Location

**Section:** Emails by Sender
**Trigger:** When a user clicks on a domain (e.g., `intersport.se`)
**UI Element:** Button displayed next to the filter status text

## Functional Requirements

### 1. Button Display Conditions

- **Show button when:**
  - A specific domain is selected (not "all senders")
  - `selectedSenderFilter` does NOT include `@` symbol (is a domain, not a full email)
- **Hide button when:**
  - "All Senders" is selected (`selectedSenderFilter === "all"`)
  - A specific sender email is selected (`selectedSenderFilter` includes `@`)

### 2. Button Appearance

- **Position:** Next to the text "Showing X emails from @domain"
- **Icon:** Gmail logo or external link icon
- **Label:** "Open in Gmail" or "Search Gmail"
- **Style:** Secondary/outline button to avoid drawing too much attention
- **Size:** Small (sm) to match the "Clear Filter" button

### 3. URL Generation Logic

The button should generate a Gmail advanced search URL with the following parameters:

#### Required Parameters

| Parameter | Value              | Description                                              |
| --------- | ------------------ | -------------------------------------------------------- |
| `from`    | `@{domain}`        | URL-encoded domain (e.g., `%40intersport.se`)            |
| `subset`  | `all`              | Search in all mail folders                               |
| `within`  | `1y`               | Search within 1 year from current date                   |
| `date`    | `YYYY/MM/DD`       | Current date (URL-encoded: `YYYY%2FMM%2FDD`)             |
| `query`   | `from:(@{domain})` | Gmail search query (URL-encoded: `from%3A(%40{domain})`) |

#### Example Generated URL

For domain `intersport.se` on November 2, 2025:

```
https://mail.google.com/mail/u/0/#advanced-search/from=%40intersport.se&subset=all&within=1y&date=2025%2F11%2F02&query=from%3A(%40intersport.se)
```

### 4. Function Signature

```typescript
const openGmailSearch = (domain: string) => {
  // Get current date in YYYY/MM/DD format
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const dateStr = `${year}/${month}/${day}`;

  // URL encode the domain
  const encodedDomain = encodeURIComponent(`@${domain}`);

  // Build the query parameter
  const query = encodeURIComponent(`from:(@${domain})`);

  // URL encode the date
  const encodedDate = encodeURIComponent(dateStr);

  // Build the complete URL
  const gmailUrl = `https://mail.google.com/mail/u/0/#advanced-search/from=${encodedDomain}&subset=all&within=1y&date=${encodedDate}&query=${query}`;

  // Open in new tab
  window.open(gmailUrl, "_blank", "noopener,noreferrer");
};
```

### 5. User Flow

1. User navigates to "Emails by Sender" section
2. User clicks on a domain name (e.g., `intersport.se`)
3. Email list filters to show emails from that domain
4. Header displays: "Showing X emails from @intersport.se" with "Gmail" button and "Clear Filter" button
5. User clicks "Gmail" button
6. New tab opens with Gmail advanced search pre-configured for that domain
7. User can see all emails from that domain in Gmail (potentially more than what's in local cache)

## UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Emails by Sender (123)                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Navigation Panel │        Email List Panel                  │ │
│ │                  │                                           │ │
│ │ [All Senders]    │  ┌─────────────────────────────────────┐ │ │
│ │                  │  │ Showing 2 emails from @intersport.se │ │ │
│ │ > intersport.se  │  │                                       │ │ │
│ │   kundservice    │  │  [🔗 Gmail]  [✕ Clear Filter]       │ │ │
│ │   noreply        │  └─────────────────────────────────────┘ │ │
│ │                  │                                           │ │
│ │ > example.com    │  [Email 1 from kundservice@intersport...] │ │
│ │                  │  [Email 2 from noreply@intersport.se...] │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Implementation

### Component Changes

**File:** `app/email-client/page.tsx`

**Location:** In the "Emails by Sender" section, within the email list panel header

**Code Addition:**

```tsx
<div className="flex items-center justify-between mb-2">
  <p className="text-sm text-muted-foreground">
    {selectedSenderFilter === "all"
      ? `Showing all ${filteredEmailsBySender.length} emails`
      : selectedSenderFilter.includes("@")
        ? `Showing ${filteredEmailsBySender.length} emails from ${selectedSenderFilter}`
        : `Showing ${filteredEmailsBySender.length} emails from @${selectedSenderFilter}`}
  </p>
  <div className="flex items-center gap-2">
    {/* NEW: Gmail Search Button - Only show when domain is selected */}
    {selectedSenderFilter !== "all" && !selectedSenderFilter.includes("@") && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => openGmailSearch(selectedSenderFilter)}
        className="gap-2"
      >
        <ExternalLink className="h-4 w-4" />
        Gmail
      </Button>
    )}
    {selectedSenderFilter !== "all" && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSelectedSenderFilter("all")}
      >
        <X className="h-4 w-4 mr-1" />
        Clear Filter
      </Button>
    )}
  </div>
</div>
```

### Helper Function

Add the `openGmailSearch` function in the component body:

```typescript
// Function to open Gmail advanced search for a domain
const openGmailSearch = useCallback((domain: string) => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const dateStr = `${year}/${month}/${day}`;

  const encodedDomain = encodeURIComponent(`@${domain}`);
  const query = encodeURIComponent(`from:(@${domain})`);
  const encodedDate = encodeURIComponent(dateStr);

  const gmailUrl = `https://mail.google.com/mail/u/0/#advanced-search/from=${encodedDomain}&subset=all&within=1y&date=${encodedDate}&query=${query}`;

  window.open(gmailUrl, "_blank", "noopener,noreferrer");
}, []);
```

## Acceptance Criteria

- [ ] Button appears when domain is selected
- [ ] Button does NOT appear when "All Senders" is selected
- [ ] Button does NOT appear when specific sender email is selected
- [ ] Clicking button opens new tab with correct Gmail URL
- [ ] URL contains correct domain (URL-encoded)
- [ ] URL contains correct date (current date, URL-encoded)
- [ ] URL specifies 1 year time range
- [ ] URL searches in all mail folders
- [ ] Gmail search shows emails from all senders in that domain
- [ ] Button is visually consistent with existing UI
- [ ] Button has proper accessibility attributes

## Future Enhancements

### Optional Features (Not in MVP)

1. **Configurable Time Range**

   - Add dropdown to select time range (1d, 1w, 1m, 1y)
   - Store user preference in localStorage

2. **Multiple Gmail Accounts**

   - Detect which Gmail account is being used
   - Adjust `/u/0/` to correct account index

3. **Additional Search Filters**

   - Add option to include only emails with attachments
   - Add subject keyword filter
   - Add size filters

4. **Gmail Link for Individual Senders**
   - Show button when specific sender is selected
   - Use full email address instead of domain

## Testing Scenarios

1. **Domain Selection**

   - Click on domain → Button appears
   - Click on specific sender → Button disappears
   - Click "All Senders" → Button disappears

2. **URL Generation**

   - Verify correct domain encoding
   - Verify correct date format and encoding
   - Verify correct query syntax

3. **Browser Behavior**

   - Verify new tab opens
   - Verify Gmail loads correctly
   - Verify search is pre-populated
   - Verify no popup blockers interfere

4. **Edge Cases**
   - Domain with special characters
   - Domain with international characters
   - Very long domain names

## Related Documentation

- [Gmail URL Structure](./gmail-url-structure.md) - Reference for URL parameters and encoding

## Success Metrics

- User can quickly access Gmail to see more emails from a domain
- Reduces friction for users who want to verify or cross-reference data
- Provides seamless integration between local cache and live Gmail data
