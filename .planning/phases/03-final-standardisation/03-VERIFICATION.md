---
phase: 03-final-standardisation
verified: 2026-05-14T15:00:00Z
status: gaps_found
score: 10/12 must-haves verified
gaps:
  - truth: "All CTASections use a consistent primary/secondary button variant pairing (no mixed or inverted pairs)"
    status: failed
    reason: "Six CTASection button arrays use variant: 'secondary' instead of the established variant: 'white' pattern"
    artifacts:
      - path: "app/pub-near-novotel-heathrow/page.tsx"
        issue: "Line 214 — CTASection buttons array has variant: 'secondary' on Call Us button"
      - path: "app/pub-near-sofitel-heathrow/page.tsx"
        issue: "Line 203 — CTASection buttons array has variant: 'secondary' on Call Us button"
      - path: "app/stanwell-pub/page.tsx"
        issue: "Line 518 — CTASection buttons array has variant: 'secondary' on Book a Table button"
      - path: "app/feltham-pub/page.tsx"
        issue: "Line 504 — CTASection buttons array has variant: 'secondary' on Book a Table button"
      - path: "app/colnbrook-pub/page.tsx"
        issue: "Line 279 — CTASection buttons array has variant: 'secondary' on Book a Table button"
      - path: "app/longford-pub/page.tsx"
        issue: "Line 270 — CTASection buttons array has variant: 'secondary' on Book a Table button"
    missing:
      - "Change variant: 'secondary' to variant: 'white' in CTASection buttons arrays on all 6 affected pages"
human_verification:
  - test: "Verify BusinessHours renders live data on stanwell-pub and six-nations pages"
    expected: "Current opening hours pulled from management app display on page load; changing hours in management app updates the displayed hours without a code deploy"
    why_human: "Requires a running dev server and live management API connection to verify the data-fetch pipeline end-to-end"
  - test: "Verify FindUsSection renders correctly on the find-us page in a browser"
    expected: "Google Maps embed, Horton Road address, phone number as a clickable tracked link, parking description, and a Get Directions link all appear correctly"
    why_human: "GoogleMapEmbed renders an iframe; visual correctness of the embedded map cannot be verified by static grep"
---

# Phase 3: Final Standardisation Verification Report

**Phase Goal:** CTA sections on all terminal pages, spacing tokens replace inline padding, static hours replaced with BusinessHours, and FindUsSection deployed
**Verified:** 2026-05-14
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Terminal subpages (T2, T3, T4, T5) each have a CTASection at the bottom | VERIFIED | 4 matches each in terminal-2/3/4/5 page.tsx |
| 2 | Reviews page has a CTASection prompting visitors to book | VERIFIED | app/reviews/page.tsx line 266 — CTASection with green variant |
| 3 | All CTASections use consistent primary/secondary button variant pairing | FAILED | 6 pages have variant: 'secondary' in CTASection buttons arrays (should be variant: 'white') |
| 4 | Location and hotel pages missing enableSmartCtas now have it enabled | VERIFIED | 13 location/hotel pages confirmed with enableSmartCtas={true} |
| 5 | Service pages (food-menu, sunday-lunch, book-table) have enableSmartCtas enabled | VERIFIED | All 3 service pages confirmed with enableSmartCtas={true} |
| 6 | Three spacing utility classes exist in globals.css | VERIFIED | section-spacing (py-10 md:py-12), section-spacing-sm (py-8 md:py-10), section-spacing-lg (py-12 md:py-14 lg:py-16) all confirmed |
| 7 | Zero inline py-16/py-20/py-24/py-8/py-12/py-32 on section elements site-wide | VERIFIED | grep returned 0 matches across full app/ directory |
| 8 | Every page with hardcoded hours text now renders BusinessHours | VERIFIED | stanwell-pub (2 usages) and six-nations confirmed; other pages converted to generic phrasing where component can't render in prose |
| 9 | Updating hours in management app reflected without a code change | VERIFIED | BusinessHours uses useBusinessHoursContext() wired to live API provider |
| 10 | FindUsSection renders Google Maps embed, address, phone, parking info, directions link | VERIFIED | component/FindUsSection.tsx implements all 5 elements with wired constants |
| 11 | FindUsSection accepts a variant or layout prop | VERIFIED | variant prop ('full' \| 'compact') with showMap derived from variant |
| 12 | At least one page uses FindUsSection in place of prior ad-hoc map/location markup | VERIFIED | app/find-us/page.tsx line 214 — FindUsSection variant="full" replaces GoogleMapEmbed + address block |

