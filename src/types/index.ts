export type RuleCategory =
  | "style"
  | "design"
  | "architecture"
  | "intent"
  | "security";

export type Severity = "low" | "medium" | "high";
export type IssueType = "bug" | "smell";
export type RuleCapability = "core" | "advanced";

export type Issue = {
  ruleId: string;
  type: IssueType;
  severity: Severity;
  category: RuleCategory;
  message: string;
  line?: number;
  lineContent?: string;
};

export type ReviewResult = {
  file?: string;
  score: number;
  risk: "low" | "medium" | "high";
  issues: Issue[];
  suggestions: string[];
  warnings: string[];
};

export type RuleSelectionCapability = RuleCapability | "all";

export type RuleSelection = {
  capability?: RuleSelectionCapability;
  includeRuleIds?: string[];
  excludeRuleIds?: string[];
};

export type ReviewOptions = RuleSelection & {
  rules?: Rule[];
};

export type RuleContext = {
  code: string;
  lines: string[];
};

export type Rule = {
  id: string;
  description: string;
  suggestion: string;
  category: RuleCategory;
  severity: Severity;
  capability: RuleCapability;
  tags: string[];
  supportsAutofix?: boolean;
  run: (ctx: RuleContext) => Issue[];
};
