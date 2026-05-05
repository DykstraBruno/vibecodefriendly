import { describe, expect, it } from "vitest";
import { lowCohesionRule } from "../../rules/lowCohesionRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("lowCohesionRule", () => {
  it("detects functions that mix 3+ domains", () => {
    const code = "function handleLogin(user) {\n  fetch('/api/login');\n  db.save(user);\n  console.log(user);\n}";
    const result = lowCohesionRule.run(ctx(code));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].ruleId).toBe("low-cohesion");
  });

  it("allows focused functions", () => {
    const code = "function saveUser(user) {\n  db.save(user);\n  db.query('select 1');\n}";
    const result = lowCohesionRule.run(ctx(code));

    expect(result).toHaveLength(0);
  });
});
