import React from 'react';
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

type SortConfig = {
  key: keyof Transaction;
  direction: 'asc' | 'desc';
};

type TransactionCardProps = {
    title: string;
    sections: {
      name: string;
      transactions: Transaction[];
      sortConfig: SortConfig | null;
      setSortConfig: React.Dispatch<React.SetStateAction<SortConfig | null>>;
    }[];
    showComments: boolean;
    showDate: boolean; // New prop for toggling Date column
    showId: boolean; // New prop for toggling Id column
    handleSort: (key: keyof Transaction, setSortConfig: React.Dispatch<React.SetStateAction<SortConfig | null>>) => void;
    sortTransactions: (transactions: Transaction[], sortConfig: SortConfig | null) => Transaction[];
  };

const TableCardFamily: React.FC<TransactionCardProps> = ({
    title,
    sections,
    showComments,
    showDate, // New prop for toggling Date column
    showId, // New prop for toggling Id column
    handleSort,
    sortTransactions,
  }) => {
    // Function to calculate summary values for a section
    const calculateSectionSummary = (transactions: Transaction[]) => {
      let positiveSum = 0;
      let negativeSum = 0;
      
      transactions.forEach(transaction => {
        const amount = transaction.Amount || 0;
        if (amount > 0) {
          positiveSum += amount;
        } else if (amount < 0) {
          negativeSum += amount;
        }
      });
      
      const netTotal = positiveSum + negativeSum;
      
      return {
        positiveSum,
        negativeSum,
        netTotal
      };
    };
    
    // Currency formatter
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2
      }).format(Math.abs(amount));
    };

    return (
      <Card className='border-none shadow-none'>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {sections.map((section) => {
              const { positiveSum, negativeSum, netTotal } = calculateSectionSummary(section.transactions);
              
              return (
                <AccordionItem key={section.name} value={section.name}>
                  <AccordionTrigger className="flex justify-between">
                    <div className="flex w-full items-center justify-between">
                      <span>{section.name}</span>
                      <div className="flex space-x-4">
                        <span className="text-green-600">+{formatCurrency(positiveSum)}</span>
                        <span className="text-red-600">-{formatCurrency(Math.abs(negativeSum))}</span>
                        <span className={`font-bold ${netTotal < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {netTotal < 0 ? '-' : '+'}{formatCurrency(Math.abs(netTotal))}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {section.transactions.length > 0 ? (
                      <Table style={{ fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace' }}>
                        <TableHeader>
                          <TableRow className="border-b-4 border-gray-600">
                            {showId && (
                              <TableHead
                                className="font-bold cursor-pointer w-16"
                                onClick={() => handleSort('id', section.setSortConfig)}
                              >
                                Id {section.sortConfig?.key === 'id' && (section.sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </TableHead>
                            )}
                            {showDate && (
                              <TableHead
                                className="font-bold cursor-pointer w-32"
                                onClick={() => handleSort('Date', section.setSortConfig)}
                              >
                                Date {section.sortConfig?.key === 'Date' && (section.sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </TableHead>
                            )}
                            <TableHead
                              className="font-bold cursor-pointer w-48"
                              onClick={() => handleSort('Description', section.setSortConfig)}
                            >
                              Description {section.sortConfig?.key === 'Description' && (section.sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            {showComments && (
                              <TableHead
                                className="font-bold cursor-pointer w-48"
                                onClick={() => handleSort('Comment', section.setSortConfig)}
                              >
                                Comment {section.sortConfig?.key === 'Comment' && (section.sortConfig.direction === 'asc' ? '↑' : '↓')}
                              </TableHead>
                            )}
                            <TableHead
                              className="font-bold cursor-pointer w-24 text-right"
                              onClick={() => handleSort('Amount', section.setSortConfig)}
                            >
                              Amount {section.sortConfig?.key === 'Amount' && (section.sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortTransactions(section.transactions, section.sortConfig).map((transaction) => (
                            <TableRow
                            key={`${transaction.Date}-${transaction.id}`} // Combine Date and id for a unique key
                            className="text-xs"
                            >
                              {showId && <TableCell className="w-16">{transaction.id}</TableCell>}
                              {showDate && (
                                <TableCell className="w-32">
                                  {transaction.Date ? new Date(transaction.Date).toLocaleDateString() : 'N/A'}
                                </TableCell>
                              )}
                              <TableCell className="w-48">{transaction.Description}</TableCell>
                              {showComments && <TableCell className="w-48">{transaction.Comment || 'N/A'}</TableCell>}
                              <TableCell
                                className={`w-24 text-right ${
                                  transaction.Amount && transaction.Amount < 0 ? 'text-red-600' : 'text-green-600'
                                }`}
                              >
                                {transaction.Amount && transaction.Amount < 0 ? '-' : '+'}
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                  Math.abs(transaction.Amount ?? 0)
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-gray-500">No content yet.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
      );
    };
    
    export default TableCardFamily;