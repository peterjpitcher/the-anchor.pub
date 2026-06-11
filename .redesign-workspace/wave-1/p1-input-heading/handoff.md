# PR 1.3 — Input + SectionHeading + tailwind-merge fix — handoff

Branch: `codex/redesign-build`. Phase 1.3. Depends on Phase 0 tokens/theme.

## What changed

### 1. tailwind-merge fix (done first — everything depends on it)
`lib/utils.ts`: replaced the plain `twMerge` with `extendTailwindMerge(...)` that
registers the custom font sizes from `tailwind.config.ts` (`text-display`,
`text-h1`…`text-h4`, `text-script`) in the `font-size` class group.

Before: `cn('text-h2','text-ink-strong')` silently dropped `text-h2` (twMerge
treated the colour utility as a conflicting font-size). After: both survive.
Verified by `lib/__tests__/cn.test.ts` and a throwaway node check:
- `cn('text-h2','text-ink-strong')` → `text-h2 text-ink-strong` ✅
- `cn('text-script','text-accent-text')` → both kept ✅
- `cn('text-xl','text-h1')` → `text-h1` (still conflict-resolves) ✅
- `cn('px-4','px-6')` → `px-6` (ordinary behaviour intact) ✅

### 2. Canonical Input/field system (spec §4.4)
`components/ui/primitives/Input.tsx` is now the single field system. It exports
`Input`, `Textarea`, and two shared class constants reused by the form wrappers:
`fieldControlClass` and `fieldInvalidClass`.

Styling per spec §4.4: `bg-surface`, `border-[1.5px] border-line-strong`,
`rounded-sm`, `px-4 py-3`, `min-h-[48px]`, `text-base`; focus →
`border-anchor-gold-dark` + `shadow-[0_0_0_4px_rgba(139,105,20,0.12)]`,
`focus:outline-none`; invalid → `border-anchor-danger`; label Outfit-600
`text-sm`; hint `text-xs` muted, danger when invalid.

Backward aliases kept for migration:
- `helperText` → `hint`
- `error` (string) → invalid + hint message; `error` (boolean) → invalid
- `invalid` is the new canonical boolean
- `variant` / `size` retained as **deprecated no-ops** (renamed `_variant`/`_size`)
  because the existing Input test and ~unknown call sites still pass them; they no
  longer affect rendering. Mark for removal once call sites are clean.

iOS date/time hardening preserved: `data-native-date-time`, `appearance-none`,
`overflow-hidden rounded-sm` wrapper, `text-left`, and DatePicker's mobile
focus/touch handlers are all intact (restyle only).

### 3. Duplicate Input resolved — chosen approach: thin re-export
`components/ui/forms/Input.tsx` is now a 6-line re-export of the primitive
`Input`/`InputProps` (marked deprecated, Phase-6 deletion). No call site imported
it directly (`from '@/components/ui/forms/Input'` → 0), and the `@/components/ui`
barrel already exported the primitive (`export * from './primitives/Input'`), so
there is no duplicate-export collision.

`forms/Select.tsx`, `forms/Textarea.tsx`, `forms/DatePicker.tsx` (incl.
`DateRangePicker`, `TimePicker`) were rewritten to drop their own cva blocks and
reuse `fieldControlClass`/`fieldInvalidClass` + shared label/hint classes. Old
brand tokens (`bg-anchor-green-card`, `text-anchor-cream-text/*`, `border-red-500`,
`rounded-lg`) removed. `DateRangePicker.size` kept as a deprecated no-op prop (no
longer forwarded to `DatePicker`).

### 4. SectionHeading (spec §4.5)
New `components/ui/SectionHeading.tsx`. Props `kicker | script | title | lead |
align` (default `center`). Render order kicker → script → title → lead, `gap-3`,
block `mb-12`. Kicker Outfit-600 `text-xs` uppercase `tracking-[0.18em]`
accent-text; script `font-script text-script` accent-text; title `font-display
text-h2 text-ink-strong`; lead `text-xl text-ink-muted max-w-[56ch]`. Old
gold-rule divider removed.

Deprecated aliases accepted so the codemod didn't need 347 per-prop edits:
- `eyebrow` → `kicker`
- `description` → `lead`
- `subtitle` → folds into `lead` (subtitle judgement: see below)
- `align="right"` (legacy) renders left-aligned.

