import { rules as defaultRules } from "../rules/index";
import type {
  Rule,
  RuleSelection,
  RuleSelectionCapability,
} from "../types/index";

const CAPABILITY_RANK: Record<Exclude<RuleSelectionCapability, "all">, number> = {
  core: 0,
  advanced: 1,
};

function canUseRule(rule: Rule, capability: RuleSelectionCapability): boolean {
  if (capability === "all") return true;
  return CAPABILITY_RANK[rule.capability] <= CAPABILITY_RANK[capability];
}

export function createRuleMap(availableRules: Rule[]): ReadonlyMap<string, Rule> {
  return new Map(availableRules.map((rule) => [rule.id, rule]));
}

export function selectRules(
  availableRules: Rule[] = defaultRules,
  selection: RuleSelection = {}
): Rule[] {
  const capability = selection.capability ?? "all";
  const includeRuleIds = selection.includeRuleIds
    ? new Set(selection.includeRuleIds)
    : null;
  const excludeRuleIds = new Set(selection.excludeRuleIds ?? []);

  return availableRules.filter((rule) => {
    if (!canUseRule(rule, capability)) return false;
    if (includeRuleIds && !includeRuleIds.has(rule.id)) return false;
    return !excludeRuleIds.has(rule.id);
  });
}

export function isKnownRule(
  ruleId: string,
  availableRules: Rule[] = defaultRules
): boolean {
  return createRuleMap(availableRules).has(ruleId);
}
