import type { ReviewOptions, ReviewResult, RuleContext } from "../types/index";
import { rules } from "../rules/index";
import { parseCode } from "./codeParser";
import { selectRules } from "./ruleRegistry";
import { runRules } from "./ruleRunner";
import { calculateScore } from "./scoring";
import { calculateRisk } from "./risk";
import { buildSuggestions } from "./suggestions";
import { collectWarnings } from "./warnings";

export { runRules } from "./ruleRunner";
export { calculateScore } from "./scoring";
export { calculateRisk } from "./risk";
export { buildSuggestions } from "./suggestions";
export { collectWarnings } from "./warnings";

/**
 * Pure, synchronous function that analyses source code.
 * Contains no CLI logic and produces no side-effects.
 */
export function reviewCode(code: string, options: ReviewOptions = {}): ReviewResult {
  const parsed = parseCode(code);
  const ctx: RuleContext = {
    code: parsed.text,
    lines: parsed.lines,
  };
  const activeRules = selectRules(options.rules ?? rules, options);
  const issues = runRules(ctx, activeRules);
  const score = calculateScore(issues);

  return {
    score,
    risk: calculateRisk(issues, score),
    issues,
    suggestions: buildSuggestions(issues, activeRules),
    warnings: collectWarnings(issues, activeRules),
  };
}
