import { describe, expect, it } from "vitest";
import { fileTooLargeRule } from "../../rules/fileTooLargeRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("fileTooLargeRule", () => {
  it("detects files longer than 300 lines", () => {
    const code = Array.from({ length: 301 }, (_, i) => `const line${i} = ${i};`).join("\n");
    const result = fileTooLargeRule.run(ctx(code));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].ruleId).toBe("file-too-large");
  });

  it("allows files at the boundary", () => {
    const code = Array.from({ length: 300 }, (_, i) => `const line${i} = ${i};`).join("\n");
    const result = fileTooLargeRule.run(ctx(code));

    expect(result).toHaveLength(0);
  });
});
