'use client';

// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer} from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

// type Transaction = {
//   id: number;
//   created_at: string;
//   Date: string | null;
//   Description: string | null;
//   Amount: number | null;
//   Balance: number | null;
//   Category: string | null;
//   Responsable: string | null;
//   Bank: string | null;
//   Comment: string | null;
//   user_id: string;
//   source_table: string | null;
// };

type Transaction = {
  id: number;
  Category: string | null;
  Amount: number | null;
  Bank: string | null;
  Description: string | null;
};

type CustomBarChartProps = {
  data: Transaction[]; // Expect raw transaction data as input
  height?: number; // Optional height for the chart
  barColor?: string; // Optional color for the bars
  title?: string; // Optional title for the chart
  description?: string; // Optional description for the chart
};

export function CustomBarChart({
  data,
  barColor = '#8884d8',
  title = 'Bar Chart',
  description = 'Category-wise totals',
}: CustomBarChartProps) {
  // State for the minor expenses threshold (default to 1.40%)
  const [minorExpensesThreshold, setMinorExpensesThreshold] = useState(1.40);

  if (!data || data.length === 0) {
    return <div className="text-center mt-10">No data available to display the chart.</div>;
  }

  // Remove unwanted categories before any processing
  const filteredData = data.filter(
    (transaction) => !['Invoice', 'Salary', 'Crédit card'].includes(transaction.Category || '')
  );

  // Preprocess data: Invert the sign of Amount for Handelsbanken
  const processedData = filteredData.map((transaction) => ({
    ...transaction,
    Amount: transaction.Bank === 'Handelsbanken' && transaction.Amount ? -transaction.Amount : transaction.Amount,
  }));

  // Format numbers as Swedish currency (SEK)
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
    }).format(value);

  // Process the raw transaction data
  const totals = processedData.reduce((acc, transaction) => {
    if (transaction.Category && transaction.Amount) {
      acc[transaction.Category] = (acc[transaction.Category] || 0) + transaction.Amount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Log totals by category
  console.log('Totals by Category:', totals);

  // Calculate totals per bank
  const totalsPerBank = processedData.reduce((acc, transaction) => {
    if (transaction.Bank && transaction.Amount) {
      acc[transaction.Bank] = (acc[transaction.Bank] || 0) + transaction.Amount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Log totals per bank
  console.log('Totals by Bank:', totalsPerBank);

  // Calculate totalSum after filtering
  const totalSum = Object.values(totals).reduce((sum, value) => sum + Math.abs(value), 0);

  // Debugging the totalSum variable
  console.log('Filtered Total Sum:', totalSum);

  // Process filtered categories for chart data
  const sortedCategories = Object.entries(totals)
    .map(([category, total]) => ({
      category,
      total: Math.abs(total),
    }))
    .sort((a, b) => a.total - b.total);

  let minorExpensesTotal = 0;
  const filteredCategories = [];

  // Iterate through sorted categories
  for (const category of sortedCategories) {
    // Check if the category's total is less than the threshold percentage of the totalSum
    if (category.total / totalSum <= minorExpensesThreshold / 100) {
      // Add the category's total to minorExpensesTotal
      minorExpensesTotal += category.total;
    } else {
      // Add the category to filteredCategories if it doesn't qualify as a minor expense
      filteredCategories.push(category);
    }
  }

  // Add "Minor expenses" category if there are any minor expenses
  if (minorExpensesTotal > 0) {
    filteredCategories.push({
      category: `Minor expenses (${minorExpensesThreshold}%)`,
      total: minorExpensesTotal,
    });
  }

  // Final chart data
  const chartData = filteredCategories.sort((a, b) => b.total - a.total);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title} - {formatCurrency(totalSum)}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <ChartContainer config={{ layout: { label: 'Vertical Layout', color: barColor } }} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                left: 0,
                right: 50,
              }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={150}
                // tick={{ fontSize: 10 }} // Reduce font size of Y-axis labels
              />
              <ChartTooltip
                cursor={false}
                content={({ payload }) => {
                  if (payload && payload.length > 0) {
                    const value = payload[0].value;
                    return (
                      <div className="p-2 bg-white shadow-md rounded">
                        {formatCurrency(value as number)}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="total"
                fill={barColor}
                radius={10}
                barSize={20}
                label={({ x, y, width, value }) => {
                  const percentage = ((value as number) / totalSum) * 100;
                  return (
                    <text
                      x={x + width + 10}
                      y={y + 14}
                      textAnchor="start"
                      fill="#555"
                      fontSize="12px"
                    >
                      {percentage.toFixed(1)}%
                    </text>
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="w-full px-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minor Expenses Threshold: {minorExpensesThreshold}%
          </label>
          <Slider
            defaultValue={[minorExpensesThreshold]}
            min={0}
            max={5}
            step={0.1}
            value={[minorExpensesThreshold]}
            onValueChange={(value) => setMinorExpensesThreshold(value[0])}
          />
        </div>
        <div className="flex-col items-center justify-center mt-2 w-full">
          <Accordion type="single" collapsible>
            {chartData.map((item, index) => {
              const filteredData = processedData.filter((entry) => entry.Category === item.category);

              const descriptions = filteredData.reduce((acc, entry) => {
                if (entry.Description && entry.Amount) {
                  acc[entry.Description] = (acc[entry.Description] || 0) + entry.Amount;
                }
                return acc;
              }, {} as Record<string, number>);

              return (
                <AccordionItem key={item.category} value={item.category}>
                  <AccordionTrigger>
                    {index + 1}. {item.category} - {formatCurrency(item.total)}
                  </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 text-xs space-y-2">
                        {item.category === `Minor expenses (${minorExpensesThreshold}%)` ? (
                          // Aggregate descriptions for "Minor expenses"
                          Object.entries(
                            sortedCategories
                              .filter((cat) => cat.total / totalSum <= minorExpensesThreshold / 100) // Use dynamic threshold
                              .reduce((acc, cat) => {
                                const filteredData = processedData.filter((entry) => entry.Category === cat.category);
                                filteredData.forEach((entry) => {
                                  if (entry.Description && entry.Amount) {
                                    acc[entry.Description] = (acc[entry.Description] || 0) + entry.Amount;
                                  }
                                });
                                return acc;
                              }, {} as Record<string, number>)
                          ) // Convert aggregated descriptions to entries
                            .sort(([, sumA], [, sumB]) => sumB - sumA) // Sort by sum in descending order
                            .map(([description, sum]) => (
                              <li
                                key={description}
                                className="flex justify-between hover:bg-gray-100 hover:rounded-md px-2 py-1"
                              >
                                <span>{description}</span>
                                <span>{formatCurrency(sum)}</span>
                              </li>
                            ))
                        ) : (
                          // Default behavior for other categories
                          Object.entries(descriptions)
                            .sort(([, sumA], [, sumB]) => sumB - sumA) // Sort by sum in descending order
                            .map(([description, sum]) => (
                              <li
                                key={description}
                                className="flex justify-between hover:bg-gray-100 hover:rounded-md px-2 py-1"
                              >
                                <span>{description}</span>
                                <span>{formatCurrency(sum)}</span>
                              </li>
                            ))
                        )}
                      </ul>
                    </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total amounts per category
        </div>
      </CardFooter>
    </Card>
  );
}