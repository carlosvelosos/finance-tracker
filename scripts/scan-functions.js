#!/usr/bin/env node

/**
 * =================================================================
 * FUNCTION SCANNER CLI TOOL
 * =================================================================
 *
 * This Node.js CLI tool recursively scans JavaScript, TypeScript, and TSX files
 * in a given directory to identify function definitions and calls.
 *
 * USAGE:
 *   node scan-functions.js <directory>
 *   node scan-functions.js --help
 *
 * EXAMPLES:
 *   # Scan the current directory
 *   node scan-functions.js .
 *
 *   # Scan a specific project directory
 *   node scan-functions.js /path/to/my-nextjs-project
 *
 *   # Scan a relative directory
 *   node scan-functions.js ./src
 *
 *   # Show help and usage information
 *   node scan-functions.js --help
 *
 * OUTPUT:
 *   Creates a directory named "scan-functions-report-{directory}-{timestamp}"
 *   containing individual JSON files for each scanned file, plus a summary file.
 *   Each file follows this structure:
 *   Each file follows this structure:
 *
 *   {
 *     "metadata": {
 *       "originalFilePath": "relative/path/to/file.tsx",
 *       "scannedDirectory": "app",
 *       "timestamp": "2025-06-29_10-46-57",
 *       "scanDate": "2025-06-29T10:46:57.123Z"
 *     },
 *     "analysis": {
 *       "defined": ["functionName1", "functionName2"],
 *       "called": ["useState", "useEffect", "functionName1"],
 *       "both": ["functionName1"],
 *       "imports": {
 *         "useState": { "source": "react", "type": "npm" },
 *         "useEffect": { "source": "react", "type": "npm" },
 *         "localFunction": { "source": "./utils", "type": "relative" },
 *         "componentFunction": { "source": "@/components/ui", "type": "alias" }
 *       },
 *       "calledWithImports": {
 *         "useState": { "source": "react", "type": "npm" },
 *         "localFunction": { "source": "./utils", "type": "relative" },
 *         "setTransactions": { "source": "react", "type": "npm", "hookName": "useState", "isHookSetter": true }
 *       },
 *       "destructuredFunctions": {
 *         "setTransactions": { "source": "react", "type": "npm", "hookName": "useState", "isHookSetter": true },
 *         "transactions": { "source": "react", "type": "npm", "hookName": "useState", "isHookSetter": false }
 *       }
 *     }
 *   }
 *
 * WHAT IT DETECTS:
 *   - Function declarations: function myFunc() {}
 *   - Arrow functions: const myFunc = () => {}
 *   - Function expressions: const myFunc = function() {}
 *   - Class methods: class MyClass { myMethod() {} }
 *   - Object methods: const obj = { myMethod() {} }
 *   - Function calls: myFunc(), obj.method(), console.log()
 *   - Import statements and their sources
 *   - Destructured functions from hooks: const [state, setState] = useState()
 *   - React hook patterns and their destructured setters/getters
 *   - Categorizes imports by type: npm, relative, absolute, alias
 *   - Maps called functions to their import sources
 *   - Tracks destructured functions back to their hook origins
 *
 * IGNORED DIRECTORIES:
 *   - node_modules/
 *   - .next/
 *   - dist/
 *   - build/
 *   - .git/
 *   - .vscode/
 *
 * REQUIREMENTS:
 *   - Node.js v16+
 *   - Dependencies: @babel/parser, @babel/traverse, commander, glob
 *
 * INSTALLATION:
 *   npm install @babel/parser @babel/traverse commander glob
 *   # or
 *   pnpm add @babel/parser @babel/traverse commander glob
 *
 * =================================================================
 */

const fs = require("fs").promises;
const path = require("path");
const { glob } = require("glob");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { program } = require("commander");
const readline = require("readline");

/**
 * =================================================================
 * Phase 1: CLI Setup & Input Validation
 * =================================================================
 * Using 'commander' to create a robust CLI interface.
 */

