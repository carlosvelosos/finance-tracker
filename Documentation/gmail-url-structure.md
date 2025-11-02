# Gmail URL Structure

This document explains the structure of Gmail URLs, particularly for advanced search functionality.

## URL Structure Overview

Gmail URLs consist of several parts that control the interface and search parameters:

```
https://mail.google.com/mail/u/0/#advanced-search/from=...&subset=...&query=...
```

## URL Components Table

| Part                 | Example Value                     | Description                           | Notes                                                                         |
| -------------------- | --------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| **Base URL**         | `https://mail.google.com/mail`    | Gmail web interface base URL          | Always the same                                                               |
| **Account Selector** | `/u/0/`                           | Specifies which Google account to use | `0` = first account, `1` = second account, etc.                               |
| **Fragment/Hash**    | `#advanced-search/`               | Client-side route identifier          | Opens Gmail's advanced search interface                                       |
| **from**             | `from=%40intersport.se`           | Sender filter                         | `%40` is URL-encoded `@` symbol. Searches emails from specified sender/domain |
| **subset**           | `subset=all`                      | Mail folder to search                 | Options: `all`, `inbox`, `sent`, `spam`, `trash`, `drafts`                    |
| **within**           | `within=1y`                       | Time range filter                     | `1d` = 1 day, `1w` = 1 week, `1m` = 1 month, `1y` = 1 year                    |
| **sizeoperator**     | `sizeoperator=s_sl`               | Size comparison operator              | `s_sl` = smaller than (less than), `s_sg` = greater than, `s_se` = exactly    |
| **sizeunit**         | `sizeunit=s_smb`                  | Size measurement unit                 | `s_skb` = kilobytes, `s_smb` = megabytes, `s_sgb` = gigabytes                 |
| **date**             | `date=2025%2F11%2F02`             | Reference date                        | URL-encoded date (`%2F` = `/`). Sets context for time range filters           |
| **query**            | `query=from%3A(%40intersport.se)` | Gmail search syntax query             | URL-encoded search query (`%3A` = `:`, `%40` = `@`)                           |

## Example URLs

### Example 1: Recent emails from a domain

```
https://mail.google.com/mail/u/0/#advanced-search/from=%40intersport.se&subset=all&within=1d&sizeoperator=s_sl&sizeunit=s_smb&query=from%3A(%40intersport.se)+%40intersport.se
```

**Decoded query:** `from:(@intersport.se) @intersport.se`

**What it does:**

- Searches emails from `@intersport.se` domain
- In all mail folders
- Within the last 1 day
- With size filter enabled (smaller than, in MB)
- Includes emails containing the text "@intersport.se"

### Example 2: Past year emails from a domain

```
https://mail.google.com/mail/u/0/#advanced-search/from=%40intersport.se&subset=all&within=1y&sizeoperator=s_sl&sizeunit=s_smb&date=2025%2F11%2F02&query=from%3A(%40intersport.se)
```

**Decoded query:** `from:(@intersport.se)`

**What it does:**

- Searches emails from `@intersport.se` domain
- In all mail folders
- Within 1 year from November 2, 2025
- With size filter enabled (smaller than, in MB)
- Cleaner query without additional text search

## Gmail Search Query Syntax

The `query` parameter uses Gmail's search operators:

| Operator         | Example                 | Description                           |
| ---------------- | ----------------------- | ------------------------------------- |
| `from:`          | `from:(@intersport.se)` | Emails from specific sender or domain |
| `to:`            | `to:user@example.com`   | Emails sent to specific recipient     |
| `subject:`       | `subject:invoice`       | Emails with specific subject text     |
| `has:attachment` | `has:attachment`        | Emails with attachments               |
| `filename:`      | `filename:pdf`          | Emails with specific file type        |
| `after:`         | `after:2025/01/01`      | Emails after specific date            |
| `before:`        | `before:2025/12/31`     | Emails before specific date           |
| `larger:`        | `larger:10M`            | Emails larger than size               |
| `smaller:`       | `smaller:5M`            | Emails smaller than size              |

## URL Encoding Reference

Common URL-encoded characters in Gmail URLs:

| Character   | Encoded      | Usage                               |
| ----------- | ------------ | ----------------------------------- |
| `@`         | `%40`        | Email addresses and domains         |
| `:`         | `%3A`        | Search operators (from:, to:, etc.) |
| `/`         | `%2F`        | Dates                               |
| ` ` (space) | `+` or `%20` | Separating search terms             |
| `(`         | `%28`        | Grouping in search queries          |
| `)`         | `%29`        | Grouping in search queries          |

## Creating Custom Search URLs

To create a custom Gmail search URL:

1. Start with base: `https://mail.google.com/mail/u/0/#advanced-search/`
2. Add search parameters separated by `&`
3. URL-encode special characters
4. Add the `query=` parameter with Gmail search syntax

Example:

```
https://mail.google.com/mail/u/0/#advanced-search/
  from=%40example.com
  &subset=inbox
  &within=1m
  &query=from%3A(%40example.com)
```

## Tips

- Use Gmail's advanced search UI to construct queries, then copy the URL
- The `query` parameter is the most important - it contains the actual search logic
- Other parameters just pre-fill the advanced search form fields
- Remove unnecessary parameters to simplify URLs
- Test URLs in incognito mode to ensure they work for other users
