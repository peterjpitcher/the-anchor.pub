# Email sign-up growth spec

**Date:** 19 August 2026
**Scope:** How The Anchor grows its guest email list, ranked by measured yield.
**Data source:** live management database (`tfcasgxopxegwrabvwat`), queried 19 August 2026. Every number below is measured, not estimated, unless labelled as a projection.

---

## Decisions recorded, 19 August 2026

All five open questions answered by the owner:

| # | Decision | Effect |
|---|---|---|
| 1 | **Make the booking email field required.** | Lever 2 approved and now **built** |
| 2 | **Newsletter scope is broad**: offers and deals, new menu releases, events, early booking for paid events, discounts | Newsletter consent copy written to this scope, with its own version lineage |
| 3 | **No sign-up incentive.** | No prize draw or free drink. Value proposition is the content itself. |
| 4 | WiFi captive portal capability: **owner checking** | Lever 4 partially blocked pending that answer |
| 5 | **Customer records may exist without a phone number.** | Migration drafted, gated on the function audit, which is now complete |

### Build status

| Lever | Status |
|---|---|
| Lever 2, require email at booking | **Built and verified.** 144 suites / 1,663 tests pass, typecheck and lint clean, confirmed in the browser. |
| Newsletter consent copy and versioning | **Built.** `lib/communication-consent.ts` plus 17 tests. |
| `mobile_number` nullable migration | **Drafted, not applied.** Awaiting explicit go-ahead to run against production. |
| Lever 1, SMS capture route | Not started. Needs the AMS route. |
| Lever 3, website sign-up | Not started. Depends on the migration. |
| Lever 5, confirmation one-tap | Not started. Shares Lever 1's route. |

---

## Verdict

The email channel is the best-performing thing the pub owns, and almost nobody is on it.

Guest campaigns are opening at **41 to 56 per cent**, roughly double the hospitality average. The list they go to is **225 people**. Meanwhile **699 guests who have already booked** have never given an email address, and the website has **no email sign-up form anywhere**, despite the privacy policy already promising one.

The important finding is that the three biggest wins are not on the website:

1. **One SMS to the 466 reachable guests who have no email on file.** One send, no build beyond a small route, potentially +60 addresses.
2. **Stop labelling the booking form's email field "optional".** It is the single largest ongoing leak, worth roughly +50 addresses a month.
3. **Then** build website capture, which is worth perhaps +20 to +40 a month and needs the most work.

Doing 3 before 1 and 2 would be spending the most effort on the smallest lever.

---

## 1. Measured current state

### The list

| Measure | Count | Note |
|---|---:|---|
| Total customer records | 1,090 | |
| Records with an email address | 290 | 26.6 per cent |
| **Eligible for a guest email campaign** | **225** | via `preview_customer_marketing_audience()` |
| Not eligible | 835 | |
| Unsubscribed from email | 30 | |
| On do-not-contact or suppressed | 0 | among customers |
| Explicit `marketing_email_opt_in = true` | 13 | the rest rely on soft opt-in |
| Marketing SMS opt-in | 370 | |

### Where the missing 835 sit

| Segment | Count | What it means |
|---|---:|---|
| **Have booked, but no email address** | **699** | Already have a relationship. Lawful to contact by SMS. The single biggest pool. |
| No email, but SMS-reachable now | 466 | Active SMS status, not opted out, valid E.164 number |
| ...of those, have booked at least once | 423 | Cleanest soft opt-in basis |
| ...of those, booked in the last 12 months | 151 | Warmest sub-segment |
| Have email but no lawful basis to market | 35 | No booking and no explicit opt-in. Need an opt-in to become usable. |

### How well email actually performs

| Campaign | Audience | Sent | Opened | Open rate | Clicked |
|---|---|---:|---:|---:|---:|
| Christmas 2026, local businesses | business | 156 | 85 | 54% | 60 (38%) |
| Lunch from September 2026 | guest | 240 | 135 | **56%** | 17 (7%) |
| The Last Quiz of Summer, 19 Aug | guest | 226 | 92 | **41%** | 9 (4%) |

