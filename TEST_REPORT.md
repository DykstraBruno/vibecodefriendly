# Test Report (v0.1.0 MVP)

## Summary

- Test files: 17
- Total tests: 46
- Passing: 46
- Failing: 0

## Failures

None.

## Verification

- `npm test -- --run`: passed
- `npm run build`: passed

## Notes

- Vitest needed elevated execution in this Windows sandbox because Vite failed with `spawn EPERM` when loading the config.
- CLI smoke tests build `dist/` before invoking `bin/vcf.js`.
- The fixture baseline reflects the current scoring implementation: `tests/fixtures/mixed.ts` scores `1.3/10` with high risk.

## Total Estimated Fix Time

0h remaining for the current baseline.
