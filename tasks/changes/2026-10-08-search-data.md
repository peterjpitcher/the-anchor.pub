# Search data, links and the sitemap, 8 October 2026

Branch `fix/search-data-p16`. Website only. Source: work package P16 of the 7 October 2026 site review, plus finding DT-012 from P13.

Everything below was checked on a production build served locally, by parsing the JSON-LD blocks, the head tags and the sitemap that each page really sends. Nothing was judged from the source or from a text search of the page.

## 1. Structured data that was wrong

- [x] **Logo (SM-001, FD-005).** The logo address on every page named `/images/the-anchor-pub-logo-black-transparent.png`. The file is in `/images/branding/`. Fixed in `lib/schema.ts` and `SSOT.json`.
- [x] **Breadcrumbs (SM-002).** Six pages published the site address twice, for example `https://www.the-anchor.pubhttps://www.the-anchor.pub/private-hire`. `generateBreadcrumbSchema` now leaves a full address alone, and the six callers pass paths like every other page: `/join-our-team` and its two role pages, `/private-hire`, `/stanwell-pub`, `/reviews`.
- [x] **Map position (named in the spec).** Six pages gave a position that is not the pub. The four terminal pages pointed inside Heathrow; `/heathrow-parking` and `/pubs-in-stanwell` pointed about 900m away. All now give 51.462509, -0.502067 (SSOT section 2).
- [x] **Address.** `/stanwell-pub` gave the locality as "Stanwell Moor, Stanwell" and `/heathrow-family-dining` gave the street as "The Anchor, Horton Road". Both now match SSOT section 2.
- [x] **Price range.** The Facts page said `GBP`. It is `££`, as everywhere else.
- [x] **OpenTable (SM-025).** Removed from `sameAs` on every page. Nobody has confirmed a listing exists.
- [x] **Drinks menu (SM-017).** 168 of 176 drinks were published as an offer whose price was empty or was a word such as "Bottle". An Offer is now sent only for a real price: 8 drinks have one. The Sunday roast page had the same shape for a missing price and is guarded the same way.
- [x] **Live sport screening (SM-007).** Already removed on main before this branch. Confirmed gone in the built page.
- [x] **Music Bingo end date (SM-018).** Already rolling on main. Confirmed: the built page says 31 December 2027.
- [x] **Typed "last changed" dates.** The Facts page (2026-05-21) and the History page (2026-06-07) typed a `dateModified`. Both now use the same git date as the sitemap.

## 2. Opening hours on special days (HT-013)

The hours in the structured data covered a normal week. Each coming day that the management app lists with different opening hours now gets a dated entry in Google's documented form: `validFrom` and `validThrough` both set to the date, and 00:00 to 00:00 for a closed day.

On the build of 8 October the pages sent five: 31 October (to midnight), 25 December (12 to 3), 26 December (closed), 31 December (to 1am), 1 January (closed). These are read from `/business/hours`; the website adds none of its own. A day when only the kitchen is shut is left out, because these are the pub's hours and not the kitchen's.

## 3. Share data and titles

- [x] **Pages shared as the homepage (SM-019).** The root layout's share block carried the homepage address, so any page without a block of its own claimed to be the homepage. The address is out of the root. Six pages get their own block from `lib/page-open-graph.ts`, built from the title and description they already had: `/private-hire/brochures`, `/private-hire/venue-tour`, `/accessibility`, `/safety-and-respect`, `/sitemap-page`, `/whats-on/archive`.
- [x] **What's On share picture (SM-003, FD-004).** It named a quiz photo that was never in the repository. It now uses `quiz-night-hero-tables-full.jpg`, the photo already used as the quiz social image. The Past Events header used the same dead path.
- [x] The Facts page had a share block with no picture. The root and the homepage declared the default share picture as 1200 by 630; the file is 1920 by 1072.
- [x] **Titles naming the pub twice (SM-014).** The sweepstake page and the blog tag pages wrote "The Anchor" into a title that the root layout adds it to. None of the 211 pages now has it twice.

## 4. The sitemap's dates (SM-009, DT-012)

The dates were typed in `app/sitemap.ts` in a dozen named batches and were older than the real last change for 150 of 157 pages.

- [x] No date is typed any more. `scripts/generate-sitemap-lastmod.js` works out each page's date from the last commit to its own files and writes `config/sitemap-lastmod.json`. `app/sitemap.ts` reads it.
- [x] A page with no trustworthy date gets no `lastmod`. The old fallback to today's date is removed.
- [x] `/privacy-policy` keeps the date the notice itself prints. `/whats-on`, the Nations Championship hub and the event pages stay undated, as before.
- [x] The route is still dynamic and has no new cache header.

**What counts as a page's files.** Its route folder; any file that only that page imports; and three named data files (`lib/monthly-copy.ts` for the homepage, `content/menu/drinks.json` for `/drinks`, `lib/local-seo-data.ts` for the landmark pages). Shared code such as the header and footer does not move a page's date.

