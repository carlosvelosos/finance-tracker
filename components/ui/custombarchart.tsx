"use client";

// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Transaction } from "@/types/transaction";

// Map description prefixes (regex) to a canonical display name.
// Add entries here to merge similar descriptions into one line.
const DESCRIPTION_NORMALIZATIONS: Array<{
  pattern: RegExp;
  canonical: string;
}> = [
  { pattern: /^bredband2/i, canonical: "Bredband2" },
  { pattern: /telia/i, canonical: "Telia" },
  { pattern: /^bixia/i, canonical: "Bixia" },
  { pattern: /^(sj prio|seb kort bank)/i, canonical: "SEB SJ Prio" },
];

function normalizeDescription(desc: string): string {
  const trimmed = desc.trim();
  for (const { pattern, canonical } of DESCRIPTION_NORMALIZATIONS) {
    if (pattern.test(trimmed)) return canonical;
  }
  return trimmed;
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(136, 132, 216, ${alpha})`;
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
}

type CustomBarChartProps = {
  data: Transaction[]; // Expect raw transaction data as input
  height?: number; // Optional height for the chart
  barColor?: string; // Optional color for the bars
  title?: string; // Optional title for the chart
  description?: string; // Optional description for the chart
};

export function CustomBarChart({
  data,
  barColor = "#8884d8",
  title = "Bar Chart",
  description = "Category-wise totals",
}: CustomBarChartProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // State for the minor expenses threshold (default to 1.0%)
  const [minorExpensesThreshold, setMinorExpensesThreshold] = useState(1.0);

  // Drag refs for the month-year grid (refs avoid extra re-renders)
  const isDragging = useRef(false);
  const dragPainting = useRef(true);

  // Selected months as a Set of "YYYY-MM" keys
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    for (let m = 1; m <= month; m++) {
      initial.add(`${year}-${String(m).padStart(2, "0")}`);
    }
    return initial;
  });

  // State for hidden categories
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(
    new Set(),
  );

  // Release drag on global mouseup
  useEffect(() => {
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Toggle category visibility
  const toggleCategoryVisibility = (category: string) => {
    setHiddenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center mt-10">
        No data available to display the chart.
      </div>
    );
  }

  // Month names for display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Filter data by selected months
  const dateFilteredData = data.filter((transaction) => {
    if (!transaction.Date) return true;
    const m = transaction.Date.match(/^(\d{4})-(\d{2})/);
    if (!m) return true;
    return selectedMonths.has(`${m[1]}-${m[2]}`);
  });

  // Remove unwanted categories before any processing
  const filteredData = dateFilteredData.filter(
    (transaction) =>
      !["Invoice", "Salary", "Crédit card"].includes(
        transaction.Category || "",
      ),
  );

  // Preprocess data: Invert the sign of Amount for Handelsbanken
  const processedData = filteredData.map((transaction) => ({
    ...transaction,
    Amount:
      transaction.Bank === "Handelsbanken" && transaction.Amount
        ? -transaction.Amount
        : transaction.Amount,
  }));

  // Format numbers as generic currency (no specific currency symbol)
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  // Process the raw transaction data
  const totals = processedData.reduce(
    (acc, transaction) => {
      if (transaction.Category && transaction.Amount) {
        acc[transaction.Category] =
          (acc[transaction.Category] || 0) + transaction.Amount;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // Log totals by category
  console.log("Totals by Category:", totals);

  // Calculate totals per bank
  const totalsPerBank = processedData.reduce(
    (acc, transaction) => {
      if (transaction.Bank && transaction.Amount) {
        acc[transaction.Bank] =
          (acc[transaction.Bank] || 0) + transaction.Amount;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // Log totals per bank
  console.log("Totals by Bank:", totalsPerBank);

  // Calculate totalSum after filtering
  const totalSum = Object.values(totals).reduce(
    (sum, value) => sum + Math.abs(value),
    0,
  );

  // Debugging the totalSum variable
  console.log("Filtered Total Sum:", totalSum);

  // Process filtered categories for chart data
  const sortedCategories = Object.entries(totals)
    .map(([category, total]) => ({
      category,
      total: Math.abs(total),
      originalTotal: total, // Keep the signed value for color coding
    }))
    .sort((a, b) => a.total - b.total);

  let minorExpensesTotal = 0;
  const filteredCategories = [];
  const categoryColorMap = new Map<string, boolean>(); // Track if category is positive

  // Iterate through sorted categories
  for (const category of sortedCategories) {
    // Check if the category's total is less than the threshold percentage of the totalSum
    if (category.total / totalSum <= minorExpensesThreshold / 100) {
      // Add the category's total to minorExpensesTotal
      minorExpensesTotal += category.total;
    } else {
      // Add the category to filteredCategories if it doesn't qualify as a minor expense
      filteredCategories.push(category);
      // Track if original value was positive
      categoryColorMap.set(category.category, category.originalTotal >= 0);
    }
  }

  // Add "Minor expenses" category if there are any minor expenses
  if (minorExpensesTotal > 0) {
    const minorExpensesKey = `Minor expenses (${minorExpensesThreshold}%)`;
    filteredCategories.push({
      category: minorExpensesKey,
      total: minorExpensesTotal,
      originalTotal: minorExpensesTotal, // Minor expenses are always shown as positive
    });
    categoryColorMap.set(minorExpensesKey, false); // Show as expense (red)
  }

  // Final chart data - before filtering hidden categories
  const allChartData = filteredCategories.sort((a, b) => b.total - a.total);

  // Filter out hidden categories from chart display
  const chartData = allChartData.filter(
    (item) => !hiddenCategories.has(item.category),
  );

  // Recalculate visible total for accurate percentages
  const visibleTotalSum = chartData.reduce((sum, item) => sum + item.total, 0);

  // --- Month-year grid helpers ---
  const availableYears: number[] = [
    ...new Set(
      data
        .filter((t) => t.Date && /^\d{4}/.test(t.Date))
        .map((t) => parseInt(t.Date!.substring(0, 4))),
    ),
  ].sort((a, b) => a - b);

  const txCountPerCell = data.reduce(
    (acc, t) => {
      if (!t.Date) return acc;
      const match = t.Date.match(/^(\d{4})-(\d{2})/);
      if (match) {
        const key = `${match[1]}-${match[2]}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const maxTxCount = Math.max(...Object.values(txCountPerCell), 1);
  const monthShort = [
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
  const gridYears = availableYears.length > 0 ? availableYears : [currentYear];
  const selectedCount = selectedMonths.size;

  const handleCellMouseDown = (key: string) => {
    isDragging.current = true;
    const wasSelected = selectedMonths.has(key);
    dragPainting.current = !wasSelected;
    setSelectedMonths((prev) => {
      const next = new Set(prev);
      if (wasSelected) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCellMouseEnter = (key: string) => {
    if (!isDragging.current) return;
    setSelectedMonths((prev) => {
      const alreadySet = prev.has(key);
      if (dragPainting.current === alreadySet) return prev;
      const next = new Set(prev);
      if (dragPainting.current) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const handleSelectAll = () => {
    const next = new Set<string>();
    gridYears.forEach((y) => {
      const maxM = y === currentYear ? currentMonth : 12;
      for (let m = 1; m <= maxM; m++) {
        next.add(`${y}-${String(m).padStart(2, "0")}`);
      }
    });
    setSelectedMonths(next);
  };

  const handleClearAll = () => setSelectedMonths(new Set());

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title} - {formatCurrency(visibleTotalSum)}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <ChartContainer
          config={{ layout: { label: "Vertical Layout", color: barColor } }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                left: 0,
                right: 50,
              }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={150}
                // tick={{ fontSize: 10 }} // Reduce font size of Y-axis labels
              />
              <ChartTooltip
                cursor={false}
                content={({ payload }) => {
                  if (payload && payload.length > 0) {
                    const value = payload[0].value;
                    return (
                      <div className="p-2 bg-white shadow-md rounded">
                        {formatCurrency(value as number)}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="total"
                fill={barColor}
                radius={10}
                barSize={20}
                label={({ x, y, width, value }) => {
                  const percentage =
                    ((value as number) / visibleTotalSum) * 100;
                  return (
                    <text
                      x={x + width + 10}
                      y={y + 14}
                      textAnchor="start"
                      fill="#555"
                      fontSize="12px"
                    >
                      {percentage.toFixed(1)}%
                    </text>
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="w-full px-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minor Expenses Threshold: {minorExpensesThreshold}%
          </label>
          <Slider
            defaultValue={[minorExpensesThreshold]}
            min={0}
            max={5}
            step={0.1}
            value={[minorExpensesThreshold]}
            onValueChange={(value) => setMinorExpensesThreshold(value[0])}
          />
        </div>
        <div className="w-full px-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Range
              <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                {selectedCount} month{selectedCount !== 1 ? "s" : ""} selected
              </span>
            </label>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:underline underline-offset-2"
              >
                Select all
              </button>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:underline underline-offset-2"
              >
                Clear
              </button>
            </div>
          </div>
          <div
            className="select-none overflow-x-auto"
            onMouseDown={(e) => e.preventDefault()}
          >
            {/* Month column headers */}
            <div className="flex gap-1 mb-1 ml-10 min-w-max">
              {monthShort.map((mn) => (
                <div
                  key={mn}
                  className="w-8 text-center text-[10px] text-gray-400 dark:text-gray-500"
                >
                  {mn}
                </div>
              ))}
            </div>
            {/* Year rows */}
            {gridYears.map((year) => (
              <div
                key={year}
                className="flex items-center gap-1 mb-1 min-w-max"
              >
                <div className="w-9 text-[11px] text-gray-500 dark:text-gray-400 text-right pr-1 shrink-0">
                  {year}
                </div>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  const key = `${year}-${String(month).padStart(2, "0")}`;
                  const isSelected = selectedMonths.has(key);
                  const count = txCountPerCell[key] || 0;
                  const intensity =
                    count > 0 ? 0.25 + (count / maxTxCount) * 0.75 : 0.15;
                  const isFuture =
                    year > currentYear ||
                    (year === currentYear && month > currentMonth);
                  return (
                    <div
                      key={key}
                      className="w-8 h-8 rounded-md transition-transform hover:scale-110"
                      style={{
                        backgroundColor: isSelected
                          ? hexToRgba(barColor, intensity)
                          : "rgba(150,150,150,0.1)",
                        outline: isSelected
                          ? `2px solid ${hexToRgba(barColor, 0.55)}`
                          : "2px solid transparent",
                        outlineOffset: "1px",
                        opacity: isFuture ? 0.3 : 1,
                        cursor: isFuture ? "default" : "pointer",
                      }}
                      title={`${monthNames[i]} ${year}${count > 0 ? ` — ${count} transactions` : ""}`}
                      onMouseDown={() => {
                        if (isFuture) return;
                        handleCellMouseDown(key);
                      }}
                      onMouseEnter={() => {
                        if (isFuture) return;
                        handleCellMouseEnter(key);
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
            Click or drag to select · Start drag on a selected cell to deselect
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
            Color intensity reflects transaction volume — darker cells have more
            transactions
          </p>
        </div>
        <div className="flex-col items-center justify-center mt-2 w-full">
          <div className="mb-2 px-4 text-xs text-gray-600 dark:text-gray-400">
            Click on a category to hide/show it in the chart
          </div>
          <Accordion type="single" collapsible>
            {allChartData.map((item, index) => {
              const isHidden = hiddenCategories.has(item.category);
              const filteredData = processedData.filter(
                (entry) => entry.Category === item.category,
              );

              const descriptionsRaw: Record<
                string,
                { display: string; total: number }
              > = {};
              filteredData.forEach((entry) => {
                if (entry.Description && entry.Amount) {
                  const display = normalizeDescription(entry.Description);
                  const key = display.toLowerCase();
                  if (!descriptionsRaw[key]) {
                    descriptionsRaw[key] = { display, total: 0 };
                  }
                  descriptionsRaw[key].total += entry.Amount;
                }
              });
              const descriptions = Object.fromEntries(
                Object.values(descriptionsRaw).map(({ display, total }) => [
                  display,
                  total,
                ]),
              );

              return (
                <AccordionItem
                  key={item.category}
                  value={item.category}
                  className={isHidden ? "opacity-40" : ""}
                >
                  <AccordionTrigger
                    onClick={(e) => {
                      // Check if click was on the chevron or expand area
                      const target = e.target as HTMLElement;
                      if (target.closest("[data-toggle-category]")) {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleCategoryVisibility(item.category);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div
                        data-toggle-category
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleCategoryVisibility(item.category);
                        }}
                        className="flex-shrink-0 w-4 h-4 border-2 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        title={isHidden ? "Show category" : "Hide category"}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleCategoryVisibility(item.category);
                          }
                        }}
                      >
                        {!isHidden && (
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className={isHidden ? "line-through" : ""}>
                        {index + 1}. {item.category} -{" "}
                        <span
                          className={
                            categoryColorMap.get(item.category)
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {formatCurrency(item.total)}
                        </span>
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-4 text-xs space-y-2">
                      {item.category ===
                      `Minor expenses (${minorExpensesThreshold}%)`
                        ? // For Minor expenses, stack category and description vertically on the left, amount on the right
                          Object.entries(
                            // Group transactions by category first
                            sortedCategories
                              .filter(
                                (cat) =>
                                  cat.total / totalSum <=
                                  minorExpensesThreshold / 100,
                              )
                              .reduce(
                                (categoryGroups, cat) => {
                                  // Get transactions for this category
                                  const catTransactions = processedData.filter(
                                    (entry) => entry.Category === cat.category,
                                  );

                                  // Group transactions by description within each category
                                  catTransactions.forEach((entry) => {
                                    if (
                                      entry.Description &&
                                      entry.Amount &&
                                      entry.Category
                                    ) {
                                      // Use a composite key that can be parsed later
                                      const key = `${entry.Category}|||${entry.Description}`;
                                      categoryGroups[key] =
                                        (categoryGroups[key] || 0) +
                                        entry.Amount;
                                    }
                                  });

                                  return categoryGroups;
                                },
                                {} as Record<string, number>,
                              ),
                          )
                            .sort(([, sumA], [, sumB]) => sumB - sumA) // Sort by amount in descending order
                            .map(([combinedKey, sum]) => {
                              // Split the combined key back into category and description
                              const [category, description] =
                                combinedKey.split("|||");

                              return (
                                <li
                                  key={combinedKey}
                                  className="flex justify-between hover:bg-gray-100 hover:rounded-md px-2 py-1"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-700">
                                      {category}
                                    </span>
                                    <span className="text-gray-600 text-xs">
                                      {description}
                                    </span>
                                  </div>
                                  <span
                                    className={`pl-2 whitespace-nowrap font-medium ${
                                      sum >= 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                                  >
                                    {formatCurrency(Math.abs(sum))}
                                  </span>
                                </li>
                              );
                            })
                        : // Default behavior for other categories
                          Object.entries(descriptions)
                            .sort(([, sumA], [, sumB]) => sumB - sumA) // Sort by sum in descending order
                            .map(([description, sum]) => (
                              <li
                                key={description}
                                className="flex justify-between hover:bg-gray-100 hover:rounded-md px-2 py-1"
                              >
                                <span>{description}</span>
                                <span
                                  className={`font-medium ${
                                    sum >= 0
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {formatCurrency(Math.abs(sum))}
                                </span>
                              </li>
                            ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total amounts per category
        </div>
      </CardFooter>
    </Card>
  );
}