Three sends, all healthy. Typical UK hospitality open rates sit around 25 to 35 per cent. **The channel is not the problem. The list size is.**

### Email capture rate on new customers, by month

| Month | New customers | Gave email | Rate |
|---|---:|---:|---:|
| Feb 2026 | 82 | 15 | 18% |
| Mar 2026 | 86 | 17 | 20% |
| Apr 2026 | 76 | 25 | 33% |
| May 2026 | 98 | 45 | 46% |
| Jun 2026 | 113 | 36 | 32% |
| Jul 2026 | 123 | 68 | 55% |
| Aug 2026 (partial) | 91 | 42 | 46% |

Running at roughly **110 new customers a month**, of whom **about half** leave an email address. The other half is the ongoing leak, and it leaks because the field says "optional".

### Website traffic reality

- Roughly **2,700 organic clicks a month** (about 8,000 across 90 days per the 17 August GSC audit).
- GA4 sees about a third of that because of consent losses.
- Booking funnel over 90 days: 236 clicked book-a-table, 154 started, 80 completed.
- **No email sign-up exists on any page.** Verified by search across `app/`, `components/` and `lib/`.
- `app/privacy-policy/page.tsx:63` already states the pub collects "Email address when signing up for our newsletter". The policy promises a newsletter that does not exist.

**Traffic-mix caveat that changes the placement decision.** The site's largest impression volumes are Heathrow parking and airport-proximity queries (for example `/heathrow-parking/terminal-5` at 7,238 impressions). Those visitors are travellers, not locals, and their addresses are close to worthless for an events email. Website capture must be weighted towards local-intent pages, not raw traffic.

---

## 2. What the infrastructure already supports

This matters because it determines effort. Most of the machine exists.

| Capability | Status | Evidence |
|---|---|---|
| Guest email campaigns | **Live** | 5 customer campaigns, 622 recipients sent |
| Sending enabled | **On** | `marketing_settings.sends_enabled = true` |
| Frequency cap | 7 days | `frequency_cap_days = 7`, batch 25 |
| Unsubscribe | **Live** | `email_unsubscribe_tokens` plus AMS `/api/unsubscribe` |
| Bounce and complaint suppression | **Live** | `email_suppressions` (32 rows), Resend webhook |
| Do-not-contact list | **Live** | `marketing_do_not_contact` (8 active) |
| Append-only consent ledger | **Live** | `customer_consents`, with `source_url`, `ip_hash`, `user_agent`, `consent_text_version` |
| One-tap guest links from SMS | **Live** | `guest_tokens` with hashed tokens, 10 action types, `/g/[token]/*` routes |
| Click and open tracking | **Live** | `email_messages` (2,006), `email_link_clicks` (766) |

### The eligibility rule, and why it matters

`preview_customer_marketing_audience()` treats a customer as eligible when they have a non-blank email, are not opted out, are not bounced, suppressed or on do-not-contact, **and** one of the following is true:

```
c.marketing_email_opt_in IS TRUE
  OR EXISTS (SELECT 1 FROM bookings WHERE customer_id = c.id)
  OR EXISTS (SELECT 1 FROM table_bookings WHERE customer_id = c.id)
```

**Consequence: a website newsletter sign-up with `marketing_email_opt_in = true` is already eligible to receive campaigns. No change to the send engine is required.** That removes most of the perceived cost of building web capture.

### The one blocking constraint

`customers` requires:

| Column | Nullable | Note |
|---|---|---|
| `first_name` | **NO** | required |
| `last_name` | **NO** | required |
| `mobile_number` | **NO** | **this is the blocker** |
| `email` | YES | optional, unique on `lower(email)` where not null |

A person who wants only to join the mailing list has no phone number to give. Today the database will not accept that record.

Two pieces of evidence say this is a half-finished migration rather than a deliberate rule:

