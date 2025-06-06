"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";

interface WeeklyBreakdown {
  week: string;
  start: string;
  end: string;
}

interface Email {
  id?: string;
  snippet?: string;
  headers?: Record<string, string>;
  date?: string;
  from?: string;
  subject?: string;
  to?: string;
  [key: string]: string | Record<string, string> | undefined;
}

interface GmailExportData {
  dateRange: {
    start: string;
    end: string;
  };
  totalEmails: number;
  weeklyBreakdown: WeeklyBreakdown[];
  emails: Email[];
  exportDate: string;
  fetchedBy: string;
}

interface SourceGmailData {
  dateRange: {
    start: string;
    end: string;
  };
  totalEmails: number;
  weeklyBreakdown?: WeeklyBreakdown[];
  emails: Email[];
  exportDate: string;
  fetchedBy: string;
}

interface EmailFile {
  name: string;
  size: number;
  dateRange: {
    start: string;
    end: string;
  };
  totalEmails: number;
  data: SourceGmailData;
}

interface MergeResult {
  success: boolean;
  mergedFile: {
    name: string;
    size: number;
    dateRange: {
      start: string;
      end: string;
    };
    totalEmails: number;
    weeklyBreakdownPeriods: number;
  };
  originalFiles: {
    name: string;
    emails: number;
  }[];
  duplicatesRemoved: number;
  processingTime: number;
}

export default function EmailMergePage() {
  const [selectedFiles, setSelectedFiles] = useState<EmailFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    setError(null);
    const emailFiles: EmailFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.name.endsWith(".json")) {
        setError(`File ${file.name} is not a JSON file`);
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate it's a Gmail export file
        if (!data.emails || !data.dateRange || !data.totalEmails) {
          setError(
            `File ${file.name} doesn't appear to be a valid Gmail export file`,
          );
          return;
        }

        emailFiles.push({
          name: file.name,
          size: file.size,
          dateRange: data.dateRange,
          totalEmails: data.totalEmails,
          data: data,
        });
      } catch (err) {
        setError(
          `Error parsing ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
        return;
      }
    }

    setSelectedFiles(emailFiles);
  };

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      setError("Please select at least 2 files to merge");
      return;
    }

    setIsProcessing(true);
    setError(null);
    const startTime = Date.now();

    try {
      // Sort files by start date
      const sortedFiles = [...selectedFiles].sort(
        (a, b) =>
          new Date(a.dateRange.start).getTime() -
          new Date(b.dateRange.start).getTime(),
      ); // Create merged data structure
      const merged: GmailExportData = {
        dateRange: {
          start: sortedFiles[0].dateRange.start,
          end: sortedFiles[sortedFiles.length - 1].dateRange.end,
        },
        totalEmails: 0,
        weeklyBreakdown: [],
        emails: [],
        exportDate: new Date().toISOString(),
        fetchedBy: sortedFiles[0].data.fetchedBy,
      }; // Merge weekly breakdowns
      for (const file of sortedFiles) {
        if (
          file.data.weeklyBreakdown &&
          Array.isArray(file.data.weeklyBreakdown)
        ) {
          merged.weeklyBreakdown.push(...file.data.weeklyBreakdown);
        }
      }

      // Track seen IDs and merge emails
      const seenIds = new Set();
      let duplicatesCount = 0;

      for (const file of sortedFiles) {
        for (const email of file.data.emails || []) {
          if (email.id && seenIds.has(email.id)) {
            duplicatesCount++;
            continue;
          }

          if (email.id) {
            seenIds.add(email.id);
          }

          merged.emails.push(email);
        }
      }

      merged.totalEmails = merged.emails.length;

      // Create download blob
      const mergedJson = JSON.stringify(merged, null, 2);
      const blob = new Blob([mergedJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Generate filename
      const startDate = merged.dateRange.start.split("T")[0];
      const endDate = merged.dateRange.end.split("T")[0];
      const filename = `gmail-export-merged-${startDate}-to-${endDate}.json`;

      // Create download link
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const processingTime = Date.now() - startTime;

      setMergeResult({
        success: true,
        mergedFile: {
          name: filename,
          size: blob.size,
          dateRange: merged.dateRange,
          totalEmails: merged.totalEmails,
          weeklyBreakdownPeriods: merged.weeklyBreakdown.length,
        },
        originalFiles: selectedFiles.map((f) => ({
          name: f.name,
          emails: f.totalEmails,
        })),
        duplicatesRemoved: duplicatesCount,
        processingTime,
      });
    } catch (err) {
      setError(
        `Merge failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gmail Export Merger</h1>
        <p className="text-muted-foreground">
          Select multiple Gmail export JSON files to merge them into a single
          file with duplicate removal.
        </p>
      </div>

      {/* File Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Select Files
          </CardTitle>
          <CardDescription>
            Choose multiple Gmail export JSON files to merge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full h-12"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose JSON Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">
                  Selected Files ({selectedFiles.length})
                </h3>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(file.dateRange.start)} -{" "}
                          {formatDate(file.dateRange.end)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {file.totalEmails} emails
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Merge Button */}
      {selectedFiles.length >= 2 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Button
              onClick={handleMerge}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing
                ? "Merging Files..."
                : `Merge ${selectedFiles.length} Files`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Merge Results */}
      {mergeResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Merge Complete!
            </CardTitle>
            <CardDescription>
              Your files have been successfully merged and downloaded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* New Merged File */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Download className="h-4 w-4" />
                New Merged File
              </h3>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{mergeResult.mergedFile.name}</p>
                  <Badge variant="default">
                    {mergeResult.mergedFile.totalEmails} emails
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>
                      <strong>Date Range:</strong>
                    </p>
                    <p>
                      {formatDate(mergeResult.mergedFile.dateRange.start)} -{" "}
                      {formatDate(mergeResult.mergedFile.dateRange.end)}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>File Size:</strong>{" "}
                      {formatFileSize(mergeResult.mergedFile.size)}
                    </p>
                    <p>
                      <strong>Weekly Periods:</strong>{" "}
                      {mergeResult.mergedFile.weeklyBreakdownPeriods}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Key Statistics */}
            <div>
              <h3 className="font-semibold mb-3">Key Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {mergeResult.mergedFile.totalEmails}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Emails</p>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {mergeResult.duplicatesRemoved}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Duplicates Removed
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {mergeResult.processingTime}ms
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Processing Time
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Original Files */}
            <div>
              <h3 className="font-semibold mb-3">Original Files</h3>
              <div className="space-y-2">
                {mergeResult.originalFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <p className="font-medium">{file.name}</p>
                    <Badge variant="outline">{file.emails} emails</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <Button
              onClick={() => {
                setSelectedFiles([]);
                setMergeResult(null);
                setError(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              variant="outline"
              className="w-full"
            >
              Merge More Files
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
