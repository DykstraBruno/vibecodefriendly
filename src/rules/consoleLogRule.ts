import type { Issue, Rule } from "../types/index";
import { getLineContent } from "./helpers";

export const consoleLogRule: Rule = {
  id: "no-console",
  description: "Disallows console.log/error/warn/info in production code.",
  suggestion: "Remove console statements or replace with a proper logging library.",
  category: "style",
  severity: "low",
  tier: "free",
  tags: ["style", "production-readiness"],
  run({ lines }): Issue[] {
    const issues: Issue[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (/\bconsole\.(log|error|warn|info)\s*\(/.test(lines[i])) {
        issues.push({
          ruleId: "no-console",
          type: "smell",
          severity: "low",
          category: "style",
          message: "Avoid console statements in production code.",
          line: i + 1,
          lineContent: getLineContent(lines, i),
        });
      }
    }

    return issues;
  },
};
