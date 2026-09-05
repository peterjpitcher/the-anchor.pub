# Nations Championship operating checklist

## Existing hours are authoritative

Never change opening, closing or kitchen hours for this tournament. Review the effective date-specific read-out from management. Unknown hours block screening promises. A confirmed game starting before opening is shown from opening, with a clear missed-start warning and a table-booking action.

## Before confirming each screening

1. Check the official fixture date, UK kick-off and opponents. Keep finals placeholders until teams are known.
2. Check the actual available terrestrial channel and record when it was checked. Streaming-only availability does not confirm a pub screening.
3. Record the assigned screen, commentary decision and an approved planned end time. Resolve simultaneous screen/audio conflicts.
4. Read the existing venue/kitchen hours. Confirm the screening only when it fits the venue's current hours. Do not extend closing time.
5. Review the resulting opening warning and food message. Split, partial and pre-match kitchen service must remain qualified with actual times.
6. Open the website fixture anchor, follow its booking button and confirm that available arrival times and food information match.

## Social content

Use the approved fixture anchor. Every eligible food promotion must include the actual service-time qualification and food invitation. Unknown or closed kitchens get no food claim. Review feed copy and story artwork, including footer text.

Changes to fixture, channel, screen, planned end, tournament template or hours require fresh content review. Both delivery paths must recheck immediately before contacting the provider. A request already in flight may finish after an edit; inspect the published item manually and do not assume it was recalled.

Do not restore a blocked post to a publishable state without regenerating/reviewing current facts. Do not automatically delete already-published content.

## Booking and measurement

The primary outcomes are completed table bookings and booked covers per fixture. A booking-button click is not a completed booking. Staff see fixture identity in the booking notes. Availability and group deposits follow the existing management rules.

Use existing consent-aware booking completion events with the verified fixture ID. Register only necessary non-personal GA4 dimensions. Never send booking notes, phone numbers or email addresses to analytics. Query-level booking attribution is not guaranteed.

## Launch dependencies

- Apply only the exact reviewed/approved Cheers migration SQL to the verified Cheers production project.
- Deploy strict management hours and read-only booking replay first, both guarded publisher paths next, then Cheers editor/feed and the website.
- Create the rugby tournament and import the approved CSV. Keep unsupported screenings unconfirmed.
- Configure the tournament-scoped `CHEERSAI_NATIONS_FEED_API_KEY` on the website. Preserve `CHEERSAI_FEED_API_KEY` for existing football content.
- Verify live hours/feed/page/availability reads and deployment IDs. Run production mutations only with a separately approved designated test and cleanup plan.

## Rollback

Disable new rugby promotion and pause its queued jobs before rolling back application code. Retain additive fixture columns/data. Do not expose rugby jobs to an old unguarded publisher. Keep the website in its honest unavailable state if the new feed cannot be served. Leave existing opening and kitchen records untouched.
