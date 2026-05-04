import type { Issue, Rule } from "../types/index";
import { getLineContent } from "./helpers";

const FUNCTION_OPEN_RE =
  /(?:function\s+\w+\s*\(|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(.*?\)\s*=>|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?function)/;

const MAX_LINES = 80;

export const functionTooLongRule: Rule = {
  id: "function-too-long",
  description: `Flags functions longer than ${MAX_LINES} lines — a common AI-generated pattern.`,
  suggestion: "Split this function into smaller, reusable pieces.",
  category: "design",
  severity: "medium",
  capability: "core",
  tags: ["complexity", "maintainability"],
  run({ lines }): Issue[] {
    const issues: Issue[] = [];

    let depth = 0;
    let funcStart = -1;
    let funcStartLine = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect function open (only track the outermost function boundary)
      if (funcStart === -1 && FUNCTION_OPEN_RE.test(line)) {
        const openBraceOnSameLine = (line.match(/\{/g) ?? []).length;
        const closeBraceOnSameLine = (line.match(/\}/g) ?? []).length;
        if (openBraceOnSameLine > closeBraceOnSameLine) {
          funcStart = i;
          funcStartLine = i + 1;
          depth = openBraceOnSameLine - closeBraceOnSameLine;
          continue;
        }
      }

      if (funcStart !== -1) {
        for (const ch of line) {
          if (ch === "{") depth++;
          else if (ch === "}") depth--;
        }

        if (depth <= 0) {
          const length = i - funcStart + 1;
          if (length > MAX_LINES) {
            issues.push({
              ruleId: "function-too-long",
              type: "smell",
              severity: "medium",
              category: "design",
              message: `Function is too long (${length} lines). This is a common AI-generated pattern and reduces readability.`,
              line: funcStartLine,
              lineContent: getLineContent(lines, funcStart),
            });
          }
          funcStart = -1;
          funcStartLine = -1;
          depth = 0;
        }
      }
    }

    return issues;
  },
};
