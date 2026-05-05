import { describe, expect, it } from "vitest";
import { consoleLogRule } from "../../rules/consoleLogRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("consoleLogRule", () => {
  it("detects console calls", () => {
    const result = consoleLogRule.run(ctx("console.log('x');"));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].ruleId).toBe("no-console");
  });

  it("allows code without console calls", () => {
    const result = consoleLogRule.run(ctx("logger.info('x');"));

    expect(result).toHaveLength(0);
  });
});
