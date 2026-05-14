# Phase 3: Final Standardisation - Research

**Researched:** 2026-05-14
**Domain:** Next.js App Router / Tailwind CSS / React component deployment
**Confidence:** HIGH

---

## Summary

Phase 3 has three independent workstreams. All foundational infrastructure is already in place: CTASection, BusinessHours, GoogleMapEmbed, and the BusinessHoursProvider at app root all exist and work. The work is almost entirely deployment and audit-and-replace, not new component creation. FindUsSection is the only net-new component.

The key discovery is that the spacing token requirement (DS-01–03) is ALREADY partially met — `section-spacing`, `section-spacing-sm`, and `section-spacing-lg` exist in globals.css but with different scale values than the requirements spec describes. The planner must decide: accept current values and mark DS-01–03 complete, or adjust values. Either way, DS-04 (the site-wide replace of inline `py-*` on `<section>` elements) is the real work: 83 instances across 67 files.

The terminal subpages (T2–T5) already have CTASection deployed and `enableSmartCtas={true}`. The reviews page and several service pages do not. The location/hotel pages audit reveals all hotel/near-heathrow pages already have `enableSmartCtas={true}`. The pages missing it are service and utility pages (food-menu, sunday-lunch, book-table, drinks, about, private-hire subtree, etc.).

**Primary recommendation:** Split into three focused plans matching the three workstreams — CTA coverage, design tokens + BusinessHours sweep, FindUsSection build + deploy.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONV-01 | CTASection on all terminal subpages (T2–T5) | ALREADY DONE — all four terminal pages have CTASection + enableSmartCtas |
| CONV-02 | CTASection on reviews page | reviews/page.tsx has HeroWrapper but no CTASection; needs one added at bottom |
| CONV-03 | Consistent primary/secondary button variant across CTASections | Most CTASections use `variant: "white"` (secondary-style) as second button; a few use mixed patterns — audit needed |
| CONV-04 | enableSmartCtas on all location/hotel pages missing it | All hotel/near-heathrow pages already have it; missing on food-menu, sunday-lunch, book-table, drinks, about, private-hire subtree |
| CONV-05 | enableSmartCtas on service pages (food-menu, sunday-lunch, book-table) | None of these three have enableSmartCtas — add to HeroWrapper in each |
| DS-01 | `section-spacing` utility class (py-16 md:py-24) | EXISTS in globals.css as `py-10 md:py-12` — values differ from spec; confirm intended values with planner |
| DS-02 | `section-spacing-sm` utility class (py-8 md:py-12) | EXISTS as `py-8 md:py-10` — minor scale difference |
| DS-03 | `section-spacing-lg` utility class (py-20 md:py-32) | EXISTS as `py-12 md:py-14 lg:py-16` — values differ significantly |
| DS-04 | Replace all inline py-* on section elements with spacing tokens | 83 instances across 67 files — the bulk of this workstream |
| DATA-01 | Replace static hours text with BusinessHours component | 5 confirmed pages with hardcoded kitchen schedule strings; additional FAQ copy in ~8 pages is acceptable (FAQ content not covered by the requirement) |
| COMP-05 | FindUsSection component with map, address, phone, parking, directions | GoogleMapEmbed + DirectionsButton + CONTACT constants all exist; FindUsSection is net-new wrapper |
</phase_requirements>

---

## Standard Stack

### Already Exists — Use As-Is

| Component/Utility | File | Purpose |
|-------------------|------|---------|
| `CTASection` | `components/CTASection.tsx` | CTA sections with variant (green/red/dark), buttons array, footer |
| `BusinessHours` | `components/BusinessHours.tsx` | Live hours from management API via context |
| `BusinessHoursProvider` | `components/providers/BusinessHoursProvider.tsx` | Provides hours context — already at app root in layout.tsx |
| `GoogleMapEmbed` | `components/ui/GoogleMapEmbed.tsx` | iframe map embed, accepts `query`, `height`, `className` |
| `DirectionsButton` | `components/DirectionsButton.tsx` | Tracked directions link with `href`, `source`, `variant` |
| `PhoneButton` / `PhoneLink` | `components/PhoneButton.tsx` / `PhoneLink.tsx` | Tracked phone links |
| `HeroWrapper` | `components/hero/HeroWrapper.tsx` | Accepts `enableSmartCtas?: boolean` prop (default false) |
| `section-spacing` classes | `app/globals.css` lines 58–77 | Spacing tokens — all three exist plus `section-spacing-md` and `section-spacing-tight` |

### CONTACT Constants (use for FindUsSection)

