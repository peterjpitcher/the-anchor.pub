# Requirements: The Anchor — Component Standardisation

**Defined:** 2026-05-14
**Core Value:** Every page delivers a consistent, professional brand experience with full analytics coverage

## v1 Requirements

### Tracking

- [x] **TRACK-01**: All inline telephone links fire GTM tracking events (17+ raw `tel:` links currently untracked)
- [x] **TRACK-02**: PhoneLink component renders as inline text while tracking clicks

### Components

- [x] **COMP-01**: HeroBadge component extracts the duplicated badge/pill pattern from 10+ pages
- [x] **COMP-02**: TestimonialSection displays reviews in full-section variant (heading + cards)
- [x] **COMP-03**: TestimonialSection displays reviews in compact card-strip variant
- [x] **COMP-04**: TestimonialSection displays reviews in single pull-quote variant
- [x] **COMP-05**: FindUsSection shows Google Maps embed, address, phone, parking info, and directions link
- [x] **COMP-06**: All existing ad-hoc testimonial/review markup replaced with TestimonialSection

### Conversion

- [x] **CONV-01**: CTASection added to all terminal subpages (T2, T3, T4, T5)
- [x] **CONV-02**: CTASection added to reviews page
- [x] **CONV-03**: Button variant pairing standardised across all CTASections (consistent primary/secondary usage)
- [x] **CONV-04**: enableSmartCtas added to all location/hotel pages missing it
- [x] **CONV-05**: enableSmartCtas added to service pages (food-menu, sunday-lunch, book-table)

### Design System

- [x] **DS-01**: `section-spacing` utility class defined (py-10 md:py-12)
- [x] **DS-02**: `section-spacing-sm` utility class defined (py-8 md:py-10)
- [x] **DS-03**: `section-spacing-lg` utility class defined (py-12 md:py-14 lg:py-16)
- [x] **DS-04**: All inline py-* section padding replaced with spacing tokens across the site

### Data Freshness

- [x] **DATA-01**: All pages with static hours text replaced with BusinessHours component

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
| TRACK-01 | Phase 1 | Complete |
| TRACK-02 | Phase 1 | Complete |
| COMP-01 | Phase 1 | Complete |
| COMP-02 | Phase 2 | Complete |
| COMP-03 | Phase 2 | Complete |
| COMP-04 | Phase 2 | Complete |
| COMP-06 | Phase 2 | Complete |
| CONV-01 | Phase 3 | Complete |
| CONV-02 | Phase 3 | Complete |
| CONV-03 | Phase 3 | Complete |
| CONV-04 | Phase 3 | Complete |
| CONV-05 | Phase 3 | Complete |
| DS-01 | Phase 3 | Complete |
| DS-02 | Phase 3 | Complete |
| DS-03 | Phase 3 | Complete |
| DS-04 | Phase 3 | Complete |
| DATA-01 | Phase 3 | Complete |
| COMP-05 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-14*
*Last updated: 2026-05-14 — Milestone v1.0 complete: 18/18 requirements delivered*
