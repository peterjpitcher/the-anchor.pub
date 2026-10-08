# Privacy notice and cookie consent (P07)

Date: 8 October 2026. Branch: `fix/privacy-and-consent-p07`, from main at 9e014677 (PR #220). Website only. Local only: not pushed, no PR, not deployed.

Source: the site review of 7 October 2026, package P07 (findings C3-008, C3-031, C4-014, PC-001 to PC-007, PC-009 to PC-013, PC-015, PC-017 to PC-020 and PL-008, with the checkers' corrections). Owner decision 4 (Google Analytics and Clarity off until a visitor presses Accept), owner fact 28 (Orange Jelly Limited is the business responsible for customers' personal data) and the follow-up decision on unsuccessful job applicants (a short record kept for good, the CV and contact details deleted after 12 months). The recorded defaults for C4-014 (the CCTV line), PC-010 (guest pages link to the website's policy), PC-017 (no marketing boxes on the parking form) and PC-005 (state only the periods the booking system enforces).

Builds on P04, P05 and P06: the failure reporter, the rate limiter and the rule that no booking reference reaches Google Analytics are used as they are.

Nothing here is legal advice. The notice states what the code does and what the owner has decided. It gives no legal basis for anything.

## What changed

### 1. Tag Manager is not loaded until Accept (PC-001, PC-013, owner decision 4)

The published Tag Manager container (GTM-WWFQTQS, version 8) fires its Google tag and its Clarity tag with no consent condition. The site loaded the container on every page, so both ran before any choice and carried on after Reject: no cookie and no lasting identifier, but the full page address, query string included, went to Google and Microsoft each time. On a link from one of our marketing emails that address carries the code that identifies the recipient.

The container is not in this repository. What the site can decide is whether it loads at all, and now it does:

- `app/layout.tsx` no longer loads Tag Manager. The script, the `noscript` frame (which loaded the container for anyone without JavaScript, who can never be asked) and the two connection hints for Google's hosts are gone. The inline consent defaults stay, so they are the first thing the container reads when it does load.
- `components/tracking/GTMProvider.tsx` adds the script only when analytics cookies are accepted: on load for a returning visitor who accepted before, and at the moment of Accept for everyone else, after Google has been told the choice. The page the visitor is on when they accept is counted; nothing about the pages before it is sent.
- Switching analytics off needs nothing new: `lib/cookies.ts` already reloads the page when a category goes from on to off, and the page that loads next never adds the script.
- The "already wired" flag on `window` is gone from GTMProvider. Under React's development double run it stopped the consent listener being added back, which is why consent mode could only be checked on a production build. The effect's own clean-up keeps it to one listener.

The container waits for analytics, not for "analytics or marketing". A visitor who switches marketing on and analytics off would otherwise get the container, and with it Google Analytics and Clarity, which is what they refused. The cost is that Meta's pixel and LinkedIn's tag, which live in the same container, also wait for analytics. The settings panel and the notice both say so. `mayLoadTagManager()` is the one line to change once the container itself is fixed (see "For Tag Manager").

### 2. The cookie banner says what is true (PC-006, PC-011, PC-012)

`components/CookieBanner.tsx`:

- The line "By continuing to visit this site you agree to our use of cookies" is gone. Nothing was ever switched on by carrying on. The phone version said only "We use cookies."
- One message at every width: "We'd like to use cookies to see how our website is used and which of our adverts work. They stay off unless you accept. You can choose which cookies or read our privacy policy."
- Reject and Accept are the same button: same variant, same size, equal width on a phone, Reject first. Accept used to be filled gold and Reject faint.
- The control that opens the settings panel is in the sentence, not a third button. Three buttons did not fit a 320px phone: the third ran off the edge when measured.
- The Preference Cookies switch is removed. No code read it, and no tag in the container acts on the signal it sent to Google. `lib/cookies.ts` drops the category; a cookie saved before this still parses, and the old field is ignored.
- The panel's descriptions name the companies (Google Analytics, Microsoft Clarity, Meta, LinkedIn) and no longer claim "secure areas", a "language preference" or analytics that report "anonymously". Both analytics tools give the browser an identifier, and Clarity records scrolling and clicks.

### 3. Switching a category off also clears browser storage (PC-007)

Deleting cookies left Google's advert click reference in local storage (`_gcl_ls`) and Clarity's session token in session storage (`_cltk`). `lib/cookies.ts` now removes local storage keys starting `_gcl_` when marketing is off and `_cltk` when analytics is off, on every consent write, beside the cookie clean-up. The notes that only keep a pop-up closed are left alone.

### 4. The server checks the cookie choice itself (PC-003, PC-015)

A guest who refused marketing cookies but booked on a tagged link still had the advert click reference and campaign tags sent to the marketing system, by two paths the September change missed.

- `lib/meta-pixel.ts`: the forward read `fbclid`, `gclid`, the `utm_` tags and `short_code` off the address bar when the consent-gated record was empty, which is exactly the refused case. It now reads the address bar only with marketing consent.
- `app/api/event-bookings/route.ts`: `buildSourceUrl` passed on the raw Referer header, query string and all. It now returns the page without its query string, as the table route already did.
- `lib/booking-conversion-consent.ts`, new: `gateBookingConversionByConsent()`. Without marketing consent the booking is still passed on (the marketing system counts bookings), but the click references, campaign tags, short link code, Meta's identifiers, the scrambled contact details, the IP address and the browser string are removed, and page addresses lose their query string. All five places that forward a conversion use it: the browser's route, the table and event booking routes and both PayPal capture routes.
- `lib/cookie-consent-server.ts`, new: reads `anchor-cookie-consent` from the request. Marketing consent now counts only when the body flag and the cookie agree. A missing or unreadable cookie means no.
- `app/api/analytics/route.ts`: forwards nothing to Google Analytics unless the cookie shows analytics accepted. It used to forward whenever a Google client id was present.

A consenting browser always sends `meta_consent_granted: true` with its attribution (`getMarketingConsentSignalPayload`), so requiring the flag loses nothing.

Not changed: table bookings still send the page labels and `utm_` tags to the management app whatever the cookie choice. That is the owner's decision of 25 September 2026 and the notice says so.

### 5. Maps load when asked for (PC-018)

`components/ui/GoogleMapEmbed.tsx` held a Google Maps frame that loaded with the page on the homepage, Find Us, every event page and the other pages that show a map: a request to Google before any choice, which no cookie setting could stop. The space is now held at the same height with a "Show the map" button and an "Open in Google Maps" link, and the frame is added on a press. The homepage's own inline frame now uses the same component.

### 6. Booking form notices (PC-009, PC-017, C4-014, part of PC-006)

- Event bookings: the form's notice mentioned marketing texts only, though anyone with a booking is on the marketing email list. It now shows the table form's words, which cover email and name both ways out, as `GUEST_EVENT_COMPACT_CONSENT_NOTICE`. `GUEST_COMMS_CONSENT_TEXT_VERSION` moves to `guest-comms-consent-v6`. The server sanitiser accepts v5 as well and passes on whichever was sent, so a browser on the old bundle during a deploy keeps its record under the words it was shown.
- Airport parking: the marketing tick boxes are gone and the service notice stays, with every marketing choice sent as false. The line "Your details are never shared" is removed, because they go to the payment, text and email providers; it points to the privacy policy.
- Parking terms, term 6: "footage will only be made available to the police" and "We do not provide footage to individuals or private parties" are replaced with a pointer to the privacy policy and who to ask about footage.
- Job applications: the form now says, above the consent box, that the application and CV are kept in the management system and read by an AI service, with a link to the notice's section. The notice version sent with an application moves to `join-our-team-2026-10-08`.

### 7. The privacy notice, rewritten (C3-008, C3-031, PC-002, PC-004, PC-005, PC-006, PC-013)

`app/privacy-policy/page.tsx`. Every sentence is a fact about one of the two codebases or a decision the owner has made, and the comment above it in the source says which.

What it now says that it did not:

- Orange Jelly Limited is the business responsible for the data.
- What each form collects, including allergies, the accessible table answer, high chairs and vehicle details.
- That links in our texts and emails are our own short links, what a tap records, and that a marketing email's link identifies the email and who it was sent to.
- Job applications: kept in the management system; the CV text and answers sent to OpenAI for a summary and a score; a person decides; the automatic acknowledgement; texts only with the tick; interviews in the calendar; and the owner's retention decision, word for word.
- Every cookie and every browser storage key, by name, with lifetimes.
- Thirteen companies and what each is for: Cloudflare, Vercel, Supabase, Twilio, Resend, Microsoft, PayPal, Google, OpenAI, Meta, LinkedIn, Upstash and Aviationstack.
- That several of them are outside the UK.
- The periods a job enforces: message content removed after 24 months, food pre-orders after two years, the page and browser details on a contact choice after 24 months. Customer records and bookings are not deleted automatically, and it says so.

What it no longer says: the newsletter line, "access to secure areas", the "language preference", "anonymized" analytics, the Preference Cookies section, "CVs are not stored on the website server", "within 6 months", "Social Media Platforms", the children's privacy section and the general security promise. None described this site.

Sentences earlier changes had pinned with tests are kept word for word: the two page source lines, the page speed paragraph, the marketing cookie account and the Managing Cookies line.

`lib/legal-pages.ts`: the date moves to 8 October 2026 and the fingerprint with it. If this goes live on a later day, move the date to that day.

### 8. Security headers (part of PL-008)

`config/security-headers.json` loses `X-XSS-Protection`, a header browsers have dropped. The rest of PL-008 and PC-020 is under "Not done".

## Seen on a production build

`npm run build` then `next start -p 3100`, loaded as `http://www.anchor.localhost:3100` so cookies land on a parent domain as they do live. Plain page loads only; no form was sent. Requests were read from the browser's own resource timing, which lists every host a page contacted. Clicks came from script, because the Browser pane was not on screen.

| State | Pages | Requests to another company | Cookies |
|---|---|---|---|
| No choice made | /, /find-us, /join-our-team, /near-heathrow/terminal-5, /book-table | None to Google or Microsoft. Cloudflare's security check on the form pages. Aviationstack on the terminal page, 30 in five seconds. | None |
| Accept all, on /find-us | the same page, no reload | Tag Manager, the Google tag, Google Analytics, Clarity (its tag twice), Meta's pixel, LinkedIn's tag, and Google's advertising hosts (`stats.g.doubleclick.net`, `www.google.co.uk/ads/ga-audiences`) | `anchor-cookie-consent` 365 days, `anchor-booking-attribution` 90 days, `_ga` and `_ga_2ZTRYGDRJW` 400 days, `_clck` 365 days, `_clsk` 1 day |
| Marketing switched off | /find-us, after the reload | Tag Manager, Google Analytics, Clarity. No Meta, LinkedIn or Google advertising host. | The advert record is gone from the cookie and from storage |
| Analytics off, marketing on | /find-us, after the reload | None | Only ours: the choice and the advert record. `_cltk` gone from session storage. |
| Both off | /find-us, /, /whats-on, /sunday-roast, /private-hire | None to Google or Microsoft. Cloudflare's security check on /private-hire. | `anchor-cookie-consent` only |

On Accept the dataLayer read, in order: the denied default, the granted update, then the container's start. On an event page the map frame was absent until "Show the map" was pressed, the placeholder and the frame were both 300px tall, and `maps.google.com` appeared only after the press.

Not seen here, and why: Meta's pixel sets no cookie on a local address, and the server's forward to Google Analytics is switched off locally (no secret is set), so that rule is held by `tests/api/tracking-consent-on-server.test.ts`.

The page speed record (`/api/web-vitals`) is unchanged: it is our own, sets no cookie, runs until analytics is switched off, and the notice says so.

## What this does to the analytics numbers

Google Analytics and Clarity will count only visitors who press Accept. Before this they also received cookieless page pings from everyone else, which Google's reports use to model the visitors it cannot see. Expect users, sessions and page views in Google Analytics to fall on the day this ships, by the share of visitors who reject or never answer the banner, and Clarity recordings to fall the same way. Nothing about the number of real visitors or bookings changes. Compare periods before and after the ship date with that in mind, and judge the site by bookings in the booking system, which do not depend on the banner.

Booking conversions still reach the marketing system for every booking. For guests without marketing consent they now arrive with no advert attached, so a few bookings that used to be credited to a campaign will show as uncredited.

## For Tag Manager (the container is not in this repository)

In container GTM-WWFQTQS:

1. Google tag for G-2ZTRYGDRJW: under Advanced settings, Consent settings, require additional consent `analytics_storage`.
2. Clarity tag: remove it. The site loads Clarity itself (`lib/use-clarity.ts`) and already waits for consent, so the container's copy makes it load twice (PC-019). Check first that `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set in production, or removing the tag switches Clarity off altogether. If it is not set, keep the tag and give it the same `analytics_storage` requirement instead.
3. Meta and LinkedIn tags: no change. They already require `ad_storage`.
4. Publish.

After 1 and 2 are live, `mayLoadTagManager()` in `components/tracking/GTMProvider.tsx` can become "analytics or marketing", so a visitor who accepts marketing alone gets Meta's and LinkedIn's tags. The Google tag then also needs a second trigger on the site's `cookie_consent_update` event, or a visitor who turns analytics on later in a visit is not counted until the next page. The notice's line that those two tags need analytics changes in the same commit.

## For the management app (not built here)

1. Job application retention, to match the owner's decision. `runRecruitmentRetentionCleanup` in `src/services/recruitment.ts` today covers only applications marked rejected, withdrawn or duplicate, and it blanks the name as well as the contact details. The decision is: for everyone not taken on, delete the CV and contact details 12 months after they applied, and keep name, role, date, outcome and reason for good. That means covering applications that never got a decision and the talent pool, keeping the name, and clearing what the job does not touch today: the application's answers and cover note, the AI's rationale, strengths and concerns, `recruitment_ai_runs.raw_response` and `structured_output` (which can hold the name, email and phone the AI read off the CV), candidate notes, and the calendar entries. A candidate with one old application and one live one should not be wiped. The notice's sentence is true of every application only once this ships.
2. Guest pages link to the website's notice (PC-010). `src/components/features/guest/GuestShell.tsx` links every guest page footer to `/privacy`, a notice dated 21 December 2024 that disagrees with the website's. Point the guest link at `https://www.the-anchor.pub/privacy-policy` and keep `/privacy` as the staff notice.
3. The management app's own notice (`src/app/privacy/page.tsx`) states periods no job enforces (customer data 2 years, booking records 7 years, audit logs 7 years), lists "Date of birth (for age verification)" although customers have no such field, and names only Twilio, Supabase and "payment processors" among the companies it uses.
4. Consent wording. `src/lib/consent/constants.ts` keeps its own copy of the notice words beside the version and falls back to `guest-comms-consent-v5`. The website now sends v6 with the event notice covering email. The copy there needs the v6 words.
5. `short_link_clicks` (IP address, browser, town, referrer for every tap on a short link) has no deletion job. The notice describes the record and gives no period for it.
6. PC-013, third part: the code in a marketing email's link is the recipient row's id. A short-lived opaque token would do the same job without putting a database id in a web address.

## Not done on the website, and why

- The rest of PL-008 and PC-020: removing `'unsafe-eval'` and naming every host in `connect-src`. The finding's own order is a report-only policy for a week on the booking, payment and bot check pages first, and that needs somewhere to send the reports, which is a privacy choice for the owner. Tightening it blind risks breaking PayPal, and no payment can be tested from here. The unencrypted Aviationstack source goes with the flight boxes (P19).
- PC-019, Clarity loading twice after Accept: the second copy is the container's. See "For Tag Manager".
- PC-012's suggestion to move pop-up markers to session storage: left as they are. Each lasts as long as it needs to keep a pop-up closed, none identifies anyone, and all are now named in the notice.
- Stripping `fbclid`, `gclid` and `utm_content` from the address bar (PC-013, second option): not needed now that nothing loads before Accept.

## Left out of the notice because the fact is not on record

Each of these is something a privacy notice would normally carry. None is in `docs/SSOT.md`, the owner's decisions or either codebase, so the sentence was left out and not guessed.

- Orange Jelly Limited's company number and registered office.
- The legal basis for each use. The old notice gave one for job applications; nothing on record supports it, so it came out.
- How long CCTV footage is kept, and who can see it.
- What safeguards cover information handled outside the UK, and where the booking system's database is held.
- How long details are kept for someone who ticks "keep my details for future suitable roles" on the job form. The management app stores the tick and no job reads it.
- Whether email opens are recorded. The management app handles an "opened" event from Resend, but whether Resend's open tracking is switched on is a setting outside the code.
- Whether Stripe takes any payment. Its code is in the management app; no caller was found.
- Whether email addresses are collected at the bar. One unlisted blog post tells readers to "ask at the bar to join" a newsletter. The notice's newsletter line was removed because the website has no sign-up.
- Two production settings the code cannot show: whether the AI key is set (if not, no application is sent to OpenAI) and whether the retention period is left at its default of 12 months.

## Assumptions

- "Accept" in decision 4 means accepting analytics cookies. Accept All, and the Analytics switch in the panel, both count.
- The management app's code as exported on 7 October (commit 7949af82) is what runs in production.
- The 7 day and 24 month clear-downs in the marketing system are as an earlier change recorded them (PR #183). That repository was not read for this work.
- Aviationstack is named because the flight boxes are still on main. Whoever removes them (decision 14) removes that line and moves the date and fingerprint.
- The cookie lifetimes are what Google's and Microsoft's tags set on 8 October 2026. They can change them.

## Tests

- `tests/unit/tag-manager-waits-for-accept.test.tsx`, new: no Tag Manager script before a choice, after Reject, or with marketing accepted and analytics refused; one script after Accept, added after the consent update; the root layout names no Google host.
- `tests/unit/cookie-banner-wording.test.tsx`, new: the message, no "by continuing", one layout, Reject and Accept with identical classes, Reject first, two switches in the panel, and none of the untrue descriptions.
- `tests/lib/booking-conversion-consent.test.ts`, new: the cookie reader fails closed seven ways; the gate strips every identifier unless the body and the cookie both say yes.
- `tests/api/tracking-consent-on-server.test.ts`, new: `/api/analytics` forwards nothing without an analytics cookie; the conversion route drops the tags when the body claims consent the cookie does not show.
- `tests/unit/booking-form-notices.test.tsx`, new: the event notice, the version and both accepted versions, the parking form and the CCTV term.
- `tests/unit/privacy-policy-inventory.test.tsx`, new: every host in the Content Security Policy maps to a company named in the notice; every cookie the site cleans up and every storage key it writes is named; a new file that touches browser storage fails the test; the decision on job applications is there word for word; no company number, legal basis or transfer safeguard is stated.
- `tests/unit/meta-pixel.test.ts`: with consent refused and a tagged address, the posted body carries none of the tags and no query string.
- `tests/unit/cookie-withdrawal-cleanup.test.tsx`: the two storage keys go with their category and nothing else does.
- `tests/api/event-bookings-policy-fallback.test.ts`: a Referer with a query string is passed on without it.
- `tests/unit/google-map-embed-title.test.tsx`, `tests/unit/event-detail-page.test.tsx`: no frame until the button is pressed, same height before and after.
- Brought in line: the three cookie tests (no preferences category), the four privacy notice tests (new headings and fingerprint), and seven route tests that now send the consent cookie a real browser would.

Gates on Node 20.19.5, 8 October 2026: `npm run lint:next` no warnings or errors; `npx tsc --noEmit` clean; `npm test` 300 suites, 5,056 passed and 1 skipped; `npm run test:utc` the same; `npm run build` completed, 267 pages.

Two of the new tests were checked against the fault they guard: with `mayLoadTagManager()` forced to true, five cases in `tag-manager-waits-for-accept` fail; with the address bar read whatever the choice, the new `meta-pixel` case fails.
