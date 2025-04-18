'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import TableCardFamily from "@/components/ui/table-card-family";

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

            const { data, error } = await supabase
                .from('Brasil_transactions_agregated_2025')
                .select('*');
    
            if (error) {
                console.error('Error fetching transactions:', error);
            } else {
                console.log('Fetched transactions:', data); // Log the fetched data

                const adjustedTransactions = adjustTransactionAmounts(data as Transaction[]);
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
                        The table &ldquo;US&ldquo; displays the shared expenses in Brasil, using Carlos&apos; credit card.
                    </p>
                    <p className={`${amandaTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Amanda: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        amandaTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0)
                        )}
                    </p>
                    <p className={`${usTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Us: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        usTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0)
                        )}
                    </p>
                    <p className={`${(amandaTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0) + (usTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2)) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Amanda + (Us / 2): {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        amandaTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0) + 
                        (usTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2)
                        )}
                    </p>
                {/* <p className={`${meTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Me: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    meTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0)
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
                    <p className={`text-xl ${usTransactionsAmanda.reduce((total, transaction) => total + (transaction.Amount || 0), 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            usTransactionsAmanda.reduce((total, transaction) => total + (transaction.Amount ?? 0), 0)
                        )}
                    </p>
                </CardContent>
            </Card>

        </div>

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
  );
}