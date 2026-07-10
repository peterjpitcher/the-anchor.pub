# UX & Conversion Analysis

Date: 2026-07-10  
Scope: current local `/christmas-parties` page and its enquiry path

## Summary

The page now gives visitors the two required routes immediately: plan a Christmas party, or request a sit-down Christmas lunch or dinner. Pre-order-only wording is clear in the hero, choice card, drawer and meal form. The 390 px mobile layout has no horizontal overflow, the main actions are visible in the first screen, and the drawer is full-width, scrollable and usable on a phone.

The first audit found three release blockers: the drawer closed before showing success, the timed lightbox could cover an active drawer, and final phone/email controls opened the form instead of the promised channel. These are now fixed in the shared source. The local lightbox has also gained dialog, focus, Escape and scroll-lock behaviour. The duplicate drawer selector and missing selected-state semantics were fixed during the final check.

**UX release verdict: pass.** There is no remaining release-blocking UX defect in the reviewed source. A mocked dinner submission at 390 x 844 produced one visible success alert at `y=86`, kept the drawer open, reset its scroll position to the top and made no real email or management request.

## Evidence limits

- No real enquiry was sent, as requested.
- The API is wired to Microsoft Graph email and the management booking endpoint, and the required local configuration keys are present. Mailbox receipt and the production management record remain unverified.
- No GA4 behaviour, completion-rate, scroll-depth or abandonment data was available, so friction and page-length recommendations are directional.
- Browser checks used `output/playwright/christmas-seo/desktop-top.png`, `mobile-top.png`, `mobile-meal-drawer.png`, live 390 x 844 accessibility snapshots, and a route-intercepted mocked success response after the final shared-source edits.
- Focused regression suites passed: 2 suites, 15 tests.

## Landing Page Assessments

| Page | Search intent match | Above the fold | CTA clarity | Mobile | Trust signals | Overall |
|---|---|---|---|---|---|---|
| `/christmas-parties` | Pass: party and festive-meal intent are distinct | Pass: H1, value statement, both journey CTAs, call and email | Pass: labels explain the next action | Pass: no overflow; full-width 56 px CTAs; scrollable drawer | Partial: parking, capacity, deposit and pre-order terms are strong; testimonial provenance is not stored with the page | Good, with non-blocking tightening work |

## Journey Verification

| Journey | Entry and fields | Delivery path | Verdict |
|---|---|---|---|
| Christmas party | Hero and in-page CTAs open `party`; party style includes shared night, private space, buffet, drinks and entertainment; date, time and guest count are captured | `/api/enquiry/christmas` labels the lead as a Christmas party, sends a normalised record to the management app and uses Graph email only as fallback | Pass in browser with mocked success; real receipt unavailable |
| Christmas lunch | Meal CTA opens `meal` with lunch available; pre-order and £10 per-person non-refundable deposit are shown before personal fields; noon to 2 pm times are available | Email and management notes retain meal, lunch, source and pre-order context | Pass to pre-submit; real receipt unavailable |
| Christmas dinner | The same meal route offers dinner and 5:30 pm to 8 pm times, with the same pre-order terms | Email and management notes retain meal, dinner, source and pre-order context | Pass in browser; mocked success visible, no real enquiry sent |

## Conversion Flow Issues

| Flow | Steps | Friction points | Recommendation | Impact |
|---|---:|---|---|---|
| Hero to party enquiry | 1 open, then form | Fixed: one accessible journey selector; party style and first personal field are visible in the opening mobile drawer | Keep regression coverage | Pass |
| Hero to meal enquiry | 1 open, sitting choice, then form | The pre-order panel adds length but qualifies the lead before details are entered | Keep it; current order is appropriate | Pass |
| Successful submission | Submit at bottom of a long drawer | Fixed: the form is replaced by a compact success state and the drawer returns to the top | Keep mocked browser coverage | Pass |
| Sticky CTA to enquiry | 1 open | Fixed: the mode-free event reopens the current party or meal context, with party as the first-visit default | Keep regression coverage | Pass |
| Phone and email | 1 click | Fixed: final controls now use `tel:` and `mailto:` and retain tracking | Keep regression coverage | High issue resolved |

## User Journey Gaps

- There is no dead end: hero, first booking-choice section, pricing, menu, buffet, urgency, final band and global sticky CTA all provide an action.
- The specialist Christmas route is retained by the global sticky CTA, and the global Christmas campaign lightbox is suppressed on this page.
- The page is very long. The collected live baseline had 4,569 words and 20 FAQ questions; a 1200 px browser run measured about 16,100 px of document height. Multiple CTAs reduce the dead-end risk, but the amount of repeated material can hide the most useful decision content.
- Supporting links are placed after the core booking content, which protects the primary journey.

## Mobile and Overlay Assessment

- Hero CTAs are full-width and at least 56 px high on mobile.
- Call and email sit side by side without overflow.
- The right-side drawer becomes full-width below `sm`, has a fixed header and a scrollable body.
- Drawer z-index 90 is above the global sticky bar at 80. The page lightbox is at 110.
- The page lightbox is now suppressed while the drawer is open, so its 35-second mobile timer and desktop exit intent cannot cover an active enquiry.
- The page lightbox now has `role="dialog"`, `aria-modal`, focus placement, focus trapping, Escape handling, body scroll lock and focus restoration.
- Party/meal and lunch/dinner selected states now expose `aria-pressed`, and only one party/meal selector remains in the main drawer.

## Perceived Speed and Stability

No field or lab Core Web Vitals data was available. In the successful browser render, the page was interaction-ready and no obvious horizontal shift appeared. The hero image, cookie banner, global sticky CTA and timed lightbox should remain in the final short-height visual regression because they are the highest-risk sources of visual or interaction disruption.

## Quick UX Wins

1. Preserve the implemented journey-aware global sticky CTA.
2. Treat both email and mobile as required only if the booking team needs both. Otherwise test one required contact method after analytics is available.
3. Consider a `Send another enquiry` action on the success state for organisers who need to ask about a second format.
4. Do not add more popups or sticky controls to this route.

```json
{"findings":[]}
```
