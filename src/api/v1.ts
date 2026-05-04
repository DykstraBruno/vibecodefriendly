export const API_VERSION = "v1";

export {
  reviewCode,
  runRules,
  calculateScore,
  calculateRisk,
  buildSuggestions,
  collectWarnings,
} from "../core/review";

export {
  createRuleMap,
  isKnownRule,
  selectRules,
} from "../core/ruleRegistry";

export { rules } from "../rules/index";

export type {
  FeatureTier,
  Issue,
  ReviewOptions,
  ReviewResult,
  Rule,
  RuleCategory,
  RuleContext,
  RuleSelection,
  RuleSelectionTier,
  Severity,
} from "../types/index";
