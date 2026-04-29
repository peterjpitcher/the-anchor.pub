# Adversarial Review: SEO Growth Plan v2.0

**Date:** 2026-04-21
**Mode:** C (Spec Compliance)
**Scope:** `docs/superpowers/plans/2026-04-21-gsc-performance-enhancement-plan.md`
**Pack:** `tasks/codex-qa-review/2026-04-21-seo-growth-plan-review-pack.md`
**Reviewers:** Assumption Breaker, Spec Trace Auditor, Integration & Architecture, Workflow & Failure-Path

---

## Executive Summary

The plan is strategically sound — correct sequencing (robots before schema), correct architecture (no database writes, API proxy respected), and correct identification of the traffic-to-conversion gap. However, 7 spec revisions are needed before implementation. The most critical are: blog CTAs must be conditional (not global template), event booking links need stale-date handling, and the wakes enquiry form must reuse existing components rather than creating new API surface. Most "needs verification" findings are expected for a plan review and will resolve during implementation.

---

## What Appears Solid

- **Phase 0 sequencing** — Robots/CSS rendering fix correctly identified as a prerequisite that unblocks all schema and rich result work
- **Three-layer model** — Technical Foundation → Intent Alignment → Traffic Conversion is the right structure
- **No database writes** — All proposed changes stay within the website's architecture (mutations via management API proxy)
- **Data-driven landmark pages** — Adding to `lib/local-seo-data.ts` instead of duplicating templates is architecturally correct
- **Conversion layer addition** — Original plan's biggest gap (no CRO) is now addressed

---

## Spec Revisions Required (7 corrections)

### REV-1: Split Phase 0 into two commits (ARCH-002)
**Severity:** Medium | **Confidence:** High
The plan groups the critical robots.txt CSS fix with the test page deletion cleanup. This violates the workspace convention of one concern per changeset and couples a critical rendering fix to unrelated cleanup. **Split into:** (a) robots.ts CSS fix + `/cdn-cgi/` disallow, (b) test page deletions + reference cleanup.

### REV-2: Blog CTA must be conditional, not global template (ARCH-003, WF-004)
**Severity:** High | **Confidence:** High
Phase 2.1 says "add contextual mid-content CTA block to blog template" but this would affect ALL ~100+ blog posts with a Heathrow lunch CTA — inappropriate on posts about tequila traditions or pet ownership. **Fix:** Make the CTA conditional on post category/tag (e.g., only show on posts tagged `heathrow`, `plane-spotting`, `food`, or `near-heathrow`). Also source prices from SSOT/verified copy, not hardcoded "£8.95".

### REV-3: Event booking links need stale-date handling (WF-002)
**Severity:** Medium | **Confidence:** High
Phase 2.6 adds per-event booking links on `/whats-on` but doesn't specify behaviour for past events, cancelled events, sold-out dates, or API failures. **Fix:** Define fallback — past events show no booking CTA, cancelled events show "Cancelled", unavailable dates link to generic `/book-table` without date prefill.

### REV-4: Wakes enquiry must reuse existing component (SPEC-007, WF-003, ARCH-005)
**Severity:** Medium | **Confidence:** High
Phase 2.4 says "embed a lightweight enquiry form" but doesn't specify which component or API route. Creating new form/API surface risks bypassing the management API proxy, Turnstile spam protection, and existing validation. **Fix:** Specify reuse of the existing `/private-hire` enquiry component and its API proxy route. If that component isn't embeddable, use a deep link to `/private-hire?source=wakes#enquiry` with the correct page context preserved.

### REV-5: Verify booking query params before implementation (SPEC-005, WF-001, AB-006)
**Severity:** Medium | **Confidence:** High
Phase 2.5 assumes `/book-table?date=YYYY-MM-DD&purpose=drinks` works. The booking wizard may use different param names, may not support `purpose=drinks` (only `food` and `drinks` are documented in the codebase), or may silently drop unknown params. **Fix:** Before implementing, verify `app/book-table/page.tsx` reads `date` and `purpose` from searchParams. Also handle invalid/unavailable dates gracefully.

### REV-6: CTR estimates are projections, not guarantees (AB-008, SPEC-003)
**Severity:** Low | **Confidence:** High
The plan states "+70-90 clicks/month" from meta rewrites without showing the calculation methodology. This is plausible but should be noted as a projection based on (current impressions x target CTR - current CTR). **Fix:** Add a note in the 90-Day Success Metrics section that estimates are projections assuming stable impression volumes, and actual results depend on Google re-evaluating snippets post-change.

### REV-7: Schema additions need acceptance criteria (SPEC-008)
**Severity:** Low | **Confidence:** Medium
Phase 4 proposes EventVenue, Restaurant/Menu, EventSeries, and LocalBusiness schema without specifying validation targets. **Fix:** Add acceptance criteria: each schema change must pass Google Rich Results Test and Schema.org validator before deployment.

---

## Implementation Verification Needed (at implementation time, not blocking plan)

These are expected "needs verification" items that resolve naturally during implementation:

| ID | Item | What to check |
|----|------|--------------|
| AB-001 | robots.ts fix works as expected | Test generated `/robots.txt` with Google's robots tester on a `?dpl=` CSS URL |
| AB-003 | Blog template structure supports mid-content CTA | Read `app/blog/[slug]/page.tsx` and content renderer |
| AB-004 | BookTableButton + CTASection are compatible | Read component signatures |
| AB-005 | `#booking-form` anchor exists on /book-table | Read page markup |
| AB-007 | local-seo-data.ts shape accepts new landmarks | Read data file schema |
| AB-010 | Redirect JSON editing won't create loops | Read both redirect files and loading order |

---

## Minor Observations

- The plan references `purpose=drinks` for quiz night bookings, but quiz attendees may also eat. Consider `purpose=drinks` vs leaving purpose unset to let users choose.
- `availabilityEnds` on `/sunday-lunch` Offer schema is hardcoded to `2026-12-31` — will go stale.
- `/book-table/page-old.tsx` still exists alongside `page.tsx` — confirm it's never routed.
- 8 single-post blog tags need manual review against `lib/tag-seo-content.ts` — this should be scheduled, not indefinitely deferred.

---

## Recommended Fix Order

1. Apply REV-1 (split commits) — structural, affects all Phase 0 work
2. Apply REV-2 (conditional blog CTA) — affects Phase 2.1 implementation
3. Apply REV-3 (stale-date handling) — affects Phase 2.5 and 2.6
4. Apply REV-4 (wakes enquiry reuse) — affects Phase 2.4
5. Apply REV-5 (verify booking params) — quick check before Phase 2.5
6. Apply REV-6 (estimate caveat) — documentation update
7. Apply REV-7 (schema validation criteria) — affects Phase 4
