import type { Issue, Rule } from "../types/index";
import { rules } from "../rules/index";
import { createRuleMap } from "./ruleRegistry";

export function buildSuggestions(
  issues: Issue[],
  availableRules: Rule[] = rules
): string[] {
  const suggestions = new Set<string>();
  const ruleMap = createRuleMap(availableRules);

  for (const issue of issues) {
    const rule = ruleMap.get(issue.ruleId);
    if (rule?.suggestion) {
      suggestions.add(rule.suggestion);
    }
  }

  return Array.from(suggestions);
}
