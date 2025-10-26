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
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Transaction } from "@/types/transaction";

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
  // Get current month (1-12)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12

  // State for the minor expenses threshold (default to 1.0%)
  const [minorExpensesThreshold, setMinorExpensesThreshold] = useState(1.0);
  // State for the month range filter (default from January to current month)
  const [monthRange, setMonthRange] = useState<[number, number]>([
    1,
    currentMonth,
  ]);
  // State for hidden categories
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(
    new Set(),
  );

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

  // Filter data by month range first
  const dateFilteredData = data.filter((transaction) => {
    if (!transaction.Date) return true; // Include transactions without date

    try {
      // Parse the date and get the month (1-12)
      const transactionDate = new Date(transaction.Date);

      // Check if the date is valid
      if (isNaN(transactionDate.getTime())) {
        console.log("Invalid date format:", transaction.Date);
        return true; // Include transactions with invalid dates
      }

      const transactionMonth = transactionDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12

      // Debug log to see what's happening with dates
      if (transaction.Category) {
        console.log(
          `Transaction: ${transaction.Category}, Date: ${
            transaction.Date
          }, Month: ${transactionMonth}, In Range: ${
            transactionMonth >= monthRange[0] &&
            transactionMonth <= monthRange[1]
          }`,
        );
      }

      // Check if the month is within the selected range
      return (
        transactionMonth >= monthRange[0] && transactionMonth <= monthRange[1]
      );
    } catch (error) {
      console.error("Error parsing date:", transaction.Date, error);
      return true; // Include transactions with problematic dates
    }
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

  // Keep track of original signed values for color coding
  const signedTotals = { ...totals };

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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Month Range: {monthNames[monthRange[0] - 1]} -{" "}
            {monthNames[monthRange[1] - 1]}
          </label>
          <Slider
            defaultValue={monthRange}
            min={1}
            max={12}
            step={1}
            value={monthRange}
            onValueChange={(value) => setMonthRange([value[0], value[1]])}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
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

              const descriptions = filteredData.reduce(
                (acc, entry) => {
                  if (entry.Description && entry.Amount) {
                    acc[entry.Description] =
                      (acc[entry.Description] || 0) + entry.Amount;
                  }
                  return acc;
                },
                {} as Record<string, number>,
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
                      <button
                        data-toggle-category
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleCategoryVisibility(item.category);
                        }}
                        className="flex-shrink-0 w-4 h-4 border-2 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                        title={isHidden ? "Show category" : "Hide category"}
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
                      </button>
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
