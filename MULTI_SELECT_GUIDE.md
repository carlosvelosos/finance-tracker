# Multi-Directory Function Scanner - User Guide

## Overview

The `scan-functions.js` CLI tool has been enhanced with keyboard navigation and multi-directory selection capabilities. You can now efficiently scan multiple directories in a single operation.

## Features

### 🎯 **Multi-Directory Selection**

- Select multiple directories at once using space-separated numbers
- Clear visual indicators show selected directories with checkboxes
- Real-time display of current selections

### ⌨️ **Keyboard Navigation**

- **Numbers**: Enter directory numbers (e.g., "1 3 5") to toggle selection
- **"a" or "all"**: Select all available directories
- **"c" or "clear"**: Clear all current selections
- **"done" or Enter**: Confirm selection and proceed
- **"exit"**: Quit the program

### 📁 **Smart Directory Handling**

- Automatically filters out hidden directories (starting with `.`)
- Excludes `node_modules` and other build directories
- Includes option to scan current directory
- Supports both relative and absolute paths

## Usage Examples

### Interactive Mode (No Arguments)

```bash
node scan-functions.js
```

This will display an interactive menu where you can select multiple directories.

### Direct Directory Specification

```bash
node scan-functions.js app
node scan-functions.js components
```

Scans a single specified directory.

## Interactive Menu Example

```
🗂️  Available directories in .:
📁 Enter numbers separated by spaces to select multiple directories

1. [ ] 📁 app
2. [ ] 📁 components
3. [ ] 📁 context
4. [ ] 📁 lib
5. [ ] 📁 types
6. [ ] 📂 . (use current directory: .)

💡 Options:
   • Enter numbers (e.g., "1 3 5") to toggle selection
   • Enter "a" to select all directories
   • Enter "c" to clear all selections
   • Enter "done" or press Enter to confirm selection
   • Enter "exit" to quit

Your choice: 1 3 5
```

After selecting directories 1, 3, and 5:

```
🗂️  Available directories in .:
📁 Enter numbers separated by spaces to select multiple directories

1. [✓] 📁 app
2. [ ] 📁 components
3. [✓] 📁 context
4. [ ] 📁 lib
5. [✓] 📁 types
6. [ ] 📂 . (use current directory: .)

⭐ Currently selected: app, context, types

Your choice: done
```

## Output

When scanning multiple directories, each directory gets its own timestamped report folder:

- `scan-functions-report-app-2025-06-29_14-17-44/`
- `scan-functions-report-context-2025-06-29_14-17-44/`
- `scan-functions-report-types-2025-06-29_14-17-44/`

Each report includes:

- Individual JSON files for each scanned source file
- `_SUMMARY.json` with metadata and statistics
- Complete function analysis (defined, called, imports, exports)

## Tips

1. **Multi-Selection**: You can toggle directories on/off by entering their numbers multiple times
2. **Quick Select All**: Use "a" to select all directories at once
3. **Easy Reset**: Use "c" to clear selections and start over
4. **Safe Exit**: Use "exit" at any time to quit without processing
5. **Current Directory**: Option 6 (or last option) always represents the current directory
6. **Visual Feedback**: Selected directories show `[✓]` checkboxes and are listed at the bottom

## Error Handling

- If a selected directory doesn't exist, it will be skipped with a warning
- Invalid selections are ignored with helpful error messages
- The program continues processing other valid directories
- Clear feedback is provided for all operations

## Technical Details

- Uses Node.js `readline` for interactive input
- Supports terminal with TTY capabilities
- Cross-platform compatible (Windows, macOS, Linux)
- Preserves existing single-directory functionality
- No breaking changes to existing CLI arguments
