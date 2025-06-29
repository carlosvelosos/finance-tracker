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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Folder,
  Calendar,
  Hash,
  Eye,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
} from "lucide-react";
import FunctionAnalysisTable from "@/components/ui/function-analysis-table";
import {
  FunctionData,
  JsonFileData,
  ReportDirectory,
  DirectoryData,
} from "@/types/function-reports";

interface SelectedDirectory {
  name: string;
  data: DirectoryData;
}

interface FileWithDirectory {
  fileName: string;
  directoryName: string;
  displayName: string;
}

export default function FunctionReportsPage() {
  const [directories, setDirectories] = useState<ReportDirectory[]>([]);
  const [selectedDirectories, setSelectedDirectories] = useState<
    SelectedDirectory[]
  >([]);
  const [currentDirectorySelection, setCurrentDirectorySelection] =
    useState<string>("");
  const [selectedJsonFiles, setSelectedJsonFiles] = useState<
    FileWithDirectory[]
  >([]);
  const [tableData, setTableData] = useState<FunctionData[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );
  const [collapsedDirectories, setCollapsedDirectories] = useState<Set<string>>(
    new Set(),
  );
  const [isJsonFilesCollapsed, setIsJsonFilesCollapsed] = useState(false);

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
          (item: { type: string }) => item.type === "directory",
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
  const addDirectory = async (directoryName: string) => {
    if (
      !directoryName ||
      selectedDirectories.some((d) => d.name === directoryName)
    ) {
      return; // Don't add if already selected
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/function-reports/${directoryName}/summary`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch directory data");
      }
      const data = await response.json();

      const newDirectory: SelectedDirectory = {
        name: directoryName,
        data: data,
      };

      setSelectedDirectories((prev) => [...prev, newDirectory]);
      setCurrentDirectorySelection(""); // Reset the dropdown
    } catch (err) {
      setError("Failed to load directory data");
      console.error("Error fetching directory data:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeDirectory = (directoryName: string) => {
    setSelectedDirectories((prev) =>
      prev.filter((d) => d.name !== directoryName),
    );
    // Also remove any selected files from this directory
    setSelectedJsonFiles((prev) =>
      prev.filter((f) => f.directoryName !== directoryName),
    );
  };

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

  // Group files by their directory
  const groupFilesByDirectory = (selectedDirs: SelectedDirectory[]) => {
    const groups: Record<string, FileWithDirectory[]> = {};

    selectedDirs.forEach((directory) => {
      const files = directory.data.jsonFiles.map((fileName) => ({
        fileName,
        directoryName: directory.name,
        displayName: `${directory.name}/${formatJsonFileName(fileName)}`,
      }));

      groups[directory.name] = files;
    });

    return groups;
  };

  // Group files by their directory and path (for subdirectory grouping within a directory)
  const groupFilesByPath = (files: FileWithDirectory[]) => {
    const pathGroups: Record<string, FileWithDirectory[]> = {};

    files.forEach((file) => {
      const readableName = formatJsonFileName(file.fileName);
      const pathParts = readableName.split("/");

      let pathGroupName = "";
      if (pathParts.length === 1) {
        // Root level files
        pathGroupName = "Root";
      } else {
        // Files in subdirectories - use only the first directory level
        pathGroupName = pathParts[0];
      }

      if (!pathGroups[pathGroupName]) {
        pathGroups[pathGroupName] = [];
      }
      pathGroups[pathGroupName].push(file);
    });

    return pathGroups;
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const toggleDirectory = (directoryName: string) => {
    setCollapsedDirectories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(directoryName)) {
        newSet.delete(directoryName);
      } else {
        newSet.add(directoryName);
      }
      return newSet;
    });
  };

  const isGroupCollapsed = (groupName: string) =>
    collapsedGroups.has(groupName);

  const isDirectoryCollapsed = (directoryName: string) =>
    collapsedDirectories.has(directoryName);

  const toggleJsonFilesCollapse = () => {
    setIsJsonFilesCollapsed((prev) => !prev);
  };

  const getPathGroupFileCount = (
    pathGroupName: string,
    pathGroupFiles: Record<string, FileWithDirectory[]>,
  ) => {
    const files = pathGroupFiles[pathGroupName] || [];
    const selectedCount = files.filter((file) =>
      selectedJsonFiles.some(
        (sf) =>
          sf.fileName === file.fileName &&
          sf.directoryName === file.directoryName,
      ),
    ).length;
    return { total: files.length, selected: selectedCount };
  };

  const togglePathGroupSelection = (
    pathGroupName: string,
    pathGroupFiles: Record<string, FileWithDirectory[]>,
  ) => {
    const groupFiles = pathGroupFiles[pathGroupName] || [];
    const allSelected = groupFiles.every((file) =>
      selectedJsonFiles.some(
        (sf) =>
          sf.fileName === file.fileName &&
          sf.directoryName === file.directoryName,
      ),
    );

    setSelectedJsonFiles((prev) => {
      if (allSelected) {
        // Deselect all files in path group
        return prev.filter(
          (sf) =>
            !groupFiles.some(
              (gf) =>
                gf.fileName === sf.fileName &&
                gf.directoryName === sf.directoryName,
            ),
        );
      } else {
        // Select all files in path group
        const newSelected = [...prev];
        groupFiles.forEach((file) => {
          if (
            !newSelected.some(
              (sf) =>
                sf.fileName === file.fileName &&
                sf.directoryName === file.directoryName,
            )
          ) {
            newSelected.push(file);
          }
        });
        return newSelected;
      }
    });
  };

  const getDirectoryFileCount = (directoryName: string) => {
    const directoryData = selectedDirectories.find(
      (d) => d.name === directoryName,
    );
    if (!directoryData) return { total: 0, selected: 0 };

    const total = directoryData.data.jsonFiles.length;
    const selected = selectedJsonFiles.filter(
      (sf) => sf.directoryName === directoryName,
    ).length;
    return { total, selected };
  };

  const toggleDirectorySelection = (directoryName: string) => {
    const directoryData = selectedDirectories.find(
      (d) => d.name === directoryName,
    );
    if (!directoryData) return;

    const directoryFiles = directoryData.data.jsonFiles.map((fileName) => ({
      fileName,
      directoryName,
      displayName: `${directoryName}/${formatJsonFileName(fileName)}`,
    }));

    const allSelected = directoryFiles.every((file) =>
      selectedJsonFiles.some(
        (sf) =>
          sf.fileName === file.fileName &&
          sf.directoryName === file.directoryName,
      ),
    );

    setSelectedJsonFiles((prev) => {
      if (allSelected) {
        // Deselect all files in directory
        return prev.filter((sf) => sf.directoryName !== directoryName);
      } else {
        // Select all files in directory
        const newSelected = [...prev];
        directoryFiles.forEach((file) => {
          if (
            !newSelected.some(
              (sf) =>
                sf.fileName === file.fileName &&
                sf.directoryName === file.directoryName,
            )
          ) {
            newSelected.push(file);
          }
        });
        return newSelected;
      }
    });
  };

  const handleFileSelection = (file: FileWithDirectory, checked: boolean) => {
    setSelectedJsonFiles((prev) => {
      if (checked) {
        // Add if not already present
        if (
          !prev.some(
            (sf) =>
              sf.fileName === file.fileName &&
              sf.directoryName === file.directoryName,
          )
        ) {
          return [...prev, file];
        }
        return prev;
      } else {
        // Remove if present
        return prev.filter(
          (sf) =>
            !(
              sf.fileName === file.fileName &&
              sf.directoryName === file.directoryName
            ),
        );
      }
    });
  };

  const loadTableData = async () => {
    if (selectedJsonFiles.length === 0) return;

    setLoadingTable(true);
    setError("");

    try {
      // Fetch all selected JSON files from their respective directories
      const fileDataPromises = selectedJsonFiles.map(async (fileWithDir) => {
        const response = await fetch(
          `/api/function-reports/${fileWithDir.directoryName}/${fileWithDir.fileName.replace(".json", "")}`,
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${fileWithDir.fileName} from ${fileWithDir.directoryName}`,
          );
        }
        const data = await response.json();
        return {
          fileName: fileWithDir.fileName,
          directoryName: fileWithDir.directoryName,
          displayName: fileWithDir.displayName,
          data: data as JsonFileData,
        };
      });

      const fileResults = await Promise.all(fileDataPromises);

      // Combine all functions from all files
      const functionMap = new Map<string, FunctionData>();

      fileResults.forEach(({ fileName, directoryName, data }) => {
        const readableFileName = formatJsonFileName(fileName);
        const fullDisplayName = `${directoryName}/${readableFileName}`;

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
          if (existing.files[fullDisplayName]) {
            // If already exists as called, mark as both
            if (existing.files[fullDisplayName].type === "called") {
              existing.files[fullDisplayName].type = "both";
            }
          } else {
            existing.files[fullDisplayName] = { type: "defined" };
          }
        });

        // Process export default functions
        if (data.analysis.exportDefault) {
          data.analysis.exportDefault.forEach((funcName) => {
            if (!functionMap.has(funcName)) {
              functionMap.set(funcName, {
                functionName: funcName,
                source: "local",
                files: {},
              });
            }
            const existing = functionMap.get(funcName)!;
            if (existing.files[fullDisplayName]) {
              // If already exists as called, prioritize export-default over called
              if (existing.files[fullDisplayName].type === "called") {
                existing.files[fullDisplayName].type = "both";
              }
              // If already defined, export default takes precedence
              else if (existing.files[fullDisplayName].type === "defined") {
                existing.files[fullDisplayName].type = "export-default";
              }
            } else {
              existing.files[fullDisplayName] = { type: "export-default" };
            }
          });
        }

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
          if (existing.files[fullDisplayName]) {
            // If already exists as defined, mark as both
            if (existing.files[fullDisplayName].type === "defined") {
              existing.files[fullDisplayName].type = "both";
            }
          } else {
            existing.files[fullDisplayName] = { type: "called" };
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
          functionMap.get(funcName)!.files[fullDisplayName] = { type: "both" };
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
    const totalFiles = selectedDirectories.flatMap((dir) =>
      dir.data.jsonFiles.map((fileName) => ({
        fileName,
        directoryName: dir.name,
        displayName: `${dir.name}/${formatJsonFileName(fileName)}`,
      })),
    );

    if (selectedJsonFiles.length === totalFiles.length) {
      setSelectedJsonFiles([]);
    } else {
      setSelectedJsonFiles(totalFiles);
    }
  };

  // Reset selections when directories change
  useEffect(() => {
    setSelectedJsonFiles([]);
    setTableData([]);

    // Collapse all directories when directories change
    if (selectedDirectories.length > 0) {
      const groupedFiles = groupFilesByDirectory(selectedDirectories);
      const allDirectoryNames = Object.keys(groupedFiles);
      setCollapsedDirectories(new Set(allDirectoryNames));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDirectories]);

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
          <CardTitle>Select Report Directories</CardTitle>
          <CardDescription>
            Add multiple directories to compare function analysis across
            different scanned reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Select
              value={currentDirectorySelection}
              onValueChange={setCurrentDirectorySelection}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a report directory to add..." />
              </SelectTrigger>
              <SelectContent>
                {directories
                  .filter(
                    (dir) =>
                      !selectedDirectories.some((sd) => sd.name === dir.name),
                  )
                  .map((dir) => (
                    <SelectItem key={dir.name} value={dir.name}>
                      <div className="flex items-center space-x-2">
                        <Folder className="h-4 w-4" />
                        <span>{dir.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => addDirectory(currentDirectorySelection)}
              disabled={!currentDirectorySelection || loading}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Selected Directories */}
          {selectedDirectories.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Selected Directories:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedDirectories.map((directory) => (
                  <Badge
                    key={directory.name}
                    variant="default"
                    className="flex items-center space-x-1 pr-1"
                  >
                    <span>{directory.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeDirectory(directory.name)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
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

      {selectedDirectories.length > 0 && !loading && (
        <div className="space-y-6">
          {/* Summary Cards for each directory */}
          {selectedDirectories.map((directory) => (
            <Card key={directory.name}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Summary: {directory.name}</span>
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
                      {directory.data.summary.metadata.scannedDirectory}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Scan Date</span>
                    </p>
                    <p className="font-medium">
                      {formatTimestamp(
                        directory.data.summary.metadata.timestamp,
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                      <Hash className="h-3 w-3" />
                      <span>Total Files</span>
                    </p>
                    <Badge variant="secondary">
                      {directory.data.summary.metadata.totalFiles}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Processing Status
                    </p>
                    <div className="flex space-x-2">
                      <Badge variant="default">
                        {directory.data.summary.metadata.successfulWrites}{" "}
                        Success
                      </Badge>
                      {directory.data.summary.metadata.errors > 0 && (
                        <Badge variant="destructive">
                          {directory.data.summary.metadata.errors} Errors
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* JSON Files List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 mr-1"
                  onClick={toggleJsonFilesCollapse}
                >
                  {isJsonFilesCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <FileText className="h-5 w-5" />
                <span>Available JSON Files</span>
                <Badge variant="outline">
                  {selectedDirectories.reduce(
                    (total, dir) => total + dir.data.jsonFiles.length,
                    0,
                  )}
                </Badge>
                {selectedJsonFiles.length > 0 && (
                  <Badge variant="default">
                    {selectedJsonFiles.length} selected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Select JSON files from multiple directories to analyze and
                compare function usage
              </CardDescription>
            </CardHeader>
            {!isJsonFilesCollapsed && (
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedJsonFiles.length ===
                        selectedDirectories.reduce(
                          (total, dir) => total + dir.data.jsonFiles.length,
                          0,
                        ) &&
                      selectedDirectories.reduce(
                        (total, dir) => total + dir.data.jsonFiles.length,
                        0,
                      ) > 0
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

                {selectedDirectories.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const directoryGroups =
                        groupFilesByDirectory(selectedDirectories);
                      const directoryNames =
                        Object.keys(directoryGroups).sort();

                      return directoryNames.map((directoryName) => {
                        const directoryFiles = directoryGroups[directoryName];
                        const isDirCollapsed =
                          isDirectoryCollapsed(directoryName);
                        const { total, selected } =
                          getDirectoryFileCount(directoryName);
                        const allSelected = selected === total && total > 0;
                        const someSelected = selected > 0 && selected < total;

                        // Group files within the directory by their paths
                        const pathGroups = groupFilesByPath(directoryFiles);
                        const pathGroupNames = Object.keys(pathGroups).sort();

                        return (
                          <div
                            key={directoryName}
                            className="border rounded-lg"
                          >
                            {/* Directory Header */}
                            <div className="flex items-center space-x-3 p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleDirectory(directoryName)}
                              >
                                {isDirCollapsed ? (
                                  <ChevronRight className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>

                              <Checkbox
                                id={`directory-${directoryName}`}
                                checked={allSelected}
                                className={
                                  someSelected
                                    ? "data-[state=checked]:bg-orange-500"
                                    : ""
                                }
                                onCheckedChange={() =>
                                  toggleDirectorySelection(directoryName)
                                }
                              />

                              <div className="flex-1 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                  <label
                                    htmlFor={`directory-${directoryName}`}
                                    className="text-sm font-semibold cursor-pointer text-blue-900 dark:text-blue-100"
                                  >
                                    {directoryName}
                                  </label>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-medium"
                                  >
                                    {selected}/{total} selected
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {total} files
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Directory Content - Path Groups */}
                            {!isDirCollapsed && (
                              <div className="p-3 space-y-2">
                                {pathGroupNames.map((pathGroupName) => {
                                  const pathGroupFiles =
                                    pathGroups[pathGroupName];
                                  const pathGroupKey = `${directoryName}/${pathGroupName}`;
                                  const isPathGroupCollapsed =
                                    isGroupCollapsed(pathGroupKey);
                                  const {
                                    total: pathTotal,
                                    selected: pathSelected,
                                  } = getPathGroupFileCount(
                                    pathGroupName,
                                    pathGroups,
                                  );
                                  const pathAllSelected =
                                    pathSelected === pathTotal && pathTotal > 0;
                                  const pathSomeSelected =
                                    pathSelected > 0 &&
                                    pathSelected < pathTotal;

                                  return (
                                    <div
                                      key={pathGroupKey}
                                      className="border rounded-md"
                                    >
                                      {/* Path Group Header */}
                                      <div className="flex items-center space-x-2 p-2 border-b bg-muted/20">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 w-5 p-0"
                                          onClick={() =>
                                            toggleGroup(pathGroupKey)
                                          }
                                        >
                                          {isPathGroupCollapsed ? (
                                            <ChevronRight className="h-3 w-3" />
                                          ) : (
                                            <ChevronDown className="h-3 w-3" />
                                          )}
                                        </Button>

                                        <Checkbox
                                          id={`pathgroup-${pathGroupKey}`}
                                          checked={pathAllSelected}
                                          className={
                                            pathSomeSelected
                                              ? "data-[state=checked]:bg-orange-500"
                                              : ""
                                          }
                                          onCheckedChange={() =>
                                            togglePathGroupSelection(
                                              pathGroupName,
                                              pathGroups,
                                            )
                                          }
                                        />

                                        <div className="flex-1 flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            <Folder className="h-3 w-3 text-muted-foreground" />
                                            <label
                                              htmlFor={`pathgroup-${pathGroupKey}`}
                                              className="text-xs font-medium cursor-pointer"
                                            >
                                              {pathGroupName === "Root"
                                                ? "Root Files"
                                                : pathGroupName}
                                            </label>
                                          </div>

                                          <div className="flex items-center space-x-2">
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {pathSelected}/{pathTotal}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Path Group Files */}
                                      {!isPathGroupCollapsed && (
                                        <div className="p-2">
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {pathGroupFiles.map(
                                              (file: FileWithDirectory) => (
                                                <div
                                                  key={`${file.directoryName}-${file.fileName}`}
                                                  className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/30 transition-colors"
                                                >
                                                  <Checkbox
                                                    id={`${file.directoryName}-${file.fileName}`}
                                                    checked={selectedJsonFiles.some(
                                                      (sf) =>
                                                        sf.fileName ===
                                                          file.fileName &&
                                                        sf.directoryName ===
                                                          file.directoryName,
                                                    )}
                                                    onCheckedChange={(
                                                      checked,
                                                    ) =>
                                                      handleFileSelection(
                                                        file,
                                                        checked as boolean,
                                                      )
                                                    }
                                                  />
                                                  <FileText className="h-3 w-3 text-muted-foreground" />
                                                  <div className="flex-1 min-w-0">
                                                    <label
                                                      htmlFor={`${file.directoryName}-${file.fileName}`}
                                                      className="text-xs font-medium truncate block cursor-pointer"
                                                    >
                                                      {formatJsonFileName(
                                                        file.fileName,
                                                      )
                                                        .split("/")
                                                        .pop()}
                                                    </label>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                      {file.fileName}
                                                    </p>
                                                  </div>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No directories selected. Add directories above to see their
                    JSON files.
                  </p>
                )}
              </CardContent>
            )}
          </Card>

          {/* Function Analysis Table */}
          <FunctionAnalysisTable
            tableData={tableData}
            selectedJsonFiles={selectedJsonFiles.map((f) => f.displayName)}
            loadingTable={loadingTable}
          />
        </div>
      )}
    </div>
  );
}
