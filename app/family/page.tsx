'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import TableCardFamily from "@/components/ui/table-card-family";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import ProtectedRoute from '@/components/protected-route';
import { Separator } from "@/components/ui/separator";

type Transaction = {
    id: number; // Corresponds to the `id` column (bigint, primary key)
    created_at: string | null; // Corresponds to the `created_at` column (timestamp with time zone)
    Date: string | null; // Corresponds to the `Date` column (date, nullable)
    Description: string | null; // Corresponds to the `Description` column (text, nullable)
    Amount: number | null; // Corresponds to the `Amount` column (numeric, nullable)
    Balance: number | null; // Corresponds to the `Balance` column (numeric, nullable)
    Category: string | null; // Corresponds to the `Category` column (text, default 'Unknown')
    Responsible: string | null; // Corresponds to the `Responsible` column (text, default 'Carlos')
    Bank: string | null; // Corresponds to the `Bank` column (text, default 'Inter Black')
    Comment: string | null; // Corresponds to the `Comment` column (text, nullable)
    user_id: string | null; // Corresponds to the `user_id` column (uuid, nullable)
};

export default function FamilyFinancePage() {
    const [amandaTransactions, setAmandaTransactions] = useState<Transaction[]>([]);
    const [usTransactions, setUsTransactions] = useState<Transaction[]>([]);
    const [meTransactions, setMeTransactions] = useState<Transaction[]>([]);
    const [showComments, setShowComments] = useState(false); // State to toggle "Comment" column visibility
    const [showDate, setShowDate] = useState(false); // State to toggle "Date" column visibility
    const [showId, setShowId] = useState(false); // State to toggle "Id" column visibility

    // Helper function to adjust the amount based on the Balance
    const adjustTransactionAmounts = (transactions: Transaction[]): Transaction[] => {
        return transactions.map((transaction) => {
        if (transaction.Comment?.includes('Outcome') && transaction.Amount && transaction.Amount > 0) {
            return { ...transaction, Amount: -Math.abs(transaction.Amount) };
        } else if (transaction.Comment?.includes('Income') && transaction.Amount && transaction.Amount < 0) {
            return { ...transaction, Amount: Math.abs(transaction.Amount) };
        }
        return transaction;
        });
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            console.log('Fetching transactions from Supabase...'); // Debug log
    
            // Fetch data from both tables
            const { data: data2024, error: error2024 } = await supabase
                .from('Brasil_transactions_agregated_2024')
                .select('*');

            const { data: data2025, error: error2025 } = await supabase
                .from('Brasil_transactions_agregated_2025')
                .select('*');
    
            if (error2024 || error2025) {
                console.error('Error fetching transactions:', error2024 || error2025);
            } else {
                console.log('Fetched transactions from 2024:', data2024); // Log 2024 data
                console.log('Fetched transactions from 2025:', data2025); // Log 2025 data
    
                // Combine data from both years
                const combinedData = [...(data2024 || []), ...(data2025 || [])];
    
                const adjustedTransactions = adjustTransactionAmounts(combinedData as Transaction[]);
                console.log('Adjusted transactions:', adjustedTransactions);
    
                setAmandaTransactions(adjustedTransactions.filter((transaction) => transaction.Responsible === 'Amanda'));
                setUsTransactions(adjustedTransactions.filter((transaction) => transaction.Responsible === 'us'));
                setMeTransactions(adjustedTransactions.filter((transaction) => transaction.Responsible === 'Carlos'));
            }
        };
    
        fetchTransactions();
    }, []);

    const [usTransactionsAmanda] = useState<Transaction[]>([
        { id: 1, created_at: null, Date: '2025-03-01', Description: 'Verde Mar', Amount: -323.64, Balance: null, Category: 'Groceries', Responsible: 'us', Bank: null, Comment: 'Alelo', user_id: null },
        { id: 2, created_at: null, Date: '2025-03-03', Description: 'iFood', Amount: -51.01, Balance: null, Category: 'Food Delivery', Responsible: 'us', Bank: null, Comment: 'Nubank', user_id: null },
        { id: 3, created_at: null, Date: '2025-03-04', Description: 'Verde Mar', Amount: -281.70, Balance: null, Category: 'Groceries', Responsible: 'us', Bank: null, Comment: 'Alelo', user_id: null },
        { id: 4, created_at: null, Date: '2025-03-04', Description: 'Verde Mar', Amount: -5.69, Balance: null, Category: 'Groceries', Responsible: 'us', Bank: null, Comment: 'Alelo', user_id: null },
        { id: 5, created_at: null, Date: '2025-03-04', Description: 'Uber', Amount: -9.52, Balance: null, Category: 'Transport', Responsible: 'us', Bank: null, Comment: 'Nubank', user_id: null },
        { id: 6, created_at: null, Date: '2025-03-05', Description: 'Verde Mar', Amount: -57.47, Balance: null, Category: 'Groceries', Responsible: 'us', Bank: null, Comment: 'Alelo', user_id: null },
        { id: 7, created_at: null, Date: '2025-03-05', Description: 'Uber', Amount: -8.91, Balance: null, Category: 'Transport', Responsible: 'us', Bank: null, Comment: 'Nubank', user_id: null },
        { id: 8, created_at: null, Date: '2025-03-06', Description: 'Grupo Kflit', Amount: -89.90, Balance: null, Category: 'Shopping', Responsible: 'us', Bank: null, Comment: 'Itaú', user_id: null },
        { id: 9, created_at: null, Date: '2025-03-06', Description: 'Pousada', Amount: -598.00, Balance: null, Category: 'Lodging', Responsible: 'us', Bank: null, Comment: 'Itaú', user_id: null },
        { id: 10, created_at: null, Date: '2025-03-07', Description: 'Tuna Pagamentos', Amount: -18.00, Balance: null, Category: 'Other', Responsible: 'us', Bank: null, Comment: 'Nubank', user_id: null },
        { id: 11, created_at: null, Date: '2025-03-07', Description: 'Café Geraes (Jantar)', Amount: -244.20, Balance: null, Category: 'Dining Out', Responsible: 'us', Bank: null, Comment: 'Nubank', user_id: null },
        { id: 12, created_at: null, Date: '2025-03-08', Description: 'Araujo OP', Amount: -21.08, Balance: null, Category: 'Pharmacy', Responsible: 'us', Bank: null, Comment: 'Nubank', user_id: null },
        { id: 13, created_at: null, Date: '2025-03-11', Description: 'Daki', Amount: -87.38, Balance: null, Category: 'Groceries', Responsible: 'us', Bank: null, Comment: 'Itaú', user_id: null },
        { id: 14, created_at: null, Date: '2025-03-12', Description: 'Uber', Amount: -10.88, Balance: null, Category: 'Transport', Responsible: 'us', Bank: null, Comment: 'Nubank', user_id: null },
        { id: 15, created_at: null, Date: '2025-03-14', Description: 'Verde Mar', Amount: -98.35, Balance: null, Category: 'Groceries', Responsible: 'us', Bank: null, Comment: 'Alelo', user_id: null },
        { id: 16, created_at: null, Date: '2025-03-14', Description: 'Uber', Amount: -34.79, Balance: null, Category: 'Transport', Responsible: 'us', Bank: null, Comment: 'Nubank', user_id: null },
        { id: 17, created_at: null, Date: '2025-03-15', Description: 'Restaurante 65', Amount: -56.39, Balance: null, Category: 'Dining Out', Responsible: 'us', Bank: null, Comment: 'Nubank', user_id: null },
        { id: 18, created_at: null, Date: '2025-03-15', Description: 'Três Irmãos', Amount: -195.09, Balance: null, Category: 'Groceries', Responsible: 'us', Bank: null, Comment: 'Nubank', user_id: null },
        { id: 19, created_at: null, Date: '2025-03-16', Description: 'Três Irmãos', Amount: -77.42, Balance: null, Category: 'Groceries', Responsible: 'us', Bank: null, Comment: 'Itaú', user_id: null },
        { id: 20, created_at: null, Date: '2025-03-16', Description: 'Picolito', Amount: -19.25, Balance: null, Category: 'Snacks', Responsible: 'us', Bank: null, Comment: 'Itaú', user_id: null },
        { id: 21, created_at: null, Date: '2025-03-16', Description: 'Três Irmãos', Amount: -21.99, Balance: null, Category: 'Groceries', Responsible: 'us', Bank: null, Comment: 'Nubank', user_id: null },
        { id: 22, created_at: null, Date: '2025-03-17', Description: 'iFood', Amount: -27.80, Balance: null, Category: 'Food Delivery', Responsible: 'us', Bank: null, Comment: 'Itaú', user_id: null },
        { id: 23, created_at: null, Date: '2025-03-17', Description: 'iFood', Amount: -78.26, Balance: null, Category: 'Food Delivery', Responsible: 'us', Bank: null, Comment: 'Itaú', user_id: null },
        { id: 24, created_at: null, Date: '2025-03-19', Description: 'iFood', Amount: -49.89, Balance: null, Category: 'Food Delivery', Responsible: 'us', Bank: null, Comment: 'Itaú', user_id: null },
        { id: 25, created_at: null, Date: '2025-03-19', Description: 'iFood', Amount: -27.17, Balance: null, Category: 'Food Delivery', Responsible: 'us', Bank: null, Comment: 'Itaú', user_id: null },
        { id: 26, created_at: null, Date: '2025-03-19', Description: 'iFood', Amount: -54.80, Balance: null, Category: 'Food Delivery', Responsible: 'us', Bank: null, Comment: 'Itaú', user_id: null },
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
    <ProtectedRoute>
    <div className="p-6">
        {/* Main Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Summary Card */}
            <Card className='border-none shadow-none'>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl">
                        <p>
                            Amandas&apos; balance: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            amandaTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0) + 
                            (usTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2) - 
                            (usTransactionsAmanda.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2)
                            )}
                        </p>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="summary">
                                <AccordionTrigger>Summary Details</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-xs mb-6"> 
                                        This page provides a detailed breakdown of Amanda&apos;s and Carlos&apos; shared and individual expenses. Amanda can view her personal transactions, shared expenses, and the total amounts calculated for each category.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </CardContent>
            </Card>

            {/* Amandas' personal purchases card */}
            <Card className='border border-gray-300 shadow-none'>
                <CardHeader>
                    <CardTitle>Amanda - Personal</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Card's total */}
                    <p className="text-xl font-bold mb-4">
                        {(() => {
                            const bagaggioTransactions = amandaTransactions.filter(transaction =>
                                transaction.Description?.toLowerCase().includes('bagaggio'.toLowerCase())
                            );
                            const unibhTransactions = amandaTransactions.filter(transaction =>
                                transaction.Description?.toLowerCase().includes('unibh'.toLowerCase())
                            );
                            const gympassTransactions = amandaTransactions.filter(transaction =>
                                transaction.Description?.toLowerCase().includes('gympass'.toLowerCase())
                            );
                            const iphoneTransactions = amandaTransactions.filter(transaction =>
                                transaction.Description?.toLowerCase().includes('iphone'.toLowerCase()) ||
                                transaction.Description?.toLowerCase().includes('casas bahia - 111240002982009-01'.toLowerCase())
                            );

                            const totalAmount = [
                                ...bagaggioTransactions,
                                ...unibhTransactions,
                                ...gympassTransactions,
                                ...iphoneTransactions
                            ].reduce((total, transaction) => total + (transaction.Amount || 0), 0);

                            return `Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}`;
                        })()}
                    </p>
                    {/* Bagaggio's total */}
                    <div className="flex justify-between text-sm mb-2">
                        <span>Bagaggio:</span>
                        <span>
                            {(() => {
                                const bagaggioTransactions = amandaTransactions.filter(transaction =>
                                    transaction.Description?.toLowerCase().includes('bagaggio'.toLowerCase())
                                );
                                console.log('Bagaggio Transactions:', bagaggioTransactions); // Debug log
                                return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    bagaggioTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0)
                                )}`;
                            })()}
                        </span>
                    </div>
                    {/* Unibh's total */}
                    <div className="flex justify-between text-sm mb-2">
                        <span>Unibh:</span>
                        <span>
                            {(() => {
                                const unibhTransactions = amandaTransactions.filter(transaction =>
                                    transaction.Description?.toLowerCase().includes('unibh'.toLowerCase())
                                );
                                console.log('Unibh Transactions:', unibhTransactions); // Debug log
                                return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    unibhTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0)
                                )}`;
                            })()}
                        </span>
                    </div>
                    {/* Gynpass's total */}
                    <div className="flex justify-between text-sm mb-2">
                        <span>Gympass:</span>
                        <span>
                            {(() => {
                                const gympassTransactions = amandaTransactions.filter(transaction =>
                                    transaction.Description?.toLowerCase().includes('gympass'.toLowerCase())
                                );
                                console.log('Gympass Transactions:', gympassTransactions); // Debug log
                                return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    gympassTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0)
                                )}`;
                            })()}
                        </span>
                    </div>
                    {/* Iphone's total */}
                    <div className="flex justify-between text-sm">
                        <span>iPhone and Casas Bahia:</span>
                        <span>
                            {(() => {
                                const iphoneTransactions = amandaTransactions.filter(transaction =>
                                    transaction.Description?.toLowerCase().includes('iphone'.toLowerCase()) ||
                                    transaction.Description?.toLowerCase().includes('casas bahia - 111240002982009-01'.toLowerCase())
                                );
                                console.log('iPhone and Casas Bahia Transactions:', iphoneTransactions); // Debug log
                                return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    iphoneTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0)
                                )}`;
                            })()}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Expenses in Sweden card */}
            <Card className='border border-gray-300 shadow-none'>
                <CardHeader>
                    <CardTitle>Sweden Dec 24 - Jan 25</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xl font-bold mb-4">
                        {(() => {
                            const amandaFiltered = amandaTransactions.filter(transaction => 
                                transaction.Date && 
                                new Date(transaction.Date) <= new Date('2025-01-31') &&
                                !transaction.Description?.toLowerCase().includes('bagaggio') &&
                                !transaction.Description?.toLowerCase().includes('unibh') &&
                                !transaction.Description?.toLowerCase().includes('gympass') &&
                                !transaction.Description?.toLowerCase().includes('iphone') &&
                                !transaction.Description?.toLowerCase().includes('casas bahia - 111240002982009-01')
                            );
                            const amandaTotal = amandaFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0);

                            const usFiltered = usTransactions.filter(transaction => 
                                transaction.Date && 
                                new Date(transaction.Date) <= new Date('2025-01-31')
                            );
                            const usTotal = usFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2;

                            const usAmandaFiltered = usTransactionsAmanda.filter(transaction => 
                                transaction.Date && 
                                new Date(transaction.Date) <= new Date('2025-01-31')
                            );
                            const usAmandaTotal = usAmandaFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2;

                            const finalTotal = amandaTotal + usTotal - usAmandaTotal;

                            return `Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalTotal)}`;
                        })()}
                    </p>
                    
                    {/* Amanda's transactions */}
                    <div className="flex justify-between text-sm mb-2">
                        <span>Amanda&apos;s expenses:</span>
                        <span>
                            {(() => {
                                const amandaFiltered = amandaTransactions.filter(transaction => 
                                    transaction.Date && 
                                    new Date(transaction.Date) <= new Date('2025-01-31') &&
                                    !transaction.Description?.toLowerCase().includes('bagaggio') &&
                                    !transaction.Description?.toLowerCase().includes('unibh') &&
                                    !transaction.Description?.toLowerCase().includes('gympass') &&
                                    !transaction.Description?.toLowerCase().includes('iphone') &&
                                    !transaction.Description?.toLowerCase().includes('casas bahia - 111240002982009-01')
                                );
                                return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    amandaFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0)
                                )}`;
                            })()}
                        </span>
                    </div>
                    
                    {/* Carlos' shared expenses */}
                    <div className="flex justify-between text-sm mb-2">
                        <span>Carlos&apos; shared (÷2):</span>
                        <span>
                            {(() => {
                                const usFiltered = usTransactions.filter(transaction => 
                                    transaction.Date && 
                                    new Date(transaction.Date) <= new Date('2025-01-31')
                                );
                                return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    usFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2
                                )}`;
                            })()}
                        </span>
                    </div>
                    
                    {/* Amanda's shared expenses */}
                    <div className="flex justify-between text-sm">
                        <span>Amanda&apos;s shared (÷2):</span>
                        <span>
                            {(() => {
                                const usAmandaFiltered = usTransactionsAmanda.filter(transaction => 
                                    transaction.Date && 
                                    new Date(transaction.Date) <= new Date('2025-01-31')
                                );
                                return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    usAmandaFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2
                                )}`;
                            })()}
                        </span>
                    </div>
                    
                    {/* Optional: Display all merchants with scrolling */}
                    <Accordion type="single" collapsible className="mt-2">
                        <AccordionItem value="details">
                            <AccordionTrigger className="text-xs">View All Merchants</AccordionTrigger>
                            <AccordionContent>
                                <div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar monospace-font">
                                    {(() => {
                                        const amandaFiltered = amandaTransactions.filter(transaction => 
                                            transaction.Date && 
                                            new Date(transaction.Date) <= new Date('2025-01-31') &&
                                            !transaction.Description?.toLowerCase().includes('bagaggio') &&
                                            !transaction.Description?.toLowerCase().includes('unibh') &&
                                            !transaction.Description?.toLowerCase().includes('gympass') &&
                                            !transaction.Description?.toLowerCase().includes('iphone') &&
                                            !transaction.Description?.toLowerCase().includes('casas bahia - 111240002982009-01')
                                        );
                                        
                                        // Group by description and sum amounts
                                        const merchants = amandaFiltered.reduce((acc, transaction) => {
                                            const key = transaction.Description || 'Unknown';
                                            if (!acc[key]) {
                                                acc[key] = 0;
                                            }
                                            acc[key] += transaction.Amount || 0;
                                            return acc;
                                        }, {} as Record<string, number>);
                                        
                                        // Convert to array and sort by amount (but don't slice to 5)
                                        return Object.entries(merchants)
                                            .sort(([, amountA], [, amountB]) => Math.abs(amountB) - Math.abs(amountA))
                                            .map(([name, amount]) => (
                                                <div key={name} className="flex justify-between text-xs mb-1 py-1 border-b border-gray-100 last:border-0">
                                                    <span className="truncate mr-2">{name}</span>
                                                    <span className={amount < 0 ? 'text-red-600' : 'text-green-600'}>
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                                                    </span>
                                                </div>
                                            ));
                                    })()}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {/* Expenses in Brasil card */}
            <Card className='border border-gray-300 shadow-none'>
                <CardHeader>
                    <CardTitle>Brasil Fev - Mar 25</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xl font-bold mb-4">
                        {(() => {
                            const amandaFiltered = amandaTransactions.filter(transaction => 
                                transaction.Date && 
                                new Date(transaction.Date) >= new Date('2025-02-01') && 
                                new Date(transaction.Date) <= new Date('2025-03-31') &&
                                !transaction.Description?.toLowerCase().includes('bagaggio') &&
                                !transaction.Description?.toLowerCase().includes('unibh') &&
                                !transaction.Description?.toLowerCase().includes('gympass') &&
                                !transaction.Description?.toLowerCase().includes('iphone') &&
                                !transaction.Description?.toLowerCase().includes('casas bahia - 111240002982009-01')
                            );
                            const amandaTotal = amandaFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0);

                            const usFiltered = usTransactions.filter(transaction => 
                                transaction.Date && 
                                new Date(transaction.Date) >= new Date('2025-02-01') && 
                                new Date(transaction.Date) <= new Date('2025-03-31') &&
                                !transaction.Description?.toLowerCase().includes('bagaggio') &&
                                !transaction.Description?.toLowerCase().includes('unibh') &&
                                !transaction.Description?.toLowerCase().includes('gympass') &&
                                !transaction.Description?.toLowerCase().includes('iphone') &&
                                !transaction.Description?.toLowerCase().includes('casas bahia - 111240002982009-01')
                            );
                            const usTotal = usFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2;

                            const usAmandaFiltered = usTransactionsAmanda.filter(transaction => 
                                transaction.Date && 
                                new Date(transaction.Date) >= new Date('2025-02-01') && 
                                new Date(transaction.Date) <= new Date('2025-03-31') &&
                                !transaction.Description?.toLowerCase().includes('bagaggio') &&
                                !transaction.Description?.toLowerCase().includes('unibh') &&
                                !transaction.Description?.toLowerCase().includes('gympass') &&
                                !transaction.Description?.toLowerCase().includes('iphone') &&
                                !transaction.Description?.toLowerCase().includes('casas bahia - 111240002982009-01')
                            );
                            const usAmandaTotal = usAmandaFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2;

                            const finalTotal = amandaTotal + usTotal - usAmandaTotal;

                            return `Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalTotal)}`;
                        })()}
                    </p>
                    
                    {/* Amanda's transactions */}
                    <div className="flex justify-between text-sm mb-2">
                        <span>Amanda&apos;s expenses:</span>
                        <span>
                            {(() => {
                                const amandaFiltered = amandaTransactions.filter(transaction => 
                                    transaction.Date && 
                                    new Date(transaction.Date) >= new Date('2025-02-01') && 
                                    new Date(transaction.Date) <= new Date('2025-03-31') &&
                                    !transaction.Description?.toLowerCase().includes('bagaggio') &&
                                    !transaction.Description?.toLowerCase().includes('unibh') &&
                                    !transaction.Description?.toLowerCase().includes('gympass') &&
                                    !transaction.Description?.toLowerCase().includes('iphone') &&
                                    !transaction.Description?.toLowerCase().includes('casas bahia - 111240002982009-01')
                                );
                                return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    amandaFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0)
                                )}`;
                            })()}
                        </span>
                    </div>
                    
                    {/* Carlos' shared expenses */}
                    <div className="flex justify-between text-sm mb-2">
                        <span>Carlos&apos; shared (÷2):</span>
                        <span>
                            {(() => {
                                const usFiltered = usTransactions.filter(transaction => 
                                    transaction.Date && 
                                    new Date(transaction.Date) >= new Date('2025-02-01') && 
                                    new Date(transaction.Date) <= new Date('2025-03-31') &&
                                    !transaction.Description?.toLowerCase().includes('bagaggio') &&
                                    !transaction.Description?.toLowerCase().includes('unibh') &&
                                    !transaction.Description?.toLowerCase().includes('gympass') &&
                                    !transaction.Description?.toLowerCase().includes('iphone') &&
                                    !transaction.Description?.toLowerCase().includes('casas bahia - 111240002982009-01')
                                );
                                return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    usFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2
                                )}`;
                            })()}
                        </span>
                    </div>
                    
                    {/* Amanda's shared expenses */}
                    <div className="flex justify-between text-sm">
                        <span>Amanda&apos;s shared (÷2):</span>
                        <span>
                            {(() => {
                                const usAmandaFiltered = usTransactionsAmanda.filter(transaction => 
                                    transaction.Date && 
                                    new Date(transaction.Date) >= new Date('2025-02-01') && 
                                    new Date(transaction.Date) <= new Date('2025-03-31') &&
                                    !transaction.Description?.toLowerCase().includes('bagaggio') &&
                                    !transaction.Description?.toLowerCase().includes('unibh') &&
                                    !transaction.Description?.toLowerCase().includes('gympass') &&
                                    !transaction.Description?.toLowerCase().includes('iphone') &&
                                    !transaction.Description?.toLowerCase().includes('casas bahia - 111240002982009-01')
                                );
                                return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    usAmandaFiltered.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2
                                )}`;
                            })()}
                        </span>
                    </div>
                    
                    {/* Common Brazil merchants with scrolling */}
                    <Accordion type="single" collapsible className="mt-2">
                        <AccordionItem value="details">
                            <AccordionTrigger className="text-xs">View All Brazil Merchants</AccordionTrigger>
                            <AccordionContent>
                                <div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar monospace-font">
                                    {(() => {
                                        const allTransactions = [
                                            ...usTransactions.filter(transaction => 
                                                transaction.Date && 
                                                new Date(transaction.Date) >= new Date('2025-02-01') && 
                                                new Date(transaction.Date) <= new Date('2025-03-31')
                                            ),
                                            ...usTransactionsAmanda.filter(transaction => 
                                                transaction.Date && 
                                                new Date(transaction.Date) >= new Date('2025-02-01') && 
                                                new Date(transaction.Date) <= new Date('2025-03-31')
                                            )
                                        ];
                                        
                                        // Group by description and sum amounts
                                        const merchants = allTransactions.reduce((acc, transaction) => {
                                            const key = transaction.Description || 'Unknown';
                                            if (!acc[key]) {
                                                acc[key] = 0;
                                            }
                                            acc[key] += transaction.Amount || 0;
                                            return acc;
                                        }, {} as Record<string, number>);
                                        
                                        // Convert to array and sort by amount (don't slice to show all)
                                        return Object.entries(merchants)
                                            .sort(([, amountA], [, amountB]) => Math.abs(amountB) - Math.abs(amountA))
                                            .map(([name, amount]) => (
                                                <div key={name} className="flex justify-between text-xs mb-1 py-1 border-b border-gray-100 last:border-0">
                                                    <span className="truncate mr-2">{name}</span>
                                                    <span className={amount < 0 ? 'text-red-600' : 'text-green-600'}>
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                                                    </span>
                                                </div>
                                            ));
                                    })()}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

        </div>

        {/* Separator between sections */}
        <Separator className="my-12" />

        {/* Switches to toggle columns */}
        <div className="flex items-center mb-4 space-x-4">
            <div className="flex items-center">
                <Switch
                    checked={showComments}
                    onCheckedChange={setShowComments}
                    className="mr-2"
                />
                <span className="text-sm">Show Comments</span>
            </div>
            <div className="flex items-center">
                <Switch
                    checked={showDate}
                    onCheckedChange={setShowDate}
                    className="mr-2"
                />
                <span className="text-sm">Show Date</span>
            </div>
            <div className="flex items-center">
                <Switch
                    checked={showId}
                    onCheckedChange={setShowId}
                    className="mr-2"
                />
                <span className="text-sm">Show Id</span>
            </div>
        </div>

        {/* Transactions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Carlos' Transactions */}
            <TableCardFamily
                title="Carlos' Transactions"
                sections={[
                    {
                    name: 'Amanda',
                    transactions: amandaTransactions,
                    sortConfig: amandaSortConfig,
                    setSortConfig: setAmandaSortConfig,
                        },
                    {
                    name: 'US',
                    transactions: usTransactions,
                    sortConfig: usSortConfig,
                    setSortConfig: setUsSortConfig,
                    },
                    {
                    name: 'Carlos',
                    transactions: meTransactions,
                    sortConfig: meSortConfig,
                    setSortConfig: setMeSortConfig,
                },
                ]}
                showComments={showComments}
                showDate={showDate}
                showId={showId}
                handleSort={handleSort}
                sortTransactions={sortTransactions}
            />      

            {/* Amanda's Transactions */}
            <TableCardFamily
                title="Amanda's Transactions"
                sections={[
                    {
                    name: 'Amanda',
                    transactions: [], // No data for this section
                    sortConfig: null,
                    setSortConfig: () => {}, // No sorting needed for an empty section
                    },
                    {
                    name: 'US',
                    transactions: usTransactionsAmanda,
                    sortConfig: usAmandaSortConfig,
                    setSortConfig: setUsAmandaSortConfig,
                    },
                    {
                    name: 'Carlos',
                    transactions: [], // No data for this section
                    sortConfig: null,
                    setSortConfig: () => {}, // No sorting needed for an empty section
                    },
                ]}
                showComments={showComments}
                handleSort={handleSort}
                showDate={showDate}
                showId={showId}
                sortTransactions={sortTransactions}
            /> 
        </div>
    </div>
    </ProtectedRoute>
  );
}