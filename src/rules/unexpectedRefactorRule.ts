import type { Issue, Rule } from "../types/index";
import { getLineContent } from "./helpers";

// Heuristic: detect mass rename patterns — many single-word identifiers redefined
// (e.g. renamed variables/functions that appear as `const newName = oldName`)
const ALIAS_RE = /(?:const|let|var)\s+(\w+)\s*=\s*(\w+)\s*;/g;

// Heuristic: large number of re-exports without logic changes
const REEXPORT_RE = /export\s*\{[^}]+\}\s*from/g;

const ALIAS_THRESHOLD = 5;    // more than 5 simple aliases = likely mass rename
const REEXPORT_THRESHOLD = 4; // more than 4 barrel re-exports = likely refactor-only

export const unexpectedRefactorRule: Rule = {
  id: "unexpected-refactor",
  description: "Detects large structural changes (mass renames, barrel re-exports) without clear functional impact.",
  suggestion: "Avoid refactoring unless explicitly required. Keep structural changes separate from functional ones.",
  category: "intent",
  severity: "medium",
  tier: "pro",
  tags: ["refactor-detection", "ai-generated-code"],
  run({ code, lines }): Issue[] {
    // Allow-list: file opts out via comment annotation
    if (/\/\/\s*vcf:\s*allow-refactor/.test(code) || /@vcf-ignore-refactor/.test(code)) {
      return [];
    }

    const issues: Issue[] = [];

    // Count simple alias assignments (const a = b;)
    let aliasCount = 0;
    ALIAS_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = ALIAS_RE.exec(code)) !== null) {
      // Only count if both sides are single identifiers (not method calls, etc.)
      if (/^\w+$/.test(match[1]) && /^\w+$/.test(match[2])) {
        aliasCount++;
      }
    }
    if (aliasCount > ALIAS_THRESHOLD) {
      issues.push({
        ruleId: "unexpected-refactor",
        type: "smell",
        severity: "medium",
        category: "intent",
        message: `Large structural change detected: ${aliasCount} identifier aliases found. This may indicate an unsolicited rename/refactor.`,
        line: 1,
        lineContent: getLineContent(lines, 0),
      });
    }

    // Count barrel re-exports
    const reexportMatches = code.match(REEXPORT_RE) ?? [];
    if (reexportMatches.length > REEXPORT_THRESHOLD) {
      issues.push({
        ruleId: "unexpected-refactor",
        type: "smell",
        severity: "low",
        category: "intent",
        message: `${reexportMatches.length} barrel re-exports detected. This may indicate a structural refactor was not requested.`,
        line: 1,
        lineContent: getLineContent(lines, 0),
      });
    }

    return issues;
  },
};

