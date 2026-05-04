export const SDK_VERSION = "v1";

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
  Issue,
  ReviewOptions,
  ReviewResult,
  Rule,
  RuleCapability,
  RuleCategory,
  RuleContext,
  RuleSelection,
  RuleSelectionCapability,
  Severity,
} from "../types/index";
