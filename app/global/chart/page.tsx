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
        //   .eq('Bank', 'American Express, SJ Prio and Handelsbanken'); // Filter by Bank = American Express, SJ Prio and Handelsbanken

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
  
    const totalSum = Object.values(totals).reduce((sum, value) => sum + Math.abs(value), 0); // Calculate total sum of all categories
  
    const sortedCategories = Object.entries(totals)
      .map(([category, total]) => ({
        category,
        total: Math.abs(total), // Convert to absolute value
      }))
      .sort((a, b) => a.total - b.total); // Sort categories in ascending order by total
  
    let minorExpensesTotal = 0;
    const filteredCategories = [];
    for (const category of sortedCategories) {
      if ((minorExpensesTotal + category.total) / totalSum <= 0.02) { // Check if the category is less than 3% of the total
        minorExpensesTotal += category.total; // Add to "Minor expenses" total
      } else {
        filteredCategories.push(category); // Keep the category
      }
    }
  
    // Add "Minor expenses" as a new category if applicable
    if (minorExpensesTotal > 0) {
      filteredCategories.push({
        category: 'Minor expenses (2%)',
        total: minorExpensesTotal,
      });
    }
  
    const chartData = filteredCategories
      .filter((item) => !['Invoice', 'Salary', 'Crédit card'].includes(item.category)) // Filter out specific categories
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
          description="Showing totals for American Express, SJ Prio and Handelsbanken transactions"
        />
      </div>
    </div>
  );
}