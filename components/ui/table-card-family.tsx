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
  handleSort: (key: keyof Transaction, setSortConfig: React.Dispatch<React.SetStateAction<SortConfig | null>>) => void;
  sortTransactions: (transactions: Transaction[], sortConfig: SortConfig | null) => Transaction[];
};

const TableCardFamily: React.FC<TransactionCardProps> = ({
  title,
  sections,
  showComments,
  handleSort,
  sortTransactions,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {sections.map((section) => (
            <AccordionItem key={section.name} value={section.name}>
              <AccordionTrigger>{section.name}</AccordionTrigger>
              <AccordionContent>
                <Table style={{ fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace' }}>
                  <TableHeader>
                    <TableRow className="border-b-4 border-gray-600">
                      <TableHead className="font-bold cursor-pointer w-16" onClick={() => handleSort('Id', section.setSortConfig)}>
                        Id {section.sortConfig?.key === 'Id' && (section.sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-bold cursor-pointer w-32" onClick={() => handleSort('Datum', section.setSortConfig)}>
                        Date {section.sortConfig?.key === 'Datum' && (section.sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('Beskrivning', section.setSortConfig)}>
                        Description {section.sortConfig?.key === 'Beskrivning' && (section.sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      {showComments && (
                        <TableHead className="font-bold cursor-pointer w-48" onClick={() => handleSort('Comment', section.setSortConfig)}>
                          Comment {section.sortConfig?.key === 'Comment' && (section.sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                      )}
                      <TableHead className="font-bold cursor-pointer w-24 text-right" onClick={() => handleSort('Belopp', section.setSortConfig)}>
                        Amount {section.sortConfig?.key === 'Belopp' && (section.sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortTransactions(section.transactions, section.sortConfig).map((transaction) => (
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
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TableCardFamily;