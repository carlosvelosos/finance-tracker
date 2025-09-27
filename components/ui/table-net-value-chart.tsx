"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TableNetValueData {
  tableName: string;
  displayName: string;
  netValue: number;
  transactionCount: number;
}

interface TableNetValueChartProps {
  data: TableNetValueData[];
  loading?: boolean;
  className?: string;
  height?: string;
  width?: string;
  responsive?: boolean;
}

// Transform data for recharts format
const transformChartData = (data: TableNetValueData[]) => {
  return data.map((item) => ({
    table: item.displayName || item.tableName,
    netValue: item.netValue,
    transactionCount: item.transactionCount,
    // Add formatted values for tooltips
    formattedValue: formatCurrency(item.netValue),
  }));
};

// Format currency values
const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

const chartConfig = {
  netValue: {
    label: "Net Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

/**
 * Bar Chart Component for Table Net Values
 *
 * Displays a bar chart showing the net value (sum of all transactions)
 * for each selected table using shadcn UI chart components.
 */
export default function TableNetValueChart({
  data,
  loading = false,
  className = "",
  height = "400px",
  width = "full",
  responsive = true,
}: TableNetValueChartProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Net Value by Table</CardTitle>
          <CardDescription>Loading table data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Net Value by Table</CardTitle>
          <CardDescription>No table data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">Select tables to view chart</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data and calculate statistics
  const chartData = transformChartData(data);
  const totalNetValue = data.reduce((sum, item) => sum + item.netValue, 0);
  const totalPositive = data.reduce(
    (sum, item) => sum + Math.max(0, item.netValue),
    0,
  );
  const totalNegative = Math.abs(
    data.reduce((sum, item) => sum + Math.min(0, item.netValue), 0),
  );
  const totalTransactions = data.reduce(
    (sum, item) => sum + item.transactionCount,
    0,
  );

  // Determine if trend is positive or negative
  const isPositiveTrend = totalNetValue >= 0;

  // Generate chart container classes
  const chartContainerClasses = [
    `h-[${height}]`,
    width === "full" ? "w-full" : `w-[${width}]`,
    responsive && "min-h-[300px]",
    responsive && data.length > 10 && "overflow-x-auto",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Net Value by Table</CardTitle>
        <CardDescription>
          Financial overview across {data.length} selected table
          {data.length === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={chartContainerClasses}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 40,
              right: 12,
              left: 12,
              bottom: 60,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="table"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                // Truncate long table names
                return value.length > 12 ? value.slice(0, 12) + "..." : value;
              }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `Table: ${label}`}
                  formatter={(value, name, props) => [
                    formatCurrency(value as number),
                    "Net Value",
                  ]}
                  indicator="dot"
                />
              }
            />
            <Bar dataKey="netValue" fill="hsl(var(--chart-1))" radius={4}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={11}
                formatter={(value: number) => formatCurrency(value)}
              />
            </Bar>
          </BarChart>
        </ChartContainer>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border">
            <div className="font-semibold text-green-700 dark:text-green-300">
              {formatCurrency(totalPositive)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Total Positive
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border">
            <div className="font-semibold text-red-700 dark:text-red-300">
              {formatCurrency(totalNegative)}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              Total Negative
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
            <div className="font-semibold text-blue-700 dark:text-blue-300">
              {formatCurrency(totalNetValue)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Net Total
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              {totalTransactions.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total Transactions
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Net value is {isPositiveTrend ? "positive" : "negative"} across
          selected tables
          {isPositiveTrend ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing aggregated financial data from {data.length} table
          {data.length === 1 ? "" : "s"}
        </div>
      </CardFooter>
    </Card>
  );
}
