/**
 * Manual security test script for DOMPurify integration
 * Run this to verify XSS protection is working
 *
 * Usage: node --loader tsx scripts/test-sanitization.ts
 * Or just review the test cases below
 */

import { sanitizeHtmlContent } from "../lib/utils/emailParser";

console.log("=".repeat(80));
console.log("DOMPurify HTML Sanitization Security Tests");
console.log("=".repeat(80));
console.log();

const testCases = [
  {
    name: "Script Tag Injection",
    input: '<script>alert("XSS")</script><p>Safe content</p>',
    shouldNotContain: ["<script", 'alert("XSS")'],
    shouldContain: ["Safe content"],
  },
  {
    name: "Event Handler Injection",
    input: '<img src="x" onerror="alert(\'XSS\')">',
    shouldNotContain: ["onerror", "alert"],
    shouldContain: [],
  },
  {
    name: "JavaScript Protocol in Links",
    input: "<a href=\"javascript:alert('XSS')\">Click me</a>",
    shouldNotContain: ["javascript:"],
    shouldContain: ["Click me"],
  },
  {
    name: "Data URI (Allowed for Images)",
    input: '<img src="data:image/png;base64,iVBORw0KGgo=" alt="test">',
    shouldNotContain: [],
    shouldContain: ["data:image/png", "base64"],
  },
  {
    name: "External Links (Should Add Security Attrs)",
    input: '<a href="https://example.com">Link</a>',
    shouldNotContain: [],
    shouldContain: ['target="_blank"', 'rel="noopener noreferrer"'],
  },
  {
    name: "Form Elements (Should Be Removed)",
    input: '<form action="evil.com"><input type="text"></form>',
    shouldNotContain: ["<form", "<input"],
    shouldContain: [],
  },
  {
    name: "Safe HTML Formatting",
    input:
      "<div><h2>Title</h2><p>Text with <strong>bold</strong> and <em>italic</em>.</p></div>",
    shouldNotContain: [],
    shouldContain: [
      "<h2>",
      "<strong>",
      "<em>",
      "Title",
      "Text",
      "bold",
      "italic",
    ],
  },
  {
    name: "SVG XSS",
    input: '<svg><script>alert("XSS")</script></svg>',
    shouldNotContain: ["alert", "<script"],
    shouldContain: [],
  },
  {
    name: "Complex Table HTML",
    input: "<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>",
    shouldNotContain: [],
    shouldContain: ["<table", "<tr>", "<td>", "Cell 1", "Cell 2"],
  },
  {
    name: "CSS Expression Attack",
    input: "<p style=\"width: expression(alert('XSS'))\">Test</p>",
    shouldNotContain: ["expression", "alert"],
    shouldContain: ["Test"],
  },
];

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log("-".repeat(80));
  console.log("Input:", testCase.input);

  const sanitized = sanitizeHtmlContent(testCase.input);
  console.log("Output:", sanitized);

  let passed = true;
  const failures: string[] = [];

  // Check shouldNotContain
  testCase.shouldNotContain.forEach((badString) => {
    if (sanitized.includes(badString)) {
      passed = false;
      failures.push(`❌ Still contains dangerous string: "${badString}"`);
    }
  });

  // Check shouldContain
  testCase.shouldContain.forEach((goodString) => {
    if (!sanitized.includes(goodString)) {
      passed = false;
      failures.push(`❌ Missing expected string: "${goodString}"`);
    }
  });

  if (passed) {
    console.log("✅ PASSED");
    passCount++;
  } else {
    console.log("❌ FAILED");
    failures.forEach((failure) => console.log("  " + failure));
    failCount++;
  }

  console.log();
});

console.log("=".repeat(80));
console.log(
  `Results: ${passCount} passed, ${failCount} failed out of ${testCases.length} tests`,
);
console.log("=".repeat(80));

if (failCount === 0) {
  console.log("✅ All security tests passed! DOMPurify is working correctly.");
} else {
  console.log("❌ Some tests failed. Review the sanitization configuration.");
}
