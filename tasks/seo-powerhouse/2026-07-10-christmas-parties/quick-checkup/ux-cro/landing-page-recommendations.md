# Landing Page Recommendations

Date: 2026-07-10  
Page: `/christmas-parties`

## Recommended page order

Keep the current two-choice hero. The clearest conversion order is:

1. Hero with `Plan a Christmas party` and `Request lunch or dinner`.
2. Two booking-choice cards and the four key facts.
3. Current-pricing explanation.
4. A short party-options section and a short festive-meal section.
5. Spaces, capacity, parking and booking terms.
6. Verified social proof.
7. Six to eight decision-critical FAQs.
8. Final two-route CTA.

The present page contains the right information, but repeats packages, location proof, corporate benefits, party ideas, terms and CTAs across a very long page. Larger pruning should be approval-gated because GSC query coverage is unavailable.

## Implementation Tickets

### UX-001: Simplify the enquiry drawer

Owner: UX  
Status: Implemented during audit  
Approval bucket: Pre-approved small fix  
Priority score: Unscored, no behaviour data  
Expected clicks delta: no demand source  
Source evidence: `app/christmas-parties/client-components.tsx`, mobile drawer screenshot

Problem:  
Party/meal was shown twice before the form began, and selected states relied on colour.

Why it matters:  
Removing repetition shortens the mobile path without removing any qualifying information.

Implementation notes:  
Completed in the shared source: one party/meal control remains, selected buttons use `aria-pressed`, and meal-only terms stay conditional.

Acceptance criteria:

- [ ] One party/meal selector appears in the drawer.
- [ ] Its selected value is exposed to assistive technology.
- [ ] Lunch/dinner, deposit and pre-order wording remain visible before meal submission.
- [ ] Party style remains available for party submissions.

Validation:  
Check keyboard, screen-reader snapshot and layouts at 320 x 568, 390 x 844, 768 and 1440.

Risk and rollback:  
If users miss the selector, move the retained control higher rather than restoring a duplicate.

### UX-002: Make submission confirmation unmistakable

Owner: UX  
Status: Implemented and browser-verified  
Approval bucket: Pre-approved small fix  
Priority score: Unscored, no completion data  
Expected clicks delta: no demand source  
Source evidence: `app/christmas-parties/client-components.tsx:1512-1554`

Problem:  
The original drawer closed before visitors could see the successful outcome.

Why it matters:  
Visitors need to know the request was sent so they do not resubmit or call unnecessarily.

Implementation notes:  
Completed in the shared source: a dedicated success panel replaces the form. A mocked 200 response at 390 x 844 showed the success alert at `y=86`, drawer open, scroll position zero and one dialog. No real enquiry was sent.

Acceptance criteria:

- [ ] A mocked 200 response shows the confirmation in the visible viewport.
- [ ] The confirmation receives focus or is announced.
- [ ] Double submission is impossible after success.
- [ ] No live email or management record is created during the test.

Validation:  
Intercept `/api/enquiry/christmas` locally and test party, lunch and dinner at short mobile and desktop heights.

Risk and rollback:  
If a dedicated state prevents a follow-up edit, retain an `Edit details` action or restore the form after the user deliberately chooses it.

### UX-003: Preserve journey intent in the global sticky CTA

Owner: UX  
Status: Implemented  
Approval bucket: Pre-approved small fix  
Priority score: Unscored, no sticky-CTA conversion data  
Expected clicks delta: no demand source  
Source evidence: `components/layout/StickyCtas.tsx:145-161`

Problem:  
The neutral `Christmas enquiry` label previously always opened party mode.

Why it matters:  
A meal visitor who has already chosen lunch or dinner should not be reset to a different journey.

Implementation notes:  
A mode-free event now reopens the current in-page state, with party retained as the first-visit default.

Acceptance criteria:

- [x] Sticky CTA preserves meal after a meal interaction.
- [x] Sticky CTA preserves party after a party interaction.
- [x] A first-time visitor sees the party default and can switch immediately in the drawer.

