import { describe, expect, it } from "vitest";
import { defensiveOverkillRule } from "../../rules/defensiveOverkillRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("defensiveOverkillRule", () => {
  it("detects 3+ deep optional chains", () => {
    const code = "a?.b?.c?.d;\nx?.y?.z?.w;\none?.two?.three?.four;";
    const result = defensiveOverkillRule.run(ctx(code));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].ruleId).toBe("defensive-overkill");
  });

  it("allows occasional optional chaining", () => {
    const result = defensiveOverkillRule.run(ctx("const name = user?.profile?.name;"));

    expect(result).toHaveLength(0);
  });
});
