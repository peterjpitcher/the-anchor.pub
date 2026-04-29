# Claude Hand-Off Brief: SEO Growth Plan v2.0

**Generated:** 2026-04-21
**Review mode:** C (Spec Compliance)
**Overall risk:** Medium — plan is strategically sound, 7 spec revisions needed before implementation

---

## DO NOT REWRITE

- Phase 0 sequencing (robots before schema) — confirmed correct by all 4 reviewers
- Three-layer model (Technical → Intent → Conversion) — structurally sound
- Data-driven landmark page approach (lib/local-seo-data.ts) — architecturally correct
- Meta title/description recommendations — specific, well-reasoned, correct character counts
- "What NOT To Do" section — all constraints are valid

---

## SPEC REVISIONS REQUIRED

- [ ] **REV-1:** Split Phase 0 into two commits: (a) robots.ts CSS fix, (b) test page deletions. Update plan text at Phase 0.2 to make this explicit.
- [ ] **REV-2:** Phase 2.1 blog CTA — change from "add to blog template" to "add to blog template, conditional on post tags (heathrow, plane-spotting, food, near-heathrow)". Source prices from SSOT.json, not hardcoded values.
- [ ] **REV-3:** Phase 2.6 per-event booking — add failure states: past events = no CTA, cancelled = "Cancelled" badge, unavailable dates = generic /book-table link without date prefill, API failure = graceful degradation to phone CTA.
- [ ] **REV-4:** Phase 2.4 wakes enquiry — change "embed a lightweight enquiry form" to "reuse existing PrivateHireEnquiry component from /private-hire, ensuring Turnstile, validation, and management API proxy are preserved". If component isn't embeddable, use deep link `/private-hire?source=wakes#enquiry`.
- [ ] **REV-5:** Phase 2.5 quiz booking — add prerequisite: "Before implementing, verify app/book-table/page.tsx reads `date` and `purpose` from searchParams. Handle invalid/unavailable dates by falling back to generic form."
- [ ] **REV-6:** 90-Day Success Metrics — add note: "Estimates are projections based on (current impressions x target CTR). Actual results depend on Google re-evaluating snippets, impression stability, and seasonal variation."
- [ ] **REV-7:** Phase 4 schema additions — add acceptance criteria: "Each schema change must pass Google Rich Results Test before deployment."

---

## IMPLEMENTATION CHANGES REQUIRED

None — this is a plan review. Implementation verification items are listed in the adversarial review for checking during coding.

---

## ASSUMPTIONS TO RESOLVE

- [ ] Does `/book-table` support `date` and `purpose` query params? Check `app/book-table/page.tsx` searchParams handling.
- [ ] Is the PrivateHireEnquiry component on `/private-hire` extractable as a reusable component?
- [ ] What tags/categories exist in the blog content model that can gate the conditional CTA?
- [ ] Does `lib/local-seo-data.ts` have TypeScript types that enforce required fields for new landmarks?

---

## REPO CONVENTIONS TO PRESERVE

- One concern per changeset (split Phase 0)
- All mutations through management API proxy (`app/api/*/route.ts`)
- Turnstile spam protection on all public forms
- SSOT.json as source of truth for operational claims in copy
- `kitchen: null` means closed (use `??` not `||`)

---

## RE-REVIEW REQUIRED AFTER FIXES

- [ ] REV-2: Re-review blog template CTA implementation to confirm conditional gating works
- [ ] REV-4: Re-review wakes enquiry to confirm API proxy boundary is preserved
- [ ] REV-5: Re-review booking param support after verifying searchParams handling

---

## REVISION PROMPT

Apply these 7 revisions to the SEO growth plan at `docs/superpowers/plans/2026-04-21-gsc-performance-enhancement-plan.md`:

1. Phase 0: Split into 0.1 (robots.ts fix only) and 0.2 (test page deletions, sitemap/audit cleanup — separate commit)
2. Phase 2.1: Blog CTA is conditional on post tags (heathrow, plane-spotting, food, near-heathrow). Prices from SSOT.json.
3. Phase 2.4: Reuse existing PrivateHireEnquiry component, not a new form. Specify Turnstile/validation/API proxy preservation.
4. Phase 2.5: Add prerequisite to verify booking params. Add invalid-date fallback.
5. Phase 2.6: Add stale-date handling — past=no CTA, cancelled=badge, unavailable=generic link, API failure=phone CTA.
6. 90-Day Success Metrics: Note estimates are projections assuming stable impressions.
7. Phase 4: Add "must pass Google Rich Results Test" acceptance criteria.
