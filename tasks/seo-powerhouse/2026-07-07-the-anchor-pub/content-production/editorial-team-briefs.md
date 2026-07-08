# Editorial-Team Briefs — content work to route through the `editorial-team` skill

_Per house rule ([[feedback_editorial_team]]), all customer copy is produced/edited via the `editorial-team` skill, not written inline by the SEO run. These are the briefs. Each names the SSOT constraint and the cannibalisation verdict. Delivery mode: **Edit existing** unless noted. All prices LIVE from DB — never hardcode._

## EB-1 · /christmas-parties (SEO-017, SEO-015) — URGENT (Jul–Oct window open)
- **Job:** Remove ~20 hardcoded food/drink prices and the "£45–£52 spend target" line (SSOT bans minimum-spend wording). Fix "fifteen minutes from Terminal 2" → SSOT 11 minutes. Remove literal "live price" placeholder tokens (paired with dev ticket T-SEO-015).
- **SSOT:** prices live from DB; no min-spend wording; Christmas seated capacity 60; distances per §2 table.
- **Cannibalisation:** expand existing; do not create a new page.

## EB-2 · /private-hire/wakes (SEO-018) — sensitive audience
- **Job:** One consistent capacity (SSOT: dining room 26 seated, private hire 10+–150) — remove the conflicting "up to 50/60". Correct "five minutes from South West Middlesex Crematorium" → SSOT 10 minutes (Staines Cemetery 8, Slough Crematorium 15). Keep tone respectful; wakes have **no room-hire charge** (SSOT).
- **Cannibalisation:** expand existing.

## EB-3 · Private-hire cluster room-hire wording (SEO-019)
- **Job:** Reconcile room-hire-fee wording across `/private-hire`, `/private-hire/christenings`, and related pages to SSOT: general private hire = "room hire charge: discuss on enquiry" (do NOT publish minimum-spend wording); wakes = no charge; deposit £250.
- **Cannibalisation:** expand existing.

## EB-4 · Price de-hardcode sweep (SEO-016, SEO-022)
- **Job:** Remove hardcoded food/drink prices from the remaining app pages (`/our-pub` "Pints from £4.95" + 7 named draught brands; `/beer-garden` "food from £10"; `/heathrow-parking` own rates in title/meta/body) and ~10 indexable blog posts (`best-sunday-roast-near-heathrow`, `cheap-christmas-parties-heathrow`, `how-to-plan-christening-reception`, `pub-vs-hotel-celebration-venue`, engagement-parties "£7.99 prosecco", etc.). Remove hardcoded opening hours + review count from evergreen copy. Reconcile occasion-page capacity claims to SSOT (or remove).
- **SSOT:** all food/drink prices live; the group-deposit "10+, £10pp" and fixed non-food figures (quiz/bingo entry, ULEZ saving) may stay.
- **Follow-up:** add a drift-guard test asserting no hardcoded £-price strings in these files.

## EB-5 · Blog banned-claim purge (SEO-020)
- **Job:** Remove verbatim banned claims: "beef dripping" (`/blog/fish-chips-guide`), "rotating guest ales"/hardcoded hours (`/blog/friday-extended-hours`), "baby changing facilities", any "Sky Sports"/live-sport claims, and the cross-blog "never show live sport" contradiction. Fix the `/blog/fish-chips-guide` title/H1 that uses "The Anchor Pub" conversationally (title-field use is fine; H1/body should read "The Anchor").
- **SSOT §14:** banned claims list.

## EB-6 · Money-page meta descriptions (SEO-024)
- **Job:** Rewrite the broken 289-char `/private-hire` meta description (grammatically broken) and refresh `/food-menu`, `/book-table` metas once T-SEO-007 restores the £. ≤155 chars, benefit-led, SSOT-accurate.

## EB-7 · Private-hire de-cannibalisation copy (SEO-034) — interim only
- **Job:** Interim retarget of H1/title so `/private-hire`, `/function-room-hire`, `/private-party-venue` stop targeting the identical "Function Room Hire Near Heathrow". `/private-hire` = umbrella/occasions hub; `/function-room-hire` = the room/space spec; differentiate `/private-party-venue` or fold it in.
- **BLOCKED on GSC (SEO-002) for any merge** — do interim differentiation now, decide merges from data. Cannibalisation verdict: **expand/retarget existing; do not create new**.

## EB-8 · AEO answer blocks (SEO-037) — with `ai-seo` + `schema-markup`
- **Job:** Add an FAQ + FAQPage schema and reusable extractable answer blocks to `/private-hire` and `/whats-on` (and roast/plane-spotting/pub-near-T5 answer targets). Short, quotable answers an AI engine can lift.

## EB-9 · Over-claim tidy-ups (SEO-046)
- **Job:** `/whats-on` frequency claims ("this week"/"weekly" → accurate cadence); `/fish-and-chips-heathrow` title leads "Staines" while URL/H1 target Heathrow — align; date/source the "Save £20–40" (corporate) and parking savings claims or remove.
