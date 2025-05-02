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
      r={3}
      fill={dataKey === "positiveValue" ? "#10B981" : "#EF4444"}
      stroke={dataKey === "positiveValue" ? "#059669" : "#DC2626"}
      strokeWidth={1}
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
      r={5}
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
  // Chart data preparation - plot one data point per transaction
  const chartData = useMemo(() => {
    if (!transactions || !transactions.length) {
      // Demo data if no transactions
      return Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const date = new Date(2025, 4, day);
        const positiveValue = Math.random() * 5000 * (i / 10 + 1);
        const negativeValue = -Math.random() * 4000 * (i / 10 + 1);

        return {
          id: i,
          date: date,
          formattedDate: date.toLocaleDateString(),
          positiveValue,
          negativeValue,
          netValue: positiveValue + negativeValue,
          description: `Demo transaction ${i + 1}`,
        };
      });
    }

    // Filter out transactions without dates and sort by date
    const sortedTransactions = [...transactions]
      .filter((t) => t.Date)
      .sort((a, b) => {
        if (!a.Date || !b.Date) return 0;
        return new Date(a.Date).getTime() - new Date(b.Date).getTime();
      });

    if (sortedTransactions.length === 0) return [];

    // Initialize cumulative values
    let cumulativePositive = 0;
    let cumulativeNegative = 0;

    // Create a data point for each transaction
    return sortedTransactions.map((transaction, index) => {
      const amount = transaction.Amount || 0;

      // Update cumulative values based on amount
      if (amount > 0) {
        cumulativePositive += amount;
      } else {
        cumulativeNegative += amount;
      }

      const date = transaction.Date ? new Date(transaction.Date) : new Date();

      return {
        id: transaction.id,
        date: date,
        formattedDate: date.toLocaleDateString(),
        positiveValue: cumulativePositive,
        negativeValue: cumulativeNegative,
        netValue: cumulativePositive + cumulativeNegative,
        description: transaction.Description || `Transaction ${index + 1}`,
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

  // Format date for display on X-axis
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

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
            maxWidth: "220px",
          }}
        >
          <div className="font-medium mb-1">
            {payload[0].payload.formattedDate}
          </div>
          <div className="text-sm mb-1 truncate">
            {payload[0].payload.description}
          </div>
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
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={30}
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
