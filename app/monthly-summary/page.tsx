"use client";

import React, { useState } from "react";
import { useMonthlySummary } from "../../lib/hooks/useMonthlySummary";
import { Button } from "@/components/ui/button";

const MonthlySummaryPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [convertToReais, setConvertToReais] = useState(false);
  const [conversionRate, setConversionRate] = useState(0.56);
  const [showSources, setShowSources] = useState(false);
  const { data, yearlyBalances, yearlyInvestTotals, loading, error, refetch } =
    useMonthlySummary({
      year: selectedYear,
    });

  // Generate year options (2024 to current year)
  const yearOptions = Array.from(
    { length: currentYear - 2023 },
    (_, i) => 2024 + i,
  );

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

  // Convert SEK to BRL if conversion is enabled
  const convertValue = (value: number) => {
    return convertToReais ? value * conversionRate : value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">
          Loading financial data from Supabase...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            Error loading financial data: {error.message}
          </div>
          <Button onClick={refetch} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => setShowSources((s) => !s)}
                aria-expanded={showSources}
                aria-controls="data-sources"
                className="text-left"
              >
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  Monthly Financial Summary
                </h1>
              </button>
              <p className="text-gray-600 dark:text-gray-400">
                Overview of all accounts, credit cards, and investments by month
                (Data from Supabase)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="year-select"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Year:
                </label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={() => setConvertToReais(!convertToReais)}
                variant={convertToReais ? "default" : "outline"}
              >
                {convertToReais ? "Show SEK" : "Convert to BRL"}
              </Button>
              {convertToReais && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="rate-input"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Rate:
                  </label>
                  <input
                    id="rate-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={conversionRate}
                    onChange={(e) => setConversionRate(Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <Button onClick={refetch} variant="outline">
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {showSources && (
          <div
            id="data-sources"
            className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Column data sources
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc pl-5">
              <li>
                <strong>Inter Acc (`row.interAcc`):</strong> Aggregated
                `&quot;Date&quot;,&quot;Amount&quot;` from tables named
                `INACC_YYYYMM` (selected via `INACC_*` discovery).
              </li>
              <li>
                <strong>Inter Credit Card (`row.interCreditCard`):</strong>{" "}
                Aggregated
                `&quot;Date&quot;,&quot;Amount&quot;,&quot;Category&quot;` from
                tables named `INMCPDF_YYYYMM` (credit-card invoices; excludes
                Category = &quot;Pagamento fatura anterior&quot;).
              </li>
              <li>
                <strong>B3 (`row.b3`):</strong> Aggregated
                `&quot;Date&quot;,&quot;Amount&quot;` from tables named
                `B3_YYYYMM` (net dividend values).
              </li>
              <li>
                <strong>Rico Credit Card (`row.ricoCreditCard`):</strong>{" "}
                (placeholder) Aggregated
                `&quot;Date&quot;,&quot;Amount&quot;,&quot;Category&quot;` from
                `AM_YYYYMM` or similar tables when available.
              </li>
              <li>
                <strong>Handelsbanken Acc (`row.handelsbankenAcc`):</strong>{" "}
                Monthly account totals derived from yearly `HB_YYYY` tables
                (selected columns
                `&quot;Date&quot;,&quot;Amount&quot;,&quot;Category&quot;,&quot;Balance&quot;`;
                non-&quot;Investment&quot; rows contribute to account totals).
                Latest `Balance` is used for yearly balance.
              </li>
              <li>
                <strong>
                  Handelsbanken Invest (`row.handelsbankenInvest`):
                </strong>{" "}
                Monthly investment totals derived from yearly `HB_YYYY` tables
                where `Category === &quot;Investment&quot;` (uses
                `&quot;Amount&quot;` as absolute values).
              </li>
              <li>
                <strong>Amex Credit Card (`row.amexCreditCard`):</strong>{" "}
                Aggregated
                `&quot;Date&quot;,&quot;Amount&quot;,&quot;Category&quot;` from
                tables named `AM_YYYYMM` (credit invoices; excludes Category =
                &quot;Pagamento fatura anterior&quot; and sign is inverted for
                expenses).
              </li>
              <li>
                <strong>SJ Prio Credit Card (`row.sjPrioCreditCard`):</strong>{" "}
                Aggregated
                `&quot;Date&quot;,&quot;Amount&quot;,&quot;Category&quot;` from
                tables named `SJ_YYYYMM` (credit invoices; excludes Category =
                &quot;Pagamento fatura anterior&quot; and sign is inverted for
                expenses).
              </li>
              <li>
                <strong>Total:</strong> Per-row total is computed in the hook
                from the aggregated values (e.g. includes `interAcc`,
                Handelsbanken account & invest totals, B3, Amex, SJ where
                applicable). Handelsbanken fields are converted to BRL when
                &quot;Convert to BRL&quot; is enabled.
              </li>
              <li>
                <strong>Table discovery:</strong> Hook attempts to call RPC
                `get_user_accessible_tables` and falls back to probing
                `INACC_YYYYMM`, `INMCPDF_YYYYMM`, `AM_YYYYMM`, `SJ_YYYYMM`,
                `B3_YYYYMM`, and `HB_YYYY` patterns.
              </li>
            </ul>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="w-32 px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600 sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                    Month
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    <div className="text-right">
                      <div>Inter</div>
                      <div>Acc</div>
                    </div>
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    <div className="text-right">
                      <div>Inter</div>
                      <div>Credit Card</div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    B3
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    <div className="text-right">
                      <div>Rico</div>
                      <div>Credit Card</div>
                    </div>
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    <div className="text-right">
                      <div>Handelsbanken</div>
                      <div>Acc</div>
                    </div>
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    <div className="text-right">
                      <div>Handelsbanken</div>
                      <div>Invest</div>
                    </div>
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    <div className="text-right">
                      <div>Amex</div>
                      <div>Credit Card</div>
                    </div>
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    <div className="text-right">
                      <div>SJ Prio</div>
                      <div>Credit Card</div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-gray-200 dark:bg-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((row) => (
                  <tr
                    key={row.month}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="w-32 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      {row.month}
                    </td>
                    <td
                      className={`w-32 px-4 py-3 text-sm text-right ${getCellColor(row.interAcc)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.interAcc)}
                    </td>
                    <td
                      className={`w-32 px-4 py-3 text-sm text-right ${getCellColor(row.interCreditCard)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.interCreditCard)}
                    </td>
                    <td
                      className={`w-32 px-4 py-3 text-sm text-right ${getCellColor(row.b3)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.b3)}
                    </td>
                    <td
                      className={`w-32 px-4 py-3 text-sm text-right ${getCellColor(row.ricoCreditCard)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(row.ricoCreditCard)}
                    </td>
                    <td
                      className={`w-32 px-4 py-3 text-sm text-right ${getCellColor(row.handelsbankenAcc)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(convertValue(row.handelsbankenAcc))}
                    </td>
                    <td
                      className={`w-32 px-4 py-3 text-sm text-right ${getCellColor(row.handelsbankenInvest)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(convertValue(row.handelsbankenInvest))}
                    </td>
                    <td
                      className={`w-32 px-4 py-3 text-sm text-right ${getCellColor(row.amexCreditCard)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(convertValue(row.amexCreditCard))}
                    </td>
                    <td
                      className={`w-32 px-4 py-3 text-sm text-right ${getCellColor(row.sjPrioCreditCard)} border-r border-gray-200 dark:border-gray-700`}
                    >
                      {formatCurrency(convertValue(row.sjPrioCreditCard))}
                    </td>
                    <td className="w-32 px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-750">
                      {formatCurrency(
                        // Total now includes: Inter Acc, B3, Handelsbanken Acc, Handelsbanken Invest
                        row.interAcc +
                          row.b3 +
                          convertValue(row.handelsbankenAcc) +
                          convertValue(row.handelsbankenInvest),
                      )}
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-gray-100 dark:bg-gray-700 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
                  <td className="w-32 px-4 py-3 text-sm font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                    TOTAL
                  </td>
                  <td
                    className={`w-32 px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.interAcc, 0))}`}
                  >
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.interAcc, 0),
                    )}
                  </td>
                  <td
                    className={`w-32 px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.interCreditCard, 0))}`}
                  >
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.interCreditCard, 0),
                    )}
                  </td>
                  <td
                    className={`w-32 px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.b3, 0))}`}
                  >
                    {formatCurrency(data.reduce((sum, row) => sum + row.b3, 0))}
                  </td>
                  <td
                    className={`w-32 px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.ricoCreditCard, 0))}`}
                  >
                    {formatCurrency(
                      data.reduce((sum, row) => sum + row.ricoCreditCard, 0),
                    )}
                  </td>
                  <td
                    className={`w-32 px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.handelsbankenAcc, 0))}`}
                  >
                    {formatCurrency(
                      convertValue(
                        data.reduce(
                          (sum, row) => sum + row.handelsbankenAcc,
                          0,
                        ),
                      ),
                    )}
                  </td>
                  <td
                    className={`w-32 px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.handelsbankenInvest, 0))}`}
                  >
                    {formatCurrency(
                      convertValue(
                        data.reduce(
                          (sum, row) => sum + row.handelsbankenInvest,
                          0,
                        ),
                      ),
                    )}
                  </td>
                  <td
                    className={`w-32 px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.amexCreditCard, 0))}`}
                  >
                    {formatCurrency(
                      convertValue(
                        data.reduce((sum, row) => sum + row.amexCreditCard, 0),
                      ),
                    )}
                  </td>
                  <td
                    className={`w-32 px-4 py-3 text-sm text-right border-r border-gray-200 dark:border-gray-700 ${getCellColor(data.reduce((sum, row) => sum + row.sjPrioCreditCard, 0))}`}
                  >
                    {formatCurrency(
                      convertValue(
                        data.reduce(
                          (sum, row) => sum + row.sjPrioCreditCard,
                          0,
                        ),
                      ),
                    )}
                  </td>
                  <td className="w-32 px-4 py-3 text-sm text-right font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-600">
                    {formatCurrency(
                      // Totals now include: Inter Acc, B3, Handelsbanken Acc, Handelsbanken Invest
                      data.reduce(
                        (sum, row) =>
                          sum +
                          row.interAcc +
                          row.b3 +
                          convertValue(row.handelsbankenAcc) +
                          convertValue(row.handelsbankenInvest),
                        0,
                      ),
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
          <p>
            * Total includes: Inter Acc, B3, Handelsbanken Acc, Handelsbanken
            Invest
          </p>
        </div>

        <div className="mt-12 p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Yearly Summary
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Overview by year
          </p>
        </div>

        {/* Yearly Summary Table */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="w-32 px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Year
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Inter
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Santander
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Banco do Brasil
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Caixa (FGTS)
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Mãe
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    B3
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Rico (XP)
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Handelsbanken
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    SW Pension
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Handelsbanken Invest
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-gray-200 dark:bg-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {yearOptions.map((year) => {
                  const inter = 0;
                  const santander = 0;
                  const bancoDoBrasil = 0;
                  const caixaFGTS = 20000;
                  const mae = 40000;
                  // Calculate B3 yearly total from monthly data for the current selected year only
                  const b3 =
                    year === selectedYear
                      ? data
                          .filter((row) => row.month) // Ensure we have valid months
                          .reduce((sum, row) => sum + row.b3, 0)
                      : 0;
                  const ricoXP = 0;
                  const handelsbanken = yearlyBalances[year] || 0;
                  const swPension = 0;
                  const handelsbankenInvest = yearlyInvestTotals[year] || 0;
                  const total =
                    inter +
                    santander +
                    bancoDoBrasil +
                    caixaFGTS +
                    mae +
                    b3 +
                    ricoXP +
                    convertValue(handelsbanken) +
                    swPension +
                    convertValue(handelsbankenInvest);

                  return (
                    <tr
                      key={year}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <td className="w-32 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                        {year}
                      </td>
                      <td className="w-32 px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                        {formatCurrency(inter)}
                      </td>
                      <td className="w-32 px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                        {formatCurrency(santander)}
                      </td>
                      <td className="w-32 px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                        {formatCurrency(bancoDoBrasil)}
                      </td>
                      <td className="w-32 px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                        {formatCurrency(caixaFGTS)}
                      </td>
                      <td className="w-32 px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                        {formatCurrency(mae)}
                      </td>
                      <td className="w-32 px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                        {formatCurrency(b3)}
                      </td>
                      <td className="w-32 px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                        {formatCurrency(ricoXP)}
                      </td>
                      <td className="w-32 px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                        {formatCurrency(convertValue(handelsbanken))}
                      </td>
                      <td className="w-32 px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                        {formatCurrency(swPension)}
                      </td>
                      <td className="w-32 px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                        {formatCurrency(convertValue(handelsbankenInvest))}
                      </td>
                      <td className="w-32 px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-750">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummaryPage;
