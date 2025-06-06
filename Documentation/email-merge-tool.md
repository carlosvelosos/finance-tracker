# Gmail Export Merger Tool

The Gmail Export Merger is a web-based tool that allows you to merge multiple Gmail export JSON files into a single consolidated file with automatic duplicate removal.

## Features

- **Multiple File Selection**: Select multiple Gmail export JSON files from your local directory
- **Automatic Validation**: Validates that selected files are proper Gmail export format
- **Smart Deduplication**: Removes duplicate emails based on unique email IDs
- **Date Range Merging**: Combines date ranges from all files
- **Weekly Breakdown Consolidation**: Merges weekly breakdown data from all files
- **Automatic Download**: Downloads the merged file automatically
- **Detailed Results**: Shows comprehensive merge statistics and results

## How to Use

1. **Navigate to the Email Merge Tool**

   - Go to your finance tracker application
   - Click on "Email Tools" in the navigation menu
   - Select "Email Merge Tool"

2. **Select Files**

   - Click "Choose JSON Files" button
   - Select multiple Gmail export JSON files from your computer
   - The tool will automatically validate the files

3. **Review Selected Files**

   - View the list of selected files with their details:
     - File name and size
     - Date range covered
     - Number of emails

4. **Merge Files**

   - Click "Merge X Files" button
   - The tool will process the files and remove duplicates
   - The merged file will be automatically downloaded

5. **Review Results**
   - See detailed merge statistics including:
     - Total emails in merged file
     - Number of duplicates removed
     - Processing time
     - Original file details

## File Format Requirements

The tool expects Gmail export JSON files with the following structure:

```json
{
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-05-31"
  },
  "totalEmails": 2239,
  "weeklyBreakdown": [...],
  "emails": [...],
  "exportDate": "2025-06-01T16:52:36.961Z",
  "fetchedBy": "your-email@gmail.com"
}
```

## Output

The merged file will be named in the format:

```
gmail-export-merged-YYYY-MM-DD-to-YYYY-MM-DD.json
```

Where the dates represent the earliest start date and latest end date from all merged files.

## Deduplication Logic

- **Primary Key**: Email ID field is used as the unique identifier
- **Duplicate Detection**: If an email ID appears in multiple files, only the first occurrence is kept
- **Emails Without IDs**: Preserved as-is (cannot be deduplicated)
- **Metadata Merging**: Weekly breakdowns and date ranges are combined from all files

## Example Merge Process

If you have these files:

- `gmail-export-2025-01-01-to-2025-05-31.json` (2,239 emails)
- `gmail-export-2025-05-31-to-2025-06-06.json` (94 emails)

The result might be:

- `gmail-export-merged-2025-01-01-to-2025-06-06.json` (2,332 emails)
- 1 duplicate removed (from overlapping date range)

## Technical Details

- **Client-Side Processing**: All file processing happens in your browser
- **No Server Upload**: Files are not uploaded to any server
- **Memory Efficient**: Uses streaming JSON parsing for large files
- **Error Handling**: Comprehensive error messages for invalid files
- **Progress Tracking**: Real-time feedback during processing

## Troubleshooting

**File Not Valid Error**

- Ensure the file is a proper Gmail export JSON
- Check that required fields (emails, dateRange, totalEmails) are present

**Large File Issues**

- For very large files (>100MB), the browser may become slow
- Consider splitting large exports before merging

**Memory Issues**

- Close other browser tabs to free up memory
- Refresh the page and try again with fewer files

## Security

- All processing happens locally in your browser
- No data is sent to external servers
- Files are processed entirely client-side
- Downloaded files are generated locally
