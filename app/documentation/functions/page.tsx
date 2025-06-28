"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/protected-route";

interface FunctionData {
  defined: string[];
  called: string[];
  both: string[];
}

interface ReportData {
  [fileName: string]: FunctionData;
}

export default function FunctionAnalysisPage() {
  const [availableReports, setAvailableReports] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Load available report files on component mount
  useEffect(() => {
    loadAvailableReports();
  }, []);

  const loadAvailableReports = async () => {
    try {
      const response = await fetch("/api/function-reports");
      if (response.ok) {
        const reports = await response.json();
        setAvailableReports(reports);
      } else {
        setError("Failed to load available reports");
      }
    } catch (err) {
      setError("Error loading reports list");
      console.error("Error loading reports:", err);
    }
  };

  const loadReportData = async (reportFileName: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/function-reports/${reportFileName}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        setError("Failed to load report data");
      }
    } catch (err) {
      setError("Error loading report data");
      console.error("Error loading report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelection = (reportFileName: string) => {
    setSelectedReport(reportFileName);
    loadReportData(reportFileName);
  };

  // Get all unique functions across all files
  const getAllFunctions = (): string[] => {
    if (!reportData) return [];

    const allFunctions = new Set<string>();
    Object.values(reportData).forEach((fileData) => {
      fileData.defined.forEach((func) => allFunctions.add(func));
      fileData.called.forEach((func) => allFunctions.add(func));
    });

    return Array.from(allFunctions).sort();
  };

  // Get cell content for function-file intersection
  const getCellContent = (functionName: string, fileName: string): string => {
    if (!reportData || !reportData[fileName]) return "";

    const fileData = reportData[fileName];
    const isDefined = fileData.defined.includes(functionName);
    const isCalled = fileData.called.includes(functionName);

    if (isDefined && isCalled) return "D/C";
    if (isDefined) return "D";
    if (isCalled) return "C";
    return "";
  };

  // Get cell styling based on content
  const getCellStyle = (content: string): string => {
    switch (content) {
      case "D":
        return "bg-blue-100 text-blue-800 font-semibold";
      case "C":
        return "bg-green-100 text-green-800 font-semibold";
      case "D/C":
        return "bg-purple-100 text-purple-800 font-semibold";
      default:
        return "bg-gray-50";
    }
  };

  const allFunctions = getAllFunctions();
  const fileNames = reportData ? Object.keys(reportData).sort() : [];

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Function Analysis Dashboard
            </CardTitle>
            <p className="text-gray-600">
              Analyze function definitions and calls across your codebase
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Report Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Report:</label>
              <Select onValueChange={handleReportSelection}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a function report..." />
                </SelectTrigger>
                <SelectContent>
                  {availableReports.map((report) => (
                    <SelectItem key={report} value={report}>
                      {report}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <Button onClick={loadAvailableReports} variant="outline">
              Refresh Reports List
            </Button>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading report data...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        {reportData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">D</Badge>
                  <span>
                    Function is <strong>Defined</strong> in this file
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">C</Badge>
                  <span>
                    Function is <strong>Called</strong> in this file
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">D/C</Badge>
                  <span>
                    Function is both <strong>Defined and Called</strong> in this
                    file
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Function Analysis Table */}
        {reportData && allFunctions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Function Analysis Matrix
                <span className="text-sm font-normal ml-2 text-gray-600">
                  ({allFunctions.length} functions across {fileNames.length}{" "}
                  files)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold sticky left-0 bg-gray-100 z-10 min-w-[200px]">
                        Function Name
                      </th>
                      {fileNames.map((fileName) => (
                        <th
                          key={fileName}
                          className="border border-gray-300 px-2 py-2 text-center font-semibold min-w-[120px] max-w-[150px]"
                        >
                          <div className="transform -rotate-45 origin-bottom-left text-xs">
                            {fileName.replace(/\.tsx?$/, "")}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allFunctions.map((functionName, index) => (
                      <tr
                        key={functionName}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-300 px-3 py-2 font-medium sticky left-0 bg-inherit z-10">
                          <code className="text-sm">{functionName}</code>
                        </td>
                        {fileNames.map((fileName) => {
                          const content = getCellContent(
                            functionName,
                            fileName,
                          );
                          return (
                            <td
                              key={`${functionName}-${fileName}`}
                              className={`border border-gray-300 px-2 py-2 text-center text-sm ${getCellStyle(content)}`}
                            >
                              {content}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Statistics */}
        {reportData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {Object.values(reportData).reduce(
                      (sum, file) => sum + file.defined.length,
                      0,
                    )}
                  </div>
                  <div className="text-sm text-blue-600">
                    Total Functions Defined
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {Object.values(reportData).reduce(
                      (sum, file) => sum + file.called.length,
                      0,
                    )}
                  </div>
                  <div className="text-sm text-green-600">
                    Total Function Calls
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">
                    {Object.values(reportData).reduce(
                      (sum, file) => sum + file.both.length,
                      0,
                    )}
                  </div>
                  <div className="text-sm text-purple-600">
                    Functions Both Defined & Called
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
