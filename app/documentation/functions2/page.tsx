"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Folder, Calendar, Hash, Eye, Download } from "lucide-react";
import FunctionAnalysisTable from "@/components/ui/function-analysis-table";
import {
  FunctionData,
  JsonFileData,
  ReportDirectory,
  SummaryData,
  DirectoryData,
} from "@/types/function-reports";

export default function FunctionReportsPage() {
  const [directories, setDirectories] = useState<ReportDirectory[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<string>("");
  const [directoryData, setDirectoryData] = useState<DirectoryData | null>(
    null,
  );
  const [selectedJsonFiles, setSelectedJsonFiles] = useState<string[]>([]);
  const [tableData, setTableData] = useState<FunctionData[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch available directories on component mount
  useEffect(() => {
    const fetchDirectories = async () => {
      try {
        const response = await fetch("/api/function-reports");
        if (!response.ok) {
          throw new Error("Failed to fetch directories");
        }
        const data = await response.json();

        // Filter only directories (new format)
        const directoriesOnly = data.filter(
          (item: any) => item.type === "directory",
        );
        setDirectories(directoriesOnly);
      } catch (err) {
        setError("Failed to load directories");
        console.error("Error fetching directories:", err);
      }
    };

    fetchDirectories();
  }, []);

  // Fetch directory data when a directory is selected
  useEffect(() => {
    if (!selectedDirectory) {
      setDirectoryData(null);
      return;
    }

    const fetchDirectoryData = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/function-reports/${selectedDirectory}/summary`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch directory data");
        }
        const data = await response.json();
        setDirectoryData(data);
      } catch (err) {
        setError("Failed to load directory data");
        console.error("Error fetching directory data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectoryData();
  }, [selectedDirectory]);

  const formatTimestamp = (timestamp: string) => {
    try {
      // Parse timestamp like "2025-06-29_11-11-02"
      const [date, time] = timestamp.split("_");
      const [year, month, day] = date.split("-");
      const [hour, minute, second] = time.split("-");

      const dateObj = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second),
      );

      return dateObj.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatJsonFileName = (fileName: string) => {
    // Convert file names like "about_page_tsx.json" to more readable format
    return fileName
      .replace(".json", "")
      .replace(/_/g, "/")
      .replace(/tsx$/, ".tsx")
      .replace(/ts$/, ".ts")
      .replace(/js$/, ".js");
  };

  const handleFileSelection = (fileName: string, checked: boolean) => {
    setSelectedJsonFiles((prev) => {
      if (checked) {
        return [...prev, fileName];
      } else {
        return prev.filter((f) => f !== fileName);
      }
    });
  };

  const loadTableData = async () => {
    if (selectedJsonFiles.length === 0 || !selectedDirectory) return;

    setLoadingTable(true);
    setError("");

    try {
      // Fetch all selected JSON files
      const fileDataPromises = selectedJsonFiles.map(async (fileName) => {
        const response = await fetch(
          `/api/function-reports/${selectedDirectory}/${fileName.replace(".json", "")}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch ${fileName}`);
        }
        const data = await response.json();
        return { fileName, data: data as JsonFileData };
      });

      const fileResults = await Promise.all(fileDataPromises);

      // Combine all functions from all files
      const functionMap = new Map<string, FunctionData>();

      fileResults.forEach(({ fileName, data }) => {
        const readableFileName = formatJsonFileName(fileName);

        // Process defined functions
        data.analysis.defined.forEach((funcName) => {
          if (!functionMap.has(funcName)) {
            functionMap.set(funcName, {
              functionName: funcName,
              source: "local",
              files: {},
            });
          }
          const existing = functionMap.get(funcName)!;
          if (existing.files[readableFileName]) {
            // If already exists as called, mark as both
            if (existing.files[readableFileName].type === "called") {
              existing.files[readableFileName].type = "both";
            }
          } else {
            existing.files[readableFileName] = { type: "defined" };
          }
        });

        // Process called functions
        data.analysis.called.forEach((funcName) => {
          if (!functionMap.has(funcName)) {
            // Determine source from imports
            const importInfo = data.analysis.calledWithImports[funcName];
            let source = "unknown";
            if (importInfo) {
              if (importInfo.type === "npm") {
                source = importInfo.source;
              } else if (importInfo.type === "alias") {
                source = importInfo.source;
              } else if (importInfo.memberOf) {
                source = importInfo.memberOf;
              }
            }

            functionMap.set(funcName, {
              functionName: funcName,
              source: source,
              files: {},
            });
          }
          const existing = functionMap.get(funcName)!;
          if (existing.files[readableFileName]) {
            // If already exists as defined, mark as both
            if (existing.files[readableFileName].type === "defined") {
              existing.files[readableFileName].type = "both";
            }
          } else {
            existing.files[readableFileName] = { type: "called" };
          }
        });

        // Process both functions
        data.analysis.both.forEach((funcName) => {
          if (!functionMap.has(funcName)) {
            functionMap.set(funcName, {
              functionName: funcName,
              source: "local",
              files: {},
            });
          }
          functionMap.get(funcName)!.files[readableFileName] = { type: "both" };
        });
      });

      // Convert to array and sort by function name
      const tableDataArray = Array.from(functionMap.values()).sort((a, b) => {
        return a.functionName.localeCompare(b.functionName);
      });

      setTableData(tableDataArray);
    } catch (err) {
      setError("Failed to load table data");
      console.error("Error loading table data:", err);
    } finally {
      setLoadingTable(false);
    }
  };

  const toggleSelectAll = () => {
    if (!directoryData) return;

    if (selectedJsonFiles.length === directoryData.jsonFiles.length) {
      setSelectedJsonFiles([]);
    } else {
      setSelectedJsonFiles([...directoryData.jsonFiles]);
    }
  };

  // Reset selections when directory changes
  useEffect(() => {
    setSelectedJsonFiles([]);
    setTableData([]);
  }, [selectedDirectory]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Folder className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Function Reports</h1>
      </div>

      <p className="text-muted-foreground">
        Browse and explore function analysis reports from scanned directories.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Select Report Directory</CardTitle>
          <CardDescription>
            Choose a directory to view its function analysis summary and
            available JSON files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedDirectory}
            onValueChange={setSelectedDirectory}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a report directory..." />
            </SelectTrigger>
            <SelectContent>
              {directories.map((dir) => (
                <SelectItem key={dir.name} value={dir.name}>
                  <div className="flex items-center space-x-2">
                    <Folder className="h-4 w-4" />
                    <span>{dir.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading directory data...</p>
          </CardContent>
        </Card>
      )}

      {directoryData && !loading && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Scan Summary</span>
              </CardTitle>
              <CardDescription>
                Overview of the scanned directory and processing results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Scanned Directory
                  </p>
                  <p className="font-medium">
                    {directoryData.summary.metadata.scannedDirectory}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Scan Date</span>
                  </p>
                  <p className="font-medium">
                    {formatTimestamp(directoryData.summary.metadata.timestamp)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                    <Hash className="h-3 w-3" />
                    <span>Total Files</span>
                  </p>
                  <Badge variant="secondary">
                    {directoryData.summary.metadata.totalFiles}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Processing Status
                  </p>
                  <div className="flex space-x-2">
                    <Badge variant="default">
                      {directoryData.summary.metadata.successfulWrites} Success
                    </Badge>
                    {directoryData.summary.metadata.errors > 0 && (
                      <Badge variant="destructive">
                        {directoryData.summary.metadata.errors} Errors
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* JSON Files List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Available JSON Files</span>
                <Badge variant="outline">
                  {directoryData.jsonFiles.length}
                </Badge>
                {selectedJsonFiles.length > 0 && (
                  <Badge variant="default">
                    {selectedJsonFiles.length} selected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Select JSON files to analyze and compare function usage across
                files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={
                    selectedJsonFiles.length ===
                      directoryData.jsonFiles.length &&
                    directoryData.jsonFiles.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All
                </label>
                <Button
                  onClick={loadTableData}
                  disabled={selectedJsonFiles.length === 0 || loadingTable}
                  size="sm"
                  className="ml-auto"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {loadingTable ? "Loading..." : "Generate Table"}
                </Button>
              </div>

              {directoryData.jsonFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {directoryData.jsonFiles.map((fileName) => (
                    <div
                      key={fileName}
                      className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={fileName}
                        checked={selectedJsonFiles.includes(fileName)}
                        onCheckedChange={(checked) =>
                          handleFileSelection(fileName, checked as boolean)
                        }
                      />
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={fileName}
                          className="text-sm font-medium truncate block cursor-pointer"
                        >
                          {formatJsonFileName(fileName)}
                        </label>
                        <p className="text-xs text-muted-foreground truncate">
                          {fileName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No JSON files found in this directory.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Function Analysis Table */}
          <FunctionAnalysisTable
            tableData={tableData}
            selectedJsonFiles={selectedJsonFiles}
            formatJsonFileName={formatJsonFileName}
            loadingTable={loadingTable}
          />

          {/* File List from Summary */}
          {directoryData.summary.fileList &&
            directoryData.summary.fileList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Original Files Processed</CardTitle>
                  <CardDescription>
                    Mapping of original source files to their corresponding JSON
                    analysis files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {directoryData.summary.fileList.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.originalPath}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <Badge variant="outline" className="text-xs">
                            {file.jsonFile}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}
