# Phase 7 · Group C — Food, display & misc components (light-theme conversion)

Branch: `codex/redesign-build`. No commit, no build (per brief). Markup/classes only — zero logic change.

## Components converted to light theme

| File | What changed | Deliberate dark kept |
|---|---|---|
| `components/features/MenuDisplay.tsx` | Alternating category sections `bg-anchor-green-raised/deep` → `bg-surface-sunk`/`bg-canvas`; headings/descriptions cream → `text-ink-strong`/`text-ink-muted`; item names `gold-bright` → `text-ink-strong`, prices `gold-dark` → `text-accent-text`; focus ring + list hover/focus → `ring-accent-text`/`bg-surface-sunk`/`bg-accent/10`. Removed `font-bold` from display headings. | — (kitchen-hours `bg-anchor-gold-dark/10` tint is a decorative gold tint, valid on light) |
| `components/features/AllergenFilterBar.tsx` | Slide-in dialog panel `bg-anchor-green-card` → `bg-surface`; header/footer borders → `border-line`; cream text → `text-ink*`; section labels `gold-dark/60` → `text-accent-text`; diet/allergen toggle resting states → `bg-surface-sunk text-ink`; selected states → `bg-anchor-green`/`bg-anchor-gold-dark` (was `emerald-600`/`amber-500`); trigger button selected → `bg-anchor-gold-dark`, resting → `bg-anchor-green`; clear-all `red-400` → `text-anchor-danger`. | — |
| `components/food/DietaryMenuNav.tsx` | Chip links collapsed to spec chip pattern (`rounded-pill`, 44px min-h, `border-line-strong`, white surface; selected `bg-anchor-green text-white`); PDF button matched. Removed now-unused `badgeColor` from map destructure. | — |
| `components/food/MenuAnchorNav.tsx` | Sticky tab rail `bg-anchor-green-card/90` → `bg-surface/90`, ring → `ring-line`; resting tab `bg-anchor-green-raised` → `bg-surface-sunk text-ink`, hover gold → `text-accent-text`. Active tab kept `bg-anchor-green text-white` (intentional). | — |
| `components/food/HeathrowFoodBestFor.tsx` | Section `bg-anchor-green-raised` → `bg-surface-sunk`, border → `border-line`; inner tiles → light `bg-surface border-line shadow-sm`; cream/gold-bright text → `text-ink-strong`/`text-ink-muted`. | — |
| `components/features/Gallery.tsx` | Grid caption strip `bg-anchor-green-raised` → `bg-surface`, text → `text-ink-muted`. | Photo lightbox scrim (`bg-black/90`, white nav/close buttons, `bg-black/70` caption, counter) — photo lightbox, left dark per recipe. Hover-overlay `bg-anchor-charcoal/90` icon + `text-anchor-green` magnifier sit over a photo, left as-is. |
| `components/features/BlogPost.tsx` | Breadcrumb/share `bg-anchor-green-raised` → `bg-surface-sunk`; article `bg-anchor-green-deep` → `bg-canvas` with full light prose remap (ink headings/body/lists, `text-accent-text` links, `border-line` table/hr/blockquote); nav cards → light `<Card hover>` with `text-ink-strong`/`text-accent-text` hover; CTA buttons fixed (was `variant="outline"` hacked with gold bg) → clean `primary` + `outline`. | Hero over photo (`text-white` H1, `bg-white/20` tag badges over dark gradient). Closing CTA band tagged `theme-dark bg-anchor-green` (green CtaBand) with cream heading — deliberate green band. |
| `components/FindUsSection.tsx` | Heading/address cream → `text-ink-strong`/`text-ink-muted`; phone link gold-dark → `text-accent-text`. | — |
| `components/DirectionsCard.tsx` | Retired `card-dark rounded-none` → light `bg-surface border-line rounded-md shadow-sm`; gold-bright/gold-dark/cream → `text-ink-strong`/`text-accent-text`/`text-ink-muted`; border → `border-line`. Removed `font-bold` from h3. | — (renders in light page bodies; note: spec §7.6 journey-times card is a separate dark card — this generic directions component sits on light content) |
| `components/ManagersSpecial.tsx` | Retired `card-dark rounded-none` → explicit dark card surfaces tagged `theme-dark bg-anchor-green-card border-line-gold rounded-xs`; compact `amber-600` accent → `text-anchor-gold-bright`. | **Deliberate dark** — purple-gradient promo banner with cream text on dark inner panels is a promotional dark card; kept dark, just removed the retired class and `theme-dark`-scoped it. Inner price box / panels stay dark. |
| `components/plane-spotting/PlaneSpottingBookingPrompt.tsx` | Floating toast `bg-anchor-green-card` → `bg-surface border-line`; cream/gold-bright text → `text-ink*`/`text-accent-text`; icon tile → `bg-anchor-gold/10 text-accent-text`; CTA hover gold → green. | — |
| `components/plane-spotting/PlaneSpottingScheduleNote.tsx` | All 3 variants (compact/panel/subtle) cream/dark-green → light surfaces, `text-ink*`/`text-accent-text`, `border-line`/`border-line-gold`; panel CTA hover gold → green. | — |
| `components/features/christmas/ChristmasLightbox.tsx` | Modal shell retired `card-dark rounded-none` → `bg-surface border-line rounded-md`; body heading/copy cream → `text-ink-strong`/`text-ink-muted`; "book later" link → `text-ink-muted`. | Photo hero-image area (`bg-red-900`, `text-white`, `bg-black/40` scrim, `text-red-100`) and backdrop `bg-black/80` + white close button over image — photo/scrim area, kept dark per recipe. |

## Dead component flagged (NOT edited)

- `components/UpcomingEvents.tsx` — **zero importers** (`rg -l "from '@/components/UpcomingEvents'" app components` → none). Live one is `components/events/UpcomingEvents.tsx`. Left untouched; flag for Phase 6 deletion.

## Verification

- `npx tsc --noEmit` → **clean, 0 errors** (full repo). No errors in any owned file.
- Residual-dark audit on owned files → only deliberate-dark hits remain:
  - ManagersSpecial promo card (`theme-dark`-scoped dark promotional banner).
  - BlogPost closing green CtaBand (`theme-dark bg-anchor-green`) + hero-over-photo text + prose `<th>` green header.
  - Gallery photo lightbox scrim + hover-overlay-over-photo.
  - ChristmasLightbox photo hero-image area + modal backdrop.
- No `card-dark`, `prose-invert`, `anchor-green-deep/raised` left on light surfaces.

## Constraints honoured

- Phase-0 Tailwind names only; British English; no em dashes; no new deps.
- Nothing staged/committed; no build run; `docs/architecture/*` untouched.
- Display headings: removed stray `font-bold` where added by me (DM Serif single-weight rule).
