// Real-world example from the user's request
import { supabase } from "../../../lib/supabaseClient";

export default function TestPage() {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("Sweden_transactions_agregated_2025")
      .select("id, Category, Amount, Bank, Description, Date")
      .eq("user_id", user.id)
      .eq("Bank", "American Express");

    return data;
  };
}
