"use client";

import { useState, useEffect } from "react";
import {
  uploadExcel,
  createTableInSupabase,
  executeTableCreation,
} from "@/app/actions/fileActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
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
  "Inter-BR",
  "Inter-BR-Account",
  "Handelsbanken-SE",
  "AmericanExpress-SE",
  "SEB_SJ_Prio-SE",
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clearData, setClearData] = useState(false);
  const [showClearDataWarning, setShowClearDataWarning] = useState(false);
  const [showCreateTableDialog, setShowCreateTableDialog] = useState(false);
  const [pendingTableName, setPendingTableName] = useState<string>("");
  const [tableInstructions, setTableInstructions] = useState<string>("");
  const [creatingTable, setCreatingTable] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingBank, setPendingBank] = useState<string | null>(null);

  // Debug effect to monitor dialog state
  useEffect(() => {
    console.log("Dialog state changed:", {
      showCreateTableDialog,
      pendingTableName,
      tableInstructions: tableInstructions.substring(0, 50) + "...",
    });
  }, [showCreateTableDialog, pendingTableName, tableInstructions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const uploadedFile = e.target.files[0];

      // Ensure the file type is correct
      if (!uploadedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        toast.error("Invalid File", {
          description: "Please upload an Excel or CSV file.",
        });
        return;
      }

      setFile(uploadedFile);
    }
  };
  const handleUpload = async () => {
    if (!file || !selectedBank) {
      toast.error("Error", {
        description: "Please select a bank and upload a valid file.",
      });
      return;
    }

    setUploading(true);
    try {
      console.log(
        "Starting upload for bank:",
        selectedBank,
        "with file:",
        file.name,
        "clearData:",
        clearData,
      );
      const result = await uploadExcel(file, selectedBank, clearData);
      console.log("Upload result:", result);

      if (result.success) {
        console.log("Upload successful:", result.message);
        toast.success("Upload Status", {
          description: result.message,
        });
      } else {
        // Handle different error types gracefully
        if (result.error === "TABLE_NOT_EXISTS") {
          console.log("Detected TABLE_NOT_EXISTS error");
          // Use the tableName from the result if available, otherwise extract from message
          const tableName =
            (result as { tableName?: string }).tableName || "unknown_table";
          console.log("Extracted table name:", tableName);
          setPendingTableName(tableName);
          setPendingFile(file);
          setPendingBank(selectedBank);

          // Get table creation instructions
          console.log("Getting table creation instructions...");
          const instructions = await createTableInSupabase(tableName);
          console.log("Got instructions:", instructions);
          setTableInstructions(instructions);
          setShowCreateTableDialog(true);
          console.log("Dialog should be showing now");
        } else {
          // Handle other error types
          console.log("Showing error toast for:", result.error);
          toast.error("Upload Failed", {
            description: result.message,
          });
        }
      }
    } catch (error) {
      // This should rarely happen now since we're returning structured results
      console.error("Unexpected error in handleUpload:", error);
      toast.error("Upload Failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };
  const handleCopyInstructions = () => {
    navigator.clipboard.writeText(tableInstructions);
    toast.success("Copied!", {
      description: "SQL instructions copied to clipboard",
    });
  };

  const handleCreateTable = async () => {
    if (!pendingTableName) return;

    setCreatingTable(true);
    try {
      console.log("Creating table automatically:", pendingTableName);
      const result = await executeTableCreation(pendingTableName);

      if (result.success) {
        toast.success("Table Created!", {
          description: result.message,
        });

        // Close the dialog
        setShowCreateTableDialog(false); // Retry the upload automatically
        if (pendingFile && pendingBank) {
          console.log("Retrying upload after table creation...");
          try {
            const uploadResult = await uploadExcel(
              pendingFile,
              pendingBank,
              clearData,
            );
            if (uploadResult.success) {
              toast.success("Upload Status", {
                description: uploadResult.message,
              });
            } else {
              toast.error("Upload Failed", {
                description: uploadResult.message,
              });
            }
          } catch (retryError) {
            console.error("Retry upload failed:", retryError);
            toast.error("Upload Failed", {
              description: "Failed to retry upload after table creation",
            });
          }
        }
      } else {
        toast.error("Table Creation Failed", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error creating table:", error);
      toast.error("Table Creation Failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setCreatingTable(false);
    }
  };

  const handleCloseDialog = () => {
    setShowCreateTableDialog(false);
    setPendingTableName("");
    setTableInstructions("");
    setPendingFile(null);
    setPendingBank(null);
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
      case "Inter-BR":
        // Extract year from filename for Inter-BR tables (format: IN_YYYY)
        const yearMatch = fileName.match(/(\d{4})/);
        return yearMatch ? `IN_${yearMatch[1]}` : "IN_2025";
      case "Inter-BR-Account":
        // Extract year from filename for Inter-BR-Account tables (format: IN_YYYY)
        const accountYearMatch = fileName.match(/(\d{4})/);
        return accountYearMatch ? `IN_${accountYearMatch[1]}` : "IN_2025";
      case "Handelsbanken-SE":
        return "handelsbanken_transactions";
      case "AmericanExpress-SE":
        // Extract year from filename for Amex tables
        const amexYearMatch = fileName.match(/(\d{4})/);
        return amexYearMatch ? `amex_${amexYearMatch[1]}` : "amex_2025";
      case "SEB_SJ_Prio-SE":
        // Extract year from filename for SEB tables
        const sebYearMatch = fileName.match(/(\d{4})/);
        return sebYearMatch
          ? `seb_sj_prio_${sebYearMatch[1]}`
          : "seb_sj_prio_2025";
      default:
        return null;
    }
  };

  // Get the current table name that would be affected
  const targetTableName = getTableName(selectedBank, file);

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
            {/* File input field */}
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
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
              {targetTableName && (
                <div className="ml-6 text-xs text-gray-600">
                  Target table:{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    {targetTableName}
                  </code>
                </div>
              )}
            </div>
            <div
              className={`text-xs -mt-2 ${
                clearData ? "text-red-600 font-medium" : "text-gray-600"
              }`}
            >
              {clearData
                ? targetTableName
                  ? `🚨 ALL existing data in table "${targetTableName}" will be deleted before upload!`
                  : "🚨 ALL existing data will be deleted before upload!"
                : "⚠️ Check this option when uploading an updated version of the same bank statement to avoid duplicates"}
            </div>
            {/* Upload button */}
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>{" "}
            {/* Debug info */}
            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-gray-500 mt-2">
                Dialog: {showCreateTableDialog ? "OPEN" : "CLOSED"} | Table:{" "}
                {pendingTableName || "None"} | Clear Data:{" "}
                {clearData ? "YES" : "NO"} | Target Table:{" "}
                {targetTableName || "None"}
              </div>
            )}
          </CardContent>
        </Card>{" "}
        {/* Debug: Simple Test Dialog */}
        {showCreateTableDialog && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCreateTableDialog(false)}
          >
            <div
              className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-2">
                TEST: Table Creation Required
              </h2>{" "}
              <p className="mb-4">
                Table &ldquo;{pendingTableName}&rdquo; needs to be created.
              </p>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={handleCreateTable}
                disabled={creatingTable}
              >
                {creatingTable ? "Creating..." : "Create Table"}
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={handleCloseDialog}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {/* Table Creation Dialog */}
        <Dialog
          open={showCreateTableDialog}
          onOpenChange={setShowCreateTableDialog}
        >
          {" "}
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Table Not Found</DialogTitle>
              <DialogDescription>
                {" "}
                The table &ldquo;{pendingTableName}&rdquo; does not exist in the
                database. You can either create it automatically or manually
                using the SQL commands below:
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex-1 overflow-hidden">
              <div className="bg-gray-800 text-green-400 p-4 rounded-md font-mono text-xs overflow-auto max-h-[60vh] whitespace-pre-wrap break-words">
                {tableInstructions}
              </div>
            </div>{" "}
            <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopyInstructions}
                  disabled={!tableInstructions}
                >
                  Copy SQL
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateTable}
                  disabled={creatingTable || !pendingTableName}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creatingTable ? "Creating..." : "Create Table Automatically"}
                </Button>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                {targetTableName || "Unknown table"}
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