1. `chk_customer_phone_format` already reads `mobile_number IS NULL OR <format matches>`. The check constraint explicitly tolerates NULL. Only the column-level NOT NULL blocks it.
2. `idx_customers_mobile_e164` is a plain unique index, and Postgres treats NULLs as distinct, so multiple phone-less rows are fine.

**Risk assessment of dropping NOT NULL.** 108 files in AMS reference `mobile_number` and 33 migrations mention it, which sounds alarming. The measured reality is better:

- The five SMS-critical database functions are **already NULL-guarded**: `get_bulk_sms_recipients`, `get_bookings_needing_reminders`, `voucher_reminders_claim_due`, `register_guest_transaction`, `import_customers_atomic`.
- The remaining "REVIEW" hits (`create_employee_transaction`, `replace_employee_emergency_contacts`, `restore_employee_version`) are on the **employees** table, not customers.
- UI reads sampled are already defensive: `customer.mobile_number || '--'`, `|| 'No mobile number'`, and explicit `if (!customer.mobile_number)` guards.

### Function audit result, completed 19 August 2026

The three functions flagged for review were read in full. **All three are safe.**

| Function | Reads `mobile_number` unguarded? | Verdict |
|---|---|---|
| `get_category_regulars` | Yes, returns it directly | **Safe.** INNER JOINs `customer_category_stats`, which only has rows for a customer who has attended an event. A newsletter-only subscriber has no such row and is unreachable. |
| `get_cross_category_suggestions` | Yes, returns it directly | **Safe.** Same join, same reasoning. |
| `prevent_duplicate_reminders` | Resolves it into `NEW.target_phone` | **Safe in practice.** A trigger on `booking_reminders`, which requires an event booking, which requires a phone. Worth noting that if a phone-less customer ever did get a reminder row, `target_phone` would be null and the duplicate check would silently pass, because `NULL = NULL` is unknown rather than true. |

**Verdict: the migration is safe to apply.** Drafted at `OJ-AnchorManagementTools/supabase/migrations/20260819090000_customers_optional_mobile.sql`. Not yet applied.

### The trap the audit uncovered

**`customers.sms_opt_in` defaults to `true`.**

An email-only record inserted without setting it explicitly would claim SMS marketing consent it was never given, and would sit in the SMS-eligible pool with no number to send to. Any code path creating a phone-less customer **must** explicitly set:

```
sms_opt_in           = false
marketing_sms_opt_in = false
sms_status           = 'active'   -- the CHECK forbids null; inert with no number
```

The migration adds a partial index, `idx_customers_phoneless_sms_claim`, purely so a drift check can find any record where a create path forgot this. It should always return zero rows.

**Rejected alternative: a separate `email_subscribers` table.** It avoids touching `customers`, but it creates a second list to reconcile, needs a third `audience_type` in the campaign engine, duplicates the unsubscribe and suppression logic, and splits a person into two records the moment they book. The cost lands every week thereafter instead of once.

---

## 3. The levers, ranked by yield per unit of effort

### Lever 1: text the guests who have no email on file

**Size: 423 people with a clean basis (466 technically reachable). Projected +40 to +110 addresses, most likely around 60, from a single send.** That is a 25 per cent list increase in one afternoon.

This is first because the audience already exists, the send costs pennies per message, and the technical work is small.

**Mechanism.** Reuse `guest_tokens`, which already powers tap-to-confirm bookings, payment links and Sunday pre-orders.

1. Add `'email_capture'` to the `guest_tokens_action_type_check` constraint.
2. New AMS route `/g/[token]/email-capture` plus its `action` handler. One field, the email address, pre-populated with nothing, with the guest's first name shown so the page reads as personal.
3. On submit: write `customers.email`, set `marketing_email_opt_in = true` and `marketing_email_opt_in_at = now()`, append a `customer_consents` row with `capture_method = 'sms_one_tap'`, and consume the token.
4. Handle the collision case: if the address already belongs to another customer record, the unique index on `lower(email)` will reject it. Show a plain message and flag for staff merge rather than failing silently.
5. Send as a one-off SMS batch to the 423 segment, not to all 466, so every recipient has a booking behind them.

