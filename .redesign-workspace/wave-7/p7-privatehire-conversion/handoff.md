# Wave 7, Group B — Private-hire, conversion & promo light-theme conversion

Branch: `codex/redesign-build` (HEAD `91a3053e`). No commit, no build run. tsc clean.

## Context note
By the time this ran, the branch had advanced to the "all phases complete" HEAD. 10 of the 11
owned files were ALREADY converted to light in committed work and my edits matched/re-applied
them. The one genuinely unconverted file was **`PrivateBookingCalculator.tsx`** (fully dark),
which is now converted. The high-impact `app/private-hire/layout.tsx` wrapper fix was already
in place (`bg-canvas`) and is confirmed.

## The layout wrapper fix (high-impact)
`app/private-hire/layout.tsx` line 16: `bg-anchor-green-deep min-h-screen` → `bg-canvas min-h-screen`.
The whole private-hire section no longer paints dark green full-screen; pages now sit on the
light page canvas. Structure/children unchanged.

## Components converted (markup/classes only — zero logic change)
- **PrivateBookingCalculator.tsx** — full conversion. Shell `card-dark`→`bg-surface` light card;
  promo header banners → light surfaces (`bg-surface-sunk`, `bg-anchor-green/5`); step-number
  badges keep gold border, text→`accent-text`; section headings→`ink-strong`; all field controls
  (date/guests/hours/qty) → §4.4 light field styling (`bg-surface`, `border-line-strong`,
  gold-dark focus ring); event-type chips → green-selected / light-outline; space + vendor
  selection cards → light surfaces, green selected state; catering rows + add-item modal →
  light surfaces with ink text and `accent-text` prices; loading/error states → light.
  **Footer total bar: deliberately kept as a dark green CTA band** (`theme-dark bg-anchor-green`,
  cream text + gold-bright accent, gold-dark→white primary button) — an on-brand green CTA band
  per D1, cream-on-green is the correct preserved-dark pairing. This accounts for the only 2
  residual `anchor-cream-text` hits.
- **PrivateBookingInquiryForm.tsx** — `card-dark` form shell → light card; all inputs → §4.4
  field styling; labels→`ink`; status banners (error/known/unknown) → light tints; lookup +
  submit buttons → gold-dark/white primary, light outline; success card → light.
- **PrivateBookingSection.tsx** — dark `bg-anchor-green-raised` section → `bg-surface-sunk`;
  copy → ink/accent-text.
- **conversion/ExitIntentBookingModal.tsx** — body text→ink; "No thanks"→light outline; CTA→gold-dark/white.
- **conversion/ScrollProgressBookingTooltip.tsx** — tooltip card → `bg-surface` + `text-ink`, accent-text link.
- **promos/PrivateHire2026PromoPopup.tsx** — ModalBody → `bg-surface`; countdown/checklist/
  copy → ink + accent-text; image-overlay subtitle gold-dark→gold-bright (sits on dark photo
  gradient — needs the bright variant for legibility); phone ghost button → ink-muted.
- **psychology/PsychBadge.tsx** — dark `/10` tints with `*-300` text (built for dark surfaces)
  → light-readable `*-50` bg / `*-700` text; authority variant → `accent-text`.
- **psychology/RegretReduction.tsx** — cream body → `ink-muted`; gold-bright check → `accent-text`.
- **features/CateringPackagesTable.tsx** — headings/cells → ink + accent-text; borders → line tokens.
- **features/VenueSpacesTable.tsx** — same table conversion.

## Deliberate dark KEPT
- **PrivateBookingCalculator footer total bar** — green CTA band (cream-on-green) — intentional.
- Did NOT touch `app/private-hire/_components/CateringPackagesCard.tsx` (Group C / deliberate dark card).

## Dependency / flag
- `ExitIntentBookingModal` and `PrivateHire2026PromoPopup` render inside the shared
  `components/ui/overlays/Modal.tsx` primitive, which still hardcodes a dark surface
  (`bg-anchor-green-card`, cream header/title text). That primitive is NOT in this group's
  ownership (Phase-1 primitive). My body/footer conversions are correct for once the Modal
  primitive itself is converted to a light surface; until then these two overlays will show a
  dark shell around light content. Flag for the primitive owner.

## Verification
1. `npx tsc --noEmit` → exit 0, clean (no errors in any group).
2. Residual-dark audit on owned files → 0 hits except the calculator footer (2, deliberate dark band).
3. private-hire layout no longer dark-wraps the section (`bg-canvas`); calculator/forms/modals/
   popups/tables render light; deliberate dark band preserved.
4. No logic change: calculator pricing/quote flow, form submission/lookup/Turnstile/honeypot,
   popup triggers/countdown, and all GTM tracking calls untouched — markup/classes only.

## Not done (per brief constraints)
- No commit, no build, no `docs/architecture/*` touched.
