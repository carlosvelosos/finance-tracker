import * as XLSX from "xlsx";
import Papa from "papaparse"; // Import papaparse
import { supabase } from "@/lib/supabaseClient";
import {
  processDEV,
  processInterBRMastercard,
  processInterBRMastercardPDF,
  processInterBRAccount,
  processInterBRAccountMonthly,
  processHandelsbanken,
  processAmex,
  processSEB,
  processB3,
} from "@/lib/utils/bankProcessors";

// Separate function to process file data without uploading
/**
 * Parse and normalize an uploaded file into the application's internal
 * processed-data shape (tableName, transactions, etc.).
 *
 * Responsibilities:
 * - Read the provided `File` into an ArrayBuffer and parse it as CSV
 *   (via PapaParse) or Excel (via `xlsx`).
 * - Apply bank-specific parsing rules and map raw rows to a unified
 *   processed-data object using helpers in `lib/utils/bankProcessors`.
 *
 * Bank-specific behavior (high level):
 * - CSV files: parsed with PapaParse. For `Inter-BR-Account` and
 *   `Inter-BR-Account-Monthly` the delimiter is `;`, otherwise `,`.
 * - Excel files: read via `XLSX.read`. For `B3` the function will
 *   attempt to locate and use the "Proventos Recebidos" sheet.
 * - After parsing the raw rows, the function delegates to the
 *   appropriate `process*` helper (e.g. `processInterBRMastercard`,
 *   `processB3`) which returns the normalized `processedData`.
 *
 * Parameters:
 * @param file - Browser `File` object (CSV or Excel). The caller
 *   should ensure allowed extensions are enforced at the UI level.
 * @param bank - Bank identifier string used to select parsing rules.
 *
 * Returns: Promise<object>
 * - On success: `{ success: true, data: processedData }` where
 *   `processedData` is the normalized result produced by bank-specific
 *   processors (typically includes `tableName` and `transactions`).
 * - On failure: `{ success: false, error: string, message: string }`.
 *   Known error codes include `UNSUPPORTED_BANK` and `PROCESSING_ERROR`.
 *
 * Notes:
 * - This function performs only client-side parsing/normalization. It
 *   does not upload data to Supabase — use `uploadExcel` / `uploadToSupabase`
 *   for that step.
 * - The function logs helpful debugging information to the console and
 *   bubbles errors into a structured response to simplify UI handling.
 */
