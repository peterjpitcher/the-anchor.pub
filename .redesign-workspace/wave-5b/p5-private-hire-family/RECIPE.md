# Phase 5 — Private Hire family body-conversion recipe

You are re-skinning legacy dark pages to the light design system. **Re-skin only. Do NOT touch metadata, JSON-LD, H1 text, copy wording, internal links, canonical, or form logic.** No commits, no build, no new deps. British English, no em dashes introduced.

## The legacy → light mapping (apply mechanically)

### Sections / surfaces
The pages use a repeating dark band pattern. Convert by ALTERNATING light surfaces:
- `<section className="section-spacing* bg-anchor-green-card border-b border-anchor-gold-dark/15">` → `<section className="py-section-y bg-canvas">` (or alternate `bg-surface` / `bg-surface-sunk`)
- `<section className="section-spacing* bg-anchor-green-deep ...">` → `<section className="py-section-y bg-surface">`
- `<section className="section-spacing* bg-anchor-green-raised ...">` → `<section className="py-section-y bg-surface-sunk">`
- `<Section className="bg-anchor-green-deep ...">` (the `@/components/ui` `Section`) → `<section className="py-section-y bg-surface">` + `<Container>`
- Drop the `border-b border-anchor-gold-dark/15` dividers entirely (light theme uses surface tint changes, not gold hairlines).
- Alternate surfaces top→bottom: canvas → surface → surface-sunk → (CtaBand green) so adjacent sections differ. First content section after AmenityStrip = `bg-canvas`.
- `section-spacing-sm`, `section-spacing-lg`, `section-spacing-tight` ALL become `py-section-y`.

### Text colours (these were for dark bg; flip to light)
- `text-anchor-cream-text` → `text-ink-strong` (headings) or `text-ink` (body)
- `text-anchor-cream-text/70`, `/60`, `/80` → `text-ink-muted`
- `text-anchor-gold-bright` (heading accents on dark) → on light headings use `text-ink-strong`; for small gold labels/eyebrows/links use `text-accent-text`
- `text-anchor-gold-light` / `text-anchor-gold` small text → `text-accent-text`
- `text-white` on dark → `text-ink` (unless inside a kept dark band)

### Cards / boxes
- `card-dark` raw class → `<Card>` (light) with `<CardBody>`; only keep dark (`<Card variant="dark" accent>`) if it sits inside a deliberately dark band (rare here — most become light)
- `card-warm` → `<Card accent>`
- Ad-hoc boxes `bg-anchor-green-raised ... rounded-xl p-6` → `<Card><CardBody>...</CardBody></Card>` (light) OR `<Card accent>` for emphasis. Inner heading `text-anchor-gold-bright` → `text-ink-strong`; body `text-anchor-cream-text/70` → `text-ink-muted`.
- `rounded-xl`/`rounded-2xl`/`rounded-none` on cards → let `<Card>` own the radius (radius-md). Don't add custom radii.

### Shared dark-themed components to REPLACE on these light pages
These shared components still render DARK (gold-bright/cream text) and are NOT owned — do not edit them, but do NOT nest them on a light surface. Replace with light primitives:
- `FeatureGrid` (3-up dark feature cards) → a `grid` of light `<Card accent>` with `<CardBody>`: `<h3 className="font-display text-h4 text-ink-strong">` + `<p className="text-ink-muted">`. Keep the same titles/descriptions verbatim. Drop the empty `icon: ""`.
- `InfoBoxGrid` → grid of light `<Card>`/`<CardBody>` with `<h3 className="font-display text-h4 text-ink-strong">{title}</h3>` + `<p className="text-ink-muted">{content}</p>`. Keep titles/content verbatim.
- `CateringPackagesTable` (when present and it lists the SSOT buffet packages) → replace with the page-local `CateringPackagesCard` from `@/app/private-hire/_components/CateringPackagesCard` (import it). It already renders the verified SSOT §11 packages. Remove the now-unused `getCateringData`/`foodPackages`/`CateringPackagesTable` import IF nothing else uses them. NOTE: if a page shows DIFFERENT verified prices (e.g. Christmas £36.95/£39.95 festive tables) those are page-specific — keep them, just restyle the markup to light (`<Card>` + table with `text-ink`/`border-line`).
- `CTASection variant="green"` (closing CTA) → `<CtaBand title=... copy=... primary={...} secondary={...} />` from `@/components/CtaBand`. Map the two buttons: first/primary → `<Button variant="primary" size="lg">` (wrap in `<Link>` for href, or use `BookTableButton`); phone button → `<PhoneButton phone={CONTACT.phone} source=... variant="outline" size="lg">`. Preserve the same labels, hrefs, phone sources.
- `PageTitle` heading wrappers can stay (they render an `<h2>`); just change `className="text-anchor-cream-text"` → `className="text-ink-strong"`.

