# Phase 8 — Convert remaining dark cards/panels to light

Branch: `codex/redesign-build`. Classes/markup + colour only — no logic/content/copy changes.

## Files converted (every spot)

### `<Card variant="dark">` → `<Card>` (light), 9 usages — now 0 remain in app pages
1. `app/find-us/page.tsx` (L398) — "Ready to Book?" card. Also converted its wrapping closing CTA section (`theme-dark bg-anchor-green py-section-y` → `bg-canvas py-section-y`) so the now-light card sits on a light section; converted inner text (`text-anchor-cream-text*` → `text-ink*`, `border-line-gold` → `border-line`).
2. `app/coach-parking-heathrow/page.tsx` (L66) — "The Driver Deal" card (dropped `variant="dark"`+`theme-dark`; text → ink). Sat beside light `<Card accent>` cards.
3. `app/join-our-team/page.tsx` (L176) — facts card + its section wrapper (`theme-dark bg-anchor-green-deep border-b border-anchor-gold-dark/15` → `bg-surface-sunk border-b border-line`); `RecruitmentFact` text (`text-anchor-gold-bright` → `text-accent-text`, `text-anchor-cream-text` → `text-ink-strong`).
4. `app/join-our-team/bar-staff/page.tsx` (L83) — same pattern (section wrapper + card + `RoleFact` text).
5. `app/join-our-team/kitchen-team/page.tsx` (L83) — same pattern (section wrapper + card + `RoleFact` text).
6. `app/pre-flight-meal/page.tsx` (L104) — "Taxi Service" card (sat in grid beside a light card).
7. `app/music-bingo/page.tsx` (L518) — "Music Bingo house rules" card.
8. `app/pub-near-hilton-heathrow/page.tsx` (L149) — "Client Dinner" card (gold heading → `text-accent-text`).
9. `app/quiz-night/page.tsx` (L484) — "Quiz Night House Rules" card.

### Green event-header strips inside light event cards → light header (`bg-surface-sunk` + `border-b border-line`, text → ink)
- `app/music-bingo/page.tsx` (L206)
- `app/cash-bingo/page.tsx` (L186)
- `app/karaoke/page.tsx` (L182)
- `app/live-music/page.tsx` (L178)
- `app/quiz-night/page.tsx` (L203)

### Inline dark-green content panel → light
- `app/near-heathrow/terminal-5/page.tsx` (L540) — "Experience Real British Pub Culture" panel (`theme-dark bg-anchor-green-card border-line-gold` → `bg-surface border-line`; text → ink).

### Token tidy (light element, border token only)
- `app/karaoke/page.tsx` (L500) — GoogleMapEmbed border `border-anchor-gold-dark/15` → `border-line` (already a light element).

## Conversion recipe applied
- `bg-anchor-green-deep`/`-card` → `bg-surface` / `bg-surface-sunk` / `bg-canvas` (section)
- event-header green strip → `bg-surface-sunk` + `border-b border-line`
- `text-anchor-cream-text` → `text-ink-strong` (headings) / `text-ink` (body); `text-white/70-90` → `text-ink-muted`
- `text-anchor-gold-bright` → `text-accent-text`
- `border-line-gold` / `border-anchor-gold-dark/15` → `border-line`
- Dropped `variant="dark"` and `theme-dark`; kept `accent`, all copy/links/structure/ARIA.

## Intentionally KEPT DARK (structural full-width bands + content sitting on them)
- Heroes: `components/hero/InteriorHero.tsx`, `app/_components/HomeHero.tsx`.
- `components/AmenityStrip.tsx`, `components/CtaBand.tsx`, `components/layout/Footer.tsx`.
- The `Card` `dark` variant definition + its test (left intact; just no page uses it now).
- `RoleHeroFact` chip in `app/join-our-team/_components/RecruitmentRolePage.tsx` (L169) — `border-white/20 bg-black/25 text-white` overlay on the hero image.
- Closing CTA bands and content on them (kept green by design):
  - Blog CTA sections: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/blog/tag/[tag]/page.tsx`, `app/blog/tags/page.tsx` (`theme-dark bg-anchor-green py-section-y`).
  - `FAQAccordionWithSchema className="bg-anchor-green-deep"` (full-width FAQ band) on the seasonal/event pages: easter, halloween, bonfire-night, boxing-day, new-years-eve, mothers-day, fathers-day, valentines-day, st-patricks-day, bank-holiday-weekends; and `bg-anchor-green-card` band on summer-garden-parties.
  - `text-anchor-cream-text/*` copy inside `CtaBand` children on corporate-events, function-room-hire, private-party-venue, about, our-pub, sustainability, safety-and-respect, heathrow-hotels-pub, m25-junction-14-pub, beer-garden, restaurants-near-heathrow.
  - Sat-nav "TW19 6AQ" postcode panels (`bg-anchor-green-card`) inside the green `CtaBand` on find-us and near-heathrow terminal-2/3/4/5.
  - Sweepstake green avatar circle inside the kept sweepstake panel (`app/live-sport/world-cup/sweepstake/page.tsx` L279, L240).

## Verification (verbatim)
1. `npx tsc --noEmit` → clean (no output).
2. `npm run lint` → "✔ No ESLint warnings or errors"; "Hero audit passed for 123 page templates."; "Menu page audit passed."
3. `npm run build` → succeeded.
4. `rg -n 'variant="dark"' app --glob '*.tsx'` → 0 matches.
5. `rg -n 'bg-anchor-green-(deep|raised|card)|text-anchor-cream-text' app --glob '*.tsx'` (excluding HomeHero) → only the KEPT structural-band matches listed above; no content card/panel on a light page remains dark.
6. `npm test` → Test Suites: 1 failed (`tests/unit/ManagementTableBookingForm.test.tsx` — pre-existing baseline), 79 passed. No NEW failures.
