# Review Pack: world-cup-seo-spec

**Generated:** 2026-05-10
**Mode:** A (A=Adversarial / B=Code / C=Spec Compliance)
**Project root:** `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/.claude/worktrees/gracious-ishizaka-cf09c2`
**Base ref:** `main`
**HEAD:** `c6ef819`
**Diff range:** `main...HEAD`

> This pack is the sole input for reviewers. Do NOT read files outside it unless a specific finding requires verification. If a file not in the pack is needed, mark the finding `Needs verification` and describe what would resolve it.

## Changed Files

_(none detected for this diff range)_

## User Concerns

Reviewing an SEO optimisation spec for the /world-cup page before implementation. Key files: seo/world-cup-page-spec.md (the spec), app/live-sport/world-cup/page.tsx (current page), components/features/world-cup/WorldCup2026Fixtures.tsx (fixtures component). Challenge: section reorder, metadata changes, content additions, schema fixes.

## Diff (`main...HEAD`)

_(no diff output)_

## Changed File Contents

_(no files to include)_
## Related Files (grep hints)

_(no related files found by basename grep)_

## Project Conventions (`CLAUDE.md`)

```markdown
# CLAUDE.md — The Anchor Pub Website

Project-specific guidance. The workspace CLAUDE.md at `/Users/peterpitcher/Cursor/CLAUDE.md` covers general standards (TypeScript, Tailwind, Supabase, Git, testing, auth). Read this file for what's unique to this project.

---

## ⚠ Before writing any customer-facing content — read the SSOT

**Mandatory pre-flight for any task that produces customer-facing content** (page copy, JSON-LD schemas, blog posts, social copy, marketing emails, email templates, press copy, alt text, meta descriptions, etc.):

1. Read **`docs/SSOT.md`** — the single source of truth for every brand and operational fact.
2. For structured lookups (menu prices, drinks inventory, hours), `SSOT.json` mirrors a subset of the SSOT in JSON.
3. **The SSOT wins.** If existing page copy disagrees with the SSOT, the page is wrong — not the SSOT. Fix the page.
4. **Do not invent facts.** If a claim you want to make is not in the SSOT, stop and ask. Do not infer, do not embellish, do not fall back on training data.
5. **When operational reality changes, update `docs/SSOT.md` first.** Page copy, JSON-LD, and the management DB all follow.

`docs/SSOT.md` covers: identity & voice · contact & location · opening hours · Sunday roast · weekday food · drinks · booking & deposits · venue/parking/amenities · beer garden · events · private hire · ratings · areas served · banned claims.

---

## Stack

- **Next.js 14** App Router, TypeScript, Tailwind CSS, CVA
- **No database** — this is a marketing/booking website only; all data lives in the management app
- **Hosting:** Vercel | **DNS:** Cloudflare | **Analytics:** Google Tag Manager
- **Tests:** Jest (`npm test`) in `tests/`

---

## Relationship with OJ-AnchorManagementTools

These two applications form a paired system. Understanding their relationship is essential before making changes to anything involving bookings, hours, or availability.

### What each app does

| | The Anchor Website (`OJ-The-Anchor.pub`) | Management App (`OJ-AnchorManagementTools`) |
|---|---|---|
| **Purpose** | Customer-facing marketing site + booking flow | Staff/admin tool for managing the pub |
| **Users** | Public customers | Staff and managers |
| **Database** | None | Supabase (PostgreSQL) — sole source of truth |
| **Hosting** | Vercel (this repo) | Vercel (separate repo at `/Users/peterpitcher/Cursor/OJ-AnchorManagementTools`) |

### Data flow

```
Management App (Supabase DB)
        │
        │  REST API (ANCHOR_API_KEY auth)
        │  Base URL: management.orangejelly.co.uk
        ▼
  Website (this repo)
  Next.js API routes proxy the calls
  (protects API key, handles CORS, adds caching)
