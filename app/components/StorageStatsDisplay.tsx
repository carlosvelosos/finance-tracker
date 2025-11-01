"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  Trash2,
  HardDrive,
  FileJson,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface StorageStats {
  totalSize: number;
  fullDataSize: number;
  indexSize: number;
  totalFiles: number;
  fullDataFiles: number;
  indexFileCount: number;
  orphanedFiles: number;
  orphanedFilesList: string[];
}

export function StorageStatsDisplay() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cleanupResult, setCleanupResult] = useState<{
    deleted: number;
    errors: number;
  } | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    setCleanupResult(null);
    try {
      const response = await fetch("/api/smart-fetch/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || "Failed to load statistics");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const cleanupOrphanedFiles = async () => {
    if (!stats || stats.orphanedFiles === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${stats.orphanedFiles} orphaned file(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setCleaning(true);
    setError(null);
    try {
      const response = await fetch("/api/smart-fetch/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: stats.orphanedFilesList }),
      });

      const data = await response.json();
      if (data.success) {
        setCleanupResult({
          deleted: data.deleted,
          errors: data.errors,
        });
        // Refresh stats after cleanup
        await fetchStats();
      } else {
        setError(data.error || "Failed to cleanup orphaned files");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="px-4 pb-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Total Storage</span>
          </div>
          <p className="text-2xl font-bold">{formatBytes(stats.totalSize)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalFiles} files
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileJson className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Full Data</span>
          </div>
          <p className="text-2xl font-bold">
            {formatBytes(stats.fullDataSize)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.fullDataFiles} files
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileJson className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Monthly Indexes</span>
          </div>
          <p className="text-2xl font-bold">{formatBytes(stats.indexSize)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.indexFileCount} files
          </p>
        </div>
      </div>

      {/* Orphaned Files Section */}
      {stats.orphanedFiles > 0 && (
        <div className="border border-orange-200 dark:border-orange-900 rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold text-orange-900 dark:text-orange-100">
                  Orphaned Files Detected
                </span>
                <Badge
                  variant="secondary"
                  className="bg-orange-200 dark:bg-orange-900"
                >
                  {stats.orphanedFiles}
                </Badge>
              </div>
              <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                These full data files exist but are not referenced in any
                monthly index. They can be safely removed to free up space.
              </p>
              {stats.orphanedFilesList.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-orange-700 dark:text-orange-300 hover:underline mb-2">
                    Show file list
                  </summary>
                  <div className="bg-orange-100 dark:bg-orange-950/50 rounded p-2 max-h-32 overflow-y-auto font-mono">
                    {stats.orphanedFilesList.map((file, idx) => (
                      <div
                        key={idx}
                        className="text-orange-900 dark:text-orange-100"
                      >
                        {file}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
            <Button
              onClick={cleanupOrphanedFiles}
              disabled={cleaning}
              variant="destructive"
              size="sm"
            >
              {cleaning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clean Up
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Cleanup Success Message */}
      {cleanupResult && cleanupResult.deleted > 0 && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Successfully deleted {cleanupResult.deleted} file(s)
            {cleanupResult.errors > 0 && ` (${cleanupResult.errors} error(s))`}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          onClick={fetchStats}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Stats
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
