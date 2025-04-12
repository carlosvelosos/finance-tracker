'use client';

// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer} from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

type CustomBarChartProps = {
  data: { category: string; total: number }[];
  height?: number; // Optional height for the chart
  barColor?: string; // Optional color for the bars
  title?: string; // Optional title for the chart
  description?: string; // Optional description for the chart
};

export function CustomBarChart({
  data,
  // height = 200, // Default height
  barColor = '#8884d8',
  title = 'Bar Chart',
  description = 'Category-wise totals',
}: CustomBarChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center mt-10">No data available to display the chart.</div>;
  }

  // Dynamically calculate chart height based on the number of categories
  // const dynamicHeight = Math.max(data.length * 30, height); // 30px per bar, minimum height is the default

  // Format numbers as Swedish currency (SEK)
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
    }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {/* <CardContent className='h-[400px]'> */}
      <CardContent className="flex flex-col items-center justify-center">
        <ChartContainer config={{ layout: { label: 'Vertical Layout', color: barColor } }} className='h-[300px]'>
          {/* <ResponsiveContainer width="100%" height={dynamicHeight}> */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                left: -20,
              }}
              // className='h-[400px]'
              // barCategoryGap={15} // Set gap between bars to 5px
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={150} // Increased width for category names
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="total" fill={barColor} radius={10} barSize={20} /> {/* Explicit bar size */}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="flex-col items-center justify-center mt-2 w-full">
          <Accordion type="single" collapsible>
            {data.map((item) => (
              <AccordionItem key={item.category} value={item.category}>
                <AccordionTrigger>
                  {/* {item.category} - Total: {item.total} */}
                  {item.category} - {formatCurrency(item.total)}
                </AccordionTrigger>
                <AccordionContent>
                  <p>Total: {formatCurrency(item.total)}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
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