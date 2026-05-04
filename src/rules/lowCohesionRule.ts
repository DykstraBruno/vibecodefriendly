import type { Issue, Rule } from "../types/index";
import { getLineContent } from "./helpers";

// Heuristic for low cohesion: a function uses many different "domain words"
// (e.g. database + HTTP + UI + file) suggesting it handles unrelated concerns.

const DOMAIN_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "HTTP",     re: /\b(?:fetch|axios|http|request|response|res\.|req\.)\b/ },
  { name: "database", re: /\b(?:db\.|query|sql|mongo|prisma|knex|sequelize)\b/ },
  { name: "file I/O", re: /\b(?:readFile|writeFile|fs\.|path\.|__dirname)\b/ },
  { name: "UI/DOM",   re: /\b(?:document\.|window\.|getElementById|querySelector|render)\b/ },
  { name: "crypto",   re: /\b(?:crypto\.|bcrypt|hash|encrypt|decrypt|jwt)\b/ },
  { name: "logging",  re: /\b(?:logger\.|console\.|log\.|winston|pino)\b/ },
];

const FUNCTION_OPEN_RE =
  /(?:function\s+(\w+)\s*\(|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\()/;

export const lowCohesionRule: Rule = {
  id: "low-cohesion",
  description: "Detects functions that mix multiple unrelated domains (HTTP, DB, file I/O, UI, etc.).",
  suggestion: "Split into smaller, focused functions with a single responsibility.",
  category: "architecture",
  severity: "medium",
  tier: "pro",
  tags: ["architecture", "cohesion"],
  run({ lines }): Issue[] {
    const issues: Issue[] = [];

    let funcName = "";
    let funcStartLine = -1;
    let depth = 0;
    let funcBody = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (funcStartLine === -1 && FUNCTION_OPEN_RE.test(line)) {
        const m = FUNCTION_OPEN_RE.exec(line);
        funcName = m?.[1] ?? m?.[2] ?? "anonymous";
        const opens = (line.match(/\{/g) ?? []).length;
        const closes = (line.match(/\}/g) ?? []).length;
        if (opens > closes) {
          funcStartLine = i;
          depth = opens - closes;
          funcBody = line;
          continue;
        }
      }

      if (funcStartLine !== -1) {
        funcBody += "\n" + line;
        for (const ch of line) {
          if (ch === "{") depth++;
          else if (ch === "}") depth--;
        }

        if (depth <= 0) {
          // Analyse function body
          const domains = DOMAIN_PATTERNS.filter((d) => d.re.test(funcBody));
          if (domains.length >= 3) {
            issues.push({
              ruleId: "low-cohesion",
              type: "smell",
              severity: "medium",
              category: "architecture",
              message: `Low cohesion in "${funcName}": mixes ${domains.map((d) => d.name).join(", ")}.`,
              line: funcStartLine + 1,
              lineContent: getLineContent(lines, funcStartLine),
            });
          }
          funcStartLine = -1;
          funcBody = "";
          depth = 0;
        }
      }
    }

    return issues;
  },
};
