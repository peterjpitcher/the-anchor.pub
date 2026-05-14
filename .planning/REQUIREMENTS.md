# Requirements: The Anchor — Component Standardisation

**Defined:** 2026-05-14
**Core Value:** Every page delivers a consistent, professional brand experience with full analytics coverage

## v1 Requirements

### Tracking

- [ ] **TRACK-01**: All inline telephone links fire GTM tracking events (17+ raw `tel:` links currently untracked)
- [ ] **TRACK-02**: PhoneLink component renders as inline text while tracking clicks

### Components

- [ ] **COMP-01**: HeroBadge component extracts the duplicated badge/pill pattern from 10+ pages
- [ ] **COMP-02**: TestimonialSection displays reviews in full-section variant (heading + cards)
- [ ] **COMP-03**: TestimonialSection displays reviews in compact card-strip variant
- [ ] **COMP-04**: TestimonialSection displays reviews in single pull-quote variant
- [ ] **COMP-05**: FindUsSection shows Google Maps embed, address, phone, parking info, and directions link
- [ ] **COMP-06**: All existing ad-hoc testimonial/review markup replaced with TestimonialSection

### Conversion

- [ ] **CONV-01**: CTASection added to all terminal subpages (T2, T3, T4, T5)
- [ ] **CONV-02**: CTASection added to reviews page
- [ ] **CONV-03**: Button variant pairing standardised across all CTASections (consistent primary/secondary usage)
- [ ] **CONV-04**: enableSmartCtas added to all location/hotel pages missing it
- [ ] **CONV-05**: enableSmartCtas added to service pages (food-menu, sunday-lunch, book-table)

### Design System

- [ ] **DS-01**: `section-spacing` utility class defined (py-16 md:py-24)
- [ ] **DS-02**: `section-spacing-sm` utility class defined (py-8 md:py-12)
- [ ] **DS-03**: `section-spacing-lg` utility class defined (py-20 md:py-32)
- [ ] **DS-04**: All inline py-* section padding replaced with spacing tokens across the site

### Data Freshness

- [ ] **DATA-01**: All pages with static hours text replaced with BusinessHours component

## v2 Requirements

### Components

- **COMP-07**: FindUsSection with interactive (non-static) Google Maps embed
- **COMP-08**: TestimonialSection auto-rotation/carousel for compact variant

### Design System

- **DS-05**: Component usage guide/storybook documentation

## Out of Scope

| Feature | Reason |
|---------|--------|
| New page creation | This milestone standardises existing pages only |
| Content rewrites | Only touching markup/components, not copy |
| Database or API changes | Frontend-only effort |
| Booking flow changes | Managed by the management app |
| AlertBox changes | Already consistent (spec item #9) |
| InternalLinkingSection changes | Already consistent (spec item #10) |
| OrganicSearchClusterLinks changes | Already consistent (spec item #10) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TRACK-01 | Phase 1 | Pending |
| TRACK-02 | Phase 1 | Pending |
| COMP-01 | Phase 1 | Pending |
| COMP-02 | Phase 2 | Pending |
| COMP-03 | Phase 2 | Pending |
| COMP-04 | Phase 2 | Pending |
| COMP-06 | Phase 2 | Pending |
| CONV-01 | Phase 3 | Pending |
| CONV-02 | Phase 3 | Pending |
| CONV-03 | Phase 3 | Pending |
| CONV-04 | Phase 3 | Pending |
| CONV-05 | Phase 3 | Pending |
| DS-01 | Phase 4 | Pending |
| DS-02 | Phase 4 | Pending |
| DS-03 | Phase 4 | Pending |
| DS-04 | Phase 4 | Pending |
| DATA-01 | Phase 4 | Pending |
| COMP-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-14*
*Last updated: 2026-05-14 after roadmap creation — all 18 requirements mapped*
