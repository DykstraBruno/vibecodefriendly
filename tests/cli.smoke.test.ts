import { spawnSync } from "child_process";
import { beforeAll, describe, expect, it } from "vitest";

function runCli(args: string[], input?: string) {
  return spawnSync(process.execPath, ["bin/vcf.js", ...args], {
    cwd: process.cwd(),
    encoding: "utf-8",
    input,
  });
}

describe("CLI smoke tests", () => {
  beforeAll(() => {
    const build = spawnSync("npm", ["run", "build"], {
      cwd: process.cwd(),
      encoding: "utf-8",
      shell: true,
    });
    expect(build.status, build.stderr || build.stdout).toBe(0);
  });

  it("reviews a file and exits 1 for high risk", () => {
    const result = runCli(["review", "tests/fixtures/mixed.ts"]);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Score:");
    expect(result.stdout).toContain("HIGH");
  });

  it("reviews inline input and outputs a score", () => {
    const result = runCli(["review", "--input", "console.log('x');"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Score:");
  });

  it("outputs parseable JSON with integration keys", () => {
    const result = runCli(["review", "tests/fixtures/mixed.ts", "--format", "json"]);

    expect(result.status).toBe(1);
    const output = JSON.parse(result.stdout) as Record<string, unknown>;
    expect(output).toEqual(
      expect.objectContaining({
        score: expect.any(Number),
        risk: "high",
        issues: expect.any(Array),
        suggestions: expect.any(Array),
        warnings: expect.any(Array),
        summary: expect.any(String),
        counts: expect.any(Object),
      }),
    );
  });

  it("suppresses stdout in quiet mode", () => {
    const result = runCli(["review", "tests/fixtures/mixed.ts", "--quiet"]);

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
  });

  it("exits 1 in CI mode for high risk", () => {
    const result = runCli(["review", "tests/fixtures/mixed.ts", "--ci"]);

    expect(result.status).toBe(1);
  });

  it("reports missing files", () => {
    const result = runCli(["review", "nonexistent.ts"]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Failed to read file");
  });

  it("reviews stdin", () => {
    const result = runCli(["review"], "var x = 1;");

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Avoid var");
  });
});
