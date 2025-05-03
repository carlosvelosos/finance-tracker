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
  ReferenceLine,
} from "recharts";

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

// Define chart data point type
interface DataPoint {
  id: number;
  date: Date;
  formattedDate: string;
  positiveValue: number;
  negativeValue: number;
  negativeValueAbs: number; // New property for absolute value of expenses
  netValue: number;
  amount: number;
  description: string;
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

// Define a type for our dot component props
interface DotProps {
  cx?: number;
  cy?: number;
  dataKey?: string;
  payload?: DataPoint;
}

// Regular dot component
const RegularDot = (props: DotProps) => {
  const { cx, cy, dataKey, payload } = props;
  if (!cx || !cy || !dataKey || !payload) return null;

  let color;
  let opacity = 1.0;

  // Determine color based on data key
  if (dataKey === "positiveValue") {
    color = "#10B981"; // Green for income
    // Make dot darker for negative transactions on income line
    if (payload.amount < 0) opacity = 0.4;
  } else if (dataKey === "negativeValue" || dataKey === "negativeValueAbs") {
    color = "#EF4444"; // Red for expenses
    // Make dot darker for positive transactions on expense line
    if (payload.amount > 0) opacity = 0.4;
  } else {
    color = "#3B82F6"; // Blue for net value
  }

  return (
    <Dot cx={cx} cy={cy} r={3} fill={color} stroke={color} opacity={opacity} />
  );
};

// Active dot component (for hover state)
const ActiveDot = (props: DotProps) => {
  const { cx, cy, dataKey, payload } = props;
  if (!cx || !cy || !dataKey || !payload) return null;

  let color;
  let opacity = 1.0;

  // Determine color based on data key
  if (dataKey === "positiveValue") {
    color = "#10B981"; // Green for income
    // Make dot darker for negative transactions on income line
    if (payload.amount < 0) opacity = 0.3;
  } else if (dataKey === "negativeValue" || dataKey === "negativeValueAbs") {
    color = "#EF4444"; // Red for expenses
    // Make dot darker for positive transactions on expense line
    if (payload.amount > 0) opacity = 0.3;
  } else {
    color = "#3B82F6"; // Blue for net value
  }

  return (
    <g>
      {/* Larger outer circle with white border */}
      <Dot
        cx={cx}
        cy={cy}
        r={8}
        fill={color}
        stroke="white"
        strokeWidth={2}
        opacity={opacity}
      />
    </g>
  );
};

// Define types for chart event data
interface ChartMouseEventData {
  activePayload?: Array<{ payload: DataPoint }>;
  activeCoordinate?: {
    x: number;
    y: number;
  };
}

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
    negativeValueAbs: number; // Added absolute value for display
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
          negativeValueAbs: Math.abs(negativeValue), // Store absolute value for plotting
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
        negativeValueAbs: Math.abs(cumulativeNegative), // Store absolute value for plotting
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
    negativeValueAbs: {
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
  const handleMouseMove = (data: ChartMouseEventData) => {
    if (data && data.activePayload && data.activePayload.length) {
      const payload = data.activePayload[0].payload;
      const xCoord = data.activeCoordinate?.x;

      // Debug logs
      console.log("Mouse move data:", {
        xCoordinate: xCoord,
        isNumber: typeof xCoord === "number",
        isNaN: xCoord !== undefined ? isNaN(xCoord) : true,
        stringValue: String(xCoord),
      });

      setTooltipData({
        formattedDate: payload.formattedDate,
        description: payload.description,
        amount: payload.amount,
        positiveValue: payload.positiveValue,
        negativeValue: payload.negativeValue,
        negativeValueAbs: payload.negativeValueAbs, // Added absolute value
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
        negativeValueAbs: firstItem.negativeValueAbs, // Added absolute value
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
        <div className="flex flex-row">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>

          <div className="ml-auto mr-4">
            {/* Static tooltip at the bottom of the chart */}
            {tooltipData && (
              <div className="rounded-md text-sm max-w-[400px]">
                <div className="flex gap-4">
                  {/* Left Column */}
                  <div
                    className="flex flex-col gap-2 flex-1"
                    style={{ width: "150px" }}
                  >
                    {/* Transaction date */}
                    <div className="flex items-center">
                      <span className="text-xs whitespace-nowrap">
                        {tooltipData.formattedDate}
                      </span>
                    </div>

                    {/* Transaction description */}
                    <div className="flex items-center">
                      <span className="text-xs whitespace-nowrap">
                        {tooltipData.description}
                      </span>
                    </div>

                    {/* Transaction amount */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            tooltipData.amount >= 0 ? "#10B981" : "#EF4444",
                        }}
                      />
                      <span className="text-xs whitespace-nowrap">
                        {new Intl.NumberFormat("sv-SE", {
                          style: "currency",
                          currency: "SEK",
                        }).format(tooltipData.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="w-px bg-gray-700" />

                  {/* Right Column */}
                  <div
                    className="flex flex-col gap-2 flex-1"
                    style={{ width: "200px" }}
                  >
                    {/* Income */}
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 rounded-full bg-[#10B981]" />
                      <span className="text-xs whitespace-nowrap flex-1">
                        Income:
                      </span>
                      <span className="text-xs whitespace-nowrap text-right">
                        {new Intl.NumberFormat("sv-SE", {
                          style: "currency",
                          currency: "SEK",
                        }).format(tooltipData.positiveValue)}
                      </span>
                    </div>
                    {/* Expenses */}
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 rounded-full bg-[#EF4444]" />
                      <span className="text-xs whitespace-nowrap flex-1">
                        Expenses:
                      </span>
                      <span className="text-xs whitespace-nowrap text-right">
                        {new Intl.NumberFormat("sv-SE", {
                          style: "currency",
                          currency: "SEK",
                        }).format(tooltipData.negativeValueAbs)}
                      </span>
                    </div>

                    {/* Net value */}
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 rounded-full bg-[#3B82F6]" />
                      <span className="text-xs whitespace-nowrap flex-1">
                        Net:
                      </span>
                      <span className="text-xs whitespace-nowrap text-right">
                        {new Intl.NumberFormat("sv-SE", {
                          style: "currency",
                          currency: "SEK",
                        }).format(tooltipData.netValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
                {/* Add solid reference line at y=0 */}
                <ReferenceLine y={0} stroke="#4B5563" strokeWidth={1.5} />
                <Legend verticalAlign="bottom" />

                {/* Only keep cursor functionality for interaction, no tooltip */}
                <ChartTooltip cursor={true} content={() => null} />

                {/* Positive transactions line */}
                <Line
                  type="monotone"
                  dataKey="positiveValue"
                  name="Income"
                  strokeWidth={2}
                  stroke="#10B981"
                  connectNulls
                  dot={<RegularDot dataKey="positiveValue" />}
                  activeDot={<ActiveDot dataKey="positiveValue" />}
                  isAnimationActive={true}
                />

                {/* Expenses line now using absolute values for display but maintaining original data in tooltips */}
                <Line
                  type="monotone"
                  dataKey="negativeValueAbs"
                  name="Expenses"
                  strokeWidth={2}
                  stroke="#EF4444"
                  connectNulls
                  dot={<RegularDot dataKey="negativeValue" />}
                  activeDot={<ActiveDot dataKey="negativeValue" />}
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
                  dot={<RegularDot dataKey="netValue" />}
                  activeDot={<ActiveDot dataKey="netValue" />}
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
