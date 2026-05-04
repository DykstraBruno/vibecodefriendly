import type { Issue, Rule } from "../types/index";
import { getLineContent } from "./helpers";

export const noDebuggerRule: Rule = {
  id: "no-debugger",
  description: "Disallows debugger statements left in production code.",
  suggestion: "Remove all debugger statements before shipping to production.",
  category: "security",
  severity: "high",
  tier: "free",
  tags: ["security", "production-readiness"],
  run({ lines }): Issue[] {
    const issues: Issue[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (/\bdebugger\b/.test(lines[i])) {
        issues.push({
          ruleId: "no-debugger",
          type: "bug",
          severity: "high",
          category: "security",
          message: "debugger statement found — remove before shipping.",
          line: i + 1,
          lineContent: getLineContent(lines, i),
        });
      }
    }

    return issues;
  },
};
