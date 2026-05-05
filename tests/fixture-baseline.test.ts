import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { reviewCode } from "../src/sdk/v1";
import type { Issue, RuleCategory, Severity } from "../src/types";

function countBy<T extends string>(issues: Issue[], key: "severity" | "category", values: T[]): Record<T, number> {
  const counts = Object.fromEntries(values.map((value) => [value, 0])) as Record<T, number>;
  for (const issue of issues) {
    counts[issue[key] as T]++;
  }
  return counts;
}

describe("fixture baseline", () => {
  it("mixed.ts matches the README example profile", () => {
    const code = fs.readFileSync(path.join(__dirname, "fixtures/mixed.ts"), "utf-8");
    const expected = JSON.parse(
      fs.readFileSync(path.join(__dirname, "fixtures/mixed.expected.json"), "utf-8"),
    ) as { score: number; risk: string; issues: Issue[] };
    const result = reviewCode(code);

    const severity = countBy<Severity>(result.issues, "severity", ["high", "medium", "low"]);
    const category = countBy<RuleCategory>(result.issues, "category", ["style", "design", "architecture", "intent", "security"]);

    expect(result.score).toBeCloseTo(expected.score, 1);
    expect(result.risk).toBe(expected.risk);
    expect(result.issues).toHaveLength(expected.issues.length);
    expect(severity).toEqual({ high: 2, medium: 3, low: 1 });
    expect(category).toMatchObject({ design: 2, architecture: 1, security: 1, style: 2 });
    expect(result.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("debugger statement found"),
        expect.stringContaining("Empty catch block"),
        expect.stringContaining("Low cohesion"),
        expect.stringContaining("Avoid var"),
        expect.stringContaining("too many parameters"),
        expect.stringContaining("Avoid console statements"),
      ]),
    );
  });
});
