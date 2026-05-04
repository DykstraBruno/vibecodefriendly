import type { Issue, Rule } from "../types/index";
import { getLineContent } from "./helpers";

// Signals for different responsibility types
const SIGNALS: Array<{ name: string; re: RegExp }> = [
  { name: "validation",      re: /\b(?:validate|isValid|assert|check|verify|throw new Error)\b/ },
  { name: "business logic",  re: /\b(?:calculate|compute|process|transform|convert|parse)\b/ },
  { name: "I/O",             re: /\b(?:readFile|writeFile|fetch|axios|db\.|query|console\.)\b/ },
  { name: "state mutation",  re: /\b(?:setState|dispatch|set\w+|push|splice|delete )\b/ },
  { name: "rendering/HTML",  re: /\b(?:render|document\.|innerHTML|createElement)\b/ },
];

const MIN_SIGNALS = 3; // at least 3 different concern types = multiple responsibilities

const FUNCTION_OPEN_RE =
  /(?:function\s+(\w+)\s*\(|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\()/;

export const multipleResponsibilitiesRule: Rule = {
  id: "multiple-responsibilities",
  description: "Detects functions that mix validation, business logic, I/O, and state mutation.",
  suggestion: "Separate concerns: keep validation, business logic, and I/O in distinct functions.",
  category: "architecture",
  severity: "medium",
  tier: "pro",
  tags: ["architecture", "srp"],
  run({ lines }): Issue[] {
    const issues: Issue[] = [];

    let funcName = "";
    let funcStartLine = -1;
    let depth = 0;
    let funcBody = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (funcStartLine === -1 && FUNCTION_OPEN_RE.test(line)) {
        const m = FUNCTION_OPEN_RE.exec(line);
        funcName = m?.[1] ?? m?.[2] ?? "anonymous";
        const opens = (line.match(/\{/g) ?? []).length;
        const closes = (line.match(/\}/g) ?? []).length;
        if (opens > closes) {
          funcStartLine = i;
          depth = opens - closes;
          funcBody = line;
          continue;
        }
      }

      if (funcStartLine !== -1) {
        funcBody += "\n" + line;
        for (const ch of line) {
          if (ch === "{") depth++;
          else if (ch === "}") depth--;
        }

        if (depth <= 0) {
          const matched = SIGNALS.filter((s) => s.re.test(funcBody));
          if (matched.length >= MIN_SIGNALS) {
            issues.push({
              ruleId: "multiple-responsibilities",
              type: "smell",
              severity: "medium",
              category: "architecture",
              message: `"${funcName}" mixes multiple responsibilities: ${matched.map((s) => s.name).join(", ")}.`,
              line: funcStartLine + 1,
              lineContent: getLineContent(lines, funcStartLine),
            });
          }
          funcStartLine = -1;
          funcBody = "";
          depth = 0;
        }
      }
    }

    return issues;
  },
};
