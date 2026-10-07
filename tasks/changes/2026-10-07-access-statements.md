# Access statements (P09), 7 October 2026

Branch `fix/access-statements`. Website only. Source: the 7 October 2026 site review, package P09, findings B3-001, C1-005, C2-004, C2-013, B2-004, C3-011, C4-038, B1-022, C3-035 and SM-005, with the checkers' corrections and owner fact 25 (there is no marked disabled parking bay).

## What changed

- [x] **One home for the access wording.** `lib/approved-wording.ts` now holds `ACCESS_WORDING` (the SSOT section 16 "Getting in and around" block), `ACCESS_SHORT_WORDING` (the section 16 short form), `NO_ACCESSIBLE_TOILET_WORDING` (the toilet sentence from the block, for use beside the short form) and `ACCESS_AMENITY_FEATURES` (the same facts for structured data).
- [x] **Disabled parking removed** (owner fact 25): the "Designated disabled parking" line in `/blog/keeping-up-appearances`, and a "Disabled Parking: true" amenity in `lib/schemas/parking.ts`, which the review had not listed.
- [x] **"Wheelchair accessible throughout"** in `/blog/winter-hours-cosy-times-at-the-anchor` is now the short form plus the accessible toilet sentence.
- [x] **Private hire pages.** Christenings: the access FAQ answer is the full block and the "Step-Free Access" card is the short form plus the toilet sentence. Retirement parties: the "Accessible" card is the same pair, and "accessible" is gone from the structured data description and "easy access for all colleagues" from the page description. Wakes: the "Accessibility for All Guests" card is the full block, and the section lead no longer says "accessible venue".
- [x] **Cash bingo, music bingo and karaoke**: the "Find us" access line is the full block.
- [x] **Find us**: the wheelchair FAQ answer is the full block (it had dropped the garden sentence and the phone line and added "currently"); the "Accessible Entry" tile is the short form.
- [x] **The Anchor Facts**: the Accessibility row is the full block.
- [x] **/accessibility**: the two wheelchair FAQ answers are the full block, the closing line uses the short form in place of "step-free access to most areas", and parking is "20", not "approximately 20" or "around 20".
- [x] **Book a Table**: the Accessibility section is the full block with the phone number still tappable, and the two bare "Step-free access from the car park." lines are the short form.
- [x] **Blog**: the wake guide's access answer, both christening posts, and the descriptions of the retirement and 60th posts. One more line turned up when the guard ran: "easy access for all" in the Kraken rum post. Every post was checked live (HTTP 200) on 7 October 2026 before editing.
- [x] **Structured data (SM-005).** No page types a step-free amenity any more. The twelve places that did (three in `lib/`, nine page files, 25 pages plus the site-wide block) spread `ACCESS_AMENITY_FEATURES`: "Step-free access" with the approved short form as its value, and "Accessible toilet: false". "Ground Floor Access" is removed from the wakes page.
- [x] **Six Nations and World Cup pages** import the block instead of holding their own copy.
- [x] **`SSOT.json`**: `venue.amenities` says "Free parking (20 spaces)", not "~20".
- [x] **Guard test** `tests/access-wording-guard.test.ts`.

## Assumptions

1. Structured data keeps the access amenity rather than dropping it. A text value is valid for `LocationFeatureSpecification`, so the amenity now carries the approved short form word for word, with the missing accessible toilet beside it.
2. Where the short form is the only access line in a card or list on a page with no full block near it, the accessible toilet sentence is added after it. The sentence is lifted from the full block, not reworded.
3. "Entirely on the ground floor" and "Ground Floor Access" are removed. The checker found they are not in the SSOT. Nothing says they are false.
4. "Better accessibility" is removed from the 2019 renovation post with the disabled parking line, as the finding asked. It is a claim with no route.
5. The questions "Is The Anchor wheelchair accessible?" stay as questions. Only the answers changed.
6. The three Christmas posts that say "if you ask ahead" about the ramp are left alone: the checker ruled they do not contradict SSOT section 8.

## Not changed, on purpose

- **Event records.** Eight past event pages carry an old access note or FAQ from the management app (C2-004). They are listed for the owner in the hand-over, not patched here.
- The six blog folders that redirect. None of this package's lines is in them.
- The other 30 or so places that say "around 20" or "about 20" parking spaces (the Christmas page, the private hire hub and blog posts). C3-035 names the two lines on `/accessibility` and `SSOT.json`; the rest is a parking wording job, not an access one.
- Access copy that already states the route and the toilet in its own words (the rest of `/accessibility`, `/beer-garden`, `/sunday-roast`, the private hire hub, `/corporate-events`, the footer). The reviewers checked these and found them correct.
- `content/copy-decks/`: drafts, not served.

## Tests added

`tests/access-wording-guard.test.ts`:

- the two constants match the SSOT section 16 blocks word for word;
- new patterns fail on "wheelchair accessible", "disabled parking", "accessible for all", "access for all", "step-free access to most", "access to most areas", "fully accessible", "accessible venue", a bare "Accessible" card heading, "entirely on the ground floor", and a typed "Step-free access" or "Disabled Parking" amenity;
- an honest denial passes ("We don't have an accessible toilet", "There is no marked disabled parking bay"), and so does a question;
- the named pages import the constant, and the blog posts carry the block word for word.
