# PR 2.4 — StickyCtas + AmenityStrip + CtaBand — Handoff

Branch: `codex/redesign-build`. Spec: `docs/redesign-spec.md` §5.4 / §5.5 / §5.7; plan §G PR 2.4.

## New components

- `components/layout/StickyCtas.tsx` (`'use client'`) — the single global sticky CTA bar (spec §5.4).
- `components/AmenityStrip.tsx` (server) — dark-green 4-up amenity band (spec §5.5).
- `components/CtaBand.tsx` (server) — green closing CTA band (spec §5.7).

## CtaBand API

```tsx
<CtaBand
  title="Ready to visit?"
  copy="Walk in any time…"             // optional, max 50ch
  primary={<Button variant="primary" size="lg" …/>}   // optional ReactNode
  secondary={<Button variant="outline" size="lg" …/>} // optional ReactNode
/>
// OR full control over the actions row:
<CtaBand title="…" copy="…">{/* any actions */}</CtaBand>
```

Props: `title` (required), `copy?`, `primary?`, `secondary?`, `children?`, `className?`.
Rule: if `children` is supplied it **wins** and `primary`/`secondary` are ignored. The
common case ("one primary lg + one outline lg") uses `primary`/`secondary`; `children`
is the escape hatch for non-standard action rows. Heading is `h2` (DM Serif, text-h2,
cream); the band wraps `theme-dark` on `bg-anchor-green`, `py-section-y`, 720px centred
column, actions flex-wrap centred with gap-3.

## AmenityStrip API

Props: `items?: AmenityItem[]` (default = the 4 SSOT-confirmed amenities), `className?`.
`AmenityItem = { icon: LucideIcon, title, subline }`. Defaults: square-parking "20 free
spaces / No fees while you visit" · plane "7 mins from T5 / Outside the ULEZ zone" · dog
"Dog friendly / Water bowls on us" · wifi "Free WiFi / Pub and beer garden". Grid
`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, `py-8`, `gap-6`; 48px gold-tinted icon tile
(`bg-[rgba(201,160,32,0.14)]` + `border-line-gold` + `rounded-xs`, cream 24px icon) +
bold cream title (text-base) + sage subline (text-sm). Semantic `<section aria-label>`
with `<ul>/<li>`.

## StickyCtas — behaviour & wiring

- **Wired globally** in `app/layout.tsx`: replaced `<FloatingActions />` (line ~282)
  with `<StickyCtas />`; import on line 10 swapped accordingly.
- Fixed bottom, full width, `z-[80]`, `bg-[rgba(255,255,255,0.96)]` + backdrop-blur,
  top `border-line` hairline, shadow `0 -6px 24px rgba(26,26,26,0.10)`, `py-3` +
  `pb-[calc(0.75rem+env(safe-area-inset-bottom))]`. Slide-in
  `translateY(125%)→0` using `--dur`/`--ease-out`; `aria-hidden` when hidden and
  `tabIndex={-1}` on every control while hidden (keeps it out of the tab order).
- **Hero-out reveal:** measures hero height via `[data-hero]` first (a `data-hero`
  marker was added to `components/hero/InteriorHero.tsx`'s `<section>`), then the first
  `main section`, else a documented `480px` fallback. Reveals when
  `scrollY > heroHeight - 90`. Re-measures on resize and route change.
- **Not rendered on `/book-table`** (`usePathname().startsWith('/book-table')` → returns
  `null`).
- Contents (1280 container, gap-3, right-aligned on lg): `Book a table` primary md →
  `/book-table` (flex-1 on mobile, natural width on lg); `View menu` outline md with
  `utensils` icon → `/food-menu` (label hidden `<640px` via `max-sm:sr-only`, icon +
  aria stay); 48px circular phone icon-button (`border-2 border-accent text-accent`)
  `tel:01753682707` `aria-label="Call The Anchor"`; 48px circular WhatsApp icon-button
  (`bg-anchor-success`, `message-circle` Lucide icon) → `https://wa.me/441753682707`
  target=_blank rel=noopener `aria-label="WhatsApp The Anchor"`.

### Analytics reuse (no recreated events)

- `Book a table` → `trackTableBookingClick('sticky_global')`
- `View menu` → `trackMenuView('food')`
- Phone → `trackPhoneCallClick({ phone: '01753682707', source: 'sticky_global' })`
- WhatsApp → `trackWhatsAppClick('sticky_global')`
- `trackStickyCtaShown` (existing, `lib/gtm-events.ts:837`) is fired **once per visible
  spell** with the seconds-visible measurement, flushed on hide / route change / unmount
  (same pattern as the old `FoodStickyCtaBar`). Context `'global'`, location
  `'sticky_bar'`, device type resolved from viewport width.

## Old CTA render sites removed (component files kept for Phase 6)

- `app/layout.tsx`: `FloatingActions` import + render removed.
- `app/sunday-lunch/page.tsx`: `StickyMobileBookingCTA` import + render removed.
- `app/events/[id]/page.tsx`: `EventStickyBookingCTA` import + the
  `{!bookingBlockReason ? (…) : null}` render block removed (the gating variables remain
  used elsewhere).
- `FoodStickyCtaBar` import + render removed from all 12 sites: `app/food-menu/page.tsx`,
  `app/food-menu/{gluten-free,vegan,vegetarian}/page.tsx`,
  `app/plane-spotting-heathrow/page.tsx`, `app/restaurants-near-heathrow/page.tsx`,
  `app/near-heathrow/page.tsx`, `app/near-heathrow/terminal-{2,3,4,5}/page.tsx`,
  `app/heathrow-layover-dining/page.tsx`. (Brief named food-menu + restaurants-near-
  heathrow; the near-heathrow terminals and heathrow-layover-dining rendered the same
  bar, so they were removed too to leave exactly one global bar with no duplicates.)
- Component files kept: `components/layout/FloatingActions.tsx`,
  `components/conversion/StickyMobileBookingCTA.tsx`,
  `components/food/FoodStickyCtaBar.tsx`, `components/events/EventStickyBookingCTA.tsx`.

## Verification (verbatim)

1. `npx tsc --noEmit` → clean (no output).
2. `npm run lint` → `✔ No ESLint warnings or errors`; `Hero audit passed for 123 page
   templates.`; `Menu page audit passed.`
3. `npm run build` → succeeds (full route table prerendered, no errors).
4. Old-token audit on the three new files → 0 hits (rg exit 1).
5. No-duplicate check: `rg -l "FloatingActions|StickyMobileBookingCTA|FoodStickyCtaBar|
   EventStickyBookingCTA" app` → no matches (all render sites removed); all four
   component files still exist under `components/`.
6. `npm test` → 38 failures in 3 suites (`hero-template-regressions`,
   `TestimonialSection`, `ManagementTableBookingForm`). **Confirmed pre-existing**: with
   `app`/`components` changes stashed, the same 3 suites fail with the identical 38
   failures — not introduced by this PR. The kept-file test
   `StickyMobileBookingCTA.test.tsx` passes (it targets the component, still present).
