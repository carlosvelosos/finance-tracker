"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Dot,
  TooltipProps,
  Legend,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

// Define our transaction type
interface Transaction {
  id: number;
  Category?: string | null;
  Amount?: number | null;
  Bank?: string | null;
  Description?: string | null;
  Date?: string | null;
}

interface TransactionLineChartProps {
  transactions: Transaction[];
  title?: string;
  description?: string;
  className?: string;
  positiveColor?: string;
  negativeColor?: string;
}

// Custom dot component for our line chart
interface DotProps {
  cx?: number;
  cy?: number;
  payload?: any;
  dataKey?: string;
}

const CustomDot = (props: DotProps) => {
  const { cx, cy, dataKey } = props;
  if (!cx || !cy || !dataKey) return null;

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill={dataKey === "positiveValue" ? "#10B981" : "#EF4444"}
      stroke={dataKey === "positiveValue" ? "#059669" : "#DC2626"}
    />
  );
};

// Custom active dot component
const CustomActiveDot = (props: DotProps) => {
  const { cx, cy, dataKey } = props;
  if (!cx || !cy || !dataKey) return null;

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={6}
      fill={dataKey === "positiveValue" ? "#10B981" : "#EF4444"}
      stroke="white"
      strokeWidth={2}
    />
  );
};

export function TransactionLineChart({
  transactions,
  title = "Transaction Cumulative Flow",
  description = "Cumulative positive and negative transactions over time",
  className = "",
  positiveColor = "hsl(var(--chart-2))",
  negativeColor = "hsl(var(--chart-4))",
}: TransactionLineChartProps) {
  // Chart data preparation - group by month and calculate cumulative values
  const chartData = useMemo(() => {
    if (!transactions || !transactions.length) {
      // Demo data if no transactions
      return Array.from({ length: 12 }, (_, i) => {
        const positiveValue = Math.random() * 10000 * (i + 1);
        const negativeValue = -Math.random() * 8000 * (i + 1);

        return {
          name: new Date(2025, i, 1).toLocaleString("default", {
            month: "short",
          }),
          positiveValue,
          negativeValue,
          netValue: positiveValue + negativeValue,
        };
      });
    }

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => {
      if (!a.Date || !b.Date) return 0;
      return new Date(a.Date).getTime() - new Date(b.Date).getTime();
    });

    // Group transactions by month
    const monthlyData: Record<string, { positive: number; negative: number }> =
      {};

    sortedTransactions.forEach((transaction) => {
      let date = transaction.Date ? new Date(transaction.Date) : new Date();
      const monthKey =
        new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString(
          "default",
          { month: "short" }
        ) +
        " " +
        date.getFullYear();

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { positive: 0, negative: 0 };
      }

      const amount = transaction.Amount || 0;
      if (amount > 0) {
        monthlyData[monthKey].positive += amount;
      } else {
        monthlyData[monthKey].negative += amount;
      }
    });

    // Calculate cumulative values
    let cumulativePositive = 0;
    let cumulativeNegative = 0;

    return Object.entries(monthlyData).map(([month, data]) => {
      cumulativePositive += data.positive;
      cumulativeNegative += data.negative;

      return {
        name: month.substring(0, 3), // Abbreviate month name
        positiveValue: cumulativePositive,
        negativeValue: cumulativeNegative,
        netValue: cumulativePositive + cumulativeNegative,
      };
    });
  }, [transactions]);

  const chartConfig = {
    positiveValue: {
      label: "Income",
      color: positiveColor,
    },
    negativeValue: {
      label: "Expenses",
      color: negativeColor,
    },
  } satisfies ChartConfig;

  // Custom tooltip content
  const renderTooltipContent = ({
    payload,
    coordinate,
  }: TooltipProps<ValueType, NameType>) => {
    if (payload && payload.length > 0 && coordinate) {
      return (
        <div
          className="absolute shadow-md rounded p-2 bg-background border border-border pointer-events-none z-[100]"
          style={{
            left: `${coordinate.x}px`,
            top: "10px", // Fixed position at top of chart
            transform: "translateX(-50%)", // Center horizontally
            maxWidth: "200px",
          }}
        >
          <div className="font-medium mb-1">{payload[0].payload.name}</div>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    entry.dataKey === "positiveValue" ? "#10B981" : "#EF4444",
                }}
              />
              <span>
                {entry.name}:{" "}
                {new Intl.NumberFormat("sv-SE", {
                  style: "currency",
                  currency: "SEK",
                }).format(entry.value as number)}
              </span>
            </div>
          ))}
          <div className="border-t mt-1 pt-1 text-sm">
            <span className="font-medium">Net: </span>
            {new Intl.NumberFormat("sv-SE", {
              style: "currency",
              currency: "SEK",
            }).format(payload[0].payload.netValue)}
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
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden px-4">
        <div className="h-full rounded-lg p-3">
          <ChartContainer config={chartConfig} className="h-[90%] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  left: 0,
                  right: 40,
                  top: 20,
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
                <ChartTooltip cursor={false} content={renderTooltipContent} />
                <Legend verticalAlign="bottom" />

                {/* Positive transactions line */}
                <Line
                  type="monotone"
                  dataKey="positiveValue"
                  name="Income"
                  strokeWidth={2}
                  stroke="#10B981"
                  connectNulls
                  dot={<CustomDot dataKey="positiveValue" />}
                  activeDot={<CustomActiveDot dataKey="positiveValue" />}
                  isAnimationActive={true}
                />

                {/* Negative transactions line */}
                <Line
                  type="monotone"
                  dataKey="negativeValue"
                  name="Expenses"
                  strokeWidth={2}
                  stroke="#EF4444"
                  connectNulls
                  dot={<CustomDot dataKey="negativeValue" />}
                  activeDot={<CustomActiveDot dataKey="negativeValue" />}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
