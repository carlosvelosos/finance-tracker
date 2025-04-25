'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { CustomBarChart } from '@/components/ui/custombarchart';
import ProtectedRoute from '@/components/protected-route';

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
    return <div className="text-center mt-10">Please log in to view the chart.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="pt-8 pb-8">
        <CustomBarChart
          data={transactions} // Pass raw transaction data
          barColor="hsl(var(--chart-1))"
          title="Total Amount per Category"
          description="Showing totals for American Express, SJ Prio and Handelsbanken transactions"
        />
      </div>
    </div>
  );
}