// Function to get available directories
async function getAvailableDirectories() {
  try {
    const items = await fs.readdir(".", { withFileTypes: true });
    return items
      .filter(
        (item) =>
          item.isDirectory() &&
          !item.name.startsWith(".") &&
          item.name !== "node_modules",
      )
      .map((item) => item.name)
      .sort();
  } catch (error) {
    console.error("Error reading directories:", error.message);
    return [];
  }
}

// Function to get subdirectories of a given directory
async function getSubdirectories(targetDir) {
  try {
    const items = await fs.readdir(targetDir, { withFileTypes: true });
    return items
      .filter(
        (item) =>
          item.isDirectory() &&
          !item.name.startsWith(".") &&
          item.name !== "node_modules",
      )
      .map((item) => item.name)
      .sort();
  } catch (error) {
    console.error(
      `Error reading subdirectories of ${targetDir}:`,
      error.message,
    );
    return [];
  }
}

// Function to prompt user for directory selection with keyboard navigation and multi-select
function promptDirectorySelection(directories, currentPath = ".") {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    let selectedDirectories = new Set();
    const options = [
      ...directories,
      `. (use current directory: ${currentPath})`,
    ];

    function displayMenu() {
      console.clear();
      console.log(`\n🗂️  Available directories in ${currentPath}:`);
      console.log(
        "📁 Enter numbers separated by spaces to select multiple directories\n",
      );

      options.forEach((option, index) => {
        const isSelected = selectedDirectories.has(index);
        const isDirectory = index < directories.length;
        const isCurrentDir = index === directories.length;

        let checkbox = isSelected ? "[✓] " : "[ ] ";
        let icon = "";

        if (isDirectory) icon = "📁 ";
        else if (isCurrentDir) icon = "📂 ";

        console.log(`${index + 1}. ${checkbox}${icon}${option}`);
      });

      if (selectedDirectories.size > 0) {
        const selectedNames = Array.from(selectedDirectories)
          .map((i) => (i === directories.length ? currentPath : directories[i]))
          .join(", ");
        console.log(`\n� Currently selected: ${selectedNames}`);
      }

      console.log(`\n💡 Options:`);
      console.log(`   • Enter numbers (e.g., "1 3 5") to toggle selection`);
      console.log(`   • Enter "a" to select all directories`);
      console.log(`   • Enter "c" to clear all selections`);
      console.log(`   • Enter "done" or press Enter to confirm selection`);
      console.log(`   • Enter "exit" to quit`);
    }

    function processInput(input) {
      const trimmed = input.trim().toLowerCase();

      if (trimmed === "" || trimmed === "done") {
        // Confirm selection
        const selected = Array.from(selectedDirectories).map((index) => {
          if (index === directories.length) {
            return "USE_CURRENT";
          }
          return directories[index];
        });

        if (selected.length === 0) {
          console.log(
            "\n⚠️  No directories selected. Please select at least one directory.",
          );
          setTimeout(() => {
            displayMenu();
            rl.question("\nYour choice: ", processInput);
          }, 1500);
          return;
        }

        rl.close();
        resolve(selected);
        return;
      }

      if (trimmed === "exit") {
        rl.close();
        reject(new Error("USER_EXIT"));
        return;
      }

      if (trimmed === "a" || trimmed === "all") {
        // Select all directories
        for (let i = 0; i <= directories.length; i++) {
          selectedDirectories.add(i);
        }
        displayMenu();
        rl.question("\nYour choice: ", processInput);
        return;
      }

      if (trimmed === "c" || trimmed === "clear") {
        // Clear all selections
        selectedDirectories.clear();
        displayMenu();
        rl.question("\nYour choice: ", processInput);
        return;
      }

      // Parse number selections
      const numbers = trimmed
        .split(/\s+/)
        .map((n) => parseInt(n))
        .filter((n) => !isNaN(n));

      if (numbers.length > 0) {
        numbers.forEach((num) => {
          const index = num - 1; // Convert to 0-based index
          if (index >= 0 && index < options.length) {
            if (selectedDirectories.has(index)) {
              selectedDirectories.delete(index);
            } else {
              selectedDirectories.add(index);
            }
          }
        });
        displayMenu();
        rl.question("\nYour choice: ", processInput);
        return;
      }

      console.log("\n❌ Invalid input. Please try again.");
      setTimeout(() => {
        displayMenu();
        rl.question("\nYour choice: ", processInput);
      }, 1000);
    }

    // Initial display
    displayMenu();
    rl.question("\nYour choice: ", processInput);
  });
}

