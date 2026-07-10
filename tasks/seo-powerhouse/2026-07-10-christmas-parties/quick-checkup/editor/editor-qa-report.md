# Content Quality Audit

Date: 2026-07-10  
Page: `/christmas-parties`  
Review: final source review after claim cleanup

## Release verdict

**Pass for the implemented work, excluding the two approval-gated items below.**

No remaining editor or content QA blocker was found in the refreshed page source. The page now has a clear party journey, a clear sit-down lunch/dinner journey, prominent pre-order wording, SSOT-aligned deposits and capacities, qualified live-pricing language, consistent location facts and accessible enquiry overlays.

Final deployment is still conditional on explicit decisions for the Event schema and testimonials.

## Approval gates

| Gate | Current evidence | Required decision and acceptance criteria |
|---|---|---|
| Event and Offer schema | `app/christmas-parties/page.tsx:30-170` still exposes hardcoded food prices, hidden packages and 10 to 150 guests. This conflicts with the visible live-pricing position and Christmas capacity of 60 seated or 200 standing. | Approve accurate non-priced page/service markup, or supply a current approved event source. Rendered JSON-LD must contain no hidden stale price, unsupported package or conflicting capacity. |
| Three Christmas testimonials | `app/christmas-parties/client-components.tsx:1087-1112` still contains three five-star quotes. Their only located repository source is a copy deck marked `Ready for review`. | Supply original review URLs, exact wording and permission records, or approve removal. If retained, replace the testimonial component's em-dash separator with punctuation allowed by the customer-copy rule. |

## Final source checks passed

- Detailed unsourced menu dishes, add-ons and the contradictory vegan wording have been removed.
- The sit-down meal section now asks users to request the current menu and pricing.
- The food-safety waiver, supplier-insurance and bar-tab workflow promises have been removed or qualified.
- Every visible Staines travel-time reference now says around eight minutes, matching the SSOT.
- The unsupported 1 October countdown has been removed.
- The 1 November to 23 December 2026 service window is recorded in both SSOT files.
- Taxi fare, mini-coach, fixed table-duration and late-bar claims have been removed.
- Buffet selection, pricing and timings are clearly confirmed on enquiry.
- The visible page does not hardcode a food price.
- The two booking routes are clear near the top and throughout the enquiry flow.
- `Pre-order only` is prominent for sit-down Christmas lunches and dinners.
- The £10 per person non-refundable Christmas menu deposit matches the SSOT.
- Christmas capacity is consistently up to 60 seated or 200 standing.
- The lightbox has dialog semantics, Escape handling, focus entry/return and focus containment.
- Party/meal and lunch/dinner controls expose their selected state with `aria-pressed`.
- Image alt text, form labels, heading hierarchy and link labels reviewed are clear.

## Page-level quality assessment

| Page | Accuracy | Clarity | Usefulness | Voice | Trust | AI readiness | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/christmas-parties` | 4/5 | 4/5 | 4/5 | 4/5 | Pending testimonial gate | Pending schema gate | Implementation pass |

These are editorial quality scores, not search-performance metrics. GSC, GA4 and keyword-tool data remain unavailable.

## Final validation after gate decisions

- Inspect every rendered JSON-LD block after the schema decision.
- Confirm every retained testimonial against its original source and permission record.
- Re-run the build and page tests.
- Keyboard-test the drawer and lightbox in the final build.
- Complete one party, one Christmas lunch and one Christmas dinner enquiry on desktop and mobile.

```json
{"findings":[{"finding":"Event and Offer JSON-LD still publishes hardcoded prices, hidden packages and a Christmas capacity that conflicts with visible approved facts.","evidence":"app/christmas-parties/page.tsx:30-170 hardcodes Event offers and add-on prices and describes 10 to 150 guests; docs/SSOT.md:3-7 requires live food pricing and docs/SSOT.md:224-225 gives Christmas capacity as 60 seated or 200 standing.","source":"Manual code and SSOT inspection","dataStatus":"Known","severity":"Critical","confidence":"High","impactArea":"AI visibility","owner":"Technical","effort":"Small","dependencies":"Explicit schema approval and developer","fixType":"One-off page fix","recommendedAction":"Replace the stale Event/Offer block with accurate non-priced markup, or regenerate a real event only from a current approved source.","validationStep":"Inspect every rendered JSON-LD block and confirm no hidden price, unsupported package or conflicting capacity remains.","riskRollback":"Keep the old block in version control only; restore it only if every claim is verified and visible."},{"finding":"Three attributed five-star Christmas testimonials still have no traceable original review or permission source.","evidence":"app/christmas-parties/client-components.tsx:1087-1112 contains the quotes; the only located duplicate is content/copy-decks/christmas-parties-2026-seo-rewrite.md:343-351, whose header says Ready for review.","source":"Repository search and manual inspection","dataStatus":"unavailable","severity":"Critical","confidence":"High","impactArea":"conversion","owner":"Editorial","effort":"Small","dependencies":"Explicit content approval or approved live review source","fixType":"Content process fix","recommendedAction":"Supply exact original sources and permission records, or approve removal before deployment; if retained, also remove the em-dash separator inserted by the testimonial component.","validationStep":"Record source URL, exact wording, attribution and permission for every retained quote, then inspect rendered punctuation.","riskRollback":"Re-add only verified reviews from an approved source."}]}
```
