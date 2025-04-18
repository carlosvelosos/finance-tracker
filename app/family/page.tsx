'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
  } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";   

  type Transaction = {
    Datum: string | null;
    Beskrivning: string | null;
    Belopp: number | null;
    Category: string | null;
    Person: string | null;
    Bank: string | null;
    Id: number;
    Comment: string | null;
    Type: string | null;
    user_id: string | null;
  };

export default function FamilyFinancePage() {
    const [amandaTransactions, setAmandaTransactions] = useState<Transaction[]>([]);
    const [usTransactions, setUsTransactions] = useState<Transaction[]>([]);
    const [meTransactions, setMeTransactions] = useState<Transaction[]>([]);
    const [showComments, setShowComments] = useState(true); // State to toggle "Comment" column visibility

    // Helper function to adjust the amount based on the Type
    const adjustTransactionAmounts = (transactions: Transaction[]): Transaction[] => {
        return transactions.map((transaction) => {
        if (transaction.Type === 'Outcome' && transaction.Belopp && transaction.Belopp > 0) {
            return { ...transaction, Belopp: -Math.abs(transaction.Belopp) };
        } else if (transaction.Type === 'Income' && transaction.Belopp && transaction.Belopp < 0) {
            return { ...transaction, Belopp: Math.abs(transaction.Belopp) };
        }
        return transaction;
        });
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            const { data, error } = await supabase
                .from('BR_Inter_all_data')
                .select('*');
    
            if (error) {
                console.error('Error fetching transactions:', error);
            } else {
                const adjustedTransactions = adjustTransactionAmounts(data as Transaction[]);
                setAmandaTransactions(adjustedTransactions.filter((transaction) => transaction.Person === 'Amanda'));
                setUsTransactions(adjustedTransactions.filter((transaction) => transaction.Person === 'us'));
                setMeTransactions(adjustedTransactions.filter((transaction) => transaction.Person === 'me'));
            }
        };
    
        fetchTransactions();
    }, []);

    const [usTransactionsAmanda] = useState<Transaction[]>([
        { Id: 1, Beskrivning: 'Verde Mar', Datum: '2025-03-01', Category: 'Groceries', Belopp: -323.64, Comment: 'Alelo', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 2, Beskrivning: 'iFood', Datum: '2025-03-03', Category: 'Food Delivery', Belopp: -51.01, Comment: 'Nubank', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 3, Beskrivning: 'Verde Mar', Datum: '2025-03-04', Category: 'Groceries', Belopp: -281.70, Comment: 'Alelo', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 4, Beskrivning: 'Verde Mar', Datum: '2025-03-04', Category: 'Groceries', Belopp: -5.69, Comment: 'Alelo', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 5, Beskrivning: 'Uber', Datum: '2025-03-04', Category: 'Transport', Belopp: -9.52, Comment: 'Nubank', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 6, Beskrivning: 'Verde Mar', Datum: '2025-03-05', Category: 'Groceries', Belopp: -57.47, Comment: 'Alelo', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 7, Beskrivning: 'Uber', Datum: '2025-03-05', Category: 'Transport', Belopp: -8.91, Comment: 'Nubank', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 8, Beskrivning: 'Grupo Kflit', Datum: '2025-03-06', Category: 'Shopping', Belopp: -89.90, Comment: 'Itaú', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 9, Beskrivning: 'Pousada', Datum: '2025-03-06', Category: 'Lodging', Belopp: -598.00, Comment: 'Itaú', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 10, Beskrivning: 'Tuna Pagamentos', Datum: '2025-03-07', Category: 'Other', Belopp: -18.00, Comment: 'Nubank', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 11, Beskrivning: 'Café Geraes (Jantar)', Datum: '2025-03-07', Category: 'Dining Out', Belopp: -244.20, Comment: 'Nubank', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 12, Beskrivning: 'Araujo OP', Datum: '2025-03-08', Category: 'Pharmacy', Belopp: -21.08, Comment: 'Nubank', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 13, Beskrivning: 'Daki', Datum: '2025-03-11', Category: 'Groceries', Belopp: -87.38, Comment: 'Itaú', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 14, Beskrivning: 'Uber', Datum: '2025-03-12', Category: 'Transport', Belopp: -10.88, Comment: 'Nubank', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 15, Beskrivning: 'Verde Mar', Datum: '2025-03-14', Category: 'Groceries', Belopp: -98.35, Comment: 'Alelo', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 16, Beskrivning: 'Uber', Datum: '2025-03-14', Category: 'Transport', Belopp: -34.79, Comment: 'Nubank', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 17, Beskrivning: 'Restaurante 65', Datum: '2025-03-15', Category: 'Dining Out', Belopp: -56.39, Comment: 'Nubank', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 18, Beskrivning: 'Três Irmãos', Datum: '2025-03-15', Category: 'Groceries', Belopp: -195.09, Comment: 'Nubank', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 19, Beskrivning: 'Três Irmãos', Datum: '2025-03-16', Category: 'Groceries', Belopp: -77.42, Comment: 'Itaú', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 20, Beskrivning: 'Picolito', Datum: '2025-03-16', Category: 'Snacks', Belopp: -19.25, Comment: 'Itaú', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 21, Beskrivning: 'Três Irmãos', Datum: '2025-03-16', Category: 'Groceries', Belopp: -21.99, Comment: 'Nubank', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 22, Beskrivning: 'iFood', Datum: '2025-03-17', Category: 'Food Delivery', Belopp: -27.80, Comment: 'Itaú', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 23, Beskrivning: 'iFood', Datum: '2025-03-17', Category: 'Food Delivery', Belopp: -78.26, Comment: 'Itaú', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 24, Beskrivning: 'iFood', Datum: '2025-03-19', Category: 'Food Delivery', Belopp: -49.89, Comment: 'Itaú', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 25, Beskrivning: 'iFood', Datum: '2025-03-19', Category: 'Food Delivery', Belopp: -27.17, Comment: 'Itaú', Person: 'Amanda', Bank: null, Type: null, user_id: null },
        { Id: 26, Beskrivning: 'iFood', Datum: '2025-03-19', Category: 'Food Delivery', Belopp: -54.80, Comment: 'Itaú', Person: 'Amanda', Bank: null, Type: null, user_id: null },
      ]);
  

    const [amandaSortConfig, setAmandaSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>(null);
    const [usSortConfig, setUsSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>(null);
    const [meSortConfig, setMeSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>(null);
    const [usAmandaSortConfig, setUsAmandaSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>(null);
    
    const handleSort = (
    key: keyof Transaction,
    setSortConfig: React.Dispatch<React.SetStateAction<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>>
    ) => {
    setSortConfig((prev) => {
        if (prev?.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
        }
        return { key, direction: 'asc' };
    });
    };
    
    const sortTransactions = (
    transactions: Transaction[],
    sortConfig: { key: keyof Transaction; direction: 'asc' | 'desc' } | null
    ) => {
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
            <CardTitle>Carlos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl">
                <p className="text-xs mb-6"> 
                    Amanda&apos;s table contains the transactions made using Carlos&apos; credit card for Amanda&apos;s purchases and the amount transferred by Amanda to Carlos. It also includes half of the expenses on Carlos swedish credit card during Amanda&apos;s visit to Sweden.
                </p>
                <p className="text-xs mb-6"> 
                    The table "US" displays the shared expenses in Brasil, using Carlos&apos; credit card.
                </p>
                <p className={`${amandaTransactions.reduce((total, transaction) => total + (transaction.Belopp || 0), 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Amanda: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    amandaTransactions.reduce((total, transaction) => total + (transaction.Belopp || 0), 0)
                    )}
                </p>
                <p className={`${usTransactions.reduce((total, transaction) => total + (transaction.Belopp || 0), 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Us: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    usTransactions.reduce((total, transaction) => total + (transaction.Belopp || 0), 0)
                    )}
                </p>
                <p className={`${(amandaTransactions.reduce((total, transaction) => total + (transaction.Belopp || 0), 0) + (usTransactions.reduce((total, transaction) => total + (transaction.Belopp || 0), 0) / 2)) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Amanda + (Us / 2): {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    amandaTransactions.reduce((total, transaction) => total + (transaction.Belopp || 0), 0) + 
                    (usTransactions.reduce((total, transaction) => total + (transaction.Belopp || 0), 0) / 2)
                    )}
                </p>
              {/* <p className={`${meTransactions.reduce((total, transaction) => total + (transaction.Belopp || 0), 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                Me: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  meTransactions.reduce((total, transaction) => total + (transaction.Belopp || 0), 0)
                )}
              </p> */}
            </div>
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
            <p className={`text-xl ${usTransactionsAmanda.reduce((total, transaction) => total + (transaction.Belopp || 0), 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    usTransactionsAmanda.reduce((total, transaction) => total + (transaction.Belopp ?? 0), 0)
                )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Switch to toggle "Comment" column */}
      <div className="flex items-center mb-4">
        <Switch
          checked={showComments}
          onCheckedChange={setShowComments}
          className="mr-2"
        />
        <span className="text-sm">Show Comments</span>
      </div>

      {/* Transactions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carlos' Transactions */}
        <Card>
            <CardHeader>
                <CardTitle>Carlos&apos; Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible>
                    {/* Amanda Section */}
                    <AccordionItem value="Amanda">
                        <AccordionTrigger>Amanda</AccordionTrigger>
                        <AccordionContent>
                        <Table style={{ fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace' }}>
                            <TableHeader>
                                <TableRow className="border-b-4 border-gray-600">
                                    <TableHead className="font-bold cursor-pointer w-16" onClick={() => handleSort('Id', setAmandaSortConfig)}>
                                        Id {amandaSortConfig?.key === 'Id' && (amandaSortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead className="font-bold cursor-pointer w-32" onClick={() => handleSort('Datum', setAmandaSortConfig)}>
                                        Date {amandaSortConfig?.key === 'Datum' && (amandaSortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('Beskrivning', setAmandaSortConfig)}>
                                        Description {amandaSortConfig?.key === 'Beskrivning' && (amandaSortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    {showComments && <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('Comment', setAmandaSortConfig)}>
                                        Comment {amandaSortConfig?.key === 'Comment' && (amandaSortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>}
                                    <TableHead className="font-bold cursor-pointer w-24 text-right" onClick={() => handleSort('Belopp', setAmandaSortConfig)}>
                                        Amount {amandaSortConfig?.key === 'Belopp' && (amandaSortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {sortTransactions(amandaTransactions, amandaSortConfig).map((transaction) => (
                                <TableRow key={transaction.Id} className="text-xs">
                                    <TableCell className="w-16">{transaction.Id}</TableCell>
                                    <TableCell className="w-32">{transaction.Datum ? new Date(transaction.Datum).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell className="w-48">{transaction.Beskrivning}</TableCell>
                                    {showComments && <TableCell className="w-48">{transaction.Comment || 'N/A'}</TableCell>}
                                    <TableCell className={`w-24 text-right ${transaction.Belopp && transaction.Belopp < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {transaction.Belopp && transaction.Belopp < 0 ? '-' : '+'}
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(transaction.Belopp ?? 0))}
                                    </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Us Section */}
                    <AccordionItem value="US">
                        <AccordionTrigger>US</AccordionTrigger>
                        <AccordionContent>
                            <Table style={{ fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace' }}>
                                <TableHeader>
                                    <TableRow className="border-b-4 border-gray-600">
                                        <TableHead className="font-bold cursor-pointer w-16" onClick={() => handleSort('Id', setUsSortConfig)}>
                                            Id {usSortConfig?.key === 'Id' && (usSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead className="font-bold cursor-pointer w-32" onClick={() => handleSort('Datum', setUsSortConfig)}>
                                            Date {usSortConfig?.key === 'Datum' && (usSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('Beskrivning', setUsSortConfig)}>
                                            Description {usSortConfig?.key === 'Beskrivning' && (usSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        {showComments && <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('Comment', setUsSortConfig)}>
                                            Comment {usSortConfig?.key === 'Comment' && (usSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>}
                                        <TableHead className="font-bold cursor-pointer w-24 text-right" onClick={() => handleSort('Belopp', setUsSortConfig)}>
                                            Amount {usSortConfig?.key === 'Belopp' && (usSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {sortTransactions(usTransactions, usSortConfig).map((transaction) => (
                                    <TableRow key={transaction.Id} className="text-xs">
                                        <TableCell className="w-16">{transaction.Id}</TableCell>
                                        <TableCell className="w-32">{transaction.Datum ? new Date(transaction.Datum).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="w-48">{transaction.Beskrivning}</TableCell>
                                        {showComments && <TableCell className="w-48">{transaction.Comment || 'N/A'}</TableCell>}
                                        <TableCell className={`w-24 text-right ${transaction.Belopp && transaction.Belopp < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {transaction.Belopp && transaction.Belopp < 0 ? '-' : '+'}
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(transaction.Belopp ?? 0))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Me Section */}
                    <AccordionItem value="Carlos">
                        <AccordionTrigger>Carlos</AccordionTrigger>
                        <AccordionContent>
                            <Table style={{ fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace' }}>
                                <TableHeader>
                                    <TableRow className="border-b-4 border-gray-600">
                                        <TableHead className="font-bold cursor-pointer w-16" onClick={() => handleSort('Id', setMeSortConfig)}>
                                            Id {meSortConfig?.key === ('Id' as keyof Transaction) && (meSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead className="font-bold cursor-pointer w-32" onClick={() => handleSort('Datum', setMeSortConfig)}>
                                            Date {meSortConfig?.key === 'Datum' && (meSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('Beskrivning', setMeSortConfig)}>
                                            Description {meSortConfig?.key === 'Beskrivning' && (meSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        {showComments && <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('Comment', setMeSortConfig)}>
                                            Comment {meSortConfig?.key === 'Comment' && (meSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>}
                                        <TableHead className="font-bold cursor-pointer w-24 text-right" onClick={() => handleSort('Belopp', setMeSortConfig)}>
                                            Amount {meSortConfig?.key === 'Belopp' && (meSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {sortTransactions(meTransactions, meSortConfig).map((transaction) => (
                                    <TableRow key={transaction.Id} className="text-xs">
                                        <TableCell className="w-16">{transaction.Id}</TableCell>
                                        <TableCell className="w-32">{transaction.Datum ? new Date(transaction.Datum).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="w-48">{transaction.Beskrivning}</TableCell>
                                        {showComments && <TableCell className="w-48">{transaction.Comment || 'N/A'}</TableCell>}
                                        <TableCell className={`w-24 text-right ${transaction.Belopp && transaction.Belopp < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {transaction.Belopp && transaction.Belopp < 0 ? '-' : '+'}
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(transaction.Belopp ?? 0))}
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>

        {/* Amanda's Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Amanda&apos;s Transactions</CardTitle>
          </CardHeader>
            <CardContent>
                    <Accordion type="single" collapsible>
                        {/* Amanda Section */}
                        <AccordionItem value="Amanda">
                            <AccordionTrigger>Amanda</AccordionTrigger>
                            <AccordionContent>
                                No content yet.
                            </AccordionContent>
                    </AccordionItem>

                    {/* Us Section */}
                    <AccordionItem value="US">
                        <AccordionTrigger>US</AccordionTrigger>
                        <AccordionContent>
                            <Table style={{ fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace' }}>
                                <TableHeader>
                                    <TableRow className="border-b-4 border-gray-600">
                                        <TableHead className="font-bold cursor-pointer w-16" onClick={() => handleSort('Id', setUsAmandaSortConfig)}>
                                            Id {usAmandaSortConfig?.key === 'Id' && (usAmandaSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead className="font-bold cursor-pointer w-32" onClick={() => handleSort('Datum', setUsAmandaSortConfig)}>
                                            Date {usAmandaSortConfig?.key === 'Datum' && (usAmandaSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('Beskrivning', setUsAmandaSortConfig)}>
                                            Description {usAmandaSortConfig?.key === 'Beskrivning' && (usAmandaSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        {showComments && <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('Comment', setUsAmandaSortConfig)}>
                                            Comment {usAmandaSortConfig?.key === 'Comment' && (usAmandaSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>}
                                        <TableHead className="font-bold cursor-pointer w-24 text-right" onClick={() => handleSort('Belopp', setUsAmandaSortConfig)}>
                                            Amount {usAmandaSortConfig?.key === 'Belopp' && (usAmandaSortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortTransactions(usTransactionsAmanda, usAmandaSortConfig).map((transaction) => (
                                        <TableRow key={transaction.Id} className="text-xs">
                                            <TableCell className="w-16">{transaction.Id}</TableCell>
                                            <TableCell className="w-32">{transaction.Datum ? new Date(transaction.Datum).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell className="w-48">{transaction.Beskrivning}</TableCell>
                                            {showComments && <TableCell className="w-48">{transaction.Comment || 'N/A'}</TableCell>}
                                            <TableCell className={`w-24 text-right ${transaction.Belopp && transaction.Belopp < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {transaction.Belopp && transaction.Belopp < 0 ? '-' : '+'}
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(transaction.Belopp ?? 0))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Me Section */}
                    <AccordionItem value="Carlos">
                        <AccordionTrigger>Carlos</AccordionTrigger>
                        <AccordionContent>
                            No content yet.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}