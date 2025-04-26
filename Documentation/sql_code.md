create sql code to be used in the sql editor in supabase to edit the user_id column on the tables Brasil_transactions_agregated_2024 and Brasil_transactions_agregated_2025. The tables have the following definition:
create table public."Brasil_transactions_agregated_2024" (
id serial not null,
created_at timestamp without time zone null default now(),
"Date" date null,
"Description" text null,
"Amount" numeric null,
"Balance" numeric null,
"Category" text null,
"Responsible" text null,
"Bank" text null,
"Comment" text null,
user_id uuid not null,
source_table text null,
constraint Brasil_transactions_agregated_2024_pkey primary key (id)
) TABLESPACE pg_default;

the tables already have users on the user_id column and I would like to add one more. The user id to be added is: 2b5c5467-04e0-4820-bea9-1645821fa1b7

I only want to add it if column "Responsible" is equal to 'us' or 'Amanda'


SQL Code to Add User ID to Specific Transactions
Here's the SQL code you can use in Supabase's SQL Editor to add the specified user ID to transactions where the "Responsible" column equals 'us' or 'Amanda' in both tables:

    -- First, verify what you're about to update (optional but recommended)
    SELECT "Responsible", COUNT(*) 
    FROM public."Brasil_transactions_agregated_2024" 
    WHERE "Responsible" IN ('us', 'Amanda')
    GROUP BY "Responsible";

    SELECT "Responsible", COUNT(*) 
    FROM public."Brasil_transactions_agregated_2025" 
    WHERE "Responsible" IN ('us', 'Amanda')
    GROUP BY "Responsible";

    -- Create a function to add a user to the user_id array
    CREATE OR REPLACE FUNCTION add_user_to_array(user_ids uuid[], new_user uuid) 
    RETURNS uuid[] AS $$
    BEGIN
    -- Check if the array already contains the user ID
    IF new_user = ANY(user_ids) THEN
        RETURN user_ids;
    ELSE
        RETURN array_append(user_ids, new_user);
    END IF;
    END;
    $$ LANGUAGE plpgsql;

    -- Update the 2024 transactions
    UPDATE public."Brasil_transactions_agregated_2024"
    SET user_id = '2b5c5467-04e0-4820-bea9-1645821fa1b7'
    WHERE "Responsible" IN ('us', 'Amanda')
    AND user_id IS DISTINCT FROM '2b5c5467-04e0-4820-bea9-1645821fa1b7';

    -- Update the 2025 transactions
    UPDATE public."Brasil_transactions_agregated_2025"
    SET user_id = '2b5c5467-04e0-4820-bea9-1645821fa1b7'
    WHERE "Responsible" IN ('us', 'Amanda')
    AND user_id IS DISTINCT FROM '2b5c5467-04e0-4820-bea9-1645821fa1b7';

    -- Verify the update (optional)
    SELECT "Responsible", COUNT(*), user_id
    FROM public."Brasil_transactions_agregated_2024"
    WHERE "Responsible" IN ('us', 'Amanda')
    GROUP BY "Responsible", user_id;

    SELECT "Responsible", COUNT(*), user_id
    FROM public."Brasil_transactions_agregated_2025"
    WHERE "Responsible" IN ('us', 'Amanda')
    GROUP BY "Responsible", user_id;




Important Notes
This SQL code will completely replace the existing user_id values with the new user ID for the matching rows. If you intended to preserve the existing value and add this as an additional ID, you would need to modify the table structure to store multiple IDs.

The code includes verification queries that run before and after the update to help you confirm which rows will be affected and verify the changes afterward.

If your table schema actually stores arrays of user IDs in the user_id column (which isn't clear from your schema definition), you would need to use a different approach. The function add_user_to_array is provided for that scenario, but is not used in the main update statements.

If you want to be extra cautious, wrap the updates in a transaction:    

    BEGIN;

    -- Update statements here

    -- Review the changes
    SELECT * FROM public."Brasil_transactions_agregated_2024"
    WHERE "Responsible" IN ('us', 'Amanda');

    -- If everything looks good
    COMMIT;
    -- Or if something looks wrong
    -- ROLLBACK;