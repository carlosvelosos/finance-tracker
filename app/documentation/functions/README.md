# Function Analysis Dashboard

## Overview

The Function Analysis Dashboard is a web-based tool that visualizes the results from the `scan-functions.js` CLI tool. It displays function definitions and calls across your codebase in an interactive table format.

## How to Use

### 1. Generate Function Reports

First, run the function scanner CLI tool to generate reports:

```bash
# Scan the current project
node scan-functions.js .

# Or scan a specific directory
node scan-functions.js ./app
```

This will create JSON files in the `scan-functions-reports/` directory with names like:

- `function_report_2025-06-28_20-24-17.json`

### 2. Access the Dashboard

Navigate to the Function Analysis page in your browser:

```
http://localhost:3000/documentation/functions
```

### 3. View Results

1. **Select a Report**: Use the dropdown menu to choose from available JSON reports
2. **View the Matrix**: Each row represents a function, each column represents a file
3. **Interpret the Symbols**:
   - **D** = Function is **Defined** in this file
   - **C** = Function is **Called** in this file
   - **D/C** = Function is both **Defined and Called** in this file

### 4. Analyze Your Code

Use the dashboard to:

- **Find unused functions**: Functions that are only defined (D) but never called
- **Identify external dependencies**: Functions that are called (C) but not defined in your codebase
- **Understand code relationships**: See which files define vs. use specific functions
- **Track function usage**: See how functions are distributed across your project

## Features

- **Interactive Table**: Sortable and scrollable matrix view
- **Color-coded Cells**: Easy visual identification of function relationships
- **Summary Statistics**: Quick overview of total functions, calls, and relationships
- **Multiple Reports**: Compare different scans over time
- **Protected Access**: Requires authentication to view sensitive code analysis

## File Structure

```
scan-functions-reports/
├── function_report_2025-06-28_20-21-37.json
├── function_report_2025-06-28_20-24-17.json
└── ...

app/
├── documentation/functions/page.tsx          # Dashboard component
└── api/function-reports/
    ├── route.ts                              # API to list reports
    └── [filename]/route.ts                   # API to fetch specific report
```

## Security

- The dashboard is protected and only accessible to authorized users
- File access is restricted to the `scan-functions-reports` directory
- Filename validation prevents directory traversal attacks

## Troubleshooting

**No reports showing up?**

- Make sure you've run `node scan-functions.js .` first
- Check that `scan-functions-reports/` directory exists and contains JSON files

**Loading errors?**

- Verify the JSON files are valid (not corrupted)
- Check browser console for detailed error messages
- Ensure the API endpoints are accessible

**Empty table?**

- The selected report might not contain any functions
- Try scanning a directory with actual source code files (.js, .ts, .tsx)
