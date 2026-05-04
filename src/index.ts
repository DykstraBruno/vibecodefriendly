import { Command, InvalidArgumentError } from "commander";
import fs from "fs";
import path from "path";
import { review, type ReviewOptions } from "./core/review";
import type { ReviewResult } from "./types/index";

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
  .option(
    "--format <json|text>",
    "output format",
    (value) => {
      if (value !== "json" && value !== "text") {
        throw new InvalidArgumentError('--format must be "json" or "text".');
      }
      return value as "json" | "text";
    },
    "text"
  )
  .option("--verbose", "show detailed output", false)
  .action(
    async (
      fileArg: string | undefined,
      opts: {
        input?: string;
        file?: string;
        format: "json" | "text";
        verbose: boolean;
      }
    ) => {
      // Resolve the target: positional arg > --file flag > --input flag
      const filePath = fileArg ?? opts.file;

      let code: string;

      if (filePath) {
        const resolved = path.resolve(filePath);
        if (!fs.existsSync(resolved)) {
          console.error(`Error: file not found — ${resolved}`);
          process.exit(1);
        }
        code = fs.readFileSync(resolved, "utf-8");
      } else if (opts.input) {
        code = opts.input;
      } else {
        // No input at all — show command-level help
        program.commands
          .find((c) => c.name() === "review")
          ?.help();
        process.exit(1);
        return; // unreachable, but satisfies TS control-flow
      }

      const options: ReviewOptions = {
        format: opts.format,
        verbose: opts.verbose,
      };

      const result: ReviewResult = await review(code, options);

      output(result, options);
    }
  );

function output(result: ReviewResult, options: ReviewOptions): void {
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (result.issues.length === 0) {
    console.log("No issues found.");
    return;
  }

  for (const issue of result.issues) {
    const loc = issue.line != null ? ` (line ${issue.line})` : "";
    const severity = issue.severity.toUpperCase();
    const type = issue.type;
    console.log(`[${severity}] [${type}]${loc} ${issue.message}`);
  }
}

program.parse(process.argv);
