Okay, here is the SQL code to create a table named user_bank_settings in Supabase. This table will store the active/inactive status and the custom Supabase table name for each of a user's bank accounts.

CREATE TABLE public.user_bank_settings (
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
country TEXT NOT NULL,
bank_name TEXT NOT NULL,
is_active BOOLEAN DEFAULT TRUE NOT NULL,
custom_supabase_table_name TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
PRIMARY KEY (user_id, country, bank_name)
);

-- Optional: Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.user_bank_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_bank_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Policy: Users can manage their own bank settings
CREATE POLICY "Users can manage their own bank settings"
ON public.user_bank_settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add comments to describe the table and columns
COMMENT ON TABLE public.user_bank_settings IS 'Stores user-specific settings for their bank accounts, like active status and custom Supabase table names.';
COMMENT ON COLUMN public.user_bank_settings.user_id IS 'Foreign key referencing the user in auth.users.';
COMMENT ON COLUMN public.user_bank_settings.country IS 'The country of the bank (e.g., Brazil, Sweden). Part of the composite primary key.';
COMMENT ON COLUMN public.user_bank_settings.bank_name IS 'The name of the bank (e.g., Inter, Handelsbanken). Part of the composite primary key.';
COMMENT ON COLUMN public.user_bank_settings.is_active IS 'Whether the bank account is considered active (TRUE) or inactive (FALSE) by the user.';
COMMENT ON COLUMN public.user_bank_settings.custom_supabase_table_name IS 'User-defined Supabase table name for this bank account. If NULL, the application default can be used.';
COMMENT ON COLUMN public.user_bank_settings.created_at IS 'Timestamp of when the setting was first created.';
COMMENT ON COLUMN public.user_bank_settings.updated_at IS 'Timestamp of when the setting was last updated.';


Explanation:

CREATE TABLE public.user_bank_settings: This creates the new table.

user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE: This links to the auth.users table (standard in Supabase). If a user is deleted, their settings are also deleted (ON DELETE CASCADE).
country TEXT NOT NULL: Stores the country of the bank.
bank_name TEXT NOT NULL: Stores the name of the bank.
is_active BOOLEAN DEFAULT TRUE NOT NULL: Stores the status (active/inactive). Defaults to TRUE (active).
custom_supabase_table_name TEXT: Stores the user-defined Supabase table name. This can be NULL if the user hasn't set a custom name, in which case your application can use the default transactions_${sanitizedName}.
created_at and updated_at: Timestamps for tracking when records are created or modified.
PRIMARY KEY (user_id, country, bank_name): A composite primary key ensures that each user can only have one entry per bank in a specific country.
Trigger for updated_at:

The update_updated_at_column function and the associated trigger handle_updated_at will automatically update the updated_at column whenever a row is modified.
Row Level Security (RLS):

ALTER TABLE public.user_bank_settings ENABLE ROW LEVEL SECURITY;: This is crucial for security in Supabase. It ensures that users can only access data they are permitted to.
CREATE POLICY "Users can manage their own bank settings" ...: This policy allows users to SELECT, INSERT, UPDATE, and DELETE their own settings (where auth.uid() matches user_id).
You can run this SQL code directly in the Supabase SQL Editor. After creating the table, you'll need to update your application logic:

When a user toggles the active/inactive status, update the is_active field in this new table.
When a user saves a custom Supabase table name, update the custom_supabase_table_name field.
When initializing the bank accounts on the profile page, you'll first query this user_bank_settings table to get any stored preferences for is_active and custom_supabase_table_name, falling back to defaults if no entry exists for a particular bank.
$$

Okay, here's the SQL code to populate the user_bank_settings table for the user ID 2b5c5467-04e0-4820-bea9-1645821fa1b7.

This script assumes you want to initialize settings for all banks listed in your countriesData object. The is_active status is set to TRUE by default, and custom_supabase_table_name is populated with the default generated name (e.g., transactions_inter). Your application can then update these values as the user customizes their settings.

