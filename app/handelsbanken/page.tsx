'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
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
    const [sortColumn, setSortColumn] = useState<keyof Transaction | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [descriptionFilter, setDescriptionFilter] = useState('');
  
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
  
    const handleSort = (column: keyof Transaction) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    };
  
    // Filter transactions
    const filteredTransactions = transactions
      .filter((transaction) => transaction.Bank === 'Handelsbanken')
      .filter((transaction) => {
        const categoryQuery = categoryFilter.toLowerCase();
        return transaction.Category?.toLowerCase().includes(categoryQuery);
      })
      .filter((transaction) => {
        const descriptionQuery = descriptionFilter.toLowerCase();
        return transaction.Description?.toLowerCase().includes(descriptionQuery);
      });
  
    // Calculate the sum of the Amount column
    const totalAmount = filteredTransactions.reduce((sum, transaction) => {
      return sum + (transaction.Amount || 0);
    }, 0);
  
    // Sort the filtered transactions
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      if (!sortColumn) return 0;
  
      const aValue = a[sortColumn] ?? '';
      const bValue = b[sortColumn] ?? '';
  
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
  
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
  
      return 0;
    });
  
    if (!user) {
      return <div className="text-center mt-10">Please log in to view your transactions.</div>;
    }
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-6">Handelsbanken Transactions</h1>
  
        {/* Filter Inputs */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Filter by Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Filter by Description"
            value={descriptionFilter}
            onChange={(e) => setDescriptionFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
  
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('id')}>
                ID {sortColumn === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('Date')}>
                Date {sortColumn === 'Date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('Description')}>
                Description {sortColumn === 'Description' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('Amount')}>
                Amount {sortColumn === 'Amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('Balance')}>
                Balance {sortColumn === 'Balance' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('Category')}>
                Category {sortColumn === 'Category' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('Responsable')}>
                Responsable {sortColumn === 'Responsable' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('Bank')}>
                Bank {sortColumn === 'Bank' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('Comment')}>
                Comment {sortColumn === 'Comment' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{transaction.Date ? new Date(transaction.Date).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{transaction.Description || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  {transaction.Amount !== null
                    ? new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(transaction.Amount)
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {transaction.Balance !== null
                    ? new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(transaction.Balance)
                    : 'N/A'}
                </TableCell>
                <TableCell>{transaction.Category || 'N/A'}</TableCell>
                <TableCell>{transaction.Responsable || 'N/A'}</TableCell>
                <TableCell>{transaction.Bank || 'N/A'}</TableCell>
                <TableCell>{transaction.Comment || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
  
        {/* Total Amount */}
        <div className="mt-4 text-right font-bold">
          Total Amount: {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(totalAmount)}
        </div>
      </div>
    );
  }