**Lawful basis.** PECR soft opt-in. These are existing customers, the pub is marketing its own similar services, and the refusal route (`NOEVENTS`, honoured by `marketing_sms_opted_out_at`) already works. The message must name the refusal route.

**Draft copy**, within the 160-character single-segment limit and consistent with `GUEST_MARKETING_SMS_LABEL`:

> The Anchor: we've only got your number, not your email. Add it here and we'll email you when quiz nights and bingo are coming up: [link] Reply NOEVENTS to stop.

**Sequencing note.** Send once, then leave it. Do not re-send to non-responders more than once, and if you do, wait at least a month. A second chase to the same list is where a warm SMS list starts generating complaints.

---

### Lever 2: stop labelling the booking email field "optional"

**Size: roughly 110 new customers a month at about 46 per cent capture. Going to near-100 per cent is worth about +50 addresses a month, or +600 a year.** This is the largest ongoing lever and the cheapest code change in the list.

**Current state, verified:**

- `components/features/TableBooking/ManagementTableBookingForm.tsx:3077` and `:3307` both render `label="Email (optional)"` with `hint="So we can email your confirmation."`
- `components/features/EventBooking/ManagementEventBookingForm.tsx:1044` renders `label="Email address (optional)"`, and validation at `:385` accepts a blank value.

The hint already states a genuine service reason for collecting it. The label then tells the guest not to bother. That is the whole defect.

**The change, as built:**

1. Relabelled to `Email address` with no "(optional)" suffix, on both forms, with `required` passed through to the DOM as a native backstop. This matches the convention the neighbouring `First Name` field already uses.
2. Hint now reads "So we can send your confirmation and tell you about any changes." on the table form, and "So we can send your confirmation and any payment follow-up." on the event form.
3. New refusal code `email_missing` in `lib/table-booking/journey.ts`, placed after `name_missing` so refusals follow reading order down the form. Message: "Please enter your email address so we can send your confirmation." The reason is in the message deliberately, because a required field with no stated reason reads as data harvesting, which is exactly when a guest abandons.
4. `GUEST_TABLE_COMPACT_CONSENT_NOTICE` left unchanged beneath it. It already covers email, names the unsubscribe route, and reassures that confirmations continue regardless. That reassurance is what stops a required email field costing conversions.
5. **Known customers are exempt.** They never see the box, because the management app already holds their address and the form deliberately submits nothing for them (`ManagementTableBookingForm.tsx:1769`). Demanding one would block a returning guest over an off-screen field.
6. The "blank email is omitted from the payload" assertions in two test suites were inverted, because that behaviour is no longer reachable from the form.

**Files changed:**

| File | Change |
|---|---|
| `lib/table-booking/journey.ts` | New `email_missing` refusal, known-customer exemption |
| `components/features/TableBooking/ManagementTableBookingForm.tsx` | Both render sites relabelled and required |
| `components/features/EventBooking/ManagementEventBookingForm.tsx` | Label and validation |
| `lib/table-booking/__tests__/details-step-email.test.ts` | Rewritten for required behaviour |
| `tests/unit/ManagementTableBookingForm.test.tsx` | 29 flows given an email, 1 assertion inverted |
| `tests/unit/ManagementTableBookingForm.twoScreen.test.tsx` | Shared helper updated |
| `tests/unit/ManagementEventBookingForm.test.tsx` | 6 flows given an email, 1 assertion inverted |

**Verification:** 144 suites / 1,663 tests pass. `tsc --noEmit` clean. Lint clean. Confirmed live in the browser: the field renders as "Email address" with `required=true` and the new hint, and submitting without one produces "Booking not completed. Please enter your email address so we can send your confirmation." Network log confirms only GET requests fired, so no test booking was created against the live management API.

