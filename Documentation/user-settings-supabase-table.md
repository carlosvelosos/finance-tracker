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
