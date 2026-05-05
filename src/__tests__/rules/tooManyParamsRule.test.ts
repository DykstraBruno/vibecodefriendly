import { describe, expect, it } from "vitest";
import { tooManyParamsRule } from "../../rules/tooManyParamsRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("tooManyParamsRule", () => {
  it("detects functions with more than 4 params", () => {
    const result = tooManyParamsRule.run(ctx("function login(a, b, c, d, e) {\n  return a;\n}"));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].ruleId).toBe("too-many-params");
  });

  it("counts a single destructured object as one param", () => {
    const result = tooManyParamsRule.run(ctx("function login({ email, password, locale, timezone }) {\n  return email;\n}"));

    expect(result).toHaveLength(0);
  });
});
