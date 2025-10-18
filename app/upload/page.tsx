/**
 * UPLOAD PAGE - Bank Statement File Upload Component
 *
 * This page provides a comprehensive file upload interface for bank statements
 * with automatic ta      if (invalidFiles.length > 0) {
        // Show error in upload summary instead of toast
        setUploadSummary({
          show: true,
          success: false,
          message: "Invalid Files Selected",
          details: `Please select only Excel (.xlsx, .xls) or CSV files. Invalid files: ${invalidFiles.map((f) => f.name).join(", ")}`,
        });
        return;
      }eation and intelligent error handling.
 *
 * =============================================================================
 * FUNCTION DOCUMENTATION
 * =============================================================================
 *
 * MAIN COMPONENT:
 * ---------------
 * • UploadPage() - Main React component for bank statement file upload functionality
 *
 * EVENT HANDLERS:
 * --------------
 * • handleFileChange(e: React.ChangeEvent<HTMLInputElement>)
 *   - Validates and sets the selected files, ensures file types are Excel or CSV
 *
 * • handleUpload()
 *   - Main upload function that processes multiple files sequentially,
 *     handles automatic table creation, and manages upload workflow
 *   - Automatically creates database table and retries upload after successful
 *     table creation
 *
 * • handleCloseDialog()
 *   - Closes table creation dialog and resets all pending state variables
 *
 * • handleClearDataChange(checked: boolean)
 *   - Manages clear data checkbox state and shows warning dialog when enabled
 *
 * • confirmClearData()
 *   - Confirms the clear data action and closes warning dialog
 *
 * • cancelClearData()
 *   - Cancels the clear data action and resets checkbox state
 *
 * UTILITY FUNCTIONS:
 * -----------------
 * • getTableName(bank: string | null, file: File | null): string | null
 *   - Determines target database table name based on selected bank and filename
 *     patterns. Handles different bank-specific naming conventions:
 *     * DEV: test_transactions
 *     * Inter-BR-Mastercard: INMC_YYYY (extracts year from filename)
 *     * Inter-BR-Mastercard-from-PDF: INMCPDF_YYYYMM (extracts year/month from PDF filename)
 *     * Inter-BR-Account: IN_YYYY (extracts year from filename)
 *     * Inter-BR-Account-Monthly: INACC_YYYYMM (extracts year/month from filename pattern Extrato-DD-MM-YYYY-a-DD-MM-YYYY-CSV.csv)
 *     * Handelsbanken-SE: handelsbanken_transactions
 *     * AmericanExpress-SE: amex_YYYY
 *     * SEB_SJ_Prio-SE: seb_sj_prio_YYYY
 *
 * KEY FEATURES:
 * ------------
 * MULTIPLE FILE UPLOAD:
 * • Sequential processing - Processes files one by one to avoid conflicts
 * • Progress tracking - Real-time upload progress with success/error status per file
 * • Automatic table creation - Creates tables automatically when needed
 * • File validation - Checks file type (Excel/CSV) for all selected files
 *
 * TABLE MANAGEMENT:
 * • Table name generation - Smart table naming based on bank and filename
 * • Automatic table creation - Seamless table creation without manual intervention
 * • Clear data functionality - Safe data clearing with confirmation dialogs
 *
 * USER EXPERIENCE:
 * • Toast notifications - Success/error feedback for each file
 * • Progress indicators - Visual progress bar and file-by-file status
 * • Error recovery - Automatic table creation and retry on upload failure
 * • Debug information - Development-only state monitoring
 *
 * ERROR RECOVERY:
 * • Graceful error handling - Structured error responses
 * • Automatic table creation - Creates missing tables and retries upload
 *
 * SUPPORTED BANKS:
 * • DEV - Development/testing environment
 * • Inter-BR-Mastercard - Inter Brazil Mastercard accounts
 * • Inter-BR-Mastercard-from-PDF - Inter Brazil Mastercard PDF-converted statements
 * • Inter-BR-Account - Inter Brazil account statements (yearly)
 * • Inter-BR-Account-Monthly - Inter Brazil account statements (monthly, format: Extrato-DD-MM-YYYY-a-DD-MM-YYYY-CSV.csv)
 * • Handelsbanken-SE - Handelsbanken Sweden
 * • AmericanExpress-SE - American Express Sweden
 * • SEB_SJ_Prio-SE - SEB SJ Prio card Sweden
 *
 * =============================================================================
 */

