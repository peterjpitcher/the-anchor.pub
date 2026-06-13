# Handoff — Phase 2.1b: Bulk Hero Migration, Batch 1 (45 pages)

Branch: `codex/redesign-build` · Recipe: `.redesign-workspace/wave-2/p2-interiorhero-foundation/handoff.md` · Spec §5.1.
**No git add/commit. No `npm run build`. Files left unstaged in working tree.**

## Result: all 45 owned pages migrated HeroWrapper → InteriorHero. None left on HeroWrapper.

## Pages migrated (45/45)

Food/drink (9): `food-menu/gluten-free`, `food-menu/vegan`, `food-menu/vegetarian`, `pizza-menu`,
`sunday-lunch`, `fish-and-chips-heathrow`, `drinks`, `drinks/baby-guinness`, `drinks/managers-special`.
Events/What's On (12): `cash-bingo`, `karaoke`, `live-music`, `music-bingo`, `quiz-night`, `events/[id]`,
`live-sport`, `live-sport/boxing`, `live-sport/f1`, `live-sport/six-nations`, `live-sport/world-cup`,
`live-sport/world-cup/sweepstake`.
Private hire (13): `christmas-parties`, `corporate-christmas-parties`, `corporate-events`, `function-room-hire`,
`private-party-venue`, `private-hire/baby-showers`, `private-hire/christenings`, `private-hire/engagement-parties`,
`private-hire/gender-reveal`, `private-hire/milestone-birthdays`, `private-hire/near/[slug]`,
`private-hire/retirement-parties`, `private-hire/wakes`.
Seasonal (11): `bank-holiday-weekends`, `bonfire-night`, `boxing-day`, `easter`, `halloween`, `mothers-day`,
`fathers-day`, `new-years-eve`, `st-patricks-day`, `summer-garden-parties`, `valentines-day`.

## Mapping applied (per recipe)

- `route`→human `crumb`; `eyebrow`→`kicker` (string); `title` verbatim; `description`/`lead`→`lead`; `tags`→`<Badge variant="sand">`; primary/secondary CTAs→`actions` (1 primary lg + 1 outline lg). Dropped: `variant/size/overlay/statusBar*/ctaLayout/enableSmartCtas/seasonalFallback/secondaryInfo/showContextStrip/breadcrumbs/ctaContainerClassName/id`.
- Image: pages with an explicit `image` reused its `src`. SmartCTA-only pages (no image) had their header image resolved via `getPageHeaderImage(route)||getDefaultHeaderImage(route)` and inlined as a literal string. `drinks` + `managers-special` use `drinksHeroImage.src` with `focal="center center"`. `world-cup`(+sweepstake) reuse the already-imported `DEFAULT_PAGE_HEADER_IMAGE`.

## Image-resolution note (SmartCTA pages → inlined src)

Most `enableSmartCtas` events/seasonal pages resolved to `/images/page-headers/home/page-headers-homepage.jpg`
(cash-bingo, karaoke, live-music, music-bingo, quiz-night, live-sport + boxing/f1/six-nations, summer-garden-parties,
valentines-day, corporate-christmas-parties, function-room-hire, private-party-venue). Others resolved to a section
header: food-menu sub-pages + fish-and-chips → `food-menu/food-menu.jpg`; baby-guinness + st-patricks-day →
`drinks/drinks-summery.png`; boxing-day → `christmas-parties/christmas-parties.jpg`; halloween + new-years-eve →
`whats-on/whats-on.jpg`; corporate-events → `corporate-events/corporate-events.jpg`; private-hire feature pages →
`private-hire/private-hire.jpg`.

## Per-page quirks / decisions

- **JSX `lead` + separate `description`:** InteriorHero has one string `lead`. Where a page had both a `description`
  string and a JSX `lead` paragraph (sunday-lunch, all seasonal pages, managers-special active hero), I **combined**
  both into a single `lead` string to preserve all copy (no rewriting). HTML entities (`&middot;`/`&pound;`/`&bull;`)
  became the literal characters `·`/`£`/`•`. `bonfire-night`'s pre-existing `·` separators are the middot char.