**subtitle → script judgement:** I did NOT auto-promote any `subtitle` to
`script`. Across 254 `subtitle=` usages, almost all read as supporting sentences,
not warm handwritten asides — promoting them en masse would be wrong. Default is
fold-into-lead (safe). If both `subtitle` and `description` are present, subtitle
renders as the lead and description as a second muted line (preserves old
two-line behaviour). Pages that want the Clicker-Script treatment should opt in
to `script` explicitly in a later phase.

### 5. SectionHeader retirement
`components/SectionHeader.tsx` is now a thin deprecated alias
(`export const SectionHeader = SectionHeading`), Phase-6 deletion. The barrel
`components/ui/index.ts` now exports `SectionHeading` (+ type) and no longer
exports `SectionHeader`.

## Codemod counts
- `SectionHeader` → `SectionHeading` rename: **87 files** codemodded (imports +
  JSX tags). 5 files that imported the deep path `@/components/SectionHeader` were
  repointed to `@/components/ui`.
- 19 files had duplicate `from '@/components/ui'` import lines created by the
  deep-import repoint; these were merged back into a single import each.
- Result: 357 `<SectionHeading>` JSX usages across 85 files.

## Verification (verbatim)
1. `cn('text-h2','text-ink-strong')` → `text-h2 text-ink-strong` (both kept). ✅
2. `rg "from '@/components/ui/forms/Input'" app components` → **0**. ✅
3. `rg "SectionHeader" app components` → only `components/SectionHeader.tsx`
   (the deprecated alias) plus two doc-comment mentions inside
   `components/ui/SectionHeading.tsx` (comments, not code refs). No component
   import/usage of `SectionHeader` remains. ✅
4. Old-token audit
   (`anchor-(gold-light|gold-vivid|warm-white|text-on-green|text-on-gold|bg|bg-raised|bg-card)|shadow-(luxury|luxury-lg)|font-serif|font-merriweather`)
   over `app components lib tests` → **0 (clean)**. ✅
5. `npx tsc --noEmit` → **exit 0, clean**. ✅
6. `npm run lint:next` → **No ESLint warnings or errors**. (Also
   `npm run audit:hero` = passed for 123 templates; `npm run audit:menu-pages` =
   passed.) ✅
7. `npx jest cn.test Input SectionHeading DatePicker Select Textarea` →
   **39 passed, 4 suites**. ✅
8. **Booking test failure count:** `tests/unit/ManagementTableBookingForm.test.tsx`
   reports **31 failed, 1 skipped, 12 passed (44 total)**. I confirmed via
   `git stash` that the clean baseline on this branch ALSO reports 31 failed — so
   these are pre-existing and unrelated; my change did NOT make it worse. (The
   brief estimated 30; the actual current baseline is 31.)

## Files changed (source)
- `lib/utils.ts` (tailwind-merge)
- `components/ui/primitives/Input.tsx` (canonical Input + Textarea + shared classes)
- `components/ui/forms/Input.tsx` (now thin re-export)
- `components/ui/forms/Select.tsx`, `Textarea.tsx`, `DatePicker.tsx` (reuse shared classes)
- `components/ui/SectionHeading.tsx` (new)
- `components/SectionHeader.tsx` (deprecated alias)
- `components/ui/index.ts` (barrel: export SectionHeading, drop SectionHeader)
- 87 app/components files codemodded (SectionHeader→SectionHeading)
- Tests: `components/ui/primitives/__tests__/Input.test.tsx` (updated to canonical
  behaviour), `components/ui/__tests__/SectionHeading.test.tsx` (new),
  `lib/__tests__/cn.test.ts` (new)

## What Phase 2 needs to know
- Use `SectionHeading` from `@/components/ui` (kicker/script/title/lead). For the
  homepage hero etc., pass `script` explicitly for the Clicker-Script line — it is
  NOT auto-derived from `subtitle`.
- For any field markup, use the primitive `Input`/`Textarea` or the shared
  `fieldControlClass`/`fieldInvalidClass` exported from
  `components/ui/primitives/Input.tsx`. Do not reintroduce a second visual style.
- `variant`/`size` on Input/Textarea and `size` on DateRangePicker are deprecated
  no-ops — stop passing them as call sites are touched, and they can be removed in
  a later cleanup PR.
- `components/SectionHeader.tsx` and `components/ui/forms/Input.tsx` are dead
  re-exports flagged for Phase-6 deletion.
