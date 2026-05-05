import { describe, expect, it } from "vitest";
import { overengineeringDetectionRule } from "../../rules/overengineeringDetectionRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("overengineeringDetectionRule", () => {
  it("detects a class with exactly one non-constructor method", () => {
    const code = "class UserFormatter {\n  constructor() {}\n  format(user) {\n    return user.name;\n  }\n}";
    const result = overengineeringDetectionRule.run(ctx(code));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].ruleId).toBe("overengineering-detection");
  });

  it("allows a class with multiple methods", () => {
    const code = "class UserFormatter {\n  format(user) { return user.name; }\n  parse(user) { return user.id; }\n}";
    const result = overengineeringDetectionRule.run(ctx(code));

    expect(result).toHaveLength(0);
  });
});