```

The website **never writes to any database directly**. All mutations (create booking, submit enquiry, etc.) go through the management API.

### Key API endpoints the website consumes

| Endpoint | Purpose |
|---|---|
| `GET /business/hours` | Regular opening hours + special hours overrides |
| `GET /table-bookings/availability` | Available booking slots for a given date/type |
| `POST /table-bookings` | Create a table booking |
| `GET /events` | Upcoming events |
| `GET /menus` | Food/drink menus |

### Special hours override pattern

The management app stores per-date overrides in a `special_hours` table. The website receives these via `/business/hours`. Critical fields:

- `kitchen: null` — kitchen is closed for that date
- `is_kitchen_closed: true` — explicit kitchen closure flag (defence-in-depth)
- `is_closed: true` — full venue closure
- `schedule_config: []` — custom booking schedule for the date

**Important:** `kitchen: null` must be treated as a deliberate "closed" signal — not as "data absent". Use `??` not `||` when resolving special vs regular kitchen data. Using `||` will cause `null` to fall through to regular hours. This has bitten us before (March 2026 bug).

### Booking type → kitchen dependency

| Booking type | Requires kitchen |
|---|---|
| `sunday_lunch` | Yes |
| `food` | Yes |
| `drinks` | No |

If `is_kitchen_closed` or `kitchen === null` for a date, food/sunday_lunch slots must return empty. Drinks slots are unaffected.

### Key files in this repo that touch the management API

| File | Role |
|---|---|
| `lib/api.ts` | Main API client — `anchorAPI.*` methods. Also contains `buildTableAvailabilityFromBusinessHours()` (fallback slot generator) |
| `lib/table-booking-service-windows.ts` | `resolveServiceRanges()` — converts business hours into bookable time slots |
| `lib/hours-utils.ts` | `getEffectiveDayHours()`, `isKitchenClosed()` — correct `??`-based utilities for hours logic |
| `app/api/*/route.ts` | API proxy routes — never expose `ANCHOR_API_KEY` client-side |

---

## Critical Business Rules

These are short reminders. The full set of operational claims and banned phrases lives in **`docs/SSOT.md`** — read it before writing any content.

- **Brand:** Always "The Anchor" (not "The Anchor Pub") in customer-facing copy.
- **Contact:** manager@the-anchor.pub | 01753 682707.
- **Location:** Stanwell Moor, near Heathrow Airport.
- **Monday kitchen:** Always closed unless a special-hours record explicitly opens it.
- **Sunday lunch:** Walk-ins welcome 1pm – 6pm. **No pre-order, no Saturday cutoff, no per-roast prepayment** (changed at the 17 May 2026 walk-in launch). Blocked only if the kitchen is closed for that date.
- **Sunday roast menu (current):** Beef Topside £22 · Pork Leg £20 · Turkey w/ Stuffing Ball £19 · Beef & Ale Pie £21 · Chicken & Wild Mushroom Pie £21 · Vegan Wellington £20 · Kids Roast £14. Wellington is **vegan**, never "vegetarian". See `docs/SSOT.md` §4 for full rules (gravy, accompaniments, retired items).
- **Group deposit:** Groups of 10+ on any day, any booking type — £10 per person, deducted from the bill.
- **No service:** No breakfast, no delivery, no Sky/TNT Sports, no guest ales, no real-ale positioning, no wedding receptions, no accessible toilet, no baby changing.
- **Verified copy:** `docs/SSOT.md` is canonical. `SSOT.json` mirrors the structured subset.

---

## SEO & Domain

- **Canonical domain:** `https://www.the-anchor.pub` (with www — Cloudflare + Vercel)
- **Cloudflare TLS:** Must be "Full" or "Full (strict)" — never "Flexible" (causes redirect loops)

### Canonical URL pattern — DO NOT hardcode in root layout

```typescript
// app/layout.tsx — metadataBase only, NO alternates.canonical here
export const metadata: Metadata = {
  metadataBase: new URL('https://www.the-anchor.pub'),
}

// Individual pages — relative canonical
export const metadata: Metadata = {
  alternates: { canonical: './' },
}
```

Hardcoding `canonical` in the root layout makes every page claim to be the homepage. This was a past bug — don't repeat it.

---

## Architecture

```
app/                  Next.js App Router pages
  api/                Proxy routes to management API
  book-table/         Booking wizard flow
components/
  ui/                 Reusable primitives (Button, Input, Badge, etc.)
  features/           Business-domain components
  tracking/           GTM analytics components
lib/
  api.ts              Management API client + availability logic
  table-booking-service-windows.ts  Slot resolution
  hours-utils.ts      Business hours utilities
  gtm-events.ts       Analytics event helpers
  constants.ts        Business constants
public/               Static assets
docs/                 Documentation (SSOT.md ← canonical brand/claims source, api-integration.md, parking-api.md)
tests/                Jest test files
```

### Patterns

- **Default to Server Components.** Add `'use client'` only for interactivity.
- **API proxy pattern:** All calls to `management.orangejelly.co.uk` go through `app/api/*/route.ts`. Never call the management API directly from client components.
- **Hours single source of truth:** Use `lib/hours-utils.ts` utilities for any hours display logic. Do not re-implement hours parsing inline.
- **CVA for component variants** — use `cva()`, not ad-hoc Tailwind conditionals.

---

## Adding a New Page

```typescript
// app/new-route/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title | The Anchor Stanwell Moor',
  description: 'Page description',
  alternates: { canonical: './' },
}

export default function Page() {
  return <>{/* content */}</>
}
```

Also add the route to `app/sitemap.ts`.

---

## Analytics

```typescript
'use client'
import { trackEventName } from '@/lib/gtm-events'

