# Rico PDF Upload & Extraction Integration Plan

Goal: when a user selects the `Rico` bank in the upload UI and uploads a PDF file, the app should automatically navigate to the Rico PDF parser page (`/pdf-parser/rico`), preload the PDF, run the existing extraction flow, and present the user with an editable/confirmable JSON preview. After user confirmation the JSON is used to create the Supabase table / insert transactions using the existing upload/merge flow.

This document lists the implementation steps, required file changes, UI/UX, edge cases and tests.

## High-level approach

- Add `Rico` option to the upload page bank select and instructions.
- When `Rico` is selected and the user selects a PDF file, store the PDF in a short-lived client-side store (IndexedDB recommended) and navigate to `/pdf-parser/rico?fromUpload=1&key=<id>` where `<id>` is the saved file key.
- On the Rico page, detect the query param and attempt to load the PDF from the client store. If found, automatically run the existing extraction flow, populate the editable snippet textareas, and present the parsed JSON in the preview area but disabled until user confirms.
- Add a small confirmation UI: `Confirm JSON and Upload` button (disabled until user clicks `Confirm`) and `Edit JSON / Re-extract` actions.
- When the user confirms, proceed to the same server-side/upload flow used by the upload page: determine table name (new mapping for Rico), call creation/upload APIs, show conflict analysis (reuse `MergeConflictDialog` / `analyzeUploadConflicts`) and category assignment if needed.

## Files to modify / add

- `app/upload/page.tsx` (modify)

  - Add `Rico` to `BANK_OPTIONS` and an entry in `BANK_INSTRUCTIONS` (brief instructions: upload single PDF, show that user will be redirected to Rico parser for review).
  - When `selectedBank === 'Rico'` and user picks a file, validate that the file type is PDF and then call helper `savePendingPdf(file)` → returns `key`.
  - Redirect with `router.push(`/pdf-parser/rico?fromUpload=1&key=${key}`)` (Next.js `useRouter`, client-side push).

- `app/pdf-parser/rico/page.tsx` (modify / extend)

  - On mount, check query params for `fromUpload=1` and `key`. If present, call `loadPendingPdf(key)` to retrieve the file Blob/ArrayBuffer. If found, set `latestArrayBuffer` and immediately run the extraction flow (`tryOpenAndExtract`), filling `pageTexts`, `page3Snippet2091`, `page3Snippet7102`, and the editable snippet textareas (`editableSnippet2091`, `editableSnippet7102`). Put UI into a `review` state so the user must explicitly confirm JSON to continue.
  - Add UI controls: `Confirm JSON and Upload` (opens existing merge/analysis flow), `Back to Upload` (cleans pending PDF and navigates back to `/upload`), and `Clear pending PDF`.
  - Add a small visual badge informing the user they were redirected from the upload page and must confirm JSON to continue.

- New client helper module: `lib/pendingPdfStore.ts` (add)

  - Minimal IndexedDB helper with 3 exported functions:
    - `savePendingPdf(file: File): Promise<string>` — stores file Blob/ArrayBuffer and returns a short random key (e.g., `rico-<timestamp>-<shortid>`).
    - `loadPendingPdf(key: string): Promise<ArrayBuffer | null>` — retrieves the saved PDF.
    - `deletePendingPdf(key: string): Promise<void>` — removes the stored record.
  - Implementation suggestions: use `idb` small wrapper or the browser `indexedDB` API directly. Keep stored items TTL (cleanup older than N hours) — implement on-demand cleanup when saving or loading.

- Server / API changes: none strictly required if we reuse the existing upload flow. The Rico flow will transform parsed JSON into the same `transactions` format consumed by `uploadToSupabase`.

## UI / UX details

- Upload page behavior for `Rico`:

  - When the user picks a file and `selectedBank === 'Rico'`:
    - Validate file is `application/pdf` (or `.pdf` extension).
    - Save with `savePendingPdf(file)` → get `key`.
    - `router.push(`/pdf-parser/rico?fromUpload=1&key=${key}`)`.

- Rico page behavior:
  - On mount, if `fromUpload=1` and `key` present, attempt to `loadPendingPdf(key)`.
  - If load succeeds: set `latestArrayBuffer` and run `tryOpenAndExtract`. Populate the editable snippet textareas automatically (call `setEditableSnippet2091(s1)` etc.).
  - Show a review state: parsed JSON in preview, but greyed/disabled. Show buttons:
    - `Confirm JSON and Upload` — when clicked, call a local function to translate JSON into `transactions` and hand off to existing `analyzeUploadConflicts` + `uploadToSupabase` flow. Keep the merge dialog flow intact.
    - `Edit Snippets` — allow user to modify the textareas (already present) and click `Convert Edited to JSON` to re-parse.
    - `Cancel & Back` — delete pending PDF from store and `router.push('/upload')`.

## Data transformations

