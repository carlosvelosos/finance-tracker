export type Transaction = {
  id: number | string; // Allow string IDs for combined tables with prefixes
  created_at: string | null;
  Date: string | null;
  Description: string | null;
  Amount: number | null;
  Balance: number | null;
  Category: string | null;
  Responsible: string | null;
  Bank: string | null;
  Comment: string | null;
  user_id: string | null;
  source_table?: string | null;
  originalId?: number; // Keep original numeric ID for reference
  sourceTable?: string; // Table source identifier
};