-- User ID for whom settings are being populated
DO $$
DECLARE
v_user_id UUID := '2b5c5467-04e0-4820-bea9-1645821fa1b7';
BEGIN

-- Brazil Banks
INSERT INTO public.user_bank_settings (user_id, country, bank_name, is_active, custom_supabase_table_name)
VALUES
(v_user_id, 'Brazil', 'Inter', TRUE, 'transactions_inter'),
(v_user_id, 'Brazil', 'Nubank', TRUE, 'transactions_nubank'),
(v_user_id, 'Brazil', 'Santander', TRUE, 'transactions_santander'),
(v_user_id, 'Brazil', 'Banco do Brasil', TRUE, 'transactions_banco_do_brasil'),
(v_user_id, 'Brazil', 'Caixa', TRUE, 'transactions_caixa'),
(v_user_id, 'Brazil', 'Bradesco', TRUE, 'transactions_bradesco'),
(v_user_id, 'Brazil', 'Rico', TRUE, 'transactions_rico'),
(v_user_id, 'Brazil', 'Clear', TRUE, 'transactions_clear'),
(v_user_id, 'Brazil', 'Smiles', TRUE, 'transactions_smiles'),
(v_user_id, 'Brazil', 'Latam', TRUE, 'transactions_latam'),
(v_user_id, 'Brazil', 'Azul', TRUE, 'transactions_azul'),
(v_user_id, 'Brazil', 'Esfera', TRUE, 'transactions_esfera'),
(v_user_id, 'Brazil', 'Livelo', TRUE, 'transactions_livelo')
ON CONFLICT (user_id, country, bank_name) DO UPDATE SET
is_active = EXCLUDED.is_active,
custom_supabase_table_name = EXCLUDED.custom_supabase_table_name,
updated_at = CURRENT_TIMESTAMP;

-- Sweden Banks
INSERT INTO public.user_bank_settings (user_id, country, bank_name, is_active, custom_supabase_table_name)
VALUES
(v_user_id, 'Sweden', 'Handelsbanken', TRUE, 'transactions_handelsbanken'),
(v_user_id, 'Sweden', 'SEB', TRUE, 'transactions_seb'),
(v_user_id, 'Sweden', 'American Express', TRUE, 'transactions_american_express')
ON CONFLICT (user_id, country, bank_name) DO UPDATE SET
is_active = EXCLUDED.is_active,
custom_supabase_table_name = EXCLUDED.custom_supabase_table_name,
updated_at = CURRENT_TIMESTAMP;

END $$;

Explanation of the script:

DO $$ ... END $$;: This is a PL/pgSQL anonymous block, useful for declaring variables.
DECLARE v_user_id UUID := '2b5c5467-04e0-4820-bea9-1645821fa1b7';: Declares a variable for the user ID to make it easy to change if needed.
INSERT INTO public.user_bank_settings ... VALUES ...:
Populates the table with entries for each bank in Brazil and Sweden.
user_id: The specified user ID.
country: The respective country.
bank_name: The name of the bank.
is_active: Set to TRUE as a default.
custom_supabase_table_name: Set to the default generated table name (e.g., transactions_inter, transactions_handelsbanken). This matches the current behavior of your generateSupabaseTableName function.
ON CONFLICT (user_id, country, bank_name) DO UPDATE SET ...:
This clause handles cases where a setting for a particular user, country, and bank already exists (due to the composite primary key).
If a conflict occurs, it updates the existing row's is_active status, custom_supabase_table_name, and updated_at timestamp with the values provided in the INSERT statement. This makes the script idempotent, meaning you can run it multiple times without creating duplicate entries or errors.
You can run this SQL script in the Supabase SQL Editor to populate the settings for the specified user.

Okay, here is the SQL code to create the AM_ALL table and populate it with data from the tables listed in the image. This script assumes all source tables (AM_2024, AM_202501 through AM_202512) exist and have the structure you provided.