- Use `buildStructuredJSON()` / `parseSnippetToRecords()` to obtain structured records.
- Convert the JSON structure into the `transactions` format expected by the upload page and `uploadToSupabase`. Add a small adapter function in `page.tsx` or `lib/ricoAdapter.ts` that maps parsed records to the app's `Transaction` shape (fields: date, description, amount, currency, etc.).

## Table naming and Supabase handling

- Decide the table name convention for Rico PDF imports (add mapping in `getTableName` used by the upload page or create a helper used by the Rico page):
  - e.g., `RICO_YYYYMM` or `RICO_PDF_YYYYMM`.
- Implement or reuse existing logic to extract year/month: attempt to read from the PDF (not trivial) or from the original filename (we saved the file, so store original filename in IndexedDB with the blob) — fall back to current year/month.

## Conflict resolution & category flow

- After user confirms JSON, call `analyzeUploadConflicts(tableName, transactions, autoSkipDuplicates)` and show the existing `MergeConflictDialog` UI with the returned analysis. This reuses the existing upload/merge UX and avoids duplicating logic.
- After merge/upload succeed, optionally trigger `analyzeCategoryMatches` and the `CategoryAssignmentDialog` as the upload page does.

## Error handling and edge cases

- If `loadPendingPdf` fails (missing key or store corruption), show a helpful error and link back to the upload page.
- If the PDF is large or IndexedDB storage quota is exceeded, fall back to prompting the user to re-upload directly on the Rico page (provide a file input there and skip IndexedDB). Document this fallback.
- Secure deletion: always call `deletePendingPdf(key)` after successful upload or explicit user cancel.

## Security & privacy

- Keep pending PDFs short-lived (TTL), delete after use.
- Never send the raw PDF to any external third-party services from the browser unless the user authorizes it.

## Tests & manual QA

1. Unit tests (where feasible)

   - `lib/pendingPdfStore` functions (save/load/delete) using IndexedDB mock.
   - `lib/ricoAdapter` conversion from parsed JSON → `Transaction`.

2. Manual QA
   - Select `Rico` in upload page → upload a sample Rico PDF → app redirects to Rico page and auto-extracts.
   - Edit snippet to add/remove a row, click `Convert Edited to JSON`, verify JSON preview updates.
   - Click `Confirm JSON and Upload` → confirm merge dialog appears (or success message if no conflicts). Verify transactions inserted in Supabase table.
   - Test cancellation: Cancel at Rico page and ensure pending PDF is removed and the upload page shows again.
   - Test fallback path: disable IndexedDB (or force quota) and verify the Rico page asks for manual upload.

## Implementation timeline (suggested incremental approach)

1. Add `Rico` option/instruction to `app/upload/page.tsx` and basic redirect with a temporary in-memory store (fast prototyping).
2. Implement `lib/pendingPdfStore` using IndexedDB and rewrite redirect logic to use it.
3. Update `app/pdf-parser/rico/page.tsx` to load and auto-extract when `fromUpload=1` is present; prefill editable textareas and lock UI into review mode.
4. Add `Confirm JSON and Upload` wiring to reuse existing conflict/upload flows.
5. Add cleanup, error handling, TTL, and tests.
6. QA and iterate on parsing heuristics given actual Rico PDFs.

## Helpful code snippets (conceptual)

Save & redirect (upload page):

```ts
// upload page
const key = await savePendingPdf(file); // returns 'rico-12345'
router.push(`/pdf-parser/rico?fromUpload=1&key=${encodeURIComponent(key)}`);
```

Load & auto-extract (rico page):

```ts
// rico page, on mount
const params = new URLSearchParams(window.location.search);
if (params.get("fromUpload") === "1" && params.get("key")) {
  const key = params.get("key")!;
  const buf = await loadPendingPdf(key);
  if (buf) {
    setLatestArrayBuffer(buf);
    await tryOpenAndExtract(buf); // existing function will set pageTexts and snippets
    setEditableSnippet2091(page3Snippet2091);
    setEditableSnippet7102(page3Snippet7102);
    // lock UI to review state
  }
}
```

Convert parsed JSON to transactions and upload (on confirm):

```ts
const parsed = buildStructuredJSON(editedS1, editedS2);
const transactions = ricoAdapter(parsed); // new helper to map to Transaction[]
const analysis = await analyzeUploadConflicts(
  tableName,
  transactions,
  autoSkip,
); // reuse
// show MergeConflictDialog with analysis
```

## Notes and trade-offs

- Storing PDFs between pages requires client-side storage. Using `window` global is brittle (works only with client-side navigation and not across reloads). IndexedDB is robust and recommended.
- The approach reuses existing conflict/upload/category flows to avoid duplicating backend logic.
- The editable preview gives the user final control over what is uploaded, which solves edge cases where parsing heuristics fail.

---

If you want, I can:

- Create the `lib/pendingPdfStore.ts` stub and wire the redirect in `app/upload/page.tsx` (fast iteration), or
- Implement the full feature (IndexedDB store, Rico page auto-load & confirm flow) and add a small end-to-end test checklist.

Which option do you prefer next?
