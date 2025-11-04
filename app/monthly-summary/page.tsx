"use client";

import React from "react";

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

const MonthlySummaryPage = () => {
  const data = generateRandomData();

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getCellColor = (value: number) => {
    if (value < 0) return "text-red-600";
    return "text-gray-900 dark:text-gray-100";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            Monthly Financial Summary
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of all accounts, credit cards, and investments by month
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600 sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                    Month
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Inter Acc
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Inter Credit Card
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Inter Invest
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Rico Credit Card
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Rico Invest
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    FGTS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Mae
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Handelsbanken Acc
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Handelsbanken Invest
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Amex Credit Card
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    SJ Prio Credit Card
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-gray-200 dark:bg-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((row, index) => (
                  <tr
                    key={row.month}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      {row.month}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${getCellColor(row.interAcc)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.interAcc)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${getCellColor(row.interCreditCard)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.interCreditCard)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${getCellColor(row.interInvest)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.interInvest)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${getCellColor(row.ricoCreditCard)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.ricoCreditCard)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${getCellColor(row.ricoInvest)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.ricoInvest)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${getCellColor(row.fgts)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.fgts)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${getCellColor(row.mae)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.mae)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${getCellColor(row.handelsbankenAcc)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.handelsbankenAcc)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${getCellColor(row.handelsbankenInvest)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.handelsbankenInvest)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${getCellColor(row.amexCreditCard)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.amexCreditCard)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${getCellColor(row.sjPrioCreditCard)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.sjPrioCreditCard)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-750">
                      {formatCurrency(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>* Negative values are displayed in red</p>
          <p>* All values are in your default currency</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummaryPage;
