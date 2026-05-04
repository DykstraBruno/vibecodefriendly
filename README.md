# vibecodefriendly

> You asked the AI for a logout button. You got a refactored auth context, a new session hook, and middleware changes you never asked for. **vibecodefriendly** tells you when the AI went off-script — in plain English, not linter jargon.

For people who build with Cursor, Claude Code, GitHub Copilot, Replit Agent, v0, bolt.new, Lovable, and friends.

[Português (pt-BR)](./README.pt-BR.md)

---

## The problem

The AI ships code fast. It also ships *more* than you asked for.

You ask for a button. It refactors three folders. You can't easily tell whether what it changed is good — so you accept it. Six weeks later you're paying for that decision: bugs in code you don't remember asking for, abstractions you can't explain, files you didn't know existed.

Linters won't catch this. They check syntax and style, not whether the AI stayed on task. Reviewing every diff by hand takes longer than just letting the AI rip again — so you don't.

## What vibecodefriendly does

It runs after the AI writes code and answers two questions in plain English:

1. **Did the AI stay in scope, or did it wander off?** — *drift detection*
2. **Are there sketchy patterns or unnecessary abstractions in what it wrote?** — *sanity check*

Messages are friendly, not jargon-y. Zero config — `vcf init` reads your project and figures out the rules itself. No JSON files to babysit.

## What it looks like

> The tool is in pre-release (see [Status](#status)). These are mockups of the planned UX.

### 1. Drift detection — "you asked for X, the AI did Y"

```
$ vcf check

You asked: "add a logout button to the header"

What the AI did:
  ✓ Added logout button to Header.tsx — matches your ask
  ⚠ Refactored AuthContext.tsx (62 lines changed)
  ⚠ Created hooks/useSession.ts (new file)
  ⚠ Modified middleware/auth.ts (redirect logic)

3 of these weren't part of what you asked for.
This is where subtle bugs show up. Want to review before continuing?

  [r] Review file by file
  [a] Accept everything (not recommended)
  [u] Ask the AI to undo the extras
```

### 2. Sanity check — patterns that bite later

```
$ vcf check

Found 2 patterns that usually become headaches later:

  src/domain/Order.ts
    This business-rule file is calling the database directly. You'll
    feel it the day you swap databases or want to test without
    spinning up Postgres. Suggestion: ask the AI to move that call
    into a repository.

  src/components/Dashboard.tsx (487 lines)
    This component grew big. Past ~350 lines, AIs start making more
    mistakes when editing — they lose context. Suggestion: ask the
    AI to split it into pieces.

Want me to ask the AI to fix these now? [y/N]
```

### 3. Zero-config init — no JSON to edit

```
$ vcf init

Looking at your project to figure out sensible rules...

  ✓ Detected: Next.js 14 + TypeScript + Prisma
  ✓ Typical pattern for this stack: separate app/, lib/, components/

Done. Whenever the AI writes code, run:

  vcf check

And I'll tell you if it stayed in scope or wandered off.

(zero config files to edit — trust me)
```

## How is this different from a linter?

Linters check whether your code follows rules *you already wrote down*. vibecodefriendly checks whether the AI **did what you actually asked** and whether the patterns it produced will hurt you later — in language you don't have to be a senior dev to read.

It's a second opinion on the AI's output, not a style enforcer.

## Status

**Pre-release.** Phase 1 is testing the idea before I burn weeks building it.

**Like the idea? Star this repo to follow along.** Stars are the only signal I have at this stage — they tell me whether to keep going. When the tool is ready, the first release ships here.

Got a war story about the AI doing too much, or feedback on the pitch above? [Open an issue](https://github.com/DykstraBruno/vibecodefriendly/issues) — I want to hear it.

## Who's building this

[Bruno Dykstra](https://github.com/DykstraBruno) — CS undergrad, fullstack dev (TypeScript / Node / React / Java).

I already shipped [arch-reviewer-cli](https://github.com/DykstraBruno/arch-reviewer-cli) — same problem space, but built for senior devs running Clean Architecture, with rigorous rule-based checking and a JSON config. **vibecodefriendly takes that engine and repositions it for people who don't want to read a book about Clean Architecture and just want their AI not to quietly break their app.**

## License

[MIT](./LICENSE) © 2026 Bruno Dykstra
