import type { Issue, Rule } from "../types/index";
import { getLineContent } from "./helpers";

export const noVarRule: Rule = {
  id: "no-var",
  description: "Disallows var declarations in favour of let/const.",
  suggestion: "Replace var with const (preferred) or let to use block-scoped declarations.",
  category: "style",
  severity: "medium",
  tier: "free",
  tags: ["style", "modern-javascript"],
  run({ lines }): Issue[] {
    const issues: Issue[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (/\bvar\s+/.test(lines[i])) {
        issues.push({
          ruleId: "no-var",
          type: "smell",
          severity: "medium",
          category: "style",
          message: "Avoid var — use const or let instead.",
          line: i + 1,
          lineContent: getLineContent(lines, i),
        });
      }
    }

    return issues;
  },
};