### Components to KEEP unchanged (they're already light or logic-bearing)
- `InteriorHero` (already migrated — leave it exactly as is)
- `AmenityStrip`, `CtaBand`, `Container`, `SectionHeading`, `Card`, `Badge`, `Button`, `Input`, `Textarea`
- `PrivateBookingSection` / enquiry form (logic-bearing — leave its props/logic; it renders its own section). Do not restyle its internals beyond what it already does.
- `FAQAccordionWithSchema` — keep; pass it a light-friendly `className` (e.g. `bg-canvas` or `bg-surface-sunk` instead of `bg-anchor-green-card`). Do NOT change the faqs array content (preserves FAQ JSON-LD).
- `InternalLinkingSection`, `OrganicSearchClusterLinks`, `BreadcrumbJsonLd`, `GoogleMapEmbed`, `TestimonialSection` — keep.
- `SectionHeading`: if a call passes `subtitle="..."` that reads as a warm aside keep as `script`, else it's fine as-is. Do not invent kickers. Leave existing `title` text verbatim.

### SectionHeading on dark→light
Headings that were raw `<h2 className="text-3xl font-bold text-anchor-gold-bright">` can become `<SectionHeading title="..." />` OR keep as `<h2 className="font-display text-h2 text-ink-strong">`. NEVER use `font-bold` on display headings (single-weight face). Prefer `<SectionHeading>` where there's a title (+ optional lead).

### Buttons / CTAs
- Any ad-hoc button with `className="bg-anchor-gold-dark text-anchor-green-deep ..."` or `bg-white/10 text-white` overrides on `BookTableButton`/`PhoneButton` → REMOVE the className colour overrides; let the variant own colours (`variant="primary"` / `variant="outline"`).
- One primary per view. If two primaries sit together, demote the second to `outline`.

## SSOT facts (do not invent; match exactly)
- Capacity: "10 to 50 guests" (NOT 80, NOT 100). If a page's existing copy says "up to 100 people for a buffet" leave the EXISTING body copy text alone (A4 — keep copy), but do not introduce new capacity numbers. Only change capacity wording if it's in a component you're rebuilding AND it contradicts SSOT — in that case keep the page's original words, don't rewrite.
- Deposit copy (use verbatim where a deposit line is shown): "Groups of 10 or more: a £10 per person deposit, fully deducted from your bill."
- Catering buffet packages = SSOT §11 via `CateringPackagesCard` (Sandwich £9.95pp, Finger £10.50pp, Burger £10.95pp, Premium £13.95pp, Pizza menu-priced, Indoor BBQ £17.99pp, Chicken Goujon Tray £35 serves ~10 min 25). Min 30 guests unless noted.
- Phone: 01753 682707 / `CONTACT.phone`.

## Verify before handoff (per file you touched)
1. `rg -n "section-spacing|card-dark|card-warm|inner-frame|btn-friendly|bg-anchor-green-(deep|card|raised)|text-anchor-cream-text|text-anchor-gold-bright|text-anchor-gold-light|anchor-gold-vivid|font-serif" <yourfiles>` → 0 hits.
2. `git diff <yourfiles>` shows NO change to: metadata blocks, JSON-LD object literals, H1 `title=` on InteriorHero, faqs arrays, internal-link hrefs/titles, canonical.
3. No em dashes introduced. No new deps.
