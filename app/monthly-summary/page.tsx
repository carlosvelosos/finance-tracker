"use client";

import React, { useState, useEffect } from "react";
import { loadFinancialData, MonthlyData } from "../../lib/csvLoader";

const MonthlySummaryPage = () => {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData()
      .then((csvData) => {
        setData(csvData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading CSV data:", error);
        setLoading(false);
      });
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">
          Loading financial data...
        </div>
      </div>
    );
  }

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
                {/* Totals Row */}
                <tr className="bg-gray-100 dark:bg-gray-700 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.interAcc, 0),
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.interCreditCard, 0))}`}
                  >
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.interCreditCard, 0),
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.interInvest, 0),
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.ricoCreditCard, 0))}`}
                  >
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.ricoCreditCard, 0),
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.ricoInvest, 0),
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.fgts, 0),
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.mae, 0),
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.handelsbankenAcc, 0),
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                    {formatCurrency(
                      data.reduce(
                        (sum, row) => sum + row.handelsbankenInvest,
                        0,
                      ),
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.amexCreditCard, 0))}`}
                  >
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.amexCreditCard, 0),
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.sjPrioCreditCard, 0))}`}
                  >
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.sjPrioCreditCard, 0),
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-600">
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.total, 0),
                    )}
                  </td>
                </tr>
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
