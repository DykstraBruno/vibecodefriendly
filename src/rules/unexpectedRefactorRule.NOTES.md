# unexpected-refactor (v0.1.0)

## Current Implementation

- Regex-based heuristic, no git diff awareness.
- Detects 6+ simple identifier aliases.
- Detects 5+ barrel re-exports.
- Allows explicit opt-out markers: `// vcf: allow-refactor` and `@vcf-ignore-refactor`.

## Known Limitations

- Cannot tell solicited vs unsolicited refactors without the user prompt and diff.
- Multi-file semantic refactoring is not supported.
- Regex matching can miss equivalent refactors that use different syntax.

## Future (v1.0.0)

- Replace this heuristic with an LLM comparison of prompt intent vs git diff.
- Keep these tests as a baseline before swapping implementations.
