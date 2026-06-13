# Handoff — PR 5.10c: Shared Events / Menu / Sport / Misc Group

Branch: `codex/redesign-build`. No commit, no build (per brief). `npx tsc --noEmit` → **clean (exit 0)**.

## Method
Built a transitive-reachability map of every owned component before editing. Re-themed only components actually rendered by an app page (directly or transitively). Components with zero reachable importers were left untouched and flagged for Phase 6 deletion.

## Re-themed (reachable → now light)
| Component | Importer / reachability | Notes |
|---|---|---|
| `components/TerminalNavigation.tsx` | `app/near-heathrow/terminal-5/page.tsx` (light `bg-canvas` band) | muted label + gold links → `text-ink-muted` / `text-accent-text`. Also fixed a pre-existing `transition-colours` typo on one link. |
| `components/FlightStatus.tsx` | 4 terminal pages (terminal-2/3/4/5) | `card-dark rounded-none` → `bg-surface border-line rounded-md`; body cream→`text-ink*`; dividers→`border-line`. Green/gold header bands kept as deliberate brand fills, white→`text-ink-inverse`. `FlightDelayWidget` gold callout → `bg-surface-sunk border-line-gold`; amber-400/green-400 status → amber-700/green-700 for light contrast. |
| `components/features/six-nations/SixNationsFixtures.tsx` | `app/live-sport/six-nations/page.tsx` | DS `Card` already light; cream→`ink*`, gold borders/text→`line-gold`/`accent-text`, `bg-anchor-green-raised`→`bg-surface-sunk`, England highlight→`accent-text`, `rounded-full`→`rounded-pill`. Super Saturday badge keeps gold fill + `text-ink-inverse`. |
| `components/features/six-nations/SixNationsLightbox.tsx` | `app/live-sport/six-nations/page.tsx` | Modal shell `card-dark rounded-none`→`bg-surface border-line rounded-md`. Body text→`ink*`. Kept deliberate `bg-black/80` scrim + image-hero (`bg-anchor-green`, `bg-black/60` overlay, white text over photo). Subtitle gold over dark image bumped `gold-dark`→`gold-bright` for contrast. |
| `components/features/world-cup/WorldCup2026Fixtures.tsx` | `app/live-sport/world-cup/page.tsx` | DS `Card`; tint bands `green-raised`/`green-card`→`bg-surface-sunk`; chips (time/showing/England) → light `bg-surface(-sunk)` + `accent-text`/`ink-muted`; dividers→`border-line`; cream→`ink*`; `rounded-full`→`rounded-pill`; `text-amber-400`→`amber-700`. |

**No behaviour/logic/prop/markup-structure change** in any of the above — class-only edits plus the one `transition-colours`→`transition-colors` typo fix.

## Unused — NOT edited, flag for Phase 6 deletion (reachability)
- `FilteredMenuRenderer.tsx` (0 importers) → and therefore `MenuRenderer.tsx` (only imported by FilteredMenuRenderer; the `HeroBadge.tsx` "match" was a comment, not an import).
- `EventsToday.tsx`, `EventCategories.tsx`, `CategoryFilter.tsx`, `NextEvent.tsx`, `NextEventServer.tsx`, `EventAvailability.tsx`, `ProductDetails.tsx` — all 0 importers.
- `FilteredUpcomingEvents.tsx` (0 importers) → and therefore `FilteredUpcomingEventsClient.tsx` (only imported by FilteredUpcomingEvents).
- `ManagersSpecialSchedule.tsx` (0 importers) → and therefore `BotanicalsGrid.tsx` (only imported by ManagersSpecialSchedule).
- `components/features/CareersForm.tsx` — referenced only by `components/features/__tests__/CareersForm.test.tsx`; no app/page importer. CareersForm left untouched (logic + §4.4 form work skipped as dead).

## Verification
1. `npx tsc --noEmit` → exit 0, no errors.
2. Residual old/dark-token audit on the 5 reachable files (`anchor-cream-text|anchor-green-deep|anchor-green-raised|anchor-green-card|card-dark|prose-invert|rounded-none|text-amber-400|text-green-400`) → **0 hits, all CLEAN**.
3. Deliberate dark retained & listed: SixNationsLightbox image-hero (`bg-black/80` scrim, `bg-black/60` overlay, white text over photo); brand-coloured header bands in FlightStatus (`bg-anchor-green`/`bg-anchor-gold-dark` + `text-ink-inverse`) and the Six Nations "Super Saturday" gold badge. No `theme-dark` wrappers were needed.
