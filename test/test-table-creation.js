// Test script to verify table creation functionality
// This script tests the table creation and error detection logic

const { createClient } = require("@supabase/supabase-js");

// Note: Replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "your-supabase-url";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-supabase-key";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTableDetection() {
  console.log("🧪 Testing table existence detection...\n");

  // Test with a table that doesn't exist
  const nonExistentTable = "test_table_that_does_not_exist_" + Date.now();

  try {
    console.log(`📋 Testing table: ${nonExistentTable}`);

    const { data, error } = await supabase
      .from(nonExistentTable)
      .select("id")
      .limit(1);

    if (error) {
      console.log("❌ Error detected:", error.code, "-", error.message);

      if (error.code === "PGRST116" || error.code === "42P01") {
        console.log("✅ Correctly detected table does not exist!");
        console.log("   This would trigger the table creation dialog.");
      } else {
        console.log("⚠️  Different error type detected.");
      }
    } else {
      console.log("⚠️  No error detected - table might exist?");
    }
  } catch (err) {
    console.log("💥 Unexpected error:", err.message);
  }

  console.log("\n📝 Note: This test verifies that the error detection logic");
  console.log("   is working correctly for non-existent tables.");
  console.log(
    "   In the actual app, this would trigger the table creation dialog.",
  );
}

// Run the test
testTableDetection().catch(console.error);
