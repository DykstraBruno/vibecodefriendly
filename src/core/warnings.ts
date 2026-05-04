import type { Issue, Rule } from "../types/index";
import { rules } from "../rules/index";
import { createRuleMap } from "./ruleRegistry";

export function collectWarnings(
  issues: Issue[],
  availableRules: Rule[] = rules
): string[] {
  const warnings = new Set<string>();
  const ruleMap = createRuleMap(availableRules);

  for (const issue of issues) {
    if (!ruleMap.has(issue.ruleId)) {
      warnings.add(`Unknown ruleId: "${issue.ruleId}"`);
    }
  }

  return Array.from(warnings);
}
