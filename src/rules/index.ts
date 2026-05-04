import type { Rule, RuleCapability, RuleCategory } from "../types/index";
import { consoleLogRule } from "./consoleLogRule";
import { noVarRule } from "./noVarRule";
import { noDebuggerRule } from "./noDebuggerRule";
import { functionTooLongRule } from "./functionTooLongRule";
import { shallowErrorHandlingRule } from "./shallowErrorHandlingRule";
import { tooManyParamsRule } from "./tooManyParamsRule";
import { overengineeringDetectionRule } from "./overengineeringDetectionRule";
import { duplicateCodeRule } from "./duplicateCodeRule";
import { defensiveOverkillRule } from "./defensiveOverkillRule";
import { unexpectedRefactorRule } from "./unexpectedRefactorRule";
import { lowCohesionRule } from "./lowCohesionRule";
import { multipleResponsibilitiesRule } from "./multipleResponsibilitiesRule";
import { fileTooLargeRule } from "./fileTooLargeRule";

export const rules: Rule[] = [
  // Original
  consoleLogRule,
  noVarRule,
  noDebuggerRule,
  // Phase 1 — essential
  functionTooLongRule,
  shallowErrorHandlingRule,
  tooManyParamsRule,
  // Phase 2 — AI differentiator
  overengineeringDetectionRule,
  duplicateCodeRule,
  defensiveOverkillRule,
  // Phase 3 — advanced
  unexpectedRefactorRule,
  lowCohesionRule,
  multipleResponsibilitiesRule,
  fileTooLargeRule,
];

export function getRulesByCategory(category: RuleCategory): Rule[] {
  return rules.filter((r) => r.category === category);
}

export function getRulesByCapability(capability: RuleCapability): Rule[] {
  return rules.filter((r) => r.capability === capability);
}