- **eyebrow that was JSX** (christmas-parties `<span className="text-red-100">Christmas 2026</span>`): kicker is a
  string prop, so passed plain `"Christmas 2026"` (gold-bright per design; red styling dropped).
- **Title HTML entities:** `fathers-day` title `Father&rsquo;s` → `Father’s` (curly apostrophe char), since kicker/title
  are strings not JSX.
- **>1 secondary CTA collapsed to one outline (per "at most 1 outline" rule) — copy/nav loss, FLAG for review:**
  - `drinks`: dropped hero links **"Pizza Menu"** and **"Sunday Roast Info"** (kept Reserve a Table + Jump to Menu).
    Both targets still linked elsewhere in the page body.
  - `corporate-events`: dropped **"Explore Our Solutions"** (`#solutions`) outline (kept Book Your Event + Discuss
    Your Event). `#solutions` section id still exists; it just loses its hero anchor.
  - `function-room-hire`: dropped **"WhatsApp Enquiry"** outline (kept Call + Enquire Online). WhatsApp still linked
    lower in body.
  - `private-party-venue`: dropped **"WhatsApp Us"** outline (kept Book Your Party + Call). WhatsApp still linked in body.
- **drinks** primary CTA was styled `variant="outline"` with gold overrides; remapped to `variant="primary"` (it is the
  one primary action). Removed sole-use `HeroBadge` import; added `Badge` to the `@/components/ui` import.
- **events/[id]** (dynamic): `image={eventImageSrc || DEFAULT_PAGE_HEADER_IMAGE}` (added `DEFAULT_PAGE_HEADER_IMAGE`
  import); `crumb={event.category?.name ?? "What's On"}`; `heroTags.map(...)`→sand badges; actions render
  `{heroPrimaryCta}{heroSecondaryCta}` (primary may be undefined when booking is blocked — fine, ReactNode). Removed
  sole-use `HeroBadge` import (was only in the dropped secondaryInfo); `imageAlt`/`blurDataURL`/`getCategoryPageUrl`
  still used elsewhere so kept.
- **managers-special** has TWO hero render branches (fallback + active promotion); both migrated. Active branch keeps
  the childless `BookTableButton` (default label) as primary + View Drinks Menu outline.
- **near/[slug]** (dynamic): `crumb={\`Near ${landmark.name}\`}`; title/lead/badges interpolations preserved.
- **PhoneButton has no `fullWidth` prop** — tsc flagged it. Removed `fullWidth` from all PhoneButton CTAs (the
  InteriorHero actions wrapper `[&>*]:w-full sm:[&>*]:w-auto` already forces full-width on the direct child). `fullWidth`
  kept only on Button/BookTableButton (which accept it).

## Verification (verbatim)

1. `git grep -l "HeroWrapper"` over the 45 owned files → **0 hits** (exit 1). None import or use HeroWrapper.
2. `npx tsc --noEmit` → **exit 0, zero output** (clean). One round of fixes was needed (PhoneButton `fullWidth`) — now clean.
3. Old-token audit (`anchor-(gold-light|gold-vivid|warm-white|text-on-green|text-on-gold|bg|bg-raised|bg-card)|shadow-(luxury|luxury-lg)|font-serif|font-merriweather`)
   over all changed page files → **0 hits** (exit 1).
4. `npx next lint` on the files with dropped/changed CTAs (drinks, corporate-events, function-room-hire, events/[id],
   private-party-venue) → **No ESLint warnings or errors**. No unused-import fallout.

Did NOT run `npm run build` (per brief). Did NOT touch `docs/architecture/*`, `app/page.tsx`, shared components, or any
file outside the 45. The parallel sibling batch also has files in the working tree (104 total changed page.tsx); my
tsc/old-token checks pass across the combined tree.
