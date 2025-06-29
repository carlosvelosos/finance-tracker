import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import { FunctionData } from "@/types/function-reports";

interface FunctionAnalysisTableProps {
  tableData: FunctionData[];
  selectedJsonFiles: string[];
  formatJsonFileName: (fileName: string) => string;
  loadingTable?: boolean;
}

export default function FunctionAnalysisTable({
  tableData,
  selectedJsonFiles,
  formatJsonFileName,
  loadingTable = false,
}: FunctionAnalysisTableProps) {
  if (loadingTable) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Generating function analysis table...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (tableData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Function Analysis Table</span>
          <Badge variant="outline">{tableData.length} functions</Badge>
        </CardTitle>
        <CardDescription>
          Functions analyzed across selected files. Each row represents a
          function, each column represents a file.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] sticky left-0 bg-background border-r">
                  Function Name
                </TableHead>
                <TableHead className="w-[150px] sticky left-[200px] bg-background border-r">
                  Source
                </TableHead>
                {selectedJsonFiles.map((fileName) => (
                  <TableHead
                    key={fileName}
                    className="min-w-[120px] text-center"
                  >
                    <div
                      className="truncate"
                      title={formatJsonFileName(fileName)}
                    >
                      {formatJsonFileName(fileName)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((funcData, index) => (
                <TableRow key={`${funcData.functionName}-${index}`}>
                  <TableCell className="font-medium sticky left-0 bg-background border-r">
                    <div className="truncate" title={funcData.functionName}>
                      {funcData.functionName}
                    </div>
                  </TableCell>
                  <TableCell className="sticky left-[200px] bg-background border-r">
                    <div
                      className="truncate text-xs text-muted-foreground"
                      title={funcData.source}
                    >
                      {funcData.source}
                    </div>
                  </TableCell>
                  {selectedJsonFiles.map((fileName) => {
                    const readableFileName = formatJsonFileName(fileName);
                    const fileData = funcData.files[readableFileName];
                    return (
                      <TableCell key={fileName} className="text-center">
                        {fileData ? (
                          <Badge
                            variant={
                              fileData.type === "defined"
                                ? "default"
                                : fileData.type === "both"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {fileData.type}
                          </Badge>
                        ) : (
                          <div
                            className="w-4 h-4 bg-gray-200 rounded-full mx-auto"
                            title="Function not present"
                          />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full" />
              <span>Function not present</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="text-xs">
                defined
              </Badge>
              <span>Function defined in file</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                called
              </Badge>
              <span>Function called in file</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="destructive" className="text-xs">
                both
              </Badge>
              <span>Function both defined and called</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
