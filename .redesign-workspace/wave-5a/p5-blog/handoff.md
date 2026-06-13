# Phase 5 · PR 5.1 — Blog family sweep (handoff)

Branch: `codex/redesign-build` · uncommitted, no build run (per brief).

## Pages re-skinned to light theme (4 owned files)

1. `app/blog/page.tsx` (index)
   - Hero left as `InteriorHero` (already migrated).
   - Body bands now `<section className="py-section-y">` with `bg-canvas` / `bg-surface` / `bg-surface-sunk`; closing CTA is a `theme-dark bg-anchor-green` band.
   - Featured + 3-up post grid use `<Card hover accent>` image cards; grid is `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`.
   - Tags as `<Badge variant="sand">`; tag-cloud chips restyled to `rounded-pill` light chips.
   - Text → `text-ink` / `text-ink-muted` / `text-ink-strong`; links → `text-accent-text` / `text-link-hover`.
   - Pagination keeps `Button` primary/outline. CTA buttons now `primary` + `outline` (dropped `!`-prefixed dark overrides).

2. `app/blog/[slug]/page.tsx` (post template — drives 143 posts)
   - Prose converted to light: `prose-headings:font-display prose-headings:font-normal text-ink-strong`, body `text-ink`, gold links via `text-accent-text`/`text-link-hover`, measure `max-w-[70ch] mx-auto`, light code/table/blockquote tokens.
   - Hero badges already `<Badge variant="sand">` — left as-is.
   - Breadcrumb / Heathrow CTA / Share / Prev-Next / footer CTA bands converted to light `<section>` + `Container`; prev/next now `<Card hover>`.
   - `InternalLinkingSection` `className="section-spacing-md"` → `py-section-y`.
   - Markdown pipeline (`distributeImages`, `dangerouslySetInnerHTML`, `extractFaqEntries`), frontmatter usage, and ALL JSON-LD (BlogPosting/Blog/FAQPage/Breadcrumb) + metadata untouched.

3. `app/blog/tags/page.tsx`
   - Tags grid → `<Card hover accent>` cells (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5`); CTA band → light/dark per recipe.

4. `app/blog/tag/[tag]/page.tsx`
   - Intro value-prop box → `<Card accent>`; post grid → `<Card hover accent>` image cards; per-post tag pills → `<Badge variant={active?'gold':'sand'}>`; tag-cloud chips restyled to light `rounded-pill`; CollectionPage JSON-LD untouched.

## Verification

- `npx tsc --noEmit`: clean. Zero errors site-wide (no blog errors; no sibling-family errors observed at run time).
- Legacy-class / old-token audit on `app/blog` (`section-spacing|card-dark|card-warm|inner-frame|btn-friendly|anchor-bg*|gold-light|gold-vivid|warm-white|font-serif|font-merriweather|shadow-luxury` + dark `anchor-green-deep/raised/card`, `rounded-none`, `transition-colours`): **0 hits**.
- No legacy `Section` (cream/white→dark) import remains in any of the 4 files; replaced with plain `<section>` + `Container`.
- Remaining `text-anchor-cream-text` occurrences are intentional: cream text inside the dark-green closing CTA bands (`theme-dark bg-anchor-green`), matching the CtaBand pattern in spec §5.7.

## SEO / A4 confirmation

- `git diff app/blog` filtered for `canonical|@type|@context|alternates|generateMetadata|export const metadata|jsonLd|headline|articleBody|FAQ`: **0 added/removed lines** — metadata, canonicals (`/blog`, `/blog/[slug]`, `/blog/tags`, `/blog/tag/[tag]`), and all JSON-LD content are unchanged.
- Every page H1, body copy, and internal links preserved; presentational re-skin only. British English; no em dashes introduced.

## Notes for orchestrator

- Did NOT stage, commit, or run `npm run build` (per brief).
- The post-template footer CTA Heathrow branch renders one `primary` (Book a Table) + two `outline` buttons inside the dark band — fine for one-primary-per-view.
- No new deps; markdown content (`content/blog/*`) and `docs/architecture/*` untouched.
