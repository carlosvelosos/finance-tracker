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
  return (
    <Card className='border-none shadow-none'>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl">
          <p>
            Amanda&apos;s balance: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
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
  );
}