/**
 * CATEGORY ANALYSIS MODULE
 *
 * Analyzes new transactions and suggests categories based on existing
 * categorized transactions in the database using similarity matching.
 *
 * For banks with time-based table naming (e.g., SEB_202501, SEB_202502),
 * this module fetches categorized data from ALL related tables to provide
 * better category suggestions across historical data.
 */

import { supabase } from "@/lib/supabaseClient";
import {
  stringSimilarity,
  normalizeString,
  dateDifferenceInDays,
  amountsEqual,
} from "@/lib/utils/stringMatching";

/**
 * Get ALL available transaction tables from Supabase
 * Uses the existing RPC function 'get_user_accessible_tables' from global_2
 *
 * Returns all tables for maximum category matching accuracy - the same expense
 * (e.g., Spotify, Netflix) can appear across different banks and time periods.
 */
async function getAllTransactionTables(): Promise<string[]> {
  try {
    // Use the existing RPC function that global_2 page uses
    const { data, error } = await supabase.rpc("get_user_accessible_tables");

    if (error) {
      console.warn(
        "RPC function 'get_user_accessible_tables' not available, falling back to empty list",
      );
      console.warn(
        "This function should already exist in your database (used by global_2 page)",
      );
      // Return empty array - the caller will handle fallback
      return [];
    }

    if (data && Array.isArray(data) && data.length > 0) {
      const allTables = data.map(
        (row: { table_name: string }) => row.table_name,
      );

      console.log(
        `Found ${allTables.length} total transaction tables for category analysis:`,
        allTables,
      );
      return allTables;
    }

    // No tables found
    return [];
  } catch (err) {
    console.error("Error fetching transaction tables:", err);
    return [];
  }
}

/**
 * Transaction interface (matches existing structure)
 */
export interface Transaction extends Record<string, unknown> {
  id: number;
  Date: string | null;
  Description: string;
  Amount: number;
  Balance?: number | null;
  Category?: string | null;
}

/**
 * Category match result for a single transaction
 */
export interface CategoryMatch {
  newTransaction: Transaction;
  suggestedCategory: string;
  confidence: number; // 0-100
  similarTransactions: Transaction[]; // Top matches from DB
  matchReason: "exact" | "high" | "partial" | "amount" | "none";
}

/**
 * Complete category analysis result
 */
export interface CategoryAnalysis {
  tableName: string;
  matches: CategoryMatch[];
  stats: {
    highConfidence: number; // >85%
    mediumConfidence: number; // 50-85%
    lowConfidence: number; // <50%
    noMatch: number; // 0%
    alreadyCategorized: number; // Already has category
  };
  availableCategories: string[]; // All unique categories in DB
}

/**
 * User's decision for a transaction category
 */
export interface CategoryDecision {
  transactionId: number;
  category: string;
  action: "accept" | "edit" | "skip";
}

/**
 * Progress callback for category analysis
 */
export interface CategoryAnalysisProgress {
  stage: "discovering" | "fetching" | "analyzing" | "complete";
  message: string;
  current: number;
  total: number;
  currentTable?: string;
  timings?: {
    discovering?: number;
    fetching?: number;
    analyzing?: number;
    total?: number;
  };
}

/**
 * Analyze new transactions and suggest categories based on existing data
 * Fetches from ALL related tables (e.g., all SEB_* tables) for better suggestions
 *
 * @param tableName - The target table name (for reference)
 * @param newTransactions - The new transactions to analyze
 * @param onProgress - Optional callback to report progress updates
 */
