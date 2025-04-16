import * as XLSX from "xlsx";
import Papa from "papaparse"; // Import papaparse
import { supabase } from "@/lib/supabaseClient";
import { processDEV, processInterBR, processHandelsbanken, processAmex, processSEB } from "@/lib/utils/bankProcessors";

export async function uploadExcel(file: File, bank: string) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    let data;

    if (file.name.endsWith(".csv")) {
      const text = new TextDecoder("utf-8").decode(arrayBuffer);

      // Use PapaParse to parse the CSV data
      const parsed = Papa.parse(text, {
        header: false, // Disable header row parsing
        skipEmptyLines: true, // Skip empty lines
      });
      data = parsed.data; // Extract parsed data
    } else {
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    }
    console.log("Parsed data:", data);

    let processedData;
    switch (bank) {
      case "DEV":
        processedData = processDEV(data);
        console.log("Processed Data:", processedData);
        break;
      case "Inter-BR":
        processedData = processInterBR(data);
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
    return await uploadToSupabase(processedData.tableName, processedData.transactions);
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

async function uploadToSupabase(tableName: string, transactions: any[]) {
  try {
    const { error } = await supabase.from(tableName).insert(transactions);
    if (error) throw new Error(error.message);
    return `Upload successful! Data inserted into ${tableName}`;
  } catch (error) {
    return `Error uploading to Supabase: ${error.message}`;
  }
}
