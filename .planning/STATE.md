# Project State: The Anchor — Component Standardisation

**Last updated:** 2026-05-14
**Session:** Plan 01-02 executed (Phase 1 complete)

---

## Project Reference

**Core value:** Every page delivers a consistent, professional brand experience with full analytics coverage — no copy-pasted markup, no untracked interactions, no stale data.

**Current focus:** Phase 1 complete. All phone links tracked, all hero badges standardised. Ready for Phase 2.

---

## Current Position

| Field | Value |
|-------|-------|
| Milestone | v1.0 Component Standardisation |
| Phase | 01-tracking-herobadge (complete) |
| Plan | 02 complete (2/2) |
| Status | Phase 1 complete, ready for Phase 2 |

**Progress:** `[X][ ][ ][ ][ ]` -- 1/5 phases complete

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases defined | 5 |
| Requirements mapped | 18/18 |
| Plans written | 2 |
| Plans complete | 2 |

---

## Accumulated Context

### Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-14 | Phase 1 groups TRACK + COMP-01 (HeroBadge) | Both are low-effort new component creation tasks; shipping together keeps the first phase fast |
| 2026-05-14 | Phase 5 for FindUsSection last | It is a new standalone component with no dependencies on other phases; deferring reduces blast radius if spec changes |
| 2026-05-14 | Phase 3 depends on Phase 1 only | CTA work is independent of Testimonial; parallelisable in theory but sequenced for focus |
| 2026-05-14 | DATA-01 grouped with DS-01–04 in Phase 4 | Both are site-wide audit-and-replace tasks; doing them together in one sweep is more efficient |
| 2026-05-14 | Added ItemBadge export for backward compatibility | ManagersSpecial and MenuRenderer use old HeroBadge API directly; ItemBadge preserves that API via Badge primitive |
| 2026-05-14 | HeroBadge is a Server Component | Trust badges have no interactivity; no 'use client' needed |
| 2026-05-14 | PhoneLink showIcon=false for mid-sentence links | Icon breaks text flow when phone number is inline in a sentence |
| 2026-05-14 | Source names use page-name_location convention | Clear GTM attribution e.g. drinks_cta, heathrow-parking_terms |

### Spec reference

- Spec written after full component audit: `docs/component-standardisation.md`
- Items 9 and 10 already consistent — no work needed (AlertBox, InternalLinkingSection, OrganicSearchClusterLinks)
- Priority order from spec: analytics gaps → brand consistency → DRY cleanup → conversions → visual consistency → UX → new features → data freshness

### Todos

- [x] Run `/gsd:discuss-phase 1` to capture Phase 1 context
- [x] Run `/gsd:plan-phase 1` to plan Phase 1
- [x] Execute Plan 01-01 (PhoneLink icon fix + HeroBadge rebuild)
- [x] Execute Plan 01-02 (site-wide migration)

### Blockers

(None)

---

## Session Continuity

**To resume:** Read this file and ROADMAP.md. Phase 1 complete. Start Phase 2 planning.
**Last session:** 2026-05-14T11:52:31Z
**Stopped at:** Completed 01-02-PLAN.md (Phase 1 complete)

**Worktree:** `admiring-dhawan-3da8c8`
**Branch:** `claude/admiring-dhawan-3da8c8`

---

*State initialised: 2026-05-14*
