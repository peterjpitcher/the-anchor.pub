# Roadmap: The Anchor — Component Standardisation

**Milestone:** v1.0 Component Standardisation
**Created:** 2026-05-14
**Granularity:** Standard (3 phases)

---

## Phases

- [x] **Phase 1: Tracking & HeroBadge** - Close phone analytics gaps and extract duplicated hero badge markup
- [x] **Phase 2: TestimonialSection** - Build and deploy a multi-variant testimonial component across all review pages
- [ ] **Phase 3: Final Standardisation** - CTA coverage, design tokens, BusinessHours component, and FindUsSection

---

## Phase Details

### Phase 1: Tracking & HeroBadge
**Goal**: Phone clicks are tracked in GTM and hero badge markup is DRY
**Depends on**: Nothing (first phase)
**Requirements**: TRACK-01, TRACK-02, COMP-01
**Success Criteria** (what must be TRUE):
  1. Clicking any inline phone number on any page fires a GTM tracking event
  2. PhoneLink renders visually as an inline text link (not a button) and accepts a className prop
  3. A HeroBadge component exists and all 10+ pages that previously had inline badge markup now use it
  4. No raw `tel:` href links remain outside the PhoneLink or PhoneButton components
**Plans:** 2 plans
Plans:
- [x] 01-01-PLAN.md — Fix PhoneLink icon, add PHONE_NUMBER constant, rebuild HeroBadge on Badge primitive
- [x] 01-02-PLAN.md — Site-wide migration of raw tel: links and inline badge markup

### Phase 2: TestimonialSection
**Goal**: All review/testimonial content uses a single consistent component
**Depends on**: Phase 1
**Requirements**: COMP-02, COMP-03, COMP-04, COMP-06
**Success Criteria** (what must be TRUE):
  1. A full-section variant displays a heading, subheading, and a grid of review cards
  2. A compact card-strip variant displays a horizontal strip of condensed cards suitable for mid-page use
  3. A single pull-quote variant displays one prominent review quote
  4. All ad-hoc testimonial/review markup across existing pages is replaced with one of the three TestimonialSection variants
  5. No pages contain hand-rolled review markup outside the TestimonialSection component
**Plans:** 2 plans
Plans:
- [x] 02-01-PLAN.md — Build TestimonialSection component with full, compact, pull-quote CVA variants + unit tests
- [x] 02-02-PLAN.md — Replace all 8 pages of hand-rolled testimonial markup with TestimonialSection

### Phase 3: Final Standardisation
**Goal**: CTA sections on all terminal pages, spacing tokens replace inline padding, static hours replaced with BusinessHours, and FindUsSection deployed
**Depends on**: Phase 1, Phase 2
**Requirements**: CONV-01, CONV-02, CONV-03, CONV-04, CONV-05, DS-01, DS-02, DS-03, DS-04, DATA-01, COMP-05
**Success Criteria** (what must be TRUE):
  1. Terminal subpages (T2, T3, T4, T5) each have a CTASection at the bottom of the page
  2. The reviews page has a CTASection prompting visitors to book
  3. All CTASections use a consistent primary/secondary button variant pairing (no mixed or inverted pairs)
  4. Location and hotel pages that were missing enableSmartCtas now have it enabled
  5. Service pages (food-menu, sunday-lunch, book-table) have enableSmartCtas enabled
  6. Three spacing utility classes exist in globals.css: `section-spacing`, `section-spacing-sm`, `section-spacing-lg`
  7. A site-wide search returns zero inline `py-16`, `py-20`, `py-24`, `py-8`, `py-12`, `py-32` classes on section elements (all replaced with tokens)
  8. Every page that previously showed hardcoded hours text now renders the BusinessHours component
  9. Updating hours in the management app is reflected on all pages without a code change
  10. FindUsSection renders a Google Maps embed, the pub address, phone number, parking info, and a directions link
  11. The FindUsSection component accepts a variant or layout prop so it can fit different page contexts
  12. At least one page uses FindUsSection in place of any prior ad-hoc map/location markup
**Plans:** 8 plans
Plans:
- [ ] 03-01-PLAN.md — CTA coverage: reviews CTASection, enableSmartCtas on service pages, button variant audit
- [ ] 03-02-PLAN.md — FindUsSection build with full/compact variants + deploy on find-us page
- [ ] 03-03-PLAN.md — Spacing tokens verification + hardcoded hours replacement with BusinessHours
- [ ] 03-04-PLAN.md — DS-04 batch 1: hotel and near-heathrow pages (17 files)
- [ ] 03-05-PLAN.md — DS-04 batch 2: location pub pages (16 files)
- [ ] 03-06-PLAN.md — DS-04 batch 3: event and entertainment pages (11 files)
- [ ] 03-07-PLAN.md — DS-04 batch 4: private-hire and venue pages (11 files)
- [ ] 03-08-PLAN.md — DS-04 batch 5: homepage + core pages + site-wide verification (17 files)

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Tracking & HeroBadge | 2/2 | Complete | 2026-05-14 |
| 2. TestimonialSection | 2/2 | Complete | 2026-05-14 |
| 3. Final Standardisation | 0/8 | Planned | - |

---

*Roadmap created: 2026-05-14*
*Last updated: 2026-05-14 — Phase 3 revised: 8 plans in 2 waves (DS-04 split into 5 batches)*
