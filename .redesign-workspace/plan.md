# Orchestration Plan — Redesign Phase 0

## Scope decision
The full implementation plan is a ~28-PR sequential, gated migration. It cannot be run as one
orchestration (exceeds 7-agent/4-wave limits; phases strictly depend on each other; several gates
need human/staging verification). This orchestration executes **Phase 0 — Foundations (PR 0.1)** only,
on branch `codex/redesign-p0-foundations` (reversible, unmerged). Gate + report before Phase 1.

## Work streams
| # | Role | Wave | Depends on | Outputs |
|---|------|------|------------|---------|
| 1 | Foundations Engineer | 1 | none | Implemented Phase 0 (fonts, tokens, base, Tailwind theme, legacy shims, stale-name codemod) + commit + handoff |
| 2 | Verification Reviewer | 2 | Agent 1 | Independent pass/fail report against spec §3 + plan §E acceptance |

Plus Stage-2 adversarial review (codex-qa-review, Mode C spec-compliance) per skill §8.

## Wave structure
- Wave 1: Foundations Engineer (builds the whole coupled PR — one owner for globals.css + tailwind.config + layout + codemod ensures consistency).
- Wave 2: Verification Reviewer (read-only verification) + codex-qa-review.

## Gate
After Wave 2: report Phase 0 result, then STOP and confirm with the user before Phase 1.
