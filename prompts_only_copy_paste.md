# Prompts (copy-paste)

> Each prompt is self-contained — paste in any new Claude/ChatGPT chat. Reflects the **real** code in this repo as of 2026-05-05. Rule API is `rule.run({ code, lines })`. Threshold for `unexpected-refactor` re-exports is `> 4` (5+).

---

## PROMPT 0.0 — Audit False-Positives

```
I'm auditing the rules in vibecodefriendly. The Rule type is:

  type Rule = {
    id: string;
    run: (ctx: { code: string; lines: string[] }) => Issue[];
    // ...
  };

Three rules scan raw lines via regex and do NOT strip comments first:

1. src/rules/consoleLogRule.ts (id: "no-console")
   regex: /\bconsole\.(log|error|warn|info)\s*\(/

2. src/rules/noVarRule.ts (id: "no-var")
   regex: /\bvar\s+/

3. src/rules/noDebuggerRule.ts (id: "no-debugger")
   regex: /\bdebugger\b/

For each rule, confirm:
- The regex implementation
- Whether it would flag the same pattern inside a // line comment or /* block */ comment
- Severity (no-debugger is HIGH — flagging a comment fails CI)

Then output pseudocode for a shared `stripComments(code: string): string` that:
- Removes // line comments to end of line
- Removes /* ... */ block comments (including multi-line)
- Preserves comment-like sequences inside string literals ("// not a comment", '/* still a string */')
- Preserves template literals (`hello // world`)
- Preserves regex literals (/\/\/foo/)

Output: list of files touched + pseudocode. No code changes yet.
```

---

## PROMPT 0.1 — Vitest Setup

```
Set up Vitest for vibecodefriendly. Constraints:
- TypeScript strict mode (already configured)
- Tests co-located: src/**/*.test.ts plus tests/ for integration
- Use named imports from "vitest" (no globals — keeps it explicit)
- Add @vitest/coverage-v8 for coverage

Deliver:
1. Exact npm command (devDeps only)
2. Full vitest.config.ts (include both src/**/*.test.ts AND tests/**/*.test.ts)
3. package.json scripts: test, test:watch, test:coverage, ci (= tsc --noEmit && vitest run)
4. One smoke test src/__smoke__.test.ts that imports rules from "./rules" and asserts length === 13
```

---

## PROMPT 0.2 — stripComments + apply at parser level

```
In vibecodefriendly, the comment-stripping bug affects multiple rules (no-console, no-var, no-debugger, AND domain-keyword rules low-cohesion / multiple-responsibilities also scan funcBody including comments).

Apply the fix at the PARSER level so all 13 rules benefit:

1. Add `stripComments(code)` to src/rules/helpers.ts (must preserve strings, template literals, regex literals).

2. Modify src/core/codeParser.ts so ParsedCode now exposes BOTH:
   - rawText / rawLines  (untouched, for warnings that need original)
   - text / lines        (comments stripped — what RuleContext gets)
   
   Keep RuleContext shape stable: { code, lines } continues to be the comment-stripped version. This means rules need NO change.

3. Edge cases stripComments must handle:
   - "// not a comment" inside double-quoted string
   - '/* still a string */' inside single-quoted string
   - `template ${literal} // also not a comment`
   - /\/\/foo/ regex literal
   - URLs with // (http://x) inside strings
   - Newlines inside block comments (multi-line /* ... */)

4. Tests in tests/helpers/stripComments.test.ts:
   - removes // line comments
   - removes /* */ block comments (single + multi-line)
   - preserves // inside double-quoted strings
   - preserves /* */ inside single-quoted strings
   - preserves comment-like text in template literals
   - preserves regex literals containing /

Deliver: full diff for helpers.ts, codeParser.ts, plus the test file.
```

---

## PROMPT 0.3 — 13 rule unit tests (positive + negative)

```
Generate 13 test files for vibecodefriendly. Rule API is `rule.run({ code, lines })` where lines = code.split("\n"). Issue shape: { ruleId, type, severity, category, message, line, lineContent }.

Use this helper at the top of each test file:

  import { describe, it, expect } from "vitest";
  function ctx(code: string) { return { code, lines: code.split("\n") }; }

For each rule, write 2 tests minimum (positive + negative). Use these EXACT mappings:

