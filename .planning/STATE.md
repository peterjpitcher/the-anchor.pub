# Project State: The Anchor — Component Standardisation

**Last updated:** 2026-05-14
**Session:** Plan 02-02 executed (site-wide TestimonialSection deployment)

---

## Project Reference

**Core value:** Every page delivers a consistent, professional brand experience with full analytics coverage — no copy-pasted markup, no untracked interactions, no stale data.

**Current focus:** Phase 2 complete. Phases 3-5 consolidated into single Phase 3: Final Standardisation (CTA + tokens + BusinessHours + FindUsSection). Ready for Phase 3.

---

## Current Position

| Field | Value |
|-------|-------|
| Milestone | v1.0 Component Standardisation |
| Phase | 02-testimonialsection (complete) |
| Plan | 02 complete (2/2) |
| Status | Phase 2 complete, ready for Phase 3 (consolidated) |

**Progress:** `[X][X][ ]` -- 2/3 phases complete

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases defined | 3 |
| Requirements mapped | 18/18 |
| Plans written | 2 |
| Plans complete | 4 |

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
| 2026-05-14 | StarRating/TestimonialCard are internal sub-components | Not exported — only used within TestimonialSection; keeps public API minimal |
| 2026-05-14 | Pull-quote uses text-based rating, not star icons | "rated 5/5" in attribution text per UI spec; cleaner for single-quote layout |

### Spec reference

- Spec written after full component audit: `docs/component-standardisation.md`
- Items 9 and 10 already consistent — no work needed (AlertBox, InternalLinkingSection, OrganicSearchClusterLinks)
- Priority order from spec: analytics gaps → brand consistency → DRY cleanup → conversions → visual consistency → UX → new features → data freshness

### Todos

- [x] Run `/gsd:discuss-phase 1` to capture Phase 1 context
- [x] Run `/gsd:plan-phase 1` to plan Phase 1
- [x] Execute Plan 01-01 (PhoneLink icon fix + HeroBadge rebuild)
- [x] Execute Plan 01-02 (site-wide migration)
- [x] Execute Plan 02-01 (TestimonialSection component build)
- [x] Execute Plan 02-02 (site-wide TestimonialSection deployment)

### Blockers

(None)

---

## Session Continuity

**To resume:** Read this file and ROADMAP.md. Phase 2 complete. Phases 3-5 consolidated into Phase 3: Final Standardisation (11 reqs).
**Last session:** 2026-05-14T13:19:10Z
**Stopped at:** Completed 02-02-PLAN.md

**Worktree:** `admiring-dhawan-3da8c8`
**Branch:** `claude/admiring-dhawan-3da8c8`

---

*State initialised: 2026-05-14*
