# The Anchor Style Guide

## Colour Usage Rules

### Background Colours & Text Combinations

**IMPORTANT**: Always ensure proper contrast for accessibility.

#### Green Backgrounds
- `bg-anchor-green` → MUST use `text-white`
- `bg-gradient-*-anchor-green` → MUST use `text-white`
- Never use `text-anchor-green` on green backgrounds

#### Gold Backgrounds
- `bg-anchor-gold` → Use `text-white` or `text-anchor-green`
- `bg-anchor-gold-light` → Use `text-anchor-green`

#### Text Colours
- `text-anchor-green` → Only use on white, light gray, or cream backgrounds
- `text-anchor-gold` → Can be used on white, dark backgrounds, or as accent
- `text-white` → Use on all dark backgrounds (green, charcoal, dark gradients)

### Component Guidelines

#### Sections with Brand Colours
```tsx
// ✅ CORRECT - White text on green
<section className="bg-anchor-green text-white">
  <h2 className="text-3xl font-bold">Title</h2>
</section>

// ❌ WRONG - Green text on green
<section className="bg-anchor-green">
  <h2 className="text-3xl font-bold text-anchor-green">Title</h2>
</section>
```

#### Headings
- On white/light backgrounds: Use `text-anchor-green`
- On green backgrounds: Use `text-white` (never `text-anchor-green`)
- On dark backgrounds: Use `text-white`

### Standard Components

Use the provided UI components to ensure consistency:
- `GreenSection` - Automatically enforces white text
- `StatusBar` - Has built-in theming with proper contrast
- `CallToAction` - Variants handle contrast automatically

## Hero Variants

The refreshed hero system centres on the `/food-menu` layout. All heroes should opt into one of the sanctioned variants so the wrapper can handle spacing, overlays, CTAs, and status bar behaviour automatically.

### `default` (Food Menu baseline)
- `size`: `large`
- `alignment`: `center`
- `overlay`: `gradient` (frosted glass over photography)
- `statusBar`: enabled, `position: below`, `variant: hero`, theme `frosted`
- CTA layout: primary + optional secondary buttons (stacked on mobile, inline from `sm`)
- Tag treatment: white frosted chips (`variant: default`, `size: small`)

Use this for buffet/general marketing pages that should look like `/food-menu`, `/near-heathrow`, `/plane-spotting-heathrow`, etc.

### `promo`
- `size`: `large`
- `alignment`: `center`
- `overlay`: `dark` gradient for dramatic campaign art
- `statusBar`: off by default (can be re-enabled per page)
- CTA layout: emphasised primary button + optional secondary row copy
- Tag treatment: vivid tones (`variant: primary | warning | success`) for urgency

Ideal for seasonal pushes (drag shows, bingo nights) where the art is bold and CTAs should pop.

### `feature`
- `size`: `medium`
- `alignment`: `left`
- `overlay`: `light`
- `statusBar`: hidden
- CTA layout: single inline button/link row
- Tag treatment: editorial badges (`variant: default`) that sit inline with copy

Use on blog listing/detail pages and documentation-style routes that need lighter presentation.

### `dark`
- `size`: `hero`
- `alignment`: `center`
- `overlay`: `gradient`
- `statusBar`: optional; defaults to off
- CTA layout: stacked block with optional tertiary info
- Tag treatment: glass chips with white text (see `tagStyle: glass`)

Reserved for the homepage or full-bleed campaign takeovers that require maximum height.

## Hero Tokens

### Overlays
- `light`: `bg-black/25` — soft wash for editorial photography.
- `medium`: `bg-black/45` — use sparingly when contrast needs a lift.
- `dark`: `bg-black/65` — pair with high-impact art (used by `promo`).
- `gradient`: `bg-gradient-to-b from-black/55 via-black/30 to-black/65` — default frosted gradient.

### Status Bar Themes
- `frosted`: `bg-white/80 border border-white/60 text-anchor-green accent text-anchor-gold`.
- `darkGlass`: `bg-black/40 border border-white/20 text-white accent text-white/70`.
- `brand`: `bg-anchor-green border border-anchor-gold text-white accent text-anchor-gold`.

Variants map these themes automatically but can be overridden for specific campaigns.

### CTA Layouts
- `cta/stacked`: `flex flex-col gap-4 sm:flex-row sm:items-center justify-center`.
- `cta/inline-left`: `flex flex-col sm:flex-row gap-3 justify-start`.
- `cta/inline-center`: `flex flex-col sm:flex-row gap-3 justify-center`.

The wrapper applies these utility bundles; pass bare buttons/links as `primaryCta` and `secondaryCta`.

### Tag Chips
- Default glass chip: `backdrop-blur-sm rounded-full px-3 py-1.5 bg-white/90 text-gray-800`.
- Glass on dark: `bg-white/15 text-white border border-white/20`.
- Promo highlight: use `variant: primary` or `warning` for urgency with emoji prefixes.

Stay within these options unless a brand review signs off on a custom presentation.

### Image Placement
- Store hero source images in `public/images/page-headers/<route>/` with a single hero asset per folder.
- Optimise for 16:9 subjects with safe cropping around focal planes—The wrapper honours CSS custom properties `--hero-ox`, `--hero-oy-mobile`, and `--hero-oy-desktop` for precision.
- Prefer photography with clear subject separation so the gradient overlay keeps copy readable.
- Add or refresh alt text in `lib/page-header-images.ts` whenever art direction changes.

### CTA Conventions
- `primaryCta` should be the highest intent action (usually booking) and should respect the variant's default `Button` size (`lg`).
- Use `secondaryCta` for supportive actions (menus, directions, WhatsApp) and keep them scoped to two or three buttons unless marketing signs off.
- Reserve `secondaryInfo` for short urgency callouts (deposits, availability windows). Long-form copy belongs in the body content beneath the hero.
- Avoid custom flex wrappers; let the variant layouts handle stacking, gap, and alignment.

### Do / Don't
- **Do**: Pick the variant that matches business intent (`default` for evergreen, `promo` for campaigns, `feature` for editorial, `dark` for homepage takeovers).
- **Do**: Keep tags concise (≤4) with emojis where they reinforce the message.
- **Do**: Use `ctaContainerClassName` or `ctaContainerProps` sparingly for analytics hooks like `data-sticky-cta-guard`.
- **Don't**: Reapply `size`, `overlay`, or bespoke layouts unless a design review approves an exception.
- **Don't**: Inject ad-hoc status bars; let the variant or explicit props control placement/theme.