<Button onClick={() => trackEventName('source_location')}>Action</Button>
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `ANCHOR_API_KEY` | Auth key for management.orangejelly.co.uk |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID |
| `NEXT_PUBLIC_AVIATIONSTACK_API_KEY` | Flight data (Heathrow parking feature) |
```

---

_End of pack._

## Spec Under Review

The following spec describes all planned changes to the World Cup page. Challenge it for correctness, completeness, and alignment with the codebase conventions above.

# World Cup Page Optimisation Spec

**Page:** `/live-sport/world-cup` (`app/live-sport/world-cup/page.tsx`)
**Date:** 10 May 2026
**Goal:** Maximise organic traffic that converts to pub bookings for World Cup 2026 matches

---

## Keyword Strategy

### Primary targets (what this page should rank for)
| Keyword | Volume | Intent | Why |
|---------|--------|--------|-----|
| world cup pub near heathrow | 50/mo (will spike) | Local/transactional | CI: 71 (HIGH) — advertisers value this. Title + H1 already target it |
| football pub near me | 5,000/mo | Local Pack | 900% YoY growth. Local Pack trigger |
| pub showing football near me | 5,000/mo | Local Pack | Same intent cluster |
| watch world cup near me | 50/mo (will spike) | Local/transactional | Direct conversion intent |
| world cup screening near me | 50/mo (will spike) | Local/transactional | Competitor terminology gap |

### Content authority terms (on page for UX + topical signals, won't rank #1)
| Keyword | Volume | Role |
|---------|--------|------|
| world cup 2026 fixtures | 5,000/mo | Fixtures content serves users who arrive via other queries |
| world cup 2026 kick off times | 5,000/mo | UK times are the core utility of the fixtures table |
| england world cup kick off times | 5,000/mo | England section content |
| world cup 2026 times uk | 500/mo | Supporting the fixtures content |
| world cup fixtures uk time | 500/mo | Supporting the fixtures content |

### DO NOT target (parent page or unwinnable)
- "football pub near me" / "live sport pub near me" — parent `/live-sport` page's job
- "world cup 2026" / "world cup 2026 schedule" / "world cup 2026 groups" — BBC/Sky/FIFA own these

---

## Section Order Change

Current order:
1. Hero
2. Intro copy + H1
3. Three info cards (What We're Showing, Booking Rules, Matchday Setup)
4. CTA buttons
5. England fixtures
6. Full fixtures table
7. Matchday Essentials feature grid
8. Food & Drink + Getting Here
9. Local area "near me" section
10. FAQ
11. Final CTA

**New order:**
1. Hero
2. **"World Cup 2026 Fixtures and UK Kick-Off Times"** section header + brief intro line (moved up from position 6)
3. **"How this fixtures list works"** alert box (moved up, was inside fixtures section)
4. **Full fixtures table** (the WorldCup2026Fixtures component)
5. England fixtures highlight section (moved down from position 5 — already visible in the fixtures list via flags)
6. Three info cards (What We're Showing, Booking Rules, Matchday Setup) — with content updates below
7. CTA buttons
8. Food & Drink + Getting Here
9. Local area section (rewritten — see below)
10. FAQ (updated — see below)
11. Final CTA

**Removed entirely:**
- Matchday Essentials feature grid (duplicates info cards: "Sound On" and "4 Screens" appear in both)
- Intro copy section (the keyword-stuffed paragraph — replaced by a cleaner line under the fixtures header)

---

## Metadata Changes

### Title tag
**Current:** `World Cup Pub Near Heathrow | Watch FIFA 2026 Live`
**New:** `World Cup 2026 Fixtures & UK Kick-Off Times | The Anchor Near Heathrow`

**Why:** The current title targets the commercial term but doesn't signal the page's primary content (fixtures list). The new title leads with what the page actually delivers (fixtures + UK times), includes the brand, and retains "Near Heathrow". This better matches the informational + local intent mix that will drive traffic. "World Cup Pub Near Heathrow" stays in the H1.

### Meta description
**Current:** `Watch FIFA World Cup 2026 at The Anchor, a sports pub near Heathrow T5. UK kick-off times, fixtures, 4 screens, sound on, free parking. Book a table.`
**New:** `World Cup 2026 fixtures with UK kick-off times, showing status and table bookings. Watch at The Anchor near Heathrow T5 — 4 screens, sound on, free parking.`

**Why:** Leads with what the page delivers (fixtures + UK times + bookings). Adds "showing status" which is a unique feature. Retains all selling points. Drops "FIFA" (users search "World Cup" not "FIFA World Cup").

### Open Graph title
**New:** `World Cup 2026 Fixtures & UK Kick-Off Times | The Anchor Near Heathrow`

### Open Graph description
**New:** `World Cup 2026 fixtures with UK kick-off times and live showing status. Watch at The Anchor near Heathrow T5 — 4 screens, sound on, free parking. Book a table.`

---

## Content Changes

### 1. New intro line (replaces the keyword-stuffed paragraph)

Below the "World Cup 2026 Fixtures and UK Kick-Off Times" H2, a single line:

> Complete World Cup 2026 match schedule with UK kick-off times, showing status at The Anchor, and table booking links. Updated live from FIFA.

Clean, functional, tells the user exactly what they're looking at. No "near me" stuffing.

### 2. Info card updates

**"What We're Showing" card — add:**
- "All matches on BBC and ITV (free to air)" as the first bullet point
- This is a key differentiator vs Sky/TNT-only pubs and addresses "free to air world cup" queries

**"What We're Showing" card — update hours line:**
- Current: `Core hours: Mon–Thu 4pm–10pm • Fri 4pm–10pm • Sat 12pm–10pm • Sun 12pm–10pm. Extended to midnight for selected knockout matches.`
- New: `Core hours: Mon–Thu 4pm–10pm • Fri–Sat 12pm–10pm • Sun 12pm–10pm. Extended to midnight for selected knockout matches.`
- (Verify this matches the SSOT — recent commits suggest Fri/Sat hours changed to 10pm close)

### 3. England fixtures section — add context line

Above the England fixtures list, add:
> England are in Group L alongside Croatia, Ghana and Panama.

This answers "england world cup group" directly on the page.

### 4. Local area section — rewrite

**Current:** Keyword-stuffed paragraph listing "World Cup pub near me", "football pub near me", etc.

**New copy:**
> The Anchor is in Stanwell Moor, just off the M25 and 5 minutes from Heathrow Terminal 5. Free parking for up to [X] cars makes us easy to reach from Staines, Ashford, Feltham, Egham, Colnbrook, and Windsor. Whether you are looking for somewhere to watch the World Cup near Heathrow or a local pub with screens and sound on, you are welcome to book a table or just turn up.

Retains geographic signals naturally. No "near me" keyword stuffing.

### 5. Add "screening" terminology

Work "screening" into copy in these places:
- Section header subtitle: "The Anchor's World Cup 2026 screenings schedule..."
- England section subtitle: "England fixtures, screenings and table bookings near Heathrow"
- FAQ: update "Which World Cup 2026 matches are you showing?" to include "screening" in the answer

This aligns with competitor/aggregator terminology (Pubsmiths, Greene King, DesignMyNight all use "screening").

### 6. FAQ updates

**Add new FAQ:**
- Q: "Is the World Cup 2026 free to watch?" A: "Yes. All World Cup 2026 matches are broadcast free to air on BBC and ITV in the UK. We show them on our 4 screens with sound on."
- Q: "Are you extending opening hours for the World Cup?" A: "Selected knockout matches have extended hours until midnight. Check the fixtures list for specific matches. For all other games, standard opening hours apply."

**Update existing FAQ:**
- "Which World Cup 2026 matches are you showing?" — add mention of "screening" and "BBC/ITV"

---

## Schema / Structured Data Changes

### 1. Add BreadcrumbList JSON-LD
The `<BreadcrumbJsonLd>` component exists on the parent `/live-sport` page but is missing from this page.

Add: `Home > Live Sport > World Cup 2026`

### 2. Fix Event schema
- Add `@id` field: `"@id": "https://www.the-anchor.pub/live-sport/world-cup#event"`
- Change `performer` to `contributor` or remove entirely — FIFA is the organiser, not a performer at the pub. The `organizer` field already correctly names The Anchor.

### 3. FAQPage schema
Already valid via `FAQAccordionWithSchema`. Will automatically pick up the new/updated FAQ items.

---

## Internal Linking Changes

### 1. Add link from `/live-sport` parent page TO this page
The parent page mentions "World Cup" in text/metadata but has zero `<Link>` elements pointing to `/live-sport/world-cup`. Add a prominent link/card.

### 2. Add link from homepage during tournament window
The homepage should feature a World Cup CTA linking to this page during June-July 2026. (This may already exist via the hero/smart CTAs — verify.)

### 3. Verify blog posts link here
The Anchor already ranks for "sports bar near heathrow" via blog posts. Ensure those posts link to `/live-sport/world-cup`.

---

## What NOT to change

- **URL** — `/live-sport/world-cup` is correct. Hierarchical, reusable, not dated.
- **Canonical** — `/live-sport/world-cup` with relative format is correct.
- **ISR revalidation** — 24h is fine for fixture data.
- **FIFA API data fetch** — working correctly with try/catch resilience.
- **Event schema core fields** — dates, location, offers are all correct.
- **Booking CTA pattern** — Book Table / Call / WhatsApp / Directions covers all paths.

---

## Off-page actions (not code changes)

These aren't page changes but came up in the research and drive the same goal:

1. **Submit to FANZO** — they rank for "pub showing world cup near me"
2. **Submit to watchWC.com** — free venue submission, ranks for "where to watch world cup"
3. **Submit to DesignMyNight** — strong for "where to watch world cup 2026 UK"
4. **Contact footballgroundguide.com** — they have a "best pubs to watch World Cup 2026 UK" article
5. **Update Google Business Profile** — add "World Cup 2026" to description, create Google Posts for match days
6. **Request indexing** — submit URL via Google Search Console URL Inspection tool (site: search returned zero results for this page)

---

## Priority order

| # | Change | Effort | Impact |
|---|--------|--------|--------|
| 1 | Section reorder (fixtures first after hero) | Medium | High — matches user intent |
| 2 | Metadata update (title + description) | Small | High — SERP click-through |
| 3 | Add BreadcrumbList JSON-LD | Small | Medium — structured data |
| 4 | Add BBC/ITV free-to-air line | Small | Medium — differentiator |
| 5 | Rewrite local area section | Small | Medium — removes penalty risk |
| 6 | Add "screening" terminology | Small | Medium — competitor alignment |
| 7 | England Group L context line | Small | Low-Medium |
| 8 | FAQ additions (free to air, extended hours) | Small | Low-Medium |
| 9 | Fix Event schema (@id, performer) | Small | Low |
| 10 | Remove Matchday Essentials duplication | Small | Low — cleaner page |
| 11 | Internal link from /live-sport parent | Small | Medium — crawl signals |
| 12 | Internal link from homepage | Small | Medium — authority flow |

## Current Page Implementation

The file below is the current page.tsx that the spec proposes to modify:

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { DateTime } from 'luxon'
import { AlertBox, Button, Container, CTASection, FeatureGrid, SectionHeader } from '@/components/ui'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BRAND, CONTACT, HEATHROW_TIMES, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { WorldCup2026Fixtures } from '@/components/features/world-cup/WorldCup2026Fixtures'
import { getWorldCup2026Matches } from '@/lib/world-cup-2026'
import type { WorldCup2026Match } from '@/lib/world-cup-2026'
import { PhoneButton } from '@/components/PhoneButton'
import { DirectionsButton } from '@/components/DirectionsButton'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { jsonLdSafeStringify } from '@/lib/jsonld'

const AREA_LINKS = [
  { label: 'Ashford', href: '/ashford-pub' },
  { label: 'Bedfont', href: '/bedfont-pub' },
  { label: 'Colnbrook', href: '/colnbrook-pub' },
  { label: 'Egham', href: '/egham-pub' },
  { label: 'Feltham', href: '/feltham-pub' },
  { label: 'Horton', href: '/horton-pub' },
  { label: 'Heathrow Hotels', href: '/heathrow-hotels-pub' },
  { label: 'Longford', href: '/longford-pub' },
  { label: 'M25 Junction 14', href: '/m25-junction-14-pub' },
  { label: 'Staines', href: '/staines-pub' },
  { label: 'Stanwell', href: '/stanwell-pub' },
  { label: 'Sunbury', href: '/sunbury-pub' },
  { label: 'Windsor', href: '/windsor-pub' },
  { label: 'Wraysbury', href: '/wraysbury-pub' },
]

export const metadata: Metadata = {
  title: 'World Cup Pub Near Heathrow | Watch FIFA 2026 Live',
  description: `Watch FIFA World Cup 2026 at ${BRAND.name}, a sports pub near Heathrow T5. UK kick-off times, fixtures, 4 screens, sound on, free parking. Book a table.`,
  openGraph: {
    title: 'Watch FIFA World Cup 2026 Near Heathrow',
    description: 'World Cup 2026 fixtures, UK kick-off times, 4 screens, sound on for games we show, and table bookings near Heathrow.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }],
    type: 'website',
  },
  twitter: getTwitterMetadata({
    title: 'Watch FIFA World Cup 2026 Near Heathrow',
    description: 'World Cup 2026 fixtures, UK kick-off times, 4 screens, sound on, and table bookings near Heathrow.',
    images: [DEFAULT_PAGE_HEADER_IMAGE],
  }),
  alternates: {
    canonical: '/live-sport/world-cup',
  },
}

export const revalidate = 60 * 60 * 24 // 24 hours

function getTeamsLabel(match: WorldCup2026Match) {
  return match.placeholderA && match.placeholderB
    ? `${match.placeholderA} vs ${match.placeholderB}`
    : `Match ${match.matchNumber}`
}

function isEnglandFixture(match: WorldCup2026Match) {
  return [match.placeholderA, match.placeholderB].some((team) => team?.toLowerCase().includes('england'))
}

function formatUkFixtureTime(utcDateTime: string) {
  return DateTime.fromISO(utcDateTime, { zone: 'utc' }).setZone('Europe/London').toFormat('EEEE d MMMM yyyy, HH:mm')
}

export default async function WorldCupPage() {
  let matches: WorldCup2026Match[] = []
  try {
    matches = await getWorldCup2026Matches()
  } catch (error) {
    console.warn('World Cup fixtures fetch failed', error)
  }

  const englandMatches = matches.filter(isEnglandFixture)

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'FIFA World Cup 2026 Screenings Near Heathrow',
    startDate: '2026-06-11',
    endDate: '2026-07-19',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: BRAND.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.address.street,
        addressLocality: CONTACT.address.town,
        postalCode: CONTACT.address.postcode,
        addressCountry: 'GB',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: CONTACT.coordinates.lat,
        longitude: CONTACT.coordinates.lng,
      },
      telephone: CONTACT.phone,
      url: 'https://www.the-anchor.pub',
    },
    description: `Watch FIFA World Cup 2026 screenings near Heathrow on big screens at ${BRAND.name} in Stanwell Moor.`,
    image: DEFAULT_PAGE_HEADER_IMAGE,
    organizer: {
      '@type': 'Organization',
      name: BRAND.name,
      url: 'https://www.the-anchor.pub',
    },
    performer: {
      '@type': 'Organization',
      name: 'FIFA',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: 'https://www.the-anchor.pub/book-table',
      validFrom: '2025-01-01',
      description: 'Free entry, table booking recommended',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafeStringify([eventSchema]) }}
      />

      <HeroWrapper
        route="/live-sport/world-cup"
        title="Watch FIFA World Cup 2026 Near Heathrow"
        description="World Cup 2026 fixtures • UK kick-off times • 4 screens • Sound on • Free parking near Terminal 5."
        variant="default"
        enableSmartCtas={true}
        showContextStrip={true}
      />

      <section className="bg-anchor-bg py-8">
        <Container>
          <div className="mx-auto max-w-5xl text-center">
            <PageTitle className="mb-4 text-anchor-gold-vivid">World Cup Pub Near Heathrow for FIFA World Cup 2026</PageTitle>
            <p className="text-lg text-anchor-cream-text/70">
              The FIFA World Cup 2026 runs from <strong>11 June to 19 July 2026</strong>. If you’re searching for a
              “World Cup pub near me”, a football pub near me, or a sports pub near Heathrow, The Anchor is a proper
              pub atmosphere in Stanwell Moor, just {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.
            </p>
            <p className="mt-4 text-lg text-anchor-cream-text/70">
              Use our World Cup 2026 fixtures and UK kick-off times below to pick a match we’re showing, then book a
              table so you’ve got a screen view.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-anchor-bg-raised py-10">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-anchor-bg-card p-6 shadow-sm ring-1 ring-anchor-gold/15">
                <h2 className="text-lg font-bold text-anchor-gold-vivid">What We’re Showing</h2>
                <ul className="mt-4 space-y-2 text-sm text-anchor-cream-text/70">
                  <li>Matches that kick off during opening hours</li>
                  <li>Or up to 1 hour before we open</li>
                  <li>Matches outside those hours aren’t shown</li>
                  <li>If it’s busy at close, we’ll stay open while it’s on</li>
                  <li>If we’re empty at close, we’ll close as normal</li>
                </ul>
                <p className="mt-4 text-xs text-anchor-cream-text/55">
                  Core hours: Mon–Thu 4pm–10pm • Fri 4pm–10pm • Sat 12pm–10pm • Sun 12pm–10pm. Extended to midnight for selected knockout matches.
                </p>
                <div className="mt-4">
                  <Link href="#fixtures" className="font-semibold text-anchor-gold hover:underline">
                    See fixtures we’re showing →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl bg-anchor-bg-card p-6 shadow-sm ring-1 ring-anchor-gold/15" id="booking-rules">
                <h2 className="text-lg font-bold text-anchor-gold-vivid">Booking Rules</h2>
                <ul className="mt-4 space-y-2 text-sm text-anchor-cream-text/70">
                  <li>Book any showing match now</li>
                  <li>No deposits and no minimum spend</li>
                  <li>Large groups: book early for the best tables</li>
                  <li>Tables are held until kick-off, then released</li>
                </ul>
                <p className="mt-4 text-xs text-anchor-cream-text/55">Booking takes you to our in-site table booking form.</p>
              </div>

              <div className="rounded-2xl bg-anchor-bg-card p-6 shadow-sm ring-1 ring-anchor-gold/15">
                <h2 className="text-lg font-bold text-anchor-gold-vivid">Matchday Setup</h2>
                <ul className="mt-4 space-y-2 text-sm text-anchor-cream-text/70">
                  <li>4 screens (no projector)</li>
                  <li>Sound on for all games we show (reviewed if another event clashes)</li>
                  <li>Kitchen open during our opening hours</li>
                  <li>Free parking ({PARKING.capacity} spaces)</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <BookTableButton
                source="world_cup_quick_cta"
                context="sport"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Book a Table
              </BookTableButton>
              <Link href="#fixtures" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  See Fixtures
                </Button>
              </Link>
              <PhoneButton
                phone={CONTACT.phone}
                source="world_cup_quick_cta"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Call
              </PhoneButton>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <WhatsAppLink
                  phone={CONTACT.phone}
                  source="world_cup_quick_cta"
                  message="Hi! I’d like to book a table for a World Cup match."
                  showIcon={false}
                >
                  WhatsApp
                </WhatsAppLink>
              </Button>
              <DirectionsButton
                href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
                source="world_cup_quick_cta"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Directions
              </DirectionsButton>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg">
        <Container>
          <div className="mx-auto max-w-5xl rounded-2xl bg-anchor-bg-raised p-8 ring-1 ring-anchor-gold/15">
            <SectionHeader
              title="England World Cup Fixtures at The Anchor"
              subtitle="England fixtures, pub atmosphere, and table bookings near Heathrow."
            />
            {englandMatches.length > 0 ? (
              <div className="mx-auto mt-8 max-w-3xl space-y-3">
                <p className="text-center text-sm text-anchor-cream-text/70">
                  Looking for a pub showing an England game near me? These England World Cup fixtures are in our full
                  World Cup 2026 schedule below.
                </p>
                <div className="divide-y divide-anchor-gold/15 rounded-xl bg-anchor-bg-card ring-1 ring-anchor-gold/15">
                  {englandMatches.map((match) => (
                    <Link
                      key={match.matchNumber}
                      href={`#match-${match.matchNumber}`}
                      className="flex flex-col gap-1 px-5 py-4 hover:bg-anchor-bg-raised sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-semibold text-anchor-cream-text">{getTeamsLabel(match)}</span>
                      <span className="text-sm text-anchor-cream-text/70">
                        {formatUkFixtureTime(match.utcDateTime)} UK
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-anchor-cream-text/70">
                England’s World Cup 2026 fixtures will be highlighted here once confirmed. For now, use the full World
                Cup 2026 schedule below for UK kick-off times, showing status, and table booking links.
              </p>
            )}
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg" id="fixtures">
        <Container>
          <SectionHeader
            title="World Cup 2026 Fixtures and UK Kick-Off Times"
            subtitle="The Anchor’s World Cup 2026 schedule, with showing status and table booking links."
          />

          <p className="mx-auto mb-8 max-w-4xl text-center text-sm text-anchor-cream-text/70">
            This fixtures table shows World Cup 2026 match dates in UK time. Start with <strong>Showing Only</strong> for
            matches we plan to show and bookable kick-offs, or switch to <strong>All Fixtures</strong> for the full
            tournament schedule.
          </p>

          <AlertBox
            variant="info"
            className="mx-auto mb-10 max-w-5xl"
            title="How this fixtures list works"
            content={
              <div className="space-y-3 text-sm">
                <p>
                  By default you’ll see <strong>Showing Only</strong> matches (plus any we’ll <strong>open early</strong> for).
                  Switch to <strong>All Fixtures</strong> to see the full tournament schedule.
                </p>
                <p>
                  <strong>Showing</strong> = kick-off during opening hours. <strong>Opening early</strong> = kick-off up to{' '}
                  <strong>1 hour before we open</strong>. <strong>Not showing</strong> = kick-off outside those hours.
                </p>
                <p>
                  Book now buttons are live for matches marked <strong>Showing</strong> or <strong>Opening early</strong>. We
                  don’t show booking buttons for matches marked <strong>Not showing</strong>.
                </p>
                <p>
                  If a match runs past our normal closing time we’ll stay open while it’s on{' '}
                  <strong>if the pub is busy</strong>. If the pub is empty at closing time, we’ll close as normal.
                </p>
              </div>
            }
          />

          <div className="mx-auto max-w-5xl">
            {matches.length > 0 ? (
              <WorldCup2026Fixtures matches={matches} />
            ) : (
              <AlertBox
                variant="warning"
                title="Fixtures temporarily unavailable"
                className="mx-auto max-w-2xl"
                content="We’re having trouble loading the full match schedule right now. Please check back soon, in the meantime you can still book a table for any date."
              />
            )}
          </div>

          <div className="mt-12 text-center">
            <AlertBox
              variant="warning"
              title="Book Early for Knockouts"
              className="mx-auto max-w-2xl"
              content="The knockouts and final weekend fill up fast. Book ahead to guarantee a table with a good screen view."
            />
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-raised">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <SectionHeader title="Matchday Essentials" subtitle="Everything you need for a proper World Cup watch." />

            <FeatureGrid
              columns={4}
              features={[
                {
                  icon: '',
                  title: 'Sound On',
                  description: 'Sound on for all games we show (reviewed if another event clashes).',
                  variant: 'default',
                  className: 'border border-anchor-gold/15 text-center',
                },
                {
                  icon: '',
                  title: '4 Screens',
                  description: '4 screens across the bar and dining areas (no projector).',
                  variant: 'default',
                  className: 'border border-anchor-gold/15 text-center',
                },
                {
                  icon: '',
                  title: 'Kitchen Open',
                  description: 'Food served during our opening hours.',
                  variant: 'default',
                  className: 'border border-anchor-gold/15 text-center',
                },
                {
                  icon: '',
                  title: 'Free Parking',
                  description: `Free on-site parking (${PARKING.capacity} spaces).`,
                  variant: 'default',
                  className: 'border border-anchor-gold/15 text-center',
                },
              ]}
              className="mt-10"
            />

            <AlertBox
              variant="info"
              title="Late Kick-offs"
              className="mx-auto mt-10 max-w-2xl"
              content="Many games in the USA/Canada/Mexico will be late-night (or overnight) in the UK. Matches marked “Not showing” won’t be on our screens."
            />
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg-raised">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <SectionHeader title="Food & Drink" subtitle="Settle in and make a day of it." className="mb-6 text-left" />
              <div className="prose text-anchor-cream-text/70">
                <p>
                  Proper pub classics, cold pints, and a friendly crowd, ideal for afternoon kick-offs or big evening games.
                </p>
                <p>Kitchen is open during our opening hours (check the menu for current serving times).</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/food-menu">
                  <Button variant="primary">View Food Menu</Button>
                </Link>
                <Link href="/drinks">
                  <Button variant="outline">Drinks List</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-anchor-bg-card p-8 shadow-sm ring-1 ring-anchor-gold/15">
              <h3 className="mb-4 text-xl font-bold text-anchor-gold-vivid">Getting Here</h3>
              <ul className="mb-6 space-y-3 text-sm text-anchor-cream-text/70">
                <li className="flex gap-2">
                  <span>
                    {CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.postcode}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>
                    {HEATHROW_TIMES.terminal5} mins from Heathrow Terminal 5 (T2/3 ~{HEATHROW_TIMES.terminal2} mins, T4 ~
                    {HEATHROW_TIMES.terminal4} mins)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>Free parking ({PARKING.capacity} spaces)</span>
                </li>
                <li className="flex gap-2">
                  <span>Bus 442 (Staines Heathrow) stops outside, ask for The Anchor, Horton Road</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/find-us" className="font-bold text-anchor-gold hover:underline">
                  Directions & travel info →
                </Link>
                <Link href="/near-heathrow/terminal-5" className="font-bold text-anchor-gold hover:underline">
                  Terminal 5 guide →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg">
        <Container>
          <SectionHeader
            title="A Football and Live Sport Pub Near Heathrow"
            subtitle="Stanwell Moor, Staines, Ashford, Feltham, Egham and around Heathrow."
          />
          <div className="mx-auto max-w-5xl rounded-2xl bg-anchor-bg-raised p-8 ring-1 ring-anchor-gold/15">
            <p className="text-center text-sm text-anchor-cream-text/70">
              Searching for “World Cup pub near me”, “football pub near me”, “live sport pub near me”, or a sports bar
              near Heathrow? The Anchor is a proper pub alternative near Stanwell Moor, Staines, Ashford, Feltham,
              Egham, Heathrow hotels, and Heathrow Terminal 5, with free parking on-site.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {AREA_LINKS.map((area) => (
                <Link
                  key={area.href}
                  href={area.href}
                  className="rounded-full bg-anchor-bg-card px-4 py-2 text-sm font-semibold text-anchor-gold ring-1 ring-anchor-gold/15 hover:bg-anchor-bg-raised"
                >
                  {area.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section-spacing bg-anchor-bg">
        <Container>
          <SectionHeader title="Frequently Asked Questions" />
          <FAQAccordionWithSchema
            faqs={[
              {
                question: 'Where can I watch World Cup 2026 near Heathrow?',
                answer: `You can watch FIFA World Cup 2026 matches we are showing at ${BRAND.name} in Stanwell Moor, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5. We have 4 screens, sound on for games we show, free parking, and table bookings available.`,
              },
              {
                question: 'Which World Cup 2026 matches are you showing?',
                answer:
                  'We show matches that kick off during our opening hours (or up to 1 hour before we open). In the fixtures list, look for “Showing” or “Opening early”.',
              },
              {
                question: 'Why are some matches marked “Not showing”?',
                answer:
                  'Those kick-offs are outside our opening hours, so they won’t be on our screens.',
              },
              {
                question: 'Do you show England World Cup fixtures?',
                answer:
                  'Yes, we show England World Cup fixtures when the kick-off is during our opening hours or up to 1 hour before we open. England fixtures will be highlighted on this page once confirmed.',
              },
              {
                question: 'Can I book a table for the World Cup final?',
                answer:
                  'Yes, if the World Cup final is marked as Showing or Opening early in our fixtures list, you can book a table from the fixture row. Final weekend fills up fast, so booking ahead is recommended.',
              },
              {
                question: 'Is The Anchor a sports bar near Heathrow?',
                answer:
                  'The Anchor is a proper pub near Heathrow that shows live sport on 4 screens. If you are looking for a sports bar near Heathrow, a football pub near me, or a live sport pub near me, we offer a pub atmosphere with sound on for games we show, food, drinks, and free parking.',
              },
              {
                question: 'When do bookings open?',
                answer: 'Bookings are open now for all matches we’re showing. Use the Book Table button next to the fixture.',
              },
              {
                question: 'Do you take deposits or minimum spend?',
                answer: 'No, there are no deposits required and no minimum spend.',
              },
              {
                question: 'How long do you hold tables?',
                answer:
                  'Tables are held until kick-off only. After kick-off, tables may be released for anyone to use.',
              },
              {
                question: 'Will you stay open until full time?',
                answer:
                  'If a match is still being played at our normal closing time, we’ll stay open while it’s on if the pub is busy. If the pub is empty at closing time, we’ll close as normal.',
              },
              {
                question: 'Is the sound on?',
                answer:
                  'Yes, sound is on for all games we show. If a match clashes with another event, we may review the sound on the day.',
              },
              {
                question: 'How many screens do you have?',
                answer: 'We have 4 screens across the bar and dining areas (no projector).',
              },
              {
                question: 'Are the kick-off times shown in UK time?',
                answer: 'Yes, the fixtures list shows kick-off times in UK time (BST).',
              },
              {
                question: 'Do you have parking and how do I get there?',
                answer: `Yes, free on-site parking for guests (${PARKING.capacity} spaces). We’re ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5, and the 442 bus from Staines Heathrow stops outside.`,
              },
            ]}
            className="mx-auto max-w-3xl bg-anchor-bg-raised"
          />
        </Container>
      </section>

      <CTASection
        title="Book Your World Cup Table"
        description="Choose a match we’re showing, then book your table now."
        buttons={[
          {
            text: 'Book a Table',
            href: '/book-table',
            variant: 'primary',
          },
          {
            text: 'Get Directions',
            href: '/find-us',
            variant: 'secondary',
          },
        ]}
        variant="green"
      />
    </>
  )
}
```