```typescript
// lib/constants.ts
import { CONTACT, PARKING, HEATHROW_TIMES } from '@/lib/constants'

CONTACT.phone           // '01753 682707'
CONTACT.phoneHref       // 'tel:+441753682707'
CONTACT.email           // 'manager@the-anchor.pub'
CONTACT.address.street  // 'Horton Road'
CONTACT.address.town    // 'Stanwell Moor'
CONTACT.address.postcode // 'TW19 6AQ'
CONTACT.coordinates.lat // 51.462509
CONTACT.coordinates.lng // -0.502067
PARKING.capacity        // 20 (spaces)
PARKING.description     // 'Free parking available'
```

---

## Architecture Patterns

### CTASection API

```typescript
// components/CTASection.tsx
interface CTASectionProps {
  title: string
  description?: string
  buttons: CTAButton[]       // see CTAButton interface below
  variant?: 'green' | 'red' | 'dark'   // default 'green'
  className?: string
  footer?: string
  children?: React.ReactNode
}

// CTAButton — relevant fields for standard usage:
{
  text: string
  href: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning' | 'white'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isPhone?: boolean          // use PhoneButton instead of Button
  phoneSource?: string
  isDirections?: boolean     // use DirectionsButton instead of Button
  directionsSource?: string
  bookingContext?: string    // triggers BookTableButton for ordertab.menu URLs
}
```

CTASection already uses `section-spacing` class internally (line 65 of CTASection.tsx).

### Standard Button Variant Pairing

Audit of well-formed CTASections shows: primary CTA uses `variant: "primary"` (or booking link auto-routes to BookTableButton), secondary CTA uses `variant: "white"` (which maps to `secondary` inside CTASection). The `"white"` variant is the established secondary pattern for CTASection.

### enableSmartCtas Pattern

```typescript
// In HeroWrapper JSX:
<HeroWrapper
  // ... other props ...
  enableSmartCtas={true}   // add this line
>
```

HeroWrapper accepts `enableSmartCtas?: boolean` (default false). When true and no explicit CTA override is set, renders SmartCTAs component. The `food-menu`, `sunday-lunch`, and `book-table` pages all use `HeroWrapper` — adding `enableSmartCtas={true}` is a one-line change per page.

### BusinessHours Component Requirements

BusinessHours is a client component that reads from BusinessHoursProvider context. The provider is already at app root (layout.tsx lines 243–286), so any page can use `<BusinessHours />` directly.

```typescript
// Usage:
import { BusinessHours } from '@/components/BusinessHours'

<BusinessHours />                     // bar + kitchen hours
<BusinessHours showKitchen={false} /> // bar hours only
```

### FindUsSection Design

Build as a Server Component (no interactivity needed). Compose from existing primitives.

**Recommended props:**
```typescript
interface FindUsSectionProps {
  variant?: 'full' | 'compact'   // full = map + all details; compact = address + phone + link only
  showMap?: boolean               // default true
  mapHeight?: number | string     // default 300
  className?: string
}
```

