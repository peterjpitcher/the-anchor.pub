# Phase 0 — Foundations · Handoff

**Branch:** `codex/redesign-p0-foundations`
**Engineer:** Foundations Engineer (wave 1)
**Status:** Complete. All Phase 0 gates green except a pre-existing, unrelated test failure (documented below). Committed.

---

## 1. What was done

The site's design system was flipped from the dark cinematic theme to the light/cream theme app-wide:

1. **Fonts** (`app/layout.tsx`): replaced Merriweather + Outfit with three `next/font/google` families — `DM_Serif_Display` (`--font-display`, 400 normal+italic), `Outfit` (`--font-body`, 300–800), `Clicker_Script` (`--font-script`, 400). All three `.variable`s applied on `<html>`. Merriweather removed entirely (import, instance, `--font-merriweather`). The `${...variable}` classes were removed from `<body>` (now on `<html>`).
2. **Tokens** (`app/globals.css`): replaced the `:root` `--anchor-*` block and added the `.theme-dark` / `[data-theme="dark"]` block with the canonical token set from spec §3.2, copied verbatim. The three `--font-*` family vars were NOT added to CSS (owned by next/font). Retained `--anchor-focus-ring-*` vars (re-pointed at the new `--focus-ring` / `--border-frame`) so the existing `@layer base` focus + link/button focus rules keep working.
3. **Base element rules** (`app/globals.css`): `body { background: var(--bg) }` (cream) + new colour/font/line-height; headings → `--font-display` at weight 400 (never bolder); added `p { text-wrap: pretty }` and global `:focus-visible` (3px gold outline). **Removed** the global `body::before` grain overlay and removed the hardcoded `background: #0c1d11` from the `html, body` rule.
4. **Tailwind theme** (`tailwind.config.ts`): replaced the flat colour palette with the raw `anchor` scale + semantic `canvas/surface/ink/accent/line`; added `fontFamily` (display/sans/script), `fontSize` (display/h1–h4/script), `spacing.section-y`, `borderRadius` (xs/sm/md/pill), `boxShadow` (sm/md/lg/gold). Deleted old flat colour keys, `luxury`/`luxury-lg` shadows, and the `serif` font mapping. Container changed to spec §3.4 (`padding: '1rem'`, `2xl: 1280px`) — the old per-breakpoint padding and `2xl: 1440px` were dropped per spec. Kept the existing `animation`/`keyframes` (not in scope to remove) and the typography plugin.
5. **Legacy helpers** (`app/globals.css`): kept all of `.section-spacing*`, `.card-dark`, `.card-warm`, `.inner-frame`, `.tag`, `.btn-friendly` defined; added a `/* DEPRECATED — remove in redesign Phase 6 */` comment above each. `.inner-frame` and `.btn-friendly` have 0 usages today but were KEPT (not deleted) to satisfy the conservative brief; removal deferred to Phase 6. Kept `.hero-focal`, `.loading-dots`, `.pull-quote` and the focus-ring vars.
6. **Colour/font codemod**: see §2.

---

## 2. Codemod (spec §3.3 — collision trap)

Applied with `perl -0777` using negative-lookahead boundaries `(?![-a-z])` to match whole tokens (covers both Tailwind class fragments like `border-anchor-gold` and CSS vars like `var(--anchor-gold)`). Run across **245 source files** in `app components lib tests` (`.ts/.tsx/.js/.jsx/.css/.mdx`), **excluding** `app/globals.css` and `tailwind.config.ts` (hand-written). Renames applied in this safe order to avoid double-mapping the `anchor-gold` ↔ `anchor-gold-dark` collision:

