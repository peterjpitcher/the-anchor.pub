# Phase 5, PR 5.10a — Shared Components Sweep (Structural Group)

Branch: `codex/redesign-build`. No commit, no build (per brief).
All changes are class/markup only — no behaviour, logic, or prop-contract changes.

## Per-component outcome

| Component | Outcome |
|---|---|
| `components/ui/layout/Section.tsx` | **Re-themed (highest-leverage fix).** Background variants: `white`→`bg-surface`, `gray`→`bg-surface-sunk`, `cream`→`bg-canvas`, `transparent` unchanged. `dark` kept deliberately dark via `theme-dark bg-anchor-green-deep text-anchor-cream-text`. This flips every page's `background="white"`/`"cream"`/`"gray"` section to true light surfaces. |
| `components/InfoBox.tsx` | Re-themed. `card-dark rounded-none`→`bg-surface border border-line rounded-md shadow-sm`; cream/gold text → `text-ink-strong`/`text-ink`/`text-ink-muted`. |
| `components/FeatureCard.tsx` | Re-themed. base `card-dark`→light card; `cream` variant `bg-anchor-green-raised`→`bg-canvas`; `colored` default `bg-anchor-green-deep`→`bg-surface-sunk`; title `text-anchor-gold-bright`→`text-accent-text`; body → `text-ink`; hover shadow → `shadow-lg`. |
| `components/PricingCard.tsx` | Re-themed (imported by `app/drinks/managers-special/page.tsx`). `card-dark`→light card; gold-dark tints → `border-line(-gold)`/`bg-surface`; cream text → `text-ink-*`; price `text-anchor-gold-bright`→`text-accent-text`; savings pill → sand badge; radii → `rounded-md`/`rounded-pill`; BEST VALUE badge → `bg-anchor-gold`. |
| `components/QuickInfoGrid.tsx` | Re-themed. `card-dark rounded-none`→`bg-surface border border-line shadow-sm rounded-md`; title → `text-accent-text`; subtitle → `text-ink`. |
| `components/StaticHoursSummary.tsx` | Re-themed. green-card surface → `bg-surface border-line shadow-sm rounded-md`; heading → `text-accent-text`; body → `text-ink`/`text-ink-muted`. |
| `components/BusinessHours.tsx` | Re-themed (25 importers). Loading + error blocks → light surfaces (error uses `border-anchor-danger/30`, `text-anchor-danger`). All `text-white*` → `text-ink-strong`/`text-ink`/`text-ink-muted`. Special-hours yellow accents (`text-yellow-400`/`text-amber-300`) → `text-accent-text font-semibold` (colour-is-not-sole-indicator preserved via font-weight + ring). Today/changed highlight rows → `bg-surface-sunk` + `ring-line-strong`/`ring-line-gold`. Rounded → `rounded-sm`. No logic touched (kitchen `??` resolution, date logic unchanged). |
| `components/CTASection.tsx` | **Deliberate coloured band — kept dark.** Added `theme-dark` to green/red/dark variants so descendant semantic tokens resolve dark; `bg-red-600`→`bg-anchor-danger`. Legacy `section-spacing`→`py-section-y`. The email-link `white`-branch (line ~122) keeps `bg-anchor-green-card text-anchor-cream-text …` **intentionally** — it sits inside the dark CTA band; correct there. |
| `components/CookieBanner.tsx` | Re-themed (banner bar + preferences modal). green-card surfaces → `bg-surface border-line shadow-lg`; cream/gold text → `text-ink-*`/`text-accent-text`; toggle track → `bg-surface-sunk border-line`, checked → `bg-anchor-green`; radii → `rounded-md`/`rounded-sm`. Modal scrim `bg-black/70` intentionally kept (overlay). |
| `components/announcements/LaunchAnnouncement.tsx` | Re-themed VARIANT_CLASSES. gold-dark tints → `bg-anchor-gold/1x`; cream text → `text-accent-text`/`text-ink`/`text-ink-muted`; `rounded-lg`→`rounded-md`; slim border → `border-line-gold`. (`LaunchAnnouncementClient.tsx` is presentation-agnostic — applies passed className — no change needed.) |
| `components/ErrorBoundary.tsx` | Re-themed default fallback: cream text → `text-ink-strong`/`text-ink-muted`. |
| `components/ui/feedback/Alert.tsx` | Re-themed. Variant surfaces green-raised → tinted light (`bg-surface`/`bg-anchor-success/10`/`bg-anchor-gold/10`/`bg-anchor-danger/10`) + `text-ink`; borders → semantic; icon colours recoloured for light contrast (`text-blue-600`, `text-anchor-success`, `text-accent-text`, `text-anchor-danger`); `rounded-lg`→`rounded-md`. |
| `components/AlertBox.tsx` | Re-themed all 5 variants to tinted light surfaces + `text-ink`; titles → `text-accent-text`/semantic; `rounded-none`→`rounded-md shadow-sm`. |

### Left untouched (zero importers → flag for Phase 6 deletion)
- `components/LazySection.tsx` — no importers anywhere in app/components/lib.
- `components/EventBookingErrorBoundary.tsx` — no importers anywhere.

### Already correct (no change needed)
- `components/HeroBadge.tsx` (incl. `ItemBadge`, `HeroItem`) — composes the DS `Badge` primitive; no dark tokens.
- `components/ui/typography/PageTitle.tsx` — only size/weight classes, colour inherited; no dark tokens. (Brief referenced `components/typography/PageTitle.tsx`; actual path is `components/ui/typography/PageTitle.tsx`.)
- `components/announcements/LaunchAnnouncementClient.tsx` — no dark tokens; consumes className from LaunchAnnouncement.

## Deliberate dark kept (residual-dark audit exceptions)
1. `Section.tsx` `dark` variant — `theme-dark bg-anchor-green-deep text-anchor-cream-text` (per brief: keep dark dark).
2. `CTASection.tsx` is a coloured CTA band (green/red/charcoal) with `theme-dark`; its email-link `white`-branch uses `bg-anchor-green-card text-anchor-cream-text` — correct inside the dark band.

## Verify
- `npx tsc --noEmit` → **clean (exit 0, no output)**.
- Residual-dark audit on edited files → only the 2 deliberate dark-band exceptions listed above.
- Old-token / legacy-class audit (`section-spacing`, `rounded-none`) on edited files → 0.
- No prop/behaviour/logic changes. Nothing staged or committed. No build run.
