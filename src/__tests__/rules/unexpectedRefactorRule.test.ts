import { describe, expect, it } from "vitest";
import { unexpectedRefactorRule } from "../../rules/unexpectedRefactorRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("unexpectedRefactorRule", () => {
  it("flags 6 simple aliases", () => {
    const code = "const a = b;\nconst c = d;\nconst e = f;\nconst g = h;\nconst i = j;\nconst k = l;";
    const result = unexpectedRefactorRule.run(ctx(code));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].severity).toBe("medium");
    expect(result[0].message).toContain("identifier aliases");
  });

  it("allows 5 simple aliases at the boundary", () => {
    const code = "const a = b;\nconst c = d;\nconst e = f;\nconst g = h;\nconst i = j;";
    const result = unexpectedRefactorRule.run(ctx(code));

    expect(result).toHaveLength(0);
  });

  it("flags 5 barrel re-exports", () => {
    const code = "export { a } from './a';\nexport { b } from './b';\nexport { c } from './c';\nexport { d } from './d';\nexport { e } from './e';";
    const result = unexpectedRefactorRule.run(ctx(code));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].severity).toBe("low");
    expect(result[0].message).toContain("barrel re-exports");
  });

  it("allows 4 re-exports at the boundary", () => {
    const code = "export { a } from './a';\nexport { b } from './b';\nexport { c } from './c';\nexport { d } from './d';";
    const result = unexpectedRefactorRule.run(ctx(code));

    expect(result).toHaveLength(0);
  });

  it("allows aliases with the refactor opt-out comment", () => {
    const code = "// vcf: allow-refactor\nconst a = b;\nconst c = d;\nconst e = f;\nconst g = h;\nconst i = j;\nconst k = l;";
    const result = unexpectedRefactorRule.run(ctx(code));

    expect(result).toHaveLength(0);
  });
});
