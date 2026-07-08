# Implemented Small Fixes — 7 July 2026

Branch: `chore/seo-powerhouse-safe-fixes-2026-07-07` (off `main`). **Left uncommitted in the working tree** for owner review (`git diff`) — not committed, not pushed, no PR (per "commit only when asked"). Discard with `git checkout .` if unwanted.

Only fixes that are provably isolated (display/link/config only, **zero schema or routing risk**) were applied inline. Everything with schema, routing, copy, or owner-access implications was ticketed instead (see the roadmap and `deferred-or-blocked.md`).

| ID | Change | File | Verified |
|---|---|---|---|
| SEO-021 | Internal-link card "5 minutes from all terminals" → "7-12 minutes from Heathrow terminals" (SSOT §2: 7-12 min) | `components/seo/InternalLinkingSection.tsx:64` | tsc 0, eslint 0, string confirmed |
| SEO-026 | World Cup page "View Menu" link `/menus` (404) → `/food-menu` | `app/live-sport/world-cup/page.tsx:151` | no `/menus` link remains; now matches the existing `/food-menu` link at :372 |
| SEO-031 | robots.ts disallow `/leave-a-review` (non-existent) → `/leave-review` (real route) | `app/robots.ts:19` | no `leave-a-review` remains |
| SEO-044 | "Recognized customer" → "Recognised customer" (British English) | `components/PrivateBookingInquiryForm.tsx:295` | string confirmed |

## Verification run
- `npx tsc --noEmit` → **exit 0** (clean).
- `npx eslint <4 changed files>` → **exit 0** (clean).
- `git diff --stat` → 4 files, +4/-4.
- Full `npm run build` and live-render verification are the **owner's pre-merge gate** — these four edits change no imports or logic and cannot alter the build graph, so tsc+lint is proportionate proof they compile; the build step belongs with the owner's normal deploy pipeline.

## Explicitly NOT done inline (and why)
- **SEO-007 (£ symbol)** — highest-value, but `formatMenuPrice`'s output feeds `MenuPageItem.price`, which on some pages (e.g. `app/sunday-roast/page.tsx:111`, `MenuDisplay.tsx`) is a hair away from JSON-LD `Offer.price`. `MenuDisplay.tsx` already splits display vs schema (`formatMenuPrice` vs `normalizeMenuPrice`), and `/drinks` even strips `£` before building schema — so a blind `£` add risks invalid schema. Ticketed with a precise acceptance test.
- **SEO-008 (corporate CTA)** — the hero uses `<BookTableButton context="corporate_event">`; re-routing to enquiry changes shared-component behaviour. Ticketed.
- **SEO-010 (emails)** — `parking@` and `events@` are used deliberately in the parking/layover products; I can't verify those mailboxes are dead. **Owner must confirm which mailboxes are live** before any change; SSOT may need updating to reflect operational reality.
- **SEO-023 (title template)** — de-doubling the brand needs coordinated per-page title edits across 240 pages (editorial), not a one-line template swap.
- All customer **copy** corrections (prices, wakes facts, blog banned claims) route to `editorial-team` per house rule.
