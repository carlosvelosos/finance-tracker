const path = require("path");
const fs = require("fs").promises;
const readline = require("readline");

// Simple test script to demonstrate the multi-directory selection functionality
// This simulates what happens in the main scan-functions.js script

// Function to get available directories
async function getAvailableDirectories() {
  try {
    const items = await fs.readdir(".", { withFileTypes: true });
    return items
      .filter(
        (item) =>
          item.isDirectory() &&
          !item.name.startsWith(".") &&
          item.name !== "node_modules" &&
          item.name !== "out",
      )
      .map((item) => item.name)
      .sort();
  } catch (error) {
    console.error("Error reading directories:", error.message);
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
        console.log(`\n⭐ Currently selected: ${selectedNames}`);
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

// Demo function
async function testMultiSelect() {
  console.log("🧪 Testing Multi-Directory Selection Functionality");
  console.log(
    "This demonstrates the keyboard navigation and multi-select features.\n",
  );

  try {
    const directories = await getAvailableDirectories();
    console.log(`Found ${directories.length} directories to choose from.`);

    const selected = await promptDirectorySelection(directories, ".");

    console.log("\n✅ Selection complete!");
    console.log("Selected directories:");
    selected.forEach((dir, index) => {
      const displayName = dir === "USE_CURRENT" ? "." : dir;
      console.log(`  ${index + 1}. ${displayName}`);
    });
  } catch (error) {
    if (error.message === "USER_EXIT") {
      console.log("\n👋 Goodbye!");
    } else {
      console.error("Error:", error.message);
    }
  }
}

// Run the test
testMultiSelect();
