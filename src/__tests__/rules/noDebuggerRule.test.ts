import { describe, expect, it } from "vitest";
import { noDebuggerRule } from "../../rules/noDebuggerRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("noDebuggerRule", () => {
  it("detects debugger statements", () => {
    const result = noDebuggerRule.run(ctx("debugger;"));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].severity).toBe("high");
  });

  it("allows code without debugger", () => {
    const result = noDebuggerRule.run(ctx("const x = 1;"));

    expect(result).toHaveLength(0);
  });
});
