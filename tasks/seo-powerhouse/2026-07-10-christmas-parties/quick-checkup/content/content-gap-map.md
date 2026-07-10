# Christmas Parties Content Gap Map

Date: 2026-07-10  
Scope: page-level gaps, not net-new page generation

Observed competitor pages commonly place package or menu choices, capacity, booking terms and the next action close together. The Anchor already has most source material. Its gaps are primarily hierarchy, accuracy and conversion gaps.

| ID | Missing or weak content | Searcher intent | Observed competitor pattern | What this page needs | Priority | Effort | Decision |
|---|---|---|---|---|---|---|---|
| GAP-01 | Two clear booking routes | Choose a party venue or book a festive meal | Party pages lead with packages/enquiry; meal pages lead with menu/terms/booking | Two above-fold cards: `Christmas party` and `Sit-down lunch or dinner, pre-order only` | Critical | Small | Do now |
| GAP-02 | Concise booking facts | Confirm suitability before enquiring | Scannable capacity, terms and access facts near CTA | One visible block with Christmas capacity, buffet threshold, deposit, pre-order rule, live pricing and parking | High | Small | Do now |
| GAP-03 | Meal-specific process | Request lunch or dinner and understand what is required | Festive meal pages make service, menu and terms explicit | Lunch/dinner selector, pre-order condition, dietary capture and confirmed deadline wording | High | Medium | Do now |
| GAP-04 | Party-specific process | Explain desired party format without being forced into a guest-count label | Venue pages ask format, capacity, inclusions and availability | Party choice independent of headcount, with buffet, sit-down, drinks and entertainment preferences | High | Medium | Do now |
| GAP-05 | Accurate current pricing route | Understand likely cost without seeing stale prices | Competitors show current packages or a direct quote route | `Ask for current pricing` CTA and no unapproved hardcoded menu or add-on prices | High | Small | Do now |
| GAP-06 | Source-backed trust | Decide whether to trust the venue | First-party venue detail and recognisable proof | Verify testimonial sources and operational promises, or use the approved current rating without a hardcoded review count | Medium | Small | Schedule |
| GAP-07 | Lean decision journey | Reach the enquiry without reading a long guide | Scannable landing pages, not long editorial guides | Keep offer, menu, facts, proof, terms and FAQs; merge duplicated corporate/ideas/urgency copy after approval | Medium | Medium | Schedule |
| GAP-08 | Measured page ownership | Know which URL owns which query cluster | Distinct transactional and informational pages | GSC query comparison for main, corporate and budget URLs before merge, redirect or major retargeting | Medium | Small | Monitor |

## Gap detail

### GAP-01: Two-route decision block

- **Placement:** Immediately below the hero or as the hero actions.
- **Party card:** Formats, group size, date and availability. CTA: `Plan a Christmas party`.
- **Meal card:** Sit-down lunch or dinner, menu and dietary needs. CTA: `Request a festive lunch or dinner`.
- **Mandatory helper:** `Pre-order only` must be visible before the meal form opens.
- **Acceptance:** A visitor can identify and start either journey without scrolling through package copy.

### GAP-02: Extractable booking facts

Recommended answer block:

> The Anchor hosts Christmas parties plus sit-down festive lunches and dinners near Heathrow. Sit-down Christmas meals are available by pre-order only. Christmas capacity is up to 60 seated or 200 standing, depending on layout and date. Festive buffets are available for 26 or more guests. Every Christmas menu booking requires a £10 per person non-refundable deposit. Ask for the current menu, pricing and availability when you enquire.

This block is useful to visitors and answer engines only if every sentence remains visible, current and matched by any retained schema.

### GAP-03 and GAP-04: Matching form language

The content promise and form taxonomy should match:

| Journey | Required content/fields |
|---|---|
| Party | Preferred date, approximate guests, party format/preferences, food or drinks needs, entertainment, notes |
| Sit-down meal | Lunch or dinner, preferred date/time, guests, dietary needs, acknowledgment that pre-order is required |

Guest count can guide the recommended format, but should not replace the visitor's intent.

### GAP-06: Proof controls

Before keeping a testimonial, exact response-time promise, sell-out claim, booking deadline or service condition, record its owner-approved source and confirmation date. If a source is not available, use neutral wording or omit the claim in the later approved pruning pass.

## What not to create yet

- No separate Christmas lunch URL.
- No separate Christmas dinner URL.
- No additional Heathrow or Staines location pages.
- No redirect or merge of the corporate page.

No demand, query split or backlink evidence exists to justify those changes.

```json
{"findings":[{"finding":"The page lacks an early self-contained booking-facts answer for the two offers and their conditions.","evidence":"The live crawl in evidence/page-metadata.csv shows 4,569 words, while the core facts are dispersed across the hero, buffet, booking essentials, rooms and FAQ sections; docs/SSOT.md:195,222-223 and SSOT.json:862 provide the approved deposit, capacity and buffet facts.","source":"collect-site-evidence.py and manual SSOT inspection","dataStatus":"Known","severity":"High","confidence":"High","impactArea":"conversion","owner":"Content","effort":"Small","dependencies":"Developer and SSOT review","fixType":"One-off page fix","recommendedAction":"Add one visible early block covering party versus meal, pre-order only, Christmas capacity, buffet threshold, deposit, live pricing and parking.","validationStep":"Confirm each fact is visible, matches the SSOT and matches any retained schema.","riskRollback":"Remove the block if a newer approved source changes the underlying facts."},{"finding":"The content promise for sit-down Christmas lunch and dinner is not matched by meal-specific booking guidance and form choices.","evidence":"app/christmas-parties/page.tsx:187-188 promises lunch and dinner, while app/christmas-parties/client-components.tsx:1365-1402 and the enquiry UI use dinner up to 25 versus buffet 26+; the owner requires sit-down lunch and dinner to be pre-order only.","source":"Owner requirement and manual code inspection","dataStatus":"Known","severity":"Critical","confidence":"High","impactArea":"revenue","owner":"Content","effort":"Medium","dependencies":"UX, developer and enquiry recipient","fixType":"Template/system fix","recommendedAction":"Create a meal journey that selects lunch or dinner, states pre-order only and captures dietary needs, while keeping party format separate from headcount.","validationStep":"Complete one lunch, one dinner and one party enquiry and verify the visible wording and received details.","riskRollback":"Preserve backward-compatible payload mapping and restore the prior form if downstream handling fails."},{"finding":"Source-backed trust content is incomplete because several testimonials and operational promises have no approved evidence in the workspace.","evidence":"app/christmas-parties/client-components.tsx:1283-1306 contains three attributed testimonials and lines 1315-1367 contain sell-out and response-time claims; no source record was found in the reviewed SSOT evidence.","source":"Manual code and workspace evidence review","dataStatus":"unavailable","severity":"Medium","confidence":"High","impactArea":"conversion","owner":"Editorial","effort":"Small","dependencies":"Business owner confirmation","fixType":"Content process fix","recommendedAction":"Create a dated source record for retained proof and promises, otherwise replace them with neutral approved wording.","validationStep":"Audit every testimonial and operational promise against the source record before publish.","riskRollback":"Reinstate removed proof only after its source and permission are confirmed."}]}
```