**Composition pattern:**
```tsx
// components/FindUsSection.tsx — Server Component
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import { CONTACT, PARKING } from '@/lib/constants'
// No 'use client' needed — static data only

// Directions URL to use:
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${CONTACT.coordinates.lat},${CONTACT.coordinates.lng}`
```

The `find-us/page.tsx` is the best candidate for first FindUsSection deployment — it already has `GoogleMapEmbed`, `BusinessHours`, and address markup as ad-hoc HTML that FindUsSection can replace.

---

## Detailed Audit Results

### CONV-01: Terminal Pages (T2–T5) — ALREADY COMPLETE

All four terminal pages already have:
- `enableSmartCtas={true}` on HeroWrapper
- `<CTASection>` at page bottom with buttons array
- Use `section-spacing` throughout

No action needed for CONV-01.

### CONV-02: Reviews Page — NEEDS CTASection

`app/reviews/page.tsx` has HeroWrapper but no CTASection. The page ends after review content sections. Add a green CTASection at the bottom prompting booking.

### CONV-03: Button Variant Standardisation

Most CTASections use this pattern:
- Button 1: primary action (booking URL → auto BookTableButton, or `variant: "primary"`)
- Button 2: secondary action (`variant: "white"` → renders as secondary)

Non-standard patterns to fix: some pages use `variant: "secondary"` directly instead of `"white"`. Check during DS-04 sweep which is the canonical pattern. The CTASection component treats `"white"` as the secondary style on coloured backgrounds.

### CONV-04 + CONV-05: Missing enableSmartCtas

Pages confirmed to ALREADY have `enableSmartCtas={true}`:
- All pub-near-* hotel pages (11 pages)
- heathrow-hotels-pub, heathrow-layover-dining, near-heathrow
- Terminal 2–5 pages
- Most location/area pages

Pages confirmed to be MISSING enableSmartCtas that have HeroWrapper:
- `food-menu`, `sunday-lunch`, `book-table` (CONV-05 targets)
- `about`, `drinks`, `christmas-parties`, `corporate-christmas-parties`, `corporate-events`
- `function-room-hire`, `heathrow-parking`, `heathrow-parking/[terminal]`
- `join-our-team` and subtree, `private-hire` and subtree (7 subpages)
- `reviews`, `safety-and-respect`, `whats-on`
- Blog pages (likely out of scope for this requirement)

CONV-04 specifies "location and hotel pages" — the audit shows those are already done. CONV-05 specifies food-menu, sunday-lunch, book-table specifically.

### DS-01/02/03: Spacing Tokens — ALREADY EXIST

Current globals.css values:
```css
.section-spacing    { @apply py-10 md:py-12; }
.section-spacing-sm { @apply py-8 md:py-10; }
.section-spacing-md { @apply py-10 md:py-12 lg:py-14; }    /* bonus class */
.section-spacing-lg { @apply py-12 md:py-14 lg:py-16; }
.section-spacing-tight { @apply py-6 md:py-8; }             /* bonus class */
```

Requirements spec says:
- `section-spacing` = py-16 md:py-24
- `section-spacing-sm` = py-8 md:py-12
- `section-spacing-lg` = py-20 md:py-32

**Decision needed:** The existing values are more compact than the spec. Since CTASection and many pages already use these tokens with the current values, changing the values would be a visual change to the entire site. The tokens exist, but the scale may need adjustment. The planner should treat DS-01/02/03 as already met (tokens exist) unless the spec values are intentionally different from the implementation.

### DS-04: Inline py-* on Section Elements — 83 Instances

83 `<section className="...py-{n}...">` occurrences across 67 files. Pattern to replace:

| Old | Replace With |
|-----|-------------|
| `py-16 md:py-24` | `section-spacing-lg` |
| `py-12 md:py-16` | `section-spacing-lg` |
| `py-16` alone | `section-spacing` |
| `py-8 md:py-12` | `section-spacing-sm` |
| `py-8` alone | `section-spacing-sm` |
| `py-20 md:py-32` | `section-spacing-lg` |

Sample files with most instances: function-room-hire, corporate-events, private-hire subtree, about, our-pub.

### DATA-01: Pages With Hardcoded Hours Needing BusinessHours

Confirmed pages with hardcoded kitchen schedule text in JSX (not just FAQ copy):

| Page | Hardcoded String | Fix |
|------|-----------------|-----|
| `stanwell-pub/page.tsx` line 301 | `Kitchen: Tue-Fri 6-9pm, Sat 1-7pm, Sun 1-6pm` | Replace with `<BusinessHours />` (already imported) |
| `live-sport/six-nations/page.tsx` line 205 | `Tue–Fri 6–9pm, Sat 1–7pm, Sun 1–6pm` | Replace schedule text with BusinessHours reference |
| `about/page.tsx` line 243 | `served Tuesday to Sunday` | Replace with dynamic phrasing or BusinessHours |
| `book-table/page.tsx` line 462 | FAQ answer with static hours | Update FAQ answer text |
| `m25-junction-14-pub/page.tsx` line 134 | `served Tuesday to Sunday` | Update to remove static day reference |
| `page.tsx` line 784 | FAQ answer with static hours | Update FAQ answer |

Note: Some occurrences are in FAQ schema answers (JSON-LD `answer` fields). Those are reasonable to update to dynamic-ish phrasing or leave as aspirational descriptions rather than injecting the BusinessHours component into FAQ schema text.

### COMP-05: FindUsSection Component

Build a new Server Component. The `find-us/page.tsx` is the ideal first-deployment target — it already uses `GoogleMapEmbed` and has ad-hoc address + parking markup that FindUsSection can replace.

Other pages with `GoogleMapEmbed` (good candidates for FindUsSection after initial build):
- stanwell-pub, our-pub, horton-pub, longford-pub, colnbrook-pub (all location pages with map sections)
- about/page.tsx

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Hours display | Custom hours parsing | `BusinessHours` component (already exists, context at root) |
| Map embed | Direct iframe | `GoogleMapEmbed` component (already exists in ui/) |
| Phone links | Raw `<a href="tel:">` | `PhoneLink` / `PhoneButton` (tracked) |
| Directions links | Raw `<a href="maps.google...">` | `DirectionsButton` (tracked) |
| CTA buttons | Custom styled buttons | `CTASection` with buttons array |
| Section padding | Inline `py-{n}` classes | `section-spacing`, `section-spacing-sm`, `section-spacing-lg` |

---

## Common Pitfalls

### Pitfall 1: Changing spacing token values mid-phase
**What goes wrong:** Adjusting the `py-*` values in globals.css during DS-01–03 causes every page using the tokens to change visually simultaneously — including CTASection which already uses `section-spacing`.
**How to avoid:** Fix token values FIRST before running DS-04 search-and-replace. Or accept current values as-is (recommended — they're already used site-wide).

### Pitfall 2: enableSmartCtas scope creep
**What goes wrong:** CONV-04 says "location and hotel pages missing it" — but audit shows those are already done. Adding it to all pages with HeroWrapper would be a larger change than specified.
**How to avoid:** Strictly follow CONV-04 (location/hotel) and CONV-05 (food-menu, sunday-lunch, book-table) only.

### Pitfall 3: BusinessHours requires context
**What goes wrong:** Using `<BusinessHours />` on a page that doesn't have BusinessHoursProvider as an ancestor fails silently (shows loading state forever).
**How to avoid:** BusinessHoursProvider is already at app root (layout.tsx). Any page in the app tree has the context available. No additional setup needed.

### Pitfall 4: FindUsSection uses 'use client' unnecessarily
**What goes wrong:** Adding `'use client'` forces the component tree to be client-rendered when all data is static constants.
**How to avoid:** FindUsSection is a Server Component. All data comes from `lib/constants.ts`. No hooks or event handlers needed. DirectionsButton and PhoneButton are already client components — import them as leaf nodes.

### Pitfall 5: DS-04 replacing py-* in non-section elements
**What goes wrong:** Search-and-replace catches `py-16` on `<div>`, `<main>`, `<article>` elements not just `<section>` — breaking unrelated layouts.
**How to avoid:** Success criterion 7 specifies `section` elements only. Be surgical with replacements; review each file.

---

## Validation Architecture

Framework: Jest (jest.config.js in project root), test runner: `npm test`.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Notes |
|--------|----------|-----------|-------|
| CONV-01 | Terminal pages have CTASection | Manual smoke | Already complete — verify visually |
| CONV-02 | Reviews page CTASection exists | Manual smoke | Post-deploy |
| CONV-03 | Button variant consistency | Code review | No automated test needed |
| CONV-04/05 | enableSmartCtas on target pages | Code review | grep verification |
| DS-01–03 | Spacing tokens exist | Code review | Already in globals.css |
| DS-04 | Zero inline section py-* remains | grep check | `grep -rn "<section.*py-" app/` should return 0 |
| DATA-01 | No static hours strings in JSX | grep check | Run against confirmed pages |
| COMP-05 | FindUsSection renders | Unit test | Test with jest-environment-jsdom |

### Wave 0 Gaps

None — Jest infrastructure exists. FindUsSection should get a basic render test added in the same plan that builds it.

### Verification Commands

```bash
# DS-04 gate — must return 0:
grep -rn "^[[:space:]]*<section[^>]*\bpy-8\b\|^[[:space:]]*<section[^>]*\bpy-12\b\|^[[:space:]]*<section[^>]*\bpy-16\b\|^[[:space:]]*<section[^>]*\bpy-20\b\|^[[:space:]]*<section[^>]*\bpy-24\b\|^[[:space:]]*<section[^>]*\bpy-32\b" app/ --include="*.tsx"