**Conversion risk, stated honestly.** Requiring a field can cost bookings. Two mitigations already apply: the reason is real rather than marketing, and requiring email is standard in this category (OpenTable, ResDiary and SevenRooms all do it). The GA4 funnel gives a baseline to watch: 154 started, 80 completed. If completion drops more than about 5 percentage points over four weeks, revert to optional and fall back to Lever 5 instead.

---

### Lever 3: website sign-up, which does not currently exist

**Projected +20 to +40 a month once placed well.** Smaller than levers 1 and 2, but it compounds and it is the only lever that reaches people who have never visited.

**Placement, weighted by intent rather than by traffic.** This is the part most likely to be got wrong.

| Surface | Priority | Reason |
|---|---|---|
| Inline block on `/whats-on`, `/quiz-night`, `/music-bingo`, `/cash-bingo` | **P0** | Highest intent match. Traffic is small (all four game pages earned 124 clicks in 16 months) but the fit is exact. |
| Inline block at the foot of blog posts | **P0** | Local-intent readers, and it gives the restarted content engine a conversion job to do. |
| Inline block on `/food-menu`, `/sunday-roast`, `/whats-on` | **P1** | Local eating intent |
| Town pages (`/staines-pub`, `/feltham-pub` and the other 15) | **P1** | Genuinely differentiated local pages per the growth spec, so genuinely local readers |
| Footer, site-wide | **P2** | Converts poorly on its own (0.1 to 0.5 per cent) but costs nothing and catches intent from anywhere |
| Heathrow parking and terminal pages | **Do not** | Travellers, not locals. Their addresses will not open an events email and will drag the open rate down. |

Do **not** add an exit-intent or scroll-triggered pop-up for this. `components/conversion/ExitIntentBookingModal.tsx` and `ScrollProgressBookingTooltip.tsx` already compete for that attention on behalf of bookings, which are worth more than an email address. Stacking a second interruption would cannibalise the more valuable conversion.

**Build:**

1. New component `components/features/EmailSignup/EmailSignupForm.tsx`, a client component. Fields: email address (required), first name (required by the schema, so ask for it), last name (required by the schema).
   - Asking for two name fields to join a mailing list is friction. Recommended compromise: one "Your name" field, split on the first space, with the remainder as last name and a single-word entry stored with last name as a full stop placeholder. Flag this in the record via `customer_consents.metadata` so staff know the name was derived.
2. New route `app/api/email-signup/route.ts`, following the existing proxy pattern. Never call the management API from the client.
3. Turnstile on the endpoint, using `verifyTurnstileToken` from `lib/turnstile.ts` and `components/security/TurnstileField.tsx`, exactly as `app/api/careers/route.ts` does. **Note the known split-brain trap: the site and AMS hold different Turnstile widgets, so verify the token in the website route and never forward it to AMS.**
4. Per-IP rate limiting, copying the pattern in `app/api/customers/lookup/route.ts` (6 per minute per IP is the existing precedent; use something similar).
5. New AMS endpoint to accept the sign-up, which upserts on `lower(email)`, sets `marketing_email_opt_in = true`, and appends a `customer_consents` row with `capture_method = 'web_form'`, `source = 'website'`, plus `source_url`, `ip_hash` and `user_agent`.
6. Add a GTM event via `lib/gtm-events.ts`, named consistently with the existing helpers, so sign-ups are measurable.
7. Add the new page to `app/sitemap.ts` if a standalone sign-up page is created. A standalone page is worth having purely so the SMS, QR and WiFi routes have somewhere to point.

**Consent model recommendation: single opt-in plus an immediate welcome email.** UK GDPR and PECR do not require double opt-in, and the ICO does not mandate it. Double opt-in typically loses 20 to 30 per cent of sign-ups, which this list cannot afford at its current size. The welcome email proves the address is real and warms deliverability. Revisit if bounces exceed 2 per cent of sends.

---

### Lever 4: capture in the pub, where intent is highest

The people standing in the building are the best audience and currently the least asked.

