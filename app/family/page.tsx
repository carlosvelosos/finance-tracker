'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  description: string;
  date: string;
  category: string;
  amount: number;
  comment?: string; // Optional field for comments
};

export default function FamilyFinancePage() {
  const [carlosTransactions] = useState<Transaction[]>([
    { id: 1, description: 'Groceries', date: '2025-04-01', category: 'Food', amount: -150, comment: 'Weekly groceries' },
    { id: 2, description: 'Salary', date: '2025-04-05', category: 'Income', amount: 2500, comment: 'Monthly salary' },
    { id: 3, description: 'Utilities', date: '2025-04-10', category: 'Bills', amount: -200, comment: 'Electricity bill' },
  ]);

  const [amandaTransactions] = useState<Transaction[]>([
    { id: 1, description: 'Shopping', date: '2025-04-02', category: 'Clothing', amount: -300, comment: 'Clothes for kids' },
    { id: 2, description: 'Freelance Work', date: '2025-04-07', category: 'Income', amount: 1200, comment: 'Freelance project' },
    { id: 3, description: 'Dining Out', date: '2025-04-12', category: 'Food', amount: -100, comment: 'Dinner with family' },
  ]);

  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof Transaction) => {
    setSortConfig((prev) => {
      if (prev?.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortTransactions = (transactions: Transaction[]) => {
    if (!sortConfig) return transactions;

    const { key, direction } = sortConfig;
    const sorted = [...transactions].sort((a, b) => {
      const order = direction === 'asc' ? 1 : -1;

      const aValue = a[key] ?? ''; // Handle undefined or null values
      const bValue = b[key] ?? '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * order;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * order;
      }

      return 0;
    });

    return sorted;
  };

  return (
    <div className="p-6">
      {/* Main Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-green-600">$12,345.67</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-blue-600">$4,500.00</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-red-600">$3,200.00</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carlos' Transactions */}
        <Card>
            <CardHeader>
                <CardTitle>Carlos' Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <Table style={{ fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace' }}> {/* Explicit monospace font */}
                <TableHeader>
                    <TableRow className="border-b-2 border-gray-300">
                    <TableHead className="cursor-pointer w-16" onClick={() => handleSort('id')}>
                        Id {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer w-32" onClick={() => handleSort('date')}>
                        Date {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer w-48" onClick={() => handleSort('description')}>
                        Description {sortConfig?.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer w-48" onClick={() => handleSort('comment')}>
                        Comment {sortConfig?.key === 'comment' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer w-24 text-right" onClick={() => handleSort('amount')}>
                        Value {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortTransactions(carlosTransactions).map((transaction) => (
                    <TableRow key={transaction.id}>
                        <TableCell className="w-16">{transaction.id}</TableCell>
                        <TableCell className="w-32">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell className="w-48">{transaction.description}</TableCell>
                        <TableCell className="w-48">{transaction.comment || 'N/A'}</TableCell>
                        <TableCell className={`w-24 text-right ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Amanda's Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Amanda's Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table style={{ fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace' }}> {/* Explicit monospace font */}
              <TableHeader>
                <TableRow className="border-b-2 border-gray-300">
                  <TableHead className="cursor-pointer w-16" onClick={() => handleSort('id')}>
                    Id {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer w-32" onClick={() => handleSort('date')}>
                    Date {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer w-48" onClick={() => handleSort('description')}>
                    Description {sortConfig?.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer w-48" onClick={() => handleSort('comment')}>
                    Comment {sortConfig?.key === 'comment' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer w-24 text-right" onClick={() => handleSort('amount')}>
                    Value {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortTransactions(amandaTransactions).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="w-16">{transaction.id}</TableCell>
                    <TableCell className="w-32">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell className="w-48">{transaction.description}</TableCell>
                    <TableCell className="w-48">{transaction.comment || 'N/A'}</TableCell>
                    <TableCell className={`w-24 text-right ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}