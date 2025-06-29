"use client";

import { useAmexChartTransactions } from "../../../lib/hooks/useTransactions";
import { usePageState } from "../../../lib/hooks/usePageState";
import { CustomBarChart } from "@/components/ui/custombarchart";
import ProtectedRoute from "@/components/protected-route";

export default function CategoryChartPage() {
  const { transactions, loading, error, user } = useAmexChartTransactions();
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="pt-8 pb-8">
          <CustomBarChart
            // data={transactions} // Pass raw transaction data
            data={transactions.filter(
              (t) =>
                !(
                  t.Category === "Amex Invoice" ||
                  t.Category === "SEB SJ Prio Invoice" ||
                  t.Category === "Investment" ||
                  t.Category === "Sek to Reais" ||
                  t.Category === "SJ PRIO MASTER Invoice" ||
                  t.Category === "Income - Salary" ||
                  t.Category === "Income - Skat"
                ),
            )}
            // height={400}
            barColor="hsl(var(--chart-1))"
            title="Total Amount per Category"
            description="Showing totals for American Express transactions"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
