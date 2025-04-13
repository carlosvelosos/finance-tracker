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
  Description: string | null;
};

export default function CategoryChartPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        const { data, error } = await supabase
          .from('Sweden_transactions_agregated_2025')
          .select('Category, Amount, Bank, Description') // Include Description in the query
          .eq('user_id', user.id)
          .eq('Bank', 'Handelsbanken'); // Filter by Bank = Handelsbanken

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
    return <div className="text-center mt-10">Please log in to view the chart.</div>;
  }

  return (
    // <div className="container mx-auto p-4">
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="pt-8 pb-8">
        <CustomBarChart
          data={transactions} // Pass raw transaction data
          // height={400}
          barColor="hsl(var(--chart-1))"
          title="Total Amount per Category"
          description="Showing totals for Handelsbanken transactions"
        />
      </div>
    </div>
  );
}