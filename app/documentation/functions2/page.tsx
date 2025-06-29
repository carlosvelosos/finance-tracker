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
import { FileText, Folder, Calendar, Hash } from "lucide-react";

interface ReportDirectory {
  name: string;
  type: "directory";
  isNew: boolean;
}

interface SummaryData {
  metadata: {
    scannedDirectory: string;
    timestamp: string;
    scanDate: string;
    totalFiles: number;
    successfulWrites: number;
    errors: number;
  };
  fileList: Array<{
    originalPath: string;
    jsonFile: string;
  }>;
}

interface DirectoryData {
  summary: SummaryData;
  jsonFiles: string[];
}

export default function FunctionReportsPage() {
  const [directories, setDirectories] = useState<ReportDirectory[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<string>("");
  const [directoryData, setDirectoryData] = useState<DirectoryData | null>(
    null,
  );
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
              </CardTitle>
              <CardDescription>
                JSON files containing function analysis data (excluding summary)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {directoryData.jsonFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {directoryData.jsonFiles.map((fileName) => (
                    <div
                      key={fileName}
                      className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {formatJsonFileName(fileName)}
                        </p>
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
