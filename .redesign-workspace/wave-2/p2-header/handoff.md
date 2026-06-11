# PR 2.2 — Header + Utility Strip + 4-Menu Dropdown Nav + Mobile Drawer + StatusBar restyle

Branch: `codex/redesign-build`. Spec refs: §5.2 (header), §5.6 (StatusBar), §6.3 (PromoCtas).

## Files changed
- `components/layout/Navigation.tsx` — full rewrite (two-bar header, dropdown nav, mobile drawer).
- `components/layout/StatusBar.tsx` — restyled to two variants (`nav` / `pill`); all data logic preserved.
- `components/layout/HeaderStatusSectionDirect.tsx` — now renders `<StatusBar variant="nav" />` (dropped the dark-theme date label / `text-white`).
- `components/layout/MobileHeaderStatus.tsx` — unused helper, retargeted to `variant="pill"` to keep it compiling.
- `components/hero/HeroWrapper.tsx` — its two `<StatusBar>` calls now use `variant="pill"` (dropped the removed `theme` prop / old variant union). Not owned by this PR but had to follow the StatusBar API change to keep the build green; HeroWrapper is slated for replacement by InteriorHero.
- `app/page.tsx` — homepage hero `<StatusBar variant="hero">` → `variant="pill"` (same reason).
- `tests/unit/StatusBar.boundary.test.tsx` — updated two variant literals (`hero`/`navigation` → `pill`/`nav`).

## Structure built (§5.2)
**Utility strip** (`hidden lg:block`): `bg-surface`, bottom `border-line` hairline, `py-2`, inside the 1280 container. Left = `statusComponent` (StatusBar `nav`). Right (`flex gap-4`): active promo CTAs as gold pills, then "Book parking" → `/heathrow-parking` (parking icon), then phone `tel:01753682707` showing "01753 682707" (phone icon). Quick links: Outfit 600 `text-sm text-ink`, 15px `text-accent-text` icons, hover `text-accent-text`.

**Main header**: `sticky top-0 z-[60]`, `bg-[rgba(250,248,243,0.9)]` + `backdrop-blur-md`, bottom `border-line`, inner height `h-[76px]`, 1280 container. Left = black wordmark `public/images/branding/the-anchor-pub-logo-black-transparent.png` (`h-[42px] w-auto`, links `/`, `aria-label="The Anchor, home"`). Centre = primary nav (`hidden lg:flex`). Right = `Book a table` `<Button variant="primary" size="sm">` (asChild → Link) `/book-table` + burger (`lg:hidden`, 3 × `w-6 h-0.5 bg-ink-strong` bars).

**Primary nav — exact 4-item model, in order**: Food (`/food-menu`) · Private Hire (`/private-hire`) · What's On (`/whats-on`) · Find Us (`/find-us`). Old "Sunday Roast" and "More" top-level items dropped. Sub-item labels/descriptions verbatim from spec §5.2.

**Dropdown panel**: `absolute left-0 top-full z-[70]`, `min-w-[460px]`, `grid grid-cols-2 gap-1`, `bg-surface rounded-md shadow-lg border-line p-3`. Opens on hover AND focus-within (group focus) plus click-through Link. Active/hover top-level link → `text-accent-text`. Sub-link: bold label `text-sm text-ink-strong` + description `text-xs text-ink-muted`, hover/focus `bg-surface-sunk`.

**Mobile drawer** (`lg:hidden`): burger toggles a fixed drawer below the 76px header (`top-[76px]`, `bg-surface`). Each top-level item is an accordion (chevron, `aria-expanded`/`aria-controls`) revealing its sub-links; then a "Book parking" link; then a CTA block = active promo CTAs (block/full-width) + full-width `Book a table` `<Button variant="primary" size="md" fullWidth>`.

## Promo CTAs + GTM + BusinessHours wiring — preserved
- **Promo mechanism unchanged**: the `promoCtaButtons` prop, `startsOn`/`endsOn`/`leadDays` filtering, `nowInLondon()`/`parseLondonDate()` London-time logic, and the 56-day default lead are copied verbatim into the new Navigation. Only the rendered markup changed (gold pill per §6.3: `bg-anchor-gold` white Outfit-600 `text-sm`, `px-4 py-1.5`, `rounded-pill`, 15px Lucide icon, hover `bg-anchor-gold-dark` + `-translate-y-0.5`; drawer variant is `w-full min-h-[44px]`). `app/layout.tsx` still passes `promoCtaButtons` + `statusComponent` — not modified.
- **GTM**: `trackNavigationClick` fires on every top-level, dropdown, quick-link, phone, promo and Book-a-table click (correct `level`/`deviceType`/`location`). `trackModalOpen` / `trackModalEngage` / `trackModalClose` lifecycle for the mobile drawer preserved (open, first-engagement, close-with-reason). `PhoneLink` (fallback) still calls `trackPhoneCallClick`.
- **BusinessHours**: StatusBar still uses `useBusinessHoursContext()` / `useBusinessHours()`, the boundary calculator (`getBarStatus`/`getKitchenStatus`), `??`-discipline kitchen resolution (null/`is_kitchen_closed` → "Closed today", never falls through), 60s + boundary refresh (via the hook/provider), and the static fallback from `business-hours-fallback`.

