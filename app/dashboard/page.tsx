"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

interface MonthlyData {
  month: string;
  interAcc: number;
  interCreditCard: number;
  interInvest: number;
  ricoCreditCard: number;
  ricoInvest: number;
  fgts: number;
  mae: number;
  handelsbankenAcc: number;
  handelsbankenInvest: number;
  amexCreditCard: number;
  sjPrioCreditCard: number;
  total: number;
}

// Seeded random number generator for consistent results
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate realistic data with growth trends and variations
const generateRandomData = (seed: number = 12345): MonthlyData[] => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Base values and growth rates
  let interAccBase = 5200;
  let interInvestBase = 12500;
  let ricoInvestBase = 8300;
  let handelsbankenAccBase = 3800;
  let handelsbankenInvestBase = 15600;
  let fgtsBase = 22000;
  let maeBase = 4500;
  let seedCounter = seed;

  return months.map((month, index) => {
    // Simulate account growth/variations
    const interAcc = Math.round(
      interAccBase + (seededRandom(seedCounter++) - 0.3) * 800,
    );
    interAccBase += 150 + seededRandom(seedCounter++) * 100;

    // Credit cards with realistic variations (all negative - debt)
    const interCreditCard = -Math.round(
      800 + (seededRandom(seedCounter++) - 0.5) * 600 + Math.sin(index) * 200,
    );
    const ricoCreditCard = -Math.round(
      1200 + (seededRandom(seedCounter++) - 0.4) * 800 + Math.cos(index) * 300,
    );
    const amexCreditCard = -Math.round(
      1500 +
        (seededRandom(seedCounter++) - 0.5) * 900 +
        Math.sin(index * 0.7) * 400,
    );
    const sjPrioCreditCard = -Math.round(
      600 +
        (seededRandom(seedCounter++) - 0.5) * 400 +
        Math.cos(index * 0.8) * 200,
    );

    // Investments with growth trends
    const interInvest = Math.round(
      interInvestBase + (seededRandom(seedCounter++) - 0.3) * 600,
    );
    interInvestBase += 180 + seededRandom(seedCounter++) * 150;

    const ricoInvest = Math.round(
      ricoInvestBase + (seededRandom(seedCounter++) - 0.3) * 500,
    );
    ricoInvestBase += 120 + seededRandom(seedCounter++) * 120;

    const handelsbankenAcc = Math.round(
      handelsbankenAccBase + (seededRandom(seedCounter++) - 0.4) * 400,
    );
    handelsbankenAccBase += 80 + seededRandom(seedCounter++) * 80;

    const handelsbankenInvest = Math.round(
      handelsbankenInvestBase + (seededRandom(seedCounter++) - 0.25) * 800,
    );
    handelsbankenInvestBase += 220 + seededRandom(seedCounter++) * 180;

    // FGTS grows steadily (government fund)
    const fgts = Math.round(
      fgtsBase + index * 85 + seededRandom(seedCounter++) * 50,
    );

    // Mae account with small variations
    const mae = Math.round(maeBase + (seededRandom(seedCounter++) - 0.5) * 300);
    maeBase += 50 + seededRandom(seedCounter++) * 40;

    const total =
      interAcc +
      interCreditCard +
      interInvest +
      ricoCreditCard +
      ricoInvest +
      fgts +
      mae +
      handelsbankenAcc +
      handelsbankenInvest +
      amexCreditCard +
      sjPrioCreditCard;

    return {
      month,
      interAcc,
      interCreditCard,
      interInvest,
      ricoCreditCard,
      ricoInvest,
      fgts,
      mae,
      handelsbankenAcc,
      handelsbankenInvest,
      amexCreditCard,
      sjPrioCreditCard,
      total,
    };
  });
};

const COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  purple: "#a855f7",
  pink: "#ec4899",
  indigo: "#6366f1",
  teal: "#14b8a6",
  orange: "#f97316",
  emerald: "#059669",
};

