---
phase: 01-tracking-herobadge
verified: 2026-05-14T10:00:00Z
status: gaps_found
score: 3/4 success criteria verified
gaps:
  - truth: "No raw tel: href links remain outside the PhoneLink or PhoneButton components"
    status: failed
    reason: "Three locations retain raw tel: anchors with no GTM tracking"
    artifacts:
      - path: "components/layout/StatusBar.tsx"
        issue: "Lines 240 and 264: two raw <a href=\"tel:+441753682707\"> with no onClick tracking and no PhoneLink wrapper"
      - path: "app/near-heathrow/page.tsx"
        issue: "Line 884: tel: href in CTASection buttons array with no isPhone:true flag — CTASection will render as a plain link, bypassing PhoneButton"
      - path: "app/restaurants-near-heathrow/page.tsx"
        issue: "Line 724: tel: href in CTASection buttons array with no isPhone:true flag — same bypass"
    missing:
      - "StatusBar.tsx lines 240 and 264: replace <a href=\"tel:\"> with <PhoneLink> (source: 'status_bar')"
      - "app/near-heathrow/page.tsx: add isPhone:true and phoneSource:'near_heathrow_cta' to the phone button object"
      - "app/restaurants-near-heathrow/page.tsx: add isPhone:true and phoneSource:'restaurants_near_heathrow_cta' to the phone button object"
---

# Phase 1: Tracking + HeroBadge Verification Report

**Phase Goal:** Phone clicks are tracked in GTM and hero badge markup is DRY
**Verified:** 2026-05-14
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Clicking any inline phone number fires a GTM tracking event | PARTIAL | PhoneLink, PhoneButton, CTASection (isPhone:true), StickyMobileBookingCTA, EventStickyBookingCTA all track. StatusBar (2 anchors), near-heathrow/page.tsx, and restaurants-near-heathrow/page.tsx do not. |
| 2 | PhoneLink renders as inline text link with className prop | VERIFIED | PhoneLink.tsx: renders `<a>` with SVG icon, accepts className prop, showIcon defaults to true. |
| 3 | HeroBadge exists and 10+ pages use it | VERIFIED | HeroBadge.tsx confirmed. 21 app pages import HeroBadge. |
| 4 | No raw tel: href links outside PhoneLink/PhoneButton/ContactLink | FAILED | 3 locations with untracked raw tel: links (see Gaps section). |

**Score:** 3/4 success criteria verified (truth 1 is partial — most paths tracked, 3 locations missed)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `components/PhoneLink.tsx` | Tracked inline phone link with SVG icon | VERIFIED | Has `trackPhoneCallClick`, SVG icon, `showIcon=true` default, `className` prop |
| `components/HeroBadge.tsx` | Badge-primitive-based hero badge from SSOT.json | VERIFIED | Imports Badge primitive, reads from SSOT.json, exports HeroBadge + HeroItem |
| `lib/constants.ts` | PHONE_NUMBER convenience export | VERIFIED | Line 86: `export const PHONE_NUMBER = CONTACT.phone` |
| `components/layout/StatusBar.tsx` | Tracked phone links | FAILED | Two raw `<a href="tel:">` with no onClick handler or PhoneLink wrapper |
| `app/near-heathrow/page.tsx` | Tracked CTASection phone button | FAILED | tel: in button data, missing `isPhone:true` — CTASection renders as plain link |
| `app/restaurants-near-heathrow/page.tsx` | Tracked CTASection phone button | FAILED | tel: in button data, missing `isPhone:true` — CTASection renders as plain link |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| PhoneLink.tsx | lib/gtm-events.ts | trackPhoneCallClick | WIRED | Import + call on line 3/28 confirmed |
| HeroBadge.tsx | components/ui/primitives/Badge.tsx | Badge import | WIRED | `import { Badge } from '@/components/ui/primitives/Badge'` line 1 |
| HeroBadge.tsx | SSOT.json | build-time import | WIRED | `import ssot from '@/SSOT.json'`, reads `ssot.ratings.google.rating` and `.review_count` |
| StatusBar.tsx | PhoneLink.tsx | import and render | NOT_WIRED | No PhoneLink import; raw `<a>` used instead |
| near-heathrow/page.tsx | PhoneLink (via CTASection isPhone) | isPhone flag | NOT_WIRED | Button object has tel: href but no `isPhone:true` — CTASection skips PhoneButton path |
| restaurants-near-heathrow/page.tsx | PhoneLink (via CTASection isPhone) | isPhone flag | NOT_WIRED | Same as above |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| TRACK-01 | 01-02 | All inline telephone links fire GTM tracking events | PARTIAL | ~14 of 17 locations tracked; StatusBar (2), near-heathrow, restaurants-near-heathrow untracked |
| TRACK-02 | 01-01 | PhoneLink renders as inline text link with className | SATISFIED | PhoneLink renders `<a>`, accepts className, SVG icon confirmed |
| COMP-01 | 01-01, 01-02 | HeroBadge component used on 10+ pages, badge markup DRY | SATISFIED | 21 pages import HeroBadge; component reads from SSOT.json via Badge primitive |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| components/layout/StatusBar.tsx | 240, 264 | Raw `<a href="tel:">` with no onClick tracking | Blocker | These phone clicks are invisible to GTM; any call from the status bar is untracked |
| app/near-heathrow/page.tsx | 884 | tel: href in CTASection without `isPhone:true` | Blocker | CTASection renders as a plain Next.js Link with no tracking; high-traffic page |
| app/restaurants-near-heathrow/page.tsx | 724 | tel: href in CTASection without `isPhone:true` | Blocker | Same as above |

---

### Human Verification Required

None — all automated checks were conclusive.

---

### Gaps Summary

Three files were not migrated to tracked phone links in Plan 02:

1. **StatusBar.tsx** — The persistent status bar shown across the site has two hardcoded `<a href="tel:">` anchors (lines 240 and 264). These are inside a fallback kitchen-closed message. They need to be replaced with `<PhoneLink>` components using source `'status_bar'` (or similar).

2. **app/near-heathrow/page.tsx** — The CTA section passes a phone button object with a `tel:` href but omits the `isPhone: true` flag. CTASection checks `button.isPhone` before rendering a PhoneButton; without it, a plain `<Link>` is rendered with no GTM event. Adding `isPhone: true` and `phoneSource: 'near_heathrow_cta'` is the fix.

3. **app/restaurants-near-heathrow/page.tsx** — Identical issue to near-heathrow. The `tel:` button in the CTA data lacks `isPhone: true`.

These three gaps mean TRACK-01 is not fully satisfied. Everything else in the phase is complete and working — HeroBadge (COMP-01) and PhoneLink component design (TRACK-02) are fully verified.

---

_Verified: 2026-05-14_
_Verifier: Claude (gsd-verifier)_
