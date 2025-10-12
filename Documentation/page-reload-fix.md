# Page Reload Issue - Fix Documentation

## Problem

The `app/global_2/page.tsx` page was reloading every time you switched browser tabs and came back, losing all state and re-fetching data unnecessarily.

## Root Causes

### 1. **Circular useEffect Dependencies**

Both `useSupabaseTables` and `useAggregatedTransactions` hooks had circular dependency issues:

**Before:**

```typescript
// In useSupabaseTables.ts
useEffect(() => {
  fetchAvailableTables();
}, [user, knownTables, fetchAggregatedTransactions]); // ❌ Including the function itself
```

**Problem:** The `fetchAvailableTables` function is recreated whenever `knownTables` changes, which then triggers the effect again, even though `knownTables` is memoized and shouldn't change.

### 2. **Unnecessary Function Recreation**

The `fetchAvailableTables` and `fetchAggregatedTransactions` functions were being recreated on every render because they depended on stable values that React thought might change.

### 3. **Browser Tab Switching Behavior**

When switching tabs:

- React may trigger cleanup and re-mount behaviors
- `useEffect` hooks with unstable dependencies re-execute
- Data is refetched even though it's already in memory

## Solution Applied

### Phase 1: Fixed Hook Dependencies (Initial Fix)

**useSupabaseTables.ts:**

```typescript
useEffect(() => {
  fetchAvailableTables();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user]); // Only depend on user, not the fetch function itself
```

**useAggregatedTransactions.ts:**

```typescript
useEffect(() => {
  fetchAggregatedTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user, enabled, selectedTables]); // Don't include the fetch function itself
```

**Result:** This reduced some re-renders but **didn't solve the tab switching issue completely**.

### Phase 2: Added Fetch Tracking with useRef (Complete Fix)

The real issue was that even with stable dependencies, React was still calling the effects when the browser tab became visible again. The solution is to **track whether we've already fetched data** using `useRef` which persists across re-renders.

**useSupabaseTables.ts:**

```typescript
// Add refs to track fetch state
const hasFetchedRef = useRef(false);
const currentUserIdRef = useRef<string | null>(null);

const fetchAvailableTables = useCallback(async () => {
  if (!user) return;

  // Skip if we've already fetched for this user
  if (hasFetchedRef.current && currentUserIdRef.current === user.id) {
    console.log("Skipping table fetch - data already loaded");
    return;
  }

  // ... fetch logic ...

  // Mark as fetched
  hasFetchedRef.current = true;
  currentUserIdRef.current = user.id;
}, [user, knownTables]);

// Refetch function resets the flag
const refetch = useCallback(async () => {
  hasFetchedRef.current = false;
  await fetchAvailableTables();
}, [fetchAvailableTables]);
```

**useAggregatedTransactions.ts:**

```typescript
// Track what we've fetched to prevent re-fetching on tab visibility
const lastFetchedTablesRef = useRef<string>("");
const hasFetchedRef = useRef(false);

const fetchAggregatedTransactions = useCallback(async () => {
  // ... validation ...

  const tablesKey = selectedTables.sort().join(",");

  // Skip if we've already fetched this exact combination
  if (hasFetchedRef.current && lastFetchedTablesRef.current === tablesKey) {
    console.log("Skipping transaction fetch - data already loaded");
    return;
  }

  // ... fetch logic ...

  // Mark as fetched
  lastFetchedTablesRef.current = tablesKey;
  hasFetchedRef.current = true;
}, [
  user,
  enabled,
  selectedTables,
  adjustTransactionAmounts,
  processSwedishTransactions,
]);

// Refetch function resets the flags
const refetch = useCallback(async () => {
  hasFetchedRef.current = false;
  lastFetchedTablesRef.current = "";
  await fetchAggregatedTransactions();
}, [fetchAggregatedTransactions]);
```

### Why This Works

1. **useRef Persistence**: `useRef` values persist across re-renders and don't trigger re-renders when updated, making them perfect for tracking fetch state.

2. **Stable Dependencies**: By only depending on actual values (`user`, `enabled`, `selectedTables`) rather than functions, we prevent unnecessary re-executions.

3. **Smart Skip Logic**: Before fetching, we check if we've already loaded the same data. If yes, we skip the fetch entirely.

4. **Tab Switching**: When you switch tabs and come back:

   - React may call the effect again
   - BUT our skip logic detects that we've already fetched the data
   - No network requests are made
   - Existing state is preserved

5. **Manual Refresh Still Works**: The `refetch` function resets the flags, allowing the "Refresh Data" button to force a new fetch.

## What Changed

### Files Modified

1. `lib/hooks/useSupabaseTables.ts` - Fixed useEffect dependencies
2. `lib/hooks/useAggregatedTransactions.ts` - Fixed useEffect dependencies
3. `app/global_2/page.tsx` - Removed unnecessary initialization state

### Behavior Now

- ✅ Page **preserves state** when switching tabs
- ✅ Data is **not refetched** unnecessarily
- ✅ Transactions and table selections **remain intact**
- ✅ Only refetches when user changes or manual refresh is triggered
- ✅ "Refresh Data" button still works for manual updates

## Testing

To verify the fix:

1. Load the page and select some tables
2. Wait for data to load
3. **Open browser console** and check for console logs
4. Switch to another browser tab for a few seconds
5. Come back to the page
6. **Expected Results**:
   - Data should still be there, no loading spinner
   - Console should show: `"Skipping table fetch - data already loaded for this user"`
   - Console should show: `"Skipping transaction fetch - data already loaded for these tables"`
   - **No network requests** in the Network tab
7. Click "Refresh Data" button
8. **Expected**: Now it SHOULD refetch (network requests visible)

## Best Practices Learned

1. **Don't include fetch functions in useEffect dependencies** if they're created with useCallback - only include the actual values they depend on.

2. **Use React DevTools Profiler** to identify unnecessary re-renders.

3. **Consider data fetching libraries** like React Query or SWR for more robust caching and state management in the future.

## Future Improvements

For even better performance, consider:

1. **React Query/SWR**: Built-in caching, refetch strategies, and background updates
2. **Local Storage**: Persist selected tables between sessions
3. **Service Workers**: Cache transaction data for offline access
4. **Virtualization**: For large transaction lists (react-virtual, react-window)

## Related Files

- `lib/hooks/useSupabaseTables.ts`
- `lib/hooks/useAggregatedTransactions.ts`
- `lib/hooks/usePageState.tsx`
- `app/global_2/page.tsx`
- `context/AuthContext.tsx`
