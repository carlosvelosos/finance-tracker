# RPC Function Explanation: `get_user_accessible_tables()`

## What is an RPC Function?

**RPC** stands for **Remote Procedure Call**. In Supabase, RPC functions are custom PostgreSQL functions that you can call from your client application. They allow you to:

1. Run complex database logic on the server side
2. Access system tables and metadata that aren't exposed through the REST API
3. Perform operations more efficiently than multiple client-side calls
4. Implement custom business logic with better security

## The `get_user_accessible_tables()` Function

### Purpose

This function is designed to **discover which transaction tables exist in your database** without having to manually test each one. Instead of the fallback approach (which tries to query each known table individually), the RPC function queries the database metadata directly.

### Current Status

⚠️ **This function is NOT currently implemented in your Supabase project.**

That's why you see this console warning:

```
RPC function not available: Could not find the function public.get_user_accessible_tables without parameters in the schema cache
```

The code currently falls back to manually checking each table one by one (which causes all those 404 requests you see in the console).

### How to Implement It

If you want to implement this RPC function to make table discovery more efficient, follow these steps:

#### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://hwrbwttovihldczdhrbu.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

#### Step 2: Create the Function

Copy and paste this SQL code:

```sql
CREATE OR REPLACE FUNCTION get_user_accessible_tables()
RETURNS TABLE(table_name text, row_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::text,
    (SELECT count(*) FROM information_schema.tables ist WHERE ist.table_name = t.table_name)::bigint as row_count
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND (t.table_name LIKE '%transaction%' OR t.table_name = 'IN_ALL');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Step 3: Run the Query

Click the **Run** button to create the function.

#### Step 4: Verify It Works

You can test it in the SQL Editor:

```sql
SELECT * FROM get_user_accessible_tables();
```

This should return a list of all your transaction tables.

## What Does the Function Do?

### Breakdown of the SQL:

```sql
-- Returns a table with two columns: table_name and row_count
RETURNS TABLE(table_name text, row_count bigint)

-- Query the system metadata table
FROM information_schema.tables t

-- Filter to only public schema tables
WHERE t.table_schema = 'public'

-- Only real tables (not views)
AND t.table_type = 'BASE TABLE'

