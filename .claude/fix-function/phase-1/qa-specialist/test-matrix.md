# FAQ Accordion Test Matrix

## Component Under Test
- `components/FAQAccordionWithSchema.tsx` (primary -- used by all 70+ pages)
- `components/FAQAccordion.tsx` (base -- unused, zero imports from pages)

## Test Data Reference
- Body background: `#0c1d11` (anchor-bg, set on html/body in globals.css)
- Card background: `#172d1e` (card-dark class in globals.css)
- Cream text: `#f0e6c6` (anchor-cream-text token, body default colour)
- Gold vivid: `#c9a020` (anchor-gold-vivid token)
- Section default className: `""` (empty string) -- inherits body bg `#0c1d11`

---

## TC-01: Default background (no className prop)

| Field | Value |
|---|---|
| **Priority** | P0 -- Critical |
| **Precondition** | Render `<FAQAccordionWithSchema faqs={data} />` with no className |
| **Code path** | `className=""` default -> `section` gets class `section-spacing ` (trailing space) |
| **Expected** | Section inherits body bg `#0c1d11`; cream text `#f0e6c6` visible (contrast ~10:1) |
| **Actual** | PASS -- no background override, body bg shows through |
| **Pages using this** | ~60 pages (majority) |

## TC-02: Passing className="bg-anchor-bg"

| Field | Value |
|---|---|
| **Priority** | P1 -- High |
| **Precondition** | Render with `className="bg-anchor-bg"` |
| **Code path** | Section class becomes `section-spacing bg-anchor-bg` -> `#0c1d11` |
| **Expected** | Explicit bg matches body bg; cream text visible; no visual difference from TC-01 |
| **Actual** | PASS -- redundant but harmless. 9 pages use this pattern. |
| **Pages** | bank-holiday-weekends, st-patricks-day, fathers-day, easter, bonfire-night, halloween, new-years-eve, boxing-day, valentines-day, mothers-day, music-bingo |

## TC-03: Passing className="bg-white" -- THE BUG

| Field | Value |
|---|---|
| **Priority** | P0 -- Critical |
| **Precondition** | Render with `className="bg-white"` |
| **Code path** | Section class becomes `section-spacing bg-white` -> `#ffffff` background |
| **Expected** | Should NOT produce literal white bg, or component should reject/override it |
| **Actual** | **FAIL** -- `bg-white` applies `#ffffff`. Cream text `#f0e6c6` on white = ~1.1:1 contrast ratio. Nearly invisible. WCAG AAA requires 7:1, AA requires 4.5:1. |
| **Defect** | DEF-01 (Critical) |
| **Pages** | `karaoke/page.tsx:548`, `live-music/page.tsx:556`, `cash-bingo/page.tsx:547`, `quiz-night/page.tsx:623` |

## TC-04: FAQ schema JSON-LD renders correctly

| Field | Value |
|---|---|
| **Priority** | P1 |
| **Precondition** | Render with `renderSchema=true` (default) and 2 FAQ items |
| **Code path** | `faqSchema` built at L39-50 -> `jsonLdSafeStringify()` -> `<script type="application/ld+json">` |
| **Expected** | Script tag contains valid FAQPage schema with @context, @type, mainEntity array. Each entry has @type Question, name, acceptedAnswer with @type Answer and text. `<` chars escaped as `\u003c`. |
| **Actual** | PASS -- code path is correct. `jsonLdSafeStringify` escapes `<` to prevent XSS. |
| **Test coverage** | NOT TESTED in existing test file (all 3 tests use `renderSchema={false}`) |
| **Defect** | DEF-02 (Medium) -- No test coverage for the schema rendering path |

## TC-05: FAQ schema disabled with renderSchema={false}

| Field | Value |
|---|---|
| **Priority** | P2 |
| **Precondition** | Render with `renderSchema={false}` |
| **Code path** | `faqSchema` is `null` (L39 ternary). Guard at L55 `renderSchema && faqSchema &&` prevents script render. |
| **Expected** | No `<script type="application/ld+json">` in DOM |
| **Actual** | PASS -- double guard ensures no render |
| **Test coverage** | Implicitly tested (existing tests use `renderSchema={false}`) but no explicit assertion that script tag is absent |
| **Defect** | DEF-03 (Low) -- Should have explicit assertion |

## TC-06: Accordion expand/collapse

