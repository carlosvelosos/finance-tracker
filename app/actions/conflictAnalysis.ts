/**
 * CONFLICT ANALYSIS ENGINE
 *
 * Analyzes uploaded transactions against existing database records to detect
 * potential duplicates using 4 levels of matching criteria.
 *
 * Match Levels:
 * - Level 1 (100%): Exact duplicate - same date, description, and amount
 * - Level 2 (90%): High confidence - same date/amount, very similar description
 * - Level 3 (70%): Possible duplicate - adjacent date (±1 day), same amount
 * - Level 4 (50%): Suspicious similarity - similar date/amount/description
 */

import { supabase } from "@/lib/supabaseClient";
import {
  levenshteinDistance,
  stringSimilarity,
  dateDifferenceInDays,
  amountsEqual,
  normalizeString,
} from "@/lib/utils/stringMatching";

/**
 * Transaction interface matching database schema
 * Using Record<string, unknown> to be compatible with uploadToSupabase
 */
export interface Transaction extends Record<string, unknown> {
  id: number;
  Date: string | null;
  Description: string;
  Amount: number;
  Balance?: number;
  Category?: string;
  Responsible?: string;
  Comment?: string;
  user_id?: string;
  Bank?: string;
  created_at?: string;
}

/**
 * Match level for conflict detection
 */
export type MatchLevel = 1 | 2 | 3 | 4;

/**
 * Border color for each match level
 */
export type BorderColor = "red" | "orange" | "yellow" | "gray";

/**
 * Represents a potential duplicate conflict
 */
export interface ConflictMatch {
  newTransaction: Transaction;
  possibleDuplicates: Transaction[];
  matchLevel: MatchLevel;
  matchScore: number; // 100, 90, 70, or 50
  matchReason: string;
  defaultAction: "add" | "skip";
  borderColor: BorderColor;
}

/**
 * Result of conflict analysis
 */
export interface ConflictAnalysis {
  tableName: string;
  totalNewTransactions: number;
  safeToAdd: Transaction[];
  conflicts: ConflictMatch[];
  autoSkipped: Transaction[];
  existingTransactions: Transaction[];
}

/**
 * User's decision for a transaction
 */
export interface TransactionDecision {
  transaction: Transaction;
  action: "add" | "skip";
  wasAutoResolved: boolean;
}

/**
 * Main function to analyze upload conflicts
 *
 * @param tableName - Target database table (e.g., "HB_2025")
 * @param newTransactions - Transactions from uploaded file
 * @param autoSkipExactDuplicates - Whether to auto-skip 100% matches
 * @returns Analysis result with categorized transactions
 */
export async function analyzeUploadConflicts(
  tableName: string,
  newTransactions: Transaction[],
  autoSkipExactDuplicates: boolean = false,
): Promise<ConflictAnalysis> {
  console.log("Starting conflict analysis for table:", tableName);
  console.log("New transactions (before filtering):", newTransactions.length);
  console.log("Auto-skip enabled:", autoSkipExactDuplicates);

  // Filter out invalid transactions (header rows, N/A rows, etc.)
  const validTransactions = newTransactions.filter((txn) => {
    // Skip if both Date and Description are N/A, null, or empty
    const hasValidDate =
      txn.Date && txn.Date !== "N/A" && txn.Date.trim() !== "";
    const hasValidDescription =
      txn.Description &&
      txn.Description !== "N/A" &&
      txn.Description.trim() !== "";

    // Must have at least one valid field
    if (!hasValidDate && !hasValidDescription) {
      console.log("Filtering out invalid transaction:", txn);
      return false;
    }

    return true;
  });

  console.log(
    "Valid transactions (after filtering):",
    validTransactions.length,
  );
  console.log(
    "Filtered out:",
    newTransactions.length - validTransactions.length,
    "invalid rows",
  );

  try {
    // Fetch existing data from Supabase
    const { data: existingTransactions, error } = await supabase
      .from(tableName)
      .select("*")
      .order("Date", { ascending: false });

    if (error) {
      // If table doesn't exist, all transactions are safe to add
      if (error.code === "PGRST116" || error.code === "42P01") {
        console.log("Table doesn't exist - all transactions are safe to add");
        return {
          tableName,
          totalNewTransactions: validTransactions.length,
          safeToAdd: validTransactions,
          conflicts: [],
          autoSkipped: [],
          existingTransactions: [],
        };
      }
      throw error;
    }

    const existing = existingTransactions || [];
    console.log("Existing transactions in DB:", existing.length);

    // If no existing data, all new transactions are safe
    if (existing.length === 0) {
      console.log("No existing data - all transactions are safe to add");
      return {
        tableName,
        totalNewTransactions: validTransactions.length,
        safeToAdd: validTransactions,
        conflicts: [],
        autoSkipped: [],
        existingTransactions: [],
      };
    }

    // Analyze each new transaction for conflicts
    const safeToAdd: Transaction[] = [];
    const conflicts: ConflictMatch[] = [];
    const autoSkipped: Transaction[] = [];

    for (const newTxn of validTransactions) {
      const matchResult = findBestMatch(newTxn, existing);

      if (matchResult === null) {
        // No match found - safe to add
        safeToAdd.push(newTxn);
      } else {
        // Conflict found
        if (autoSkipExactDuplicates && matchResult.matchLevel === 1) {
          // Auto-skip exact duplicates
          autoSkipped.push(newTxn);
        } else {
          // Add to conflicts for user review
          conflicts.push(matchResult);
        }
      }
    }

    console.log("Analysis complete:", {
      safeToAdd: safeToAdd.length,
      conflicts: conflicts.length,
      autoSkipped: autoSkipped.length,
    });

    return {
      tableName,
      totalNewTransactions: validTransactions.length,
      safeToAdd,
      conflicts,
      autoSkipped,
      existingTransactions: existing,
    };
  } catch (error) {
    console.error("Error in analyzeUploadConflicts:", error);
    throw error;
  }
}