-- Only transaction-related tables
AND (t.table_name LIKE '%transaction%' OR t.table_name = 'IN_ALL')
```

### Understanding Each Filter Condition:

#### 1. `t.table_type = 'BASE TABLE'`

**What it means:** Only return actual database tables, not views or temporary tables.

**Types in PostgreSQL:**

- `BASE TABLE` = Real physical table with data
- `VIEW` = Virtual table (query result)
- `FOREIGN TABLE` = Table from another database
- `LOCAL TEMPORARY` = Temporary session table

**Why it matters:** Ensures you only get real tables where transaction data is stored.

#### 2. `t.table_name LIKE '%transaction%'`

**What it means:** The table name contains the word "transaction" anywhere in it (case-sensitive).

**Examples that MATCH:**

- ✅ `Sweden_transactions_agregated_2025` (contains "transaction")
- ✅ `Brasil_transactions_agregated_2024` (contains "transaction")
- ✅ `user_transactions` (contains "transaction")
- ✅ `transactions_backup` (contains "transaction")

**Examples that DON'T MATCH:**

- ❌ `INMCPDF_202510` (NO "transaction" in the name)
- ❌ `INMC_202501` (NO "transaction" in the name)
- ❌ `IN_ALL` (NO "transaction" in the name)

**The `%` wildcard:**

- `%transaction%` means: any characters + "transaction" + any characters
- Case-sensitive by default in PostgreSQL

#### 3. `OR t.table_name = 'IN_ALL'`

**What it means:** Also include the exact table named `IN_ALL`.

**Examples that MATCH:**

- ✅ `IN_ALL` (exact match)

**Examples that DON'T MATCH:**

- ❌ `IN_ALL_2024` (not exact)
- ❌ `in_all` (case-sensitive, lowercase doesn't match)

### ⚠️ **PROBLEM: This Function WON'T Find Your INMC Tables!**

The current SQL filter will **NOT** find tables like:

- ❌ `INMCPDF_202510`
- ❌ `INMCPDF_202509`
- ❌ `INMC_202501`
- ❌ `INMC_202412`

**Why?** Because these table names:

1. Don't contain the word "transaction"
2. Don't exactly match "IN_ALL"

### ✅ **FIXED VERSION:**

To find ALL your transaction tables, use this improved version:

```sql
CREATE OR REPLACE FUNCTION get_user_accessible_tables()
RETURNS TABLE(table_name text, row_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::text,
    (SELECT count(*) FROM information_schema.tables ist WHERE ist.table_name = t.table_name)::bigint as row_count
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND (
    t.table_name LIKE '%transaction%'           -- Tables with "transaction"
    OR t.table_name = 'IN_ALL'                  -- The IN_ALL aggregated table
    OR t.table_name LIKE 'INMC_%'               -- Inter MasterCard monthly tables
    OR t.table_name LIKE 'INMCPDF_%'            -- Inter MasterCard PDF tables
    OR t.table_name LIKE 'Brasil_%'             -- Brazilian aggregated tables
    OR t.table_name LIKE 'Sweden_%'             -- Swedish aggregated tables
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Now it will match:**

- ✅ `Sweden_transactions_agregated_2025` (contains "transaction")
- ✅ `Brasil_transactions_agregated_2024` (contains "transaction")
- ✅ `IN_ALL` (exact match)
- ✅ `INMC_202510` (matches `INMC_%` pattern)
- ✅ `INMCPDF_202509` (matches `INMCPDF_%` pattern)
- ✅ `Brasil_2024_summary` (matches `Brasil_%` pattern)
- ✅ `Sweden_2025_data` (matches `Sweden_%` pattern)

### SECURITY DEFINER

The `SECURITY DEFINER` clause means the function runs with the permissions of the user who **created** it (not the user who calls it). This allows the function to access `information_schema` which might not be directly accessible to regular users.

## Benefits of Using the RPC Function

### Current Approach (Fallback):

❌ Makes **60+ HTTP requests** to test each table individually
❌ Generates many 404 errors in console
❌ Slower (sequential network requests)
❌ Higher bandwidth usage

### With RPC Function:

✅ Makes **1 HTTP request** to get all tables
✅ No 404 errors
✅ Much faster (single database query)
✅ Lower bandwidth usage
✅ Cleaner console logs

## When to Implement It

### Implement if:

- You want cleaner console logs
- You're concerned about performance
- You plan to have many more transaction tables
- You want to reduce API calls

### Skip if:

- The fallback approach is working fine for you
- You have a small number of tables
- You don't want to add custom database functions
- You prefer keeping all logic client-side

## Current Behavior

Since the RPC function isn't implemented, your app:

1. ✅ **Still works fine** - fallback approach handles it
2. ⚠️ Logs warning: "RPC function not available"
3. ⚠️ Tests 60+ tables individually (causes 404s for non-existent ones)
4. ✅ Eventually finds all existing tables
5. ✅ Displays them correctly

## Alternative: Remove the RPC Attempt

If you don't plan to implement the RPC function, you can simplify the code by removing the RPC attempt entirely and just using the fallback approach. This would eliminate the warning message.

### Option 1: Implement RPC (Recommended for Production)

- Faster
- More efficient
- Better for scaling

### Option 2: Remove RPC Attempt (Simpler)

- Works fine as-is
- No database function needed
- Slightly more network traffic

### Option 3: Do Nothing (Current State)

- Everything works
- Just shows a warning in console
- Acceptable for development

## Related Files

- `lib/hooks/useSupabaseTables.ts` - Contains the RPC call and fallback logic
- Supabase SQL Editor - Where you would create the function

## Further Reading

- [Supabase RPC Functions Documentation](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL Functions Guide](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Information Schema Tables](https://www.postgresql.org/docs/current/information-schema.html)
