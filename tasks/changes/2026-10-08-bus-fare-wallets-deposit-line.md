# Bus fare, wallet payments and one deposit line, 8 October 2026

Branch `fix/bus-fare-wallets-deposit-line`. Website copy only. Owner said yes to each in chat on 8 October 2026.

## What changed

- [x] **Bus fare.** The typed £2.50 fare is gone from the four `/near-heathrow/terminal-N` pages (the "By Bus" tile, the FAQ answer, and on Terminal 5 the fare line and the structured data). The pages still say the 442 stops near us.
- [x] **Wallets.** Apple Pay and Google Pay are out of the parking facts in `SSOT.json` and out of the "cheap Heathrow parking alternatives" post. PayPal and cards stay.
- [x] **Surprise party post.** "no deposit needed until you're ready to confirm" is removed. A private hire takes a £250 deposit (SSOT section 7).
- [x] **Guard.** Three tests added to `tests/money-wording-guard.test.ts`.

## Assumptions

1. The Terminal 2, 3 and 4 tile now shows "442" where the fare was, with "The 442 bus stops near us" beneath, which is what the page's own FAQ already says.
2. Both posts answer 200 on the live site, so the edits are served.

## Management app

Adult "Mac & Cheese" was switched off in `menu_dishes` on 8 October 2026 (owner said yes). Nothing in this repository changes for that.
