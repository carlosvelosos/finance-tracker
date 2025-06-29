"use client";

import { useHandelsbankenOverviewChartTransactions } from "../../../../lib/hooks/useTransactions";
import { usePageState } from "../../../../lib/hooks/usePageState";
import { CustomBarChart } from "@/components/ui/custombarchart";
import { TransactionLineChart } from "@/components/ui/bank-line-chart";
import ProtectedRoute from "@/components/protected-route";

export default function CategoryChartPage() {
  const { transactions, loading, error, user } =
    useHandelsbankenOverviewChartTransactions();
  const { renderContent } = usePageState({
    loading,
    error: error as unknown,
    user,
  });

  // Return early if not ready
  const earlyReturn = renderContent();
  if (earlyReturn) return earlyReturn;

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="flex flex-col items-center justify-center min-h-screen space-y-50">
        <div className="pt-20 w-full max-w-7xl">
          <TransactionLineChart
            transactions={transactions}
            title="Handelsbanken Cumulative Flow"
            description="" //"Showing cumulative income and expenses over time"
            className="border-none bg-transparent shadow-none"
          />
        </div>

        <div className="pb-8 w-full max-w-5xl">
          <CustomBarChart
            data={transactions}
            barColor="hsl(var(--chart-1))"
            title="Total Amount per Category"
            description="Showing totals for Handelsbanken transactions"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
