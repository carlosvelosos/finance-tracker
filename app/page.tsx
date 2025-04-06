'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Transaction = {
  id: number;
  created_at: string;
  Date: string | null;
  Description: string | null;
  Amount: number | null;
  Balance: number | null;
  Category: string | null;
  Responsable: string | null;
  Bank: string | null;
  Comment: string | null;
  user_id: string;
  source_table: string | null;
};

export default function Home() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        const { data, error } = await supabase
          .from('Sweden_transactions_agregated_2025')
          .select(`
            id,
            created_at,
            "Date",
            "Description",
            "Amount",
            "Balance",
            "Category",
            "Responsable",
            "Bank",
            "Comment",
            user_id,
            source_table
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching transactions:', error);
        } else {
          setTransactions(data as Transaction[]);
        }
      };

      fetchTransactions();
    }
  }, [user]);

  if (!user) {
    return <div className="text-center mt-10">Please log in to view your transactions.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Your Transactions</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Bank</TableHead>
            <TableHead>Comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.Date ? new Date(transaction.Date).toLocaleDateString() : 'N/A'}</TableCell>
              <TableCell>{transaction.Description || 'N/A'}</TableCell>
              <TableCell>{transaction.Amount !== null ? `$${transaction.Amount.toFixed(2)}` : 'N/A'}</TableCell>
              <TableCell>{transaction.Balance !== null ? `$${transaction.Balance.toFixed(2)}` : 'N/A'}</TableCell>
              <TableCell>{transaction.Category || 'N/A'}</TableCell>
              <TableCell>{transaction.Responsable || 'N/A'}</TableCell>
              <TableCell>{transaction.Bank || 'N/A'}</TableCell>
              <TableCell>{transaction.Comment || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}