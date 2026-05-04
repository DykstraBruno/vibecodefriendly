import type { Issue, Rule } from "../types/index";
import { getLineContent } from "./helpers";

const MIN_BLOCK_LINES = 5;   // minimum lines for a block to be considered significant
const SIMILARITY_THRESHOLD = 0.85; // Jaccard similarity threshold

/**
 * Normalises a line for comparison: strip leading/trailing whitespace,
 * collapse internal whitespace, remove variable names (alphanumeric tokens).
 */
function normaliseLine(line: string): string {
  return line.trim().replace(/\s+/g, " ");
}

/**
 * Extracts consecutive non-blank, non-brace-only lines as "blocks".
 */
function extractBlocks(lines: string[]): Array<{ start: number; text: string[] }> {
  const blocks: Array<{ start: number; text: string[] }> = [];
  let current: { start: number; text: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === "" || trimmed === "{" || trimmed === "}") {
      if (current && current.text.length >= MIN_BLOCK_LINES) {
        blocks.push(current);
      }
      current = null;
    } else {
      if (!current) current = { start: i, text: [] };
      current.text.push(normaliseLine(trimmed));
    }
  }
  if (current && current.text.length >= MIN_BLOCK_LINES) blocks.push(current);
  return blocks;
}

/** Jaccard similarity between two string arrays */
function similarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const item of setA) { if (setB.has(item)) intersection++; }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export const duplicateCodeRule: Rule = {
  id: "duplicate-code",
  description: "Detects repeated code blocks that should be extracted into reusable functions.",
  suggestion: "Extract reusable functions to eliminate code duplication.",
  category: "design",
  severity: "medium",
  capability: "advanced",
  tags: ["duplication", "maintainability"],
  run({ lines }): Issue[] {
    const issues: Issue[] = [];
    const blocks = extractBlocks(lines);
    const reported = new Set<number>();

    for (let i = 0; i < blocks.length; i++) {
      if (reported.has(i)) continue;
      for (let j = i + 1; j < blocks.length; j++) {
        if (reported.has(j)) continue;
        if (similarity(blocks[i].text, blocks[j].text) >= SIMILARITY_THRESHOLD) {
          reported.add(i);
          reported.add(j);
          issues.push({
            ruleId: "duplicate-code",
            type: "smell",
            severity: "medium",
            category: "design",
            message: `Duplicate code detected (lines ${blocks[i].start + 1} and ${blocks[j].start + 1} are highly similar).`,
            line: blocks[i].start + 1,
            lineContent: getLineContent(lines, blocks[i].start),
          });
          break; // only report the first block once
        }
      }
    }

    return issues;
  },
};
