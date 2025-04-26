import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Transaction } from '@/types/transaction'; // Assuming you have a types file

interface FinanceSummaryCardProps {
  amandaTransactions: Transaction[];
  usTransactions: Transaction[];
  usTransactionsAmanda: Transaction[];
}

export function FinanceSummaryCard({ 
  amandaTransactions, 
  usTransactions, 
  usTransactionsAmanda 
}: FinanceSummaryCardProps) {
  // Calculate the balance once to avoid repetition
  const amandaBalance = amandaTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0) + 
    (usTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2) - 
    (usTransactionsAmanda.reduce((total, transaction) => total + (transaction.Amount || 0), 0) / 2);
  
  // Format the balance
  const formattedBalance = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    signDisplay: 'always' 
  }).format(amandaBalance);
  
  return (
    <Card className='border border-gray-300 shadow-none'>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stack vertically on all screens for simplicity */}
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Amanda&apos;s balance:</span>
            <span 
              className={`font-semibold text-lg break-words ${
                amandaBalance >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formattedBalance}
            </span>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="summary">
              <AccordionTrigger>Summary Description</AccordionTrigger>
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
  );
}