| File | id | Threshold |
|---|---|---|
| src/rules/consoleLogRule.test.ts | no-console | any match |
| src/rules/noVarRule.test.ts | no-var | any match |
| src/rules/noDebuggerRule.test.ts | no-debugger | any match |
| src/rules/functionTooLongRule.test.ts | function-too-long | length > 80 |
| src/rules/shallowErrorHandlingRule.test.ts | shallow-error-handling | empty catch OR catch with ONLY console call |
| src/rules/tooManyParamsRule.test.ts | too-many-params | > 4 params (single destructured object = 1) |
| src/rules/overengineeringDetectionRule.test.ts | overengineering-detection | class with exactly 1 non-constructor method, OR wrapper fn |
| src/rules/duplicateCodeRule.test.ts | duplicate-code | 2 blocks ≥ 5 lines, Jaccard ≥ 0.85 |
| src/rules/defensiveOverkillRule.test.ts | defensive-overkill | 3+ deep && chains OR 3+ deep ?. (3+ levels) |
| src/rules/unexpectedRefactorRule.test.ts | unexpected-refactor | aliases > 5 OR re-exports > 4 |
| src/rules/lowCohesionRule.test.ts | low-cohesion | function with 3+ domains (HTTP/DB/file/UI/crypto/logging) |
| src/rules/multipleResponsibilitiesRule.test.ts | multiple-responsibilities | function with 3+ signal types |
| src/rules/fileTooLargeRule.test.ts | file-too-large | lines > 300 |

Import each rule from its own file (not the barrel).

Deliver: 13 complete files, ready to drop in.
```

---

## PROMPT 0.4 — Fixture baseline (README example as test)

```
Create a fixture that exactly reproduces the example output in vibecodefriendly's README:

- 2 high (no-debugger + shallow-error-handling)
- 3 medium (low-cohesion + no-var + too-many-params)
- 1 low (no-console)
- DESIGN (2), ARCHITECTURE (1), SECURITY (1), STYLE (2)

Steps:
1. Write tests/fixtures/mixed.ts — TypeScript code triggering exactly those 6 issues at the README's claimed lines (debugger line 34, empty catch line 12, too-many-params line 8, low-cohesion + no-var + no-console all on line 1).
2. Write tests/fixture-baseline.test.ts that:
   - reads tests/fixtures/mixed.ts
   - calls reviewCode(code) from src/sdk/v1
   - asserts: result.score (within ±0.1), result.risk === "high", counts by severity, count by category, exact issue messages

This locks the README example as a regression test — if output drifts, the README is lying.

Deliver: mixed.ts source + the test file.
```

---

## PROMPT 0.5 — unexpected-refactor baseline

```
Write src/rules/unexpectedRefactorRule.test.ts with 5 cases. Rule code:

- ALIAS_THRESHOLD = 5; flags when alias count > 5 (i.e., 6+)
- REEXPORT_THRESHOLD = 4; flags when re-export count > 4 (i.e., 5+)
- Opt-out: file contains `// vcf: allow-refactor` OR `@vcf-ignore-refactor`

Tests:
1. 6 simple aliases → flags (medium severity, message contains "identifier aliases")
2. 5 simple aliases → no flag (boundary)
3. 5 barrel re-exports `export { x } from "./y";` → flags (low severity, message contains "barrel re-exports")
4. 4 re-exports → no flag (boundary)
5. 6 aliases + `// vcf: allow-refactor` at top → no flag

Also create src/rules/unexpectedRefactorRule.NOTES.md documenting:
- Current implementation: regex-based, no diff awareness
- Known limitation: cannot tell solicited vs unsolicited refactor (needs prompt + diff)
- Future v1.0.0: replace heuristic with LLM diff-vs-prompt comparison
- Tests above lock current behavior as baseline before swap
```

---

## PROMPT 0.6 — CLI smoke tests

```
Write tests/cli.smoke.test.ts using vitest + child_process for vibecodefriendly. CLI entry: bin/vcf.js (executes dist/cli/index.js, so build before running tests).

Required tests (use spawnSync to capture stdout + stderr + exit code):
1. `node bin/vcf.js review tests/fixtures/mixed.ts` exits 1 (high risk), stdout contains "Score:" and "HIGH"
2. `node bin/vcf.js review --input "console.log('x');"` exits 0, stdout contains "Score:"
3. `node bin/vcf.js review tests/fixtures/mixed.ts --format json` returns parseable JSON containing keys: score, risk, issues, suggestions, warnings, summary, counts
4. `node bin/vcf.js review tests/fixtures/mixed.ts --quiet` produces zero stdout, exit 1
5. `node bin/vcf.js review tests/fixtures/mixed.ts --ci` exits 1
6. `node bin/vcf.js review nonexistent.ts` exits 1 with stderr containing "Failed to read file"
7. `echo "var x = 1;" | node bin/vcf.js review` exits 0, stdout contains "Avoid var"

Add a beforeAll that runs `npm run build` (or asserts dist/ exists).
```

---

## PROMPT 0.7 — Test report

```
After running `npm test -- --run` in vibecodefriendly, summarize results into TEST_REPORT.md:

Sections:
- Summary: total / passed / failed
- Failing tests grouped by file, with:
  - Test name
  - Expected vs actual
  - Likely root cause (1 sentence)
  - Fix location (file + approximate line)
  - Time estimate

Format failing tests so each row is grep-able. End with total estimated fix time.

Do NOT publish or release while any test fails.
```