## StatusBar variant changes (§5.6)
- Replaced the four variants (`default`/`compact`/`navigation`/`hero`) + theme/labels props with **two**: `nav` (inline rows `gap-x-5`, `text-ink`) and `pill` (`bg-anchor-green`, `border-2 border-anchor-gold`, `rounded-pill`, `px-6 py-2`, white text, `shadow-md`, wraps + centres).
- Rows = 9px dot + Outfit-600 `text-sm`. Bar: open dot `#2fbf71` "Bar: Open · closes {12h}" / closed dot `--anchor-danger` "Bar: Opens …". Kitchen: open green / opens-later `--anchor-gold` warning / closed-or-null `--anchor-danger` "Kitchen: Closed today". Planes (optional `showPlaneSpotting`, default true for `nav`) from `getTodayPlaneSpottingWindow()`, `title` carries the caveat. 12-hour times throughout.
- `role="status" aria-live="polite"`; dot colour is never the sole signal (text always states the state). Stale "(updating...)" indicator retained.

## A11y notes
- Keyboard: dropdown trigger is a focusable Link with `aria-haspopup="menu"` / `aria-expanded` / `aria-controls`; panel opens on focus-within; `Escape` closes (handler on the group + global Escape closes the drawer). Sub-links are real `role="menuitem"` Links, tab/arrow reachable, visible focus ring.
- Mobile drawer: `role="dialog" aria-modal="true"`, focus trapped via `useFocusTrap`, body scroll locked while open, Escape and backdrop click close (`backdrop_click` reason), accordions use `aria-expanded`/`aria-controls`.
- Focus-visible rings (`ring-anchor-gold-dark`) on every interactive element; icon-only burger has `aria-label`; decorative dots/SVGs `aria-hidden`.

## O3 — href validation (every sub-nav href cross-checked against `app/`)
All 27 resolve to a real `page.tsx` (HTTP 200), no 404s. One redirect-chain avoided:

| Href | Result |
|---|---|
| /food-menu, /sunday-roast, /pizza-menu, /fish-and-chips-heathrow, /food-menu/vegan, /food-menu/gluten-free, /drinks | resolves (real page) |
| /private-hire, /private-hire#enquiry, /function-room-hire, /private-party-venue, /private-hire/wakes, /private-hire/christenings, /corporate-events, /christmas-parties | resolves |
| /whats-on, /whats-on#upcoming-events, /quiz-night, /music-bingo, /cash-bingo, /karaoke, /live-music | resolves |
| /find-us, /near-heathrow, /near-heathrow/terminal-5, /plane-spotting-heathrow | resolves |
| /heathrow-parking | resolves (used for both "Free Customer Parking" and "Book Heathrow Parking") |
| /free-parking | **real page BUT** also a 301 → `/heathrow-parking` (config/redirects/additional-redirects.json). Spec mapped "Free Customer Parking" → `/free-parking`; to avoid the redirect hop the nav links straight to `/heathrow-parking`. Flagged here per O3. |

## Verification (verbatim)
1. `npx tsc --noEmit` → **clean** (`EXIT_TSC=0`).
2. `npm run lint` (lint:next + audit:hero + audit:menu-pages) → **passes**: "✔ No ESLint warnings or errors"; "Hero audit passed for 123 page templates."; "Menu page audit passed."
3. `npm run build` → **succeeds**: clean `rm -rf .next` build "✓ Compiled successfully", "✓ Generating static pages (322/322)", `EXIT_BUILD=0`. (A first warm-cache run hit a transient `PageNotFoundError` on unrelated `/api/*` routes; the clean rebuild is green.)
4. Old-token audit → **0**: grep for `bg-anchor-green-dark|anchor-green-card|anchor-green-raised|card-dark|text-white/*` in `Navigation.tsx`/`StatusBar.tsx` returns nothing; only semantic tokens used.
5. Href validation (O3) → table above; all 200, `/free-parking` redirect avoided.
6. Booking-test set unchanged — the booking form was not touched. `StatusBar.boundary.test.tsx` → **13/13 pass**.

### Pre-existing failures (NOT caused by this PR)
Full `npx jest` shows 3 suites failing (`hero-template-regressions`, `TestimonialSection`, `ManagementTableBookingForm`, 38 tests). Verified by `git stash`-ing all PR files and re-running: the same 3 suites / 38 tests fail identically on the baseline. Unrelated to header/StatusBar.
