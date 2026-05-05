import { describe, expect, it } from "vitest";
import { shallowErrorHandlingRule } from "../../rules/shallowErrorHandlingRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("shallowErrorHandlingRule", () => {
  it("detects empty catch blocks", () => {
    const result = shallowErrorHandlingRule.run(ctx("try {\n  work();\n} catch (err) {}"));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].severity).toBe("high");
  });

  it("allows meaningful catch handling", () => {
    const result = shallowErrorHandlingRule.run(ctx("try {\n  work();\n} catch (err) {\n  report(err);\n  throw err;\n}"));

    expect(result).toHaveLength(0);
  });
});
