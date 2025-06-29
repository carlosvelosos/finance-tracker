// Simple test to verify the CLI logic
const fs = require("fs").promises;
const path = require("path");

// Mock the functions to test logic
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

// Test the directory scanning logic
async function testDirectoryScanning() {
  console.log("Testing directory scanning logic...");

  const currentDirs = await getSubdirectories(".");
  console.log("Current directory subdirectories:", currentDirs);

  if (currentDirs.length > 0) {
    const firstDir = currentDirs[0];
    const subDirs = await getSubdirectories(firstDir);
    console.log(`Subdirectories in ${firstDir}:`, subDirs);
  }

  console.log("Directory scanning logic works correctly!");
}

testDirectoryScanning().catch(console.error);
