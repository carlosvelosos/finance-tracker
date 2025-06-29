import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Filter, ChevronDown } from "lucide-react";
import { FunctionData } from "@/types/function-reports";

interface FunctionAnalysisTableProps {
  tableData: FunctionData[];
  selectedJsonFiles: string[];
  formatJsonFileName: (fileName: string) => string;
  loadingTable?: boolean;
}

type FilterState = {
  functionName: Set<string>;
  source: Set<string>;
  [key: string]: Set<string>; // For file columns
};

export default function FunctionAnalysisTable({
  tableData,
  selectedJsonFiles,
  formatJsonFileName,
  loadingTable = false,
}: FunctionAnalysisTableProps) {
  const [filters, setFilters] = useState<FilterState>(() => {
    const initialFilters: FilterState = {
      functionName: new Set(),
      source: new Set(),
    };

    // Initialize file column filters
    selectedJsonFiles.forEach((fileName) => {
      const readableFileName = formatJsonFileName(fileName);
      initialFilters[readableFileName] = new Set();
    });

    return initialFilters;
  });

  // Get unique values for each column
  const uniqueValues = useMemo(() => {
    const values: Record<string, Set<string>> = {
      functionName: new Set(),
      source: new Set(),
    };

    // Initialize file column unique values
    selectedJsonFiles.forEach((fileName) => {
      const readableFileName = formatJsonFileName(fileName);
      values[readableFileName] = new Set();
    });

    tableData.forEach((funcData) => {
      values.functionName.add(funcData.functionName);
      values.source.add(funcData.source);

      selectedJsonFiles.forEach((fileName) => {
        const readableFileName = formatJsonFileName(fileName);
        const fileData = funcData.files[readableFileName];
        if (fileData) {
          values[readableFileName].add(fileData.type);
        } else {
          values[readableFileName].add("not-present");
        }
      });
    });

    return values;
  }, [tableData, selectedJsonFiles, formatJsonFileName]);

  // Filter the table data based on active filters
  const filteredData = useMemo(() => {
    return tableData.filter((funcData) => {
      // Check function name filter
      if (
        filters.functionName.size > 0 &&
        !filters.functionName.has(funcData.functionName)
      ) {
        return false;
      }

      // Check source filter
      if (filters.source.size > 0 && !filters.source.has(funcData.source)) {
        return false;
      }

      // Check file column filters
      for (const fileName of selectedJsonFiles) {
        const readableFileName = formatJsonFileName(fileName);
        const fileFilters = filters[readableFileName];

        if (fileFilters && fileFilters.size > 0) {
          const fileData = funcData.files[readableFileName];
          const value = fileData ? fileData.type : "not-present";

          if (!fileFilters.has(value)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [tableData, filters, selectedJsonFiles, formatJsonFileName]);

  const handleFilterChange = (
    column: string,
    value: string,
    checked: boolean,
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (!newFilters[column]) {
        newFilters[column] = new Set();
      }

      const columnFilters = new Set(newFilters[column]);
      if (checked) {
        columnFilters.add(value);
      } else {
        columnFilters.delete(value);
      }

      newFilters[column] = columnFilters;
      return newFilters;
    });
  };

  const clearColumnFilter = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: new Set(),
    }));
  };

  const hasActiveFilters = Object.values(filters).some(
    (filterSet) => filterSet.size > 0,
  );

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      functionName: new Set(),
      source: new Set(),
    };

    selectedJsonFiles.forEach((fileName) => {
      const readableFileName = formatJsonFileName(fileName);
      clearedFilters[readableFileName] = new Set();
    });

    setFilters(clearedFilters);
  };

  const renderFilterDropdown = (column: string, displayName: string) => {
    const columnValues = Array.from(uniqueValues[column] || []).sort();
    const activeFilters = filters[column] || new Set();
    const hasColumnFilter = activeFilters.size > 0;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <span className="sr-only">Filter {displayName}</span>
            <Filter
              className={`h-3 w-3 ${hasColumnFilter ? "text-blue-600" : "text-muted-foreground"}`}
            />
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">{displayName}</span>
              {hasColumnFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => clearColumnFilter(column)}
                >
                  Clear
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-48 overflow-y-auto">
              {columnValues.map((value) => (
                <DropdownMenuItem key={value} className="p-0" asChild>
                  <label className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-muted">
                    <Checkbox
                      checked={activeFilters.has(value)}
                      onCheckedChange={(checked) =>
                        handleFilterChange(column, value, checked as boolean)
                      }
                    />
                    <span className="text-xs flex-1">
                      {value === "not-present" ? (
                        <span className="text-muted-foreground italic">
                          Not present
                        </span>
                      ) : (
                        value
                      )}
                    </span>
                  </label>
                </DropdownMenuItem>
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  if (loadingTable) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Generating function analysis table...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (tableData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Function Analysis Table</CardTitle>
            <Badge variant="outline">
              {filteredData.length} of {tableData.length} functions
            </Badge>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear All Filters
            </Button>
          )}
        </div>
        <CardDescription>
          Functions analyzed across selected files. Each row represents a
          function, each column represents a file. Use the filter buttons to
          hide/show specific values.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] sticky left-0 bg-background border-r">
                  <div className="flex items-center justify-between">
                    <span>Function Name</span>
                    {renderFilterDropdown("functionName", "Function Name")}
                  </div>
                </TableHead>
                <TableHead className="w-[150px] sticky left-[200px] bg-background border-r">
                  <div className="flex items-center justify-between">
                    <span>Source</span>
                    {renderFilterDropdown("source", "Source")}
                  </div>
                </TableHead>
                {selectedJsonFiles.map((fileName) => {
                  const readableFileName = formatJsonFileName(fileName);
                  return (
                    <TableHead
                      key={fileName}
                      className="min-w-[120px] text-center"
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <div className="truncate" title={readableFileName}>
                          {readableFileName}
                        </div>
                        {renderFilterDropdown(
                          readableFileName,
                          readableFileName,
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2 + selectedJsonFiles.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {hasActiveFilters
                      ? "No functions match the current filters"
                      : "No data available"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((funcData, index) => (
                  <TableRow key={`${funcData.functionName}-${index}`}>
                    <TableCell className="font-medium sticky left-0 bg-background border-r">
                      <div className="truncate" title={funcData.functionName}>
                        {funcData.functionName}
                      </div>
                    </TableCell>
                    <TableCell className="sticky left-[200px] bg-background border-r">
                      <div
                        className="truncate text-xs text-muted-foreground"
                        title={funcData.source}
                      >
                        {funcData.source}
                      </div>
                    </TableCell>
                    {selectedJsonFiles.map((fileName) => {
                      const readableFileName = formatJsonFileName(fileName);
                      const fileData = funcData.files[readableFileName];
                      return (
                        <TableCell key={fileName} className="text-center">
                          {fileData ? (
                            <Badge
                              variant={
                                fileData.type === "defined"
                                  ? "default"
                                  : fileData.type === "both"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {fileData.type}
                            </Badge>
                          ) : (
                            <div
                              className="w-4 h-4 bg-gray-200 rounded-full mx-auto"
                              title="Function not present"
                            />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full" />
              <span>Function not present</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="text-xs">
                defined
              </Badge>
              <span>Function defined in file</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                called
              </Badge>
              <span>Function called in file</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="destructive" className="text-xs">
                both
              </Badge>
              <span>Function both defined and called</span>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Filter className="h-3 w-3 text-blue-600" />
              <span className="text-blue-600">= Active filter</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