Validation:  
Test open, close, scroll and reopen for both journeys on mobile and desktop.

Risk and rollback:  
If preserving state produces stale choices across visits, keep it session-only.

### UX-004: Prepare an evidence-led page-shortening pass

Owner: Editorial  
Status: Schedule  
Approval bucket: High-risk approval required  
Priority score: Unscored, GSC and GA4 unavailable  
Expected clicks delta: no demand source  
Source evidence: `evidence/page-metadata.csv` and local browser document height

Problem:  
The live baseline has 4,569 words, 20 FAQs and a roughly 16,100 px desktop document. Several sections repeat similar party, location and organiser messages.

Why it matters:  
A shorter decision path may improve engagement and enquiry completion, but destructive pruning without query data can remove useful search coverage.

Implementation notes:  
Hand the page to `page-cro` with a keep, merge and remove diff. Keep offer choices, current pricing, menu summary, capacity, access, terms, verified proof and six to eight booking FAQs. Save all removed copy for rollback.

Acceptance criteria:

- [ ] Every retained operational claim has a source.
- [ ] No required party or meal detail is lost.
- [ ] Primary CTAs remain available at logical decision points.
- [ ] The change has a content rollback file and a GSC/GA4 monitoring plan.

Validation:  
Compare headings, word count, internal links, mobile screenshots and qualified enquiry data after enough traffic accrues.

Risk and rollback:  
The page already appears for relevant commercial intent in manual search. Restore saved sections if validated query coverage or qualified enquiry performance declines.

## Trust recommendations

- Keep the clear £10 per-person non-refundable deposit and pre-order-only wording.
- Keep parking, Heathrow proximity and Christmas capacity close to the first choice cards.
- Retain the three named testimonials only if the business has a source and permission record for each quote. Otherwise replace them with verifiable reviews or remove the section.
- Avoid countdowns, discounts, sell-out claims or response-time promises unless each has a current approved source and expiry date.
- Change any CTA that implies a date is locked before availability and deposit are confirmed to `Enquire about your date`.

```json
{"findings":[{"finding":"The page is much longer than needed for the two primary booking decisions, with repeated package, location, organiser, idea and FAQ content between the opening and final CTA.","evidence":"tasks/seo-powerhouse/2026-07-10-christmas-parties/evidence/page-metadata.csv records 4,569 words and 20 FAQ questions; a local 1200 x 886 Playwright render measured about 16,100 px document height.","source":"collect-site-evidence.py and Playwright browser measurement","dataStatus":"Known","severity":"Medium","confidence":"Medium","impactArea":"conversion","owner":"Editorial","effort":"Medium","dependencies":"GSC and GA4 evidence, content approval and page-cro handoff","fixType":"Content process fix","recommendedAction":"Create an approval-gated keep, merge and remove diff that preserves the two offers, current-pricing process, menu summary, capacity, access, terms, verified proof and six to eight decision-critical FAQs.","validationStep":"Compare heading count, word count, internal links and mobile layout, then monitor qualified enquiries and GSC query coverage after release.","riskRollback":"Save every removed section and restore it if validated search coverage or qualified enquiry performance declines."},{"finding":"The three Christmas testimonials do not have a source or permission record in the reviewed page evidence.","evidence":"app/christmas-parties/client-components.tsx hardcodes three attributed Christmas quotes; repository search finds the same wording only in content/copy-decks/christmas-parties-2026-seo-rewrite.md and the page component, not in a review-source record.","source":"Repository search and manual content inspection","dataStatus":"unavailable","severity":"Medium","confidence":"High","impactArea":"UX","owner":"Editorial","effort":"Small","dependencies":"Business owner or review-platform source","fixType":"Content process fix","recommendedAction":"Verify the source, wording and publication permission for each testimonial, or replace the section with traceable reviews.","validationStep":"Store a source URL or internal permission record for every displayed quote and confirm the published wording matches it.","riskRollback":"Remove unverified quotes; restore them only when provenance is documented."}]}
```