| Field | Value |
|---|---|
| **Priority** | P1 |
| **Precondition** | Render with 2+ FAQ items |
| **Code path** | Click button -> `toggleQuestion(index)` -> `setOpenIndex(isOpening ? index : null)` -> re-render with `maxHeight: '500px'` or `'0'` |
| **Expected** | Click opens item (maxHeight 500px, pb-4). Click again closes (maxHeight 0, max-h-0). Only one item open at a time. |
| **Actual** | PASS -- single-open accordion pattern works correctly |
| **Test coverage** | Partially tested (open/close verified via GTM mock assertions, not via DOM state) |
| **Defect** | DEF-04 (Low) -- No direct assertion on expanded/collapsed DOM state |

## TC-07: GTM tracking fires on expand

| Field | Value |
|---|---|
| **Priority** | P2 |
| **Precondition** | Render and click a question |
| **Code path** | `toggleQuestion()` L28-35 -> if `isOpening` -> `trackFaqItemOpened({ questionText, faqPagePath })` |
| **Expected** | Fires once on open with question text and window.location.pathname. Does NOT fire on collapse. |
| **Actual** | PASS |
| **Test coverage** | GOOD -- 3 existing tests cover: fires on open, does not fire on close, fires for different question when switching |
| **Note** | `faqPagePath` uses `window.location.pathname` with SSR guard (`typeof window !== 'undefined'`). In tests, will be empty string in jsdom. |

## TC-08: Text visibility -- cream text on background

| Field | Value |
|---|---|
| **Priority** | P0 -- Critical |
| **Precondition** | All rendering contexts |
| **Code path** | H2 title: `text-anchor-cream-text` (#f0e6c6). Answer text: `text-anchor-cream-text/70` (70% opacity). |
| **Expected** | Text clearly readable against any valid FAQ section background |
| **Actual** | **FAIL on bg-white pages.** Cream `#f0e6c6` on white `#ffffff`: contrast ~1.1:1. With 70% opacity answer text is even worse. On dark backgrounds: PASS (~10:1 contrast). |
| **Defect** | DEF-01 (same root cause as TC-03) |

## TC-09: Question text colour inconsistency between components

| Field | Value |
|---|---|
| **Priority** | P2 -- Medium |
| **Precondition** | Compare FAQAccordion.tsx vs FAQAccordionWithSchema.tsx |
| **Code path** | Base: `h3` uses `text-anchor-gold-vivid` (#c9a020). WithSchema: `h3` uses `text-anchor-cream-text` (#f0e6c6). |
| **Expected** | Consistent question heading colour across both components |
| **Actual** | **FAIL** -- Different colours. Base uses gold, WithSchema uses cream. Also: base has `rounded-none`, WithSchema has no rounding override. Base has `space-y-4`, WithSchema has `space-y-3`. |
| **Defect** | DEF-05 (Medium) -- Inconsistent question text colour. Base component is unused so low practical impact, but creates confusion if ever re-enabled. |
| **Additional** | SVG chevron colours also differ: base uses `text-anchor-gold`, WithSchema uses `text-anchor-gold-vivid` |

## TC-10: Accessibility -- aria-expanded, aria-controls, focus styles

| Field | Value |
|---|---|
| **Priority** | P1 |
| **Precondition** | Render and interact with FAQ items |
| **Code path** | Button: `aria-expanded={openIndex === index}`, `aria-controls={`faq-answer-${index}`}`. Answer div: `id={`faq-answer-${index}`}`. SVG: `aria-hidden="true"`. |
| **Expected** | aria-expanded true/false toggles correctly. aria-controls matches answer div id. Focus styles visible. |
| **Actual -- WithSchema** | PASS -- has focus styles: `focus:outline-none focus:bg-anchor-bg-raised focus:ring-2 focus:ring-anchor-gold focus:ring-inset` |
| **Actual -- Base** | **FAIL** -- NO focus styles on button. Only has `hover:bg-anchor-bg-raised`. Missing focus ring entirely. |
| **Defect** | DEF-06 (Medium) -- Base component lacks focus styles (mitigated by non-use) |
| **Test coverage** | NOT TESTED -- no aria-expanded assertions in existing tests |
| **Defect** | DEF-07 (Medium) -- No accessibility assertions in test suite |

---

## Summary

| TC | Status | Severity |
|---|---|---|
| TC-01 | PASS | -- |
| TC-02 | PASS | -- |
| TC-03 | **FAIL** | Critical |
| TC-04 | PASS (untested) | Medium gap |
| TC-05 | PASS (weak test) | Low gap |
| TC-06 | PASS (partial) | Low gap |
| TC-07 | PASS | -- |
| TC-08 | **FAIL** | Critical |
| TC-09 | **FAIL** | Medium |
| TC-10 | **PARTIAL FAIL** | Medium |
