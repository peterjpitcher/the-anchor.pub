# CLAUDE.md, The Anchor website

Workspace standards live in `/Users/peterpitcher/Cursor/CLAUDE.md`; read it first if it is not already in your context. This file holds only what is unique to this repo. `AGENTS.md` is a symlink to this file so Codex and Cursor read the same rules.

## Before writing any customer-facing content: read the SSOT

Applies to page copy, JSON-LD, blog posts, social copy, emails, press copy, alt text and meta descriptions.

1. Read `docs/SSOT.md` (identity and voice, contact, hours, Sunday roast, weekday food, drinks, booking and deposits, venue and parking, beer garden, events, private hire, ratings, areas served, banned claims). `SSOT.json` mirrors the structured subset (menu prices, drinks, hours) and is imported at build time by code such as `components/HeroBadge.tsx` and `lib/menu-page-data.ts`.
2. The SSOT wins. If page copy disagrees with it, the page is wrong: fix the page.
3. Do not invent facts. If a claim is not in the SSOT, stop and ask. No inference, no embellishment, no training-data fallback.
4. When operational reality changes, update `docs/SSOT.md` first; page copy, JSON-LD and the management DB follow.
5. After any SSOT change run `npx jest tests/ssot-drift-guard.test.ts`; it fails if `docs/SSOT.md` and `SSOT.json` contradict on key facts.

`docs/brand-strategy.md` is audience and competitor strategy, not brand facts.

## Stack

Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, CVA. Jest tests in `tests/` (UI specs in `tests/unit`, API and data suites in `tests/api`). Hosting Vercel, DNS Cloudflare, analytics Google Tag Manager. No database: all data lives in the management app.

## Relationship with OJ-AnchorManagementTools

The management app (`/Users/peterpitcher/Cursor/OJ-AnchorManagementTools`, Supabase) is the sole source of truth. This site reads and writes only through its REST API at `management.orangejelly.co.uk`, proxied by `app/api/*/route.ts` using `ANCHOR_API_KEY`. Never call the management API from client components and never expose the key. Local dev points at the live API: a test POST creates a real booking and a real SMS, so make sure the guard you rely on is server-side.

Endpoints used: `GET /business/hours`, `GET /table-bookings/availability`, `POST /table-bookings`, `GET /events`, `GET /menus`.

### Special hours and kitchen rules

`/business/hours` returns per-date overrides from the management `special_hours` table.

- `kitchen: null` means the kitchen is closed that day. Treat it as a deliberate signal, not missing data. Resolve special versus regular kitchen data with `??`, never `||` (the `||` version let `null` fall through to regular hours in March 2026).
- `is_kitchen_closed: true` is the explicit closure flag; `is_closed: true` is a full venue closure; `schedule_config: []` is a custom booking schedule for that date.
- `sunday_lunch` and `food` bookings need the kitchen; `drinks` does not. If the kitchen is closed, food and sunday_lunch slots must be empty and drinks slots unaffected.
- Hours are effective-dated (`upcomingVersions`). `kitchen` is a flattened span; `schedule_config` holds the real sittings.

Key files: `lib/api/client.ts` holds the `anchorAPI` client (`lib/api.ts` is only a re-export barrel), `lib/table-booking-service-windows.ts` has `resolveServiceRanges()`, and `lib/hours-utils.ts` has `getEffectiveDayHours()` and `isKitchenClosed()`. Use `lib/hours-utils.ts` for all hours logic; never re-implement hours parsing inline.

**Availability fails closed, and must stay that way.** `app/api/table-bookings/availability/route.ts` returns no slots and the phone number when the management API gives no table read-out or answers "unknown", and a 503 with the phone number if the call throws. The client registers no fallback for availability, and skips its fallback entirely for `/business/hours` so stale times are never served. The site once advertised times when the pub was physically full, because local slot maths cannot see tables, joins or private bookings. Never reintroduce locally calculated slots as an outage fallback.

## Critical business rules (full detail in docs/SSOT.md)

- Brand: "The Anchor", never "The Anchor Pub". Contact manager@the-anchor.pub, 01753 682707. Stanwell Moor, near Heathrow Airport.
- Monday kitchen: always closed unless a special-hours record explicitly opens it.
- Sunday lunch: walk-ins welcome 1pm to 6pm. No pre-order, no Saturday cutoff, no per-roast prepayment (since the 17 May 2026 walk-in launch). Blocked only if the kitchen is closed that date.
- Sunday roast menu: Beef Topside, Pork Leg, Turkey with Stuffing Ball, Beef and Ale Pie, Chicken and Wild Mushroom Pie, Vegan Wellington (vegan, never "vegetarian"), Kids Roast. Prices are always live from the management DB; never hardcode them. Menu prices are shown bare, with no currency symbol, by design.
- Group deposit: 15 or more people, any day, any booking type: £10 per person, deducted from the bill.
- Never claim: breakfast, delivery, Sky or TNT Sports (terrestrial channels only), guest ales or real ale, wedding receptions, accessible toilet, baby changing. No seasonal event content unless the SSOT confirms the event is running.
- No em dashes in customer-facing text. Event posters are square (1:1); use square containers and never crop or stretch them.

## SEO and domain

- Canonical domain `https://www.the-anchor.pub`. Cloudflare TLS must be Full or Full (strict), never Flexible (redirect loops).
- The root layout sets `metadataBase` only. Every page sets `alternates: { canonical: './' }`. Never hardcode `canonical` in the root layout: it once made every page claim to be the homepage.
- New pages: `title: 'Page Title | The Anchor Stanwell Moor'`, a description, the relative canonical, and add the route to `app/sitemap.ts`.
- Google-documented SEO standards only: no sitemap priority tricks, no self-serving review schema.
- Verify redirects end to end: assert the destination equals the rule's target and check which layer each rule runs in.

## Code patterns

- Default to Server Components; add `'use client'` only for interactivity. Use `cva()` for variants, not ad-hoc Tailwind conditionals. Import with the `@/` alias.
- Analytics: call the `trackEventName('source_location')` helpers from `lib/gtm-events.ts` in client components.
- Page copy lives in `content/`; homepage monthly copy in `lib/monthly-copy.ts`. Run `npm run optimize:images` before committing imagery.
- Screenshot the rendered element in the browser before diagnosing a "looks wrong" report; if a shared component fails on one page, diff that page's mount, not the component.

## Environment variables

`ANCHOR_API_KEY` (management API), `NEXT_PUBLIC_GTM_ID` (GTM container), `NEXT_PUBLIC_AVIATIONSTACK_API_KEY` (flight data for the Heathrow parking pages).
