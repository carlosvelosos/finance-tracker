"use client";

import { Button } from "@/components/ui/button";

interface BankTablePageHeaderProps {
  title: string;
  updateButtonComponent?: React.ReactNode;
  downloadUrl?: string;
  downloadButtonText?: string;
  chartUrl?: string;
  chartButtonText?: string;
  className?: string;
}

export default function BankTablePageHeader({
  title,
  updateButtonComponent,
  downloadUrl,
  downloadButtonText = "Download Invoice",
  chartUrl,
  chartButtonText = "Go to Chart Page",
  className = "",
}: BankTablePageHeaderProps) {
  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  const handleNavigateToChart = () => {
    if (chartUrl) {
      window.location.href = chartUrl;
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>

      <div className="text-right mb-4 flex justify-end gap-3">
        {updateButtonComponent}

        {downloadUrl && (
          <Button
            onClick={handleDownload}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-green-300"
          >
            {downloadButtonText}
          </Button>
        )}

        {chartUrl && (
          <Button
            onClick={handleNavigateToChart}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-green-700 border border-green-500"
          >
            {chartButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