export async function processFileData(file: File, bank: string) {
  try {
    console.log("Processing file data for bank:", bank, "file:", file.name);
    const arrayBuffer = await file.arrayBuffer();
    let data: string[][]; // Explicitly type data as string[][]

    if (file.name.endsWith(".csv")) {
      const text = new TextDecoder("utf-8").decode(arrayBuffer);

      // Use PapaParse to parse the CSV data
      const parsed = Papa.parse<string[]>(text, {
        header: false, // Disable header row parsing
        skipEmptyLines: true, // Skip empty lines
        delimiter:
          bank === "Inter-BR-Account" || bank === "Inter-BR-Account-Monthly"
            ? ";"
            : ",", // Use semicolon for Inter BR Account files
      });
      data = parsed.data as string[][]; // Cast parsed data to string[][]
    } else {
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // For B3, read specific sheet "Proventos Recebidos"
      let sheetName = workbook.SheetNames[0]; // Default to first sheet
      if (bank === "B3") {
        // Find "Proventos Recebidos" sheet (case-insensitive)
        const targetSheet = workbook.SheetNames.find(
          (name) =>
            name.toLowerCase().includes("proventos") &&
            name.toLowerCase().includes("recebidos"),
        );
        if (!targetSheet) {
          throw new Error(
            `Sheet 'Proventos Recebidos' not found in Excel file. Available sheets: ${workbook.SheetNames.join(", ")}`,
          );
        }
        sheetName = targetSheet;
        console.log(`B3: Reading sheet "${sheetName}"`);
      }

      data = XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[sheetName], {
        header: 1,
      }) as string[][]; // Cast to string[][]
    }
    console.log("Parsed data:", data.slice(0, 5)); // Log first 5 rows
    let processedData;
    console.log("Processing bank:", bank);
    switch (bank) {
      case "DEV":
        processedData = processDEV(data);
        console.log("Processed Data:", processedData);
        break;
      case "Inter-BR-Mastercard":
        processedData = processInterBRMastercard(data, file.name);
        break;
      case "Inter-BR-Mastercard-from-PDF":
        processedData = processInterBRMastercardPDF(data, file.name);
        break;
      case "Inter-BR-Account":
        console.log("Processing Inter-BR-Account");
        processedData = processInterBRAccount(data, file.name);
        console.log("Processed data:", processedData);
        break;
      case "Inter-BR-Account-Monthly":
        console.log("Processing Inter-BR-Account-Monthly");
        processedData = processInterBRAccountMonthly(data, file.name);
        console.log("Processed data:", processedData);
        break;
      case "Handelsbanken-SE":
        processedData = processHandelsbanken(data);
        break;
      case "AmericanExpress-SE":
        processedData = processAmex(data, file.name);
        break;
      case "SEB_SJ_Prio-SE":
        processedData = processSEB(data, file.name);
        break;
      case "B3":
        console.log("Processing B3 dividend data");
        processedData = processB3(data, file.name);
        console.log("B3 processed data:", processedData);
        break;
      default:
        return {
          success: false,
          error: "UNSUPPORTED_BANK",
          message: "Unknown bank type.",
        };
    }
    console.log("Final processed data:", processedData);
    return {
      success: true,
      data: processedData,
    };
  } catch (error) {
    console.error("Error in processFileData:", error);
    return {
      success: false,
      error: "PROCESSING_ERROR",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function uploadExcel(
  file: File,
  bank: string,
  clearData: boolean = false,
) {
  try {
    console.log(
      "uploadExcel called with bank:",
      bank,
      "file:",
      file.name,
      "clearData:",
      clearData,
    );

    // Process file data once
    const processResult = await processFileData(file, bank);
    if (!processResult.success) {
      return processResult;
    }

    const processedData = processResult.data!; // We know data exists since success is true

    // Upload to Supabase
    console.log("Uploading to Supabase table:", processedData.tableName);
    const result = await uploadToSupabase(
      processedData.tableName,
      processedData.transactions,
      clearData,
    );
    console.log("Upload result:", result);
    return result;
  } catch (error) {
    console.error("Error in uploadExcel:", error);
    return {
      success: false,
      error: "PROCESSING_ERROR",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function createTableInSupabase(tableName: string) {
  // Since we can't execute DDL directly through the client, we'll return instructions
  const instructions = `Please create the table manually in your Supabase SQL editor with the following commands:

1. Create the table:
CREATE TABLE public."${tableName}" (
  id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  "Date" date NULL,
  "Description" text NULL,
  "Amount" numeric NULL,
  "Balance" numeric NULL,
  "Category" text NULL DEFAULT 'Unknown'::text,
  "Responsible" text NULL DEFAULT 'Carlos'::text,
  "Comment" text NULL,
  user_id uuid NULL DEFAULT '2b5c5467-04e0-4820-bea9-1645821fa1b7'::uuid,
  "Bank" text NULL DEFAULT 'Inter-BR'::text,
  CONSTRAINT "${tableName}_pkey" PRIMARY KEY (id),
  CONSTRAINT "${tableName}_id_key" UNIQUE (id)
) TABLESPACE pg_default;

2. Enable RLS:
ALTER TABLE public."${tableName}" 
ENABLE ROW LEVEL SECURITY;

3. Create RLS Policy:
CREATE POLICY "Enable all for users based on user_id"
ON "public"."${tableName}"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  user_id = '2b5c5467-04e0-4820-bea9-1645821fa1b7'::uuid OR
  auth.uid()::text = '2b5c5467-04e0-4820-bea9-1645821fa1b7' OR
  auth.uid() = user_id
)
WITH CHECK (
  user_id = '2b5c5467-04e0-4820-bea9-1645821fa1b7'::uuid OR
  auth.uid()::text = '2b5c5467-04e0-4820-bea9-1645821fa1b7' OR
  auth.uid() = user_id
);`;

  return instructions;
}

export async function executeTableCreation(tableName: string) {
  try {
    console.log("Attempting to create table:", tableName);

    // Check if this is a B3 table (starts with "B3_")
    const isB3Table = tableName.startsWith("B3_");

    // Create separate SQL statements for better execution
    let createTableSQL: string;

    if (isB3Table) {
      // B3-specific table with additional columns for dividend tracking
      createTableSQL = `CREATE TABLE IF NOT EXISTS public."${tableName}" (
        id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        "Date" date NULL,
        "Description" text NULL,
        "Amount" numeric NULL,
        "Quantity" numeric NULL,
        "UnitPrice" numeric NULL,
        "Institution" text NULL,
        "EventType" text NULL,
        "Product" text NULL,
        "Category" text NULL DEFAULT 'Investment Income'::text,
        "Responsible" text NULL DEFAULT 'Carlos'::text,
        "Comment" text NULL,
        user_id uuid NULL DEFAULT '2b5c5467-04e0-4820-bea9-1645821fa1b7'::uuid,
        "Bank" text NULL DEFAULT 'B3'::text,
        CONSTRAINT "${tableName}_pkey" PRIMARY KEY (id),
        CONSTRAINT "${tableName}_id_key" UNIQUE (id)
      )`;
    } else {
      // Standard table for other banks
      createTableSQL = `CREATE TABLE IF NOT EXISTS public."${tableName}" (
        id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        "Date" date NULL,
        "Description" text NULL,
        "Amount" numeric NULL,
        "Balance" numeric NULL,
        "Category" text NULL DEFAULT 'Unknown'::text,
        "Responsible" text NULL DEFAULT 'Carlos'::text,
        "Comment" text NULL,
        user_id uuid NULL DEFAULT '2b5c5467-04e0-4820-bea9-1645821fa1b7'::uuid,
        "Bank" text NULL DEFAULT 'Inter-BR'::text,
        CONSTRAINT "${tableName}_pkey" PRIMARY KEY (id),
        CONSTRAINT "${tableName}_id_key" UNIQUE (id)
      )`;
    }

    const enableRLSSQL = `ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY`;

    const createPolicySQL = `CREATE POLICY "Enable all for users based on user_id"
      ON "public"."${tableName}"
      AS PERMISSIVE
      FOR ALL
      TO authenticated
      USING (
        user_id = '2b5c5467-04e0-4820-bea9-1645821fa1b7'::uuid OR
        auth.uid()::text = '2b5c5467-04e0-4820-bea9-1645821fa1b7' OR
        auth.uid() = user_id
      )
      WITH CHECK (
        user_id = '2b5c5467-04e0-4820-bea9-1645821fa1b7'::uuid OR
        auth.uid()::text = '2b5c5467-04e0-4820-bea9-1645821fa1b7' OR
        auth.uid() = user_id
      )`;

    // Drop policy first to ensure we can recreate it with updated permissions
    const dropPolicySQL = `DROP POLICY IF EXISTS "Enable all for users based on user_id" ON "public"."${tableName}"`;

    try {
      // Execute statements one by one
      console.log("Creating table...");
      const { data: createResult, error: createError } = await supabase.rpc(
        "exec_sql",
        {
          sql: createTableSQL,
        },
      );

      if (createError || (createResult && createResult.startsWith("Error:"))) {
        const errorMsg = createError?.message || createResult;
        console.error("Table creation failed:", errorMsg);
        return {
          success: false,
          message: `Failed to create table: ${errorMsg}`,
          requiresManualCreation: true,
        };
      }

      console.log("Enabling RLS...");
      const { data: rlsResult, error: rlsError } = await supabase.rpc(
        "exec_sql",
        {
          sql: enableRLSSQL,
        },
      );

      if (rlsError || (rlsResult && rlsResult.startsWith("Error:"))) {
        const errorMsg = rlsError?.message || rlsResult;
        console.warn(
          "RLS enabling failed (table may already have RLS):",
          errorMsg,
        );
        // Continue anyway, as this might not be critical
      }

      console.log("Creating policy...");
      // First drop any existing policy
      const { error: dropError } = await supabase.rpc("exec_sql", {
        sql: dropPolicySQL,
      });

      if (dropError) {
        console.warn(
          "Policy drop failed (policy may not exist):",
          dropError.message,
        );
        // Continue anyway, as this is expected for new tables
      }

      // Now create the new policy
      const { data: policyResult, error: policyError } = await supabase.rpc(
        "exec_sql",
        {
          sql: createPolicySQL,
        },
      );

      if (policyError || (policyResult && policyResult.startsWith("Error:"))) {
        const errorMsg = policyError?.message || policyResult;
        console.error("Policy creation failed:", errorMsg);
        return {
          success: false,
          message: `Failed to create RLS policy: ${errorMsg}`,
          requiresManualCreation: true,
        };
      }

      console.log("All SQL statements executed successfully");
    } catch (error) {
      // If exec_sql doesn't exist, this is expected in most Supabase configurations
      if (
        error instanceof Error &&
        (error.message.includes("function") ||
          error.message.includes("exec_sql") ||
          (error as { code?: string }).code === "42883" ||
          (error as { code?: string }).code === "PGRST202") // Function not found
      ) {
        console.log(
          "exec_sql function not available. This is normal for most Supabase configurations.",
        );
        console.log("Error details:", error.message);

        // Since we can't execute DDL through the client, return instructions for manual creation
        return {
          success: false,
          message:
            "Automatic table creation is not supported in this Supabase configuration. Please create the table manually using the SQL commands provided in the dialog.",
          requiresManualCreation: true,
        };
      } else {
        // This is a different database error
        console.error("Database error during table creation:", error);
        return {
          success: false,
          message:
            error instanceof Error
              ? `Database error: ${error.message}`
              : "Unknown database error",
          requiresManualCreation: true,
        };
      }
    }

    // Verify the table was created successfully
    const verifyQuery = await supabase.from(tableName).select("id").limit(1);

    if (
      verifyQuery.error &&
      (verifyQuery.error.code === "42P01" ||
        verifyQuery.error.code === "PGRST116")
    ) {
      return {
        success: false,
        message:
          "Table creation failed. Please create the table manually using the SQL commands provided.",
        requiresManualCreation: true,
      };
    }

    console.log("Table created and verified successfully:", tableName);

    // FIX #2: Add delay for REST API cache propagation
    console.log("[FIX #2] Waiting 1 second for REST API cache to update...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("[FIX #2] REST API cache update delay completed");

    return {
      success: true,
      message: `Table "${tableName}" created successfully with RLS enabled!`,
    };
  } catch (error) {
    console.error("Error in executeTableCreation:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      requiresManualCreation: true,
    };
  }
}

export async function uploadToSupabase(
  tableName: string,
  transactions: Record<string, unknown>[],
  clearData: boolean = false,
) {
  try {
    console.log("uploadToSupabase called with table:", tableName);
    console.log("Transaction count:", transactions.length);
    console.log("Clear data:", clearData);

    // If clearData is true, clear the table first
    if (clearData) {
      console.log(
        `Clearing existing data from table "${tableName}" before upload...`,
      );
      const clearResult = await clearTableData(tableName);
      if (!clearResult.success) {
        // If clearing fails and it's not because table doesn't exist, return the error
        if (clearResult.error !== "TABLE_NOT_EXISTS") {
          return clearResult;
        }
        // If table doesn't exist, we'll handle that below
      } else {
        console.log(`Table "${tableName}" data cleared successfully`);
      }
    }

    // Get the current highest ID from the table
    console.log("Checking if table exists...");
    const { error: maxIdError } = await supabase
      .from(tableName)
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    console.log("maxIdError:", maxIdError);
    if (maxIdError) {
      console.log("Error code:", maxIdError.code);
      console.log("Error message:", maxIdError.message);
    }
    if (
      maxIdError &&
      (maxIdError.code === "PGRST116" || maxIdError.code === "42P01")
    ) {
      // PGRST116 = table doesn't exist (PostgREST error)
      // 42P01 = relation does not exist (PostgreSQL error)
      console.log("Table doesn't exist, returning TABLE_NOT_EXISTS result");
      return {
        success: false,
        error: "TABLE_NOT_EXISTS",
        tableName: tableName,
        message: `Table "${tableName}" does not exist and needs to be created`,
      };
    } else if (maxIdError) {
      console.log("Other error occurred:", maxIdError.message);
      return {
        success: false,
        error: "DATABASE_ERROR",
        message: maxIdError.message,
      };
    }

    console.log("Table exists, proceeding with upload...");
    // Calculate the starting ID for new records
    let currentMaxId = 0;

    if (clearData) {
      // If we cleared the data, start from ID 0
      currentMaxId = 0;
      console.log("Starting from ID 1 due to cleared data");
    } else {
      // Get the current max ID and continue from there
      // Use a more robust query to check for any existing records
      const { data: maxIdData, error: maxIdCheckError } = await supabase
        .from(tableName)
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      console.log("Max ID check - data:", maxIdData);
      console.log("Max ID check - error:", maxIdCheckError);

      if (maxIdCheckError) {
        console.error("Error checking max ID:", maxIdCheckError);
        return {
          success: false,
          error: "DATABASE_ERROR",
          message: maxIdCheckError.message,
        };
      }

      // Also check total record count to see if table has any data
      const { count: totalRecords } = await supabase
        .from(tableName)
        .select("*", { count: "exact", head: true });

      console.log("Total records in table:", totalRecords);

      currentMaxId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id : 0;
      console.log("Current max ID:", currentMaxId);

      // If there are records but maxId is 0, there might be an issue
      if ((totalRecords || 0) > 0 && currentMaxId === 0) {
        console.warn(
          `Table has ${totalRecords} records but max ID is 0. This might cause conflicts.`,
        );
      }
    }

    // Update transaction IDs to continue from the current max
    const transactionsWithCorrectIds = transactions.map(
      (transaction, index) => ({
        ...transaction,
        id: currentMaxId + index + 1,
        // Ensure user_id is set to match the expected user for RLS policy
        user_id: "2b5c5467-04e0-4820-bea9-1645821fa1b7",
      }),
    );

    console.log("Sample transaction data:", transactionsWithCorrectIds[0]);

    // Test table access before insert
    console.log("Testing table access...");
    const { data: testData, error: testError } = await supabase
      .from(tableName)
      .select("id")
      .limit(1);

    console.log("Table access test - data:", testData);
    console.log("Table access test - error:", testError);

    // Check current user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("Current authenticated user:", user?.id);
    console.log(
      "Expected user_id in data:",
      transactionsWithCorrectIds[0]?.user_id,
    );

    if (testError) {
      console.error("Cannot access table for insert:", testError);
      return {
        success: false,
        error: "TABLE_ACCESS_ERROR",
        message: `Cannot access table "${tableName}": ${testError.message}`,
      };
    }

    console.log("Proceeding with insert...");

    // FIX #3: Retry logic for insert operations with empty error detection
    let insertData, insertError;
    let retryCount = 0;
    const maxRetries = 2;
    const retryDelayMs = 500;

    while (retryCount < maxRetries) {
      console.log(`[FIX #3] Insert attempt ${retryCount + 1}/${maxRetries}...`);
      const result = await supabase
        .from(tableName)
        .insert(transactionsWithCorrectIds);

      insertData = result.data;
      insertError = result.error;

      console.log(
        `[DEBUG] Insert attempt ${retryCount + 1} - data:`,
        insertData,
      );
      console.log(
        `[DEBUG] Insert attempt ${retryCount + 1} - error object keys:`,
        insertError ? Object.keys(insertError) : null,
      );
      console.log(
        `[DEBUG] Insert attempt ${retryCount + 1} - full error:`,
        insertError,
      );

      // FIX #1: Better error object detection - check for empty objects (404 from REST API)
      const isEmptyErrorObject =
        insertError && Object.keys(insertError).length === 0;
      const hasErrorProperties =
        insertError &&
        (insertError.message || insertError.code || insertError.details);

      if (isEmptyErrorObject && retryCount < maxRetries - 1) {
        console.warn(
          `[FIX #1] [FIX #3] Empty error object detected (likely HTTP 404 - REST API cache not updated yet). Retrying...`,
        );
        console.log(`[FIX #3] Waiting ${retryDelayMs}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        retryCount++;
      } else {
        console.log(
          `[FIX #3] Insert attempt ${retryCount + 1} completed. Has error properties: ${hasErrorProperties}, Is empty object: ${isEmptyErrorObject}`,
        );
        break; // Success or real error, don't retry
      }
    }

    console.log("[DEBUG] Final insert attempt result - data:", insertData);
    console.log("[DEBUG] Final insert attempt result - error:", insertError);

    // FIX #4: Improved error detection including empty objects
    const hasInsertError =
      insertError &&
      (insertError.message ||
        insertError.code ||
        insertError.details ||
        Object.keys(insertError).length === 0);

    // For insert without .select(), data will be null but that's OK if no error
    let finalData, finalError;
    if (hasInsertError) {
      // Insert had an error, try with .select() to get more details
      console.log("[DEBUG] Insert error detected. Error object:", insertError);
      console.log(
        "[FIX #4] Attempting insert with .select() for additional details...",
      );
      const { data, error } = await supabase
        .from(tableName)
        .insert(transactionsWithCorrectIds)
        .select();

      console.log("[DEBUG] Insert with select - data:", data);
      console.log("[DEBUG] Insert with select - error:", error);

      finalData = data;
      finalError = error;
    } else {
      // Insert succeeded (no error, even if data is null)
      console.log(
        "[SUCCESS] Insert completed without error (data may be null for insert without .select())",
      );
      finalData = insertData; // Will be null, but that's OK
      finalError = insertError; // Will be null or empty object
    }
    console.log("[DEBUG] Final insert - data:", finalData);
    console.log("[DEBUG] Final insert - error object:", finalError);
    console.log(
      "[DEBUG] Final insert - error object keys:",
      finalError ? Object.keys(finalError) : null,
    );

    // FIX #4: Check for meaningful errors (not empty objects or null)
    // FIX #4: Check for meaningful errors (not empty objects or null)
    const hasRealError =
      finalError &&
      (finalError.message ||
        finalError.code ||
        finalError.details ||
        Object.keys(finalError).length > 0);
    if (hasRealError) {
      // Special handling for duplicate key constraint
      if (finalError?.code === "23505") {
        console.error(
          "[ERROR] Duplicate key error detected. This might be due to existing data in the table.",
        );
        console.log(
          "Consider using 'Clear existing data' option if you want to replace existing records.",
        );

        return {
          success: false,
          error: "DUPLICATE_KEY_ERROR",
          message:
            "Records with these IDs already exist in the table. Enable 'Clear existing data' option to replace existing records, or use different data.",
        };
      }

      console.error("[ERROR] Insert error details:", {
        code: finalError?.code,
        message: finalError?.message,
        details: finalError?.details,
        hint: finalError?.hint,
        status: (finalError as unknown as Record<string, unknown>)?.status,
        errorKeys: Object.keys(finalError || {}),
        fullError: finalError,
      });
      return {
        success: false,
        error: "INSERT_ERROR",
        message:
          finalError?.message ||
          `Insert failed: ${finalError?.code || "Unknown error"}`,
      };
    }

    // FIX #4: Better detection including empty error objects (which can represent 404s)
    // Note: If we used insert without .select(), finalData will be null but that's OK
    const isNormalNoSelectResponse =
      (finalError === null ||
        (finalError && Object.keys(finalError).length === 0)) &&
      finalData === null;
    const isEmptyResponse =
      !finalData || (Array.isArray(finalData) && finalData.length === 0);
    const wasEmptyErrorObjectInRaw =
      Object.keys(insertError || {}).length === 0 && insertError !== null;

    if (isNormalNoSelectResponse) {
      // This is the normal case for insert without .select() - verify via row count
      console.log(
        "[SUCCESS] Insert completed without error. No data returned (this is normal for insert without .select())",
      );
      console.log("[DEBUG] Will verify success via row count validation...");
    } else if (isEmptyResponse) {
      // This could be a real error - check if the original error was an empty object (404)
      if (wasEmptyErrorObjectInRaw) {
        console.error(
          "[ERROR] Insert returned empty error object (HTTP 404 from REST API). All retries exhausted.",
        );
      } else {
        console.error(
          "[ERROR] Insert failed: No data returned from insert operation",
        );
      }
      return {
        success: false,
        error: "INSERT_ERROR",
        message: wasEmptyErrorObjectInRaw
          ? "Insert failed: REST API did not recognize the table (404 error after retries). Please try again."
          : "Insert failed: No data was inserted",
      };
    }

    // Additional validation: Count actual rows in table after insert
    console.log("[DEBUG] Validating insert by counting table rows...");
    const expectedRowCount = clearData
      ? transactionsWithCorrectIds.length
      : currentMaxId + transactionsWithCorrectIds.length;
    console.log(`[DEBUG] Expected total rows in table: ${expectedRowCount}`);

    const { count: actualRowCount, error: countError } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("[ERROR] Error counting table rows:", countError);
      return {
        success: false,
        error: "VALIDATION_ERROR",
        message: `Insert may have succeeded but validation failed: ${countError.message}`,
      };
    }

    console.log(`[DEBUG] Actual rows in table after insert: ${actualRowCount}`);

    if (actualRowCount !== expectedRowCount) {
      console.error(
        `[ERROR] Row count mismatch! Expected: ${expectedRowCount}, Actual: ${actualRowCount}`,
      );
      // Attempt fallback: if exec_sql RPC exists, try server-side INSERT to bypass RLS/policy issues
      try {
        console.log(
          "Attempting fallback server-side INSERT via exec_sql RPC...",
        );
        // Build INSERT statement safely for the known columns
        const cols = Object.keys(transactionsWithCorrectIds[0]);
        const quotedCols = cols.map((c) => `"${c}"`).join(",");
        const valuesSql = transactionsWithCorrectIds
          .map((tx) => {
            const txRecord = tx as Record<string, unknown>;
            const vals = cols.map((c) => {
              const v = txRecord[c];
              if (v === null || v === undefined) return "NULL";
              if (typeof v === "number") return String(v);
              if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
              if (v instanceof Date) return `'${v.toISOString()}'`;
              // Escape single quotes for stringification
              const s = String(v).replace(/'/g, "''");
              return `'${s}'`;
            });
            return `(${vals.join(",")})`;
          })
          .join(",\n");
        const insertSql = `INSERT INTO public."${tableName}" (${quotedCols}) VALUES\n${valuesSql};`;
        const { error: execError } = await supabase.rpc("exec_sql", {
          sql: insertSql,
        });
        if (execError) {
          console.error("exec_sql insert failed:", execError);
          return {
            success: false,
            error: "INSERT_FALLBACK_FAILED",
            message: execError.message || "Fallback insert failed",
          };
        }
        // Re-check row count
        const { count: newActualRowCount, error: countError2 } = await supabase
          .from(tableName)
          .select("*", { count: "exact", head: true });
        if (countError2) {
          return {
            success: false,
            error: "VALIDATION_ERROR",
            message: `Insert may have succeeded but validation failed: ${countError2.message}`,
          };
        }
        if (newActualRowCount === expectedRowCount) {
          console.log(
            "[SUCCESS] Fallback insert succeeded and validated via row count.",
          );
          return {
            success: true,
            message: `Upload successful (fallback): ${transactionsWithCorrectIds.length} records inserted into \"${tableName}\" (verified: ${newActualRowCount} total rows)`,
          };
        }
        return {
          success: false,
          error: "VALIDATION_ERROR",
          message: `Insert validation failed after fallback: Expected ${expectedRowCount} rows, but table has ${newActualRowCount} rows`,
        };
      } catch (fbErr) {
        console.error("Fallback insert exception:", fbErr);
        return {
          success: false,
          error: "VALIDATION_ERROR",
          message: `Insert validation failed and fallback failed: ${fbErr instanceof Error ? fbErr.message : String(fbErr)}`,
        };
      }
    }

    console.log(
      `✅ Insert validation successful: ${Array.isArray(finalData) ? finalData.length : transactionsWithCorrectIds.length} records inserted, ${actualRowCount} total rows in table`,
    );
    const insertedCount = Array.isArray(finalData)
      ? finalData.length
      : transactionsWithCorrectIds.length;
    const successResult = {
      success: true,
      message: clearData
        ? `Upload successful! Table "${tableName}" cleared and ${insertedCount} new records inserted (verified: ${actualRowCount} total rows)`
        : `Upload successful! ${insertedCount} records inserted into "${tableName}" (verified: ${actualRowCount} total rows)`,
    };
    console.log(
      "[SUCCESS] Upload to Supabase completed successfully. Returning success result:",
      successResult,
    );
    return successResult;
  } catch (error) {
    console.error("Error in uploadToSupabase:", error);
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Function to clear all data from a table
export async function clearTableData(tableName: string) {
  try {
    console.log("Clearing all data from table:", tableName);

    // Check if table exists first
    const { error: existsError } = await supabase
      .from(tableName)
      .select("id")
      .limit(1);

    if (
      existsError &&
      (existsError.code === "PGRST116" || existsError.code === "42P01")
    ) {
      return {
        success: false,
        error: "TABLE_NOT_EXISTS",
        message: `Table "${tableName}" does not exist`,
      };
    }

    // Delete all records from the table
    const { error } = await supabase.from(tableName).delete().neq("id", 0); // This will match all records since IDs start from 1

    if (error) {
      return {
        success: false,
        error: "DELETE_ERROR",
        message: error.message,
      };
    }

    return {
      success: true,
      message: `Successfully cleared all data from table "${tableName}"`,
    };
  } catch (error) {
    console.error("Error in clearTableData:", error);
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