export async function analyzeCategoryMatches(
  tableName: string,
  newTransactions: Transaction[],
  onProgress?: (progress: CategoryAnalysisProgress) => void,
): Promise<CategoryAnalysis> {
  // Track timings for each stage
  const timings = {
    start: Date.now(),
    discovering: 0,
    fetching: 0,
    analyzing: 0,
    total: 0,
  };

  try {
    // Stage 1: Discover tables
    const discoveringStart = Date.now();
    onProgress?.({
      stage: "discovering",
      message: "Discovering transaction tables...",
      current: 0,
      total: 1,
    });

    // Get ALL transaction tables (not filtered by prefix)
    // This gives us maximum data for accurate suggestions across all banks
    const allTables = await getAllTransactionTables();
    timings.discovering = Date.now() - discoveringStart;

    console.log(
      `Analyzing categories using ${allTables.length} table(s) across ALL banks:`,
      allTables,
    );

    // Stage 2: Fetch categorized transactions from ALL tables
    const fetchingStart = Date.now();
    onProgress?.({
      stage: "fetching",
      message: `Found ${allTables.length} tables. Starting to fetch categorized data...`,
      current: 0,
      total: allTables.length,
      timings: {
        discovering: timings.discovering,
      },
    });

    const allCategorizedTransactions: Transaction[] = [];
    let tableIndex = 0;

    for (const table of allTables) {
      tableIndex++;

      onProgress?.({
        stage: "fetching",
        message: `Fetching from ${table}...`,
        current: tableIndex,
        total: allTables.length,
        currentTable: table,
      });

      try {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .not("Category", "is", null)
          .not("Category", "eq", "Unknown")
          .not("Category", "eq", "Uncategorized")
          .not("Category", "eq", "");

        if (error) {
          console.warn(`Could not fetch from table '${table}':`, error.message);
          continue; // Skip this table and try the next one
        }

        if (data && data.length > 0) {
          allCategorizedTransactions.push(...(data as Transaction[]));
          console.log(
            `Found ${data.length} categorized transactions in '${table}'`,
          );
        }
      } catch (tableError) {
        console.warn(`Error accessing table '${table}':`, tableError);
        continue;
      }
    }

    const categorizedTransactions = allCategorizedTransactions;
    timings.fetching = Date.now() - fetchingStart;

    console.log(
      `Total categorized transactions found: ${categorizedTransactions.length}`,
    );

    // Extract unique categories
    const availableCategories = Array.from(
      new Set(
        categorizedTransactions
          .map((t) => t.Category)
          .filter((c): c is string => c !== null && c !== undefined),
      ),
    ).sort();

    // If no categorized data exists, return empty analysis
    if (categorizedTransactions.length === 0) {
      timings.total = Date.now() - timings.start;
      onProgress?.({
        stage: "complete",
        message: "No categorized data found",
        current: 0,
        total: 0,
        timings: {
          discovering: timings.discovering,
          fetching: timings.fetching,
          analyzing: 0,
          total: timings.total,
        },
      });

      return {
        tableName,
        matches: newTransactions.map((txn) => ({
          newTransaction: txn,
          suggestedCategory: "Unknown",
          confidence: 0,
          similarTransactions: [],
          matchReason: "none",
        })),
        stats: {
          highConfidence: 0,
          mediumConfidence: 0,
          lowConfidence: 0,
          noMatch: newTransactions.length,
          alreadyCategorized: 0,
        },
        availableCategories: [],
      };
    }

    // Stage 3: Analyze each new transaction
    const analyzingStart = Date.now();
    onProgress?.({
      stage: "analyzing",
      message: `Analyzing ${newTransactions.length} transactions against ${categorizedTransactions.length} historical records...`,
      current: 0,
      total: newTransactions.length,
      timings: {
        discovering: timings.discovering,
        fetching: timings.fetching,
      },
    });

    const matches: CategoryMatch[] = [];
    let highConfidenceCount = 0;
    let mediumConfidenceCount = 0;
    let lowConfidenceCount = 0;
    let noMatchCount = 0;
    let alreadyCategorizedCount = 0;
    let txnIndex = 0;

    for (const newTxn of newTransactions) {
      txnIndex++;

      onProgress?.({
        stage: "analyzing",
        message: `Analyzing transaction ${txnIndex}/${newTransactions.length}: ${newTxn.Description?.substring(0, 40)}...`,
        current: txnIndex,
        total: newTransactions.length,
      });
      // Skip if already has a meaningful category
      if (
        newTxn.Category &&
        newTxn.Category !== "Unknown" &&
        newTxn.Category !== "Uncategorized" &&
        newTxn.Category !== ""
      ) {
        alreadyCategorizedCount++;
        matches.push({
          newTransaction: newTxn,
          suggestedCategory: newTxn.Category,
          confidence: 100,
          similarTransactions: [],
          matchReason: "exact",
        });
        highConfidenceCount++;
        continue;
      }

      // Find similar transactions and suggest category
      const match = findBestCategoryMatch(newTxn, categorizedTransactions);
      matches.push(match);

      // Update stats
      if (match.confidence > 85) {
        highConfidenceCount++;
      } else if (match.confidence >= 50) {
        mediumConfidenceCount++;
      } else if (match.confidence > 0) {
        lowConfidenceCount++;
      } else {
        noMatchCount++;
      }
    }

    // Complete analyzing timing
    timings.analyzing = Date.now() - analyzingStart;
    timings.total = Date.now() - timings.start;

    // Format timing summary
    const formatTime = (ms: number) => (ms / 1000).toFixed(2);
    const timingSummary = `Total: ${formatTime(timings.total)}s (discovering: ${formatTime(timings.discovering)}s, fetching: ${formatTime(timings.fetching)}s, analyzing: ${formatTime(timings.analyzing)}s)`;

    // Stage 4: Complete
    onProgress?.({
      stage: "complete",
      message: `Analysis complete! Found ${highConfidenceCount} high confidence, ${mediumConfidenceCount} medium confidence matches. ${timingSummary}`,
      current: newTransactions.length,
      total: newTransactions.length,
      timings,
    });

    console.log(`Category analysis timing: ${timingSummary}`);

    return {
      tableName,
      matches,
      stats: {
        highConfidence: highConfidenceCount,
        mediumConfidence: mediumConfidenceCount,
        lowConfidence: lowConfidenceCount,
        noMatch: noMatchCount,
        alreadyCategorized: alreadyCategorizedCount,
      },
      availableCategories,
    };
  } catch (error) {
    console.error("Error in analyzeCategoryMatches:", error);
    throw error;
  }
}

