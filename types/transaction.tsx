export type Transaction = {
  id: number;
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
};
