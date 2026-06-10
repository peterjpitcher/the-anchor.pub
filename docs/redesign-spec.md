# The Anchor — Design System Migration Specification

**Status:** Approved for implementation · **Date:** 10 June 2026
**Source designs:** `~/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Design System Audit/`
**Audience:** This spec is written for a developer with no prior context. Follow it literally. Where a value is given, use that value. Where something is marked **VERIFY**, check the named source before shipping — do not guess.

---

## 0. How to use this document

1. Read §1 (decisions) and §2 (phase plan) first.
2. Work strictly in phase order. Each phase lists its own PRs. Do not start a phase until the previous one is merged.
3. Every PR must pass the verification pipeline before push: `npm run lint` → `npx tsc --noEmit` → `npm test` → `npm run build`.
4. **Never invent customer-facing facts.** `docs/SSOT.md` is canonical. The prototype contains placeholder content (menus, prices, event dates) that must NOT be copied verbatim — see §10.
5. The design source files referenced throughout:

| File | What it is |
|---|---|
| `_ds/…/tokens/*.css` | Canonical token values (colours, type, spacing, effects, base) |
| `_ds/…/components.css` | Canonical component CSS (`.anchor-btn`, `.anchor-badge`, `.anchor-card`, `.anchor-input`, `.anchor-heading`) |
| `site.css` | Layout/chrome CSS for everything else (`.ta-*` classes) — the geometry reference |
| `shell.jsx` | Header, footer, InteriorHero, amenity strip, CTA band, sticky CTA bar, nav model |
| `api.jsx` | Live-data components (StatusBar, WeekHours, events, promos) with API-shaped fixtures |
| `pages1.jsx` `pages2.jsx` `pages3.jsx` | The six page templates |
| `Design System Audit.html` | The audit: old → new mapping and migration checklist |
| `Page Layouts.html` | Desktop (1280) and mobile (390) renders + mobile behaviour notes |

---

## 1. Decisions and scope (agreed with the owner, 10 June 2026)

