# Event booking checks, 6 September 2026

Website changes are local only. No live bookings, messages, payments, migrations or deployments were made. The standing-policy database migration and confirmation fixes are prepared in the management repository for explicit approval.

## Findings

Garden/terrace hire does not block outside table reservations. Live Supabase project tfcasgxopxegwrabvwat has no table-area mapping for Outdoor Terrace/Garden. Live create_table_booking_core_v06 and check_table_availability_v06 check outside_reservations capacity but do not check private hire. Both staff and public website use that shared creation path. There was no future garden hire available for an overlapping live availability test. This finding is verified from live definitions and configuration, not a submitted booking.

Standing is supported by create_event_booking_v05 and the management service. Its live function separately reserves standing capacity, stores event_seating_type and skips table allocation. However, it can convert a seated request to standing if the group exceeds remaining seats, including while seats remain. A website pre-check cannot prevent a concurrent last-seat booking. An atomic database change is needed to reject that conversion and require the customer to review the new availability. Confirmation wording in src/services/event-bookings.ts and src/lib/events/event-payments.ts uses seat/seats without the ticket type. No live standing booking was submitted.

## Delivered locally

- About This Event directly follows Event Highlights at mobile and desktop sizes.
- More event details has explicit top margin (21px measured at the mobile base font size).
- No seated/standing radio choice. Standing is offered only with known zero seated capacity and positive standing capacity.
- Single quantity input replaced by existing 1 to 6 buttons and telephone help. Mixed ticket quantities are also limited to six in the form.
- Known insufficient seated quantities disabled, with a clear message. Unknown capacity never advertises standing.
- Related booking copy and free-event reassurance follow the same rule. Existing server fallback result text accurately describes insufficient seats without claiming that every seat sold out.

## Verification

Node 20: full lint, uncached typecheck, 191 test suites with 2,089 passing tests and one skipped in both Europe/London and UTC, production build. Final focused checks repeated after singular/plural copy adjustment.

Browser used the real event page, form and website API in an isolated Next fixture. Management responses and Turnstile were synthetic; all server outbound requests were intercepted, and external sockets blocked. Browser results: six seats confirmed, three standing tickets confirmed, one remaining seat disabled quantities 2 to 6, and injected 503 displayed Booking not completed with telephone fallback. Captured server payloads were seats=6/preference=seated and seats=3/preference=standing. Mobile 414 by 896 and desktop 1440 by 1000 DOM checks confirmed description order; mobile screenshot showed separation around the description and details. Live page was inspected before editing. This does not prove a real standing payment or SMS delivery.

Two focused follow-up passes completed. The first found the free-event reassurance still offering a choice. The second checked the new capacity-change response and corrected recovery and retry-key handling. Both are tested, with no further website issue found in the changed perimeter.

## Files changed

- app/events/[id]/page.tsx
- components/features/EventBooking/ManagementEventBookingForm.tsx
- app/api/event-bookings/route.ts
- tests/api/event-bookings-idempotency.test.ts
- lib/event-booking-copy.ts
- lib/event-booking-experience.ts
- tests/unit/ManagementEventBookingForm.test.tsx
- tests/unit/event-booking-copy.test.ts
- docs/SSOT.md
- tasks/todo.md
- this run directory

Deliberately unchanged by the website work: existing dirty management work, garden mappings, event content records, unrelated website pages and shared components. The separate management standing-policy draft and SMS work are documented in tasks/standing-ticket-policy/.

## Remaining work

Deployment requires owner approval. Garden blocking needs separately authorised backend work. Standing allocation is prepared locally and needs production migration approval. No migration was applied. The separate management draft is 20260906134726_event_standing_after_seated_sold_out.sql. Recommended backend scope: share outside private-hire blocking across availability, create and amendment paths; reject unrequested seating conversions under the event lock; render standing confirmation wording from the stored ticket type. Preserve existing indoor hire status, timing and buffer rules when extending outside blocking.

Browser race fixture also passed: returned zero seated capacity paused the first submission with No booking has been made, retained guest details and showed standing-only tickets. A second explicit click submitted standing and confirmed. Zero browser console errors on this case. Website retry keys now distinguish seated and standing preferences.

Management release packet: /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/tasks/standing-ticket-policy/approval.md. Exact migration SHA-256: fc98f0fd9cb61d202452c98ddd29eb12dbef209ac3000300c69e0c792e9c51c6. Parent independently reran all 28 PostgreSQL assertions successfully. Full management London and UTC suites both passed 6,394 tests, with two skipped.
