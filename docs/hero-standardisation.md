# Hero Standardisation Plan

This rollout brings every hero/banner across the site in line with the refreshed food-menu layout. The work is divided into concrete passes so multiple developers can contribute without stepping on one another.

## 1. Inventory Current Usage
- [ ] Run `rg "<HeroWrapper" -n app` and log every route using the wrapper.
- [ ] Run `rg "HeroSection" -n app` to find pages bypassing the wrapper.
- [ ] For each page, capture:
  - File path
  - Props overriding defaults (`size`, `overlay`, `statusBarVariant`, custom `className`, bespoke CTA markup, etc.)
  - Any direct `HeroSection` usage and why (seasonal theming, carousel, etc.)
- [ ] Produce a shared spreadsheet/markdown table summarising the above. This becomes the backstop for QA.

## 2. Design & Token Decisions
- [ ] Confirm the “standard” hero variant based on `/food-menu`.
- [ ] Agree additional sanctioned variants if needed (examples: `promo` with dark overlay, `feature` with left-aligned copy).
- [ ] Document approved tokens:
  - Background overlays (`overlay="light"` vs `gradient`)
  - Status bar theme (colours, presence, copy)
  - CTA layout (single primary + optional secondary, button sizes, spacing)
  - Tag chip styling (font, casing, background/outline)
- [ ] Add these decisions to the design system notes (`docs/ui-guidelines.md` or new section).

## 3. Extend `HeroWrapper`
- [ ] Introduce a `variant` prop (e.g., `default`, `promo`, `dark`) that maps to pre-defined size/overlay/status bar/CTA spacing.
- [ ] Expose slots/hooks for:
  - Secondary CTA row (optional stacked vs inline layout)
  - Eyebrow text
  - Optional “secondary info” block (for countdowns/urgent copy previously inlined)
- [ ] Keep current API backward-compatible but mark direct prop overrides as “advanced” in the JSDoc.
- [ ] Update unit stories/docs if Storybook exists (`docs/components/hero.md`).

## 4. Migrate Pages
Process each group in batches. Recommended order:

1. **Wrapper pages without heavy customisation**  
   - Remove manual props now covered by the default variant.  
   - Swap bespoke CTA containers for shared helper components if necessary.

2. **Wrapper pages with major overrides**  
   - Map their requirements to the new variant API.  
   - If unique behaviour is truly needed, derive a new sanctioned variant instead of free-form overrides.

3. **Pages using `HeroSection` directly**  
   - Refactor to `HeroWrapper` + variant.  
   - Only fall back to raw `HeroSection` if the layout is structurally different (e.g., multi-column hero with gallery). Document those exemptions.

During migrations:
  - Keep breadcrumbs & status bar behaviour consistent (respect `showBreadcrumbs`, `showStatusBar` but avoid restyling).
  - Ensure the CTA buttons follow the primary/secondary combination from the standard variant.

## 5. Image & Alt Text Hygiene
- [ ] For each route, ensure only one header asset lives under `public/images/page-headers/<route>/`.
- [ ] Update `PAGE_HEADER_ALT_TEXT` in `lib/page-header-images.ts` where copy needs refresh.
- [ ] If a hero needs video/background beyond static images, plan a follow-up iteration rather than hacking inside the wrapper.

## 6. QA & Regression
- [ ] Run `npm run lint` and `npm run build` after each migration batch.
- [ ] Capture before/after screenshots for representative routes (homepage, /whats-on, /book-table, seasonal campaigns).
- [ ] Test critical paths on mobile + desktop (Hero CTA buttons, status bar, tag chips).
- [ ] Verify automatic image resolution still works (ensure fallback warnings don’t appear in dev console).

## 7. Documentation & Roll-out
- [ ] Update or create a “Hero Usage” section in `docs/ui-guidelines.md` (or similar) covering:
  - When to use each variant
  - Image placement guidelines
  - CTA conventions
  - Do/Don’t examples
- [ ] Share the inventory table and new guidelines with the team.  
- [ ] Schedule a quick visual QA once merged to ensure marketing stakeholders sign off on the unified look.

---

Follow this checklist sequentially: complete the inventory, agree on design decisions, extend the wrapper, then migrate pages in batches with QA gates between each phase. This prevents regressions while delivering a consistent hero experience across the site.
