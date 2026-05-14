# Roadmap: The Anchor — Component Standardisation

**Milestone:** v1.0 Component Standardisation
**Created:** 2026-05-14
**Granularity:** Standard (5 phases)

---

## Phases

- [x] **Phase 1: Tracking & HeroBadge** - Close phone analytics gaps and extract duplicated hero badge markup
- [ ] **Phase 2: TestimonialSection** - Build and deploy a multi-variant testimonial component across all review pages
- [ ] **Phase 3: CTA Coverage** - Add CTASection to all terminal/review pages and enable Smart CTAs on location and service pages
- [ ] **Phase 4: Design Tokens & BusinessHours** - Define section spacing tokens and replace all static hours text site-wide
- [ ] **Phase 5: FindUsSection** - Build the reusable map/location display component

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
**Plans**: TBD

### Phase 3: CTA Coverage
**Goal**: Every terminal page has a CTA section and Smart CTAs are enabled everywhere appropriate
**Depends on**: Phase 1
**Requirements**: CONV-01, CONV-02, CONV-03, CONV-04, CONV-05
**Success Criteria** (what must be TRUE):
  1. Terminal subpages (T2, T3, T4, T5) each have a CTASection at the bottom of the page
  2. The reviews page has a CTASection prompting visitors to book
  3. All CTASections use a consistent primary/secondary button variant pairing (no mixed or inverted pairs)
  4. Location and hotel pages that were missing enableSmartCtas now have it enabled
  5. Service pages (food-menu, sunday-lunch, book-table) have enableSmartCtas enabled
**Plans**: TBD

### Phase 4: Design Tokens & BusinessHours
**Goal**: Section spacing is token-driven and no page shows static hours text
**Depends on**: Phase 1
**Requirements**: DS-01, DS-02, DS-03, DS-04, DATA-01
**Success Criteria** (what must be TRUE):
  1. Three spacing utility classes exist in globals.css: `section-spacing`, `section-spacing-sm`, `section-spacing-lg`
  2. A site-wide search returns zero inline `py-16`, `py-20`, `py-24`, `py-8`, `py-12`, `py-32` classes on section elements (all replaced with tokens)
  3. Every page that previously showed hardcoded hours text now renders the BusinessHours component
  4. Updating hours in the management app is reflected on all pages without a code change
**Plans**: TBD

### Phase 5: FindUsSection
**Goal**: A reusable map and location component is available and deployed
**Depends on**: Phase 1
**Requirements**: COMP-05
**Success Criteria** (what must be TRUE):
  1. FindUsSection renders a Google Maps embed, the pub address, phone number, parking info, and a directions link
  2. The component accepts a variant or layout prop so it can fit different page contexts
  3. At least one page (e.g. contact or visit page) uses FindUsSection in place of any prior ad-hoc map/location markup
**Plans**: TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Tracking & HeroBadge | 2/2 | Complete | 2026-05-14 |
| 2. TestimonialSection | 0/? | Not started | - |
| 3. CTA Coverage | 0/? | Not started | - |
| 4. Design Tokens & BusinessHours | 0/? | Not started | - |
| 5. FindUsSection | 0/? | Not started | - |

---

*Roadmap created: 2026-05-14*
*Last updated: 2026-05-14 after Phase 1 execution complete — 2/2 plans done*