| Route | Effort | Note |
|---|---|---|
| **Quiz and bingo team sheets** | Lowest | The quiz already collects team names. Adding an email line costs a reprint. These are the most engaged guests in the building. |
| **QR code on tables and menus** | Low | Points at the standalone sign-up page. Needs a print run and a short, memorable URL. |
| **WiFi captive portal** | Unknown | Free WiFi runs throughout the pub and beer garden (SSOT §amenities), so the audience is large and captive. Whether the hardware supports an email-gated portal is not something I can determine from here. If it does, this is the highest-volume in-venue route by a wide margin. |

For any in-venue route the consent record needs `capture_method` set accordingly (`paper_form`, `qr_code`, `wifi_portal`) so the ledger stays honest about how the address was obtained.

---

### Lever 5: convert soft opt-in into explicit consent on the confirmation email

**Size: about 105 people a month, rising if Lever 2 lands.**

Everyone who gives an email at booking currently sits on soft opt-in. That is lawful, but explicit consent is more durable, survives any question about how fresh the relationship is, and produces a measurably more engaged list.

**Mechanism.** Add a single one-tap line to the booking confirmation email footer, using the same `guest_tokens` `email_capture` action as Lever 1 (or a sibling `email_optin` action), so the guest confirms in one tap with no form. Wording should reuse `GUEST_MARKETING_EMAIL_LABEL` verbatim so the stored `consent_text_version` continues to point at words the guest actually read.

This is also the fallback if Lever 2 has to be reverted on conversion grounds.

---

## 4. Copy rules for anything customer-facing

Read `docs/SSOT.md` before writing a word of this. Specific traps for email copy:

**Newsletter scope, owner-confirmed 19 August 2026:** offers and deals, new menu releases, events, early booking opportunities for paid events, discounts.

This is deliberately **broader than the booking-time label**, and that is legally coherent rather than sloppy. The booking-time notice is soft opt-in, so its reach is limited to "our own similar services" and its wording is narrow on purpose. The newsletter is explicit consent, freely given by someone who came looking for it, so it may carry the full scope.

**As built** in `lib/communication-consent.ts`:

- `GUEST_NEWSLETTER_CONSENT_TEXT_VERSION = 'guest-newsletter-consent-v1'`, a **separate version lineage** from `GUEST_COMMS_CONSENT_TEXT_VERSION`. Editing newsletter wording must never reassign booking consents already stored, and vice versa.
- `GUEST_NEWSLETTER_LABEL`: "Email me what's on at The Anchor: quiz nights and bingo, new menus, offers, and first chance to book."
- `GUEST_NEWSLETTER_SCOPE_NOTICE`: states the scope in sentence form, names the unsubscribe route, and confirms the address is not passed on.

Kept concrete rather than generic for the same measured reason the booking label was: the old generic "events and offers" wording was ticked by 1 of 71 guests. 17 tests in `tests/unit/newsletter-consent.test.ts` pin the scope, the separate lineage, and the exclusions below.

**Safe to promise**, because all are verified in the SSOT:
- Quiz nights, music bingo and cash bingo. These are the three formats already named in `GUEST_MARKETING_EMAIL_LABEL`.
- Sunday roast, walk-ins welcome 1pm to 6pm.
- Monthly Manager's Special (SSOT §promotions, sourced live).
- Free parking, free WiFi, beer garden under the flight path, dog friendly.

**Do not promise:**
- **Karaoke or DJ nights.** Deliberately excluded from the consent labels because both are occasional and only promotable where a specific event record lists them. A standing newsletter label cannot guarantee them.
- **Live music.** Discontinued in full. This is why the booking consent text is at v3.
- **A send frequency** ("weekly", "monthly"). Nothing in the SSOT supports a cadence commitment, and breaking one is what drives unsubscribes. The notice says "when there is something worth knowing" instead.
- **Any incentive** (free drink, prize draw). **Owner decision 19 August 2026: no incentive.** The value proposition is the content itself. This also avoids attracting sign-ups who want the freebie rather than the pub.
- Anything in SSOT §14, the banned claims list.

