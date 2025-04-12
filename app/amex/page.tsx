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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
  } from "@/components/ui/accordion";
  
  export default function Home() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [sortColumn, setSortColumn] = useState<keyof Transaction | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [descriptionFilter, setDescriptionFilter] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('All'); // State for selected month
  
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
  
    // Filter transactions for the main table (excluding "Invoice")
    const filteredTransactions = transactions
      .filter((transaction) => transaction.Bank === 'American Express') // Filter by bank
      .filter((transaction) => {
        const categoryQuery = categoryFilter.toLowerCase();
        return transaction.Category?.toLowerCase().includes(categoryQuery);
      }) // Filter by category input
      .filter((transaction) => {
        const descriptionQuery = descriptionFilter.toLowerCase();
        return transaction.Description?.toLowerCase().includes(descriptionQuery);
      }) // Filter by description input
      .filter((transaction) => {
        if (selectedMonth === 'All') return true;
        if (transaction.Date) {
          const transactionMonth = new Date(transaction.Date).getMonth(); // Get month (0-11)
          const selectedMonthIndex = [
            'Jan', 'Fev', 'Mar', 'Apr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dez',
          ].indexOf(selectedMonth);
          return transactionMonth === selectedMonthIndex;
        }
        return false;
      }) // Filter by selected month
      .filter((transaction) => transaction.Category !== 'Invoice'); // Exclude "Invoice" category
  
    // Filter transactions for the second table (only "Invoice")
    const invoiceTransactions = transactions
      .filter((transaction) => transaction.Bank === 'American Express') // Filter by bank
      .filter((transaction) => transaction.Category === 'Invoice'); // Include only "Invoice" category
  
    // Calculate the sum of the Amount column for the main table
    const totalAmount = filteredTransactions.reduce((sum, transaction) => {
      return sum + (transaction.Amount || 0);
    }, 0);
  
    // Calculate the sum of the Amount column for the "Invoice" table
    const totalInvoiceAmount = invoiceTransactions.reduce((sum, transaction) => {
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
        <h1 className="text-2xl font-bold text-center mb-6">American Express Transactions</h1>
  
        {/* Accordion */}
        <Accordion type="single" collapsible>
          {/* Main Table Section */}
          <AccordionItem value="main-table">
            <AccordionTrigger>Main Transactions</AccordionTrigger>
            <AccordionContent>
              {/* Tabs for Month Selection */}
              <Tabs
                defaultValue="All"
                onValueChange={(value) => setSelectedMonth(value)}
                className="mb-4"
              >
                <TabsList>
                  <TabsTrigger value="All">All</TabsTrigger>
                  <TabsTrigger value="Jan">Jan</TabsTrigger>
                  <TabsTrigger value="Fev">Fev</TabsTrigger>
                  <TabsTrigger value="Mar">Mar</TabsTrigger>
                  <TabsTrigger value="Apr">Apr</TabsTrigger>
                  <TabsTrigger value="Mai">Mai</TabsTrigger>
                  <TabsTrigger value="Jun">Jun</TabsTrigger>
                  <TabsTrigger value="Jul">Jul</TabsTrigger>
                  <TabsTrigger value="Ago">Ago</TabsTrigger>
                  <TabsTrigger value="Sep">Sep</TabsTrigger>
                  <TabsTrigger value="Oct">Oct</TabsTrigger>
                  <TabsTrigger value="Nov">Nov</TabsTrigger>
                  <TabsTrigger value="Dez">Dez</TabsTrigger>
                </TabsList>
              </Tabs>
  
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
  
              {/* Main Table */}
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
                  {sortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>{transaction.Date ? new Date(transaction.Date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{transaction.Description || 'N/A'}</TableCell>
                      <TableCell>
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
              <div className="mt-4 text-right font-bold">
                Total Amount: {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(totalAmount)}
              </div>
            </AccordionContent>
          </AccordionItem>
  
          {/* Invoice Table Section */}
          <AccordionItem value="invoice-table">
            <AccordionTrigger>Invoice Transactions</AccordionTrigger>
            <AccordionContent>
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
                  {invoiceTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>{transaction.Date ? new Date(transaction.Date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{transaction.Description || 'N/A'}</TableCell>
                      <TableCell>
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
              <div className="mt-4 text-right font-bold">
                Total Invoice Amount: {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(totalInvoiceAmount)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }