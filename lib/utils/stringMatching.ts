/**
 * STRING MATCHING UTILITIES
 *
 * Provides various string comparison and similarity algorithms for conflict detection.
 * Used to identify potential duplicate transactions based on fuzzy matching.
 */

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits (insertions, deletions, or substitutions)
 * required to change one string into the other.
 *
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns Number of edits needed (0 = identical, higher = more different)
 *
 * @example
 * levenshteinDistance("TELIA BREDBAND", "TELIA BREDBAND") // 0 (exact match)
 * levenshteinDistance("TELIA", "TEILA") // 2 (one swap = 2 edits)
 * levenshteinDistance("NETFLIX", "NETFLEX") // 1
 */
export function levenshteinDistance(str1: string, str2: string): number {
  // Normalize strings: lowercase and trim
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // Handle edge cases
  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  // Create matrix
  const matrix: number[][] = [];

  // Initialize first column (distance from empty string to s2)
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row (distance from empty string to s1)
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        // Characters match, no operation needed
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        // Take minimum of three operations
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[s2.length][s1.length];
}

/**
 * Calculate Jaro-Winkler similarity between two strings
 * Returns a value between 0 (completely different) and 1 (identical)
 * More forgiving than Levenshtein for typos at the beginning of strings
 *
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns Similarity score from 0.0 to 1.0
 *
 * @example
 * jaroWinklerSimilarity("MARTHA", "MARHTA") // ~0.96 (high similarity)
 * jaroWinklerSimilarity("DIXON", "DICKSONX") // ~0.81
 * jaroWinklerSimilarity("NETFLIX", "SPOTIFY") // ~0.44 (low similarity)
 */
export function jaroWinklerSimilarity(str1: string, str2: string): number {
  // Normalize strings
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // Handle edge cases
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  // Calculate Jaro similarity first
  const jaroSimilarity = calculateJaroSimilarity(s1, s2);

  // If Jaro similarity is below threshold, return it as-is
  if (jaroSimilarity < 0.7) return jaroSimilarity;

  // Calculate common prefix length (up to 4 characters)
  let prefixLength = 0;
  const maxPrefixLength = Math.min(4, s1.length, s2.length);

  for (let i = 0; i < maxPrefixLength; i++) {
    if (s1[i] === s2[i]) {
      prefixLength++;
    } else {
      break;
    }
  }

  // Apply Winkler modification
  const prefixScale = 0.1; // Standard scaling factor
  const jaroWinkler =
    jaroSimilarity + prefixLength * prefixScale * (1 - jaroSimilarity);

  return jaroWinkler;
}

/**
 * Calculate base Jaro similarity (helper for Jaro-Winkler)
 * @private
 */
function calculateJaroSimilarity(s1: string, s2: string): number {
  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;

  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Identify matches
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  // Calculate Jaro similarity
  const jaro =
    (matches / s1.length +
      matches / s2.length +
      (matches - transpositions / 2) / matches) /
    3;

  return jaro;
}

/**
 * Calculate string similarity percentage (0-100%)
 * Wrapper around Jaro-Winkler that returns a percentage
 *
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns Similarity percentage from 0 to 100
 *
 * @example
 * stringSimilarity("TELIA BREDBAND", "TELIA") // ~55%
 * stringSimilarity("American Express", "American Expre") // ~96%
 */
export function stringSimilarity(str1: string, str2: string): number {
  const similarity = jaroWinklerSimilarity(str1, str2);
  return Math.round(similarity * 100);
}

/**
 * Calculate the difference in days between two dates
 *
 * @param date1 - First date (string in YYYY-MM-DD format or Date object)
 * @param date2 - Second date (string in YYYY-MM-DD format or Date object)
 * @returns Absolute number of days between the dates
 *
 * @example
 * dateDifferenceInDays("2025-04-30", "2025-05-01") // 1
 * dateDifferenceInDays("2025-04-28", "2025-05-02") // 4
 */
export function dateDifferenceInDays(
  date1: string | Date,
  date2: string | Date,
): number {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;

  // Calculate difference in milliseconds
  const diffMs = Math.abs(d1.getTime() - d2.getTime());

  // Convert to days
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if two amounts are approximately equal (within tolerance)
 * Handles floating-point precision issues
 *
 * @param amount1 - First amount
 * @param amount2 - Second amount
 * @param tolerance - Maximum acceptable difference (default: 0.01)
 * @returns True if amounts are within tolerance
 *
 * @example
 * amountsEqual(749.00, 749.00) // true
 * amountsEqual(749.00, 749.01, 0.01) // false
 * amountsEqual(749.00, 749.001, 0.01) // true
 */
export function amountsEqual(
  amount1: number,
  amount2: number,
  tolerance: number = 0.01,
): boolean {
  return Math.abs(amount1 - amount2) < tolerance;
}

/**
 * Normalize a string for comparison
 * Removes extra whitespace, converts to lowercase, removes special characters
 *
 * @param str - String to normalize
 * @returns Normalized string
 *
 * @example
 * normalizeString("  TELIA  BREDBAND  ") // "telia bredband"
 * normalizeString("American Express®") // "american express"
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[®™©]/g, "") // Remove trademark symbols
    .replace(/[^\w\s-]/g, ""); // Remove special characters except word chars, spaces, and hyphens
}

/**
 * Check if two strings are similar enough to be considered a match
 * Uses Jaro-Winkler similarity with a threshold
 *
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @param threshold - Minimum similarity (0-1) to consider a match (default: 0.8)
 * @returns True if strings are similar above threshold
 *
 * @example
 * areStringsSimilar("TELIA BREDBAND", "TELIA BREBAND") // true (typo)
 * areStringsSimilar("NETFLIX", "SPOTIFY") // false (different)
 */
export function areStringsSimilar(
  str1: string,
  str2: string,
  threshold: number = 0.8,
): boolean {
  const similarity = jaroWinklerSimilarity(str1, str2);
  return similarity >= threshold;
}
