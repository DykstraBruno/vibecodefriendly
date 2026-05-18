# vibecodefriendly

> **Keep your AI in your vibe.** A friendly guardrail for AI-generated code — drift detection and sanity checks in plain English.

You asked the AI for a logout button. You got a refactored auth context, a new session hook, and middleware changes you never asked for. **vibecodefriendly** tells you when the AI went off-script — without the linter jargon.

For people who build with Cursor, Claude Code, GitHub Copilot, Replit Agent, v0, bolt.new, Lovable, and friends.

[Português (pt-BR)](./README.pt-BR.md)

---

## The problem

The AI ships code fast. It also ships *more* than you asked for.

You ask for a button. It refactors three folders. You can't easily tell whether what it changed is good — so you accept it. Six weeks later you're paying for that decision: bugs in code you don't remember asking for, abstractions you can't explain, files you didn't know existed.

Linters won't catch this. They check syntax and style, not whether the AI stayed on task. Reviewing every diff by hand takes longer than just letting the AI rip again — so you don't.

## What vibecodefriendly does

Run `vcf review` after the AI writes code. It answers two questions in plain English:

1. **Are there sketchy or dangerous patterns in what it wrote?** — *sanity check*
2. **Did the AI change more than you asked for?** — *intent detection*

Messages are human-readable, not linter jargon. Pipe it into CI or use it in the terminal. Zero config — no JSON files.

## Install

```bash
npm install -g vibecodefriendly
```

## Usage

```bash
# Review a file
vcf review src/auth/login.ts

# Review inline code
vcf review --input "var x = 1; debugger;"

# Pipe from stdin
cat myFile.ts | vcf review

# CI mode — exits 1 on medium or high risk
vcf review src/auth/login.ts --ci

# JSON output (for tooling integration)
vcf review src/auth/login.ts --format json
```

## What it looks like

```
$ vcf review tests/fixtures/mixed.ts

Score: 1.3/10
Risk: HIGH ❌
❌ High risk: 2 critical issues detected. Not safe for production.

Issues: 2 high, 3 medium, 1 low

[HIGH] [bug] (line 12) Empty catch block silently swallows errors.
  > } catch (err) {}
[HIGH] [bug] (line 34) debugger statement found — remove before shipping.
  > debugger;
[MEDIUM] [smell] (line 1) Avoid var — use const or let instead.
  > var boot = console.log("boot");
[MEDIUM] [smell] (line 8) Function has too many parameters (6). Consider using an object or splitting the function.
  > function handleLogin(email, password, rememberMe, captcha, locale, timezone) {
[MEDIUM] [smell] (line 8) Low cohesion in "handleLogin": mixes HTTP, database, logging.
  > function handleLogin(email, password, rememberMe, captcha, locale, timezone) {
[LOW] [smell] (line 1) Avoid console statements in production code.
  > var boot = console.log("boot");

By category:
  SECURITY (1)
    [high] debugger statement found — remove before shipping.
  ARCHITECTURE (1)
    [medium] Low cohesion in "handleLogin": mixes HTTP, database, logging.
  DESIGN (2)
    [high] Empty catch block silently swallows errors.
    [medium] Function has too many parameters (6). Consider using an object or splitting the function.
  STYLE (2)
    [medium] Avoid var — use const or let instead.
    [low] Avoid console statements in production code.

Suggestions:
- Remove console statements or replace with a proper logging library.
- Replace var with const (preferred) or let to use block-scoped declarations.
- Remove all debugger statements before shipping to production.
- Handle errors meaningfully or rethrow them.
- Use an object parameter or split the function into smaller pieces.
- Split into smaller, focused functions with a single responsibility.
```

<!-- Output verified by: tests/fixture-baseline.test.ts -->

## Rules

13 rules across 5 categories, designed specifically for AI-generated code:

| Category | Rules |
|---|---|
| **security** | `no-debugger` |
| **design** | `shallow-error-handling`, `function-too-long`, `too-many-params`, `overengineering-detection`, `duplicate-code`, `defensive-overkill` |
| **architecture** | `low-cohesion`, `multiple-responsibilities`, `file-too-large` |
| **intent** | `unexpected-refactor` |
| **style** | `no-console`, `no-var` |

### Intent rules — the differentiator

Rules like `unexpected-refactor` don't flag bad code — they flag **unwanted changes**. If the AI renamed 6+ identifiers or added 5+ barrel re-exports you didn't ask for, that's a scope violation, not a bug.

Opt a file out of intent checking with a comment:

```ts
// vcf: allow-refactor
```

## Node.js usage

```ts
import { reviewCode } from "vibecodefriendly";

const result = reviewCode(code);
// { score, risk, issues, suggestions, warnings }

// With options
const result = reviewCode(code, {
  excludeRuleIds: ["no-console"],
});
```

## How is this different from a linter?

Linters check whether your code follows rules *you already wrote down*. vibecodefriendly checks whether the AI **did what you actually asked** and whether the patterns it produced will hurt you later — in language you don't have to be a senior dev to read.

It's a second opinion on the AI's output, not a style enforcer.

## Status

**Alpha.** The core engine and CLI are working. Actively adding rules and improving output.

**Like the idea? Star this repo to follow along.** Stars tell me whether to keep going and help others find it.

Got a pattern the AI keeps producing that should be flagged? [Open an issue](https://github.com/DykstraBruno/vibecodefriendly/issues) — rule suggestions welcome.

## Who's building this

[Bruno Dykstra](https://github.com/DykstraBruno) — CS undergrad, fullstack dev (TypeScript / Node / React / Java).

I already shipped [arch-reviewer-cli](https://github.com/DykstraBruno/arch-reviewer-cli) — same problem space, but built for senior devs running Clean Architecture, with rigorous rule-based checking and a JSON config. **vibecodefriendly takes that engine and repositions it for people who don't want to read a book about Clean Architecture and just want their AI not to quietly break their app.**

## License

[MIT](./LICENSE) © 2026 Bruno Dykstra
