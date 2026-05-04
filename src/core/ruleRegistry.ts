import { rules as defaultRules } from "../rules/index";
import type { Rule, RuleSelection, RuleSelectionTier } from "../types/index";

const TIER_RANK: Record<Exclude<RuleSelectionTier, "all">, number> = {
  free: 0,
  pro: 1,
};

function canUseRule(rule: Rule, tier: RuleSelectionTier): boolean {
  if (tier === "all") return true;
  return TIER_RANK[rule.tier] <= TIER_RANK[tier];
}

export function createRuleMap(availableRules: Rule[]): ReadonlyMap<string, Rule> {
  return new Map(availableRules.map((rule) => [rule.id, rule]));
}

export function selectRules(
  availableRules: Rule[] = defaultRules,
  selection: RuleSelection = {}
): Rule[] {
  const tier = selection.tier ?? "all";
  const includeRuleIds = selection.includeRuleIds
    ? new Set(selection.includeRuleIds)
    : null;
  const excludeRuleIds = new Set(selection.excludeRuleIds ?? []);

  return availableRules.filter((rule) => {
    if (!canUseRule(rule, tier)) return false;
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
