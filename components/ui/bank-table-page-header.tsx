"use client";

import { Button } from "@/components/ui/button";

interface ChartButton {
  url: string;
  text: string;
  className?: string;
}

interface BankTablePageHeaderProps {
  title: string;
  updateButtonComponent?: React.ReactNode;
  downloadUrl?: string;
  downloadButtonText?: string;
  chartUrl?: string;
  chartButtonText?: string;
  chartButtons?: ChartButton[];
  layout?: "right-aligned" | "split";
  className?: string;
}

export default function BankTablePageHeader({
  title,
  updateButtonComponent,
  downloadUrl,
  downloadButtonText = "Download Invoice",
  chartUrl,
  chartButtonText = "Go to Chart Page",
  chartButtons = [],
  layout = "right-aligned",
  className = "",
}: BankTablePageHeaderProps) {
  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  const handleNavigateToChart = (url: string) => {
    window.location.href = url;
  };

  // Combine single chart button with multiple chart buttons
  const allChartButtons = [
    ...chartButtons,
    ...(chartUrl ? [{ url: chartUrl, text: chartButtonText }] : []),
  ];

  if (layout === "split") {
    return (
      <div className={`mb-6 ${className}`}>
        <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>

        <div className="flex justify-between items-center mb-4">
          <div>{updateButtonComponent}</div>
          <div className="flex space-x-4">
            {downloadUrl && (
              <Button
                onClick={handleDownload}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-green-300"
              >
                {downloadButtonText}
              </Button>
            )}

            {allChartButtons.map((button, index) => (
              <Button
                key={index}
                onClick={() => handleNavigateToChart(button.url)}
                className={
                  button.className ||
                  "px-4 py-2 bg-black text-white rounded-md hover:bg-green-700 border border-green-500"
                }
              >
                {button.text}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default right-aligned layout
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

        {allChartButtons.map((button, index) => (
          <Button
            key={index}
            onClick={() => handleNavigateToChart(button.url)}
            className={
              button.className ||
              "px-4 py-2 bg-black text-white rounded-md hover:bg-green-700 border border-green-500"
            }
          >
            {button.text}
          </Button>
        ))}
      </div>
    </div>
  );
}
