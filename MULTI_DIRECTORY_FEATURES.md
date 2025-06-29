# Multi-Directory Function Analysis - Features Demo

## Enhanced Functions2 Page Features

The `functions2` page has been enhanced to support **multi-directory selection and comparison**, allowing users to analyze function usage across different scanned directories simultaneously.

## 🆕 New Features

### 1. **Multi-Directory Selection**

- **Add Multiple Directories**: Use the dropdown and "Add" button to select multiple report directories
- **Visual Directory Management**: Selected directories are displayed as removable badges
- **Smart Filtering**: The dropdown automatically hides already-selected directories

### 2. **Cross-Directory File Organization**

- **Directory-Grouped Files**: Files are organized by directory name (e.g., "app/Root", "components/ui")
- **Enhanced File Display**: Each file shows both its path and source directory
- **Unified File Selection**: Select files from multiple directories for combined analysis

### 3. **Improved Summary Display**

- **Individual Directory Summaries**: Each selected directory gets its own summary card
- **Aggregate File Counts**: Total file counts across all selected directories
- **Combined Statistics**: Process multiple directories' data simultaneously

### 4. **Advanced Function Analysis**

- **Multi-Directory Function Mapping**: Functions are tracked across all selected directories
- **Directory-Aware File Names**: Function table shows full directory context
- **Cross-Directory Comparison**: Compare how functions are used across different parts of the project

## 🎯 Usage Workflow

1. **Select Directories**

   - Choose directories from the dropdown
   - Click "Add" to include them in analysis
   - Remove directories by clicking the "X" on their badge

2. **Browse Combined Files**

   - View files organized by directory and subdirectory
   - Files are grouped as "directory-name/path" (e.g., "app/components", "lib/utils")
   - Select files from any combination of directories

3. **Generate Analysis**

   - Select files from multiple directories
   - Click "Generate Table" to create unified function analysis
   - View functions with their usage across all selected files

4. **Compare Results**
   - Functions show usage patterns across different directories
   - Easily identify shared functions between directories
   - Track function definitions vs calls across project structure

## 📊 Interface Improvements

### Directory Selection

```
┌─ Select Report Directories ─────────────────────────┐
│ [Dropdown: Select a report directory...] [Add]     │
│                                                     │
│ Selected Directories:                               │
│ [scan-functions-report-app-...] [X]                │
│ [scan-functions-report-components-...] [X]         │
└─────────────────────────────────────────────────────┘
```

### File Organization

```
┌─ Available JSON Files ──────────────────────────────┐
│ [✓] app/Root                           2/3 files   │
│   ├─ [✓] page.tsx                                   │
│   ├─ [ ] layout.tsx                                 │
│   └─ [✓] globals.css                                │
│                                                     │
│ [✓] components/ui                      5/8 files   │
│   ├─ [✓] button.tsx                                 │
│   ├─ [✓] card.tsx                                   │
│   └─ ...                                            │
└─────────────────────────────────────────────────────┘
```

### Function Analysis Table

```
┌─ Function Analysis Results ─────────────────────────┐
│ Function Name    │ Source  │ app/page.tsx │ comp... │
│ ──────────────── │ ─────── │ ──────────── │ ─────── │
│ useState         │ react   │ called       │ called  │
│ Button           │ local   │ called       │ defined │
│ fetchData        │ local   │ both         │ -       │
└─────────────────────────────────────────────────────┘
```

## 🛠️ Technical Enhancements

- **Type Safety**: Enhanced TypeScript interfaces for multi-directory data
- **Performance**: Efficient data fetching and processing for multiple directories
- **Error Handling**: Robust error handling for failed directory loading
- **State Management**: Clean state management for complex multi-directory selection
- **UI/UX**: Intuitive interface with clear visual feedback

## 🎁 Benefits

1. **Comprehensive Analysis**: Analyze function usage across entire project structure
2. **Directory Comparison**: Compare function patterns between different parts of the project
3. **Efficient Workflow**: Select and analyze multiple directories in one session
4. **Enhanced Insights**: Identify shared functions, dependencies, and usage patterns
5. **Scalable Design**: Easily add more directories without performance impact

## 🚀 Use Cases

- **Architecture Analysis**: Compare function usage between frontend and backend directories
- **Code Review**: Analyze function distribution across feature directories
- **Refactoring Planning**: Identify commonly used functions across modules
- **Dependency Mapping**: Track function calls between different project areas
- **Code Quality Assessment**: Compare function complexity across directories

The enhanced multi-directory functionality makes the function analysis tool much more powerful for understanding large codebases and complex project structures.
