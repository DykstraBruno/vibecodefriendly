import type { Issue, Rule } from "../types/index";
import { getLineContent } from "./helpers";

// Matches chains like: a && a.b && a.b.c (3+ optional-chain guards on one line)
const DEEP_CHAIN_RE = /(\w[\w.]*\s*&&\s*){2,}\w[\w.]*/g;

// Matches optional chaining that is 3+ levels deep: a?.b?.c?.d
const DEEP_OPTIONAL_RE = /\w+(?:\?\.[\w]+){3,}/g;

const THRESHOLD = 3; // how many occurrences in the file before we flag

export const defensiveOverkillRule: Rule = {
  id: "defensive-overkill",
  description: "Detects excessive defensive checks that indicate missing input validation.",
  suggestion: "Simplify defensive logic or validate input at the boundary (function entry) instead.",
  category: "design",
  severity: "low",
  capability: "advanced",
  tags: ["overengineering", "validation"],
  run({ lines }): Issue[] {
    const issues: Issue[] = [];

    let deepChainCount = 0;
    let deepOptionalCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      DEEP_CHAIN_RE.lastIndex = 0;
      if (DEEP_CHAIN_RE.test(line)) {
        deepChainCount++;
        if (deepChainCount === THRESHOLD) {
          issues.push({
            ruleId: "defensive-overkill",
            type: "smell",
            severity: "low",
            category: "design",
            message: `Excessive defensive checks detected (${THRESHOLD}+ occurrences of deep && chains). Validate inputs earlier.`,
            line: i + 1,
            lineContent: getLineContent(lines, i),
          });
        }
      }

      DEEP_OPTIONAL_RE.lastIndex = 0;
      if (DEEP_OPTIONAL_RE.test(line)) {
        deepOptionalCount++;
        if (deepOptionalCount === THRESHOLD) {
          issues.push({
            ruleId: "defensive-overkill",
            type: "smell",
            severity: "low",
            category: "design",
            message: `Excessive optional chaining detected (${THRESHOLD}+ occurrences of deep ?. chains). Validate inputs earlier.`,
            line: i + 1,
            lineContent: getLineContent(lines, i),
          });
        }
      }
    }

    return issues;
  },
};
