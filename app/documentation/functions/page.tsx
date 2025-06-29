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
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";

type ReportItem = {
  name: string;
  type: "directory" | "file";
  isNew: boolean;
};

interface ImportInfo {
  type?: string;
  source?: string;
}

interface FileData {
  defined: string[];
  called: string[];
  both: string[];
  exportDefault?: string[]; // Add export default functions
  imports?: Record<string, ImportInfo>;
  calledWithImports?: Record<string, ImportInfo>;
  destructuredFunctions?: Record<string, ImportInfo>;
}

interface ReportData {
  [fileName: string]: FileData;
}

type SortDirection = "asc" | "desc" | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

interface ColumnFilter {
  [fileName: string]: Set<string>; // Set of visible values for each column (including "type" column)
}

interface ColumnVisibility {
  [fileName: string]: boolean; // Whether each file column is visible
}

export default function FunctionAnalysisPage() {
  const [availableReports, setAvailableReports] = useState<ReportItem[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFilter>({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
    {},
  );
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [maxRowsToShow, setMaxRowsToShow] = useState(100);
  const [searchFilter, setSearchFilter] = useState("");

  // Performance tracking
  const [functionCount, setFunctionCount] = useState(0);

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
    setIsDataLoaded(false);
    setShowTable(false);
    try {
      const response = await fetch(`/api/function-reports/${reportFileName}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        setIsDataLoaded(true);

        // Calculate function count for performance info
        const totalFunctions = new Set<string>();
        Object.values(data as ReportData).forEach((fileData) => {
          fileData.defined.forEach((func) => totalFunctions.add(func));
          fileData.called.forEach((func) => totalFunctions.add(func));
        });
        setFunctionCount(totalFunctions.size);
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
    // setSelectedReport(reportFileName); // Commented out as variable is not used
    loadReportData(reportFileName);
  };

  // Get all unique functions across all files with filtering and sorting (memoized for performance)
  const getAllFunctions = useMemo((): string[] => {
    if (!reportData) return [];

    const allFunctions = new Set<string>();
    Object.values(reportData).forEach((fileData) => {
      fileData.defined.forEach((func) => allFunctions.add(func));
      fileData.called.forEach((func) => allFunctions.add(func));
      if (fileData.exportDefault) {
        fileData.exportDefault.forEach((func) => allFunctions.add(func));
      }
    });

    let functions = Array.from(allFunctions);

    // Apply search filter
    if (searchFilter.trim()) {
      const searchLower = searchFilter.toLowerCase();
      functions = functions.filter((func) =>
        func.toLowerCase().includes(searchLower),
      );
    }

    return functions.sort();
  }, [reportData, searchFilter]);

  // Get filtered file names (only returns visible files)
  const getFilteredFileNames = (): string[] => {
    if (!reportData) return [];
    return Object.keys(reportData)
      .filter((fileName) => columnVisibility[fileName] !== false)
      .sort();
  };

  // Get all file names (whether visible or not)
  const getAllFileNames = (): string[] => {
    if (!reportData) return [];
    return Object.keys(reportData).sort();
  };

  // Get unique cell values for a specific file column
  const getUniqueValuesInFile = (fileName: string): string[] => {
    if (!reportData || !reportData[fileName]) return [];

    const allFunctions = getAllFunctions;
    const uniqueValues = new Set<string>();

    allFunctions.forEach((functionName: string) => {
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
    const isExportDefault =
      fileData.exportDefault && fileData.exportDefault.includes(functionName);

    if (isDefined && isCalled) return "D/C";
    if (isExportDefault) return "ED"; // Export Default
    if (isDefined) return "D";
    if (isCalled) return "C";
    return "";
  };

  // Get count of each cell value for a specific file column
  const getCellValueCounts = (fileName: string): Record<string, number> => {
    if (!reportData || !reportData[fileName]) return {};

    const allFunctions = getAllFunctions;
    const counts: Record<string, number> = {};

    allFunctions.forEach((functionName: string) => {
      const cellContent = getCellContent(functionName, fileName);
      counts[cellContent] = (counts[cellContent] || 0) + 1;
    });

    return counts;
  };

  // Initialize column filters and visibility when report data changes
  useEffect(() => {
    if (reportData) {
      const newColumnFilters: ColumnFilter = {};
      const newColumnVisibility: ColumnVisibility = {};

      // Initialize filters and visibility for file columns
      Object.keys(reportData).forEach((fileName) => {
        const uniqueValues = getUniqueValuesInFile(fileName);
        newColumnFilters[fileName] = new Set(uniqueValues);
        newColumnVisibility[fileName] = true; // All columns visible by default
      });

      // Initialize filter for Type column
      const uniqueTypes = getUniqueTypes();
      newColumnFilters["type"] = new Set(uniqueTypes);

      // Initialize filter for Source column
      const uniqueSources = getUniqueSources();
      newColumnFilters["source"] = new Set(uniqueSources);

      setColumnFilters(newColumnFilters);
      setColumnVisibility(newColumnVisibility);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } else if (fileName === "source") {
      const uniqueSources = getUniqueSources();
      setColumnFilters((prev) => ({
        ...prev,
        [fileName]: selectAll ? new Set(uniqueSources) : new Set(),
      }));
    } else {
      const uniqueValues = getUniqueValuesInFile(fileName);
      setColumnFilters((prev) => ({
        ...prev,
        [fileName]: selectAll ? new Set(uniqueValues) : new Set(),
      }));
    }
  };

  // Handle column visibility changes
  const handleColumnVisibilityChange = (fileName: string, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [fileName]: visible,
    }));
  };

  // Handle select all/none for column visibility
  const handleColumnVisibilitySelectAll = (selectAll: boolean) => {
    const allFileNames = getAllFileNames();
    const newVisibility: ColumnVisibility = {};
    allFileNames.forEach((fileName) => {
      newVisibility[fileName] = selectAll;
    });
    setColumnVisibility(newVisibility);
  };

  // Get count of visible columns
  const getVisibleColumnCount = (): number => {
    return Object.values(columnVisibility).filter((visible) => visible).length;
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
    const allFunctions = getAllFunctions;

    allFunctions.forEach((functionName: string) => {
      const type = getFunctionType(functionName);
      types.add(type);
    });

    return Array.from(types).sort();
  };

  // Get function source based on import information
  const getFunctionSource = (functionName: string): string => {
    if (!reportData) return "unknown";

    // Check across all files to find the most specific source for this function
    let mostSpecificSource = "unknown";

    Object.values(reportData).forEach((fileData) => {
      // Check if it's defined locally in any file
      if (fileData.defined && fileData.defined.includes(functionName)) {
        mostSpecificSource = "local";
      }

      // Check imports for more specific source information
      if (
        fileData.calledWithImports &&
        fileData.calledWithImports[functionName]
      ) {
        const importInfo = fileData.calledWithImports[functionName];
        if (importInfo.source && importInfo.source !== "unknown") {
          mostSpecificSource = importInfo.source;
        }
      }
    });

    return mostSpecificSource;
  };

  // Get unique sources for the Source column
  const getUniqueSources = (): string[] => {
    if (!reportData) return [];

    const sources = new Set<string>();
    const allFunctions = getAllFunctions;

    allFunctions.forEach((functionName: string) => {
      const source = getFunctionSource(functionName);
      sources.add(source);
    });

    return Array.from(sources).sort();
  };

  // Get filtered and sorted functions with pagination
  const getFilteredFunctions = useMemo((): string[] => {
    const allFunctions = getAllFunctions;
    let filtered = allFunctions;

    // Apply column filters - hide functions that don't match ALL active column filters
    if (Object.keys(columnFilters).length > 0) {
      filtered = filtered.filter((functionName: string) => {
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

        // Check Source column filter
        const sourceFilter = columnFilters["source"];
        const functionSource = getFunctionSource(functionName);
        const passesSourceFilter =
          !sourceFilter ||
          sourceFilter.size === 0 ||
          sourceFilter.size === getUniqueSources().length ||
          sourceFilter.has(functionSource);

        return passesFileFilters && passesTypeFilter && passesSourceFilter;
      });
    }

    // Apply sorting
    if (sortState.column && sortState.direction) {
      if (sortState.column === "function") {
        filtered = filtered.sort((a: string, b: string) => {
          const comparison = a.localeCompare(b);
          return sortState.direction === "asc" ? comparison : -comparison;
        });
      } else if (sortState.column === "type") {
        // Sort by function type
        filtered = filtered.sort((a: string, b: string) => {
          const aType = getFunctionType(a);
          const bType = getFunctionType(b);

          // Define sort order for types: npm > local > alias > relative > unknown
          const getTypeWeight = (type: string) => {
            switch (type) {
              case "npm":
                return 5;
              case "local":
                return 4;
              case "alias":
                return 3;
              case "relative":
                return 2;
              case "unknown":
                return 1;
              default:
                return 0;
            }
          };

          const comparison = getTypeWeight(aType) - getTypeWeight(bType);
          return sortState.direction === "asc" ? comparison : -comparison;
        });
      } else if (sortState.column === "source") {
        // Sort by function source
        filtered = filtered.sort((a, b) => {
          const aSource = getFunctionSource(a);
          const bSource = getFunctionSource(b);

          // Define sort order for sources: packages alphabetically, then local, then unknown
          const getSourceWeight = (source: string) => {
            if (source === "local") return 1000; // Local comes first
            if (source === "unknown") return 0; // Unknown comes last
            return 500; // All other sources (npm packages) in the middle
          };

          const aWeight = getSourceWeight(aSource);
          const bWeight = getSourceWeight(bSource);

          if (aWeight !== bWeight) {
            const comparison = bWeight - aWeight; // Higher weight first
            return sortState.direction === "asc" ? comparison : -comparison;
          }

          // If same weight, sort alphabetically
          const comparison = aSource.localeCompare(bSource);
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

    // Apply pagination - only return visible rows for performance
    return filtered.slice(0, maxRowsToShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportData, sortState, columnFilters, searchFilter, maxRowsToShow]);

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

  const allFunctions = getAllFunctions;
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
                    <SelectItem key={report.name} value={report.name}>
                      <div className="flex items-center gap-2">
                        {report.isNew ? (
                          <span className="text-green-600 text-xs">📁 NEW</span>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            📄 LEGACY
                          </span>
                        )}
                        <span>{report.name}</span>
                      </div>
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

            {/* Data Summary and Controls */}
            {isDataLoaded && !loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-blue-800">
                    📊 Report Loaded Successfully
                  </h4>
                  <Badge
                    variant="outline"
                    className="text-blue-700 bg-blue-100"
                  >
                    {functionCount} total functions
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <strong>Files:</strong>{" "}
                    {Object.keys(reportData || {}).length}
                  </div>
                  <div>
                    <strong>Functions:</strong> {functionCount}
                  </div>
                </div>

                {!showTable && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 mb-2">
                          📈 <strong>Performance Mode:</strong> Table hidden for
                          faster interaction with large datasets
                        </p>
                        <p className="text-xs text-blue-600">
                          Use the controls below to configure your view, then
                          show the table when ready.
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowTable(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Show Analysis Table
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Controls */}
        {isDataLoaded && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>⚡ Performance & Search Controls</span>
                {showTable && (
                  <Badge variant="outline" className="text-xs">
                    Showing {Math.min(maxRowsToShow, filteredFunctions.length)}{" "}
                    of {allFunctions.length} functions
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600">
                Optimize performance and find specific functions in large
                datasets
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  🔍 Search Functions:
                </label>
                <Input
                  placeholder="Type to filter functions by name..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full"
                />
                {searchFilter && (
                  <p className="text-xs text-gray-500">
                    Found {allFunctions.length} functions matching &quot;
                    {searchFilter}&quot;
                  </p>
                )}
              </div>

              {/* Row Limit Controls */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  📊 Max Rows to Display:
                </label>
                <div className="flex items-center gap-2">
                  <Select
                    value={maxRowsToShow.toString()}
                    onValueChange={(value) => setMaxRowsToShow(parseInt(value))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 rows (fastest)</SelectItem>
                      <SelectItem value="100">100 rows (fast)</SelectItem>
                      <SelectItem value="250">250 rows (balanced)</SelectItem>
                      <SelectItem value="500">500 rows (slower)</SelectItem>
                      <SelectItem value="1000">1000 rows (slowest)</SelectItem>
                      <SelectItem value="99999">
                        All rows (may be very slow)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-gray-500">
                    Limit rows for better performance with large datasets
                  </span>
                </div>
              </div>

              {/* Table Visibility Controls */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-gray-600">
                  {showTable ? (
                    <span className="text-green-600">
                      ✅ Table is visible below
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      👁️ Table is hidden for performance
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {showTable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTable(false)}
                    >
                      Hide Table
                    </Button>
                  )}
                  {!showTable && (
                    <Button
                      size="sm"
                      onClick={() => setShowTable(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Show Table
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Column Visibility Controls */}
        {reportData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Column Visibility</span>
                <Badge variant="outline" className="text-xs">
                  {getVisibleColumnCount()} of {getAllFileNames().length}{" "}
                  visible
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Select which file columns to display in the analysis table
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleColumnVisibilitySelectAll(true)}
                    className="text-xs"
                  >
                    Show All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleColumnVisibilitySelectAll(false)}
                    className="text-xs"
                  >
                    Hide All
                  </Button>
                </div>

                {/* Column Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getAllFileNames().map((fileName) => {
                    const isVisible = columnVisibility[fileName] !== false;
                    const fileData = reportData[fileName];
                    const totalFunctions =
                      fileData.defined.length + fileData.called.length;

                    return (
                      <div
                        key={fileName}
                        className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          id={`column-${fileName}`}
                          checked={isVisible}
                          onCheckedChange={(checked) =>
                            handleColumnVisibilityChange(
                              fileName,
                              checked as boolean,
                            )
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={`column-${fileName}`}
                            className="text-sm font-medium cursor-pointer block truncate"
                          >
                            {fileName.replace(/\.(tsx?|js)$/, "")}
                          </label>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span className="font-mono">
                              .{fileName.split(".").pop()}
                            </span>
                            <span>•</span>
                            <span>{totalFunctions} functions</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {getVisibleColumnCount() === 0 && (
                  <div className="text-center py-4 text-sm text-amber-600 bg-amber-50 rounded-lg">
                    ⚠️ No columns are visible. Select at least one file column
                    to view the analysis table.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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

              {/* Source Column Legend */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Function Sources (Import Packages):
                </h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 border-blue-300 text-xs"
                    >
                      local
                    </Badge>
                    <span className="text-sm">
                      Function defined locally in this project
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-orange-100 text-orange-800 border-orange-300 text-xs"
                    >
                      package-name
                    </Badge>
                    <span className="text-sm">
                      Function imported from specific npm package
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
                      Import package could not be determined
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
        {reportData &&
          showTable &&
          filteredFunctions.length > 0 &&
          getVisibleColumnCount() > 0 && (
            <Card className="h-[80vh] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Function Analysis Matrix
                    <span className="text-sm font-normal ml-2 text-gray-600">
                      ({filteredFunctions.length} of {allFunctions.length}{" "}
                      functions across {filteredFileNames.length} files)
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
                            // Reset Source column filter
                            const uniqueSources = getUniqueSources();
                            resetFilters["source"] = new Set(uniqueSources);
                            setColumnFilters(resetFilters);

                            // Reset column visibility to show all
                            handleColumnVisibilitySelectAll(true);
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
                    ⚡ Column filters active - showing{" "}
                    {filteredFunctions.length} of {allFunctions.length}{" "}
                    functions
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full overflow-auto">
                  <div className="p-6">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-white border-b-2 border-gray-200">
                          <th
                            className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-900 sticky left-0 bg-white z-30 min-w-[200px] cursor-pointer hover:bg-gray-50"
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
                                <DropdownMenuContent className="w-96 max-h-96 overflow-y-auto">
                                  <div className="p-2 border-b">
                                    <div className="text-sm font-medium mb-2">
                                      Filter by Type
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleColumnFilterSelectAll(
                                            "type",
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
                                            "type",
                                            false,
                                          )
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
                                      columnFilters["type"]?.has(typeValue) ??
                                      true;
                                    const typeCount = getAllFunctions.filter(
                                      (fn: string) =>
                                        getFunctionType(fn) === typeValue,
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

                          {/* Source Column */}
                          <th
                            className="border-r border-gray-200 px-3 py-3 text-center font-medium text-gray-700 min-w-[120px] bg-white relative cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort("source")}
                            title="Click to sort by function source"
                          >
                            <div className="flex flex-col items-center space-y-2">
                              <div className="cursor-pointer hover:bg-gray-50 transition-colors duration-150 p-1 rounded flex items-center justify-between w-full">
                                <div className="flex-1">
                                  <div className="text-sm truncate">
                                    Source
                                    {(() => {
                                      const uniqueSources = getUniqueSources();
                                      const selectedCount =
                                        columnFilters["source"]?.size ||
                                        uniqueSources.length;
                                      const hasActiveFilter =
                                        selectedCount < uniqueSources.length;
                                      return hasActiveFilter ? (
                                        <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded">
                                          {selectedCount}/{uniqueSources.length}
                                        </span>
                                      ) : null;
                                    })()}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Import Package
                                  </div>
                                </div>
                                <div className="text-xs ml-1">
                                  {getSortIndicator("source")}
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 w-6 p-0 transition-colors ${(() => {
                                      const uniqueSources = getUniqueSources();
                                      const selectedCount =
                                        columnFilters["source"]?.size ||
                                        uniqueSources.length;
                                      const hasActiveFilter =
                                        selectedCount < uniqueSources.length;
                                      return hasActiveFilter
                                        ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                        : "text-gray-400 hover:text-gray-600";
                                    })()}`}
                                    title="Filter by source"
                                  >
                                    <Filter className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-96 max-h-96 overflow-y-auto">
                                  <div className="p-2 border-b">
                                    <div className="text-sm font-medium mb-2">
                                      Filter by Source
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleColumnFilterSelectAll(
                                            "source",
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
                                            "source",
                                            false,
                                          )
                                        }
                                        className="text-xs h-7"
                                      >
                                        Select None
                                      </Button>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {(() => {
                                        const uniqueSources =
                                          getUniqueSources();
                                        const selectedCount =
                                          columnFilters["source"]?.size ||
                                          uniqueSources.length;
                                        return `${selectedCount} of ${uniqueSources.length} selected`;
                                      })()}
                                    </div>
                                  </div>

                                  {getUniqueSources().map((sourceValue) => {
                                    const isChecked =
                                      columnFilters["source"]?.has(
                                        sourceValue,
                                      ) ?? true;
                                    const sourceCount = getAllFunctions.filter(
                                      (fn: string) =>
                                        getFunctionSource(fn) === sourceValue,
                                    ).length;

                                    return (
                                      <DropdownMenuCheckboxItem
                                        key={sourceValue}
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                          handleColumnFilterChange(
                                            "source",
                                            sourceValue,
                                            checked,
                                          )
                                        }
                                        className="text-sm"
                                      >
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                              {sourceValue}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              ({sourceCount})
                                            </span>
                                          </div>
                                          <Badge
                                            variant="outline"
                                            className={`ml-2 text-xs h-5 ${
                                              sourceValue === "local"
                                                ? "bg-blue-100 text-blue-800"
                                                : sourceValue === "unknown"
                                                  ? "bg-gray-100 text-gray-600"
                                                  : "bg-orange-100 text-orange-800"
                                            }`}
                                          >
                                            {sourceValue}
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
                              const uniqueValues =
                                getUniqueValuesInFile(fileName);
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
                                              {selectedCount}/
                                              {uniqueValues.length}
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
                                      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
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
                                            {selectedCount} of{" "}
                                            {uniqueValues.length} selected
                                          </div>
                                        </div>

                                        {uniqueValues.map((cellValue) => {
                                          const isChecked =
                                            columnFilters[fileName]?.has(
                                              cellValue,
                                            ) ?? true;
                                          const cellCounts =
                                            getCellValueCounts(fileName);
                                          const count =
                                            cellCounts[cellValue] || 0;

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
                              <td className="border-r border-gray-200 px-4 py-3 font-medium sticky left-0 bg-inherit z-20 border-b border-gray-200">
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

                              {/* Source Column Data */}
                              <td className="border-r border-b border-gray-200 px-3 py-3 text-center text-sm">
                                {(() => {
                                  const functionSource =
                                    getFunctionSource(functionName);
                                  return (
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        functionSource === "local"
                                          ? "bg-blue-100 text-blue-800 border-blue-300"
                                          : functionSource === "unknown"
                                            ? "bg-gray-100 text-gray-600 border-gray-300"
                                            : "bg-orange-100 text-orange-800 border-orange-300"
                                      }`}
                                    >
                                      {functionSource}
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
                </div>
              </CardContent>
            </Card>
          )}

        {/* Table Hidden Message */}
        {reportData && !showTable && getVisibleColumnCount() > 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <div className="h-12 w-12 mx-auto mb-4 text-gray-300 flex items-center justify-center">
                  ⚡
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Table Hidden for Performance
                </h3>
                <p className="text-sm mb-4">
                  Configure your search, filters, and column visibility above,
                  then show the table for analysis.
                </p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>📊 {allFunctions.length} total functions found</p>
                  <p>👁️ {getVisibleColumnCount()} columns visible</p>
                  {searchFilter && <p>🔍 Search: &quot;{searchFilter}&quot;</p>}
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowTable(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Show Analysis Table
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No columns visible message */}
        {reportData && getVisibleColumnCount() === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <div className="h-12 w-12 mx-auto mb-4 text-gray-300 flex items-center justify-center">
                  👁️
                </div>
                <h3 className="text-lg font-medium mb-2">
                  No file columns are visible
                </h3>
                <p className="text-sm mb-4">
                  Select at least one file column in the &quot;Column
                  Visibility&quot; section above to view the analysis table.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleColumnVisibilitySelectAll(true)}
                >
                  Show All Columns
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No results message */}
        {reportData &&
          showTable &&
          filteredFunctions.length === 0 &&
          getVisibleColumnCount() > 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-gray-500">
                  <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">
                    No functions match the current filters
                  </h3>
                  <p className="text-sm mb-4">
                    Try adjusting your search, column filters, or increase the
                    row limit.
                  </p>
                  <div className="space-y-1 text-xs text-gray-600 mb-4">
                    <p>📊 {allFunctions.length} total functions in dataset</p>
                    <p>📋 Showing max {maxRowsToShow} rows</p>
                    {searchFilter && (
                      <p>🔍 Search filter: &quot;{searchFilter}&quot;</p>
                    )}
                  </div>
                  {Object.entries(columnFilters).some(
                    ([fileName, filterSet]) => {
                      const uniqueValues = getUniqueValuesInFile(fileName);
                      return filterSet.size < uniqueValues.length;
                    },
                  ) && (
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
                          // Reset Type and Source column filters
                          const uniqueTypes = getUniqueTypes();
                          resetFilters["type"] = new Set(uniqueTypes);
                          const uniqueSources = getUniqueSources();
                          resetFilters["source"] = new Set(uniqueSources);
                          setColumnFilters(resetFilters);

                          // Reset column visibility to show all
                          handleColumnVisibilitySelectAll(true);
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
