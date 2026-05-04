import type { Issue, Rule } from "../types/index";
import { getLineContent, getLineNumberAtIndex } from "./helpers";

const MAX_PARAMS = 4;

// Matches the opening of a function parameter list (incl. multi-line signatures).
// Captures everything up to (but not including) the opening paren so we can
// then walk forward to find the balanced closing paren.
const FUNC_START_RE =
  /(?:function\s+\w*\s*|(?:(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?))\(/g;

function countParams(paramStr: string): number {
  const trimmed = paramStr.trim();
  if (trimmed === "") return 0;
  // Ignore single destructured object — `{ a, b, c }` as one param
  if (/^\{[^}]*\}$/.test(trimmed)) return 1;
  let depth = 0;
  let count = 1;
  for (const ch of trimmed) {
    if (ch === "(" || ch === "<" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === ">" || ch === "]" || ch === "}") depth--;
    else if (ch === "," && depth === 0) count++;
  }
  return count;
}

export const tooManyParamsRule: Rule = {
  id: "too-many-params",
  description: `Flags functions with more than ${MAX_PARAMS} parameters.`,
  suggestion: "Use an object parameter or split the function into smaller pieces.",
  category: "design",
  severity: "medium",
  capability: "core",
  tags: ["api-design", "maintainability"],
  run({ code, lines }): Issue[] {
    const issues: Issue[] = [];

    FUNC_START_RE.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = FUNC_START_RE.exec(code)) !== null) {
      // Walk forward from after the opening paren to find the balanced `)`
      let depth = 1;
      let i = match.index + match[0].length; // position right after `(`
      const paramStart = i;

      while (i < code.length && depth > 0) {
        if (code[i] === "(") depth++;
        else if (code[i] === ")") depth--;
        i++;
      }

      const paramStr = code.slice(paramStart, i - 1); // contents between ( and )
      const paramCount = countParams(paramStr);

      if (paramCount > MAX_PARAMS) {
        const lineNo = getLineNumberAtIndex(lines, match.index);
        issues.push({
          ruleId: "too-many-params",
          type: "smell",
          severity: "medium",
          category: "design",
          message: `Function has too many parameters (${paramCount}). Consider using an object or splitting the function.`,
          line: lineNo,
          lineContent: getLineContent(lines, lineNo - 1),
        });
      }
    }

    return issues;
  },
};
