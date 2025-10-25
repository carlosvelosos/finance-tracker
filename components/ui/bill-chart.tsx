"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Dot,
  TooltipProps,
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
import { Bill } from "@/app/types/bill";

interface BillChartProps {
  bills: Bill[];
  months: string[];
  country: "Sweden" | "Brazil";
  className?: string;
  color?: string;
}

// // Define chart data point type
// interface ChartDataPoint {
//   name: string;
//   value: number;
//   isPast: boolean;
// }

// Define a type for our dot component props
interface DotProps {
  cx?: number;
  cy?: number;
  payload?: {
    isPast: boolean;
  };
}

// Define a type for bar shape props
interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: {
    isPast: boolean;
  };
  fill?: string;
}

// Define a custom dot component properly typed
const PastFutureDot = (props: DotProps) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      //   fill={payload.isPast ? "#1E40AF" : "#6B7280"}
      fill={payload.isPast ? "#aaaaaa" : "#333333"}
      stroke={payload.isPast ? "#1E40AF" : "#6B7280"}
    />
  );
};

// Define a custom active dot component
const PastFutureActiveDot = (props: DotProps) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={6}
      fill={payload.isPast ? "#1E40AF" : "#6B7280"}
      stroke={payload.isPast ? "#1E40AF" : "#6B7280"}
    />
  );
};

// Define a custom bar shape component that changes color based on isPast
const CustomBarShape = (props: BarShapeProps & { country: string }) => {
  const { x, y, width, height, payload, country } = props;
  if (x === undefined || y === undefined || !width || !height || !payload)
    return null;

  // Define colors based on country and isPast status
  const fillColor = payload.isPast
    ? country === "Sweden"
      ? "rgba(59, 130, 246, 0.5)" // Blue for Sweden past
      : "rgba(34, 197, 94, 0.5)" // Green for Brazil past
    : "rgba(100, 100, 100, 0.3)"; // Gray for future months

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fillColor}
      rx={4}
      ry={4}
    />
  );
};

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
      const currentMonthIndex = new Date().getMonth();

      return months.map((month, index) => {
        const monthlyValue = monthlyValues[index] || 0;
        cumulative += monthlyValue;
        return {
          name: month.substring(0, 3),
          value: cumulative,
          monthlyTotal: monthlyValue,
          isPast: index <= currentMonthIndex,
        };
      });
    }

    // For actual data, calculate cumulative values throughout the year
    let cumulativeTotal = 0;
    const currentMonthIndex = new Date().getMonth();

    return months.map((month, monthIndex) => {
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
        monthlyTotal: monthlyTotal,
        isPast: monthIndex <= currentMonthIndex,
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
    monthlyTotal: {
      label: "Monthly Total",
      color:
        country === "Sweden" ? "hsl(var(--chart-2))" : "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  // Format currency based on country - shared function
  const formatCurrency = (value: number) =>
    country === "Sweden"
      ? new Intl.NumberFormat("sv-SE", {
          style: "currency",
          currency: "SEK",
          maximumFractionDigits: 0,
        }).format(value)
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        }).format(value);

  // Custom tooltip content with position at top of chart
  const renderTooltipContent = ({
    payload,
    coordinate,
  }: TooltipProps<ValueType, NameType>) => {
    if (payload && payload.length > 0 && coordinate) {
      const cumulativeValue = payload.find((p) => p.dataKey === "value")
        ?.value as number;
      const monthlyValue = payload.find((p) => p.dataKey === "monthlyTotal")
        ?.value as number;

      return (
        <div
          className="absolute shadow-md rounded p-2 pointer-events-none z-[100] bg-gray-900 border border-gray-700"
          style={{
            left: `${coordinate.x}px`,
            top: "-20px", // Fixed position at top of chart
            transform: "translateX(-50%)", // Center horizontally
            minWidth: "160px",
          }}
        >
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">Monthly:</span>
              <span className="font-medium text-white">
                {formatCurrency(monthlyValue)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">Cumulative:</span>
              <span className="font-medium text-white">
                {formatCurrency(cumulativeValue)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get the current month index for gradient calculation
  const currentMonthIndex = new Date().getMonth();
  const gradientOffset = currentMonthIndex / 11; // Position as percentage along x-axis

  // Calculate mean monthly expense and annual projection
  const { meanMonthly, annualProjection } = useMemo(() => {
    // Only calculate based on past months (including current month)
    const pastMonths = chartData.filter((data) => data.isPast);
    const totalMonthlyExpenses = pastMonths.reduce(
      (sum, data) => sum + data.monthlyTotal,
      0,
    );
    const mean =
      pastMonths.length > 0 ? totalMonthlyExpenses / pastMonths.length : 0;
    const projection = mean * 12;

    return {
      meanMonthly: mean,
      annualProjection: projection,
    };
  }, [chartData]);

  return (
    <Card
      className={`bg-[#171717] rounded-lg shadow-md border border-gray-800 text-[#898989] flex flex-col h-[350px] ${className}`}
    >
      <CardHeader className="pb-2 shrink-0">
        <CardTitle>{country} Cumulative Bills</CardTitle>
        <CardDescription>
          Avg monthly: {formatCurrency(meanMonthly)} | Annual projection:{" "}
          {formatCurrency(annualProjection)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden px-4">
        <div className="h-full rounded-lg p-3">
          {/* <div className="text-sm font-medium mb-1">{country}</div> */}
          <ChartContainer config={chartConfig} className="h-[90%] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{
                  left: 0,
                  right: 40,
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
                {/* Left Y-axis for cumulative line */}
                <YAxis
                  yAxisId="left"
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
                {/* Right Y-axis for monthly bars */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
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

                {/* Define gradient to handle color split for line only */}
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="1" y2="0">
                    <stop offset={gradientOffset} stopColor="#0c51b5" />
                    <stop offset={gradientOffset} stopColor="#333333" />
                  </linearGradient>
                </defs>

                {/* Bar chart for monthly totals with custom shape */}
                <Bar
                  yAxisId="right"
                  dataKey="monthlyTotal"
                  shape={(props: BarShapeProps) => (
                    <CustomBarShape {...props} country={country} />
                  )}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />

                {/* Line chart for cumulative values */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="value"
                  name="Cumulative"
                  strokeWidth={2}
                  stroke="url(#splitColor)"
                  connectNulls
                  dot={<PastFutureDot />}
                  activeDot={<PastFutureActiveDot />}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm py-2 shrink-0">
        <div className="flex gap-2 font-medium leading-none">
          <TrendingUp className="h-4 w-4" /> Cumulative expenses
        </div>
        <div className="leading-none text-muted-foreground">
          Total accumulated bill expenses over the year
        </div>
      </CardFooter> */}
    </Card>
  );
}