/**
 * Find the best category match for a transaction
 */
function findBestCategoryMatch(
  newTxn: Transaction,
  existingTransactions: Transaction[],
): CategoryMatch {
  const matches: Array<{
    transaction: Transaction;
    score: number;
    reason: CategoryMatch["matchReason"];
  }> = [];

  for (const existing of existingTransactions) {
    let score = 0;
    let reason: CategoryMatch["matchReason"] = "none";

    // 1. Check for exact description match (100%)
    if (
      normalizeString(newTxn.Description) ===
      normalizeString(existing.Description)
    ) {
      score = 100;
      reason = "exact";
    } else {
      // 2. Calculate description similarity
      const similarity = stringSimilarity(
        newTxn.Description,
        existing.Description,
      );

      // 3. Check if amounts are equal or very similar
      const amountMatch = amountsEqual(newTxn.Amount, existing.Amount);

      // 4. Check date proximity (for recurring transactions)
      let dateBonus = 0;
      if (newTxn.Date && existing.Date) {
        const daysDiff = Math.abs(
          dateDifferenceInDays(newTxn.Date, existing.Date),
        );
        if (daysDiff <= 31) {
          // Within a month
          dateBonus = 10;
        } else if (daysDiff <= 365) {
          // Within a year
          dateBonus = 5;
        }
      }

      // Calculate final score
      score = similarity;
      if (amountMatch) {
        score += 15; // Boost for matching amount
      }
      score += dateBonus;
      score = Math.min(100, score); // Cap at 100

      // Determine match reason
      if (score > 85) {
        reason = "high";
      } else if (score >= 50) {
        reason = "partial";
      } else if (amountMatch && similarity > 30) {
        reason = "amount";
        score = Math.max(score, 50); // Boost amount-based matches
      }
    }

    if (score > 0) {
      matches.push({ transaction: existing, score, reason });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  // Get top 5 similar transactions
  const topMatches = matches.slice(0, 5);

  if (topMatches.length === 0) {
    // No matches found
    return {
      newTransaction: newTxn,
      suggestedCategory: "Unknown",
      confidence: 0,
      similarTransactions: [],
      matchReason: "none",
    };
  }

  // Use the best match for category suggestion
  const bestMatch = topMatches[0];
  const suggestedCategory = bestMatch.transaction.Category || "Unknown";

  return {
    newTransaction: newTxn,
    suggestedCategory,
    confidence: Math.round(bestMatch.score),
    similarTransactions: topMatches.map((m) => m.transaction),
    matchReason: bestMatch.reason,
  };
}

/**
 * Apply category decisions to transactions in Supabase
 */
export async function applyCategoryDecisions(
  tableName: string,
  decisions: CategoryDecision[],
): Promise<{ success: boolean; message: string; updated: number }> {
  try {
    let updatedCount = 0;

    // Apply decisions in batches for better performance
    const decisionsToApply = decisions.filter((d) => d.action !== "skip");

    for (const decision of decisionsToApply) {
      const { error } = await supabase
        .from(tableName)
        .update({ Category: decision.category })
        .eq("id", decision.transactionId);

      if (error) {
        console.error(
          `Error updating transaction ${decision.transactionId}:`,
          error,
        );
        throw error;
      }

      updatedCount++;
    }

    return {
      success: true,
      message: `Successfully updated ${updatedCount} transaction${updatedCount !== 1 ? "s" : ""}`,
      updated: updatedCount,
    };
  } catch (error) {
    console.error("Error applying category decisions:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to apply category decisions",
      updated: 0,
    };
  }
}

/**
 * Initialize default decisions (all set to accept)
 */
export function initializeCategoryDecisions(
  matches: CategoryMatch[],
): Map<number, CategoryDecision> {
  const decisions = new Map<number, CategoryDecision>();

  for (const match of matches) {
    // Skip transactions that already have meaningful categories
    if (
      match.newTransaction.Category &&
      match.newTransaction.Category !== "Unknown" &&
      match.newTransaction.Category !== "Uncategorized"
    ) {
      continue;
    }

    decisions.set(match.newTransaction.id, {
      transactionId: match.newTransaction.id,
      category: match.suggestedCategory,
      action: match.confidence > 85 ? "accept" : "skip", // Auto-accept high confidence
    });
  }

  return decisions;
}
