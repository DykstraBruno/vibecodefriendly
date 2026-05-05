import { describe, expect, it } from "vitest";
import { multipleResponsibilitiesRule } from "../../rules/multipleResponsibilitiesRule";

function ctx(code: string) {
  return { code, lines: code.split("\n"), rawCode: code, rawLines: code.split("\n") };
}

describe("multipleResponsibilitiesRule", () => {
  it("detects functions with 3+ signal types", () => {
    const code = "function submitOrder(order) {\n  validate(order);\n  const total = calculate(order);\n  fetch('/api/orders');\n  setOrder(total);\n}";
    const result = multipleResponsibilitiesRule.run(ctx(code));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].ruleId).toBe("multiple-responsibilities");
  });

  it("allows focused functions", () => {
    const code = "function validateOrder(order) {\n  validate(order);\n  assert(order.items.length > 0);\n}";
    const result = multipleResponsibilitiesRule.run(ctx(code));

    expect(result).toHaveLength(0);
  });
});