// Function to handle directory selection (supports multi-select)
async function selectDirectoriesInteractively(basePath = ".") {
  const directories = await getAvailableDirectories();

  if (directories.length === 0) {
    console.log(`\nNo subdirectories found in ${basePath}.`);
    console.log(`Using current directory: ${basePath}`);
    return [basePath];
  }

  try {
    const selectedDirectories = await promptDirectorySelection(
      directories,
      basePath,
    );

    return selectedDirectories.map((dir) => {
      if (dir === "USE_CURRENT") {
        return basePath;
      }
      return path.resolve(basePath, dir);
    });
  } catch (error) {
    if (error.message === "USER_EXIT") {
      throw error;
    }
    console.error("Error during directory selection:", error.message);
    console.log("Falling back to current directory.");
    return [basePath];
  }
}

program
  .version("1.0.0")
  .description(
    "A CLI tool to scan directories for JS/TS files and report defined and called functions. Supports multi-directory selection.",
  )
  .argument(
    "[directory]",
    "The target directory to scan (e.g., .) - if omitted, will prompt for multi-selection",
  )
  .action(main)
  .parse(process.argv);

async function main(directory) {
  let targetDirectories = [];

  // If no directory is provided, prompt for selection
  if (!directory) {
    console.log(
      "No directory specified. Starting interactive directory selection...",
    );

    try {
      targetDirectories = await selectDirectoriesInteractively(".");
    } catch (error) {
      if (error.message === "USER_EXIT") {
        console.log("Operation cancelled by user.");
        process.exit(0);
      }
      console.error("Error during directory selection:", error.message);
      console.log("Falling back to current directory.");
      targetDirectories = ["."];
    }
  } else {
    // Single directory provided as argument
    targetDirectories = [path.resolve(directory)];
  }

  // Process each selected directory
  for (const targetDirectory of targetDirectories) {
    const targetDir = path.resolve(targetDirectory);

    try {
      await fs.access(targetDir);
    } catch (error) {
      console.error(`Error: Directory not found at '${targetDir}'`);
      continue; // Skip this directory and continue with others
    }

    console.log(`\n🔍 Scanning files in: ${targetDir}`);
    const report = await processDirectory(targetDir);
    await generateReport(report, path.basename(targetDirectory));
  }

  if (targetDirectories.length > 1) {
    console.log(
      `\n✅ Completed scanning ${targetDirectories.length} directories.`,
    );
  }
}

/**
 * =================================================================
 * Phase 2: File Discovery
 * =================================================================
 * Using 'glob' to find all relevant source files while respecting
 * an ignore list.
 */
async function findSourceFiles(targetDir) {
  const pattern = "**/*.{js,ts,tsx}";
  const options = {
    cwd: targetDir,
    nodir: true,
    ignore: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      ".git/**",
      ".vscode/**",
    ],
  };
  return glob(pattern, options);
}

/**
 * =================================================================
 * Phase 3: AST Parsing and Traversal
 * =================================================================
 * For each file, parse its content into an Abstract Syntax Tree (AST)
 * and traverse the tree to find function definitions and calls.
 */
