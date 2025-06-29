"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Filter } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";

interface FunctionData {
  defined: string[];
  called: string[];
  both: string[];
  imports?: Record<string, any>;
  calledWithImports?: Record<string, any>;
}

interface ReportData {
  [fileName: string]: FunctionData;
}

type SortDirection = "asc" | "desc" | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

interface ColumnFilter {
  [fileName: string]: Set<string>; // Set of visible values for each column (including "type" column)
}

export default function FunctionAnalysisPage() {
  const [availableReports, setAvailableReports] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFilter>({});

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

  // Get all unique functions across all files with filtering and sorting
  const getAllFunctions = (): string[] => {
    if (!reportData) return [];

    const allFunctions = new Set<string>();
    Object.values(reportData).forEach((fileData) => {
      fileData.defined.forEach((func) => allFunctions.add(func));
      fileData.called.forEach((func) => allFunctions.add(func));
    });

    return Array.from(allFunctions).sort();
  };

  // Get filtered file names (now just returns all files since we removed file filter)
  const getFilteredFileNames = (): string[] => {
    if (!reportData) return [];
    return Object.keys(reportData).sort();
  };

  // Get unique cell values for a specific file column
  const getUniqueValuesInFile = (fileName: string): string[] => {
    if (!reportData || !reportData[fileName]) return [];

    const allFunctions = getAllFunctions();
    const uniqueValues = new Set<string>();

    allFunctions.forEach((functionName) => {
      const cellContent = getCellContent(functionName, fileName);
      uniqueValues.add(cellContent); // Add the content (which could be empty string)
    });

    return Array.from(uniqueValues).sort((a, b) => {
      // Sort empty values last
      if (a === "" && b !== "") return 1;
      if (a !== "" && b === "") return -1;
      return a.localeCompare(b);
    });
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

  // Get count of each cell value for a specific file column
  const getCellValueCounts = (fileName: string): Record<string, number> => {
    if (!reportData || !reportData[fileName]) return {};

    const allFunctions = getAllFunctions();
    const counts: Record<string, number> = {};

    allFunctions.forEach((functionName) => {
      const cellContent = getCellContent(functionName, fileName);
      counts[cellContent] = (counts[cellContent] || 0) + 1;
    });

    return counts;
  };

  // Initialize column filters when report data changes
  useEffect(() => {
    if (reportData) {
      const newColumnFilters: ColumnFilter = {};

      // Initialize filters for file columns
      Object.keys(reportData).forEach((fileName) => {
        const uniqueValues = getUniqueValuesInFile(fileName);
        newColumnFilters[fileName] = new Set(uniqueValues);
      });

      // Initialize filter for Type column
      const uniqueTypes = getUniqueTypes();
      newColumnFilters["type"] = new Set(uniqueTypes);

      setColumnFilters(newColumnFilters);
    }
  }, [reportData]);

  // Handle column filter changes for cell values
  const handleColumnFilterChange = (
    fileName: string,
    cellValue: string,
    checked: boolean,
  ) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      const currentSet = new Set(prev[fileName] || []);

      if (checked) {
        currentSet.add(cellValue);
      } else {
        currentSet.delete(cellValue);
      }

      newFilters[fileName] = currentSet;
      return newFilters;
    });
  };

  // Handle select all/none for a column
  const handleColumnFilterSelectAll = (
    fileName: string,
    selectAll: boolean,
  ) => {
    if (fileName === "type") {
      const uniqueTypes = getUniqueTypes();
      setColumnFilters((prev) => ({
        ...prev,
        [fileName]: selectAll ? new Set(uniqueTypes) : new Set(),
      }));
    } else {
      const uniqueValues = getUniqueValuesInFile(fileName);
      setColumnFilters((prev) => ({
        ...prev,
        [fileName]: selectAll ? new Set(uniqueValues) : new Set(),
      }));
    }
  };

  // Get function type based on import information
  const getFunctionType = (functionName: string): string => {
    if (!reportData) return "unknown";

    // Check across all files to find the most specific type for this function
    let mostSpecificType = "unknown";

    Object.values(reportData).forEach((fileData) => {
      // Check if it's defined locally in any file
      if (fileData.defined && fileData.defined.includes(functionName)) {
        mostSpecificType = "local";
      }

      // Check imports for more specific type information
      if (
        fileData.calledWithImports &&
        fileData.calledWithImports[functionName]
      ) {
        const importInfo = fileData.calledWithImports[functionName];
        if (importInfo.type && importInfo.type !== "unknown") {
          mostSpecificType = importInfo.type;
        }
      }
    });

    return mostSpecificType;
  };

  // Get unique types for the Type column
  const getUniqueTypes = (): string[] => {
    if (!reportData) return [];

    const types = new Set<string>();
    const allFunctions = getAllFunctions();

    allFunctions.forEach((functionName) => {
      const type = getFunctionType(functionName);
      types.add(type);
    });

    return Array.from(types).sort();
  };

  // Get filtered and sorted functions
  const getFilteredFunctions = useMemo((): string[] => {
    const allFunctions = getAllFunctions();
    let filtered = allFunctions;

    // Apply column filters - hide functions that don't match ALL active column filters
    if (Object.keys(columnFilters).length > 0) {
      filtered = filtered.filter((functionName) => {
        const filteredFileNames = getFilteredFileNames();

        // Check file columns
        const passesFileFilters = filteredFileNames.every((fileName) => {
          const cellContent = getCellContent(functionName, fileName);
          const columnFilter = columnFilters[fileName];

          // If no filter is set for this column, or all values are selected, show the function
          if (!columnFilter || columnFilter.size === 0) {
            const uniqueValues = getUniqueValuesInFile(fileName);
            return uniqueValues.length === 0 || true; // No filter = show all
          }

          // If all unique values are selected, treat as no filter
          const uniqueValues = getUniqueValuesInFile(fileName);
          if (columnFilter.size === uniqueValues.length) {
            return true; // All values selected = show all
          }

          // Check if this specific cell content is visible based on the filter
          return columnFilter.has(cellContent);
        });

        // Check Type column filter
        const typeFilter = columnFilters["type"];
        const functionType = getFunctionType(functionName);
        const passesTypeFilter =
          !typeFilter ||
          typeFilter.size === 0 ||
          typeFilter.size === getUniqueTypes().length ||
          typeFilter.has(functionType);

        return passesFileFilters && passesTypeFilter;
      });
    }

    // Apply sorting
    if (sortState.column && sortState.direction) {
      if (sortState.column === "function") {
        filtered = filtered.sort((a, b) => {
          const comparison = a.localeCompare(b);
          return sortState.direction === "asc" ? comparison : -comparison;
        });
      } else {
        // Sort by file column (count of D, C, or D/C in that file)
        const fileName = sortState.column;
        if (reportData && reportData[fileName]) {
          filtered = filtered.sort((a, b) => {
            const aContent = getCellContent(a, fileName);
            const bContent = getCellContent(b, fileName);

            // Sort order: D/C > D > C > empty
            const getWeight = (content: string) => {
              switch (content) {
                case "D/C":
                  return 4;
                case "D":
                  return 3;
                case "C":
                  return 2;
                default:
                  return 1;
              }
            };

            const comparison = getWeight(aContent) - getWeight(bContent);
            return sortState.direction === "asc" ? comparison : -comparison;
          });
        }
      }
    }

    return filtered;
  }, [reportData, sortState, columnFilters]);

  // Handle column header click for sorting
  const handleSort = (column: string) => {
    setSortState((prev) => {
      if (prev.column === column) {
        // Cycle through: asc -> desc -> null
        const newDirection: SortDirection =
          prev.direction === "asc"
            ? "desc"
            : prev.direction === "desc"
              ? null
              : "asc";
        return {
          column: newDirection ? column : null,
          direction: newDirection,
        };
      } else {
        return { column, direction: "asc" };
      }
    });
  };

  // Get sort indicator for column headers
  const getSortIndicator = (column: string): string => {
    if (sortState.column !== column) return "↕️";
    return sortState.direction === "asc" ? "↑" : "↓";
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
  const filteredFunctions = getFilteredFunctions;
  const filteredFileNames = getFilteredFileNames();

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
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-gray-100 text-gray-600"
                  >
                    —
                  </Badge>
                  <span>
                    <strong>No relationship</strong> - function not used in this
                    file
                  </span>
                </div>
              </div>

              {/* Type Column Legend */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Function Types (Import Sources):
                </h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300 text-xs"
                    >
                      npm
                    </Badge>
                    <span className="text-sm">External npm package import</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 border-blue-300 text-xs"
                    >
                      local
                    </Badge>
                    <span className="text-sm">
                      Function defined locally in project
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-purple-100 text-purple-800 border-purple-300 text-xs"
                    >
                      alias
                    </Badge>
                    <span className="text-sm">
                      Import using path alias (e.g., @/)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs"
                    >
                      relative
                    </Badge>
                    <span className="text-sm">
                      Relative path import (e.g., ../)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-600 border-gray-300 text-xs"
                    >
                      unknown
                    </Badge>
                    <span className="text-sm">
                      Import source could not be determined
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">
                    💡 <strong>Tip:</strong> Click column headers to sort
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600 text-sm">
                    <strong>Column Filters:</strong> Use filter buttons in
                    headers to show/hide specific relationship types (D, C, D/C)
                    per file
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Function Analysis Table */}
        {reportData && filteredFunctions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Function Analysis Matrix
                  <span className="text-sm font-normal ml-2 text-gray-600">
                    ({filteredFunctions.length} functions across{" "}
                    {filteredFileNames.length} files)
                  </span>
                </CardTitle>

                {/* Clear filters button */}
                {Object.values(columnFilters).some((filterSet) => {
                  // Check if any column has fewer selected items than total unique values
                  const fileName = Object.keys(columnFilters).find(
                    (key) => columnFilters[key] === filterSet,
                  );
                  if (!fileName) return false;
                  const uniqueValues = getUniqueValuesInFile(fileName);
                  return filterSet.size < uniqueValues.length;
                }) && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSortState({ column: null, direction: null });
                        // Reset all column filters to show all
                        if (reportData) {
                          const resetFilters: ColumnFilter = {};
                          Object.keys(reportData).forEach((fileName) => {
                            const uniqueValues =
                              getUniqueValuesInFile(fileName);
                            resetFilters[fileName] = new Set(uniqueValues);
                          });
                          // Reset Type column filter
                          const uniqueTypes = getUniqueTypes();
                          resetFilters["type"] = new Set(uniqueTypes);
                          setColumnFilters(resetFilters);
                        }
                      }}
                      className="text-xs"
                    >
                      Clear All Filters
                    </Button>
                    {sortState.column && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSortState({ column: null, direction: null })
                        }
                        className="text-xs"
                      >
                        Clear Sort
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Filter summary */}
              {Object.entries(columnFilters).some(([fileName, filterSet]) => {
                const uniqueValues = getUniqueValuesInFile(fileName);
                return filterSet.size < uniqueValues.length;
              }) && (
                <div className="text-sm text-blue-600 mt-2">
                  ⚡ Column filters active - showing {filteredFunctions.length}{" "}
                  of {allFunctions.length} functions
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-white border-b-2 border-gray-200">
                      <th
                        className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-900 sticky left-0 bg-white z-10 min-w-[200px] cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("function")}
                        title="Click to sort by function name"
                      >
                        <div className="flex items-center justify-between">
                          <span>Function Name</span>
                          <span className="text-xs">
                            {getSortIndicator("function")}
                          </span>
                        </div>
                      </th>

                      {/* Type Column */}
                      <th
                        className="border-r border-gray-200 px-3 py-3 text-center font-medium text-gray-700 min-w-[120px] bg-white relative cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("type")}
                        title="Click to sort by function type"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className="cursor-pointer hover:bg-gray-50 transition-colors duration-150 p-1 rounded flex items-center justify-between w-full">
                            <div className="flex-1">
                              <div className="text-sm truncate">
                                Type
                                {(() => {
                                  const uniqueTypes = getUniqueTypes();
                                  const selectedCount =
                                    columnFilters["type"]?.size ||
                                    uniqueTypes.length;
                                  const hasActiveFilter =
                                    selectedCount < uniqueTypes.length;
                                  return hasActiveFilter ? (
                                    <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded">
                                      {selectedCount}/{uniqueTypes.length}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Import Source
                              </div>
                            </div>
                            <div className="text-xs ml-1">
                              {getSortIndicator("type")}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 w-6 p-0 transition-colors ${(() => {
                                  const uniqueTypes = getUniqueTypes();
                                  const selectedCount =
                                    columnFilters["type"]?.size ||
                                    uniqueTypes.length;
                                  const hasActiveFilter =
                                    selectedCount < uniqueTypes.length;
                                  return hasActiveFilter
                                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                    : "text-gray-400 hover:text-gray-600";
                                })()}`}
                                title="Filter by type"
                              >
                                <Filter className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 max-h-96 overflow-y-auto">
                              <div className="p-2 border-b">
                                <div className="text-sm font-medium mb-2">
                                  Filter by Type
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleColumnFilterSelectAll("type", true)
                                    }
                                    className="text-xs h-7"
                                  >
                                    Select All
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleColumnFilterSelectAll("type", false)
                                    }
                                    className="text-xs h-7"
                                  >
                                    Select None
                                  </Button>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {(() => {
                                    const uniqueTypes = getUniqueTypes();
                                    const selectedCount =
                                      columnFilters["type"]?.size ||
                                      uniqueTypes.length;
                                    return `${selectedCount} of ${uniqueTypes.length} selected`;
                                  })()}
                                </div>
                              </div>

                              {getUniqueTypes().map((typeValue) => {
                                const isChecked =
                                  columnFilters["type"]?.has(typeValue) ?? true;
                                const typeCount = getAllFunctions().filter(
                                  (fn) => getFunctionType(fn) === typeValue,
                                ).length;

                                return (
                                  <DropdownMenuCheckboxItem
                                    key={typeValue}
                                    checked={isChecked}
                                    onCheckedChange={(checked) =>
                                      handleColumnFilterChange(
                                        "type",
                                        typeValue,
                                        checked,
                                      )
                                    }
                                    className="text-sm"
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium capitalize">
                                          {typeValue}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          ({typeCount})
                                        </span>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={`ml-2 text-xs h-5 ${
                                          typeValue === "npm"
                                            ? "bg-green-100 text-green-800"
                                            : typeValue === "local"
                                              ? "bg-blue-100 text-blue-800"
                                              : typeValue === "alias"
                                                ? "bg-purple-100 text-purple-800"
                                                : typeValue === "relative"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        {typeValue}
                                      </Badge>
                                    </div>
                                  </DropdownMenuCheckboxItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </th>
                      {filteredFileNames.map(
                        (fileName: string, index: number) => {
                          const uniqueValues = getUniqueValuesInFile(fileName);
                          const selectedCount =
                            columnFilters[fileName]?.size ||
                            uniqueValues.length;
                          const hasActiveFilter =
                            selectedCount < uniqueValues.length;

                          return (
                            <th
                              key={fileName}
                              className="border-r border-gray-200 px-3 py-3 text-center font-medium text-gray-700 min-w-[120px] bg-white relative"
                              title={`${fileName} (Column ${index + 1})`}
                            >
                              <div className="flex flex-col items-center space-y-2">
                                <div
                                  className="cursor-pointer hover:bg-gray-50 transition-colors duration-150 p-1 rounded flex items-center justify-between w-full"
                                  onClick={() => handleSort(fileName)}
                                >
                                  <div className="flex-1">
                                    <div className="text-sm truncate">
                                      {fileName.replace(/\.(tsx?|js)$/, "")}
                                      {hasActiveFilter && (
                                        <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded">
                                          {selectedCount}/{uniqueValues.length}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 font-mono">
                                      .{fileName.split(".").pop()}
                                    </div>
                                  </div>
                                  <div className="text-xs ml-1">
                                    {getSortIndicator(fileName)}
                                  </div>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-6 w-6 p-0 transition-colors ${
                                        hasActiveFilter
                                          ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                          : "text-gray-400 hover:text-gray-600"
                                      }`}
                                      title={`Filter column${hasActiveFilter ? " (filtered)" : ""}`}
                                    >
                                      <Filter className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-48 max-h-96 overflow-y-auto">
                                    <div className="p-2 border-b">
                                      <div className="text-sm font-medium mb-2">
                                        Filter {fileName}
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleColumnFilterSelectAll(
                                              fileName,
                                              true,
                                            )
                                          }
                                          className="text-xs h-7"
                                        >
                                          Select All
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleColumnFilterSelectAll(
                                              fileName,
                                              false,
                                            )
                                          }
                                          className="text-xs h-7"
                                        >
                                          Select None
                                        </Button>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {selectedCount} of {uniqueValues.length}{" "}
                                        selected
                                      </div>
                                    </div>

                                    {uniqueValues.map((cellValue) => {
                                      const isChecked =
                                        columnFilters[fileName]?.has(
                                          cellValue,
                                        ) ?? true;
                                      const cellCounts =
                                        getCellValueCounts(fileName);
                                      const count = cellCounts[cellValue] || 0;

                                      return (
                                        <DropdownMenuCheckboxItem
                                          key={cellValue || "empty"}
                                          checked={isChecked}
                                          onCheckedChange={(checked) =>
                                            handleColumnFilterChange(
                                              fileName,
                                              cellValue,
                                              checked,
                                            )
                                          }
                                          className="text-sm"
                                        >
                                          <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">
                                                {cellValue === "D" &&
                                                  "Defined (D)"}
                                                {cellValue === "C" &&
                                                  "Called (C)"}
                                                {cellValue === "D/C" &&
                                                  "Defined & Called (D/C)"}
                                                {cellValue === "" &&
                                                  "No Relationship (Empty)"}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                ({count})
                                              </span>
                                            </div>
                                            <Badge
                                              variant="outline"
                                              className={`ml-2 text-xs h-5 ${
                                                cellValue === "D"
                                                  ? "bg-blue-100 text-blue-800"
                                                  : cellValue === "C"
                                                    ? "bg-green-100 text-green-800"
                                                    : cellValue === "D/C"
                                                      ? "bg-purple-100 text-purple-800"
                                                      : "bg-gray-100 text-gray-600"
                                              }`}
                                            >
                                              {cellValue || "—"}
                                            </Badge>
                                          </div>
                                        </DropdownMenuCheckboxItem>
                                      );
                                    })}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </th>
                          );
                        },
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFunctions.map(
                      (functionName: string, index: number) => (
                        <tr
                          key={functionName}
                          className={
                            index % 2 === 0
                              ? "bg-white hover:bg-gray-50"
                              : "bg-gray-50/50 hover:bg-gray-100"
                          }
                        >
                          <td className="border-r border-gray-200 px-4 py-3 font-medium sticky left-0 bg-inherit z-10 border-b border-gray-200">
                            <code className="text-sm text-gray-800">
                              {functionName}
                            </code>
                          </td>

                          {/* Type Column Data */}
                          <td className="border-r border-b border-gray-200 px-3 py-3 text-center text-sm">
                            {(() => {
                              const functionType =
                                getFunctionType(functionName);
                              return (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    functionType === "npm"
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : functionType === "local"
                                        ? "bg-blue-100 text-blue-800 border-blue-300"
                                        : functionType === "alias"
                                          ? "bg-purple-100 text-purple-800 border-purple-300"
                                          : functionType === "relative"
                                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                            : "bg-gray-100 text-gray-600 border-gray-300"
                                  }`}
                                >
                                  {functionType}
                                </Badge>
                              );
                            })()}
                          </td>
                          {filteredFileNames.map((fileName: string) => {
                            const content = getCellContent(
                              functionName,
                              fileName,
                            );

                            return (
                              <td
                                key={`${functionName}-${fileName}`}
                                className={`border-r border-b border-gray-200 px-3 py-3 text-center text-sm ${
                                  content
                                    ? getCellStyle(content)
                                    : "bg-gray-50 text-gray-400"
                                }`}
                              >
                                {content || "—"}
                              </td>
                            );
                          })}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No results message */}
        {reportData && filteredFunctions.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  No functions match the current filters
                </h3>
                <p className="text-sm mb-4">
                  Try adjusting your column filters to see more results.
                </p>
                {Object.entries(columnFilters).some(([fileName, filterSet]) => {
                  const uniqueValues = getUniqueValuesInFile(fileName);
                  return filterSet.size < uniqueValues.length;
                }) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSortState({ column: null, direction: null });
                      // Reset all column filters to show all
                      if (reportData) {
                        const resetFilters: ColumnFilter = {};
                        Object.keys(reportData).forEach((fileName) => {
                          const uniqueValues = getUniqueValuesInFile(fileName);
                          resetFilters[fileName] = new Set(uniqueValues);
                        });
                        setColumnFilters(resetFilters);
                      }
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
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
