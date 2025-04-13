'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { CustomBarChart } from '@/components/ui/custombarchart';

type Transaction = {
  id: number;
  Category: string | null;
  Amount: number | null;
  Bank: string | null;
};

export default function CategoryChartPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [data, setData] = useState<{ category: string; total: number }[]>([]);

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        const { data, error } = await supabase
          .from('Sweden_transactions_agregated_2025')
          .select('Category, Amount, Bank')
          .eq('user_id', user.id)
          .eq('Bank', 'SEB SJ Prio'); // Filter by Bank = SEB SJ Prio

        if (error) {
          console.error('Error fetching transactions:', error);
        } else {
          setTransactions(data as Transaction[]);
        }
      };

      fetchTransactions();
    }
  }, [user]);

  useEffect(() => {
    const totals = transactions.reduce((acc, transaction) => {
      if (transaction.Category && transaction.Amount) {
        acc[transaction.Category] = (acc[transaction.Category] || 0) + transaction.Amount;
      }
      return acc;
    }, {} as Record<string, number>);
  
    const chartData = Object.entries(totals)
      .map(([category, total]) => ({
        category,
        total: Math.abs(total), // Convert to absolute value
      }))
      .filter((item) => item.category !== 'Invoice') // Filter out the "Invoice" category
      .sort((a, b) => b.total - a.total); // Sort in descending order
  
    setData(chartData);
  }, [transactions]);

  if (!user) {
    return <div className="text-center mt-10">Please log in to view the chart.</div>;
  }

  return (
    // <div className="container mx-auto p-4">
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="pt-8 pb-8">
        <CustomBarChart
          data={data}
          // height={400}
          barColor="hsl(var(--chart-1))"
          title="Total Amount per Category"
          description="Showing totals for SEB SJ Prio transactions"
        />
      </div>
    </div>
  );
}