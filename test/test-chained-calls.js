// Test file for chained method calls
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("url", "key");

// Example chained calls that should be tracked as a single function
const result1 = supabase
  .from("users")
  .select("*")
  .eq("status", "active")
  .eq("role", "admin");

const result2 = supabase
  .from("posts")
  .select("title, content")
  .eq("published", true)
  .order("created_at", { ascending: false })
  .limit(10);

// Another example with different pattern
const data = await fetch("/api/data")
  .then((response) => response.json())
  .then((data) => data.filter((item) => item.active));

// Console logging chain
console.log("test").toString().toUpperCase();
