# Structured-data validation — summary

- Source file: `schema.json`
- Validated at (UTC): 2026-07-10T20:07:06.865354+00:00
- Pages with JSON-LD: 1
- Typed JSON-LD blocks checked: 85

This validation is OFFLINE — no Rich Results Test or external API is called. Required/recommended fields come from a bundled, sourced subset of Google's structured-data documentation; nothing is inferred about unknown types.

## Findings

| Finding | Count |
|---|---|
| Blocks missing a REQUIRED field | 0 |
| Blocks missing a RECOMMENDED field | 2 |
| Retired/deprecated rich results (HowTo/FAQ) | 1 |
| Self-serving Review/AggregateRating | 0 |
| Rich-result eligible (required complete, live type) | 2 |
| Unknown @type (no verdict given) | 80 |

## Actionable gaps (1)

Seeded into `backlog-seed-schema.json` for `score-opportunities.py` (the six 1-5 scores are left for the human/orchestrator).

- **schema-001** — Review the FAQPage schema on http://localhost:3000/christmas-parties — its rich result has been retired by Google; keep the markup only if it still serves a non-rich-result purpose.

## Output files

- `schema-issues.csv` — one row per typed JSON-LD block.
- `backlog-seed-schema.json` — actionable gaps shaped for `score-opportunities.py`.

_Offline validation. No external API called. Unknown types are reported, never guessed._
