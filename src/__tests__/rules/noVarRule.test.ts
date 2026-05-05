import { describe, expect, it } from "vitest";
import { noVarRule } from "../../rules/noVarRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("noVarRule", () => {
  it("detects var declarations", () => {
    const result = noVarRule.run(ctx("var user = 'Ada';"));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].ruleId).toBe("no-var");
  });

  it("allows let and const", () => {
    const result = noVarRule.run(ctx("const user = 'Ada';\nlet count = 1;"));

    expect(result).toHaveLength(0);
  });
});
