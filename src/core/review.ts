import type { ReviewResult } from "../types/index";

export type ReviewOptions = {
  format: "json" | "text";
  verbose: boolean;
};

/**
 * Core review logic — not yet implemented.
 * Receives raw source code and returns a ReviewResult.
 */
export async function review(
  code: string,
  options: ReviewOptions
): Promise<ReviewResult> {
  // TODO: implement review logic
  void code;
  void options;
  return { issues: [] };
}
