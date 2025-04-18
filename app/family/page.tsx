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

//   const [amandaTransactions] = useState<Transaction[]>([
//     { id: 1, description: 'Shopping', date: '2025-04-02', category: 'Clothing', amount: -300, comment: 'Clothes for kids' },
//     { id: 2, description: 'Freelance Work', date: '2025-04-07', category: 'Income', amount: 1200, comment: 'Freelance project' },
//     { id: 3, description: 'Dining Out', date: '2025-04-12', category: 'Food', amount: -100, comment: 'Dinner with family' },
//   ]);

const [amandaTransactions] = useState<Transaction[]>([
    { id: 1, description: 'Verde Mar', date: '2025-03-01', category: 'Groceries', amount: -323.64, comment: 'Alelo' },
    { id: 2, description: 'iFood', date: '2025-03-03', category: 'Food Delivery', amount: -51.01, comment: 'Nubank' },
    { id: 3, description: 'Verde Mar', date: '2025-03-04', category: 'Groceries', amount: -281.70, comment: 'Alelo' },
    { id: 4, description: 'Verde Mar', date: '2025-03-04', category: 'Groceries', amount: -5.69, comment: 'Alelo' },
    { id: 5, description: 'Uber', date: '2025-03-04', category: 'Transport', amount: -9.52, comment: 'Nubank' },
    { id: 6, description: 'Verde Mar', date: '2025-03-05', category: 'Groceries', amount: -57.47, comment: 'Alelo' },
    { id: 7, description: 'Uber', date: '2025-03-05', category: 'Transport', amount: -8.91, comment: 'Nubank' },
    { id: 8, description: 'Grupo Kflit', date: '2025-03-06', category: 'Shopping', amount: -89.90, comment: 'Itaú' },
    { id: 9, description: 'Pousada', date: '2025-03-06', category: 'Lodging', amount: -598.00, comment: 'Itaú' },
    { id: 10, description: 'Tuna Pagamentos', date: '2025-03-07', category: 'Other', amount: -18.00, comment: 'Nubank' },
    { id: 11, description: 'Café Geraes (Jantar)', date: '2025-03-07', category: 'Dining Out', amount: -244.20, comment: 'Nubank' },
    { id: 12, description: 'Araujo OP', date: '2025-03-08', category: 'Pharmacy', amount: -21.08, comment: 'Nubank' },
    { id: 13, description: 'Daki', date: '2025-03-11', category: 'Groceries', amount: -87.38, comment: 'Itaú' },
    { id: 14, description: 'Uber', date: '2025-03-12', category: 'Transport', amount: -10.88, comment: 'Nubank' },
    { id: 15, description: 'Verde Mar', date: '2025-03-14', category: 'Groceries', amount: -98.35, comment: 'Alelo' },
    { id: 16, description: 'Uber', date: '2025-03-14', category: 'Transport', amount: -34.79, comment: 'Nubank' },
    { id: 17, description: 'Restaurante 65', date: '2025-03-15', category: 'Dining Out', amount: -56.39, comment: 'Nubank' },
    { id: 18, description: 'Três Irmãos', date: '2025-03-15', category: 'Groceries', amount: -195.09, comment: 'Nubank' },
    { id: 19, description: 'Três Irmãos', date: '2025-03-16', category: 'Groceries', amount: -77.42, comment: 'Itaú' },
    { id: 20, description: 'Picolito', date: '2025-03-16', category: 'Snacks', amount: -19.25, comment: 'Itaú' },
    { id: 21, description: 'Três Irmãos', date: '2025-03-16', category: 'Groceries', amount: -21.99, comment: 'Nubank' },
    { id: 22, description: 'iFood', date: '2025-03-17', category: 'Food Delivery', amount: -27.80, comment: 'Itaú' },
    { id: 23, description: 'iFood', date: '2025-03-17', category: 'Food Delivery', amount: -78.26, comment: 'Itaú' },
    { id: 24, description: 'iFood', date: '2025-03-19', category: 'Food Delivery', amount: -49.89, comment: 'Itaú' },
    { id: 25, description: 'iFood', date: '2025-03-19', category: 'Food Delivery', amount: -27.17, comment: 'Itaú' },
    { id: 26, description: 'iFood', date: '2025-03-19', category: 'Food Delivery', amount: -54.80, comment: 'Itaú' }
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
            <CardTitle>Amanda</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl ${amandaTransactions.reduce((total, transaction) => total + transaction.amount, 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    amandaTransactions.reduce((total, transaction) => total + transaction.amount, 0)
                )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carlos' Transactions */}
        <Card>
            <CardHeader>
                <CardTitle>Carlos&apos; Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <Table style={{ fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace' }}>
                    <TableHeader>
                        <TableRow className="border-b-4 border-gray-600">
                            <TableHead className="font-bold cursor-pointer w-16" onClick={() => handleSort('id')}>
                                Id {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead className="font-bold cursor-pointer w-32" onClick={() => handleSort('date')}>
                                Date {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('description')}>
                                Description {sortConfig?.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('comment')}>
                                Comment {sortConfig?.key === 'comment' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead className="font-bold cursor-pointer w-24 text-right" onClick={() => handleSort('amount')}>
                                Amount {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
            <CardTitle>Amanda&apos;s Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table style={{ fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace' }}>
                <TableHeader>
                    <TableRow className="border-b-4 border-gray-600">
                        <TableHead className="font-bold cursor-pointer w-16" onClick={() => handleSort('id')}>
                            Id {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="font-bold cursor-pointer w-32" onClick={() => handleSort('date')}>
                            Date {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('description')}>
                            Description {sortConfig?.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('comment')}>
                            Comment {sortConfig?.key === 'comment' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="font-bold cursor-pointer w-24 text-right" onClick={() => handleSort('amount')}>
                            Amount {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
                                {transaction.amount < 0 ? '-' : '+'}
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(transaction.amount))}
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