**When it runs.** Before every build (`prebuild`). It writes only on Vercel or CI, so a local build never changes a tracked file. `npm run sitemap:lastmod` saves it on purpose.

**Vercel clones ten commits only.** In a clone that short the oldest commit appears to add every file, so the script ignores that commit and keeps the committed date for any page it cannot see a real commit for. That is safe but not exact: a page changed more than ten commits before a deploy shows the date in the committed file, which may be older. Setting `VERCEL_DEEP_CLONE=true` in the Vercel project gives the build the whole history and makes every date exact. Until that is set, run `npm run sitemap:lastmod` and commit the result when a batch of pages has changed.

**What a date cannot see.** Prices and menus come live from the management app. A menu change there does not move a page's date, so a date can be earlier than the last menu change. It is never later than the truth.

## 5. Blog (template and listing only; no file under `content/blog` is changed)

- [x] **Redirected posts in listings (SM-012).** A post whose address redirects is dropped once, in `getAllBlogPosts`. Four such posts were still linked 22 times across the blog, through related reading and previous or next links. The sitemap's own list of seven retired slugs is gone.
- [x] **Bylines and dates (SM-024).** A team byline is published as the business, not a person. `dateModified` is `lastUpdated` from the post's frontmatter when set, else the last commit to the post. The publisher logo is the black one with its real size. The tag pages named the publisher "The Anchor - Heathrow Pub & Dining".

## 6. Links

- [x] **Header phone link (SM-010).** `tel:01753682707` is now `tel:+441753682707`.
- [x] **WhatsApp (SM-011).** Four location pages opened WhatsApp with "Hi, I" or "Hi, we" and nothing after it. The prefilled text is removed.
- [x] **Retired addresses (SM-013).** `/windsor-pub` linked to `/special-offers`, which redirects to the drinks menu; the button now goes to `/drinks` and says "See the Drinks Menu". The footer and the sitemap page sent "Leave a Review" through `/leave-review`; they now use the feedback address directly. The `/leave-review` redirect stays for printed and texted links.
- [x] An unused image schema named a `/terms` page that does not exist.

## 7. New checks

| Check | What it does |
|---|---|
| `npm run audit:links` | After a build, collects every internal address in `app`, `components`, `content` and `lib` and checks it against the built routes, `public/` and the redirect rules. Reports a 404 or a link that only arrives by redirect. |
| `npm run audit:rendered` | Now also loads the pages outside the sitemap, and fails on a broken breadcrumb address or a picture address with no file. Warns on a missing share picture or a page that shares as another. |
| `tests/unit/search-data.test.ts` | 24 tests for the faults above, including that every picture path written in `app`, `components` and `lib` is a real file. |

`npm run audit:links` is not in the lint chain yet. It reports 12 links in two blog posts (below) and would fail until those are fixed.

## 8. Not done here, and why

| Finding | State | Why |
|---|---|---|
| SM-006 | Left for the blog package | The wrong WhatsApp number (`4401753...`) is in four files under `content/blog`, which another branch is editing. |
| SM-013, blog part | Left for the blog package | Eleven `/pub-near-*` links in `heathrow-hotel-dining-vs-local-pub` and one `/function-room-hire` link in `pub-vs-hotel-celebration-venue`. |
| SM-022 | Left for the blog package | Two redirect rules to repoint at `/restaurants-near-heathrow`. Listed under P15 in the owner defaults. |
| SM-028 | Left for the blog package | Six post folders still exist although their addresses redirect. They are now inert (section 5), but deleting them is a `content/blog` change. |
| SM-027 | Not built | Nine pages are reached only from the sitemap page. Linking them needs new copy, seven are area pages whose "areas we serve" status is open until the SSOT review, and two are under copy correction. |
| SM-021 | Owner action | One Cloudflare redirect rule (http or no-www straight to https://www). Not in this repository. |
| FD-012 | Not built | Optional tidy-up of old picture addresses. No visitor-facing fault. |
| FD-009 | Closed by another change | The Manager's Special page was retired on 8 October. |
| SM-023, SM-026 | No change needed | The finding itself recommends leaving them. |
| Title rule in `CLAUDE.md` | Not changed | The spec asks for it. The rule "Page Title \| The Anchor Stanwell Moor" produces the name twice, because the root layout adds " \| The Anchor". An agent may not edit `CLAUDE.md`; the owner or the lead session should. |

## 9. Checked and found right

- No page sends a rating or review count in its structured data.
- Every "accessible toilet" and "baby changing" entry in the structured data is a `false` value or a plain "we don't have". None is a claim.
- All 195 sitemap pages return 200, carry their own canonical address and are indexable. The 16 pages checked outside the sitemap have the right canonical too.
- The quiz, Music Bingo and cash bingo prices in the structured data (£3, £5, £10) match SSOT section 10.
