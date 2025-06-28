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
 *   Creates a file named "function_report_YYYY-MM-DD_HH-MM-SS.json" in the
 *   "scan-functions-reports" directory (created automatically if needed) with
 *   the following structure:
 *
 *   {
 *     "relative/path/to/file.tsx": {
 *       "defined": ["functionName1", "functionName2"],
 *       "called": ["useState", "useEffect", "functionName1"],
 *       "both": ["functionName1"]
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
  await generateReport(report);
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

  try {
    const code = await fs.readFile(filePath, "utf-8");
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      errorRecovery: true, // Attempt to parse despite errors
    });

    traverse(ast, {
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
      // Catches all function calls: hello(), obj.hello(), console.log()
      CallExpression(path) {
        const callee = path.get("callee");
        if (callee.isIdentifier()) {
          called.add(callee.node.name);
        } else if (callee.isMemberExpression()) {
          const property = callee.get("property");
          if (property.isIdentifier()) {
            called.add(property.node.name);
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

  return { defined: definedArr, called: calledArr, both };
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

async function generateReport(report) {
  // Generate timestamp in format: YYYY-MM-DD_HH-MM-SS
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/:/g, "-")
    .replace(/\./g, "-")
    .replace("T", "_")
    .substring(0, 19);

  // Create reports directory if it doesn't exist
  const reportsDir = path.join(process.cwd(), "scan-functions-reports");
  try {
    await fs.mkdir(reportsDir, { recursive: true });
  } catch (error) {
    console.warn(
      `[Warning] Could not create reports directory: ${error.message}`,
    );
  }

  const outputPath = path.join(reportsDir, `function_report_${timestamp}.json`);
  try {
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Success! Report generated at ${outputPath}`);
  } catch (error) {
    console.error(`\n❌ Error writing report: ${error.message}`);
  }
}
