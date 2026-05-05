import { describe, it, expect } from "vitest";
import { rules } from "./rules/index";

describe("smoke", () => {
  it("loads 13 rules", () => {
    expect(rules.length).toBe(13);
  });

  it("each rule has a unique id", () => {
    const ids = rules.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each rule has run() function", () => {
    for (const rule of rules) {
      expect(typeof rule.run).toBe("function");
    }
  });
});