"use client";

import { useState } from "react";
import {
  executeTableCreation,
  processFileData,
  uploadToSupabase,
} from "@/app/actions/fileActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProtectedRoute from "@/components/protected-route";

const BANK_OPTIONS = [
  "DEV",
  "Inter-BR-Mastercard",
  "Inter-BR-Mastercard-from-PDF",
  "Inter-BR-Account",
  "Inter-BR-Account-Monthly",
  "Handelsbanken-SE",
  "AmericanExpress-SE",
  "SEB_SJ_Prio-SE",
];

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clearData, setClearData] = useState(false);
  const [showClearDataWarning, setShowClearDataWarning] = useState(false);

  // Final upload summary
  const [uploadSummary, setUploadSummary] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    details?: string;
  }>({ show: false, success: false, message: "" });

  // Progress tracking for multiple files
  const [uploadProgress, setUploadProgress] = useState<{
    currentFile: number;
    totalFiles: number;
    currentFileName: string;
    status: string;
    results: Array<{
      fileName: string;
      status: "success" | "error" | "pending";
      message: string;
    }>;
  }>({
    currentFile: 0,
    totalFiles: 0,
    currentFileName: "",
    status: "",
    results: [],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const selectedFiles = Array.from(e.target.files);

      // Validate all files
      const invalidFiles = selectedFiles.filter(
        (file) => !file.name.match(/\.(xlsx|xls|csv)$/i),
      );

      if (invalidFiles.length > 0) {
        setUploadSummary({
          show: true,
          success: false,
          message: "Invalid Files Selected",
          details: `Please upload only Excel or CSV files. Invalid files: ${invalidFiles.map((f) => f.name).join(", ")}`,
        });
        return;
      }

      setFiles(selectedFiles);
      // Reset progress when new files are selected
      setUploadProgress({
        currentFile: 0,
        totalFiles: selectedFiles.length,
        currentFileName: "",
        status: "",
        results: selectedFiles.map((file) => ({
          fileName: file.name,
          status: "pending",
          message: "Waiting to process...",
        })),
      });
    }
  };
  const handleUpload = async () => {
    if (!files.length || !selectedBank) {
      setUploadSummary({
        show: true,
        success: false,
        message: "Upload Requirements Missing",
        details: "Please select a bank and upload at least one valid file.",
      });
      return;
    }

    setUploading(true);

    // Initialize progress
    setUploadProgress((prev) => ({
      ...prev,
      currentFile: 0,
      totalFiles: files.length,
      status: "Starting upload process...",
      results: files.map((file) => ({
        fileName: file.name,
        status: "pending",
        message: "Waiting to process...",
      })),
    }));

    try {
      // Process files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Update progress
        setUploadProgress((prev) => ({
          ...prev,
          currentFile: i + 1,
          currentFileName: file.name,
          status: `Processing file ${i + 1} of ${files.length}: ${file.name}`,
          results: prev.results.map((result, idx) =>
            idx === i
              ? { ...result, status: "pending", message: "Processing..." }
              : result,
          ),
        }));

        console.log(
          `Processing file ${i + 1}/${files.length}:`,
          selectedBank,
          "with file:",
          file.name,
          "clearData:",
          clearData,
        );

        try {
          // Process file data once
          console.log("Processing file data...");
          const processResult = await processFileData(file, selectedBank);

          if (!processResult.success) {
            // File processing failed
            setUploadProgress((prev) => ({
              ...prev,
              results: prev.results.map((res, idx) =>
                idx === i
                  ? {
                      ...res,
                      status: "error",
                      message:
                        processResult.message || "File processing failed",
                    }
                  : res,
              ),
            }));

            continue;
          }

          const processedData = processResult.data!;
          console.log("File processed successfully, attempting upload...");

          // Attempt upload
          const result = await uploadToSupabase(
            processedData.tableName,
            processedData.transactions,
            clearData,
          );

          console.log(`Upload result for ${file.name}:`, result);

          if (result.success) {
            console.log(`Upload successful for ${file.name}:`, result.message);

            // Update progress - success
            setUploadProgress((prev) => ({
              ...prev,
              results: prev.results.map((res, idx) =>
                idx === i
                  ? { ...res, status: "success", message: result.message }
                  : res,
              ),
            }));

            // Success is already displayed in the progress, no toast needed
          } else {
            // Handle different error types gracefully
            if ("error" in result && result.error === "TABLE_NOT_EXISTS") {
              console.log(`Detected TABLE_NOT_EXISTS error for ${file.name}`);
              // Use the tableName from the result if available, otherwise from processed data
              const tableName =
                (result as { tableName?: string }).tableName ||
                processedData.tableName;
              console.log(
                "Attempting automatic table creation for:",
                tableName,
              );

              // Try automatic table creation without showing manual instructions
              const createResult = await executeTableCreation(tableName);

              if (createResult.success) {
                console.log("Table created automatically, retrying upload...");

                // Retry ONLY the upload part (no file reprocessing!)
                const retryResult = await uploadToSupabase(
                  processedData.tableName,
                  processedData.transactions,
                  clearData,
                );

                console.log(
                  `Retry upload result for ${file.name}:`,
                  retryResult,
                );

                if (retryResult.success) {
                  // Update progress - success after auto-creation (don't increment currentFile, we're still on the same file)
                  setUploadProgress((prev) => ({
                    ...prev,
                    status: `File ${i + 1}/${files.length} uploaded (table auto-created)`,
                    results: prev.results.map((res, idx) =>
                      idx === i
                        ? {
                            ...res,
                            status: "success",
                            message: `Uploaded successfully (table created automatically)`,
                          }
                        : res,
                    ),
                  }));

                  // Success is already shown in progress, no toast needed
                } else {
                  // Update progress - still failed after table creation
                  setUploadProgress((prev) => ({
                    ...prev,
                    results: prev.results.map((res, idx) =>
                      idx === i
                        ? {
                            ...res,
                            status: "error",
                            message: `Upload failed after table creation: ${retryResult.message}`,
                          }
                        : res,
                    ),
                  }));

                  // Error is already shown in progress, no toast needed
                }
              } else {
                // Table creation failed - just show error without manual instructions
                console.log(
                  "Automatic table creation failed:",
                  createResult.message,
                );

                setUploadProgress((prev) => ({
                  ...prev,
                  results: prev.results.map((res, idx) =>
                    idx === i
                      ? {
                          ...res,
                          status: "error",
                          message: `Table creation failed: ${createResult.message}`,
                        }
                      : res,
                  ),
                }));

                // Error is already shown in progress, no toast needed
              }
            } else {
              // Handle other error types
              console.log(
                `Showing error for ${file.name}:`,
                "error" in result ? result.error : "No error field",
              );

              // Update progress - error
              setUploadProgress((prev) => ({
                ...prev,
                results: prev.results.map((res, idx) =>
                  idx === i
                    ? { ...res, status: "error", message: result.message }
                    : res,
                ),
              }));

              // Error is already shown in progress, no toast needed
            }
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);

          // Update progress - error
          setUploadProgress((prev) => ({
            ...prev,
            results: prev.results.map((res, idx) =>
              idx === i
                ? { ...res, status: "error", message: "Processing failed" }
                : res,
            ),
          }));

          // Error is already shown in progress, no toast needed
        }
      }

      // Final summary - use setTimeout to ensure all state updates are complete
      setTimeout(() => {
        setUploadProgress((currentProgress) => {
          console.log(
            "Final upload progress results:",
            currentProgress.results,
          );
          const successCount = currentProgress.results.filter(
            (r) => r.status === "success",
          ).length;
          const errorCount = currentProgress.results.filter(
            (r) => r.status === "error",
          ).length;
          console.log(
            `Success count: ${successCount}, Error count: ${errorCount}, Total files: ${files.length}`,
          );

          // Set the final summary based on current results
          if (successCount === files.length) {
            setUploadSummary({
              show: true,
              success: true,
              message: "All Files Uploaded Successfully!",
              details: `${successCount} files processed successfully.`,
            });
          } else if (successCount > 0) {
            setUploadSummary({
              show: true,
              success: true,
              message: "Upload Complete with Mixed Results",
              details: `${successCount} successful, ${errorCount} failed.`,
            });
          } else {
            setUploadSummary({
              show: true,
              success: false,
              message: "All Uploads Failed",
              details: "Please check the errors and try again.",
            });
          }

          return currentProgress; // Return unchanged state
        });
      }, 100); // Small delay to ensure all state updates are complete
    } catch (error) {
      // This should rarely happen now since we're returning structured results
      console.error("Unexpected error in handleUpload:", error);
      setUploadSummary({
        show: true,
        success: false,
        message: "Upload Failed",
        details: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setUploading(false);
      setUploadProgress((prev) => ({
        ...prev,
        status: "Complete",
        currentFileName: "",
      }));
    }
  };

  const handleClearDataChange = (checked: boolean) => {
    if (checked) {
      setShowClearDataWarning(true);
    } else {
      setClearData(false);
    }
  };

  const confirmClearData = () => {
    setClearData(true);
    setShowClearDataWarning(false);
  };

  const cancelClearData = () => {
    setClearData(false);
    setShowClearDataWarning(false);
  };

  // Function to get the table name that would be created for the selected bank and file
  const getTableName = (
    bank: string | null,
    file: File | null,
  ): string | null => {
    if (!bank || !file) return null;

    const fileName = file.name;

    switch (bank) {
      case "DEV":
        return "test_transactions";
      case "Inter-BR-Mastercard":
        // Extract year and month from filename for Inter-BR-Mastercard tables (format: INMC_YYYYMM)
        // Expected filename pattern: fatura-inter-YYYY-MM.csv
        const interMatch = fileName.match(/fatura-inter-(\d{4})-(\d{2})\.csv/i);
        if (interMatch) {
          const year = interMatch[1];
          const month = interMatch[2];
          return `INMC_${year}${month}`;
        }
        // Fallback to current year/month if pattern doesn't match
        const currentDate = new Date();
        const fallbackYear = currentDate.getFullYear();
        const fallbackMonth = String(currentDate.getMonth() + 1).padStart(
          2,
          "0",
        );
        return `INMC_${fallbackYear}${fallbackMonth}`;
      case "Inter-BR-Mastercard-from-PDF":
        // Extract year and month from filename for Inter-BR-Mastercard-from-PDF tables (format: INMCPDF_YYYYMM)
        // Expected filename pattern: fatura-inter-YYYY-MM_fromPDF.csv
        const interPDFMatch = fileName.match(
          /fatura-inter-(\d{4})-(\d{2})_fromPDF\.csv/i,
        );
        if (interPDFMatch) {
          const year = interPDFMatch[1];
          const month = interPDFMatch[2];
          return `INMCPDF_${year}${month}`;
        }
        // Fallback to current year/month if pattern doesn't match
        const currentDatePDF = new Date();
        const fallbackYearPDF = currentDatePDF.getFullYear();
        const fallbackMonthPDF = String(currentDatePDF.getMonth() + 1).padStart(
          2,
          "0",
        );
        return `INMCPDF_${fallbackYearPDF}${fallbackMonthPDF}`;
      case "Inter-BR-Account":
        // Extract year from filename for Inter-BR-Account tables (format: IN_YYYY)
        const accountYearMatch = fileName.match(/(\d{4})/);
        return accountYearMatch ? `IN_${accountYearMatch[1]}` : "IN_2025";
      case "Inter-BR-Account-Monthly":
        // Extract year and month from filename for Inter-BR-Account-Monthly tables (format: INACC_YYYYMM)
        // Expected filename pattern: Extrato-DD-MM-YYYY-a-DD-MM-YYYY-CSV.csv
        const monthlyMatch = fileName.match(
          /Extrato-\d{2}-(\d{2})-(\d{4})-a-/i,
        );
        if (monthlyMatch) {
          const month = monthlyMatch[1]; // "01"
          const year = monthlyMatch[2]; // "2025"
          return `INACC_${year}${month}`;
        }
        // Fallback to current year/month if pattern doesn't match
        const currentDateMonthly = new Date();
        const fallbackYearMonthly = currentDateMonthly.getFullYear();
        const fallbackMonthMonthly = String(
          currentDateMonthly.getMonth() + 1,
        ).padStart(2, "0");
        return `INACC_${fallbackYearMonthly}${fallbackMonthMonthly}`;
      case "Handelsbanken-SE":
        // Extract year from filename for Handelsbanken tables (format: HB_YYYY)
        const hbYearMatch = fileName.match(/(\d{4})/);
        return hbYearMatch
          ? `HB_${hbYearMatch[1]}`
          : `HB_${new Date().getFullYear()}`;
      case "AmericanExpress-SE":
        // Extract table name from filename (e.g., "AM_202503.csv" -> "AM_202503")
        return fileName.replace(/\.(csv|xlsx|xls)$/i, "");
      case "SEB_SJ_Prio-SE":
        // Extract table name from filename (e.g., "SEB_202503.xls" -> "SEB_202503")
        return fileName.replace(/\.(csv|xlsx|xls)$/i, "");
      default:
        return null;
    }
  };

  // Get the current table names that would be affected (deduplicated)
  const targetTableNames = Array.from(
    new Set(
      files.map((file) => getTableName(selectedBank, file)).filter(Boolean),
    ),
  );

  return (
    <ProtectedRoute allowedUserIds={["2b5c5467-04e0-4820-bea9-1645821fa1b7"]}>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Upload Bank Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Bank selection dropdown */}
            <Select onValueChange={setSelectedBank}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a bank account" />
              </SelectTrigger>
              <SelectContent>
                {BANK_OPTIONS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* File input field - now supports multiple files */}
            <div className="space-y-2">
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                multiple
                className="cursor-pointer"
              />
              {files.length > 0 && (
                <div className="text-sm text-gray-600">
                  <strong>
                    {files.length} file{files.length > 1 ? "s" : ""} selected:
                  </strong>
                  <ul className="mt-1 space-y-1">
                    {files.slice(0, 3).map((file, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-500 truncate"
                      >
                        • {file.name}
                      </li>
                    ))}
                    {files.length > 3 && (
                      <li className="text-xs text-gray-500">
                        • ... and {files.length - 3} more file
                        {files.length - 3 > 1 ? "s" : ""}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            {/* Clear data option */}
            <div
              className={`flex flex-col space-y-2 p-3 rounded-md border ${
                clearData
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clearData"
                  checked={clearData}
                  onCheckedChange={handleClearDataChange}
                />
                <label
                  htmlFor="clearData"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Clear existing data before upload
                </label>
              </div>
              {targetTableNames.length > 0 && (
                <div className="ml-6 text-xs text-gray-600">
                  Target table{targetTableNames.length > 1 ? "s" : ""}:{" "}
                  <div className="mt-1">
                    {targetTableNames.slice(0, 3).map((tableName, index) => (
                      <code
                        key={index}
                        className="bg-gray-100 px-1 rounded mr-2 mb-1 inline-block"
                      >
                        {tableName}
                      </code>
                    ))}
                    {targetTableNames.length > 3 && (
                      <span className="text-xs text-gray-500">
                        ... and {targetTableNames.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              className={`text-xs -mt-2 ${
                clearData ? "text-red-600 font-medium" : "text-gray-600"
              }`}
            >
              {clearData
                ? targetTableNames.length > 0
                  ? `🚨 ALL existing data in ${targetTableNames.length} table${targetTableNames.length > 1 ? "s" : ""} will be deleted before upload!`
                  : "🚨 ALL existing data will be deleted before upload!"
                : "⚠️ Check this option when uploading updated versions of the same bank statements to avoid duplicates"}
            </div>
            {/* Upload Progress Display */}
            {uploadProgress.totalFiles > 0 && (
              <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">
                    {uploading ? "Upload Progress" : "Upload Results"}
                  </span>
                  <span className="text-sm text-blue-600">
                    {uploadProgress.currentFile} / {uploadProgress.totalFiles}
                  </span>
                </div>

                {uploadProgress.status && (
                  <div className="text-sm text-blue-700">
                    {uploadProgress.status}
                  </div>
                )}

                {/* Progress bar */}
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(uploadProgress.currentFile / uploadProgress.totalFiles) * 100}%`,
                    }}
                  ></div>
                </div>

                {/* Results list */}
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadProgress.results.map((result, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded flex items-center ${
                        result.status === "success"
                          ? "bg-green-100 text-green-800"
                          : result.status === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span className="mr-2">
                        {result.status === "success"
                          ? "✅"
                          : result.status === "error"
                            ? "❌"
                            : "⏳"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">
                          {result.fileName}
                        </div>
                        <div className="truncate text-xs opacity-75">
                          {result.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Upload Summary */}
            {uploadSummary.show && (
              <div
                className={`p-4 border rounded-md ${
                  uploadSummary.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {uploadSummary.success ? "✅" : "❌"}
                  </span>
                  <div>
                    <div
                      className={`font-medium ${
                        uploadSummary.success
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {uploadSummary.message}
                    </div>
                    <div
                      className={`text-sm ${
                        uploadSummary.success
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {uploadSummary.details}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setUploadSummary({
                      show: false,
                      success: false,
                      message: "",
                      details: "",
                    })
                  }
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            {/* Upload button */}
            <Button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="w-full"
            >
              {uploading
                ? `Uploading ${uploadProgress.currentFile}/${uploadProgress.totalFiles}...`
                : files.length === 0
                  ? "Select files to upload"
                  : files.length === 1
                    ? "Upload File"
                    : `Upload ${files.length} Files`}
            </Button>{" "}
            {/* Debug info */}
            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-gray-500 mt-2">
                Clear Data: {clearData ? "YES" : "NO"} | Target Table:{" "}
                {targetTableNames?.join(", ") || "None"}
              </div>
            )}
          </CardContent>
        </Card>{" "}
        {/* Clear Data Warning Dialog */}
        <Dialog
          open={showClearDataWarning}
          onOpenChange={setShowClearDataWarning}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">
                ⚠️ Clear Existing Data
              </DialogTitle>
              <DialogDescription>
                You are about to clear ALL existing data from the following
                table before uploading new data:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-2 bg-gray-100 rounded text-center font-mono text-sm">
                {targetTableNames?.join(", ") || "Unknown tables"}
              </div>

              <div className="text-sm text-gray-600">
                <strong>This action cannot be undone!</strong>
                <br />
                <br />
                Only proceed if you want to replace all existing records with
                the new file data.
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={cancelClearData}>
                Cancel
              </Button>
              <Button
                onClick={confirmClearData}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Clear Data
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
