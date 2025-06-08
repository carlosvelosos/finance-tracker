// Test to check if IN_2024 table exists in Supabase
import { supabase } from "./lib/supabaseClient.js";

async function checkTable() {
  console.log("Checking if IN_2024 table exists...");

  const { data, error } = await supabase.from("IN_2024").select("id").limit(1);

  console.log("Data:", data);
  console.log("Error:", error);

  if (error) {
    console.log("Error code:", error.code);
    console.log("Error message:", error.message);

    if (error.code === "PGRST116") {
      console.log("Table doesn't exist - this should trigger the dialog");
    }
  } else {
    console.log("Table exists!");
  }
}

checkTable();
