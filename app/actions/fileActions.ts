import * as XLSX from "xlsx";
import Papa from "papaparse"; // Import papaparse
import { supabase } from "@/lib/supabaseClient";
import {
  processDEV,
  processInterBR,
  processHandelsbanken,
  processAmex,
  processSEB,
} from "@/lib/utils/bankProcessors";

export async function uploadExcel(file: File, bank: string) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    let data: string[][]; // Explicitly type data as string[][]

    if (file.name.endsWith(".csv")) {
      const text = new TextDecoder("utf-8").decode(arrayBuffer);

      // Use PapaParse to parse the CSV data
      const parsed = Papa.parse<string[]>(text, {
        header: false, // Disable header row parsing
        skipEmptyLines: true, // Skip empty lines
      });
      data = parsed.data as string[][]; // Cast parsed data to string[][]
    } else {
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      data = XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[sheetName], {
        header: 1,
      }) as string[][]; // Cast to string[][]
    }
    console.log("Parsed data:", data);

    let processedData;
    switch (bank) {
      case "DEV":
        processedData = processDEV(data);
        console.log("Processed Data:", processedData);
        break;
      case "Inter-BR":
        processedData = processInterBR(data, file.name);
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
      default:
        throw new Error("Unknown bank type.");
    }

    // Upload to Supabase
    return await uploadToSupabase(
      processedData.tableName,
      processedData.transactions,
    );
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

async function uploadToSupabase(
  tableName: string,
  transactions: Record<string, unknown>[],
) {
  try {
    // Get the current highest ID from the table
    const { data: maxIdData, error: maxIdError } = await supabase
      .from(tableName)
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    if (maxIdError && maxIdError.code !== "PGRST116") {
      // PGRST116 = table doesn't exist
      throw new Error(maxIdError.message);
    }

    // Calculate the starting ID for new records
    const currentMaxId =
      maxIdData && maxIdData.length > 0 ? maxIdData[0].id : 0;

    // Update transaction IDs to continue from the current max
    const transactionsWithCorrectIds = transactions.map(
      (transaction, index) => ({
        ...transaction,
        id: currentMaxId + index + 1,
      }),
    );

    const { error } = await supabase
      .from(tableName)
      .insert(transactionsWithCorrectIds);
    if (error) throw new Error(error.message);
    return `Upload successful! ${transactionsWithCorrectIds.length} records inserted into ${tableName} starting from ID ${currentMaxId + 1}`;
  } catch (error) {
    return `Error uploading to Supabase: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
