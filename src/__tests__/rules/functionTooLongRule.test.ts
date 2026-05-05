import { describe, expect, it } from "vitest";
import { functionTooLongRule } from "../../rules/functionTooLongRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("functionTooLongRule", () => {
  it("detects functions longer than 80 lines", () => {
    const body = Array.from({ length: 81 }, (_, i) => `  const v${i} = ${i};`).join("\n");
    const result = functionTooLongRule.run(ctx(`function longWork() {\n${body}\n}`));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].ruleId).toBe("function-too-long");
  });

  it("allows short functions", () => {
    const result = functionTooLongRule.run(ctx("function shortWork() {\n  return 1;\n}"));

    expect(result).toHaveLength(0);
  });
});