/**
 * Find the best match for a transaction among existing records
 * Returns the highest-level match found (Level 1 > Level 2 > Level 3 > Level 4)
 *
 * @param newTxn - Transaction to check
 * @param existingTxns - Existing transactions to compare against
 * @returns ConflictMatch if found, null if no match
 */
function findBestMatch(
  newTxn: Transaction,
  existingTxns: Transaction[],
): ConflictMatch | null {
  // Try each match level in order of strictness
  let level1Matches = checkLevel1Match(newTxn, existingTxns);
  if (level1Matches.length > 0) {
    return createConflictMatch(newTxn, level1Matches, 1);
  }

  let level2Matches = checkLevel2Match(newTxn, existingTxns);
  if (level2Matches.length > 0) {
    return createConflictMatch(newTxn, level2Matches, 2);
  }

  let level3Matches = checkLevel3Match(newTxn, existingTxns);
  if (level3Matches.length > 0) {
    return createConflictMatch(newTxn, level3Matches, 3);
  }

  let level4Matches = checkLevel4Match(newTxn, existingTxns);
  if (level4Matches.length > 0) {
    return createConflictMatch(newTxn, level4Matches, 4);
  }

  return null; // No match at any level
}

/**
 * Level 1: Exact Duplicate (100% match)
 * Same date, description (case-insensitive), and amount
 */
function checkLevel1Match(
  newTxn: Transaction,
  existingTxns: Transaction[],
): Transaction[] {
  return existingTxns.filter((existing) => {
    const sameDate = newTxn.Date === existing.Date;
    const sameDescription =
      normalizeString(newTxn.Description) ===
      normalizeString(existing.Description);
    const sameAmount = amountsEqual(newTxn.Amount, existing.Amount, 0.01);

    return sameDate && sameDescription && sameAmount;
  });
}

/**
 * Level 2: High Confidence Duplicate (90% match)
 * Same date and amount, very similar description (Levenshtein distance ≤ 2)
 */
function checkLevel2Match(
  newTxn: Transaction,
  existingTxns: Transaction[],
): Transaction[] {
  return existingTxns.filter((existing) => {
    const sameDate = newTxn.Date === existing.Date;
    const sameAmount = amountsEqual(newTxn.Amount, existing.Amount, 0.01);
    const distance = levenshteinDistance(
      newTxn.Description,
      existing.Description,
    );

    return sameDate && sameAmount && distance <= 2;
  });
}

/**
 * Level 3: Possible Duplicate (70% match)
 * Adjacent date (±1 day) and same amount
 */
function checkLevel3Match(
  newTxn: Transaction,
  existingTxns: Transaction[],
): Transaction[] {
  if (!newTxn.Date) return [];

  return existingTxns.filter((existing) => {
    if (!existing.Date) return false;
    const daysDiff = dateDifferenceInDays(newTxn.Date!, existing.Date);
    const sameAmount = amountsEqual(newTxn.Amount, existing.Amount, 0.01);

    return daysDiff <= 1 && sameAmount;
  });
}

