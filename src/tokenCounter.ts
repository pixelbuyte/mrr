/**
 * Approximate token-count threshold above which adapter outputs warn the user
 * that a tool's context budget may be strained.
 */
export const TOKEN_WARNING_THRESHOLD = 2000;

/**
 * Roughly estimate the number of tokens in a string using the well-known
 * heuristic of ~4 characters per token. Good enough for budget warnings.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Returns true when the given text exceeds the rulesync token-warning budget.
 */
export function exceedsBudget(text: string): boolean {
  return estimateTokens(text) > TOKEN_WARNING_THRESHOLD;
}