# CONV-04/05 gate:
grep -rn "enableSmartCtas" app/food-menu/page.tsx app/sunday-lunch/page.tsx app/book-table/page.tsx

# DATA-01 gate (stanwell-pub specific):
grep -n "Tue-Fri\|Tue–Fri\|Tuesday to Sunday" app/stanwell-pub/page.tsx

# Build gate:
npm run build && npm run lint
```

---

## Sources

### Primary (HIGH confidence)
- Direct file audit of `components/CTASection.tsx` — full API documented
- Direct file audit of `components/BusinessHours.tsx` — full API documented
- Direct file audit of `components/ui/GoogleMapEmbed.tsx` — full API documented
- Direct file audit of `app/globals.css` — spacing token values confirmed
- Direct grep of 200+ page files — enableSmartCtas presence/absence confirmed
- Direct file audit of `lib/constants.ts` — CONTACT, PARKING constants confirmed

### Secondary (MEDIUM confidence)
- Pattern inference from terminal-2/page.tsx as canonical CTASection example
- BusinessHoursProvider context pattern verified from layout.tsx and provider source

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all components read directly from source
- Architecture: HIGH — patterns verified against multiple existing implementations
- Pitfalls: HIGH — derived from direct code audit, not speculation
- Audit counts: HIGH — grep counts verified against actual files

**Research date:** 2026-05-14
**Valid until:** 2026-06-14 (stable codebase, no external dependencies changing)
