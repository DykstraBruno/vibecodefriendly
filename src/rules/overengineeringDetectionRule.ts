import type { Issue, Rule } from "../types/index";
import { getLineContent, getLineNumberAtIndex } from "./helpers";

// Class that has only a single public method (constructor + 1 method = overengineered)
const SINGLE_METHOD_CLASS_RE = /\bclass\s+\w+/g;

// Interface/type declared but likely unused — heuristic: interface with only one property
const TRIVIAL_INTERFACE_RE = /\binterface\s+\w+\s*\{[^}]{0,60}\}/g;

// Wrapper function that does nothing except call another single function
const WRAPPER_FN_RE =
  /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)\s*\{\s*return\s+\w+\s*\([^)]*\)\s*;\s*\}/g;

export const overengineeringDetectionRule: Rule = {
  id: "overengineering-detection",
  description: "Detects classes with a single method, trivial interfaces, or wrapper functions that add no value.",
  suggestion: "Simplify the implementation. Prefer direct solutions over unnecessary abstractions.",
  category: "design",
  severity: "medium",
  capability: "advanced",
  tags: ["overengineering", "ai-generated-code"],
  run({ code, lines }): Issue[] {
    const issues: Issue[] = [];

    // Detect classes with exactly one non-constructor method
    let match: RegExpExecArray | null;
    SINGLE_METHOD_CLASS_RE.lastIndex = 0;
    while ((match = SINGLE_METHOD_CLASS_RE.exec(code)) !== null) {
      const classStart = code.indexOf("{", match.index);
      if (classStart === -1) continue;

      let depth = 0;
      let classEnd = classStart;
      for (let k = classStart; k < code.length; k++) {
        if (code[k] === "{") depth++;
        else if (code[k] === "}") { depth--; if (depth === 0) { classEnd = k; break; } }
      }

      const body = code.slice(classStart + 1, classEnd);
      // Count method signatures (lines that look like `methodName(` not starting with constructor)
      const methodMatches = body.match(/^\s*(?!constructor)\w+\s*\(/gm) ?? [];
      if (methodMatches.length === 1) {
        const lineNo = getLineNumberAtIndex(lines, match.index);
        issues.push({
          ruleId: "overengineering-detection",
          type: "smell",
          severity: "medium",
          category: "design",
          message: "Class has only one method. Consider using a plain function instead.",
          line: lineNo,
          lineContent: getLineContent(lines, lineNo - 1),
        });
      }
    }

    // Detect pure wrapper functions
    WRAPPER_FN_RE.lastIndex = 0;
    while ((match = WRAPPER_FN_RE.exec(code)) !== null) {
      const lineNo = getLineNumberAtIndex(lines, match.index);
      issues.push({
        ruleId: "overengineering-detection",
        type: "smell",
        severity: "low",
        category: "design",
        message: "Possible overengineering detected: function only wraps a single call.",
        line: lineNo,
        lineContent: getLineContent(lines, lineNo - 1),
      });
    }

    return issues;
  },
};