**Score:** 10/12 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `components/FindUsSection.tsx` | FindUsSection component with full/compact variants | VERIFIED | 63 lines, substantive, wired on find-us page |
| `app/globals.css` spacing tokens | section-spacing, section-spacing-sm, section-spacing-lg | VERIFIED | All three at correct values per REQUIREMENTS.md |
| `app/reviews/page.tsx` | CTASection with booking CTA | VERIFIED | CTASection import + usage at line 266 |
| `app/find-us/page.tsx` | FindUsSection deployed | VERIFIED | Imported and rendered at line 214 |
| `app/food-menu/page.tsx` | enableSmartCtas={true} | VERIFIED | Present on HeroWrapper |
| `app/sunday-lunch/page.tsx` | enableSmartCtas={true} | VERIFIED | Present on HeroWrapper |
| `app/book-table/page.tsx` | enableSmartCtas={true} | VERIFIED | Present on HeroWrapper |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| FindUsSection | CONTACT/PARKING constants | import { CONTACT, PARKING } | WIRED | Both constants used in component body |
| FindUsSection | PhoneLink | import { PhoneLink } | WIRED | Renders tracked phone link |
| FindUsSection | GoogleMapEmbed | import { GoogleMapEmbed } | WIRED | Conditional on showMap prop |
| FindUsSection | DirectionsLink | import { DirectionsLink } | WIRED | Renders with DIRECTIONS_URL from coordinates |
| BusinessHours | Live API | useBusinessHoursContext() | WIRED | Provider pattern; fetches from management app |
| stanwell-pub | BusinessHours | import + render | WIRED | Two usages in page |
| six-nations | BusinessHours | import + render | WIRED | One usage confirmed |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CONV-01 | 03-01 | CTASection on all terminal subpages | SATISFIED | 4 matches each on T2/T3/T4/T5 |
| CONV-02 | 03-01 | CTASection on reviews page | SATISFIED | reviews/page.tsx line 266 |
| CONV-03 | 03-01 | Consistent button variant pairing | BLOCKED | 6 CTASection buttons arrays use variant: 'secondary' instead of 'white' |
| CONV-04 | 03-01 | enableSmartCtas on location/hotel pages | SATISFIED | 13 pages confirmed |
| CONV-05 | 03-01 | enableSmartCtas on service pages | SATISFIED | food-menu, sunday-lunch, book-table confirmed |
| DS-01 | 03-03 | section-spacing token (py-10 md:py-12) | SATISFIED | globals.css line 58-60 |
| DS-02 | 03-03 | section-spacing-sm token (py-8 md:py-10) | SATISFIED | globals.css line 63-65 |
| DS-03 | 03-03 | section-spacing-lg token (py-12 md:py-14 lg:py-16) | SATISFIED | globals.css line 71-73 |
| DS-04 | 03-04/05/06/07/08 | All inline py-* on sections replaced | SATISFIED | Site-wide grep returns 0 matches |
| DATA-01 | 03-03 | Static hours replaced with BusinessHours | SATISFIED | stanwell-pub, six-nations wired; prose pages use generic phrasing |
| COMP-05 | 03-02 | FindUsSection component | SATISFIED | components/FindUsSection.tsx exists, substantive, wired |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| app/pub-near-novotel-heathrow/page.tsx | 214 | variant: 'secondary' in CTASection buttons array | Warning | Inconsistent button variant; does not match pattern established in CONV-03 |
| app/pub-near-sofitel-heathrow/page.tsx | 203 | variant: 'secondary' in CTASection buttons array | Warning | Same inconsistency |
| app/stanwell-pub/page.tsx | 518 | variant: 'secondary' in CTASection buttons array | Warning | Same inconsistency |
| app/feltham-pub/page.tsx | 504 | variant: 'secondary' in CTASection buttons array | Warning | Same inconsistency |
| app/colnbrook-pub/page.tsx | 279 | variant: 'secondary' in CTASection buttons array | Warning | Same inconsistency |
| app/longford-pub/page.tsx | 270 | variant: 'secondary' in CTASection buttons array | Warning | Same inconsistency |

Note: `variant: 'secondary'` on standalone Buttons outside CTASection (page.tsx, drinks pages, join-our-team) is not in scope for CONV-03 — that requirement covers CTASection button array pairings only.

---

## Human Verification Required

### 1. BusinessHours Live Data Fetch

**Test:** Open the stanwell-pub or six-nations page in a browser with the dev server running against the real management API. Observe the hours display.
**Expected:** Current opening hours load from the management app within a few seconds; changing hours via the management app updates the page without a code deploy.
**Why human:** Requires a running dev server and live API connection — cannot verify the provider's fetch call result by static analysis alone.

### 2. FindUsSection Visual Rendering

**Test:** Open /find-us in a browser and inspect the rendered output.
**Expected:** Google Maps embed displays The Anchor's location, address block shows Horton Road / Stanwell Moor / TW19 6AQ, phone link is clickable, parking info shows from PARKING constants, and Get Directions link opens Google Maps navigation.
**Why human:** GoogleMapEmbed renders an iframe; visual/functional correctness of the embedded map cannot be verified by file inspection.

---

## Gaps Summary

One requirement is unmet: **CONV-03** (consistent CTASection button variant pairing).

The SUMMARY for plan 03-01 states "all CTASection button arrays use variant: 'white'" and "zero fixes needed for CONV-03", but the codebase contains 6 pages where a CTASection button is declared with `variant: 'secondary'` in the buttons array prop. These pages were not part of plan 03-01's modification scope (they are location pub pages, largely modified in plans 03-04 through 03-08 for spacing token migration), but the CONV-03 audit did not sweep those pages.

The fix is mechanical: change `variant: 'secondary'` to `variant: 'white'` in the CTASection buttons arrays on:
- `app/pub-near-novotel-heathrow/page.tsx` (line 214)
- `app/pub-near-sofitel-heathrow/page.tsx` (line 203)
- `app/stanwell-pub/page.tsx` (line 518)
- `app/feltham-pub/page.tsx` (line 504)
- `app/colnbrook-pub/page.tsx` (line 279)
- `app/longford-pub/page.tsx` (line 270)

All other 11 success criteria are fully satisfied. DS-01/02/03/04, DATA-01, COMP-05, CONV-01/02/04/05 all pass verification.

---

_Verified: 2026-05-14_
_Verifier: Claude (gsd-verifier)_
