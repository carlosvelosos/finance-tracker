# Quick Reference: Debugging Insert Operation Issues

## If You See This Error...

### Error Message: "Insert failed: No data returned from insert operation"

**What This Means (Before Fix):**

- Table was created but REST API doesn't recognize it yet (404 error returned as empty object)
- OR actual insert failed but error object is malformed

**What This Means (After Fix):**

- All retries exhausted - most likely persistent network issue
- OR REST API in degraded state

**Quick Fixes:**

1. Try again (should work if it was transient)
2. Check Supabase dashboard - is table created?
3. Check network connectivity
4. Wait 5 seconds and try again

---

## Console Log Reading Guide

### 🟢 Good - Everything Working

```
[FIX #2] Waiting 1 second for REST API cache to update...
[FIX #2] REST API cache update delay completed
[FIX #3] Insert attempt 1/2...
[DEBUG] Insert attempt 1 - error object keys: []
[FIX #1] [FIX #3] Empty error object detected (likely HTTP 404 - REST API cache not updated yet). Retrying...
[FIX #3] Insert attempt 2/2...
[SUCCESS] Insert completed without error...
[SUCCESS] Upload to Supabase completed successfully.
```

→ First insert hit 404, retry succeeded. Working as designed.

---

### 🟡 Acceptable - Warm Cache

```
[FIX #2] Waiting 1 second for REST API cache to update...
[FIX #2] REST API cache update delay completed
[FIX #3] Insert attempt 1/2...
[DEBUG] Insert attempt 1 - error object keys: []  ← NO KEYS = null error
[FIX #3] Insert attempt 1 completed. Has error properties: false, Is empty object: false
[SUCCESS] Insert completed without error...
```

→ Table already cached, first insert succeeded. No retry needed.

---

### 🔴 Problem - Persistent Error

```
[FIX #3] Insert attempt 1/2...
[DEBUG] Insert attempt 1 - error object keys: ["code", "message", "details"]
[DEBUG] Insert attempt 1 - full error: {code: "42P01", message: "relation... does not exist"}
[FIX #3] Insert attempt 2/2...
[ERROR] Insert failed: No data returned from insert operation
```

→ Table doesn't exist. Need to create it or check permissions.

---

### 🔴 Problem - Database Constraint

```
[FIX #3] Insert attempt 1/2...
[DEBUG] Insert attempt 1 - error object keys: ["code", "message"]
[DEBUG] Insert attempt 1 - full error: {code: "23505", message: "duplicate key value"}
[ERROR] Insert error details: {code: "23505", ...}
[ERROR] Duplicate key error detected...
```

→ Records already exist. Use "Clear existing data" option to overwrite.

---

## Fix Identification Guide

### Which Fix Helped?

**If you see `[FIX #1]`:**

- Empty error object was detected and correctly identified as 404
- System recovered without manual intervention ✓

**If you see `[FIX #2]`:**

- REST API cache delay was applied
- Reduced chance of 404 on first insert ✓

**If you see `[FIX #3]` with attempt 2:**

- First insert failed, automatic retry triggered
- Second attempt succeeded ✓

**If you see `[FIX #4]`:**

- Error detection improved to handle edge cases
- Better error messages shown ✓

**If you see `[DEBUG]` with detailed objects:**

- Comprehensive logging helping diagnose issues
- Can track exact error codes and messages ✓

---

## Troubleshooting Decision Tree

```
User clicks "Commit Transaction"
    ↓
✓ SUCCESS message appears
    → All good! (Check console to see which fix helped)
    ↓
✗ ERROR message appears
    ↓
    Is the error message about duplicate keys (23505)?
    ├─ YES → Use "Clear existing data" option and retry
    └─ NO → Continue below
    ↓
    Check console for `[DEBUG]` error details
    ├─ Contains "404" or "does not exist"
    │   → Table creation failed or permissions issue
    │   → Contact admin or check Supabase dashboard
    │
    ├─ Contains network/timeout error
    │   → Network connectivity issue
    │   → Wait and retry
    │
    ├─ Contains `[FIX #3]` with 2/2 attempts
    │   → Both retries failed with same error
    │   → Persistent issue, not transient
    │   → Contact admin
    │
    └─ Other error
        → See console error details
        → Note the error code
        → Contact support with error code
```

---

## Performance Expectations

### First Time (New Table)

- Duration: 6-7 seconds
- Includes: 1s cache delay + potential 500ms retry
- Console shows: `[FIX #2]`, `[FIX #3]`, possibly `[FIX #1]`

### Subsequent Times (Cached Table)

- Duration: 1-2 seconds
- No cache delay (table already known to REST API)
- Console shows: `[FIX #3]` attempt 1/2 only

### With Error

- Duration: 2-4 seconds
- Console shows: Error details immediately
- No lengthy retries on real errors (FIX #1 distinguishes)

---

## Console Filtering Tips

### Show Only Insert Operation Logs

Browser DevTools Filter:

```
uploadToSupabase|Insert|FIX #3|[SUCCESS]|[ERROR]
```

### Show Only Errors and Fixes

Browser DevTools Filter:

```
FIX #|ERROR|failed
```

### Show All Debugging

Browser DevTools Filter:

```
DEBUG|FIX #
```

---

## Performance Checklist

- [ ] First insert doesn't always retry (not every insert sees FIX #3 attempt 2)
- [ ] Retry delay is only 500ms (not 1s)
- [ ] Total delay for new table is ~1.5s max
- [ ] Subsequent inserts don't have 1s delay (cache already warm)
- [ ] Error detection is immediate (no false retries)

---

## Contact Information for Issues

If you see persistent errors:

1. **Screenshot the error message**
2. **Copy console logs** (right-click → Export as HAR)
3. **Note the table name** (e.g., "INACC_202511")
4. **Note if it's first upload or repeat**
5. **Contact**: [Support Email]

Include:

- Error message text
- Console logs (with `[FIX #` tags)
- Table name
- Bank account type
- Number of transactions being uploaded

---

## For Developers: Testing the Fix

### Test Case 1: New Table Creation

```javascript
// Reset your test environment
// 1. Delete table from Supabase
// 2. Select same bank account
// 3. Upload same file
// Expected: Should succeed without "Insert failed" error
// Check: Console should show [FIX #2] and [FIX #3]
```

### Test Case 2: Duplicate Key Error

```javascript
// Same file uploaded twice without clearing
// Expected: Should show duplicate key error (not 404 error)
// Check: Console should show code "23505"
```

### Test Case 3: Retry Validation

```javascript
// Monitor console during first insert to new table
// Expected: Should see "Insert attempt 1/2" then "Insert attempt 2/2"
// OR: Should see both succeed on first attempt (if cache is warm)
```

---

## FAQ

**Q: Why is there a 1-second delay?**
A: Supabase REST API needs time to recognize newly created tables. FIX #2 adds this delay to reduce 404 errors.

**Q: Will the retry make uploads slower?**
A: Only if the table isn't in cache yet (~500ms extra max). Warm tables go straight through.

**Q: Can I disable these fixes?**
A: Not currently. They're automatic. Contact dev if you need to customize timeouts.

**Q: Why do I see "error: {}" in console?**
A: That's a 404 error from REST API - FIX #1 catches and retries automatically.

**Q: Is the retry logged?**
A: Yes! Look for `[FIX #3] Insert attempt 2/2` in console.

**Q: What if I still get the error after fix?**
A: It's likely a real error (not just 404). Check console for error details and contact support.

---