async function analyzeFile(filePath) {
  const defined = new Set();
  const called = new Set();
  const exportDefault = new Set(); // Track export default functions
  const imports = new Map(); // Map function name to import info
  const calledWithImports = new Map(); // Map called functions to their import info
  const destructuredFunctions = new Map(); // Track functions from destructuring (e.g., useState setters)

  try {
    const code = await fs.readFile(filePath, "utf-8");
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      errorRecovery: true, // Attempt to parse despite errors
    });

    traverse(ast, {
      // Track import declarations first
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const importType = categorizeImport(source);

        path.node.specifiers.forEach((specifier) => {
          let importedName;
          let localName;

          if (specifier.type === "ImportDefaultSpecifier") {
            importedName = "default";
            localName = specifier.local.name;
          } else if (specifier.type === "ImportSpecifier") {
            importedName = specifier.imported.name;
            localName = specifier.local.name;
          } else if (specifier.type === "ImportNamespaceSpecifier") {
            importedName = "*";
            localName = specifier.local.name;
          }

          if (localName) {
            imports.set(localName, {
              source,
              type: importType,
              importedName,
              localName,
            });
          }
        });
      },

      // Catches: function hello() {} | export function hello() {} | export default function hello() {}
      FunctionDeclaration(path) {
        if (path.node.id) {
          defined.add(path.node.id.name);
        }
      },

      // Catches: export default function() {} or export default function Name() {}
      ExportDefaultDeclaration(path) {
        if (path.node.declaration) {
          if (path.node.declaration.type === "FunctionDeclaration") {
            if (path.node.declaration.id) {
              // Named function: export default function MyComponent() {}
              exportDefault.add(path.node.declaration.id.name);
            } else {
              // Anonymous function: export default function() {}
              exportDefault.add("default");
            }
          } else if (path.node.declaration.type === "ArrowFunctionExpression") {
            // Arrow function: export default () => {}
            exportDefault.add("default");
          } else if (path.node.declaration.type === "Identifier") {
            // Named export: const MyComponent = () => {}; export default MyComponent;
            exportDefault.add(path.node.declaration.name);
          }
        }
      },
      // Catches: class MyClass { myMethod() {} } | const obj = { myMethod() {} }
      ObjectMethod(path) {
        if (path.node.key.type === "Identifier") {
          defined.add(path.node.key.name);
        }
      },
      ClassMethod(path) {
        if (path.node.key.type === "Identifier") {
          defined.add(path.node.key.name);
        }
      },

      // Track destructuring assignments from function calls (e.g., useState, useEffect)
      VariableDeclarator(path) {
        // Handle destructuring from function calls
        if (
          path.node.id.type === "ArrayPattern" &&
          path.node.init &&
          path.node.init.type === "CallExpression"
        ) {
          const callExpression = path.node.init;
          let hookName = null;

          // Get the function being called
          if (callExpression.callee.type === "Identifier") {
            hookName = callExpression.callee.name;
          }

          // Handle React hooks specifically
          if (
            hookName &&
            (hookName.startsWith("use") ||
              [
                "useState",
                "useEffect",
                "useCallback",
                "useMemo",
                "useRef",
                "useContext",
              ].includes(hookName))
          ) {
            path.node.id.elements.forEach((element, index) => {
              if (element && element.type === "Identifier") {
                const destructuredName = element.name;

                // For useState, the second element is typically the setter
                if (hookName === "useState" && index === 1) {
                  destructuredFunctions.set(destructuredName, {
                    source: imports.has(hookName)
                      ? imports.get(hookName).source
                      : "react",
                    type: imports.has(hookName)
                      ? imports.get(hookName).type
                      : "npm",
                    hookName: hookName,
                    destructuredFrom: hookName,
                    destructuredIndex: index,
                    isHookSetter: true,
                    importedName: hookName,
                    localName: destructuredName,
                  });
                } else {
                  // Other destructured items from hooks
                  destructuredFunctions.set(destructuredName, {
                    source: imports.has(hookName)
                      ? imports.get(hookName).source
                      : "react",
                    type: imports.has(hookName)
                      ? imports.get(hookName).type
                      : "npm",
                    hookName: hookName,
                    destructuredFrom: hookName,
                    destructuredIndex: index,
                    isHookSetter: false,
                    importedName: hookName,
                    localName: destructuredName,
                  });
                }
              }
            });
          }
        }

        // Original logic for function assignments
        if (
          path.node.init &&
          (path.node.init.type === "ArrowFunctionExpression" ||
            path.node.init.type === "FunctionExpression")
        ) {
          if (path.node.id.type === "Identifier") {
            defined.add(path.node.id.name);
          }
        }
      },
    });

    // Second pass to collect function calls with import information
    traverse(ast, {
      // Catches all function calls: hello(), obj.hello(), console.log()
      CallExpression(path) {
        const callee = path.get("callee");

        // Check if this call is part of a chain (has a parent CallExpression)
        const isPartOfChain =
          path.parent &&
          path.parent.type === "MemberExpression" &&
          path.parentPath.parent &&
          path.parentPath.parent.type === "CallExpression";

        // If this call is part of a chain, skip it - we'll handle it at the top level
        if (isPartOfChain) {
          return;
        }

        // Check if this call has chained method calls
        const chainedCall = getChainedMethodCall(path);
        if (chainedCall) {
          // Handle chained method calls as a single function
          const { rootObject, methodChain, fullChainPath } = chainedCall;

          // Add the full chain as a single "function call"
          const chainKey = fullChainPath;
          called.add(chainKey);

          if (rootObject && imports.has(rootObject)) {
            calledWithImports.set(chainKey, {
              ...imports.get(rootObject),
              memberOf: rootObject,
              functionName: chainKey,
              fullMemberPath: fullChainPath,
              methodChain: methodChain,
              isChainedCall: true,
            });
          } else {
            calledWithImports.set(chainKey, {
              source:
                rootObject && defined.has(rootObject) ? "local" : "unknown",
              type: rootObject && defined.has(rootObject) ? "local" : "unknown",
              memberOf: rootObject || "unknown",
              functionName: chainKey,
              fullMemberPath: fullChainPath,
              methodChain: methodChain,
              isChainedCall: true,
            });
          }
          return;
        }

        // Handle regular function calls (non-chained)
        if (callee.isIdentifier()) {
          const functionName = callee.node.name;
          called.add(functionName);

          // Track import info for called functions
          if (imports.has(functionName)) {
            calledWithImports.set(functionName, imports.get(functionName));
          } else if (destructuredFunctions.has(functionName)) {
            // Function was destructured from a hook or other function call
            calledWithImports.set(
              functionName,
              destructuredFunctions.get(functionName),
            );
          } else {
            // Check if it's a locally defined function
            if (defined.has(functionName)) {
              calledWithImports.set(functionName, {
                source: "local",
                type: "local",
                importedName: functionName,
                localName: functionName,
              });
            } else {
              // Unknown source
              calledWithImports.set(functionName, {
                source: "unknown",
                type: "unknown",
                importedName: functionName,
                localName: functionName,
              });
            }
          }
        } else if (callee.isMemberExpression()) {
          const property = callee.get("property");
          if (property.isIdentifier()) {
            const functionName = property.node.name;
            called.add(functionName);

            // For member expressions, try to get the root object name
            const { rootObject, fullPath } = getRootObjectAndPath(callee);

            if (rootObject && imports.has(rootObject)) {
              calledWithImports.set(functionName, {
                ...imports.get(rootObject),
                memberOf: fullPath,
                functionName,
                fullMemberPath: fullPath + "." + functionName,
              });
            } else {
              calledWithImports.set(functionName, {
                source: "unknown",
                type: "unknown",
                memberOf: fullPath || "unknown",
                functionName,
                fullMemberPath: fullPath
                  ? fullPath + "." + functionName
                  : functionName,
              });
            }
          }
        }
      },
    });
  } catch (error) {
    console.warn(`[Warning] Could not parse ${filePath}: ${error.message}`);
    return null; // Skip files with fatal parsing errors
  }

  const definedArr = Array.from(defined).sort();
  const calledArr = Array.from(called).sort();
  const exportDefaultArr = Array.from(exportDefault).sort();
  const both = definedArr.filter((func) => called.has(func));

  // Convert Maps to Objects for JSON serialization
  const importsObj = {};
  imports.forEach((value, key) => {
    importsObj[key] = value;
  });

  const calledWithImportsObj = {};
  calledWithImports.forEach((value, key) => {
    calledWithImportsObj[key] = value;
  });

  const destructuredFunctionsObj = {};
  destructuredFunctions.forEach((value, key) => {
    destructuredFunctionsObj[key] = value;
  });

  return {
    defined: definedArr,
    called: calledArr,
    both,
    exportDefault: exportDefaultArr,
    imports: importsObj,
    calledWithImports: calledWithImportsObj,
    destructuredFunctions: destructuredFunctionsObj,
  };
}

