"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
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
import { Bill } from "@/app/types/bill";

interface BillChartProps {
  bills: Bill[];
  months: string[];
  className?: string;
}

export function BillChart({ bills, months, className = "" }: BillChartProps) {
  // Chart data preparation
  const chartData = useMemo(() => {
    if (!bills.length) {
      // Demo data for preview
      return [
        { name: "Jan", Sweden: 2000, Brazil: 1000 },
        { name: "Feb", Sweden: 3000, Brazil: 1500 },
        { name: "Mar", Sweden: 1000, Brazil: 2000 },
        { name: "Apr", Sweden: 2500, Brazil: 900 },
        { name: "May", Sweden: 1800, Brazil: 1200 },
        { name: "Jun", Sweden: 3200, Brazil: 1100 },
      ];
    }

    return months.map((month) => {
      const monthAbbr = month.toLowerCase().substring(0, 3);
      const valueField = `${monthAbbr}_value` as keyof Bill;
      const statusField = `${monthAbbr}_status` as keyof Bill;

      // Calculate totals per country
      const swedenTotal = bills
        .filter((bill) => bill.country === "Sweden" && !bill[statusField])
        .reduce((sum, bill) => {
          const monthValue = bill[valueField];
          return (
            sum +
            (typeof monthValue === "number" ? monthValue : bill.base_value)
          );
        }, 0);

      const brazilTotal = bills
        .filter((bill) => bill.country === "Brazil" && !bill[statusField])
        .reduce((sum, bill) => {
          const monthValue = bill[valueField];
          return (
            sum +
            (typeof monthValue === "number" ? monthValue : bill.base_value)
          );
        }, 0);

      return {
        name: month.substring(0, 3),
        Sweden: swedenTotal,
        Brazil: brazilTotal,
      };
    });
  }, [bills, months]);

  const chartConfig = {
    Sweden: {
      label: "Sweden",
      color: "hsl(var(--chart-1))",
    },
    Brazil: {
      label: "Brazil",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  return (
    <Card className={`flex flex-col h-[500px] ${className}`}>
      <CardHeader className="pb-2 shrink-0">
        <CardTitle>Monthly Bill Amounts</CardTitle>
        <CardDescription>January - December 2025</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden px-4">
        <ChartContainer config={chartConfig} className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                left: 0,
                right: 30,
                top: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
                width={40}
              />
              <ChartTooltip
                cursor={false}
                content={({ payload }) => {
                  if (payload && payload.length > 0) {
                    return (
                      <div className="p-2 bg-white shadow-md rounded">
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span>{entry.name}: </span>
                            <span className="font-medium">
                              {new Intl.NumberFormat("en-US").format(
                                entry.value as number
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="Sweden"
                strokeWidth={2}
                dot={{
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Brazil"
                strokeWidth={2}
                dot={{
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm py-2 shrink-0">
        <div className="flex gap-2 font-medium leading-none">
          <TrendingUp className="h-4 w-4" /> Monthly bill tracker
        </div>
        <div className="leading-none text-muted-foreground">
          Showing bill amounts for Sweden and Brazil
        </div>
      </CardFooter>
    </Card>
  );
}
