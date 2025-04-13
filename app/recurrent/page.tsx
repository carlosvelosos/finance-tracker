'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Bill = {
  id: number;
  description: string;
  dueDay: string;
  paymentMethod: string;
  country: string; // Field for country
  value: number; // Field for value
};

// Mapping of countries to their respective currencies
const countryCurrencyMap: Record<string, string> = {
  Sweden: 'SEK',
  Brazil: 'BRL',
};

export default function BillsPage() {
//   const [bills, setBills] = useState<Bill[]>([
  const [bills] = useState<Bill[]>([
    { id: 1, description: 'Home Rent - lundbergs fastigheter', dueDay: '2025-04-30', paymentMethod: 'Betalo - Amex', country: 'Sweden', value: 12000 },
    { id: 2, description: 'Home Internet - Telia', dueDay: '2025-04-30', paymentMethod: '???', country: 'Sweden', value: 500 },
    { id: 3, description: 'Home Electricity - Tekniska verken', dueDay: '2025-04-30', paymentMethod: 'Kivra?', country: 'Sweden', value: 800 },
    { id: 4, description: 'Home Electricity - Bixia', dueDay: '2025-04-30', paymentMethod: '???', country: 'Sweden', value: 900 },
    { id: 5, description: 'Credit card - Amex', dueDay: '2025-04-27', paymentMethod: 'Handelsbanken', country: 'Sweden', value: 15000 },
    { id: 6, description: 'Credit card - SJ Prio', dueDay: '2025-04-30', paymentMethod: 'Handelsbanken', country: 'Sweden', value: 10000 },
    { id: 7, description: 'Union - Unionen a-kassa', dueDay: '2025-04-30', paymentMethod: 'Kivra', country: 'Sweden', value: 300 },
    { id: 8, description: 'Union - Sveriges Ingenjörer', dueDay: '2025-04-30', paymentMethod: 'Kivra?', country: 'Sweden', value: 400 },
    { id: 9, description: 'Riachuelo', dueDay: '2025-04-25', paymentMethod: 'Direct Debit', country: 'Brazil', value: 200 },
    { id: 10, description: 'Credit card - Inter', dueDay: '2025-04-15', paymentMethod: 'Inter débito automático', country: 'Brazil', value: 4765.66 },
    { id: 11, description: 'Credit card - Rico', dueDay: '2025-04-15', paymentMethod: 'Inter', country: 'Brazil', value: 689.70 },
  ]);

  // Calculate total per country
  const totalsPerCountry = bills.reduce((acc, bill) => {
    acc[bill.country] = (acc[bill.country] || 0) + bill.value;
    return acc;
  }, {} as Record<string, number>);

  const [sortConfig, setSortConfig] = useState<{ key: keyof Bill; direction: 'asc' | 'desc' } | null>(null);

  const sortedBills = [...bills].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const order = direction === 'asc' ? 1 : -1;

    if (a[key] < b[key]) return -1 * order;
    if (a[key] > b[key]) return 1 * order;
    return 0;
  });

  const handleSort = (key: keyof Bill) => {
    setSortConfig((prev) => {
      if (prev?.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Bills to Be Paid</h1>

      {/* Display totals per country */}
      <div className="mb-4 flex gap-4 bg-gray-50 p-4 rounded-md">
        {Object.entries(totalsPerCountry).map(([country, total]) => (
            <div key={country} className="text-lg font-medium">
                <span className="font-bold">{country}:</span>{' '}
                {total.toLocaleString('en-US', {
                    style: 'currency',
                    currency: countryCurrencyMap[country] || 'USD', // Default to USD if country is not mapped
                })}
            </div>
        ))}
    </div>

    <Table>
        <TableHeader>
          <TableRow className="border-b-4 border-gray-600">
            <TableHead className="font-bold cursor-pointer" onClick={() => handleSort('description')}>
              Description
            </TableHead>
            <TableHead className="font-bold cursor-pointer" onClick={() => handleSort('dueDay')}>
              Due Day
            </TableHead>
            <TableHead className="font-bold cursor-pointer" onClick={() => handleSort('paymentMethod')}>
              Payment Method
            </TableHead>
            <TableHead className="font-bold cursor-pointer" onClick={() => handleSort('country')}>
              Country
            </TableHead>
            <TableHead className="font-bold cursor-pointer" onClick={() => handleSort('value')}>
              Value
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBills.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell>{bill.description}</TableCell>
              <TableCell>{new Date(bill.dueDay).toLocaleDateString()}</TableCell>
              <TableCell>{bill.paymentMethod}</TableCell>
              <TableCell
                style={{
                  color: bill.country === 'Brazil' ? 'green' : bill.country === 'Sweden' ? 'blue' : 'black',
                  fontWeight: 'bold',
                }}
              >
                {bill.country}
              </TableCell>
              <TableCell>
                {bill.value.toLocaleString('en-US', {
                  style: 'currency',
                  currency: countryCurrencyMap[bill.country] || 'USD',
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}