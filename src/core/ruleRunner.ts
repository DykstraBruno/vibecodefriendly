import { rules } from "../rules/index";
import type { Issue, Rule, RuleContext } from "../types/index";

export function runRules(ctx: RuleContext, availableRules: Rule[] = rules): Issue[] {
  return availableRules.flatMap((rule) => rule.run(ctx));
}
