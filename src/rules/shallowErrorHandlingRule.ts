import type { Issue, Rule } from "../types/index";
import { getLineContent } from "./helpers";

// Matches `catch` blocks that only contain a console call (log/warn/error/info)
// and nothing else meaningful — the classic "swallow and log" anti-pattern.
const CATCH_OPEN_RE = /\bcatch\s*\(/;
const CONSOLE_ONLY_RE = /^\s*console\.(log|warn|error|info)\s*\(/;
const EMPTY_CATCH_RE = /\bcatch\s*\([^)]*\)\s*\{\s*\}/;

export const shallowErrorHandlingRule: Rule = {
  id: "shallow-error-handling",
  description: "Detects catch blocks that only log the error without handling or rethrowing it.",
  suggestion: "Handle errors meaningfully or rethrow them.",
  category: "design",
  severity: "high",
  tier: "free",
  tags: ["error-handling", "reliability"],
  run({ lines }): Issue[] {
    const issues: Issue[] = [];

    // Flag fully-empty catch blocks: catch (e) {}
    for (let i = 0; i < lines.length; i++) {
      if (EMPTY_CATCH_RE.test(lines[i])) {
        issues.push({
          ruleId: "shallow-error-handling",
          type: "bug",
          severity: "high",
          category: "design",
          message: "Empty catch block silently swallows errors.",
          line: i + 1,
          lineContent: lines[i].trim(),
        });
      }
    }

    // Flag catch blocks whose entire body is a single console call
    for (let i = 0; i < lines.length; i++) {
      if (!CATCH_OPEN_RE.test(lines[i])) continue;

      // Find the opening brace (may be on the same line or the next)
      let braceIdx = i;
      while (braceIdx < lines.length && !lines[braceIdx].includes("{")) braceIdx++;
      if (braceIdx >= lines.length) continue;

      // Collect lines inside the catch body
      let depth = 0;
      const bodyLines: { lineNo: number; content: string }[] = [];

      for (let j = braceIdx; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === "{") depth++;
          else if (ch === "}") depth--;
        }
        if (j > braceIdx) bodyLines.push({ lineNo: j + 1, content: lines[j] });
        if (depth <= 0) break;
      }

      const meaningful = bodyLines.filter((l) => l.content.trim() !== "");
      if (
        meaningful.length === 1 &&
        CONSOLE_ONLY_RE.test(meaningful[0].content)
      ) {
        issues.push({
          ruleId: "shallow-error-handling",
          type: "bug",
          severity: "high",
          category: "design",
          message: "Error handling is superficial and may hide failures.",
          line: i + 1,
          lineContent: getLineContent(lines, i),
        });
      }
    }

    return issues;
  },
};
