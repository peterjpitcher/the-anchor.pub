# Orchestration Plan — GSC Indexing Fix Round 2

## Plan summary
Execute the round-2 mechanical and research workstreams from `tasks/gsc-indexing-fix/IMPLEMENTATION-PLAN.md`. Wave 1 produces baseline evidence + code changes for cache headers, the breadcrumb-source matrix, a regression test, the audit script, and sitemap investigation findings. Wave 2 applies the breadcrumb fix using the Wave 1 matrix and runs the orphan spot-check using the Wave 1 audit script.

Out of scope for this orchestration run: A4 post-deploy verification (requires deploy + owner Cloudflare purge), E2–E5 bulk linking sweep (depends on E1 outcome and human content review per PR), Workstream F P0/P1 follow-ups.

## Work streams

| # | Role | Wave | Depends on | Owns | Output |
|---|---|---|---|---|---|
| 1 | Cache Headers Engineer | 1 | — | A1, A2 | Modified `next.config.js` + 6 baseline header captures |
| 2 | Breadcrumb Auditor | 1 | — | B1, B2 | `breadcrumb-matrix.csv` + duplicate-baseline scan |
| 3 | SEO Regression Test Author | 1 | — | C1 | `tests/seo-indexing.test.ts` |
| 4 | GSC CSV Audit Script Author | 1 | — | C2 | `tasks/gsc-indexing-fix/audit-gsc-csvs.mjs` + sample output |
| 5 | Sitemap Investigator | 1 | — | D1–D4 | sitemap fetch evidence + `sitemap-investigation-findings.md` |
| 6 | Breadcrumb Fix Engineer | 2 | Agent 2 matrix | B3, B4 | Edits to ~17 files + post-fix scan |
| 7 | Orphan Spot-Checker | 2 | Agent 4 script | E1 | spot-check findings appended to spec |

## Wave structure

- **Wave 1**: Agents 1, 2, 3, 4, 5 — parallel, no inter-dependencies.
- **Wave gate review** between waves; orchestrator validates outputs and approves Agent 6 to proceed.
- **Wave 2**: Agents 6, 7 — depend on Wave 1 outputs.
- **Verification pass** (orchestrator checklist + codex-qa-review since plan produces code AND involves >3 agents).

## Workspace

```
tasks/gsc-indexing-fix/
├── IMPLEMENTATION-PLAN.md                  (input)
├── REVIEW-PACK.md                          (input — full spec, consultant-reviewed)
├── evidence/                               (agent output target)
│   ├── robots-headers-*.txt
│   ├── robots-body-*.txt
│   ├── sitemap-headers-*.txt
│   ├── sitemap-tests/
│   ├── breadcrumb-matrix.csv
│   ├── breadcrumb-duplicates-baseline.txt
│   └── sitemap-investigation-findings.md
└── orchestration/
    ├── plan.md                             (this file)
    ├── wave-1/{role}/{outputs/, handoff.md}
    ├── wave-2/{role}/{outputs/, handoff.md}
    ├── integration/
    └── verification/
```

## Limits used / remaining

- Agents: 7 of 7 max
- Waves: 2 of 4 max
- Concurrent in any one wave: 5 of 5 max
