"use client";

import { useState } from "react";
import { uploadExcel } from "@/app/actions/fileActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedRoute from '@/components/protected-route';

const BANK_OPTIONS = ["DEV", "Inter-BR", "Handelsbanken-SE", "AmericanExpress-SE", "SEB_SJ_Prio-SE"];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      const result = await uploadExcel(file, selectedBank);
      toast.success("Upload Status", {
        description: result,
      });
    } catch (error) {
      console.error("Upload failed:", error); // Log the error for debugging
      toast.error("Upload Failed", {
        description: "Something went wrong.",
      });
    }
    setUploading(false);
  };

  return (
    <ProtectedRoute 
      allowedUserIds={['2b5c5467-04e0-4820-bea9-1645821fa1b7', '0a29c8db-018c-49cb-ac35-7ccf1719be2c', '382714ae-4c7c-4a32-9a7d-8b530fbd7ab3']}
    >
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Upload Bank Statement</CardTitle>
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
            <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />

            {/* Upload button */}
            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}