/**
 * Level 4: Suspicious Similarity (50% match)
 * Similar date (±2 days), similar amount (±10), and similar description (>80%)
 */
function checkLevel4Match(
  newTxn: Transaction,
  existingTxns: Transaction[],
): Transaction[] {
  if (!newTxn.Date) return [];

  return existingTxns.filter((existing) => {
    if (!existing.Date) return false;
    const daysDiff = dateDifferenceInDays(newTxn.Date!, existing.Date);
    const amountDiff = Math.abs(newTxn.Amount - existing.Amount);
    const descriptionSimilarity = stringSimilarity(
      newTxn.Description,
      existing.Description,
    );

    return daysDiff <= 2 && amountDiff <= 10 && descriptionSimilarity > 80;
  });
}

/**
 * Create a ConflictMatch object from match results
 */
function createConflictMatch(
  newTxn: Transaction,
  matches: Transaction[],
  level: MatchLevel,
): ConflictMatch {
  const matchInfo = getMatchInfo(level);

  return {
    newTransaction: newTxn,
    possibleDuplicates: matches,
    matchLevel: level,
    matchScore: matchInfo.score,
    matchReason: matchInfo.reason,
    defaultAction: matchInfo.defaultAction,
    borderColor: matchInfo.borderColor,
  };
}

/**
 * Get match information for a specific level
 */
function getMatchInfo(level: MatchLevel): {
  score: number;
  reason: string;
  defaultAction: "add" | "skip";
  borderColor: BorderColor;
} {
  switch (level) {
    case 1:
      return {
        score: 100,
        reason: "Exact duplicate (same date, description, and amount)",
        defaultAction: "skip",
        borderColor: "red",
      };
    case 2:
      return {
        score: 90,
        reason: "Same date and amount, very similar description",
        defaultAction: "skip",
        borderColor: "orange",
      };
    case 3:
      return {
        score: 70,
        reason: "Adjacent date (±1 day), same amount",
        defaultAction: "add",
        borderColor: "yellow",
      };
    case 4:
      return {
        score: 50,
        reason:
          "Similar date (±2 days), similar amount (±10), similar description",
        defaultAction: "add",
        borderColor: "gray",
      };
  }
}

/**
 * Apply user decisions to get final list of transactions to upload
 *
 * @param analysis - Original conflict analysis
 * @param decisions - User's decisions for conflicts
 * @returns Array of transactions approved for upload
 */
export function applyUserDecisions(
  analysis: ConflictAnalysis,
  decisions: Map<number, "add" | "skip">,
): Transaction[] {
  const approved: Transaction[] = [];

  // Add all safe transactions (no conflicts)
  approved.push(...analysis.safeToAdd);

  // Add user-approved conflicts
  for (const conflict of analysis.conflicts) {
    const txnId = conflict.newTransaction.id;
    const decision = decisions.get(txnId);

    // Use default action if no explicit decision
    const action = decision || conflict.defaultAction;

    if (action === "add") {
      approved.push(conflict.newTransaction);
    }
  }

  return approved;
}

/**
 * Get count of unresolved conflicts (conflicts that need user decision)
 * A conflict is unresolved if user hasn't made a decision AND the default is not clear
 *
 * @param conflicts - Array of conflicts
 * @param decisions - User's decisions so far
 * @returns Number of unresolved conflicts
 */
export function getUnresolvedConflictCount(
  conflicts: ConflictMatch[],
  decisions: Map<number, "add" | "skip">,
): number {
  return conflicts.filter((conflict) => {
    const txnId = conflict.newTransaction.id;
    const hasDecision = decisions.has(txnId);

    // For levels 1 & 2 (skip by default), we consider them "resolved" by default
    // For levels 3 & 4 (add by default), we consider them "resolved" by default
    // Only truly unresolved if user explicitly needs to decide (which we'll handle in UI)

    return !hasDecision; // Count as unresolved if no explicit decision yet
  }).length;
}

/**
 * Initialize decisions map with default actions
 *
 * @param conflicts - Array of conflicts
 * @returns Map of transaction ID to default action
 */
export function initializeDefaultDecisions(
  conflicts: ConflictMatch[],
): Map<number, "add" | "skip"> {
  const decisions = new Map<number, "add" | "skip">();

  for (const conflict of conflicts) {
    decisions.set(conflict.newTransaction.id, conflict.defaultAction);
  }

  return decisions;
}
