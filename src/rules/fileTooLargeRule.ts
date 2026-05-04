import type { Issue, Rule } from "../types/index";

const MAX_LINES = 300;

export const fileTooLargeRule: Rule = {
  id: "file-too-large",
  description: `Flags files with more than ${MAX_LINES} lines, which are hard to review and maintain.`,
  suggestion: "Break this file into smaller modules and submit smaller, focused PRs.",
  category: "architecture",
  severity: "medium",
  capability: "advanced",
  tags: ["architecture", "maintainability"],
  run({ lines }): Issue[] {
    const lineCount = lines.length;
    if (lineCount > MAX_LINES) {
      return [
        {
          ruleId: "file-too-large",
          type: "smell",
          severity: "medium",
          category: "architecture",
          message: `File is too large (${lineCount} lines). Consider splitting into smaller modules to improve maintainability and reviewability.`,
          line: 1,
        },
      ];
    }
    return [];
  },
};
