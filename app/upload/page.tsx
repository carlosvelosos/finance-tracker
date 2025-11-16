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
import {
  analyzeUploadConflicts,
  ConflictAnalysis,
  Transaction,
} from "@/app/actions/conflictAnalysis";
import {
  analyzeCategoryMatches,
  CategoryAnalysis,
} from "@/app/actions/categoryAnalysis";
import { MergeConflictDialog } from "@/components/MergeConflictDialog";
import { CategoryAssignmentDialog } from "@/components/CategoryAssignmentDialog";
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

// Bank-specific upload instructions
const BANK_INSTRUCTIONS: Record<
  string,
  {
    format: string;
    columns: string[];
    fileNamePattern: string;
    example: string;
    notes?: string[];
  }
> = {
  DEV: {
    format: "CSV",
    columns: [
      "Date (DD/MM/YYYY)",
      "Description",
      "[Empty]",
      "Comment",
      "Amount (R$ format)",
    ],
    fileNamePattern: "Any .csv or .xlsx file",
    example: "test-transactions.csv",
    notes: [
      "Development/testing environment",
      "Amount format: R$ 1.234,56 (Brazilian format with R$ prefix)",
    ],
  },
  "Inter-BR-Mastercard": {
    format: "CSV",
    columns: [
      "Date (DD/MM/YYYY)",
      "Description",
      "[Empty]",
      "Outcome",
      "Amount (R$ format)",
    ],
    fileNamePattern: "fatura-inter-YYYY-MM.csv",
    example: "fatura-inter-2025-03.csv",
    notes: [
      "Month and year are extracted from filename",
      "Creates table: INMC_YYYYMM",
      "Amount format: R$ 1.234,56 (Brazilian format)",
    ],
  },
  "Inter-BR-Mastercard-from-PDF": {
    format: "CSV (converted from PDF)",
    columns: [
      "Date (Portuguese format)",
      "Movimentação",
      "Tipo",
      "Valor",
      "Beneficiário",
    ],
    fileNamePattern: "fatura-inter-YYYY-MM_fromPDF.csv",
    example: "fatura-inter-2025-03_fromPDF.csv",
    notes: [
      "For PDF-converted bank statements",
      "Creates table: INMCPDF_YYYYMM",
      "Date format: Portuguese month names (e.g., '15 de janeiro de 2025')",
      "Amount column (Valor): Brazilian format",
    ],
  },
  "Inter-BR-Account": {
    format: "CSV (semicolon-delimited)",
    columns: ["Data Lançamento (DD/MM/YYYY)", "Descrição", "Valor", "Saldo"],
    fileNamePattern: "Any file containing YYYY in name",
    example: "extrato-2025.csv",
    notes: [
      "Year extracted from filename or first transaction date",
      "Creates table: IN_YYYY",
      "Uses semicolon (;) as delimiter",
      "Amount and Balance in Brazilian format (1.234,56)",
    ],
  },
  "Inter-BR-Account-Monthly": {
    format: "CSV (semicolon-delimited)",
    columns: ["Data Lançamento (DD/MM/YYYY)", "Descrição", "Valor", "Saldo"],
    fileNamePattern: "Extrato-DD-MM-YYYY-a-DD-MM-YYYY-CSV.csv",
    example: "Extrato-01-03-2025-a-31-03-2025-CSV.csv",
    notes: [
      "Year and month extracted from filename pattern",
      "Creates table: INACC_YYYYMM",
      "Uses semicolon (;) as delimiter",
      "Amount and Balance in Brazilian format",
    ],
  },
  "Handelsbanken-SE": {
    format: "CSV or Excel",
    columns: ["[Metadata]", "Transaktionsdatum", "Text", "Belopp", "Saldo"],
    fileNamePattern: "Any file containing YYYY in name",
    example: "transactions-2025.csv",
    notes: [
      "First 9 rows contain metadata (will be skipped)",
      "Row 6 format: 'Period: YYYY-MM-DD - YYYY-MM-DD'",
      "Year extracted from Period row",
      "Creates table: HB_YYYY",
      "Transactions start from row 9",
      "Amount format: Swedish (comma as decimal separator)",
    ],
  },
  "AmericanExpress-SE": {
    format: "CSV",
    columns: ["Date (MM/DD/YYYY)", "Description", "Amount (Swedish format)"],
    fileNamePattern: "AM_YYYYMM.csv",
    example: "AM_202503.csv",
    notes: [
      "Table name taken directly from filename (without extension)",
      "Date format: MM/DD/YYYY (American format)",
      "Amount format: Swedish (comma as decimal, dot as thousands)",
    ],
  },
  "SEB_SJ_Prio-SE": {
    format: "Excel (.xls)",
    columns: [
      "Datum",
      "Bokfört",
      "Specifikation",
      "...",
      "...",
      "...",
      "Belopp",
    ],
    fileNamePattern: "SEB_YYYYMM.xls",
    example: "SEB_202503.xls",
    notes: [
      "Table name taken directly from filename (without extension)",
      "First 17 rows contain metadata (will be skipped)",
      "Row 3 contains year: 'Månad: [Month] YYYY'",
      "Datum column: Excel serial date or MM-DD format",
      "Amount (Belopp) in column 7: Swedish format with comma",
    ],
  },
};

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clearData, setClearData] = useState(false);
  const [showClearDataWarning, setShowClearDataWarning] = useState(false);

  // NEW: Conflict resolution state
  const [autoSkipDuplicates, setAutoSkipDuplicates] = useState(false);
  const [conflictAnalysis, setConflictAnalysis] =
    useState<ConflictAnalysis | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  // Removed unused currentFileIndex state

  // NEW: Category assignment state (Step 2)
  const [categoryAnalysis, setCategoryAnalysis] =
    useState<CategoryAnalysis | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  // NEW: Category analysis progress
  const [categoryProgress, setCategoryProgress] = useState<{
    show: boolean;
    stage: string;
    message: string;
    current: number;
    total: number;
  }>({ show: false, stage: "", message: "", current: 0, total: 0 });

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

    // Start with first file
    await processNextFile(0);
  };

  // NEW: Process files with conflict resolution
  const processNextFile = async (fileIndex: number) => {
    if (fileIndex >= files.length) {
      // All files processed
      return;
    }

    const file = files[fileIndex];
    setUploading(true);

    try {
      console.log(
        `Processing file ${fileIndex + 1}/${files.length}:`,
        file.name,
      );

      // Step 1: Process file data
      const processResult = await processFileData(file, selectedBank!);

      if (!processResult.success) {
        setUploadSummary({
          show: true,
          success: false,
          message: "File Processing Failed",
          details: processResult.message || "Failed to process file",
        });
        setUploading(false);
        return;
      }

      const { tableName, transactions } = processResult.data!;

      // Step 2: If clearData is enabled, use old direct upload flow
      if (clearData) {
        console.log("Clear data enabled - using direct upload flow");
        const uploadResult = await uploadToSupabase(
          tableName,
          transactions,
          true,
        );

        if (uploadResult.success) {
          setUploadSummary({
            show: true,
            success: true,
            message: "Upload Successful!",
            details: uploadResult.message,
          });
        } else {
          // Handle table creation if needed
          if (
            "error" in uploadResult &&
            uploadResult.error === "TABLE_NOT_EXISTS"
          ) {
            const createResult = await executeTableCreation(tableName);
            if (createResult.success) {
              const retryResult = await uploadToSupabase(
                tableName,
                transactions,
                true,
              );
              setUploadSummary({
                show: true,
                success: retryResult.success,
                message: retryResult.success
                  ? "Upload Successful!"
                  : "Upload Failed",
                details: retryResult.message,
              });
            } else {
              setUploadSummary({
                show: true,
                success: false,
                message: "Table Creation Failed",
                details: createResult.message,
              });
            }
          } else {
            setUploadSummary({
              show: true,
              success: false,
              message: "Upload Failed",
              details: uploadResult.message,
            });
          }
        }
        setUploading(false);
        return;
      }

      // Step 3: NEW - Analyze for conflicts
      console.log("Analyzing conflicts...");
      const analysis = await analyzeUploadConflicts(
        tableName,
        transactions,
        autoSkipDuplicates,
      );

      console.log("Conflict analysis complete:", {
        safe: analysis.safeToAdd.length,
        conflicts: analysis.conflicts.length,
        autoSkipped: analysis.autoSkipped.length,
      });

      // Step 4: Check if there's anything to upload
      const totalToReview =
        analysis.safeToAdd.length + analysis.conflicts.length;

      if (totalToReview === 0 && analysis.autoSkipped.length > 0) {
        // All transactions were auto-skipped
        setUploadSummary({
          show: true,
          success: false,
          message: "No New Transactions",
          details: `All ${analysis.autoSkipped.length} transactions already exist in the database.`,
        });
        setUploading(false);
        return;
      }

      if (totalToReview === 0 && analysis.autoSkipped.length === 0) {
        // No transactions at all
        setUploadSummary({
          show: true,
          success: false,
          message: "No Transactions Found",
          details: "The file appears to be empty or has no valid transactions.",
        });
        setUploading(false);
        return;
      }

      // Step 5: Show merge dialog if there are conflicts or safe transactions
      setConflictAnalysis(analysis);
      setShowMergeDialog(true);
      setUploading(false);
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadSummary({
        show: true,
        success: false,
        message: "Processing Error",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      setUploading(false);
    }
  };

  // NEW: Handle conflict resolution
  const handleResolveConflicts = async (transactionsToAdd: Transaction[]) => {
    if (!conflictAnalysis) return;

    setShowMergeDialog(false);
    setUploading(true);

    const tableName = conflictAnalysis.tableName;

    try {
      console.log("Uploading resolved transactions:", transactionsToAdd.length);

      // Upload approved transactions
      const result = await uploadToSupabase(
        tableName,
        transactionsToAdd,
        false, // Never clear data in merge mode
      );

      if (result.success) {
        // Step 1 complete! Now check if we should trigger Step 2 (category assignment)
        console.log("Upload successful, analyzing categories...");

        try {
          // Show progress UI
          setCategoryProgress({
            show: true,
            stage: "discovering",
            message: "Starting category analysis...",
            current: 0,
            total: 1,
          });

          // Analyze categories for newly uploaded transactions
          const analysis = await analyzeCategoryMatches(
            tableName,
            transactionsToAdd,
            (progress) => {
              // Update progress state
              setCategoryProgress({
                show: true,
                stage: progress.stage,
                message: progress.message,
                current: progress.current,
                total: progress.total,
              });
            },
          );

          // Hide progress UI
          setCategoryProgress({
            show: false,
            stage: "",
            message: "",
            current: 0,
            total: 0,
          });

          if (analysis.matches.length > 0) {
            // Show category assignment dialog (Step 2)
            setCategoryAnalysis(analysis);
            setShowCategoryDialog(true);
          } else {
            // No transactions need categorization
            setUploadSummary({
              show: true,
              success: true,
              message: "Upload Successful!",
              details: `${result.message} All transactions already categorized.`,
            });
          }
        } catch (categoryError) {
          console.error("Category analysis failed:", categoryError);
          // Hide progress UI
          setCategoryProgress({
            show: false,
            stage: "",
            message: "",
            current: 0,
            total: 0,
          });
          // Don't fail the upload if category analysis fails
          setUploadSummary({
            show: true,
            success: true,
            message: "Upload Successful!",
            details: `${result.message} (Category analysis skipped due to error)`,
          });
        }
      } else {
        // Handle table creation if needed
        if ("error" in result && result.error === "TABLE_NOT_EXISTS") {
          const createResult = await executeTableCreation(tableName);
          if (createResult.success) {
            const retryResult = await uploadToSupabase(
              tableName,
              transactionsToAdd,
              false,
            );

            if (retryResult.success) {
              // Try category analysis after retry
              try {
                setCategoryProgress({
                  show: true,
                  stage: "discovering",
                  message: "Starting category analysis...",
                  current: 0,
                  total: 1,
                });

                const analysis = await analyzeCategoryMatches(
                  tableName,
                  transactionsToAdd,
                  (progress) => {
                    setCategoryProgress({
                      show: true,
                      stage: progress.stage,
                      message: progress.message,
                      current: progress.current,
                      total: progress.total,
                    });
                  },
                );

                setCategoryProgress({
                  show: false,
                  stage: "",
                  message: "",
                  current: 0,
                  total: 0,
                });

                if (analysis.matches.length > 0) {
                  setCategoryAnalysis(analysis);
                  setShowCategoryDialog(true);
                } else {
                  setUploadSummary({
                    show: true,
                    success: true,
                    message: "Upload Successful!",
                    details: `${retryResult.message} All transactions already categorized.`,
                  });
                }
              } catch {
                setCategoryProgress({
                  show: false,
                  stage: "",
                  message: "",
                  current: 0,
                  total: 0,
                });
                setUploadSummary({
                  show: true,
                  success: true,
                  message: "Upload Successful!",
                  details: retryResult.message,
                });
              }
            } else {
              setUploadSummary({
                show: true,
                success: false,
                message: "Upload Failed",
                details: retryResult.message,
              });
            }
          } else {
            setUploadSummary({
              show: true,
              success: false,
              message: "Table Creation Failed",
              details: createResult.message,
            });
          }
        } else {
          setUploadSummary({
            show: true,
            success: false,
            message: "Upload Failed",
            details: result.message,
          });
        }
      }
    } catch (error) {
      console.error("Error uploading transactions:", error);
      setUploadSummary({
        show: true,
        success: false,
        message: "Upload Error",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setUploading(false);
      setConflictAnalysis(null);
    }
  };

  // NEW: Handle cancel from merge dialog
  const handleCancelMerge = () => {
    setShowMergeDialog(false);
    setConflictAnalysis(null);
    setUploading(false);
  };

  // NEW: Handle category assignment completion (Step 2)
  const handleCategoryComplete = () => {
    setShowCategoryDialog(false);
    setCategoryAnalysis(null);
    setUploadSummary({
      show: true,
      success: true,
      message: "Categories Applied Successfully!",
      details: "All transactions have been categorized and saved.",
    });
  };

  // NEW: Handle skip categorization (Step 2)
  const handleCategorySkip = () => {
    setShowCategoryDialog(false);
    setCategoryAnalysis(null);
    setUploadSummary({
      show: true,
      success: true,
      message: "Upload Complete - Categorization Skipped",
      details:
        "Transactions remain as &quot;Unknown&quot; category. You can categorize them later in the app.",
    });
  };

  // ...existing code...

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
      <div className="min-h-screen bg-[#121212] text-white">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-400">
              Upload Bank Statement
            </h1>
            <p className="text-gray-400 text-lg">
              Select your bank and upload transaction files
            </p>
          </div>

          <Card className="bg-[#1E1E1E] border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-green-400">
                Upload Files
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Bank selection dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bank Account
                </label>
                <Select onValueChange={setSelectedBank}>
                  <SelectTrigger className="w-full bg-[#121212] border-gray-600 text-white focus:border-green-500">
                    <SelectValue placeholder="Select a bank account" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-gray-600">
                    {BANK_OPTIONS.map((bank) => (
                      <SelectItem
                        key={bank}
                        value={bank}
                        className="text-white hover:bg-[#121212] focus:bg-[#121212]"
                      >
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bank-specific upload instructions */}
              {selectedBank && BANK_INSTRUCTIONS[selectedBank] && (
                <div className="space-y-3 p-4 bg-blue-900/20 border border-blue-700 rounded-md animate-in slide-in-from-top duration-300">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-400 text-xl mt-0.5">📋</div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-300 mb-2">
                        Expected File Format for {selectedBank}
                      </h3>

                      <div className="space-y-2 text-xs">
                        {/* File format */}
                        <div>
                          <span className="text-gray-400">File Format: </span>
                          <code className="bg-[#121212] border border-gray-600 px-1.5 py-0.5 rounded text-blue-300">
                            {BANK_INSTRUCTIONS[selectedBank].format}
                          </code>
                        </div>

                        {/* Expected columns */}
                        <div>
                          <span className="text-gray-400">
                            Expected Columns:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {BANK_INSTRUCTIONS[selectedBank].columns.map(
                              (col, idx) => (
                                <code
                                  key={idx}
                                  className="bg-[#121212] border border-gray-600 px-1.5 py-0.5 rounded text-green-300 text-[10px]"
                                >
                                  {col}
                                </code>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Filename pattern */}
                        <div>
                          <span className="text-gray-400">
                            Filename Pattern:{" "}
                          </span>
                          <code className="bg-[#121212] border border-gray-600 px-1.5 py-0.5 rounded text-yellow-300">
                            {BANK_INSTRUCTIONS[selectedBank].fileNamePattern}
                          </code>
                        </div>

                        {/* Example */}
                        <div>
                          <span className="text-gray-400">Example: </span>
                          <code className="bg-[#121212] border border-gray-600 px-1.5 py-0.5 rounded text-gray-300">
                            {BANK_INSTRUCTIONS[selectedBank].example}
                          </code>
                        </div>

                        {/* Additional notes */}
                        {BANK_INSTRUCTIONS[selectedBank].notes &&
                          BANK_INSTRUCTIONS[selectedBank].notes!.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-blue-800">
                              <span className="text-gray-400 block mb-1">
                                ⚠️ Important Notes:
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-gray-300">
                                {BANK_INSTRUCTIONS[selectedBank].notes!.map(
                                  (note, idx) => (
                                    <li key={idx} className="text-[10px]">
                                      {note}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* File input field - now supports multiple files */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Files
                </label>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  multiple
                  className="cursor-pointer bg-[#121212] border-gray-600 text-white file:bg-green-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md file:mr-4 file:inline-flex file:items-center hover:border-green-500"
                />
                {files.length > 0 && (
                  <div className="text-sm text-gray-300">
                    <strong>
                      {files.length} file{files.length > 1 ? "s" : ""} selected:
                    </strong>
                    <ul className="mt-1 space-y-1">
                      {files.slice(0, 3).map((file, index) => (
                        <li
                          key={index}
                          className="text-xs text-gray-400 truncate"
                        >
                          • {file.name}
                        </li>
                      ))}
                      {files.length > 3 && (
                        <li className="text-xs text-gray-400">
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
                    ? "bg-red-900/20 border-red-700"
                    : "bg-yellow-900/20 border-yellow-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clearData"
                    checked={clearData}
                    onCheckedChange={handleClearDataChange}
                    className="border-gray-600"
                  />
                  <label
                    htmlFor="clearData"
                    className="text-sm font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Clear existing data before upload
                  </label>
                </div>
                {targetTableNames.length > 0 && (
                  <div className="ml-6 text-xs text-gray-400">
                    Target table{targetTableNames.length > 1 ? "s" : ""}:{" "}
                    <div className="mt-1">
                      {targetTableNames.slice(0, 3).map((tableName, index) => (
                        <code
                          key={index}
                          className="bg-[#121212] border border-gray-600 px-1 rounded mr-2 mb-1 inline-block"
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
                  clearData ? "text-red-400 font-medium" : "text-gray-400"
                }`}
              >
                {clearData
                  ? targetTableNames.length > 0
                    ? `🚨 ALL existing data in ${targetTableNames.length} table${targetTableNames.length > 1 ? "s" : ""} will be deleted before upload!`
                    : "🚨 ALL existing data will be deleted before upload!"
                  : "⚠️ Check this option when uploading updated versions of the same bank statements to avoid duplicates"}
              </div>

              {/* NEW: Auto-skip exact duplicates option */}
              {!clearData && (
                <div className="flex flex-col space-y-2 p-3 rounded-md border bg-blue-900/20 border-blue-700">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoSkip"
                      checked={autoSkipDuplicates}
                      onCheckedChange={(checked) =>
                        setAutoSkipDuplicates(checked as boolean)
                      }
                      className="border-gray-600"
                    />
                    <label
                      htmlFor="autoSkip"
                      className="text-sm font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Auto-skip exact duplicates (100% match)
                    </label>
                  </div>
                  <div className="ml-6 text-xs text-gray-400">
                    Automatically skip transactions that already exist in the
                    database. You&apos;ll still review conflicts for partial
                    matches.
                  </div>
                </div>
              )}

              {/* Upload Progress Display */}
              {uploadProgress.totalFiles > 0 && (
                <div className="space-y-3 p-4 bg-blue-900/20 border border-blue-700 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-300">
                      {uploading ? "Upload Progress" : "Upload Results"}
                    </span>
                    <span className="text-sm text-blue-400">
                      {uploadProgress.currentFile} / {uploadProgress.totalFiles}
                    </span>
                  </div>

                  {uploadProgress.status && (
                    <div className="text-sm text-blue-300">
                      {uploadProgress.status}
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="w-full bg-blue-950 rounded-full h-2">
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
                            ? "bg-green-900/30 text-green-300 border border-green-700"
                            : result.status === "error"
                              ? "bg-red-900/30 text-red-300 border border-red-700"
                              : "bg-gray-800 text-gray-400 border border-gray-700"
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
                      ? "bg-green-900/20 border-green-700"
                      : "bg-red-900/20 border-red-700"
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
                            ? "text-green-300"
                            : "text-red-300"
                        }`}
                      >
                        {uploadSummary.message}
                      </div>
                      <div
                        className={`text-sm ${
                          uploadSummary.success
                            ? "text-green-400"
                            : "text-red-400"
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
                    className="mt-2 text-xs text-gray-400 hover:text-gray-300 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              {/* Upload button */}
              <Button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:bg-gray-700 disabled:text-gray-400"
              >
                {uploading
                  ? `Uploading ${uploadProgress.currentFile}/${uploadProgress.totalFiles}...`
                  : files.length === 0
                    ? "Select files to upload"
                    : files.length === 1
                      ? "Upload File"
                      : `Upload ${files.length} Files`}
              </Button>
              {/* Debug info */}
              {process.env.NODE_ENV === "development" && (
                <div className="text-xs text-gray-500 mt-2">
                  Clear Data: {clearData ? "YES" : "NO"} | Target Table:{" "}
                  {targetTableNames?.join(", ") || "None"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clear Data Warning Dialog */}
          <Dialog
            open={showClearDataWarning}
            onOpenChange={setShowClearDataWarning}
          >
            <DialogContent className="max-w-md bg-[#1E1E1E] border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-red-400">
                  ⚠️ Clear Existing Data
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  You are about to clear ALL existing data from the following
                  table before uploading new data:
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-2 bg-[#121212] border border-gray-600 rounded text-center font-mono text-sm text-gray-300">
                  {targetTableNames?.join(", ") || "Unknown tables"}
                </div>

                <div className="text-sm text-gray-400">
                  <strong className="text-gray-300">
                    This action cannot be undone!
                  </strong>
                  <br />
                  <br />
                  Only proceed if you want to replace all existing records with
                  the new file data.
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={cancelClearData}
                  className="border-gray-600 text-gray-300 hover:bg-[#121212]"
                >
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

          {/* NEW: Merge Conflict Resolution Dialog */}
          {conflictAnalysis && (
            <MergeConflictDialog
              analysis={conflictAnalysis}
              onResolve={handleResolveConflicts}
              onCancel={handleCancelMerge}
              open={showMergeDialog}
            />
          )}

          {/* NEW: Category Analysis Progress Dialog */}
          {categoryProgress.show && (
            <Dialog open={true} onOpenChange={() => {}}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    Analyzing Categories
                  </DialogTitle>
                  <DialogDescription>
                    Learning from your historical transaction data across all
                    banks...
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Stage indicator */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {categoryProgress.stage === "discovering" &&
                          "🔍 Discovering Tables"}
                        {categoryProgress.stage === "fetching" &&
                          "📥 Fetching Historical Data"}
                        {categoryProgress.stage === "analyzing" &&
                          "🤖 Analyzing Transactions"}
                        {categoryProgress.stage === "complete" && "✅ Complete"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {categoryProgress.message}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {categoryProgress.total > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>
                          {categoryProgress.current} / {categoryProgress.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${(categoryProgress.current / categoryProgress.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Info message */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                    💡 <strong>Tip:</strong> The system is searching through all
                    your transaction tables to find similar expenses and suggest
                    categories. This provides the most accurate suggestions
                    based on your complete transaction history.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* NEW: Category Assignment Dialog (Step 2) */}
          {categoryAnalysis && (
            <CategoryAssignmentDialog
              analysis={categoryAnalysis}
              onComplete={handleCategoryComplete}
              onSkip={handleCategorySkip}
              open={showCategoryDialog}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
