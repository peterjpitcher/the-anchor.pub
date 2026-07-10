# Keyword and Intent Framework

Date: 2026-07-10  
Scope: `/christmas-parties`

No GSC, Keyword Planner or connected SEO-tool data was available. Coverage below is based on current page copy and manual SERP intent review. Volume, difficulty, ranking and traffic are unavailable. Exact new target terms remain **blocked on keyword-plan validation**.

## Page ownership

`/christmas-parties` should own local commercial and transactional intent for choosing either a Christmas party or a pre-order sit-down Christmas lunch/dinner at The Anchor. It should not become a general Christmas-planning guide.

| Tier | Cluster | Representative language | Intent | Page treatment | Current coverage | Validation status |
|---|---|---|---|---|---|---|
| 1 | Christmas party venue near Heathrow | Christmas party venue near Heathrow; Heathrow Christmas party venue | Commercial/transactional | Primary landing-page proposition and party enquiry | Strong wording coverage in title, H1 and body; performance unknown | Existing target language; GSC demand/position unavailable |
| 1 | Sit-down Christmas lunch or dinner | Christmas lunch near Heathrow; Christmas dinner near Heathrow; festive lunch Staines | Commercial/transactional | Equal primary route with menu, deposit, pre-order rule and service choice | Copy mentions lunch/dinner, but the form cannot select lunch | Exact term priorities blocked on keyword-plan validation |
| 1 | Work and office Christmas party | works Christmas party Heathrow; office Christmas party Staines | Commercial | Party package proof, organiser help, VAT/contact details and enquiry CTA | Covered in several sections; performance unknown | Exact term priorities blocked on keyword-plan validation |
| 2 | Local venue modifiers | Christmas party Staines; Christmas lunch Staines; Christmas party Stanwell Moor | Commercial/local | Natural location proof, directions, parking and travel times | Heathrow and Staines are prominent; Stanwell Moor is clearer in brand/location elements | Exact term priorities blocked on keyword-plan validation |
| 2 | Party format and group needs | private Christmas party; shared party night; Christmas buffet; private room | Commercial/transactional | Format choices within the party journey, not separate primary intents | Extensively covered, but buffet is incorrectly tied to 26+ in the form model | Demand and query ownership unavailable |
| 3 | Budget/planning advice | cheap Christmas party ideas near Heathrow; Christmas party planning | Informational/commercial research | Supporting article, linked to the commercial hub | Existing budget article is linked from the page | Query overlap must be checked in GSC |

## Intent-to-section map

| User need | Required answer on the page | Conversion |
|---|---|---|
| “Can you host our party?” | Christmas capacity, spaces, format, entertainment, parking and availability | Christmas party enquiry |
| “Can we book a festive lunch or dinner?” | Yes, lunch or dinner, sit-down, pre-order only, deposit and menu timing | Meal enquiry with lunch/dinner selected |
| “Is it easy for a Heathrow or Staines team?” | Travel time, free parking, ULEZ status and organiser support | Party enquiry or phone call |
| “What will it cost?” | Current approved pricing or a clear quote request; never stale hardcoded prices | Pricing/availability enquiry |
| “What do I need to do?” | Deposit, pre-order deadline, dietary process and response time | Completed enquiry |

## Guardrails

- Keep one primary phrase per title/H1 rather than listing party, dinner, party nights and lunch in one heading.
- Use “pre-order only” as a booking condition, not as repetitive keyword text.
- Do not create additional location or meal pages until GSC and Keyword Planner establish distinct demand and intent.
- Keep `/corporate-christmas-parties` for organiser-specific corporate detail and the budget article for planning advice, with the main page as the commercial hub.
- Remove unnatural search-query copy such as the FAQ about searching “xmas party near me”; local relevance should come from real venue facts.

```json
{"findings":[{"finding":"The page covers both party-venue and festive-meal language, but the two transactional intents are not mapped to equally complete conversion paths.","evidence":"evidence/page-metadata.csv records party, dinner and lunch language; app/christmas-parties/client-components.tsx:1381-1394 and 1547-1603 only offer dinner or buffet and evening-oriented selection.","source":"collect-site-evidence.py and manual code inspection","dataStatus":"Known","severity":"High","confidence":"High","impactArea":"conversion","owner":"Content","effort":"Medium","dependencies":"Content and developer","fixType":"One-off page fix","recommendedAction":"Give party and pre-order lunch/dinner separate above-the-fold choices and map every CTA to the correct form fields.","validationStep":"Check that each intent has a unique proposition, CTA and complete test submission path.","riskRollback":"Keep prior copy and form labels available for one-commit rollback."},{"finding":"Search demand and exact target-term priority cannot be validated because first-party and Keyword Planner data are unavailable.","evidence":"inputs/input-summary.md records GSC, rank-tracking and search-volume data as unavailable.","source":"SEO Powerhouse input summary","dataStatus":"unavailable","severity":"Medium","confidence":"High","impactArea":"SEO","owner":"Content","effort":"Small","dependencies":"GSC access and keyword-plan workflow","fixType":"Content process fix","recommendedAction":"Run keyword-plan validation before introducing new exact-match targets or creating additional Christmas location pages.","validationStep":"Attach Keyword Planner results and GSC query evidence to the framework, then confirm primary/secondary/local terms.","riskRollback":"Do not publish new keyword-led pages until validation is complete."}]}
```
