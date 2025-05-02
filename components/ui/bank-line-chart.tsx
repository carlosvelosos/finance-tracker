"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Dot,
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
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

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
  netColor?: string;
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

  let fillColor, strokeColor;

  if (dataKey === "positiveValue") {
    fillColor = "#10B981";
    strokeColor = "#059669";
  } else if (dataKey === "negativeValue") {
    fillColor = "#EF4444";
    strokeColor = "#DC2626";
  } else {
    fillColor = "#3B82F6";
    strokeColor = "#2563EB";
  }

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={3}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={1}
    />
  );
};

// Custom active dot component
const CustomActiveDot = (props: DotProps) => {
  const { cx, cy, dataKey } = props;
  if (!cx || !cy || !dataKey) return null;

  let fillColor;

  if (dataKey === "positiveValue") {
    fillColor = "#10B981";
  } else if (dataKey === "negativeValue") {
    fillColor = "#EF4444";
  } else {
    fillColor = "#3B82F6";
  }

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={5}
      fill={fillColor}
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
  netColor = "hsl(var(--chart-1))",
}: TransactionLineChartProps) {
  // State for static tooltip
  const [tooltipData, setTooltipData] = useState<{
    formattedDate: string;
    description: string;
    amount: number;
    positiveValue: number;
    negativeValue: number;
    netValue: number;
    xCoordinate?: number;
  } | null>(null);

  // Chart data preparation - plot one data point per transaction
  const chartData = useMemo(() => {
    if (!transactions || !transactions.length) {
      // Demo data if no transactions
      return Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const date = new Date(2025, 4, day);
        const amount = Math.random() * 1000 * (Math.random() > 0.6 ? 1 : -1);
        const positiveValue = Math.random() * 5000 * (i / 10 + 1);
        const negativeValue = -Math.random() * 4000 * (i / 10 + 1);
        const netValue = positiveValue + negativeValue;

        return {
          id: i,
          date: date,
          formattedDate: date.toLocaleDateString(),
          positiveValue,
          negativeValue,
          netValue,
          amount: amount,
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

      const netValue = cumulativePositive + cumulativeNegative;
      const date = transaction.Date ? new Date(transaction.Date) : new Date();

      return {
        id: transaction.id,
        date: date,
        formattedDate: date.toLocaleDateString(),
        positiveValue: cumulativePositive,
        negativeValue: cumulativeNegative,
        netValue: netValue,
        amount: amount,
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
    netValue: {
      label: "Net Value",
      color: netColor,
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

  // Handler for mouse move on chart
  const handleMouseMove = (data: any) => {
    if (data && data.activePayload && data.activePayload.length) {
      const payload = data.activePayload[0].payload;
      const xCoord = data.activeCoordinate?.x;

      // Debug logs
      console.log("Mouse move data:", {
        xCoordinate: xCoord,
        isNumber: typeof xCoord === "number",
        isNaN: isNaN(xCoord),
        stringValue: String(xCoord),
      });

      setTooltipData({
        formattedDate: payload.formattedDate,
        description: payload.description,
        amount: payload.amount,
        positiveValue: payload.positiveValue,
        negativeValue: payload.negativeValue,
        netValue: payload.netValue,
        xCoordinate: xCoord,
      });
    }
  };

  // Handler for mouse leave
  const handleMouseLeave = () => {
    // Keep the last tooltip data visible instead of setting to null
    // setTooltipData(null);
  };

  // Set initial tooltip data to the first transaction if available
  useMemo(() => {
    if (chartData.length > 0 && !tooltipData) {
      const firstItem = chartData[0]; // Use first transaction instead of last
      const chartContainer = document.querySelector(".recharts-wrapper");
      let initialXCoordinate;

      if (chartContainer) {
        // Get the first dot's position if possible
        const firstDot = chartContainer.querySelector(".recharts-dot");
        if (firstDot) {
          const dotX = firstDot.getAttribute("cx");
          initialXCoordinate = dotX ? parseFloat(dotX) : 50; // Default to 50 if not found
        } else {
          initialXCoordinate = 50; // Default position if dot not found
        }
      }

      setTooltipData({
        formattedDate: firstItem.formattedDate,
        description: firstItem.description,
        amount: firstItem.amount,
        positiveValue: firstItem.positiveValue,
        negativeValue: firstItem.negativeValue,
        netValue: firstItem.netValue,
        xCoordinate: initialXCoordinate,
      });
    }
  }, [chartData, tooltipData]);

  return (
    <Card
      className={`bg-[#171717] rounded-lg shadow-md border border-gray-800 text-[#898989] flex flex-col ${className}`}
    >
      <CardHeader className="pb-2 shrink-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden px-4 relative">
        <div className="h-[85%] rounded-lg">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  left: 0,
                  right: 40,
                  top: 20,
                  bottom: 0,
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
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
                <Legend verticalAlign="bottom" />

                {/* Tooltip Cursor Line - Use a custom solution instead of ReferenceLine */}
                {tooltipData?.xCoordinate &&
                  !isNaN(tooltipData.xCoordinate) && (
                    <svg
                      width="100%"
                      height="100%"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        pointerEvents: "none",
                      }}
                    >
                      <line
                        x1={tooltipData.xCoordinate}
                        y1={0}
                        x2={tooltipData.xCoordinate}
                        y2="100%"
                        stroke="#888"
                        strokeDasharray="3 3"
                        strokeWidth={1}
                      />
                    </svg>
                  )}

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

                {/* Net value line */}
                <Line
                  type="monotone"
                  dataKey="netValue"
                  name="Net Value"
                  strokeWidth={2.5}
                  stroke="#3B82F6"
                  connectNulls
                  dot={<CustomDot dataKey="netValue" />}
                  activeDot={<CustomActiveDot dataKey="netValue" />}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Static tooltip at the bottom of the chart */}
        {tooltipData && (
          <div className="mt-2 p-2 border border-gray-700 bg-gray-900 rounded-md text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">{tooltipData.formattedDate}</span>
              <span className="text-xs truncate">
                {tooltipData.description}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 justify-between">
              {/* Transaction amount */}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      tooltipData.amount >= 0 ? "#10B981" : "#EF4444",
                  }}
                />
                <span className="text-xs whitespace-nowrap">
                  Transaction:{" "}
                  {new Intl.NumberFormat("sv-SE", {
                    style: "currency",
                    currency: "SEK",
                  }).format(tooltipData.amount)}
                </span>
              </div>

              {/* Income */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="text-xs whitespace-nowrap">
                  Income:{" "}
                  {new Intl.NumberFormat("sv-SE", {
                    style: "currency",
                    currency: "SEK",
                  }).format(tooltipData.positiveValue)}
                </span>
              </div>

              {/* Expenses */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="text-xs whitespace-nowrap">
                  Expenses:{" "}
                  {new Intl.NumberFormat("sv-SE", {
                    style: "currency",
                    currency: "SEK",
                  }).format(tooltipData.negativeValue)}
                </span>
              </div>

              {/* Net value */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                <span className="text-xs whitespace-nowrap">
                  Net:{" "}
                  {new Intl.NumberFormat("sv-SE", {
                    style: "currency",
                    currency: "SEK",
                  }).format(tooltipData.netValue)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