| # | Decision |
|---|---|
| D1 | **Theme:** the whole site moves from the current dark cinematic theme to the **light/cream theme** (`#faf8f3` page background). Dark green surfaces remain only for: heroes, the amenity strip, green CTA bands, dark cards and the footer. |
| D2 | **Scope:** full site, phased. Tokens and components first (cascades everywhere), then the six template pages, then every remaining route family per the mapping in §8. |
| D3 | **Navigation:** four top-level menus (Food, Private Hire, What's On, Find Us), each with a dropdown sub-nav. **Parking is a quick action**, not a top-level menu: a "Book parking" link in the utility strip and mobile menu, with parking pages housed under Find Us. (The migration checklist line "Parking added as a top-level menu" in the audit HTML is an error — ignore it.) |
| D4 | **Booking flow:** the redesign is a **restyle of the existing 4-step wizard** (find → choose → details → review). All current logic is preserved: availability API, returning-customer lookup, Turnstile, honeypot, PayPal group deposit. The prototype's 3-step form is a visual model only. |

### Assumptions log (record per workspace rules; flag to owner if wrong)

| # | Assumption |
|---|---|
| A1 | Header nav carries exactly the 4-menu model from `shell.jsx`. Pages not in it (About, Blog, Reviews, Careers, etc.) are reachable from the footer only. The current "More" menu and "Sunday Roast" top-level item are removed (Sunday Roast becomes a Food sub-item). |
| A2 | **Mobile drawer deviates from the prototype deliberately:** the prototype shows top-level links only; we keep accordion sub-navigation on mobile (matching the desktop dropdown contents) so no page loses mobile navigability. Visual style follows the prototype drawer. |
| A3 | The footer keeps the prototype's visual treatment (deep green, film grain, white wordmark, script tagline, gold uppercase column headings) but carries the **live site's full link inventory**, not the prototype's reduced 3 columns. Legal/trust links move to the base bar. |
| A4 | Long-tail pages (§8) keep their **existing, keyword-optimised H1s and body copy**. Only the six template pages adopt the prototype's hero copy, and even then see §10 for fact checks. Re-skin, don't re-write. |
| A5 | Existing public image assets are reused. The handover `assets/photos/` files are available as supplementary imagery; `assets/logos/anchor-logo-black.png` / `-white.png` (934×421) are the canonical wordmarks — copy into `public/images/brand/` if equivalents don't already exist. |
| A6 | URLs, metadata, canonicals, JSON-LD and GTM tracking calls are **unchanged** by this migration unless a section explicitly says otherwise. |

---

## 2. Phase plan and PR breakdown

Complexity scores per `complexity-and-incremental-dev.md`. Every phase ends with the full verification pipeline plus a visual check of the homepage, one food page, one SEO page and the booking flow.

| Phase | Contents | PRs |
|---|---|---|
| **0 — Foundations** | Fonts, design tokens, Tailwind theme, `globals.css` rewrite | 1 PR (M) |
| **1 — Primitives** | Button, Badge, Card, Input, SectionHeading + call-site codemods | 3 PRs (M each): ① Button+codemod ② Badge+Card+codemod ③ Input+SectionHeading |
| **2 — Shell** | InteriorHero, Header + utility strip, Footer, StickyCtas, StatusBar restyle, AmenityStrip, CtaBand | 4 workstreams (M–L): ① InteriorHero PR series ② Header/utility ③ Footer ④ StickyCtas + AmenityStrip + CtaBand |
| **3 — Live data** | WeekHours, events components (FeaturedEvent, EventListItem, UpcomingEvents), promo CTAs restyle | 2 PRs (M) |
| **4 — Templates** | The six template pages, one PR each (S–M) | 6 PRs |
| **5 — Long tail** | Route-family sweeps per §8, one PR per family | ~10 PRs (S–M) |
| **6 — Cleanup** | Delete retired components/classes (§11), copy/voice pass (§10), final QA (§14) | 2 PRs |

Checkpoint-commit within PRs after each verified increment (3-change rule).

---

## 3. Phase 0 — Foundations

### 3.1 Fonts (`app/layout.tsx`)

Replace the current Merriweather + Outfit setup with three families via `next/font/google` (do **not** use the Google Fonts `@import` from `tokens/fonts.css` — that is for the static prototype only):

```typescript
import { DM_Serif_Display, Outfit, Clicker_Script } from 'next/font/google'

const display = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})
const body = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
})
const script = Clicker_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
})
```

Apply `${display.variable} ${body.variable} ${script.variable}` on `<html>`. **Remove Merriweather entirely** (the `--font-merriweather` variable, the import, and the Tailwind `serif` mapping).

Hard rules:
- DM Serif Display and Clicker Script have **no bold weight**. Never set `font-weight` above 400 on them — no `font-bold` on display headings, ever.
- Outfit is the only family with multiple weights (300–800).

### 3.2 Design tokens (`app/globals.css`)

Replace the existing `--anchor-*` variable block with the canonical token set. Copy these **exactly** except for the three font-family variables, which are owned by `next/font` from §3.1 (source: `tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css`, `tokens/effects.css`):

```css
:root {
  /* ---- Brand: Green (primary) ---- */
  --anchor-green: #005131;
  --anchor-green-dark: #003d25;
  --anchor-green-deep: #0c1d11;
  --anchor-green-raised: #132318;
  --anchor-green-card: #172d1e;
  --anchor-green-light: #006b45;
  --anchor-sage: #7a8b7f;

  /* ---- Brand: Gold — exactly three, three jobs ----
     fills → gold · text on light → gold-dark · accents on dark → gold-bright */
  --anchor-gold: #a57626;
  --anchor-gold-dark: #8b6914;
  --anchor-gold-bright: #c9a020;

  /* ---- Neutrals ---- */
  --anchor-black: #000000;
  --anchor-charcoal: #1a1a1a;
  --anchor-white: #ffffff;
  --anchor-cream: #faf8f3;
  --anchor-cream-text: #f0e6c6;
  --anchor-sand: #f5e6d3;
  --anchor-grey-500: #6f6a61;

  /* ---- Status ---- */
  --anchor-success: #006b45;
  --anchor-danger: #b1372f;

  /* ---- Semantic aliases — LIGHT (default) ---- */
  --bg: var(--anchor-cream);
  --surface: var(--anchor-white);
  --surface-raised: var(--anchor-cream);
  --surface-sunk: #f2ede3;
  --surface-inverse: var(--anchor-green);
  --text: var(--anchor-charcoal);
  --text-strong: var(--anchor-green);
  --text-muted: var(--anchor-grey-500);
  --text-on-green: var(--anchor-white);
  --text-on-gold: var(--anchor-charcoal);
  --text-inverse: var(--anchor-cream-text);
  --accent: var(--anchor-green);
  --accent-2: var(--anchor-gold);
  --accent-text: var(--anchor-gold-dark);
  --border: #e2dccf;
  --border-strong: #d2c9b4;
  --border-gold: rgba(165, 118, 38, 0.35);
  --focus-ring: var(--anchor-gold-dark);
  --link: var(--anchor-green);
  --link-hover: var(--anchor-gold-dark);

  /* ---- Typography ---- */
  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
  --fw-regular: 400;
  --fw-medium: 500;
  --fw-semibold: 600;
  --fw-bold: 700; /* Outfit only; display/script stay 400 */
  --text-display: clamp(3.5rem, 8vw, 7rem);
  --text-h1: clamp(2.75rem, 5.5vw, 4.75rem);
  --text-h2: clamp(2rem, 3.6vw, 3.25rem);
  --text-h3: clamp(1.5rem, 2.4vw, 2.25rem);
  --text-h4: clamp(1.25rem, 1.6vw, 1.5rem);
  --text-xl: 1.375rem;
  --text-lg: 1.125rem;
  --text-base: 1rem;
  --text-sm: 0.875rem;
  --text-xs: 0.75rem;
  --text-script: clamp(1.75rem, 3vw, 2.75rem);
  --leading-tight: 1.05;
  --leading-snug: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.08em;
  --tracking-kicker: 0.18em;

  /* ---- Spacing (8px base) ---- */
  --space-0: 0;
  --space-1: 0.25rem;  --space-2: 0.5rem;  --space-3: 0.75rem;
  --space-4: 1rem;     --space-5: 1.5rem;  --space-6: 2rem;
  --space-7: 3rem;     --space-8: 4rem;    --space-9: 6rem;
  --section-y: clamp(2.5rem, 6vw, 4.5rem);
  --container-max: 1280px;
  --container-pad: clamp(1rem, 4vw, 2.5rem);

  /* ---- Radii — four shapes only ---- */
  --radius-xs: 3px;     /* dark cards */
  --radius-sm: 6px;     /* inputs */
  --radius-md: 12px;    /* light cards */
  --radius-pill: 999px; /* buttons, badges, chips */

  /* ---- Control sizing ---- */
  --control-h-sm: 44px;
  --control-h-md: 48px;
  --control-h-lg: 56px;

  /* ---- Border widths ---- */
  --border-thin: 1px;
  --border-thick: 2px;
  --border-frame: 3px;

  /* ---- Shadows ---- */
  --shadow-sm: 0 2px 8px rgba(26, 26, 26, 0.06);
  --shadow-md: 0 8px 20px rgba(26, 26, 26, 0.08);
  --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.10);
  --shadow-gold: 0 6px 24px rgba(165, 118, 38, 0.28);

  /* ---- Motion ---- */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --dur-fast: 0.15s;
  --dur: 0.2s;
  --dur-slow: 0.4s;

  /* ---- Image scrims ---- */
  --scrim-bottom: linear-gradient(180deg, rgba(12,29,17,0) 0%, rgba(12,29,17,0.0) 40%, rgba(12,29,17,0.85) 100%);
  --scrim-green: linear-gradient(180deg, rgba(0,81,49,0) 0%, rgba(0,61,37,0.9) 100%);

  /* ---- Film grain (dark surfaces only) ---- */
  --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");

  --header-height: 76px; /* was 80px */
}

.theme-dark,
[data-theme="dark"] {
  --bg: var(--anchor-green-deep);
  --surface: var(--anchor-green-card);
  --surface-raised: var(--anchor-green-raised);
  --surface-sunk: #081509;
  --surface-inverse: var(--anchor-cream);
  --text: var(--anchor-cream-text);
  --text-strong: var(--anchor-cream-text);
  --text-muted: var(--anchor-sage);
  --text-on-green: var(--anchor-cream-text);
  --text-on-gold: var(--anchor-charcoal);
  --text-inverse: var(--anchor-charcoal);
  --accent: var(--anchor-gold-bright);
  --accent-2: var(--anchor-gold-bright);
  --accent-text: var(--anchor-gold-bright);
  --border: rgba(201, 160, 32, 0.22);
  --border-strong: rgba(201, 160, 32, 0.45);
  --border-gold: rgba(201, 160, 32, 0.55);
  --focus-ring: var(--anchor-gold-bright);
  --link: var(--anchor-gold-bright);
  --link-hover: var(--anchor-cream-text);
}
```

Base element rules (replace the current dark-theme body/heading rules):

```css
body {
  background: var(--bg);            /* cream — was #0c1d11 */
  color: var(--text);
  font-family: var(--font-body), system-ui, sans-serif;
  font-weight: var(--fw-regular);
  line-height: var(--leading-relaxed);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display), serif;
  font-weight: var(--fw-regular);    /* NEVER bolder — single-weight face */
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--text-strong);
  text-wrap: balance;
  margin: 0;
}
p {
  text-wrap: pretty;
}
:focus-visible {
  outline: var(--border-frame) solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

**Remove** the global `body::before` grain overlay. Grain is now applied per dark surface (hero, footer) at 5–6% opacity — see §5.

### 3.3 ⚠ Colour rename trap and audits — read before touching Tailwind

The current Tailwind palette uses the **same names for different values** as the new tokens. Migrating blindly will silently swap colours:

| Current Tailwind name | Current value | Correct new token |
|---|---|---|
| `anchor-gold` | `#8b6914` | `--anchor-gold-dark` (#8b6914) — **not** the new `--anchor-gold` (#a57626) |
| `anchor-gold-light` | `#a57626` | `--anchor-gold` (#a57626) |
| `anchor-gold-vivid` | `#c9a020` | `--anchor-gold-bright` (#c9a020) |
| `anchor-gold-bright` | `#e0b830` | retired — map to `--anchor-gold-bright` (#c9a020) |
| `anchor-gold-dark` | `#6b5010` | retired — map to `--anchor-gold-dark` (#8b6914) |
| `anchor-bg` | `#0c1d11` | `--anchor-green-deep` |
| `anchor-bg-raised` | `#132318` | `--anchor-green-raised` |
| `anchor-bg-card` | `#172d1e` | `--anchor-green-card` |

Migration approach: in Phase 0, replace the old palette with the new theme below, then run the token/font audit. **Do not rely on the build to catch this.** Tailwind will silently drop some unknown classes, and some names survive with new meanings (`anchor-gold`, `anchor-gold-dark`, `anchor-gold-bright`).

Required token/font audit before the Phase 0 PR is merged:

```bash
rg -n "anchor-(gold-light|gold-vivid|warm-white|text-on-green|text-on-gold|bg|bg-raised|bg-card)|shadow-(luxury|luxury-lg)|font-serif|font-merriweather" app components lib tests
```

Expected result after migration: no hits, except in migration docs/tests that explicitly assert removal. Also manually audit all remaining `anchor-gold`, `anchor-gold-dark` and `anchor-gold-bright` usages: small gold text on light must become `text-accent-text`; decorative gold fills may use raw `anchor-gold`; dark-surface accents may use raw `anchor-gold-bright`.

Retired layout classes are a phased cleanup, not a Phase 0 blocker. During page sweeps, touched files must remove `.section-spacing*`, `.card-dark`, `.card-warm`, `.inner-frame`, `.tag` and `.btn-friendly`. Before Phase 6 cleanup finishes, the final full audit must return no hits:

```bash
rg -n "anchor-(gold-light|gold-vivid|warm-white|text-on-green|text-on-gold|bg|bg-raised|bg-card)|shadow-(luxury|luxury-lg)|font-serif|font-merriweather|section-spacing|card-dark|card-warm|inner-frame|btn-friendly|className=.*\\btag\\b" app components lib tests
```

### 3.4 Tailwind theme (`tailwind.config.ts`)

```typescript
theme: {
  container: { center: true, padding: '1rem', screens: { '2xl': '1280px' } },
  extend: {
    colors: {
      // Raw brand palette (fixed across themes)
      anchor: {
        green: { DEFAULT: '#005131', dark: '#003d25', deep: '#0c1d11', raised: '#132318', card: '#172d1e', light: '#006b45' },
        gold: { DEFAULT: '#a57626', dark: '#8b6914', bright: '#c9a020' },
        sage: '#7a8b7f', charcoal: '#1a1a1a', cream: '#faf8f3',
        'cream-text': '#f0e6c6', sand: '#f5e6d3', grey: '#6f6a61',
        success: '#006b45', danger: '#b1372f',
      },
      // Semantic (theme-aware — re-map under .theme-dark automatically)
      canvas: 'var(--bg)',
      surface: { DEFAULT: 'var(--surface)', raised: 'var(--surface-raised)', sunk: 'var(--surface-sunk)', inverse: 'var(--surface-inverse)' },
      ink: { DEFAULT: 'var(--text)', strong: 'var(--text-strong)', muted: 'var(--text-muted)', inverse: 'var(--text-inverse)', 'on-green': 'var(--text-on-green)', 'on-gold': 'var(--text-on-gold)' },
      accent: { DEFAULT: 'var(--accent)', text: 'var(--accent-text)' },
      line: { DEFAULT: 'var(--border)', strong: 'var(--border-strong)', gold: 'var(--border-gold)' },
    },
    fontFamily: {
      display: ['var(--font-display)', 'Times New Roman', 'serif'],
      sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      script: ['var(--font-script)', 'cursive'],
    },
    fontSize: {
      display: ['clamp(3.5rem, 8vw, 7rem)', { lineHeight: '0.95' }],
      h1: ['clamp(2.75rem, 5.5vw, 4.75rem)', { lineHeight: '1.2' }],
      h2: ['clamp(2rem, 3.6vw, 3.25rem)', { lineHeight: '1.2' }],
      h3: ['clamp(1.5rem, 2.4vw, 2.25rem)', { lineHeight: '1.2' }],
      h4: ['clamp(1.25rem, 1.6vw, 1.5rem)', { lineHeight: '1.2' }],
      script: ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1' }],
    },
    spacing: { 'section-y': 'var(--section-y)' },
    borderRadius: { xs: '3px', sm: '6px', md: '12px', pill: '999px' },
    boxShadow: {
      sm: '0 2px 8px rgba(26, 26, 26, 0.06)',
      md: '0 8px 20px rgba(26, 26, 26, 0.08)',
      lg: '0 10px 40px rgba(0, 0, 0, 0.10)',
      gold: '0 6px 24px rgba(165, 118, 38, 0.28)',
    },
  },
}
```

Usage rule for all subsequent phases: **semantic first** (`bg-canvas`, `bg-surface`, `text-ink-muted`, `border-line`, `text-accent-text`). Reach for raw `anchor-*` only where a brand colour must stay fixed across themes (gold CTA fill, green CTA band, footer).

Remove from config: all old flat colour keys (`anchor-gold-light`, `anchor-gold-vivid`, old-value `anchor-gold-bright`, old-value `anchor-gold-dark`, `anchor-bg`, `anchor-bg-raised`, `anchor-bg-card`, `anchor-warm-white`, `anchor-text-on-green`, `anchor-text-on-gold`), the `luxury`/`luxury-lg` shadows, and the `serif` font mapping. Use semantic `ink-on-green`/`ink-on-gold` for text-on-colour utilities.

Final cleanup target for `globals.css`: remove `.section-spacing`, `.section-spacing-sm/-md/-lg/-tight` (all become `py-section-y`), `.card-dark`, `.card-warm`, `.inner-frame`, `.tag`, `.btn-friendly` once `rg` proves no remaining usages. Keep `.hero-focal`, `.loading-dots`, focus-ring vars.

### 3.5 Breakpoint mapping

The prototype uses 980/720/620/600/560/480px. Map to Tailwind defaults — do not add custom breakpoints:

| Prototype breakpoint | Use |
|---|---|
| ≤980px (nav collapse, 2-col grids, utility strip hidden) | `lg` (1024px) |
| ≤600–620px (1-col grids, stacked forms) | `sm` (640px) |
| ≤560/480px (full-width buttons, condensed sticky bar) | `sm` (640px), or `min-[480px]` only if visually necessary |

---

## 4. Phase 1 — Primitives

Primitive styling below follows `components.css`, with one required correction: primary buttons use the AA-safe gold-dark fill. Implement with CVA in the existing files (do not move files).

### 4.1 Button (`components/ui/primitives/Button.tsx`)

**Variants: exactly three.** `primary` · `outline` · `ghost`. **Sizes: exactly three.** `sm` · `md` · `lg`. Keep `fullWidth`, `asChild`, icon and loading props.

| | Spec |
|---|---|
| Shape | `rounded-pill`, `border: 2px solid transparent`, Outfit 600, inline-flex, centred, `gap: var(--space-2)`, `white-space: nowrap` |
| `sm` | min-height 44px, padding-x `--space-5` (24px), font `--text-sm` |
| `md` | min-height 48px, padding-x `--space-6` (32px), font `--text-base` |
| `lg` | min-height 56px, padding-x `--space-7` (48px), font `--text-lg` |
| `primary` | bg `--anchor-gold-dark` (#8b6914), text `#fff` (AA contrast 5.09:1). Hover: bg `--anchor-green` (#005131) + `shadow-gold`. **Deliberate accessibility correction:** the prototype's `--anchor-gold` + white text is only 4.02:1, so do not ship it for buttons. |
| `outline` | transparent bg, `border-color: var(--accent)`, `color: var(--accent)` → green on light, gold-bright inside `.theme-dark`. Hover: bg `var(--accent)`, text `var(--bg)` |
| `ghost` | transparent, `color: var(--text)`. Hover: `rgba(0,0,0,0.06)` bg (light) / `rgba(255,255,255,0.08)` (dark) |
| Hover motion | `translateY(-2px)`; active returns to 0; disabled: opacity .5, no transform |

**Codemod table** (current call-site counts from the audit — expect roughly these numbers):

| Old | New | ~Sites |
|---|---|---|
| `variant="secondary"` | `variant="outline"` | 185 |
| `variant="danger"` | `variant="outline"` | 3 |
| `variant="warning"` | `variant="outline"` | 19 |
| `size="xs"` | `size="sm"` | 2 |
| `size="xl"` | `size="lg"` | 3 |

After the codemod, sweep each page for the **one-primary-per-view rule**: one gold primary per screen section; if two primaries sit side by side, demote the second to `outline`.

Keep the wrappers (`BookTableButton`, `PhoneButton`, `EventBookingButton`, `DirectionsButton`, `ShareButton`) — update their internals to the new variants only.

### 4.2 Badge (`components/ui/primitives/Badge.tsx`)

One labelling primitive. **Variants: exactly six.** Remove sizes (one size), keep optional `dot`.

| Variant | Style |
|---|---|
| `green` | bg `--anchor-green`, text `#fff` |
| `gold` | bg `--anchor-gold`, text `#fff` |
| `sand` | bg `--anchor-sand`, text `--anchor-green` — amenities, dietary flags, categories |
| `outline` | transparent, `1.5px solid var(--border-strong)`, text `var(--text)` |
| `success` | bg `rgba(0,107,69,0.12)`, text `--anchor-success` (dark theme: bg `rgba(95,207,154,0.16)`, text `#6ddaa1`) |
| `danger` | bg `rgba(177,55,47,0.12)`, text `--anchor-danger` |

Shape: pill, Outfit 600, `--text-xs`, `padding: 0.4em 0.85em`, `line-height: 1`, `white-space: nowrap`. Dot: 7px circle, `background: currentColor`, before the label.

Codemod: `default|primary→green`, `secondary→sand`, `warning→gold`, `error→danger` (~67 sites). Replace every inline amenity/status pill (`border-white/25 bg-white/10` spans — 5 sites), the `.tag` class, `HeroTag`, `HeroBadge` with `<Badge>`.

### 4.3 Card (`components/ui/layout/Card.tsx`)

One card. Props: `variant: 'light' | 'dark'` (default light) · `accent?: boolean` (gold top rule) · `hover?: boolean` (lift) + existing `CardBody` etc.

| | Light | Dark |
|---|---|---|
| Background | `var(--surface)` (white) | `--anchor-green-card` (#172d1e) |
| Border | `1px solid var(--border)` | `1px solid var(--border-gold)` |
| Radius | `--radius-md` (12px) | `--radius-xs` (3px) |
| Shadow | `--shadow-sm` | — |
| Accent | `border-top: 3px solid var(--anchor-gold)` | `border-top: 3px solid var(--anchor-gold-bright)` |
| Hover | `translateY(-3px)` + `--shadow-lg` | same |

`CardBody` padding: `--space-6` (32px). Media images: `.anchor-card__media` full-width, `object-fit: cover`.

**The corner-bracket motif is retired.** `.card-dark` (215 uses) → `<Card variant="dark" accent>` — but note most `.card-dark` uses exist because the site is currently dark; on light pages most become plain `<Card accent>`. Decide per surface: content sitting on cream/white → light card; content inside a dark section (packages card, journey times) → dark card. `.card-warm` (4 uses) → `<Card accent hover>`. `Card variant="default|outlined|elevated"` → light card (drop the old variants).

Existing `padding` prop migration:
- `padding="none"` → remove the prop. If the card has a `CardBody`, set `className="p-0"` only where the body truly needs no padding.
- `padding="sm|md|lg"` → remove the prop and move the padding to `CardBody` (`p-4`, `p-6`, `p-8`) or wrap direct card children in `CardBody`.
- After Phase 1, `Card` accepts only `variant`, `accent`, `hover`, `className`, and native div props. Tests must be updated to assert the new API.

### 4.4 Input (`components/ui` form primitives)

One canonical field system. `components/ui/primitives/Input.tsx` owns `Input` and `Textarea`; `components/ui/forms/Select.tsx`, `DatePicker.tsx` and any legacy form wrappers must reuse the same field/control classes. Do not keep a second visual input system in `components/ui/forms/Input.tsx`.

`Input` props: label, hint, invalid state, optional icons and native input props. Keep backward aliases during migration only: `helperText → hint`, `error` string/boolean → invalid + hint. Remove visual `variant` and `size` props after call-sites are migrated.

- Field: label above (Outfit 600, `--text-sm`), control, hint below (`--text-xs`, muted; red when invalid).
- Control: bg `var(--surface)`, `1.5px solid var(--border-strong)`, radius `--radius-sm` (6px), padding `12px 16px`, min-height 48px, font `--text-base`.
- Focus: `border-color: var(--anchor-gold-dark)`, `box-shadow: 0 0 0 4px rgba(139,105,20,0.12)`, no default outline.
- Invalid: `border-color: var(--anchor-danger)`.
- Keep the existing iOS date/time-input hardening (recent fixes) — restyle without removing those attributes.

### 4.5 SectionHeading (replaces `components/SectionHeader.tsx`, 347 uses)

Props: `kicker?` · `script?` · `title` · `lead?` · `align: 'left' | 'center'` (default center).

Render order, top to bottom:
1. **Kicker** — Outfit 600, `--text-xs`, uppercase, `letter-spacing: 0.18em`, colour `var(--accent-text)`.
2. **Script** (optional) — Clicker Script 400, `--text-script`, colour `var(--accent-text)`, line-height 1.
3. **Title** — DM Serif Display 400, `--text-h2`, colour `var(--text-strong)`.
4. **Lead** (optional) — Outfit, `--text-xl`, colour `var(--text-muted)`, `max-width: 56ch`, line-height 1.5.

Gap between rows: `--space-3`. Section heading block margin-bottom: `--space-7`.

Codemod from `SectionHeader`: `eyebrow→kicker`, `subtitle→script` **only when it reads as a warm aside** (otherwise fold into `lead`), `description→lead`. Delete the old gold-rule divider rendering.

---

## 5. Phase 2 — Shell

### 5.1 InteriorHero — the one hero (new file `components/hero/InteriorHero.tsx`)

**This is the biggest consistency win. Every interior page uses this exact hero; only the image, copy and CTAs change.** The homepage hero (§7.1) is the only exception, ever.

Props: `image: string` · `focal?: string` (CSS object-position, default `'50% 50%'`) · `kicker?: string` · `title: string` (the page H1) · `lead?: string` · `crumb: string` · `badges?: ReactNode` · `actions?: ReactNode`.

Structure and geometry (source: `site.css` `.ta-hero--interior`):

- `<section class="theme-dark">`, `position: relative`, `overflow: hidden`, base bg `--anchor-green-deep`, `min-height: clamp(380px, 50vh, 540px)`, flex, `align-items: flex-end`.
- Full-bleed `<img>` (use `next/image` with `fill`, `object-fit: cover`, `objectPosition: focal`, empty `alt=""` — decorative).
- Scrim layer (z-1), exact gradient:
  ```css
  background:
    linear-gradient(95deg, rgba(12,29,17,0.92) 0%, rgba(12,29,17,0.74) 46%, rgba(12,29,17,0.34) 100%),
    linear-gradient(0deg, rgba(12,29,17,0.55) 0%, rgba(12,29,17,0) 45%);
  ```
- Grain layer (z-1): `background-image: var(--grain)`, opacity 0.06.
- Content (z-2) inside the 1280px container, `max-width: 760px`, column flex, gap `--space-4`, padding-block `clamp(2.5rem, 6vw, 4.5rem)`. In order:
  1. **Breadcrumb** — `Home / {crumb}`, `--text-xs`, cream at 72% opacity, links hover gold-bright. `aria-label="Breadcrumb"`.
  2. **Kicker** — as §4.5 but colour `--anchor-gold-bright`.
  3. **H1** — DM Serif 400, `--text-h1`, colour `--anchor-cream-text`.
  4. **Lead** — `--text-xl`, cream at 92%, `max-width: 54ch`.
  5. **Badges** — flex-wrap row, gap `--space-2` (always `variant="sand"` badges).
  6. **Actions** — flex-wrap row, gap `--space-3`; one `primary lg` + at most one `outline lg`.

**Mobile (≤640px):** text reflows naturally; badges wrap; each action button goes `width: 100%` (stacked). No other change.

Migration: 113 pages import `HeroWrapper`. Replace each with `InteriorHero`, mapping props: `route→crumb` (human label, not path), `eyebrow→kicker`, `title→title`, `description|lead→lead`, `tags→badges` (as sand Badges), `primaryCta/secondaryCta→actions`. **Drop entirely:** `variant`, `size`, `alignment`, `overlay`, `statusBar*` (status no longer renders in interior heroes — it lives in the utility strip and homepage hero), `ctaLayout`, `enableSmartCtas`, `heroEvents`, `seasonalFallback`. Where a page currently relies on `showStatusBar`, the utility strip (§5.2) covers it.

### 5.2 Header + utility strip (`components/layout/Navigation.tsx` rewrite)

Two stacked bars:

**Utility strip** (desktop only — `hidden lg:block`): white bg (`--surface`), bottom hairline `--border`, vertical padding `--space-2`. Left: `StatusBar` nav variant (§5.6). Right (gap `--space-4`): active `PromoCtas` (§6.3) · "Book parking" link → `/heathrow-parking` · phone link `tel:01753682707` showing "01753 682707". Quick links: Outfit 600 `--text-sm`, ink, 15px gold Lucide icons (`square-parking`, `phone`), hover `--accent-text`.

**Main header**: sticky top, z-60, `rgba(250,248,243,0.9)` + `backdrop-filter: blur(12px)`, bottom hairline, inner height **76px**. Contents left→right: black wordmark logo (height 42px, links `/`, `aria-label="The Anchor, home"`) · primary nav · right CTA cluster (`Book a table` primary `sm` → `/book-table`, burger on <lg).

**Primary nav — exact model** (4 items; sub-items are `[label, description, href]`):

| Top level (href) | Sub-navigation |
|---|---|
| **Food** (`/food-menu`) | Full Food Menu — "Pub classics, prices and dietary filters" → `/food-menu` · Sunday Roast — "Carved fresh to order, every Sunday" → `/sunday-roast` · Stone-Baked Pizza → `/pizza-menu` · Fish & Chips → `/fish-and-chips-heathrow` · Vegetarian & Vegan → `/food-menu/vegan` · Gluten-free options → `/food-menu/gluten-free` · Drinks Menu → `/drinks` |
| **Private Hire** (`/private-hire`) | Check Availability → `/private-hire#enquiry` · Function Room Hire → `/function-room-hire` · Private Parties → `/private-party-venue` · Wakes & Memorials → `/private-hire/wakes` · Christenings → `/private-hire/christenings` · Corporate Events → `/corporate-events` · Christmas Parties → `/christmas-parties` |
| **What's On** (`/whats-on`) | Upcoming Events → `/whats-on#upcoming-events` · Quiz Night → `/quiz-night` · Music Bingo → `/music-bingo` · Cash Bingo → `/cash-bingo` · Karaoke → `/karaoke` · Live Music → `/live-music` |
| **Find Us** (`/find-us`) | Find Us → `/find-us` · Near Heathrow → `/near-heathrow` · From Terminal 5 → `/near-heathrow/terminal-5` · Plane Spotting → `/plane-spotting-heathrow` · Free Customer Parking → `/free-parking` · Book Heathrow Parking → `/heathrow-parking` |

Sub-item descriptions: copy from `shell.jsx` NAV verbatim. Order is priority order — **Private Hire before What's On**.

Dropdown panel: absolute below item, `min-width: 460px`, 2 CSS columns, white surface, radius `--radius-md`, `--shadow-lg`, padding `--space-3`; opens on hover **and** focus/click (keyboard accessible: focusable trigger, Escape closes, arrow/tab reachable items). Each sub-link: bold label (`--text-sm`, ink-strong) + description line (`--text-xs`, muted), hover bg `--surface-sunk`. Active top-level link styled with `--accent-text`.

**Mobile (<lg):** burger (3 × 24px×2px ink-strong bars) toggles a drawer below the header: white surface, each top-level item an accordion (chevron) revealing its sub-links (A2); then "Book parking" link; then a CTA block with `PromoCtas` (block style) and full-width `Book a table` primary `md`. Body scroll locks while open; Escape and backdrop click close; focus is trapped.

Keep the GTM tracking calls currently attached to nav/CTA clicks.

### 5.3 Footer (`components/layout/Footer.tsx` restyle)

Visual (from `site.css` `.ta-footer`): bg `--anchor-green-deep`, grain overlay at 5%, `padding-block: var(--space-8)` top / `calc(var(--space-5) + 76px)` bottom (clears the sticky CTA bar). Desktop grid: `1.5fr` brand column + link columns (`gap: var(--space-6)`).

Brand column: white wordmark (height 48px) · script tagline "Where everyone's welcome" (Clicker Script, 1.9rem, `--anchor-gold-bright`) · about paragraph (`--text-sm`, `--anchor-sage`, max-width 34ch). Suggested copy: *"A village pub in Stanwell Moor since 1751. Proper pub food, a beer garden under the Heathrow flight path and free customer parking, 7 minutes from Heathrow Terminal 5."* **Note on "under the flight path":** the design-system README treats this as risky in customer copy, but `docs/SSOT.md` (canonical, §1/§8/§9) uses "beer garden under the flight path" as approved marketing language — so it is **permitted, not banned**. Either it or the softer "a front-row seat to Heathrow life" is acceptable. See §10 and the open question O1.

Link columns (A3): keep the live site's current six groups (Book & Eat, Private Hire, Hosted Events, Heathrow & Plane Spotting, More, Trust & Policies), restyled — headings Outfit `--text-xs` uppercase `0.18em` tracking `--anchor-gold-bright`; links `--text-sm` cream at 82% opacity, hover gold-bright. Desktop: brand + up to 5 columns on `xl`, 2 columns on `lg`, accordions on mobile (keep the current `<details>` pattern). Move legal links into the base bar if the column count exceeds the grid.

Base bar: top hairline `--border-gold`; left `© {year} The Anchor, Stanwell Moor Village · Horton Road, Surrey TW19 6AQ`; right social icons (Facebook, Instagram, phone) as 38px circles with `--border-gold` border, Lucide 18px. Keep existing real social URLs.

### 5.4 Sticky CTA bar (new `components/layout/StickyCtas.tsx`, rendered globally in `app/layout.tsx`)

Replaces ALL current sticky/floating CTAs (see §11). **Desktop and mobile.**

- Fixed bottom, full width, z-80, `rgba(255,255,255,0.96)` + blur(10px), top hairline, shadow `0 -6px 24px rgba(26,26,26,0.10)`, padding-block `--space-3` + `env(safe-area-inset-bottom)`.
- Hidden until the page's hero has scrolled out: reveal when `scrollY > heroHeight − 90` (slide-up `translateY(125%) → 0`, `--dur` `--ease-out`); `aria-hidden` when hidden.
- Contents (1280 container, gap `--space-3`): `Book a table` primary → `/book-table` · `View menu` outline with `utensils` icon → `/food-menu` · circular phone icon-button (48px, 2px `--accent` border) `tel:01753682707`, `aria-label="Call The Anchor"` · circular WhatsApp icon-button (green fill, `message-circle` icon — Lucide has no WhatsApp glyph) → `https://wa.me/441753682707`, new tab, `aria-label="WhatsApp The Anchor"`.
- Desktop (≥lg): right-aligned, buttons natural width. Mobile: Book a table flexes to fill; ≤640px the "View menu" label hides leaving the icon (`aria-label` stays).
- Do not render on `/book-table` (the page's own form is the CTA).
- Preserve current analytics: fire the existing table-booking/menu/contact/WhatsApp CTA click events, and fire `trackStickyCtaShown` once per page view when the bar first becomes visible. `trackStickyCtaShown` **already exists** (`lib/gtm-events.ts:837`, already used by `FoodStickyCtaBar`) — reuse it, do not recreate.

### 5.5 AmenityStrip (new `components/AmenityStrip.tsx`)

Dark green band (`--anchor-green`, `.theme-dark` context) used directly under the hero on most pages. 4-up grid (2-up `<lg`, 1-up `<sm`), padding-block `--space-6`, gap `--space-5`. Each item: 48px icon tile (gold-tinted `rgba(201,160,32,0.14)` bg, `--border-gold` border, radius 3px, cream Lucide 24px) + bold cream title (`--text-base`) + sage subline (`--text-sm`).

Default items (props allow overrides): `square-parking` "20 free spaces / No fees while you visit" · `plane` "7 mins from T5 / Outside the ULEZ zone" · `dog` "Dog friendly / Water bowls on us" · `wifi` "Free WiFi / Pub and beer garden". These claims are confirmed in `docs/SSOT.md`.

### 5.6 StatusBar restyle (`components/layout/StatusBar.tsx`)

**Keep all existing logic**: `useBusinessHours` / `BusinessHoursProvider`, 60s refresh, boundary-scheduled refresh, `??` kitchen resolution, static fallback from `lib/business-hours-fallback.ts`. Replace the four current variants + themes with **two variants**:

- `nav` (utility strip): inline rows, gap `--space-5`, ink text.
- `pill` (homepage hero / standalone): `--anchor-green` bg, `2px solid var(--anchor-gold)` border, pill radius, padding `8px 24px`, white text, `--shadow-md`, wraps and centres on mobile.

Rows (each: 9px dot + Outfit 600 `--text-sm` text):
1. **Bar** — open: dot `#2fbf71` (fixed value), "Bar: Open · closes {time}"; closed: dot `--anchor-danger`, "Bar: Opens {time}".
2. **Kitchen** — open: green dot, "Kitchen: Open · closes {time}"; opens later: dot `--anchor-gold` (warning), "Kitchen: Opens {time}"; closed/null: red dot, "Kitchen: Closed today".
3. **Planes** (optional, `showPlanes`) — from `lib/heathrow-runway-alternation` `getTodayPlaneSpottingWindow()`; active: green dot; `title` attribute carries the caveat text.

Times in 12-hour format ("11pm", "5:30pm"). `role="status" aria-live="polite"`. Dot colour is never the only signal — the text always states open/closed.

### 5.7 CtaBand (new `components/CtaBand.tsx`)

Green band section (`--anchor-green` bg, `.theme-dark`, `py-section-y`), centred column (max-width 720px): H2 (DM Serif, `--text-h2`, cream) · optional copy (`--text-lg`, cream 85%, max 50ch) · actions row (one primary lg + one outline lg, wrap, centred). Used as the closing section of nearly every page.

---

## 6. Phase 3 — Live-data components

### 6.1 WeekHours (new `components/WeekHours.tsx`)

7-day opening hours used in the homepage Find Us section. **Reuse the data logic from `components/BusinessHours.tsx`** (it already merges `specialHours` over `regularHours` with the required property-presence handling so `kitchen: null` stays closed and does not fall through). Do not re-implement hours parsing.

Layout (from `site.css` `.ta-week`): header row = `Open now`/`Closed now` success/danger Badge with dot + current status text. Then a 2-column list (1-col `<640px`); each row: day name (bold) + date sub ("Today" highlighted gold) on the left; right-aligned column with bar times (bold; "Closed" in danger red), kitchen line (`--text-xs` muted; special-hours `note` replaces it when present; "Kitchen closed" when null/closed), and plane window line (gold, 13px plane icon) from `getPlaneSpottingWindowForDate(isoDate)`. Today's row gets `--anchor-sand` background. Footer note: *"Bar and kitchen live from /api/business/hours. Flight-path times are approximate, Heathrow alternates runways around 3pm."*

Times from the **live API only** — never hardcode (SSOT §3).

### 6.2 Events components (restyle, keep logic)

Keep: `lib/api/events.ts` types, `getEventBookingCopy`, `isEventSoldOut`/`hasLimitedAvailability`, `DEFAULT_EVENT_IMAGE` fallback, `EventBookingButton` URL normalisation + GTM tracking. Fetch via existing `/api/events` proxy (`limit=3`, hourly revalidate for these sections).

**FeaturedEvent** (first upcoming event): `<Card accent>` split grid — square poster image (340px column; `16/10` full-width on `<lg`) + body (`--space-6` padding): badge row (gold dot Badge = relative day "Today"/"Tomorrow"/weekday · category chip tinted `{category.color}1f` bg with category colour text + Lucide icon · "Sold out" danger Badge or "n tables left" success Badge when `remainingAttendeeCapacity < 12`) · event name (DM Serif `--text-h3`) · shortDescription (gold, 600) · description · meta row (top hairline; uppercase 12px labels + DM Serif values): date & time, price ("Free entry" when 0), doors · actions: `EventBookingButton` lg + `View details` outline lg → `/events/{id}`.

**EventListItem**: `<Card hover accent>` with 120px square thumb (92px `<640px`) + date line (uppercase 12px) + name (DM Serif `--text-h4`) + shortDescription + `EventBookingButton` sm. List grid: 2-col, 1-col `<lg`.

**UpcomingEvents**: featured + remaining list, gap `--space-5`. Booking buttons may wrap text (`white-space: normal`); full-width `<640px`.

Booking label rules: do not duplicate or paraphrase labels. Use `getEventBookingCopy(event).label`, `EventBookingButton` URL normalisation and GTM tracking, plus `isEventSoldOut`/`hasLimitedAvailability` for disabled/status badges. Current helper labels include: quiz → "Reserve a table, pay quiz entry on arrival" · music bingo → "Reserve a table for Music Bingo" · cash bingo → "Reserve a table, buy bingo book on arrival" · ticketed → "Buy ticket now" · free → "Free entry, reserve table". `bookings_enabled === false` renders disabled "No booking required"; sold-out/capacity 0 renders disabled "Sold out".

### 6.3 PromoCtas (restyle `ScheduledCtaButton` rendering)

Keep the existing mechanism exactly (`promoCtaButtons` in `app/layout.tsx`, `startsOn`/`endsOn`/`leadDays`, London-time parsing). Restyle the rendered button: gold pill (`--anchor-gold` bg, white text, Outfit 600 `--text-sm`, `padding: 6px 16px`, 15px Lucide icon), hover `--anchor-gold-dark` + 1px lift. Renders in the utility strip (inline) and mobile drawer CTA block (`block` style: full-width, min-height 44px).

---

## 7. Phase 4 — The six template pages

General rules for all templates:
- Page sections alternate surface tints: `cream` (`bg-canvas`) → `white` (`bg-surface`) → `sunk` (`bg-surface-sunk`) → `green` (CtaBand). Every section: `py-section-y`, 1280px container.
- Grids: `ta-grid` gap `--space-5`; 4-up = `lg:grid-cols-4 sm:grid-cols-2 grid-cols-1`; 3-up = `lg:grid-cols-3 sm:grid-cols-2 grid-cols-1`; 2-up = `sm:grid-cols-2 grid-cols-1`.
- Feature split (image + text): 2-col grid, `gap: clamp(2rem, 5vw, 4rem)`, centred align; image radius `--radius-md` + `--shadow-lg`, height `clamp(320px, 42vw, 480px)` cover. `flip` modifier puts the image right. **Mobile: single column, image first** (flip resets to image-on-top).
- All hero copy below: check §10 fact table first.

### 7.1 Homepage (`/`)

The **only** non-standard hero.

1. **Home hero** (`.theme-dark`): min-height `clamp(560px, 84vh, 760px)`, content centred both axes, max-width 880px. Scrim: `radial-gradient(120% 90% at 50% 30%, rgba(12,29,17,0.55) 0%, rgba(12,29,17,0.82) 100%)` + `linear-gradient(0deg, rgba(12,29,17,0.7) 0%, rgba(12,29,17,0) 55%)`; grain 6%. Contents in order: white wordmark (`clamp(180px, 26vw, 300px)` wide, drop-shadow) · H1 "Eat, Drink, Enjoy." (DM Serif, `--text-display`, line-height 0.95, cream) · script line "Where everyone's welcome" (Clicker Script, `--text-script` ×1.2, gold-bright) · lead (≈54ch) · actions: `Book a table` primary lg + `View food menu` outline lg · `StatusBar` pill · rating row (gold ★★★★★ + "4.6 from 238 Google reviews · Highest-rated independent pub near Heathrow" — **source the numbers from `lib/google/review-utils.ts`**, claim allowed per SSOT §12) · 4 sand chips: Free parking · Dog friendly · Beer garden · 7 mins from T5. **Mobile:** centred, status pill wraps, actions stack full-width.
2. **AmenityStrip**.
3. **Path cards** (cream): SectionHeading kicker "Stanwell Moor Village", title "What are you here for?", lead. 4-up linked cards (`Card accent hover`, full-height): 52px sand circle icon (`utensils`/`beef`/`users`/`party-popper`, green 26px) · DM Serif `--text-h4` title · muted copy · gold "CTA →" link line. Targets: `/book-table`, `/sunday-roast`, `/private-hire`, `/whats-on`. Whole card is the link (single `<a>`, no nested links).
4. **Coming up** (white): SectionHeading kicker "What's on", script "Always something happening", title "Coming up at The Anchor", lead. `UpcomingEvents` (§6.2) from `/api/events?limit=3`. Centred `View all events` primary lg → `/whats-on`.
5. **What makes us special** (cream): SectionHeading kicker "More than a pub". 3-up `Card accent hover` with icon tiles (`piggy-bank`, `plane`, `heart`) — copy per `pages1.jsx` SPECIAL, fact-checked.
6. **CtaBand**: "Ready to visit?" / walk-ins copy / `Book a table` primary + `See the menu` outline.
7. **Gallery** (white): SectionHeading "Life at The Anchor / Take a look around". 3-up linked image cards (240px media) → `/sunday-roast`, `/near-heathrow` (beer garden), `/private-hire`.
8. **FAQ** (cream): SectionHeading "Good to know / Frequently asked questions". Accordion, max-width 920px centred; one item open at a time (first open by default); button row = DM Serif `--text-h4` question + gold `plus` icon rotating 45° when open; answer `--text-lg` muted, max 70ch. Items: the 5 Q&As from `pages1.jsx` FAQS — **VERIFY each answer against SSOT** (notably kitchen-days wording and parking). Keep/update the FAQPage JSON-LD to match the rendered Q&As exactly.
9. **Find Us** (sunk, `id="visit-us"`): SectionHeading kicker "Visit Us", script "Pop in and say hello", title "Ready for a proper pub near Heathrow?". 2-col: `Card accent` (address block · ta-list: plane "7 minutes from Heathrow Terminal 5", bus "Bus routes 441, 442 & 555 stop nearby" (SSOT — prototype omits 555), parking "20 free customer parking spaces" · `Get directions on Google Maps` outline lg full-width with map-pin icon → existing Google Maps URL) + map panel (keep the existing map embed/implementation; min-height 360px, radius 12px). Below, full-width `Card accent`: "Opening hours & flight path" + `WeekHours` (§6.1). **Mobile:** card stacks above map; week list 1-col.

### 7.2 Food (`/food-menu`) — the representative interior page

1. **InteriorHero**: dining-room image, crumb "Food", kicker "Eat, Drink, Enjoy", title "Proper pub food, minutes from Heathrow", lead per `pages1.jsx`, badges: "Mains £11 to £16" · "Pizzas from £12" · "Dog friendly"; actions: `Book a table` primary lg + `What's on` outline lg. Do not hardcode kitchen-closed days; hours come from the API only.
2. **AmenityStrip**.
3. **Menu** (cream): SectionHeading kicker "The menu", script "Carved, baked, poured", title "Today at The Anchor", lead with allergen line. Dietary filter chips, centred (`All / Vegetarian / Vegan / Gluten-free`): pill chips, 44px min-height, `1.5px solid var(--border-strong)` white bg; selected = green bg white text; hover gold border. Filtering hides non-matching items (keep current filtering logic if present; otherwise chips filter the rendered menu client-side). Menu content: **the live menu data the page already renders — NOT the prototype fixtures** (§10). Each menu group = DM Serif `--text-h3` heading + `Card accent` containing rows: name (Outfit 500) with optional gold `· Veg/Vegan` em-flag, muted `--text-sm` description below, DM Serif gold price right-aligned (`white-space: nowrap`). Row padding `--space-3` 0, hairline separators. Narrow container (920px). **Mobile: rows keep name left / price right** — never stack the price.
4. **Sunday roast feature** (white): feature split — roast image left; right: SectionHeading left-aligned, kicker "Sundays · no pre-order", title "Proper Sunday roasts", lead (walk-in copy per SSOT §4); menu-row list of roasts — **use the SSOT §4 lineup and prices exactly** (Beef Topside £22 · Pork Leg £20 · Turkey w/ Stuffing Ball £19 · Beef & Ale Pie £21 · Chicken & Wild Mushroom Pie £21 · Vegan Wellington £20 · Kids Roast £14; the Wellington is **vegan**, never "vegetarian"); actions: `Book a roast` primary → `/book-table` + success Badge with dot "Served 1pm – 6pm". **Mobile: image above text.**
5. **CtaBand**: "Hungry? Grab a table." / `Book a table` primary + `Find us` outline.

### 7.3 What's On (`/whats-on`)

1. **InteriorHero**: bar image, crumb "What's On", kicker "What's on", title "Always something happening", lead per `pages2.jsx`; badges "Free entry nights" · "Family friendly" · "Free parking"; actions `Reserve an event table` primary lg → `/book-table` + `See the food menu` outline lg.
2. **AmenityStrip**.
3. **Next up** (cream, `id="upcoming-events"`): SectionHeading kicker "Next up", script "Don't miss it", title "This month's headline nights", lead. `UpcomingEvents` — live from `/api/events`. **Mobile:** featured stacks image-over-detail; list 1-col; booking buttons full-width.
4. **The regulars** (white): SectionHeading kicker "The regulars", title "On every month", lead. 3-up `EventCard` grid (light cards: uppercase gold date line · DM Serif title · muted meta · price + sand tag). Content: the recurring nights from `pages2.jsx` REGULAR_EVENTS — **VERIFY every detail (times, prices, "From £16"→ see §10) against SSOT/the events team before shipping**. **Mobile: 1-col.**
5. **CtaBand**: "Bringing a group?" / `Book a table` primary + `Private hire` outline.

### 7.4 Private Hire (`/private-hire`)

1. **InteriorHero**: function-room/Christmas-table image, crumb "Private Hire", kicker "Private hire", title "Host your event at The Anchor", lead per `pages2.jsx`; badges "10 to 50 guests" · "Free parking" · "Custom catering"; actions `Get an event quote` primary lg → `/private-hire#enquiry` (the page's existing enquiry form — **not** `/book-table`) + phone outline lg with phone icon "01753 682707".
2. **AmenityStrip**.
3. **Occasions** (cream): SectionHeading kicker "Occasions", script "However you celebrate", title "Every kind of get-together". 4-up linked cards (icons `briefcase`, `party-popper`, `cake`, `flower`) → `/corporate-events`, `/christmas-parties`, `/private-party-venue`, `/private-hire/wakes`. **Mobile: stack 1-col.**
4. **Why choose us** (white): feature split — left: SectionHeading left-aligned kicker "Why choose us", title "A pub that feels like yours for the day"; ta-list of 5 check-marked points (gold check icons, bold lead-ins) per `pages2.jsx` HIRE_WHY; `Start your enquiry` primary → `#enquiry`. Right: **dark card** (`Card variant="dark" accent`): DM Serif cream "Catering packages" heading + menu-rows (cream names, gold-bright prices, `--border-gold` separators). **Use the real SSOT §11 packages — NOT the prototype's invented names ("Bowl food", "Pizza party", "Whole venue").** Verified §11 list (min 30 guests unless noted): Sandwich Buffet £9.95pp · Finger Buffet £10.50pp · Burger Buffet £10.95pp · Premium Buffet £13.95pp · Pizza Buffet (menu priced) · Indoor BBQ £17.99pp · Chicken Goujon Sharing Tray £35 (min 25). Re-confirm prices against SSOT §11 at build time. Footnote (sage, `--text-sm`): "Groups of 10 or more: a £10 per person deposit, fully deducted from your bill." (deposit rule is SSOT §7). **Mobile: single column, packages card below the list.**
5. **CtaBand**: "Let's plan your event" / `Get a quote` primary + phone outline.
6. Keep the page's existing enquiry form section (`#enquiry`), restyled with §4.4 inputs.

### 7.5 Book a Table (`/book-table`)

1. **InteriorHero**: bar image, crumb "Book a Table", kicker "Book a table", title "Reserve your spot", lead per `pages3.jsx`; badges "Free parking" · "Dog friendly" · "Quick confirmation". Do not claim instant confirmation because groups of 10+ can require the PayPal deposit step before confirmation. No hero actions (the form is the action).
2. **Booking form** (cream section): restyle of the existing 4-step `ManagementTableBookingForm` — see §9.

### 7.6 Near Heathrow (`/near-heathrow`) — the SEO landing template

1. **InteriorHero**: beer-garden image, crumb "Near Heathrow", kicker "Stanwell Moor Village", title "The closest proper pub to Heathrow" (SSOT allows the claim; keep the page's current H1 if it is more keyword-focused), lead per `pages3.jsx`; badges "7 mins from T5" · "20 free spaces" · "Outside ULEZ"; actions `Book a table` primary lg + `Get directions` outline lg with map-pin icon → Google Maps URL.
2. **AmenityStrip**.
3. **Why stop** (cream): feature split — left: SectionHeading left-aligned kicker "Why stop with us", title "A better stop than the terminal", lead; ta-list of 5 check points per `pages3.jsx` WHY_STOP. Right: **dark card** "Journey times by car": rows with cream terminal names + gold-bright DM Serif times — **use SSOT values**: Terminal 5 — 7 minutes · Terminals 2 & 3 — 11 minutes · Terminal 4 — 12 minutes; footnote (sage): route + bus note **using SSOT bus routes (441, 442, 555)**. **Mobile: journey-times card below the list.**
4. **Beer garden feature** (white, flipped): image right; left: SectionHeading left-aligned kicker "The beer garden", title "Planes overhead every 90 seconds", lead (SSOT-checked); sand badges "64 seats" · "Heated areas" · "Plane spotting"; `Book a table` primary. **Mobile: image first, then text.**
5. **CtaBand**: "Flying soon? Pull in first." / `Book a table` primary + `See the menu` outline.

---

## 8. Phase 5 — Long-tail route mapping (all 123 routes)

Every route below is re-skinned using the §7 recipes. **Keep existing H1s, body copy, metadata, JSON-LD and internal links (A4)** — swap components and theme only. The generic recipe for any interior page is: `InteriorHero → AmenityStrip (optional) → content sections alternating cream/white → CtaBand → footer`.

| Family (count) | Routes | Template recipe |
|---|---|---|
| Food & drink (12) | `food-menu`, `food-menu/{gluten-free,vegan,vegetarian}`, `pizza-menu`, `sunday-lunch` (+`sunday-roast` re-export), `fish-and-chips-heathrow`, `drinks`, `drinks/baby-guinness`, `drinks/managers-special`, `drinks/[slug]` (redirect) | **Food** (§7.2): menu blocks as accent cards, dietary chips where the page already filters. `sunday-lunch` additionally gets the roast feature split. |
| What's On / events (14 page routes + 1 data-driven redirect) | `whats-on`, `whats-on/drag-shows` (redirect), `quiz-night`, `music-bingo`, `cash-bingo`, `karaoke`, `live-music`, `events/[id]`, `live-sport`, `live-sport/{boxing,f1,six-nations,world-cup}`, `live-sport/world-cup/sweepstake`, `/open-mic` (redirect via `config/redirects/additional-redirects.json`, consumed by `middleware.ts` — not a page; confirm its target before relying on it) | **What's On** (§7.3). `events/[id]` = InteriorHero + FeaturedEvent layout as the body + CtaBand. Sweepstake page: InteriorHero + restyle its bespoke sections with Cards/Badges — layout otherwise untouched. Redirect pages stay redirect-only. |
| Seasonal (11) | `bank-holiday-weekends`, `bonfire-night`, `boxing-day`, `easter`, `halloween`, `new-years-eve`, `st-patricks-day`, `valentines-day`, `mothers-day`, `fathers-day`, `summer-garden-parties` | Generic interior recipe; feature splits for the hero dish/offer; CtaBand close. |
| Private hire (15 + 17) | `private-hire` + 7 occasion subpages (`baby-showers`, `christenings`, `engagement-parties`, `gender-reveal`, `milestone-birthdays`, `retirement-parties`, `wakes`), `function-room-hire`, `corporate-events`, `private-party-venue`, `christmas-parties`, `corporate-christmas-parties`, `book-event` (redirect), `private-hire/near/[slug]` (17 landmark pages) | **Private Hire** (§7.4): occasion cards, why-us split + dark packages card. `near/[slug]` pages: generic interior recipe (hero + content + CtaBand), driven by `lib/local-seo-data.ts` as now. Redirect pages stay redirect-only. |
| Find Us / Heathrow (18) | `find-us`, `near-heathrow` + `terminal-2/3/4/5`, `plane-spotting-heathrow`, `dog-friendly-pub-heathrow`, `family-friendly-pub-heathrow`, `heathrow-family-dining`, `heathrow-hotels-pub`, `heathrow-layover-dining`, `luggage-storage-heathrow`, `pre-flight-meal`, `restaurants-near-heathrow`, `pub-garden-heathrow`, `beer-garden`, `pool-darts-pub`, `m25-junction-14-pub` | **Near Heathrow** (§7.6): why-stop list + dark journey-times card + flipped feature. `find-us` also embeds the §7.1 Find Us section (map + WeekHours). |
| Town pages (13) | `{ashford,bedfont,colnbrook,egham,feltham,horton,longford,staines,stanwell,sunbury,windsor,wraysbury}-pub`, `pubs-in-stanwell` | **Near Heathrow** recipe with journey-times card pointing at the town. |
| Hotel pages (11) | `pub-near-{crowne-plaza,hilton,holiday-inn,ibis,marriott,novotel,premier-inn,radisson-blu,renaissance,sofitel,travelodge}-heathrow` | Same as town pages. |
| Parking (6) | `heathrow-parking` (+`[terminal]`), `heathrow-parking/confirmation/[bookingId]`, `parking/bookings/[id]`, `coach-parking-heathrow`, `free-parking` (redirect) | InteriorHero + restyle `ParkingBookingWizard` controls with §4 primitives (inputs, chips, buttons, step indicator per §9 visual language). **Do not change wizard logic, rates calls or PayPal flow.** Confirmation pages: plain light pages with `Card accent` summary (§9 confirmation visual). |
| Booking (2) | `book-table`, `booking-confirmation` (redirect) | §7.5 + §9. |
| Blog (4 + 143 posts) | `blog`, `blog/[slug]`, `blog/tags`, `blog/tag/[tag]` | InteriorHero (compact copy) + index as 3-up `Card hover accent` image cards + post template: light theme prose (DM Serif headings 400, Outfit body, gold links, 70ch measure), sand tag Badges. Keep markdown pipeline untouched. |
| About / careers / legal (16) | `about`, `about/the-anchor-facts`, `our-pub`, `history`, `reviews`, `sustainability`, `accessibility`, `safety-and-respect`, `join-our-team` (+2), `sitemap-page`, `privacy-policy`, `leave-review` (redirect), `[...unmatched]` | Generic interior recipe; legal pages = hero + prose, no AmenityStrip/CtaBand. |

Sweep order (one PR each, lowest risk first): blog → legal/about → seasonal → town/hotel → find-us family → private-hire family → events family → food family → parking.

---

## 9. Booking flow restyle (no logic changes — D4)

`components/features/TableBooking/ManagementTableBookingForm.tsx` keeps all four steps, all API calls (`/api/table-bookings/availability`, `/api/events`, `/api/customers/lookup`, `/api/table-bookings`, PayPal create/capture), Turnstile, honeypot, returning-customer lookup, query-param defaults, attribution tracking and the failed-PayPal recovery. Apply the prototype's visual language (`site.css` `.ta-book*`):

- **Container:** max-width 640px centred, inside a cream section below the hero. The form lives in a `Card accent`.
- **Step indicator** (4 steps: Find table · Choose time · Guest details · Review & book): numbered 28px circles — pending: sunk bg, muted; active: gold bg, white; done: green bg, white check icon — joined by 2px hairline bars that flex. Labels Outfit 600 `--text-sm`. **Mobile: labels condense** (hide pending-step labels ≤640px, keep numbers).
- **Chips** (party size, time slots, any quick choice): pill, 44px min-height, white bg, `1.5px solid var(--border-strong)`; selected: green bg, white text; hover: gold border. Chip rows wrap.
- **Inputs:** §4.4 styling, including the existing iOS-hardened date/time inputs. Two-up rows (date/time, phone/email) stack to 1-col ≤640px.
- **Group deposit notice:** when party ≥10, sand Badge: "Groups of 10 or more: a £10 per person deposit, fully deducted from your bill." PayPal section sits in a sunk panel inside the card.
- **Step actions:** ghost `Back` (arrow-left icon) left, primary `Continue`/`Request booking` (arrow/check icon) right; primary shows loading state while submitting.
- **Validation:** inline via Input `invalid` + hint (e.g. "Please choose a date", "We need a number to confirm") — never alerts.
- **Confirmation:** centred column — 72px green circle with white check · DM Serif `--text-h3` "You're booked in" · personalised line · summary panel (sunk bg, radius 12px, label/value rows: occasion, party, when, name) · `Make another booking` outline. Reuse for `BookingConfirmation.tsx`.
- Below the card: muted centre line "Prefer to talk to us? Call 01753 682707. Walk-ins are always welcome." (gold tel link).

---

## 10. Content, voice and fact corrections

Voice rules (apply to any copy touched): British English · sentence case (ALL-CAPS only in kickers) · **no em dashes** (commas, full stops, parentheses) · no "famous/premier/best" without proof · brand name is "The Anchor" · no emoji in UI (Lucide icons only) · heritage date is **1751**.

**The prototype contains placeholder content. Never copy these into the live site:**

| Prototype content | Status | What to do |
|---|---|---|
| FOOD_MENU fixtures ("The Anchor Burger £15", "The Heathrow" pizza, etc.) | Fiction | Use the page's existing live menu data |
| Sunday roast list (4 items, no pies) | Outdated | Use SSOT §4: 7 items, exact prices (§7.2.4) |
| "Sunday Roast … From £16" (home + What's On regulars) | Wrong | SSOT copy rule: **"Mains from £19"** → use "From £19" |
| Event fixtures (Quiz 17 June, Music Bingo, Stanwell Sessions) | Fixtures | Live `/api/events` |
| Regular-nights details (times, "£3pp", "£10 a book", "50,000+ songs") | Unverified | VERIFY each against SSOT / events team |
| Footer/garden: "beer garden under the flight path" | **Permitted** (SSOT §1/§8/§9 use it as approved copy) | Keep it, or use the softer "a front-row seat to Heathrow life". NOT banned. The design README's caution is overridden by the canonical SSOT — see open question O1. |
| "Bus routes 441 & 442" | Incomplete | SSOT: routes **441, 442, 555** |
| BUSINESS_HOURS fixture times | Placeholder | Live API only; SSOT forbids hardcoded hours |
| "4.6 from 238 Google reviews" | OK per SSOT §12 | Render from `lib/google/review-utils.ts`, not a string literal |
| "Highest-rated independent pub near Heathrow" | Allowed (SSOT §12) | OK |
| "20 free spaces", "64 seats", "7 mins from T5", T2/T3 11 min, T4 12 min | Confirmed in SSOT | OK |
| "Free WiFi" (SSOT §8), "Outside ULEZ" (SSOT §2) | Confirmed in SSOT | OK; source from SSOT/constants where possible |
| Prototype catering names: "Buffet package / Bowl food / Pizza party / Whole venue hire" | **Fiction** — not in SSOT | Use the real SSOT §11 buffet packages (see §7.4). Do not ship the prototype names or prices. |
| "10 to 80 guests", "Instant confirmation", "Mains from £10" | Wrong/risky | Use "10 to 50 guests" (SSOT §8/§11), "Quick confirmation", and "Mains £11 to £16" (SSOT §5) |

Also: hyphens-as-dashes in existing copy ("a pub - we're") → full stops; fix opportunistically when a page is in a sweep PR.

---

## 11. Files and classes to delete (Phase 6, after all sweeps)

Components: `components/hero/HeroWrapper.tsx`, `HeroSection.tsx`, `HeroSectionServer.tsx`, `heroVariants.ts`, `HeroTag.tsx`, `SmartCTAs.tsx` · `components/ui/PageHeader.tsx` · `components/ManagersSpecialHero.tsx` (already unused) · `components/SectionHeader.tsx` · `components/HeroBadge.tsx` · `components/conversion/StickyMobileBookingCTA.tsx` · `components/food/FoodStickyCtaBar.tsx` · `components/events/EventStickyBookingCTA.tsx` · `components/layout/FloatingActions.tsx` (all replaced by §5.4).

CSS/classes: `.card-dark`, `.card-warm`, `.inner-frame` (corner brackets), `.tag`, `.btn-friendly`, `.section-spacing*`, global `body::before` grain, `--font-merriweather`, old `anchor-*` Tailwind colour names (per §3.3), `luxury` shadows.

Before deleting anything, `grep` for remaining imports/usages — zero hits required. Update or remove tests that reference deleted components/variants. Keep `components/hero/Breadcrumbs.tsx` only if InteriorHero reuses it; otherwise delete.

---

## 12. Accessibility, motion, performance

- Focus: 3px gold outline, 2px offset, always visible (`:focus-visible` global).
- Touch targets ≥44px (button sm, chips, icon buttons all meet this).
- Colour is never the sole state indicator (status text accompanies dots; selected chips change shape context via border+bg+text).
- Icon-only buttons always carry `aria-label`. Dropdown nav: keyboard operable, Escape closes. Mobile drawer + any modal: focus trap, Escape closes. FAQ accordion buttons: `aria-expanded`.
- Gold text on light must be `--anchor-gold-dark` (#8b6914, AA). Never #a57626 for small text on cream/white.
- Motion: fades/short rises only, 150–400ms, `--ease-out`; hover lifts 2–3px; **no animation when `prefers-reduced-motion: reduce`** (entrance animation pattern: resting state visible, animation optional — per `site.css`).
- Images: `next/image` everywhere; hero images `priority` above the fold; meaningful `alt` on content images, `alt=""` on decorative hero backgrounds.
- Fonts via `next/font` (zero layout shift, no external CSS import).

## 13. SEO guardrails

- No URL changes. No metadata/canonical changes (`alternates: { canonical: './' }` pattern stays). Sitemap untouched.
- One H1 per page; the H1 is the hero title. Heading levels stay hierarchical when swapping SectionHeader→SectionHeading.
- JSON-LD untouched except: FAQPage schema must match the re-rendered FAQ copy; review schema continues to source from `review-utils`.
- Long-tail pages keep keyword-optimised H1s/copy (A4).
- Internal links preserved when re-skinning (the recent crawled-not-indexed contextual links must survive the sweeps).

## 14. QA / definition of done (every PR)

1. `npm run lint` (zero warnings) → `npx tsc --noEmit` → `npm test` → `npm run build`.
2. Visual check at 1280px and 390px against `Page Layouts.html` for the touched template; no horizontal overflow at 390px (the prototype's hard rule).
3. One primary button per view; primary button text passes AA contrast (`--anchor-gold-dark` + white, not `--anchor-gold` + white); display headings never bold; radii only 3/6/12/999; gold text on light is #8b6914.
4. Run the right §3.3 audit for the phase: token/font audit site-wide from Phase 0 onward; retired layout-class audit for touched files during sweeps; final full audit before Phase 6 completes.
5. No new customer-facing claim without an SSOT citation; no em dashes introduced.
6. Status bar, week hours, events and promos render from live APIs with fallbacks (unplug test: block `/api/business/hours` and confirm the static fallback shows).
7. Booking smoke test after Phase 4: complete a find→choose→details→review run in staging, including a 10+ party reaching the PayPal step.
8. Keyboard-only pass on header, drawer, FAQ, booking steps.

---

## 15. Open questions for the owner (resolve before the affected phase)

| # | Question | Affects | Default if unanswered |
|---|---|---|---|
| O1 | "Beer garden under the flight path" — the design-system README flags it as risky for customer copy, but the canonical SSOT (§1/§8/§9) uses it as approved language. Keep using it, or adopt the softer "a front-row seat to Heathrow life" everywhere? | Footer (§5.3), Near Heathrow (§7.6), §10 | Permitted per SSOT; use whichever reads better per surface. Not a blocker. |
| O2 | Primary button colour changes from the prototype's signature gold (`#a57626`) to the AA-safe darker gold (`#8b6914`), hover to green. This is mathematically required for AA on normal-size button text, but it visibly alters the brand's signature gold CTA. Approve the darker gold, or keep the lighter gold and instead guarantee all button text qualifies as "large" (≥18.66px/700 or ≥24px)? | Phase 1 §4.1, all CTAs | Ship `#8b6914` (AA-safe). |
| O3 | The dropdown sub-nav (§5.2) introduces hrefs the live site may route differently (e.g. `/private-hire#enquiry`, `/near-heathrow/terminal-5`, `/sunday-roast`). Confirm every sub-nav href resolves (no 404/redirect-chain) before Phase 2 ②. | Phase 2 Header | Validate each href against the live route list; fix mismatches in the same PR. |
| O4 | Recurring-nights content on What's On (§7.3 "The regulars": quiz £3pp, cash bingo £10 a book, karaoke 50,000+ songs, etc.) is prototype placeholder and not in the SSOT. Source verified values from the events team or pull from `/api/events` recurring data? | Phase 4 What's On | Do not ship unverified figures; show only SSOT/API-backed details until confirmed. |
| O5 | Brand assets: confirm white + black wordmark and the home/hero/garden/roast photography already exist in `public/` at adequate resolution, or copy the handover `assets/` files in during Phase 0. | Phase 0/2/4 | Reuse existing `public/` assets; copy handover assets only to fill gaps (A5). |
