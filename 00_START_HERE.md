# 00_START_HERE — Test rollout for vibecodefriendly

Corrected walkthrough. Original plan had API + filename mismatches with the real code; this version is verified against the actual repo on 2026-05-05.

## Critical corrections from the original plan

| # | Original plan | Real code |
|---|---|---|
| 1 | `src/rules/noConsoleRule.ts` | `src/rules/consoleLogRule.ts` (id is `no-console`, but filename is `consoleLogRule.ts`) |
| 2 | `rule.check(code, {})` | `rule.run({ code, lines })` — context shape is `RuleContext = { code, lines }` |
| 3 | `if (code.includes('debugger'))` | Per-line: `for (let i...) { if (/\bdebugger\b/.test(lines[i])) ... }` |
| 4 | "4+ barrel re-exports" | `> 4` (5+); README already corrected |
| 5 | `stripComments` patched in 3 rules | Strip at `src/core/codeParser.ts` so all 13 rules + future rules benefit (low-cohesion / multiple-responsibilities also scan comments) |
| 6 | `npx vcf review /tmp/test.ts` | `npm run build && node bin/vcf.js review <file>` (Windows: no /tmp; PATH not linked) |
| 7 | Duplicate `unexpectedRefactorRule.test.ts` in 0.3 and 0.5 | Skip it in 0.3; only created in 0.5 |
| 8 | `npm publish` after fixes | Hold publish until **all** tests green; project memory mandates "PR só mergeia com testes" |
| 9 | `cat > /tmp/...` | Windows: use repo-relative `tests/fixtures/` files instead of /tmp |

## Workflow

For each prompt in `prompts_only_copy_paste.md`:

1. Copy the prompt → paste in Claude/ChatGPT (or use this same chat)
2. Read the response → it gives you code/instructions
3. Apply the changes locally
4. Run the validation command listed below for that prompt
5. Commit with the suggested message

## Sequence (~13–15 h total)

### Setup (10 min)

```powershell
npm install -D vitest @vitest/coverage-v8
```

Validate:

```powershell
npm list vitest
```

### PROMPT 0.0 — Audit false-positives (20 min)

Goal: confirm the 3 comment-blind rules and pseudocode for `stripComments`. No code change yet.

Validate (reproduce one false positive):

```powershell
npm run build
"// debugger; left for later" | node bin/vcf.js review
```

Expected today: flagged HIGH (the bug). After 0.2 it should pass clean.

Commit:

```
docs: audit false-positives identified (PROMPT 0.0)
```

### PROMPT 0.1 — Vitest setup (30 min)

Files to create:

- `vitest.config.ts`
- `src/__smoke__.test.ts` (single test asserting `rules.length === 13`)

Update `package.json` scripts (test / test:watch / test:coverage / ci).

Validate:

```powershell
npm test -- --run
```

Expected: 1 file passed, 1 test passed.

Commit:

```
chore(test): vitest setup (PROMPT 0.1)
```

### PROMPT 0.2 — stripComments at parser level (1 h)

Files:

- Modify `src/rules/helpers.ts` — add `stripComments`
- Modify `src/core/codeParser.ts` — strip before exposing `text`/`lines` to RuleContext (preserve raw if any rule needs it later — currently none do)
- Create `tests/helpers/stripComments.test.ts`

Validate:

```powershell
npm test -- --run
"// debugger; left for later" | node bin/vcf.js review
```

Expected: stripComments tests green. CLI no longer flags the comment.

Commit:

```
fix: strip comments at parser level (PROMPT 0.2)
```

### PROMPT 0.3 — 13 rule unit tests (2.5 h)

Generate 13 `*.test.ts` files (one per rule) under `src/rules/`. Use `rule.run({ code, lines })`. **Skip `unexpectedRefactorRule.test.ts` here** — it gets dedicated coverage in 0.5.

Validate:

```powershell
npm test -- --run
```

Expected: ~12 new files, ~24+ tests. Some may fail — that's data for 0.7.

Commit:

```
test: baseline tests for 12 core rules (PROMPT 0.3)
```

### PROMPT 0.4 — Fixture baseline (30 min)

Files:

- `tests/fixtures/mixed.ts` — code that exactly reproduces the README example (2 high, 3 medium, 1 low; line numbers must match README claims)
- `tests/fixture-baseline.test.ts` — locks `reviewCode(mixed)` output to README spec

Validate:

```powershell
npm test -- --run
node bin/vcf.js review tests/fixtures/mixed.ts
```

Expected: test green. CLI output matches README.

Commit:

```
test: README fixture baseline (PROMPT 0.4)
```

### PROMPT 0.5 — unexpected-refactor baseline (1 h)

Files:

- `src/rules/unexpectedRefactorRule.test.ts` (5 cases inc. opt-out)
- `src/rules/unexpectedRefactorRule.NOTES.md` (documents regex-based current state, planned LLM swap)

Validate:

```powershell
npm test src/rules/unexpectedRefactorRule.test.ts -- --run
```

Commit:

```
test: unexpected-refactor baseline + notes (PROMPT 0.5)
```

### PROMPT 0.6 — CLI smoke tests (1 h)

File:

- `tests/cli.smoke.test.ts` — uses `child_process.spawnSync` against `node bin/vcf.js`. Requires `dist/` built; the test file should `npm run build` in `beforeAll` (or assert dist exists).

Validate:

```powershell
npm run build
npm test -- --run
```

Commit:

```
test: CLI smoke tests (PROMPT 0.6)
```

### PROMPT 0.7 — Test report (15 min)

Run full suite, paste failing output to Claude, get structured `TEST_REPORT.md`.

```powershell
npm test -- --run
```

Commit:

```
docs: test report (PROMPT 0.7)
```

### Fix phase (~2 h)

For each failing test:

1. Open the test → understand expected behavior
2. Open the rule → identify why it doesn't match expectation
3. Patch rule (or patch test if expectation was wrong)
4. Re-run that single test file
5. Commit with `fix:` prefix and the rule name

### Final validation (30 min)

```powershell
npm test -- --run
npm run build
node bin/vcf.js review tests/fixtures/mixed.ts
```

All three must succeed before publish.

### Release (only after all tests green)

```powershell
git tag v0.1.0
git push origin v0.1.0
npm publish
npm install -g vibecodefriendly@0.1.0
vcf review --help
```

## Final checklist

```
Setup
  [ ] npm install -D vitest @vitest/coverage-v8
  [ ] vitest.config.ts exists
  [ ] package.json scripts added

Prompts
  [ ] 0.0 audit confirmed
  [ ] 0.1 setup smoke test green
  [ ] 0.2 stripComments + parser change, comment false-positives gone
  [ ] 0.3 12 rule tests
  [ ] 0.4 fixture matches README
  [ ] 0.5 unexpected-refactor + NOTES.md
  [ ] 0.6 CLI smoke green
  [ ] 0.7 TEST_REPORT.md

Fix phase
  [ ] All failing tests fixed (rule patched OR expectation revised)
  [ ] npm test -- --run: ALL green

Release (gated on all-green)
  [ ] npm run build clean
  [ ] git tag v0.1.0
  [ ] npm publish
  [ ] vcf review --help works post-install
```

## If stuck

Send Claude:

```
File: <path>
Test name: <name>
Error output (full):
<paste>
Implementation:
<paste relevant function>

Why is this failing?
```

Don't `--no-verify` past hook failures. Don't `npm publish` while any test is red. Don't bypass `tsc --noEmit`. Fix the cause.
