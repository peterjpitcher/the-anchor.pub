# GSC CSV Audit Script Author — Handoff

## Outputs
- `tasks/gsc-indexing-fix/audit-gsc-csvs.mjs` — Node ESM audit script (no deps)
- `tasks/gsc-indexing-fix/orchestration/wave-1/gsc-audit-script/sample-output.csv` — 597 records (1 header + 596 data rows)
- `tasks/gsc-indexing-fix/orchestration/wave-1/gsc-audit-script/sample-summary.txt` — human-readable summary (identical to stdout)

## CSV parser choice
Hand-rolled state-machine parser embedded in the script (function `parseCsv`). No npm dependencies installed; `package.json` is unmodified.

Rationale:
- The spec permitted either `csv-parse` or a hand-rolled state machine. With only one consumer, ~80 lines of well-commented parser is preferable to pulling in a transitive dependency tree.
- The parser handles RFC-4180-style quoting: comma-bearing quoted fields, embedded `\n` and `\r\n` line breaks inside quotes, doubled-quote (`""`) escapes, optional UTF-8 BOM, and trailing-newline tolerance.
- Verified against the GSC export at hand: folder (4) `Table.csv` has 120 physical lines but only 116 records — the parser correctly resolves 4 quoted entries with embedded line breaks (this is exactly the case the consultant flagged as risky).

If a future workstream (Workstream E2 site-wide orphan audit) prefers a library, swapping in `csv-parse` is mechanical: only `parseCsv()` would need to change.

## Counts produced
- Total URLs: **596**
- Per-issue:
  - Page with redirect: 221
  - Blocked by robots.txt: 137
  - Excluded by 'noindex' tag: 57   *(GSC label uses curly quotes ‘noindex’; matched verbatim)*
  - Not found (404): 30
  - Crawled - currently not indexed: 116
  - Alternative page with proper canonical tag: 11
  - Redirect error: 7
  - Discovered - currently not indexed: 17   *(GSC label uses an en-dash – ; matched verbatim)*

Sum check: 221 + 137 + 57 + 30 + 116 + 11 + 7 + 17 = **596** ✅

## url_type distribution
- redirect_source: 153
- static_asset: 108  *(≥106 expected ✅)*
- page: 229
- legacy_wix: 65
- parameter_variant: 22
- og_image: 19
- (no `unknown` rows produced; classifier is total over the input)

## cohort distribution
- tag: 167  *(≥100 expected ✅)*
- post: 139  *(≥50 expected ✅)*
- static_asset: 108
- other: 81
- event: 76
- drink: 16
- private_hire: 7
- food_menu: 2

## Issues encountered
- **GSC label encoding** — Two issue labels arrive with non-ASCII characters from the GSC export: `'noindex'` uses U+2019 right single quote, and `Discovered – currently not indexed` uses an en-dash. The script reproduces them as-is (i.e. it does not normalise). Downstream consumers should match on these exact strings, or add a normaliser if they prefer ASCII.
- **`wc -l` lies** — The output CSV reports `601` from `wc -l` because the file ends with a terminating newline; true record count is 597 (verified by re-parsing through the same CSV state machine). The Definition-of-Done check should use a real CSV parser, not `wc`.
- **Folder discovery** — Folders are paired with their `Metadata.csv` only if both files exist. A subset of folders works fine (the script silently skips any folder lacking `Table.csv` or `Metadata.csv`).

## Determinism
Re-running the script produces a byte-identical `sample-output.csv` (verified via `shasum`). Folders are processed in lexicographic order; rows are emitted in source order within each folder; summary tables are sorted alphabetically.

## Notes for downstream

### Wave 2 — Orphan Spot-Checker
- Filter `sample-output.csv` to `url_type IN ('page', 'legacy_wix')` and `cohort IN ('post', 'tag', 'event', 'drink', 'private_hire', 'food_menu', 'other')` to get the candidate set worth checking against the live sitemap.
- The 153 `redirect_source` rows are already accounted for by `config/redirects/*.json` and need no further investigation.
- The 108 `static_asset` rows correspond to 1-1 GSC-indexed Next build artefacts and should be excluded from any "is this a real page?" check.

### Future Workstream E2 — site-wide orphan audit
- The `parseCsv()` function is self-contained (~80 lines, no deps) and is safe to copy into a follow-up script if needed.
- If the orphan audit grows to 10k+ URLs, consider streaming via `node:readline` in tandem with a quote-aware buffer rather than buffering whole files; for the current 596-row scale, in-memory is comfortable.

### Re-run protocol
```bash
node tasks/gsc-indexing-fix/audit-gsc-csvs.mjs
```
The script is idempotent. Drop new GSC drilldown folders into `temp/GSC Errors/` and re-run; they will be picked up automatically as long as each folder contains both `Table.csv` and `Metadata.csv`.