-- 1. Create the new aggregate table "AM_ALL"
-- This table structure mirrors the source tables.
CREATE TABLE public."AM_ALL" (
id bigint generated by default as identity not null,
created_at timestamp with time zone not null default now(),
"Date" date null,
"Description" text null,
"Amount" numeric null,
"Balance" numeric null,
"Category" text null default 'Unknown'::text,
"Responsible" text null default 'Carlos'::text,
"Bank" text null default 'American Express'::text,
"Comment" text null,
user_id uuid null default '2b5c5467-04e0-4820-bea9-1645821fa1b7'::uuid,
constraint AM_ALL_pkey primary key (id)
) TABLESPACE pg_default;

-- Add comments to the new table and its columns for clarity
COMMENT ON TABLE public."AM_ALL" IS 'Aggregated table containing all transactions from AM_YYYY and AM_YYYYMM tables.';
COMMENT ON COLUMN public."AM_ALL".id IS 'Unique identifier for each transaction in the aggregated table.';
COMMENT ON COLUMN public."AM_ALL".created_at IS 'Timestamp of when the record was created in the source table.';
COMMENT ON COLUMN public."AM_ALL"."Date" IS 'Date of the transaction.';
COMMENT ON COLUMN public."AM_ALL"."Description" IS 'Description of the transaction.';
COMMENT ON COLUMN public."AM_ALL"."Amount" IS 'Amount of the transaction.';
COMMENT ON COLUMN public."AM_ALL"."Balance" IS 'Balance after the transaction.';
COMMENT ON COLUMN public."AM_ALL"."Category" IS 'Category of the transaction.';
COMMENT ON COLUMN public."AM_ALL"."Responsible" IS 'Person responsible for the transaction.';
COMMENT ON COLUMN public."AM_ALL"."Bank" IS 'Bank associated with the transaction (e.g., American Express).';
COMMENT ON COLUMN public."AM_ALL"."Comment" IS 'Additional comments for the transaction.';
COMMENT ON COLUMN public."AM_ALL".user_id IS 'User ID associated with the transaction.';

-- 2. Insert data from each source table into "AM_ALL"
-- The "id" column in "AM_ALL" will be auto-generated.

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_2024";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202501";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202502";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202503";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202504";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202505";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202506";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202507";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202508";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202509";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202510";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202511";

INSERT INTO public."AM_ALL" (
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
)
SELECT
created_at, "Date", "Description", "Amount", "Balance", "Category", "Responsible", "Bank", "Comment", user_id
FROM public."AM_202512";

-- After running this, you can query public."AM*ALL"
-- SELECT * FROM public."AM*ALL" ORDER BY "Date" DESC;
-- SELECT COUNT(*) FROM public."AM_ALL";

Explanation:

CREATE TABLE public."AM_ALL":

This statement defines the new table AM_ALL with the same column definitions, data types, and default values as your source tables (e.g., AM_2024).
The id column is set as a primary key and will auto-increment.
Default values for created_at, Category, Responsible, Bank, and user_id are included, which would apply if you were to insert rows directly into AM_ALL without specifying these columns.
INSERT INTO public."AM_ALL" (...) SELECT ... FROM ...:

A separate INSERT statement is used for each source table (AM_2024, AM_202501, ..., AM_202512).
It copies all relevant data from the columns of the source table into the corresponding columns of AM_ALL.
The id for each row in AM_ALL will be newly generated by its own identity sequence.
Before Running:

Backup (Recommended): Although this script only creates a new table and inserts data into it (it doesn't modify your existing tables), it's always a good practice to back up your database before running schema changes or large data operations.
Table Existence: Ensure all the source tables (AM_2024, AM_202501 through AM_202512) actually exist in your public schema. If any are missing, the corresponding INSERT statement will fail.
You can run this entire script in the Supabase SQL Editor. It will first create the AM_ALL table and then populate it.

Okay, here is the SQL code to set up Row Level Security (RLS) policies for the AM_ALL table. These policies will allow authenticated users to read and write data that is associated with their user ID.

-- 1. Enable Row Level Security (RLS) on the AM_ALL table
ALTER TABLE public."AM_ALL" ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policy for AM_ALL table
-- This policy allows authenticated users to perform all operations (SELECT, INSERT, UPDATE, DELETE)
-- on rows where the 'user_id' column matches their own authenticated user ID.
CREATE POLICY "Authenticated users can manage their own AM_ALL data"
ON public."AM_ALL"
FOR ALL
USING (auth.uid() = user_id) -- Applies to SELECT, UPDATE, DELETE: only rows matching this condition are visible/modifiable.
WITH CHECK (auth.uid() = user_id); -- Applies to INSERT, UPDATE: ensures new/updated rows satisfy this condition.

-- 3. Force Row Level Security (Important for table owners)
-- This ensures that RLS policies are applied to all users, including the table owner.
ALTER TABLE public."AM_ALL" FORCE ROW LEVEL SECURITY;

## -- Notes on user_id column and existing data:

-- a. Default user_id for new inserts:
-- The "AM_ALL" table was created with a default user_id: '2b5c5467-04e0-4820-bea9-1645821fa1b7'::uuid.
-- With the policy above, if a user inserts a row without specifying 'user_id',
-- it will attempt to use this default. The 'WITH CHECK (auth.uid() = user_id)'
-- clause will then compare the inserting user's auth.uid() with this static default.
-- This means only the user with ID '2b5c5467-04e0-4820-bea9-1645821fa1b7' could insert
-- rows if 'user_id' is not explicitly provided in the INSERT statement.
--
-- To automatically set 'user_id' to the current authenticated user on new inserts
-- if it's not explicitly provided, you can change the column default:
-- ALTER TABLE public."AM_ALL" ALTER COLUMN user_id SET DEFAULT auth.uid();
-- Run this command BEFORE RLS policies if you want new inserts to automatically pick up the current user's ID.
--
-- b. Existing data in AM_ALL:
-- The script used to populate "AM_ALL" copied 'user_id' from source tables (e.g., "AM_2024", "AM_202501", etc.).
-- SELECT created_at, "Date", ..., user_id FROM public."AM_2024";
-- The RLS policy will apply based on these existing 'user_id' values.
-- If the 'user_id' in the source tables (and thus in "AM_ALL") is the static
-- '2b5c5467-04e0-4820-bea9-1645821fa1b7', then only that specific user will be
-- able to access and manage those records after these RLS policies are active.
-- Ensure that the 'user_id' column in your source tables and consequently in "AM_ALL"
-- correctly reflects the actual owner of each transaction record.
-- If necessary, you might need to run an UPDATE statement on "AM_ALL" (before enabling RLS or by temporarily disabling it)
-- to correct the 'user_id' for existing rows if they are currently set to a generic ID
-- but should belong to different users.

Explanation:

ALTER TABLE public."AM_ALL" ENABLE ROW LEVEL SECURITY;

This command activates Row Level Security for the AM_ALL table. By default, RLS is off.
CREATE POLICY "Authenticated users can manage their own AM_ALL data" ...

This creates a policy named "Authenticated users can manage their own AM_ALL data" on the AM_ALL table.
FOR ALL: This means the policy applies to all command types (SELECT, INSERT, UPDATE, DELETE).
USING (auth.uid() = user_id): This clause is evaluated for existing rows. For SELECT, UPDATE, or DELETE operations, users will only be able to affect rows where their current authenticated user ID (auth.uid()) matches the value in the user_id column of that row.
WITH CHECK (auth.uid() = user_id): This clause is evaluated for new or modified rows. For INSERT or UPDATE operations, it ensures that the user_id column of the row being inserted or updated is set to the current user's auth.uid(). If not, the operation will be denied.
ALTER TABLE public."AM_ALL" FORCE ROW LEVEL SECURITY;

This command ensures that RLS policies apply to all users, including the table owner. Without this, table owners might bypass RLS policies by default. This is a recommended security practice in Supabase.
The notes included in the SQL comments highlight important considerations regarding the user_id column's default value and how existing data will be affected by these RLS policies. Please review them carefully to ensure the policies behave as you expect with your current data and insert patterns.
