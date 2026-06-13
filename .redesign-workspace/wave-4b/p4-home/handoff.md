# PR 4.1 — Homepage template (spec §7.1) — Handoff

Branch: `codex/redesign-build`. Uncommitted, no build run (per brief).

## Files
- `app/page.tsx` — rewritten to the §7.1 section stack.
- `app/_components/HomeHero.tsx` — new page-local special hero.
- `app/_components/HomeFaq.tsx` — new page-local FAQ accordion + FAQPage JSON-LD.

## Sections built (in spec order)
1. **HomeHero** (special, `.theme-dark`, min-h `clamp(560px,84vh,760px)`, content centred, max-w-880px). Scrim = exact radial+linear per §7.1; grain 6% via `var(--grain)`. In order: white wordmark (`clamp(180px,26vw,300px)`, drop-shadow) · H1 "Eat, Drink, Enjoy." (`font-display text-display`, line-height 0.95, cream) · script "Where everyone's welcome" (`font-script`, text-script ×1.2, gold-bright) · lead (max-w-54ch) · actions Book a table (BookTableButton primary lg) + View food menu (outline lg → /food-menu) · `<StatusBar variant="pill" />` · rating row (5 gold lucide Stars + "4.6 from 238 Google reviews · Highest-rated independent pub near Heathrow") · 4 `<Badge variant="sand">` (Free parking · Dog friendly · Beer garden · 7 mins from T5). Mobile: centred, actions stack full-width.
2. **AmenityStrip** (shared, defaults).
3. **Path cards** (`bg-canvas`): SectionHeading kicker "Stanwell Moor Village" / title "What are you here for?" / lead. 4-up `Card accent hover`, whole card is ONE `<Link>` (no nested links), 52px sand circle icons (utensils/beef/users/party-popper) → /book-table, /sunday-roast, /private-hire, /whats-on.
4. **Coming up** (`bg-surface`): SectionHeading kicker "What's on" / script "Always something happening" / title "Coming up at The Anchor". Centred "View all events" primary lg → /whats-on.
5. **What makes us special** (`bg-canvas`): SectionHeading kicker "More than a pub". 3-up `Card accent hover`, icons piggy-bank/plane/heart, fact-checked copy.
6. **CtaBand** (shared): "Ready to visit?" + walk-ins copy + Book a table (primary) + See the menu (outline → /food-menu).
7. **Gallery** (`bg-surface`): SectionHeading "Life at The Anchor / Take a look around". 3-up linked image cards (240px media) → /sunday-roast, /near-heathrow, /private-hire.
8. **FAQ** (`bg-canvas`): SectionHeading "Good to know / Frequently asked questions" + `<HomeFaq />`.
9. **Find Us** (`bg-surface-sunk`, `id="visit-us"`, `scroll-mt-24`): SectionHeading kicker "Visit Us" / script "Pop in and say hello" / title "Ready for a proper pub near Heathrow?". 2-col: `Card accent` (address + plane/bus/parking list + DirectionsButton outline lg full-width, map-pin icon → Google Maps URL) + map iframe panel (min-h 360px, rounded-md). Below: full-width `Card accent` "Opening hours & flight path" + `<WeekHours />`.

## Events: fetch + schema
- New async server component `HomeUpcomingEvents` calls `getUpcomingEvents(3)` from `@/lib/api` server-side (same source as the old `NextEventServer`; avoids an HTTP round-trip vs `/api/events?limit=3` which wraps the same call). Wrapped in `<Suspense>` with a skeleton.
- Emits `<EventSchema event={...} />` per event (UpcomingEvents is presentational and emits no schema), preserving the per-event JSON-LD the old page emitted. Empty state = `Card accent`.

## WeekHours inside provider
- `WeekHours` (client, uses `useBusinessHoursContext`) renders inside the homepage, which is inside `<BusinessHoursProvider>` (wraps children in `app/layout.tsx` lines 252–295). Confirmed in scope.

## FAQ + SSOT verification
All 5 answers checked against `docs/SSOT.md`:
- Heathrow distance "7 minutes from T5", buses **441, 442 & 555** (SSOT §2).
- Parking "20 free customer parking spaces", no time limit (SSOT §6).
- Dogs welcome throughout + beer garden, water bowls (SSOT §3/§9).
- **Kitchen closed on Mondays**; food Tue–Sun, roast Sundays; live hours; phone 01753 682707 (SSOT §3/§4).
- Walk-ins welcome, booking recommended weekends/roast, online or 01753 682707 (SSOT §7).
- `HomeFaq` emits FAQPage JSON-LD built from the SAME `FAQS` array it renders, so schema matches rendered Q&As exactly. First item open by default; one open at a time; `aria-expanded`/`aria-controls`; gold lucide `Plus` rotates 45° via `rotate-45`.

## Rating sourced (not hardcoded)
- HomeHero imports `DEFAULT_REVIEW_STATS` from `lib/google/review-utils.ts` → `{rating, totalReviews}` (4.6 / 238). No literal string.

## Metadata / JSON-LD / GTM / canonical preserved
- Metadata block + `alternates.canonical: '/'` + OG/Twitter kept verbatim.
- `<DeferredHomepageTrackers />` (GTM), `<SpeakableSchema />`, `<JsonLd data={[parkingFacilitySchema]} />` kept.
- Per-event `EventSchema` + FAQPage JSON-LD both emitted.

## Constraints
- British English, sentence case, brand "The Anchor", 1751-safe (no founding-year claims made).
- No em dashes in rendered copy (verified; em dashes appear only in JSX/dev comments).
- Phase-0 tokens only: section backgrounds use `bg-canvas` / `bg-surface` / `bg-surface-sunk`; dark hero uses raw brand tokens inside `.theme-dark` (same pattern as CtaBand/AmenityStrip). No legacy `card-dark`/`card-warm`/`section-spacing`/`HeroWrapper`.
- No new deps (lucide-react already used across the shell components).

## Verify
1. `npx tsc --noEmit` → **clean for `app/page.tsx` + `app/_components/*`**. One pre-existing SIBLING error remains, not in scope: `app/whats-on/page.tsx(249,30)` TS2339 `Property 'price' does not exist` (PR 4.3 territory).
2. Old-token audit on my files → **0** legacy/dark-surface tokens on light sections (remaining `anchor-green-deep`/`anchor-cream-text`/`anchor-gold-bright` are inside the `.theme-dark` HomeHero, which is correct).
3. Confirmed: rating from review-utils · FAQ answers match SSOT + FAQ JSON-LD matches rendered Q&As · per-event JSON-LD still emitted · WeekHours inside provider · buses 441/442/555 · StatusBar pill present.

Not committed, not built.
