export interface FunctionData {
  functionName: string;
  source: string;
  files: Record<
    string,
    { type: "defined" | "called" | "both" | "export-default" }
  >; // filename -> type in that file
}

export interface JsonFileData {
  metadata: {
    originalFilePath: string;
    scannedDirectory: string;
    timestamp: string;
    scanDate: string;
  };
  analysis: {
    defined: string[];
    called: string[];
    both: string[];
    exportDefault: string[]; // Add export default functions
    imports: Record<string, any>;
    calledWithImports: Record<string, any>;
  };
}

export interface ReportDirectory {
  name: string;
  type: "directory";
  isNew: boolean;
}

export interface SummaryData {
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

export interface DirectoryData {
  summary: SummaryData;
  jsonFiles: string[];
}
