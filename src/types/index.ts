export type RuleCategory =
  | "style"
  | "design"
  | "architecture"
  | "intent"
  | "security";

export type Severity = "low" | "medium" | "high";
export type IssueType = "bug" | "smell";
export type FeatureTier = "free" | "pro";

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

export type RuleSelectionTier = FeatureTier | "all";

export type RuleSelection = {
  tier?: RuleSelectionTier;
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
  tier: FeatureTier;
  tags: string[];
  supportsAutofix?: boolean;
  run: (ctx: RuleContext) => Issue[];
};