const FinancialDashboard = () => {
  const data = generateRandomData();
  const [selectedPeriod, setSelectedPeriod] = useState<"3M" | "6M" | "1Y">(
    "1Y",
  );

  // Get latest month data for current values
  const latestMonth = data[data.length - 1];

  // Calculate data for the chart with cumulative values
  const chartData = data.map((item, index) => {
    // For accounts and investments, show the running total balance (cumulative)
    // This represents the total value accumulated up to this month
    const cumulativeInterAcc = data
      .slice(0, index + 1)
      .reduce((sum, d) => sum + d.interAcc, 0);
    const cumulativeHandelsbankenAcc = data
      .slice(0, index + 1)
      .reduce((sum, d) => sum + d.handelsbankenAcc, 0);
    const cumulativeFgts = data
      .slice(0, index + 1)
      .reduce((sum, d) => sum + d.fgts, 0);
    const cumulativeMae = data
      .slice(0, index + 1)
      .reduce((sum, d) => sum + d.mae, 0);
    const cumulativeAccountsTotal =
      cumulativeInterAcc +
      cumulativeHandelsbankenAcc +
      cumulativeFgts +
      cumulativeMae;

    // Calculate cumulative values for investments
    const cumulativeInterInvest = data
      .slice(0, index + 1)
      .reduce((sum, d) => sum + d.interInvest, 0);
    const cumulativeRicoInvest = data
      .slice(0, index + 1)
      .reduce((sum, d) => sum + d.ricoInvest, 0);
    const cumulativeHandelsbankenInvest = data
      .slice(0, index + 1)
      .reduce((sum, d) => sum + d.handelsbankenInvest, 0);
    const cumulativeTotalInvestments =
      cumulativeInterInvest +
      cumulativeRicoInvest +
      cumulativeHandelsbankenInvest;

    // Calculate grand total (accounts + investments)
    const cumulativeGrandTotal =
      cumulativeAccountsTotal + cumulativeTotalInvestments;

    return {
      ...item,
      cumulativeInterAcc,
      cumulativeHandelsbankenAcc,
      cumulativeFgts,
      cumulativeMae,
      cumulativeAccountsTotal,
      cumulativeInterInvest,
      cumulativeRicoInvest,
      cumulativeHandelsbankenInvest,
      cumulativeTotalInvestments,
      cumulativeGrandTotal,
    };
  });

  // Calculate max cumulative value for left axis
  const maxCumulative = Math.max(
    ...chartData.map(
      (d) => d.cumulativeAccountsTotal + d.cumulativeTotalInvestments,
    ),
  );

  // Calculate min and max for right axis (bars)
  const minMonthly = Math.min(
    ...chartData.flatMap((d) => [
      d.interInvest,
      d.ricoInvest,
      d.handelsbankenInvest,
      d.interCreditCard,
      d.ricoCreditCard,
      d.amexCreditCard,
      d.sjPrioCreditCard,
    ]),
  );
  const maxMonthly = Math.max(
    ...chartData.flatMap((d) => [
      d.interInvest,
      d.ricoInvest,
      d.handelsbankenInvest,
      d.interCreditCard,
      d.ricoCreditCard,
      d.amexCreditCard,
      d.sjPrioCreditCard,
    ]),
  );

  // Calculate aligned domains to ensure zero lines match vertically
  const leftAxisMin = -3000;
  // Round up to a "nice" number (nearest 1,000) so axis ticks are clean
  function roundUpToNice(n: number, step = 1000) {
    return Math.ceil(n / step) * step;
  }
  const leftAxisMax = roundUpToNice(maxCumulative * 1.1, 1000); // Add 10% padding and round

  const rightAxisMin = -3000;
  const rightAxisMax = maxMonthly * 1.1; // Add 10% padding to positive values  // Calculate portfolio distribution for pie chart
  const portfolioData = [
    {
      name: "Inter Account",
      value: latestMonth.interAcc,
      color: "#1a1a1a",
    },
    {
      name: "Inter Invest",
      value: latestMonth.interInvest,
      color: "#404040",
    },
    {
      name: "Rico Invest",
      value: latestMonth.ricoInvest,
      color: "#525252",
    },
    {
      name: "Handelsbanken Acc",
      value: latestMonth.handelsbankenAcc,
      color: "#737373",
    },
    {
      name: "Handelsbanken Invest",
      value: latestMonth.handelsbankenInvest,
      color: "#8c8c8c",
    },
    { name: "FGTS", value: latestMonth.fgts, color: "#a3a3a3" },
    { name: "Mae", value: latestMonth.mae, color: "#bfbfbf" },
  ];

  // Calculate credit card data
  const creditCardData = [
    {
      name: "Inter CC",
      value: latestMonth.interCreditCard,
      color: COLORS.danger,
    },
    {
      name: "Rico CC",
      value: latestMonth.ricoCreditCard,
      color: COLORS.danger,
    },
    {
      name: "Amex CC",
      value: latestMonth.amexCreditCard,
      color: COLORS.danger,
    },
    {
      name: "SJ Prio CC",
      value: latestMonth.sjPrioCreditCard,
      color: COLORS.danger,
    },
  ];

  // Use a consistent en-US currency formatter for chart ticks and labels
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });

  const formatCurrency = (value: number) => {
    if (!Number.isFinite(value)) return "$0";
    const abs = Math.abs(Math.round(value));
    const formatted = currencyFormatter.format(abs);
    return `${value < 0 ? "-" : ""}$${formatted}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate summary stats
  const totalAssets =
    latestMonth.interAcc +
    latestMonth.interInvest +
    latestMonth.ricoInvest +
    latestMonth.handelsbankenAcc +
    latestMonth.handelsbankenInvest +
    latestMonth.fgts +
    latestMonth.mae;
  const totalLiabilities = Math.abs(latestMonth.ricoCreditCard);
  const netWorth = latestMonth.total;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                Financial Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visual overview of your financial portfolio
              </p>
            </div>
            <div className="flex gap-2">
              {(["3M", "6M", "1Y"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Assets
                </p>
                <span className="text-green-600 text-sm">↑ 5.2%</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalAssets)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Liabilities
                </p>
                <span className="text-red-600 text-sm">↑ 2.1%</span>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(-totalLiabilities)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Net Worth
                </p>
                <span className="text-green-600 text-sm">↑ 7.8%</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(netWorth)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Trading-Style Charts - Stacked */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Financial Overview
            </h3>
          </div>

          {/* Top Chart: Cumulative Stacked Areas with Total Line */}
          <div className="mb-1">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cumulative Values
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={chartData}
                // increase top margin so top axis ticks/labels are not clipped
                margin={{ bottom: 0, top: 36, left: 16, right: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200 dark:stroke-gray-700"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  axisLine={{ stroke: "#9ca3af" }}
                  hide
                />
                <YAxis
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  tickFormatter={formatCurrency}
                  axisLine={{ stroke: "#9ca3af" }}
                  // add padding so the topmost tick has breathing room and won't be clipped
                  padding={{ top: 20, bottom: 8 }}
                  domain={[0, leftAxisMax]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(156, 163, 175, 0.1)" }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />

                {/* Stacked area charts for individual accounts */}
                <Area
                  type="monotone"
                  dataKey="cumulativeInterAcc"
                  stackId="1"
                  stroke="#404040"
                  fill="#404040"
                  fillOpacity={0.6}
                  name="Inter Acc"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeHandelsbankenAcc"
                  stackId="1"
                  stroke="#525252"
                  fill="#525252"
                  fillOpacity={0.6}
                  name="Handelsbanken Acc"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeFgts"
                  stackId="1"
                  stroke="#737373"
                  fill="#737373"
                  fillOpacity={0.6}
                  name="FGTS"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeMae"
                  stackId="1"
                  stroke="#a3a3a3"
                  fill="#a3a3a3"
                  fillOpacity={0.6}
                  name="Mae"
                />

                {/* Stacked area charts for individual investments */}
                <Area
                  type="monotone"
                  dataKey="cumulativeInterInvest"
                  stackId="1"
                  stroke="#8c8c8c"
                  fill="#8c8c8c"
                  fillOpacity={0.5}
                  name="Inter Invest"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeRicoInvest"
                  stackId="1"
                  stroke="#bfbfbf"
                  fill="#bfbfbf"
                  fillOpacity={0.5}
                  name="Rico Invest"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeHandelsbankenInvest"
                  stackId="1"
                  stroke="#d4d4d4"
                  fill="#d4d4d4"
                  fillOpacity={0.5}
                  name="Handelsbanken Invest"
                />

                {/* Line overlay for grand total only */}
                <Line
                  type="monotone"
                  dataKey="cumulativeGrandTotal"
                  stroke="#000000"
                  strokeWidth={3}
                  name="Total (Accounts + Investments)"
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Chart: Monthly Bars */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Values
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={chartData}
                // match the top chart margins so both charts align horizontally
                margin={{ bottom: 0, top: 36, left: 16, right: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200 dark:stroke-gray-700"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  axisLine={{ stroke: "#9ca3af" }}
                />
                <YAxis
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  tickFormatter={formatCurrency}
                  axisLine={{ stroke: "#9ca3af" }}
                  // add padding to match the top chart and avoid clipping
                  padding={{ top: 20, bottom: 8 }}
                  domain={[rightAxisMin, rightAxisMax]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(156, 163, 175, 0.1)" }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="rect" />

                {/* Monthly bars for individual investments - dark gray for positive */}
                <Bar
                  dataKey="interInvest"
                  fill="#404040"
                  name="Inter Invest"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Bar
                  dataKey="ricoInvest"
                  fill="#525252"
                  name="Rico Invest"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Bar
                  dataKey="handelsbankenInvest"
                  fill="#737373"
                  name="Handelsbanken Invest"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />

                {/* Individual bars for each credit card - red for negative */}
                <Bar
                  dataKey="interCreditCard"
                  fill={COLORS.danger}
                  name="Inter CC"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Bar
                  dataKey="ricoCreditCard"
                  fill={COLORS.danger}
                  name="Rico CC"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Bar
                  dataKey="amexCreditCard"
                  fill={COLORS.danger}
                  name="Amex CC"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Bar
                  dataKey="sjPrioCreditCard"
                  fill={COLORS.danger}
                  name="SJ Prio CC"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Portfolio Distribution - Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Portfolio Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Investment Accounts Comparison */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Investment Accounts
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200 dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="month"
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor" }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="interInvest"
                  stroke="#404040"
                  strokeWidth={2}
                  name="Inter Invest"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="ricoInvest"
                  stroke="#525252"
                  strokeWidth={2}
                  name="Rico Invest"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="handelsbankenInvest"
                  stroke="#737373"
                  strokeWidth={2}
                  name="Handelsbanken Invest"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Credit Cards Overview - Combined Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Credit Card Balances */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Credit Card Balances
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={creditCardData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200 dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="name"
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor" }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {creditCardData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Credit Card Trends Over Time */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Credit Card Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-gray-200 dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="month"
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor" }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="interCreditCard"
                  stroke="#404040"
                  strokeWidth={2}
                  name="Inter CC"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="ricoCreditCard"
                  stroke="#525252"
                  strokeWidth={2}
                  name="Rico CC"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="amexCreditCard"
                  stroke="#737373"
                  strokeWidth={2}
                  name="Amex CC"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="sjPrioCreditCard"
                  stroke="#8c8c8c"
                  strokeWidth={2}
                  name="SJ Prio CC"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Credit Card Debt - Combined Bar and Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Total Credit Card Debt Analysis
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={data.map((item, index) => {
                const monthlyTotal =
                  item.interCreditCard +
                  item.ricoCreditCard +
                  item.amexCreditCard +
                  item.sjPrioCreditCard;
                const cumulative = data
                  .slice(0, index + 1)
                  .reduce(
                    (sum, d) =>
                      sum +
                      d.interCreditCard +
                      d.ricoCreditCard +
                      d.amexCreditCard +
                      d.sjPrioCreditCard,
                    0,
                  );
                return {
                  month: item.month,
                  monthlyTotal,
                  cumulative,
                };
              })}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <XAxis
                dataKey="month"
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: "currentColor" }}
              />
              <YAxis
                yAxisId="left"
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: "currentColor" }}
                tickFormatter={formatCurrency}
                label={{
                  value: "Monthly Amount",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: "currentColor" }}
                tickFormatter={formatCurrency}
                label={{
                  value: "Cumulative",
                  angle: 90,
                  position: "insideRight",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="monthlyTotal"
                fill={COLORS.danger}
                radius={[8, 8, 0, 0]}
                name="Monthly Total"
                opacity={0.7}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulative"
                stroke="#404040"
                strokeWidth={3}
                name="Cumulative Debt"
                dot={{ r: 4, fill: "#404040" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