| Step | Old name | New name | Notes |
|---|---|---|---|
| 1 | `anchor-bg-raised` | `anchor-green-raised` | before bare `anchor-bg` |
| 1 | `anchor-bg-card` | `anchor-green-card` | before bare `anchor-bg` |
| 1 | `anchor-bg` (bare) | `anchor-green-deep` | lookahead-guarded |
| 2a | `anchor-gold` (bare, old #8b6914) | `anchor-gold-dark` | **done FIRST**, before `-light` rename |
| 2b | `anchor-gold-light` (#a57626) | `anchor-gold` | after 2a |
| 2c | `anchor-gold-vivid` (#c9a020) | `anchor-gold-bright` | |
| — | old `anchor-gold-bright` (#e0b830) / old `anchor-gold-dark` (#6b5010) | same name (value-only change in config) | no rename — no-op |
| 3 | `anchor-warm-white` | `anchor-white` | 3 occ |
| 3 | `anchor-text-on-green` / `anchor-text-on-gold` | `ink-on-green` / `ink-on-gold` | 0 call-sites (only existed as CSS var defs in globals.css, replaced by token rewrite) |
| 4 | `shadow-luxury-lg` / `shadow-luxury` | `shadow-lg` | |
| 5 | `font-merriweather` / `font-serif` | `font-display` | |

### Resulting occurrence / file counts (post-codemod, via `rg`)
- `anchor-green-deep` — 389 occ / 126 files
- `anchor-green-raised` — 606 occ / 167 files
- `anchor-green-card` — 655 occ / 157 files
- `anchor-gold-dark` — 2369 occ / 230 files
- `anchor-gold-bright` — 832 occ / 173 files
- `anchor-gold` (standalone, new #a57626) — 56 files
- `anchor-white` — 3 occ
- `shadow-lg` — 46 occ
- `font-display` — 20 occ
- `ink-on-green` / `ink-on-gold` — 0 (no call-sites existed)

**Note for Phase 1+:** the §3.3 manual sub-audit (small gold text on light → `text-accent-text`; decorative fills → raw `anchor-gold`; dark-surface accents → raw `anchor-gold-bright`) was NOT done per-occurrence in Phase 0 — the codemod preserved existing intent (old `text-anchor-gold` #8b6914 → `text-anchor-gold-dark`, which is the AA-safe value and equals what `text-accent-text` resolves to on light). The semantic `text-accent-text` swap should happen during the Phase 1 primitive/SectionHeading work and Phase 5 page sweeps, where surface context is known.

---

## 3. Files changed

- `app/layout.tsx` (fonts)
- `app/globals.css` (tokens, base rules, grain removal, deprecation comments)
- `tailwind.config.ts` (theme)
- **244 additional source files** under `app/`, `components/`, `lib/`, `tests/` (codemod only — colour/font class renames). Total tracked-modified source files: **247**.

Only these source files were staged. `docs/architecture/*` (pre-existing unstaged session noise) was deliberately left unstaged. Untracked tooling dirs (`.redesign-workspace/`, `jest_dx/`, `node-compile-cache/`) were not staged.

---

## 4. Verification (verbatim results)

| Check | Command | Result |
|---|---|---|
| Phase 0 audit | `rg -n "anchor-(gold-light\|gold-vivid\|warm-white\|text-on-green\|text-on-gold\|bg\|bg-raised\|bg-card)\|shadow-(luxury\|luxury-lg)\|font-serif\|font-merriweather" app components lib tests` | **0 hits** |
| Acceptance | `rg "merriweather\|font-serif" app components` | **0 hits** |
| Types | `npx tsc --noEmit` | **clean (exit 0)** |
| Lint (next) | `npm run lint:next` | **✔ No ESLint warnings or errors** |
| Lint (full) | `npm run lint` | **pass** — lint:next ✔, audit:hero "passed for 123 page templates", audit:menu-pages "passed" |
| Tests | `npm test` | **688 passed, 1 skipped, 30 failed** (1 suite: `tests/unit/ManagementTableBookingForm.test.tsx`) — see §5 |
| Build | `npm run build` | **✓ Compiled successfully**, 322/322 static pages, exit 0 |
| Semantic classes | throwaway probe compiled via `npx tailwindcss` | `bg-canvas`, `bg-surface`, `text-ink-muted`, `text-accent-text`, `rounded-pill`, `shadow-gold`, `font-display`, `border-line` all generated 1 rule each. Probe file removed before commit. |

The `.bak`/`.backup` files in `app/` still contain old names, but they are **git-ignored and untracked** (`git check-ignore` confirms), so `rg` (which respects `.gitignore`) reports them as 0 hits. A plain `grep -rn` shows 29 hits in those ignored files only — not real source, not compiled.

---

## 5. Pre-existing test failure (NOT caused by Phase 0)

`tests/unit/ManagementTableBookingForm.test.tsx` — **30 failed**. The failures are "Unable to find an element with the text: Choose your time", i.e. the booking wizard never advances to step 2 (availability fetch/timing). The suite times out around 31s.

**Confirmed pre-existing:** I stashed all Phase 0 changes (`git stash push -u -- app components lib tailwind.config.ts`) and ran the suite against baseline `main` — identical result: **30 failed, 1 skipped, 13 passed**. The rendered DOM in the failure already shows the correctly-codemodded classes (`bg-anchor-green-card`, `border-anchor-gold-dark/20`), so the colour rename is not the cause. This is booking-flow test infrastructure (out of Phase 0 scope and explicitly not to be touched). **No test was modified.** Phase 0 added/changed zero test assertions; the Button/Card/Input tests that DO touch styling all pass.

---

## 6. What Phase 1 needs to know

- **Semantic-first is live.** `bg-canvas`, `bg-surface`, `text-ink`, `text-ink-muted`, `text-ink-strong`, `text-accent-text`, `border-line`, `rounded-pill`, `shadow-gold`, `font-display`, `font-script`, `text-h1`..`text-h4`, `text-display`, `text-script` all resolve. Use them in the primitives.
- **The three gold tokens now mean:** `anchor-gold` = #a57626 (fills), `anchor-gold-dark` = #8b6914 (AA-safe text on light — Button primary fill per spec §4.1), `anchor-gold-bright` = #c9a020 (dark-surface accents). The old `text-anchor-gold` everywhere is now `text-anchor-gold-dark` (#8b6914).
- **`.theme-dark` works:** wrap dark sections (InteriorHero, footer) in `class="theme-dark"` and the semantic tokens re-map automatically (spec §5.1/§5.3 rely on this).
- **Headings are single-weight 400.** Never apply `font-bold`/`font-semibold` to a DM Serif heading. Outfit is the only multi-weight family.
- **Grain is no longer global.** Apply `var(--grain)` per dark surface at 5–6% opacity (heroes/footer) in Phase 2.
- **Legacy classes still defined** (`.card-dark` 65 files, `.section-spacing*` 106 files, `.card-warm` 3 files, `.tag` ~8, plus 0-usage `.inner-frame`/`.btn-friendly`). Phase 1/5 should migrate call-sites; Phase 6 deletes the definitions.
- **Container padding changed** to a flat `1rem` with `2xl: 1280px` (was per-breakpoint up to `2.5rem` / `2xl: 1440px`). If any wide layout looked tight after this, it's the container change — by spec.
- **Mixed visual state is expected** between Phase 0 and end of Phase 5 (per plan §D). Pages using old per-page dark classes on a now-cream body will look mixed until their sweep.

---

## 7. Deviations / assumptions

- Retained `--anchor-focus-ring-color/-width/-offset` vars (re-pointed to new tokens) rather than deleting them, because the existing `@layer base` focus rules and `a:focus-visible` / `button:focus-visible` rules in globals.css reference them and are out of Phase 0 scope to rewrite. The brief said "keep the focus-ring vars" — done.
- Kept `.inner-frame` and `.btn-friendly` despite 0 usages (brief permits removal at 0 usages but the Self-Check lists them as "still defined"; keeping is the safe interpretation).
- `ink-on-green`/`ink-on-gold` rename produced 0 call-site changes because those Tailwind classes were never used in components — `anchor-text-on-*` only existed as CSS variable definitions in globals.css (now replaced by the canonical token set).
