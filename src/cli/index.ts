import { Command, InvalidArgumentError } from "commander";
import fs from "fs";
import path from "path";
import { reviewCode } from "../core/review";
import type { ReviewResult, Severity, RuleCategory } from "../types/index";

// -----------------------------------------------------------------
// CLI-layer types
// -----------------------------------------------------------------

type Format = "json" | "text";

type ReviewCommandOpts = {
  input?: string;
  file?: string;
  format: Format;
  verbose: boolean;
  score?: boolean; // --no-score sets this to false
  ci: boolean;
  quiet: boolean;
};

type RenderOptions = {
  format: Format;
  verbose: boolean;
  showScore: boolean;
  quiet: boolean;
};

type CLIOutput = ReviewResult & {
  summary: string;
  counts: { high: number; medium: number; low: number };
};

// -----------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => { data += chunk; });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function buildSummary(risk: "low" | "medium" | "high", counts: { high: number; medium: number; low: number }): string {
  if (risk === "high") {
    if (counts.high > 0) {
      return counts.high > 1
        ? `\u274c High risk: ${counts.high} critical issues detected. Not safe for production.`
        : "\u274c High risk: 1 critical issue detected. Not safe for production.";
    }
    return counts.medium >= 3
      ? `\u274c High risk: ${counts.medium} medium issues detected (volume escalation). Review required.`
      : "\u274c High risk: score too low. Significant issues require attention.";
  }
  if (risk === "medium") {
    return counts.medium > 1
      ? `\u26a0\ufe0f Medium risk: ${counts.medium} issues detected. Review recommended before production use.`
      : "\u26a0\ufe0f Medium risk: issues detected. Review recommended before production use.";
  }
  return "\u2139\ufe0f Low risk: minor issues detected. Consider improvements before shipping.";
}

function getSummary(result: ReviewResult, counts: Record<Severity, number>): string {
  if (result.issues.length === 0) {
    return "\u2705 No issues found. Code looks clean.";
  }
  return buildSummary(result.risk, counts);
}

function parseFormat(value: string): Format {
  if (value !== "json" && value !== "text") {
    throw new InvalidArgumentError('--format must be "json" or "text".');
  }
  return value;
}

const SEVERITY_ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

function countSeverities(issues: ReviewResult["issues"]): Record<Severity, number> {
  const SEVERITIES: Severity[] = ["high", "medium", "low"];
  const counts: Record<Severity, number> = { high: 0, medium: 0, low: 0 };
  for (const issue of issues) {
    if ((SEVERITIES as string[]).includes(issue.severity)) {
      counts[issue.severity as Severity]++;
    }
  }
  return counts;
}

function renderResult(result: ReviewResult, options: RenderOptions): void {
  if (options.quiet) return;

  const counts = countSeverities(result.issues);
  const summary = getSummary(result, counts);

  if (options.format === "json") {
    const output: CLIOutput = { ...result, summary, counts };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  const riskEmoji = result.risk === "high" ? "\u274c" : result.risk === "medium" ? "\u26a0\ufe0f" : "\u2705";
  if (options.showScore) {
    console.log(`Score: ${result.score}/10`);
  }
  console.log(`Risk: ${result.risk.toUpperCase()} ${riskEmoji}`);
  console.log(summary);
  console.log("");

  if (result.issues.length > 0) {
    console.log(`Issues: ${counts.high} high, ${counts.medium} medium, ${counts.low} low\n`);

    const sorted = [...result.issues].sort((a, b) => {
      const sevA = SEVERITY_ORDER[a.severity] ?? Number.MAX_SAFE_INTEGER;
      const sevB = SEVERITY_ORDER[b.severity] ?? Number.MAX_SAFE_INTEGER;
      const sevDiff = sevA - sevB;
      if (sevDiff !== 0) return sevDiff;
      return (a.line ?? Infinity) - (b.line ?? Infinity);
    });

    for (const issue of sorted) {
      const loc = issue.line != null ? ` (line ${issue.line})` : "";
      const severity = issue.severity.toUpperCase();
      console.log(`[${severity}] [${issue.type}]${loc} ${issue.message}`);
      const content = issue.lineContent?.trim();
      if (content) {
        const preview = content.length > 120 ? content.slice(0, 117) + "..." : content;
        console.log(`  > ${preview}`);
      }
    }

    // Grouped view by category
    const CATEGORY_ORDER: RuleCategory[] = ["security", "architecture", "design", "intent", "style"];
    const grouped = sorted.reduce<Partial<Record<RuleCategory, typeof sorted>>>((acc, issue) => {
      (acc[issue.category] ??= []).push(issue);
      return acc;
    }, {});
    const hasMultipleCategories = Object.keys(grouped).length > 1;
    if (hasMultipleCategories) {
      console.log("\nBy category:");
      for (const cat of CATEGORY_ORDER) {
        const catIssues = grouped[cat];
        if (!catIssues?.length) continue;
        console.log(`  ${cat.toUpperCase()} (${catIssues.length})`);
        for (const issue of catIssues) {
          console.log(`    [${issue.severity}] ${issue.message}`);
        }
      }
    }
  }

  if (result.warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of result.warnings) {
      console.log(`! ${warning}`);
    }
  }

  if (result.suggestions.length > 0) {
    console.log("\nSuggestions:");
    for (const suggestion of result.suggestions) {
      console.log(`- ${suggestion}`);
    }
  }

  if (options.verbose) {
    console.log("\nFull result:");
    console.log(JSON.stringify(result, null, 2));
  }
}

// -----------------------------------------------------------------
// Program
// -----------------------------------------------------------------

const program = new Command();

program
  .name("vcf")
  .description("vibecodefriendly — friendly guardrails for AI-generated code")
  .version("0.0.1");

program
  .command("review [file]")
  .description("Review source code for bugs, smells, and security issues")
  .option("--input <code>", "inline code string to review")
  .option("--file <path>", "path to the file to review")
  .option("--format <json|text>", "output format", parseFormat, "text")
  .option("--no-score", "hide numeric score")
  .option("--ci", "CI mode: exit 1 on medium or high risk", false)
  .option("--quiet", "suppress all output (exit code only)", false)
  .option("--verbose", "show detailed output", false)
  .action(async (fileArg: string | undefined, opts: ReviewCommandOpts) => {
    try {
      const filePath = fileArg ?? opts.file;
      let code: string;

      if (filePath) {
        const resolved = path.resolve(filePath);
        try {
          code = await fs.promises.readFile(resolved, "utf-8");
        } catch (err) {
          console.error(`Error: Failed to read file: ${path.resolve(filePath)} \u2014 ${(err as Error).message}`);
          process.exit(1);
        }
      } else if (opts.input) {
        code = opts.input;
      } else if (!process.stdin.isTTY) {
        code = await readStdin();
      } else {
        console.error("Error: provide a file, --input, or pipe via stdin");
        process.exit(1);
      }

      const result = reviewCode(code);

      const renderOptions: RenderOptions = {
        format: opts.format,
        verbose: opts.verbose,
        showScore: opts.score !== false,
        quiet: opts.quiet,
      };

      renderResult(result, renderOptions);

      let exitCode = 0;
      if (result.risk === "high") exitCode = 1;
      else if (opts.ci && result.risk === "medium") exitCode = 1;

      process.exit(exitCode);
    } catch (err) {
      console.error("Error:", (err as Error).message);
      process.exit(1);
    }
  });

program.parseAsync(process.argv).catch((err: Error) => {
  console.error("Error:", err.message);
  process.exit(1);
});
