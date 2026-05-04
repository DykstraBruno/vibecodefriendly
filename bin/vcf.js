#!/usr/bin/env node

// vibecodefriendly is in pre-release (Phase 1: testing the idea).
// This stub exists so `npx vibecodefriendly` and `vcf` resolve to
// something friendly while the real CLI is being built.

const lines = [
  "",
  "  vibecodefriendly is coming soon.",
  "",
  "  A friendly guardrail for AI-generated code — drift detection",
  "  and sanity checks in plain English.",
  "",
  "  Like the idea? Star the repo to follow along:",
  "  https://github.com/DykstraBruno/vibecodefriendly",
  "",
];

for (const line of lines) {
  process.stdout.write(line + "\n");
}
