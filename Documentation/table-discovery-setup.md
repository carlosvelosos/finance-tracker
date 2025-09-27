# Table Discovery Setup for Supabase

## Problem

The multi-table aggregated transactions page needs to dynamically discover which transaction tables are available in the Supabase database. However, querying `information_schema.tables` directly through the Supabase client API fails due to Row Level Security policies.

## Solution

We implement a dual approach:

1. **Primary Method**: Custom PostgreSQL RPC function (recommended)
2. **Fallback Method**: Direct table existence testing

## Setup Instructions

### Option 1: RPC Function (Recommended)

Create this function in your Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION get_user_accessible_tables()
RETURNS TABLE(
  table_name text,
  table_schema text,
  table_type text,
  estimated_row_count bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::text,
    t.table_schema::text,
    t.table_type::text,
    COALESCE(
      (SELECT schemaname||'.'||tablename FROM pg_tables WHERE tablename = t.table_name LIMIT 1),
      0
    )::bigint as estimated_row_count
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND (
    t.table_name ILIKE '%transaction%'
    OR t.table_name = 'IN_ALL'
    OR t.table_name ILIKE '%agregated%'
  )
  ORDER BY t.table_name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_accessible_tables() TO authenticated;
```

### Option 2: Alternative RPC Function (If above doesn't work)

```sql
CREATE OR REPLACE FUNCTION list_transaction_tables()
RETURNS json
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'table_name', table_name,
      'table_type', table_type
    )
  ) INTO result
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND (
    table_name ILIKE '%transaction%'
    OR table_name = 'IN_ALL'
    OR table_name ILIKE '%agregated%'
  );

  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION list_transaction_tables() TO authenticated;
```

### Option 3: Simple Table Checker Function

```sql
CREATE OR REPLACE FUNCTION check_table_exists(table_name_param text)
RETURNS boolean
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = table_name_param
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_table_exists(text) TO authenticated;
```

## How the Hook Works

1. **RPC First**: Tries to call `get_user_accessible_tables()` RPC function
2. **Fallback**: If RPC fails, tests existence of known tables by attempting to query their structure
3. **Metadata Fetching**: For accessible tables, fetches sample data to get counts, dates, and bank information
4. **Error Handling**: Gracefully handles missing tables and permission issues

## Benefits

- **Dynamic Discovery**: Automatically finds new transaction tables
- **Secure**: Works within Supabase's security model
- **Reliable Fallback**: Still works even if RPC functions aren't set up
- **Performance**: RPC approach is much faster than individual table tests
- **Flexible**: Can be extended to discover other types of tables

## Troubleshooting

If the RPC function doesn't work:

1. Ensure you're connected as a database admin when creating the function
2. Check that the function has `SECURITY DEFINER` (runs with creator privileges)
3. Verify `GRANT EXECUTE` permissions are set correctly
4. The fallback method will still work by testing individual table existence

## Alternative Approaches Considered

1. **Supabase Management API**: Requires admin credentials
2. **Direct information_schema queries**: Blocked by RLS policies
3. **Static table lists**: Not flexible for growing databases
4. **File-based configuration**: Requires manual maintenance

The RPC function approach provides the best balance of flexibility, security, and performance.
