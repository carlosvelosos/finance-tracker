import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Transaction } from '@/types/transaction';

interface FinanceDetailCardProps {
  title: string;
  cardType: 'personal' | 'sweden' | 'brasil' | 'pix';
  amandaTransactions: Transaction[];
  usTransactions: Transaction[];
  usTransactionsAmanda: Transaction[];
}

export function FinanceDetailCard({ 
  title,
  cardType,
  amandaTransactions, 
  usTransactions, 
  usTransactionsAmanda 
}: FinanceDetailCardProps) {
  // Render different card content based on cardType
  const renderCardContent = () => {
    switch (cardType) {
      case 'personal':
        return (
          <>
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
                  return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    iphoneTransactions.reduce((total, transaction) => total + (transaction.Amount || 0), 0)
                  )}`;
                })()}
              </span>
            </div>
          </>
        );
      
      case 'sweden':
        return (
          <>
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
                      
                      // Update the merchant list item in each accordion
                      return Object.entries(merchants)
                      .sort(([, amountA], [, amountB]) => Math.abs(amountB) - Math.abs(amountA))
                      .map(([name, amount]) => (
                        <div key={name} className="flex justify-between text-xs mb-1 py-1 border-b border-gray-100 last:border-0">
                          <span className="truncate w-1/2 pr-2">{name}</span>
                          <span className={`w-1/2 text-right ${amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        );
      
      case 'brasil':
        return (
          <>
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
                      
                      // Update the merchant list item in each accordion
                      return Object.entries(merchants)
                      .sort(([, amountA], [, amountB]) => Math.abs(amountB) - Math.abs(amountA))
                      .map(([name, amount]) => (
                        <div key={name} className="flex justify-between text-xs mb-1 py-1 border-b border-gray-100 last:border-0">
                          <span className="truncate w-1/2 pr-2">{name}</span>
                          <span className={`w-1/2 text-right ${amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        );
      
      case 'pix':
        return (
          <>
            <p className="text-xl font-bold mb-4">
              {(() => {
                // Filter transactions containing "pix" or "PIX" in the description
                const pixTransactions = amandaTransactions.filter(transaction => 
                  transaction.Description?.toLowerCase().includes('pix') && 
                  transaction.Amount && 
                  transaction.Amount < 0 // Only outgoing PIX
                );
                
                const totalAmount = pixTransactions.reduce(
                  (total, transaction) => total + (transaction.Amount || 0), 
                  0
                );
      
                return `Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}`;
              })()}
            </p>
            
            {/* Top PIX Recipients */}
            <div className="flex flex-col space-y-2 mb-4">
              <h3 className="text-sm font-medium">Top PIX Recipients</h3>
              {(() => {
                // Get all PIX transactions
                const pixTransactions = amandaTransactions.filter(transaction => 
                  transaction.Description?.toLowerCase().includes('pix') && 
                  transaction.Amount && 
                  transaction.Amount < 0
                );
                
                // Group by recipient (we'll assume recipient is part of description)
                const recipients: Record<string, number> = {};
                
                pixTransactions.forEach(transaction => {
                  let recipient = transaction.Description || 'Unknown';
                  // Try to extract recipient name from PIX description
                  const pixMatch = recipient.match(/PIX\s+(?:para|to|sent)\s+([\w\s]+)/i);
                  if (pixMatch && pixMatch[1]) {
                    recipient = pixMatch[1].trim();
                  }
                  
                  if (!recipients[recipient]) {
                    recipients[recipient] = 0;
                  }
                  recipients[recipient] += transaction.Amount || 0;
                });
                
                // Sort and display top 5 recipients
                return Object.entries(recipients)
                  .sort(([, amountA], [, amountB]) => Math.abs(amountB) - Math.abs(amountA))
                  .slice(0, 5)
                  .map(([name, amount], index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="truncate pr-2">{name}</span>
                      <span className="text-red-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                      </span>
                    </div>
                  ));
              })()}
            </div>
            
            {/* Monthly PIX Activity */}
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-medium">Monthly PIX Activity</h3>
              {(() => {
                // Get all PIX transactions
                const pixTransactions = amandaTransactions.filter(transaction => 
                  transaction.Description?.toLowerCase().includes('pix') && 
                  transaction.Date && 
                  transaction.Amount && 
                  transaction.Amount < 0
                );
                
                // Group by month
                const monthlyTotals: Record<string, number> = {};
                
                pixTransactions.forEach(transaction => {
                  if (!transaction.Date) return;
                  
                  const date = new Date(transaction.Date);
                  const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                  
                  if (!monthlyTotals[monthYear]) {
                    monthlyTotals[monthYear] = 0;
                  }
                  monthlyTotals[monthYear] += transaction.Amount || 0;
                });
                
                // Sort by date and display
                return Object.entries(monthlyTotals)
                  .sort((a, b) => {
                    const [monthA, yearA] = a[0].split('/').map(Number);
                    const [monthB, yearB] = b[0].split('/').map(Number);
                    
                    if (yearA !== yearB) return yearB - yearA;
                    return monthB - monthA;
                  })
                  .slice(0, 4) // Show last 4 months
                  .map(([monthYear, amount], index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{monthYear}</span>
                      <span className="text-red-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                      </span>
                    </div>
                  ));
              })()}
            </div>
            
            {/* View All PIX Transactions */}
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="pixDetails">
                <AccordionTrigger className="text-xs">View All PIX Transactions</AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar monospace-font">
                    {(() => {
                      // Update this to include all PIX transactions, both incoming and outgoing
                      const pixTransactions = amandaTransactions.filter(transaction => 
                        transaction.Description?.toLowerCase().includes('pix') || 
                        transaction.Description?.toLowerCase().includes('recebido')
                      );
                      
                      return pixTransactions
                        .sort((a, b) => {
                          if (!a.Date || !b.Date) return 0;
                          return new Date(b.Date).getTime() - new Date(a.Date).getTime();
                        })
                        .map((transaction, index) => (
                          <div key={index} className="flex justify-between text-xs mb-1 py-1 border-b border-gray-100 last:border-0">
                            <div className="flex flex-col w-3/5">
                              <span className="truncate font-mono">{transaction.Description}</span>
                              <span className="text-gray-500 text-[10px]">
                                {transaction.Date && new Date(transaction.Date).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit', 
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <span className={`w-2/5 text-right ${transaction.Amount && transaction.Amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.Amount || 0)}
                            </span>
                          </div>
                        ));
                    })()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className='border border-gray-300 shadow-none h-full mx-1'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderCardContent()}
      </CardContent>
    </Card>
  );
}