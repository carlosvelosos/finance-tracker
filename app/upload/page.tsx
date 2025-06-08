"use client";

import { useState } from "react";
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
  const [showCreateTableDialog, setShowCreateTableDialog] = useState(false);
  const [pendingTableName, setPendingTableName] = useState<string>("");
  const [tableInstructions, setTableInstructions] = useState<string>("");
  const [creatingTable, setCreatingTable] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingBank, setPendingBank] = useState<string | null>(null);

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
      );
      const result = await uploadExcel(file, selectedBank);
      console.log("Upload successful:", result);
      toast.success("Upload Status", {
        description: result,
      });
    } catch (error) {
      console.error("Upload failed:", error); // Log the error for debugging
      console.error("Error type:", typeof error);
      console.error("Error instanceof Error:", error instanceof Error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error(
          "Error message starts with TABLE_NOT_EXISTS:",
          error.message.startsWith("TABLE_NOT_EXISTS:"),
        );
      }
      if (
        error instanceof Error &&
        error.message.startsWith("TABLE_NOT_EXISTS:")
      ) {
        console.log("Detected TABLE_NOT_EXISTS error");
        // Extract table name from error message
        const tableName = error.message.split(":")[1];
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
        console.log("Showing regular error toast");
        toast.error("Upload Failed", {
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      }
    }
    setUploading(false);
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
        setShowCreateTableDialog(false);

        // Retry the upload automatically
        if (pendingFile && pendingBank) {
          console.log("Retrying upload after table creation...");
          try {
            const uploadResult = await uploadExcel(pendingFile, pendingBank);
            toast.success("Upload Status", {
              description: uploadResult,
            });
          } catch (retryError) {
            console.error("Retry upload failed:", retryError);
            toast.error("Upload Failed", {
              description:
                retryError instanceof Error
                  ? retryError.message
                  : "Failed to retry upload",
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
            {/* Upload button */}
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>{" "}
          </CardContent>
        </Card>

        {/* Table Creation Dialog */}
        <Dialog
          open={showCreateTableDialog}
          onOpenChange={setShowCreateTableDialog}
        >
          <DialogContent className="max-w-2xl">
            {" "}
            <DialogHeader>
              <DialogTitle>Table Not Found</DialogTitle>{" "}
              <DialogDescription>
                The table &quot;{pendingTableName}&quot; does not exist in the
                database. You can either create it automatically or manually
                using the SQL commands below:
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="bg-gray-800 text-green-400 p-4 rounded-md font-mono text-sm overflow-auto max-h-96">
                <pre>{tableInstructions}</pre>
              </div>
            </div>{" "}
            <div className="flex justify-between gap-2 mt-4">
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
      </div>
    </ProtectedRoute>
  );
}
