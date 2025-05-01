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
} from "@/components/ui/chart";
import { Bill } from "@/app/types/bill";

interface BillChartProps {
  bills: Bill[];
  months: string[];
  country: "Sweden" | "Brazil";
  className?: string;
  color?: string;
}

export function BillChart({
  bills,
  months,
  country,
  className = "",
  color,
}: BillChartProps) {
  // Chart data preparation for a single country with cumulative values
  const chartData = useMemo(() => {
    if (!bills.length) {
      // Demo data for preview with cumulative values
      const monthlyValues =
        country === "Sweden"
          ? [
              2000, 3000, 1000, 2500, 1800, 3200, 2200, 1900, 2700, 3100, 2600,
              3500,
            ]
          : [
              1000, 1500, 2000, 900, 1200, 1100, 1300, 1800, 1600, 1400, 1700,
              2000,
            ];

      // Calculate cumulative values
      let cumulative = 0;
      return months.map((month, index) => {
        cumulative += monthlyValues[index] || 0;
        return {
          name: month.substring(0, 3),
          value: cumulative,
        };
      });
    }

    // For actual data, calculate cumulative values throughout the year
    let cumulativeTotal = 0;
    return months.map((month) => {
      const monthAbbr = month.toLowerCase().substring(0, 3);
      const valueField = `${monthAbbr}_value` as keyof Bill;

      // Calculate monthly total for selected country
      const monthlyTotal = bills
        .filter((bill) => bill.country === country)
        .reduce((sum, bill) => {
          const monthValue = bill[valueField];
          return (
            sum +
            (typeof monthValue === "number" ? monthValue : bill.base_value)
          );
        }, 0);

      // Add to cumulative total
      cumulativeTotal += monthlyTotal;

      return {
        name: month.substring(0, 3),
        value: cumulativeTotal,
      };
    });
  }, [bills, months, country]);

  const chartConfig = {
    value: {
      label: country,
      color:
        color ||
        (country === "Sweden" ? "hsl(var(--chart-1))" : "hsl(var(--chart-3))"),
    },
  } satisfies ChartConfig;

  // Custom tooltip content
  const renderTooltipContent = ({ payload }: any) => {
    if (payload && payload.length > 0) {
      return (
        <div className="p-2 bg-white dark:bg-gray-800 shadow-md rounded">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: payload[0].color }}
            />
            <span className="font-medium">
              {new Intl.NumberFormat("en-US").format(
                payload[0].value as number
              )}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      className={`bg-[#171717] rounded-lg shadow-md border border-gray-800 text-[#898989] flex flex-col h-[350px] ${className}`}
    >
      <CardHeader className="pb-2 shrink-0">
        <CardTitle>{country} Cumulative Bills</CardTitle>
        <CardDescription>Accumulated expenses over 2025</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden px-4">
        <div className="h-full rounded-lg p-3">
          <div className="text-sm font-medium mb-1">{country}</div>
          <ChartContainer config={chartConfig} className="h-[90%] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  left: 0,
                  right: 20,
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
                <ChartTooltip cursor={true} content={renderTooltipContent} />
                <Line
                  type="monotone"
                  dataKey="value"
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
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm py-2 shrink-0">
        <div className="flex gap-2 font-medium leading-none">
          <TrendingUp className="h-4 w-4" /> Cumulative expenses
        </div>
        <div className="leading-none text-muted-foreground">
          Total accumulated bill expenses over the year
        </div>
      </CardFooter>
    </Card>
  );
}
