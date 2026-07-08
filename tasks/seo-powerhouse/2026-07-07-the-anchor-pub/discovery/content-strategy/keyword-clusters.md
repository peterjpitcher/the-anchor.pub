# Keyword Clusters — The Anchor (7 July 2026)

**No volume/difficulty data this run** (no GSC, no SEO tool). Clusters are built from URL/title evidence (`evidence/page-metadata.csv`) and manual SERP intent checks (7 Jul 2026). Every representative term below is **unvalidated** — the orchestrator must run `keyword-plan` before any term is treated as a brief target. Difficulty labels are inferred from SERP composition only.

## Cluster → URL ownership map (proposed single owner per head term)

| Cluster | Head term owner (proposed) | Supporting URLs | Blog support | Conflicts to resolve |
|---|---|---|---|---|
| Sunday roast | /sunday-roast | /food-menu, {town}-pub sections | best-sunday-roast-near-heathrow (listicle), best-sunday-roast-surrey, family-friendly-sunday-roast-heathrow (retarget long-tail) | Banned phrase in title; stale /sunday-lunch snippet in index |
| Private hire / venue hire | /private-hire | 8 occasion pages, 15 near/* landmark pages, /private-party-venue, /corporate-events | private-party-venues-near-heathrow, pub-with-private-room, private-room-hire-cost, pub-vs-hotel | /function-room-hire duplicates head term (retarget); merge a-personal-pub-for-personal-celebrations |
| Function room (room-config angle) | /function-room-hire (after retarget) | /private-hire cross-link | function-room-hire-near-heathrow-staines; MERGE pricing+comparison posts | 3 blog posts on one micro-topic |
| Events / what's on | /whats-on | quiz-night, music-bingo, cash-bingo, karaoke, live-music, live-sport, dated /events/* | quiz-nights-near-heathrow, live-music-pubs-near-heathrow, live-sport-pubs-near-heathrow, what-is-race-night | sports-update (Sky targeting — redirect) |
| Pub near Heathrow | /near-heathrow | terminal-2/3/4/5, /heathrow-hotels-pub, 11 hotel pages | pubs-near-heathrow-free-parking, cosy-pub-stanwell | Hotel pages near-duplicate (differentiate) |
| Eat near Heathrow | /restaurants-near-heathrow | /food-menu, /pizza-menu, layover/pre-flight pages | where-to-eat-near-heathrow-2026, things-to-do guides, noindexed price archive | Repoint 2 legacy 301s away from noindexed target |
| Family + dog | /family-friendly-pub-heathrow (post-merge), /dog-friendly-pub-heathrow | beer-garden | dog-friendly-walks, dog-travel-tips | Merge /heathrow-family-dining; retarget /blog/dog-friendly-pub |
| Plane spotting | /plane-spotting-heathrow | beer-garden, near-heathrow | heathrow-plane-spotting-locations (2026) | None — protect |
| Heathrow practical | /heathrow-parking, /luggage-storage-heathrow, /coach-parking-heathrow | terminal pages | cheap-heathrow-parking-alternatives, heathrow-layover-guide | None |
| Local towns | 14 {town}-pub pages + /pubs-in-stanwell | — | stanwell-moor-village, support-your-local-pub | None — add contextual roast/hire links |
| Christmas (evergreen) | /christmas-parties | /corporate-christmas-parties | 5 christmas blog guides | Price claims in 2 posts (sweep) |

## Intent classification of representative terms

| Term (unvalidated) | Intent | Right page type | Site has it? |
|---|---|---|---|
| sunday roast near heathrow | Commercial | Landing | Yes |
| best sunday roast staines/surrey | Commercial (listicle) | Honest listicle post | Yes |
| function room hire near heathrow | Transactional | Landing | Yes ×2 (conflict) |
| how much does private room hire cost | Informational→transactional | Blog guide + FAQ on pillar | Blog yes; pillar FAQ missing |
| wake venue near [crematorium] | Transactional, urgent | Landmark landing | Yes (15 pages) |
| pub near terminal 5 | Navigational-commercial | Terminal landing | Yes |
| pub near hilton heathrow | Navigational | Hotel landing | Yes (thin) |
| heathrow plane spotting | Informational→visit | Guide + venue page | Yes (strong) |
| quiz night near heathrow | Local-transactional | Evergreen event page | Yes |
| cheap parking near heathrow | Commercial | Landing with dated prices | Yes |