/**
 * Helper function to get the root object and full path from a member expression
 * Handles nested member expressions like XLSX.utils.sheet_to_json
 */
function getChainedMethodCall(callPath) {
  const methodChain = [];
  let currentPath = callPath;
  let rootObject = null;

  // Walk up the chain to collect all method calls
  while (currentPath && currentPath.isCallExpression()) {
    const callee = currentPath.get("callee");

    if (callee.isMemberExpression()) {
      const property = callee.get("property");
      if (property.isIdentifier()) {
        methodChain.unshift(property.node.name);
      }

      // Get the object being called on
      const object = callee.get("object");

      // If the object is another call expression, continue the chain
      if (object.isCallExpression()) {
        currentPath = object;
      } else if (object.isIdentifier()) {
        // We've reached the root object
        rootObject = object.node.name;
        break;
      } else if (object.isMemberExpression()) {
        // Handle cases like obj.prop.method()
        const { rootObject: nestedRoot, fullPath } =
          getRootObjectAndPath(object);
        rootObject = nestedRoot;
        if (fullPath && fullPath !== nestedRoot) {
          // Add the intermediate path to the beginning of the chain
          const intermediateParts = fullPath.split(".").slice(1); // Remove the root
          methodChain.unshift(...intermediateParts);
        }
        break;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Only consider it a chain if there are multiple methods or if it's a method on an object
  if (methodChain.length >= 2 || (methodChain.length >= 1 && rootObject)) {
    const fullChainPath = rootObject
      ? `${rootObject}.${methodChain.join(".")}`
      : methodChain.join(".");

    return {
      rootObject,
      methodChain,
      fullChainPath,
    };
  }

  return null;
}

function getRootObjectAndPath(memberExpression) {
  const parts = [];
  let current = memberExpression;

  // Traverse up the member expression chain
  while (current.isMemberExpression()) {
    const property = current.get("property");
    if (property.isIdentifier()) {
      parts.unshift(property.node.name);
    }
    current = current.get("object");
  }

  // Get the root object
  let rootObject = null;
  if (current.isIdentifier()) {
    rootObject = current.node.name;
  }

  // Build the full path (excluding the final method name)
  const fullPath = rootObject
    ? [rootObject, ...parts.slice(0, -1)].join(".")
    : parts.slice(0, -1).join(".");

  return {
    rootObject,
    fullPath: fullPath || rootObject,
  };
}

/**
 * Helper function to categorize import sources
 */
function categorizeImport(source) {
  // NPM packages (no path indicators)
  if (
    !source.startsWith(".") &&
    !source.startsWith("/") &&
    !source.startsWith("@/")
  ) {
    return "npm";
  }

  // Relative imports
  if (source.startsWith("./") || source.startsWith("../")) {
    return "relative";
  }

  // Absolute imports
  if (source.startsWith("/")) {
    return "absolute";
  }

  // Alias imports (like @/ or ~/)
  if (source.startsWith("@/") || source.startsWith("~/")) {
    return "alias";
  }

  // Default fallback
  return "other";
}

/**
 * =================================================================
 * Phase 4: Report Generation
 * =================================================================
 * Aggregates analysis from all files and writes the final JSON
 * report to the filesystem.
 */
async function processDirectory(targetDir) {
  const files = await findSourceFiles(targetDir);
  const report = {};

  for (const file of files) {
    const fullPath = path.join(targetDir, file);
    console.log(`  -> Analyzing ${file}`);
    const analysisResult = await analyzeFile(fullPath);
    if (analysisResult) {
      report[file.replace(/\\/g, "/")] = analysisResult; // Normalize path separators
    }
  }
  return report;
}

async function generateReport(report, scannedDirectory) {
  // Generate timestamp in format: YYYY-MM-DD_HH-MM-SS (local time)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

  // Sanitize directory name for filename
  const dirName = scannedDirectory
    .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid filename characters
    .replace(/^\.+/, "") // Remove leading dots
    .replace(/\.+$/, "") // Remove trailing dots
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .toLowerCase();

  // Create reports directory if it doesn't exist
  const reportsDir = path.join(process.cwd(), "scan-functions-reports");
  try {
    await fs.mkdir(reportsDir, { recursive: true });
  } catch (error) {
    console.warn(
      `[Warning] Could not create reports directory: ${error.message}`,
    );
  }

  // Create main output directory with timestamp inside reports directory
  const outputDir = path.join(
    reportsDir,
    `scan-functions-report-${dirName}-${timestamp}`,
  );

  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`\n📁 Created output directory: ${outputDir}`);
  } catch (error) {
    console.error(`\n❌ Error creating output directory: ${error.message}`);
    return;
  }

  // Write individual JSON files for each scanned file
  let successCount = 0;
  let errorCount = 0;

  for (const [filePath, analysisResult] of Object.entries(report)) {
    try {
      // Convert file path to safe filename
      const safeFileName =
        filePath
          .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid filename characters
          .replace(/\//g, "_") // Replace forward slashes
          .replace(/\./g, "_") + // Replace dots with underscores
        ".json";

      const outputFilePath = path.join(outputDir, safeFileName);

      // Create file content with metadata
      const fileContent = {
        metadata: {
          originalFilePath: filePath,
          scannedDirectory: scannedDirectory,
          timestamp: timestamp,
          scanDate: now.toISOString(),
        },
        analysis: analysisResult,
      };

      await fs.writeFile(outputFilePath, JSON.stringify(fileContent, null, 2));
      console.log(`  ✅ ${filePath} -> ${safeFileName}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error writing ${filePath}: ${error.message}`);
      errorCount++;
    }
  }

  // Create a summary file
  try {
    const summaryContent = {
      metadata: {
        scannedDirectory: scannedDirectory,
        timestamp: timestamp,
        scanDate: now.toISOString(),
        totalFiles: Object.keys(report).length,
        successfulWrites: successCount,
        errors: errorCount,
      },
      fileList: Object.keys(report).map((filePath) => ({
        originalPath: filePath,
        jsonFile:
          filePath
            .replace(/[<>:"/\\|?*]/g, "_")
            .replace(/\//g, "_")
            .replace(/\./g, "_") + ".json",
      })),
      summary: {
        totalFunctionsDefined: Object.values(report).reduce(
          (total, file) => total + file.defined.length,
          0,
        ),
        totalFunctionsCalled: Object.values(report).reduce(
          (total, file) => total + file.called.length,
          0,
        ),
        totalImports: Object.values(report).reduce(
          (total, file) => total + Object.keys(file.imports).length,
          0,
        ),
        totalDestructuredFunctions: Object.values(report).reduce(
          (total, file) =>
            total + Object.keys(file.destructuredFunctions).length,
          0,
        ),
      },
    };

    const summaryPath = path.join(outputDir, "_SUMMARY.json");
    await fs.writeFile(summaryPath, JSON.stringify(summaryContent, null, 2));
    console.log(`  📊 Summary file created: _SUMMARY.json`);
  } catch (error) {
    console.error(`  ❌ Error writing summary file: ${error.message}`);
  }

  console.log(`\n✅ Success! Generated ${successCount} files in ${outputDir}`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} files had errors during generation`);
  }
}
