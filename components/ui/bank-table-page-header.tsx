"use client";

import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useState } from "react";

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
  // New props for Inter Account page features
  showInfoButton?: boolean;
  infoButtonUrl?: string;
  infoButtonText?: string;
  dataSourceComponent?: React.ReactNode;
  additionalUpdateButtons?: React.ReactNode[];
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
  // New props
  showInfoButton = false,
  infoButtonUrl,
  infoButtonText = "Page Info & Component Guide",
  dataSourceComponent,
  additionalUpdateButtons = [],
}: BankTablePageHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  const handleNavigateToChart = (url: string) => {
    window.location.href = url;
  };

  const handleInfoButton = () => {
    if (infoButtonUrl) {
      window.location.href = infoButtonUrl;
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Combine single chart button with multiple chart buttons
  const allChartButtons = [
    ...chartButtons,
    ...(chartUrl ? [{ url: chartUrl, text: chartButtonText }] : []),
  ];

  // Combine all update buttons
  const allUpdateButtons = [
    updateButtonComponent,
    ...additionalUpdateButtons,
  ].filter(Boolean);

  if (layout === "split") {
    return (
      <div className={`mb-6 ${className}`}>
        {/* Clickable title header */}
        <div
          className="flex items-center justify-center cursor-pointer p-2 rounded-md transition-colors"
          onClick={toggleExpanded}
        >
          <h1 className="text-2xl font-bold text-center">{title}</h1>
        </div>

        {/* Collapsible content */}
        {isExpanded && (
          <div className="mt-6">
            {/* Info button */}
            {showInfoButton && infoButtonUrl && (
              <div className="flex justify-center mb-4">
                <Button
                  onClick={handleInfoButton}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 border border-gray-500 flex items-center gap-2"
                >
                  <Info size={16} />
                  {infoButtonText}
                </Button>
              </div>
            )}

            {/* Data Source Information */}
            {dataSourceComponent && (
              <div className="mb-4">{dataSourceComponent}</div>
            )}

            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-3">
                {allUpdateButtons.map((button, index) => (
                  <div key={index}>{button}</div>
                ))}
              </div>
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
        )}
      </div>
    );
  }

  // Default right-aligned layout
  return (
    <div className={`mb-6 ${className}`}>
      {/* Clickable title header */}
      <div
        className="flex items-center justify-center cursor-pointer p-2 rounded-md transition-colors"
        onClick={toggleExpanded}
      >
        <h1 className="text-2xl font-bold text-center">{title}</h1>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="mt-6">
          {/* Info button */}
          {showInfoButton && infoButtonUrl && (
            <div className="flex justify-center mb-4">
              <Button
                onClick={handleInfoButton}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 border border-gray-500 flex items-center gap-2"
              >
                <Info size={16} />
                {infoButtonText}
              </Button>
            </div>
          )}

          {/* Data Source Information */}
          {dataSourceComponent && (
            <div className="mb-4">{dataSourceComponent}</div>
          )}

          <div className="text-right mb-4 flex justify-end gap-3">
            {allUpdateButtons.map((button, index) => (
              <div key={index}>{button}</div>
            ))}

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
      )}
    </div>
  );
}
