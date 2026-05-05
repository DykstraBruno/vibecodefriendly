import { describe, expect, it } from "vitest";
import { duplicateCodeRule } from "../../rules/duplicateCodeRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("duplicateCodeRule", () => {
  it("detects duplicated blocks of 5+ lines", () => {
    const block = ["const a = 1;", "const b = 2;", "const c = 3;", "const d = 4;", "return a + b + c + d;"].join("\n");
    const result = duplicateCodeRule.run(ctx(`${block}\n\n${block}`));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].ruleId).toBe("duplicate-code");
  });

  it("allows distinct short code", () => {
    const result = duplicateCodeRule.run(ctx("const a = 1;\nconst b = 2;\nreturn a + b;"));

    expect(result).toHaveLength(0);
  });
});
