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
 *   Creates a file named "function_report_{directory}_{timestamp}.json" in the
 *   "scan-functions-reports" directory (created automatically if needed) with
 *   the following structure:
 *
 *   {
 *     "relative/path/to/file.tsx": {
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
 *         "unknownFunction": { "source": "unknown", "type": "unknown" }
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
 *   - Categorizes imports by type: npm, relative, absolute, alias
 *   - Maps called functions to their import sources
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

/**
 * =================================================================
 * Phase 1: CLI Setup & Input Validation
 * =================================================================
 * Using 'commander' to create a robust CLI interface.
 */
program
  .version("1.0.0")
  .description(
    "A CLI tool to scan a directory for JS/TS files and report defined and called functions.",
  )
  .argument("<directory>", "The target directory to scan (e.g., .)")
  .action(main)
  .parse(process.argv);

async function main(directory) {
  const targetDir = path.resolve(directory);

  try {
    await fs.access(targetDir);
  } catch (error) {
    console.error(`Error: Directory not found at '${targetDir}'`);
    process.exit(1);
  }

  console.log(`Scanning files in: ${targetDir}`);
  const report = await processDirectory(targetDir);
  await generateReport(report, directory);
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
  const imports = new Map(); // Map function name to import info
  const calledWithImports = new Map(); // Map called functions to their import info

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
      // Catches: const hello = () => {} | const hello = function() {}
      VariableDeclarator(path) {
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
    });

    // Second pass to collect function calls with import information
    traverse(ast, {
      // Catches all function calls: hello(), obj.hello(), console.log()
      CallExpression(path) {
        const callee = path.get("callee");
        if (callee.isIdentifier()) {
          const functionName = callee.node.name;
          called.add(functionName);

          // Track import info for called functions
          if (imports.has(functionName)) {
            calledWithImports.set(functionName, imports.get(functionName));
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

            // For member expressions, try to get the object name
            const object = callee.get("object");
            if (object.isIdentifier()) {
              const objectName = object.node.name;
              if (imports.has(objectName)) {
                calledWithImports.set(functionName, {
                  ...imports.get(objectName),
                  memberOf: objectName,
                  functionName,
                });
              } else {
                calledWithImports.set(functionName, {
                  source: "unknown",
                  type: "unknown",
                  memberOf: objectName,
                  functionName,
                });
              }
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

  return {
    defined: definedArr,
    called: calledArr,
    both,
    imports: importsObj,
    calledWithImports: calledWithImportsObj,
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
  // Generate timestamp in format: YYYY-MM-DD_HH-MM-SS
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/:/g, "-")
    .replace(/\./g, "-")
    .replace("T", "_")
    .substring(0, 19);

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

  const outputPath = path.join(
    reportsDir,
    `function_report_${dirName}_${timestamp}.json`,
  );
  try {
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Success! Report generated at ${outputPath}`);
  } catch (error) {
    console.error(`\n❌ Error writing report: ${error.message}`);
  }
}