**Consent text versioning.** If the wording of any opt-in changes, bump `GUEST_COMMS_CONSENT_TEXT_VERSION` in `lib/communication-consent.ts`. The version is the record of what a guest was shown, so it must move whenever the words move. Adding a web form label means adding a new sibling constant rather than editing `GUEST_MARKETING_EMAIL_LABEL`, because editing it would rewrite history for consents already stored against v3.

**SSOT update required.** The newsletter itself is currently not in `docs/SSOT.md`. Once the owner confirms scope and wording, add it, then run `npx jest tests/ssot-drift-guard.test.ts`.

---

## 5. Measurement

Baseline as at 19 August 2026, to measure against:

| Metric | Baseline |
|---|---:|
| Eligible guest email audience | 225 |
| Customers with an email address | 290 of 1,090 (26.6%) |
| New-customer email capture rate | ~46% |
| Guest campaign open rate | 41 to 56% |
| Guest campaign click rate | 4 to 7% |
| Booking completion (GA4, 90 days) | 80 of 154 started |

Targets worth holding the work to:

- Eligible audience above **500** within 90 days of levers 1 and 2 landing.
- New-customer email capture above **90 per cent** within one month of Lever 2.
- Open rate staying **above 40 per cent** as the list grows. If it falls below 35, the acquisition source mix has gone wrong, most likely by capturing airport-parking traffic.
- Unsubscribe rate per send **below 0.5 per cent**.
- Booking completion not dropping more than **5 percentage points** after Lever 2.

Track sign-up source properly. `customer_consents.capture_method` and `source_url` already exist for this, so every route should populate them and the answer to "which surface actually works" becomes a query rather than a guess.

---

## 6. What not to do

- **Do not buy or import a list.** `marketing_do_not_contact` and `email_suppressions` exist because deliverability has been earned. A bought list would burn the sending domain and the 56 per cent open rate with it.
- **Do not capture on the Heathrow parking pages.** Highest impressions, worst fit. Those addresses will not open an events email.
- **Do not add a pop-up for email.** Two booking-focused interruptions already exist. Bookings are worth more than addresses.
- **Do not build a separate subscribers table** unless the NOT NULL review turns up something genuinely blocking.
- **Do not promise a send frequency** you have not agreed to keep.
- **Do not send the SMS ask more than twice**, and not within a month of the first.
- **Do not deploy any of this unasked.** Per standing instruction, changes are reviewed locally first.

---

## 7. Suggested sequence

| Order | Lever | Effort | Projected gain | Gate |
|---|---|---|---|---|
| 1 | Lever 2, relabel and require booking email | XS | +50/month | None. Ship first, it is the cheapest. |
| 2 | Lever 1, SMS the 423 | S | +40 to +110, one-off | Needs the `guest_tokens` action type and route |
| 3 | Lever 5, confirmation email one-tap | S | ~105/month upgraded to explicit | Shares Lever 1's route |
| 4 | NOT NULL review and migration | S | Unblocks Lever 3 | Review 3 functions plus SMS dispatch paths |
| 5 | Lever 3, website sign-up | M | +20 to +40/month | Depends on step 4 |
| 6 | Lever 4, in-venue | XS to L | Unknown, potentially largest | WiFi portal capability unknown |

Levers 1 and 2 together are projected to take the eligible audience from **225 to roughly 400 within 60 days**, before the website work starts.

---

## 8. Complexity and risk

| Item | Complexity | Migration risk |
|---|---|---|
| Lever 2, relabel and require | 1 (XS) | None |
| Lever 1, SMS capture route | 2 (S) | Low. Additive CHECK constraint change. |
| Lever 5, confirmation one-tap | 2 (S) | None |
| NOT NULL drop on `mobile_number` | 3 (M) | **Medium.** Reversible, but 3 functions and the SMS dispatch paths need auditing first. |
| Lever 3, website sign-up | 3 (M) | Low. New endpoint, no schema change beyond the above. |

Cross-repo: levers 1, 3 and 5 need matching work in `OJ-AnchorManagementTools`. Lever 2 is website-only.
