# Structural Map: Book Table Form

## 1. File Inventory

### Tier 1 — Critical Path

| File | Concern | Key exports / entry points |
|------|---------|---------------------------|
| `components/features/TableBooking/ManagementTableBookingForm.tsx` | UI + business logic | `ManagementTableBookingForm` — 2319-line client component, 4-step wizard (find/choose/details/review) |
| `app/book-table/page.tsx` | Routing / server component | Default export `BookPage` — parses search params into prefill, renders hero + form + sidebar |
| `app/api/table-bookings/route.ts` | BFF proxy — booking creation | `POST` — normalises payload, validates, enforces service windows + cutoffs, proxies to management API |
| `app/api/table-bookings/availability/route.ts` | BFF proxy — availability | `GET` — builds fallback availability from business hours + service windows, returns time slots |
| `app/api/table-bookings/menu/sunday-lunch/route.ts` | BFF proxy — Sunday menu | `GET` — fetches Sunday lunch menu via `anchorAPI`, 1-minute in-memory cache |
| `app/api/table-bookings/paypal/create-order/route.ts` | BFF proxy — PayPal create | `POST` — validates UUID bookingId, proxies to management API PayPal endpoint |
| `app/api/table-bookings/paypal/capture-order/route.ts` | BFF proxy — PayPal capture | `POST` — validates bookingId + orderId, proxies to management API capture endpoint |
| `app/api/customers/lookup/route.ts` | BFF proxy — phone lookup | `GET` — proxies phone lookup to management API, degrades gracefully on 5xx/auth errors |
| `app/api/events/route.ts` | BFF proxy — event listing | `GET` — fetches events, filters past events, used for date-based event suggestions |
| `components/features/TableBooking/PayPalDepositSection.tsx` | UI — PayPal buttons | `PayPalDepositSection` — renders PayPal buttons, captures order on approval |
| `lib/api/client.ts` | API client | `AnchorAPI` class + `anchorAPI` singleton — all management API calls |
| `lib/api/bookings.ts` | Types | `TableBookingRequest`, `TableBookingResponse`, `TableAvailabilityResponse` |
| `lib/table-booking-service-windows.ts` | Business logic | `resolveServiceRanges`, `buildSlotsFromRanges`, `isTimeWithinRanges` — service window enforcement |
| `lib/sunday-lunch-cutoff.ts` | Business logic | `hasSundayLunchCutoffPassed`, `getSundayLunchCutoffDate` — Saturday 1pm cutoff |
| `lib/mothers-day-booking.ts` | Business logic | `isMothersDayEvent`, `buildMothersDayBookingUrl` — Mother's Day mode |
| `lib/constants.ts` | Config | `CONTACT`, `SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP` (10), `getSundayLunchDepositAmount` |
| `lib/management-api-base.ts` | Config | `getManagementApiBaseUrl` — resolves `ANCHOR_API_BASE_URL` env var |
| `components/ui/primitives/Input.tsx` | UI primitive | `Input`, `Textarea` — shared form controls |

### Tier 2 — Supporting

| File | Concern | Notes |
|------|---------|-------|
| `components/features/TableBooking/BookTableUpcomingEventsPanel.tsx` | UI — sidebar | Server component, fetches upcoming events, renders links |
| `components/features/EventBooking/ManagementEventBookingForm.tsx` | UI — event booking | Embedded when user selects a suggested event from table booking flow |
| `lib/gtm-events.ts` | Analytics | `trackTableBookingClick` — GTM event dispatch with PII redaction |
| `lib/api/index.ts` | Barrel export | Re-exports from `shared`, `private-bookings`, `events`, `menu`, `hours`, `bookings`, `parking`, `client` |
| `app/api/booking/submit/route.ts` | Legacy BFF — booking | Legacy wizard submission path — maps camelCase to snake_case, enforces service windows, proxies to `anchorAPI.createTableBooking` |
| `app/api/booking/agent/route.ts` | AI agent API | POST creates booking, GET checks availability — natural language date parsing, structured JSON responses |
| `app/api/booking/payment-return/route.ts` | Redirect handler | GET — checks PayerID query param, redirects to /book-table |
| `app/api/table-bookings/[reference]/route.ts` | BFF — booking lookup/cancel | GET retrieves booking by reference+email, DELETE cancels booking |
| `app/api/table-bookings/create/route.ts` | Alias | Re-exports POST from `../route.ts` |
| `app/booking-confirmation/page.tsx` | Redirect | Redirects to `/book-table` |

### Tier 3 — Legacy/Peripheral

| File | Concern | Notes |
|------|---------|-------|
| `components/features/TableBooking/TableBookingForm.tsx` | Old form | Used by `page-old.tsx`, not active |
| `components/features/TableBooking/SundayLunchBookingForm.tsx` | Old form | Legacy Sunday lunch form |
| `app/book-table/page-old.tsx` | Old page | Not active, uses old form |

### Flags

- **God component**: `ManagementTableBookingForm.tsx` at 2319 lines handles UI rendering, state management, API calls, validation, and payment flow — does too many things.
- **Duplicated concern**: `app/api/booking/submit/route.ts` (legacy) and `app/api/table-bookings/route.ts` (new) both create bookings. The form uses the new route; the legacy route is used by the old form path.
- **Duplicated types**: `ManagementTableBookingResult` is defined in both `ManagementTableBookingForm.tsx` and `lib/api/client.ts` with slightly different shapes.
- **Orphaned route**: `app/api/table-bookings/create/route.ts` simply re-exports from `../route.ts` — exists solely as an alias.

---

## 2. Flow Map

### Flow 1: Complete Booking (Happy Path — Regular)

```
Step 1: FIND TABLE
  1. User enters party size, date, time, purpose (food/drinks)
  2. On date change → handleDateChange() validates not-past, clears drinks alternative
  3. On date change → useEffect fetches events for that date via GET /api/events
  4. User clicks "Find a table" → handleFindTable()
     4a. Validates date not in past (client-side)
     4b. Aborts any in-flight availability request
     4c. Calls runAvailabilitySearch()
        4c-i.   Fires GTM tracking event
        4c-ii.  Calls fetchAvailabilityForDate() → GET /api/table-bookings/availability?date=X&party_size=X&time=X&purpose=X
        4c-iii. API route: resolves service windows from businessHours, builds fallback slots, returns time_slots[]
        4c-iv.  Response normalized via normalizeAvailabilityResponse()
        4c-v.   pickClosestSlot() pre-selects closest available slot
        4c-vi.  Sets step → 'choose'
     4d. If no slots: loads alternatives for next 3 days + checks drinks availability

Step 2: CHOOSE TIME
  5. Available slots rendered as clickable grid
  6. User taps a slot → handleSlotSelect() updates selectedTime
  7. If no slots: shows alternatives (next 3 days), drinks fallback, event suggestions, waitlist CTA
  8. User clicks "Continue" → step → 'details'

Step 3: GUEST DETAILS
  9. User enters mobile number
  10. User clicks "Continue" → handlePhoneLookup()
      10a. GET /api/customers/lookup?phone=X&default_country_code=44
      10b. API route proxies to management API: GET {BASE}/customers/lookup?phone=X
      10c. If known customer → pre-fills first_name, last_name, email, skips name fields
      10d. If unknown → shows name/email inputs
      10e. If API fails → degrades to unknown (user enters details manually)
  11. If Sunday + food + not drinks → shows "Sunday plans" toggle
      11a. If Sunday lunch selected → useEffect loads menu via GET /api/table-bookings/menu/sunday-lunch?date=X
      11b. User selects main course for each guest from dropdown
  12. User enters optional notes
  13. User clicks "Continue to review" → handleContinueToReview()
      13a. validateDetailsStep() checks: selectedTime, phone, detailsUnlocked, name fields, Sunday menu selections
      13b. Step → 'review'

Step 4: REVIEW & CONFIRM
  14. Summary displayed (party size, date, time, purpose, mobile, name, deposit amount)
  15. User accepts policy checkbox
  16. User clicks "Confirm booking" → handleConfirmBooking()
      16a. Re-validates details step
      16b. Re-validates policy accepted
      16c. Builds Sunday menu selections if applicable
      16d. Generates client-side idempotency key
      16e. POST /api/table-bookings with payload:
           { phone, first_name, last_name, email, date, time, party_size, purpose, notes, sunday_lunch, menu_selections }
           Headers: Content-Type: application/json, Idempotency-Key: tbl_web_<uuid>
      16f. API route:
           - Normalises payload (new shape vs legacy shape)
           - Validates (date format, time format, party_size 1-20, phone 7+ digits)
           - Enforces Sunday-only rule for sunday_lunch
           - Enforces Saturday 1pm cutoff
           - Resolves service windows from business hours
           - Checks time within service ranges
           - Proxies to management API: POST {BASE}/table-bookings with X-API-Key header
           - Passes through Idempotency-Key header
      16g. Response states:
           - 'confirmed' → shows success card with reference + "When you arrive" instructions
           - 'pending_payment' → triggers PayPal flow (see Flow 5)
           - 'blocked' → shows blocked_reason copy, returns to 'choose' step
```

### Flow 2: Customer Phone Lookup

```
1. User enters phone in step 3
2. Clicks "Continue" → handlePhoneLookup()
3. Sets lookupState → 'loading'
4. GET /api/customers/lookup?phone=X&default_country_code=44
5. BFF proxies to management API with X-API-Key header
6. Decision tree:
   - 200 + known=true → lookupState='known', pre-fill name/email from customer record
   - 200 + known=false → lookupState='unknown', show manual entry fields
   - 5xx/401/403/404/429 → degrades gracefully: lookupState='unknown' + lookupDegraded=true
   - Network error → degrades gracefully
   - 400 (short phone) → returns error message
7. "Use Different Number" button → resetPhoneLookup() clears all lookup state
```

### Flow 3: Availability Check + Alternatives

```
1. handleFindTable() → runAvailabilitySearch()
2. GET /api/table-bookings/availability?date=X&party_size=X&time=X&purpose=X
3. BFF route:
   a. Fetches business hours via anchorAPI.getBusinessHours()
   b. Calls resolveServiceRanges(hours, date, { bookingType, purpose })
      - Checks special hours overrides first
      - Then regular hours for day of week
      - For sunday_lunch: looks for sunday_lunch schedule_config entries
      - For food: looks for food entries, falls back to kitchen hours
      - For drinks: looks for drinks/regular entries, falls back to venue hours
   c. Calls buildSlotsFromRanges() → generates 30-min slots within service ranges
   d. On Sundays with food purpose: also checks sunday_lunch availability → sunday_lunch_available flag
4. Client receives time_slots[], picks closest slot
5. If no available slots:
   a. loadNearestAlternatives() → checks next 3 days, collects up to 6 alternative slots
   b. If original purpose was food → auto-checks drinks availability for same date
6. Client displays: available slots grid, drinks fallback, alternatives, waitlist CTA
```

### Flow 4: Sunday Lunch Pre-Order

```
1. Selected date is Sunday + purpose is food
2. useEffect auto-sets sundayLunch=true (unless manually overridden or cutoff passed)
3. On step='details' + sundayLunch=true + detailsUnlocked:
   a. useEffect loads menu → GET /api/table-bookings/menu/sunday-lunch?date=X
   b. BFF calls anchorAPI.getSundayLunchMenu(), caches 1 minute
   c. Response normalized via normalizeSundayLunchMenu() → filters unavailable items, extracts id/name/price
4. Guest orders array sized to partySize via useEffect
5. User selects main for each guest from dropdown
6. On submit: buildSundayMenuSelections() validates all guests have selections
7. Selections sent as menu_selections[] in booking payload
8. Cutoff enforcement:
   a. Client: hasSundayLunchCutoffPassed() checked every 30 seconds (timer useEffect)
   b. BFF: hasSundayLunchCutoffPassed() server-side check on POST
   c. Both use Saturday 1pm London time cutoff
```

### Flow 5: PayPal Deposit Payment

```
Trigger: handleConfirmBooking() response has state='pending_payment'
1. useEffect detects result.state='pending_payment' + result.booking_id
2. Stores bookingIdForPayment, depositAmountForPayment
3. POST /api/table-bookings/paypal/create-order { bookingId: <uuid> }
   a. BFF validates bookingId is UUID (Zod)
   b. Proxies to management API: POST {BASE}/external/table-bookings/{id}/paypal/create-order
   c. Uses Bearer token auth (not X-API-Key)
4. On success: sets paypalOrderId
5. Renders PayPalDepositSection component:
   a. PayPalScriptProvider wraps PayPalButtons
   b. createOrder callback returns orderId (no server call — order already created)
   c. onApprove → handleApprove():
      POST /api/table-bookings/paypal/capture-order { bookingId, orderId }
      BFF proxies to management API: POST {BASE}/external/table-bookings/{id}/paypal/capture-order
   d. On success → paymentState='confirmed' → shows success alert
   e. On error → shows error, allows retry or new booking
6. Hold expiry displayed if present in result
```

### Flow 6: Mother's Day Mode

```
Trigger: prefill.mothersDay=true OR (date=MOTHERS_DAY_SERVICE_DATE + purpose=food)
1. Date locked to MOTHERS_DAY_SERVICE_DATE ('2026-03-15')
2. Purpose locked to 'food'
3. sundayLunch forced to true
4. Default time: '12:30', default party size: 4
5. Cutoff: Saturday 1pm before Mother's Day
6. If cutoff passed: shows warning, disables Sunday lunch, allows weekday menu booking
7. Otherwise: follows normal Sunday lunch flow with forced parameters
```

### Flow 7: Event Suggestion → Event Booking Redirect

```
1. On date change: useEffect fetches events via GET /api/events?from_date=X&limit=36&available_only=true
2. Events normalized via normalizeSuggestedEvents(): filters by date, excludes cancelled, excludes Mother's Day
3. Displayed in find step and choose step
4. User clicks "Book this event" → handleBookSuggestedEvent()
   a. Dismisses event suggestions for that date
   b. Sets selectedSuggestedEvent
5. Component renders ManagementEventBookingForm instead of table booking form
6. "Back to table booking" clears selectedSuggestedEvent
```

### Flow 8: Legacy Wizard Submission (app/api/booking/submit)

```
1. POST /api/booking/submit
2. Accepts both JSON (Content-Type: application/json) and form data (application/x-www-form-urlencoded)
3. Maps camelCase fields to booking request
4. Validates required fields: date, time, firstName, lastName, phone
5. Determines bookingType from menu selections
6. Enforces service windows via business hours check
7. Proxies to anchorAPI.createTableBooking()
8. Handles payment_required response → returns payment_details
9. Non-JS fallback: redirects to /book-table
```

---

## 3. Data Model Map

### Client-Side State (ManagementTableBookingForm)

**~43 useState hooks grouped by domain:**

| Domain | State variables |
|--------|----------------|
| Wizard | `step`, `now` (timer) |
| Search params | `partySize`, `date`, `requestedTime`, `selectedTime`, `purpose` |
| Availability | `availability`, `availabilityLoading`, `availabilityError`, `dateError`, `alternativeSlots`, `alternativesLoading`, `drinksAlternative` |
| Events | `eventsByDate`, `eventErrorsByDate`, `eventsLoadingDate`, `dismissedEventDates`, `selectedSuggestedEvent`, `eventFetchRefresh` |
| Customer lookup | `phone`, `lookupState` (idle/loading/known/unknown), `knownCustomer`, `lookupError`, `lookupDegraded` |
| Guest details | `firstName`, `lastName`, `email`, `notes` |
| Sunday lunch | `sundayLunch`, `sundayPlanManuallySelected`, `sundayMenuItems`, `sundayMenuLoading`, `sundayMenuError`, `guestOrders` |
| Payment | `paypalOrderId`, `bookingIdForPayment`, `depositAmountForPayment`, `paymentState`, `paymentError` |
| Submission | `policyAccepted`, `loading`, `error`, `result` |

**Refs:** `datePickerFocusRef`, `previousDateRef`, `availabilityControllerRef`

### Key Types

**BookingStep**: `'find' | 'choose' | 'details' | 'review'`

**ManagementTableBookingResult** (client):
```
state: 'confirmed' | 'pending_payment' | 'blocked'
table_booking_id, booking_reference, reason, blocked_reason, next_step_url, hold_expires_at, table_name
booking_id?, deposit_amount?
```

**AvailabilityData**:
```
date, available, time_slots: AvailabilitySlot[], message?, special_notes?, sunday_lunch_available?
```

**AvailabilitySlot**: `{ time, available?, available_capacity, reason? }`

**CustomerLookupResult**: `{ known, lookup_degraded?, normalized_phone?, customer? }`

**GuestOrder**: `{ guestName, menuItemId }`

**SundayLunchMenuItem**: `{ id, name, price }`

### Backend Payload Shape (BFF → Management API)

**POST /table-bookings** sends:
```json
{
  "phone": "07...",
  "first_name": "...", "last_name": "...", "email": "...",
  "date": "YYYY-MM-DD", "time": "HH:mm", "party_size": N,
  "purpose": "food|drinks",
  "notes": "Name: ...\nSunday lunch pre-order: ...\n...",
  "sunday_lunch": true|false,
  "default_country_code": "44",
  "skip_customer_sms": true
}
```

**Validation rules (BFF):**
- date: YYYY-MM-DD regex
- time: HH:mm or HH:mm:ss regex
- party_size: 1-20 (NOTE: frontend allows 1-50, BFF enforces 1-20)
- phone: 7+ digits after stripping non-digits
- sunday_lunch requires Sunday date + not past cutoff

---

## 4. External Dependency Map

### Management API (OJ-AnchorManagementTools)

| Endpoint | Used by | Request | Response |
|----------|---------|---------|----------|
| `GET {BASE}/business-hours` | Availability route, booking route | None | BusinessHours object with regularHours + specialHours |
| `POST {BASE}/table-bookings` | Booking route | ManagementTableBookingPayload + X-API-Key + Idempotency-Key | booking state, reference, payment details |
| `GET {BASE}/customers/lookup?phone=X` | Customer lookup route | X-API-Key header | known/unknown + customer details |
| `GET {BASE}/menus/sunday-lunch` | Sunday menu route | Via anchorAPI SDK | Menu items with mains[] |
| `POST {BASE}/external/table-bookings/{id}/paypal/create-order` | PayPal create route | Bearer token | orderId |
| `POST {BASE}/external/table-bookings/{id}/paypal/capture-order` | PayPal capture route | Bearer token + orderId | success/failure |
| `GET {BASE}/events?...` | Events route | Via anchorAPI SDK | events[] with startDate, name, capacity, etc. |
| `GET {BASE}/table-bookings/{ref}?customer_email=X` | Booking lookup route | X-API-Key header | Booking details |
| `DELETE {BASE}/table-bookings/{ref}?customer_email=X` | Booking cancel route | X-API-Key header | Cancellation response |

**Auth patterns:**
- Most routes: `X-API-Key` header with `ANCHOR_API_KEY` env var
- PayPal routes: `Authorization: Bearer {ANCHOR_API_KEY}` header
- Inconsistency: PayPal routes use Bearer, all others use X-API-Key

### PayPal SDK

- `@paypal/react-paypal-js` — client-side PayPal Buttons
- Client ID from `NEXT_PUBLIC_PAYPAL_CLIENT_ID` env var
- Currency: GBP
- Flow: server creates order → client renders buttons with existing orderId → client approves → server captures

### Google Tag Manager

- `trackTableBookingClick()` fires on: find table, slot select, details complete, confirm booking, event suggestion click
- PII redacted from tracking payloads

---

## 5. Missing Pieces Inventory

### Validation Gaps

1. **Party size mismatch**: Frontend allows 1-50, BFF validates 1-20. Users entering 21-50 on frontend will get a confusing 400 error from the API. The error message says "Party size must be between 1 and 20" but the form allowed them to enter it.

2. **No email validation**: Email field accepts any string. No format validation on client or BFF.

3. **No phone format validation on client**: The Input type="tel" has no pattern attribute. Phone is only validated as "7+ digits" on the BFF after stripping non-digits.

### Known Bug: Party Size Input

4. **Mobile party size clearing bug**: The `onChange` handler at line 1648 returns early when `raw === ''`, preventing the user from clearing the input to type a new number. On mobile keyboards without arrow keys, this forces users to carefully position the cursor and delete individual digits rather than select-all + type new value.

### State Management

5. **No form reset on step navigation**: Going back from 'review' to 'details' and then forward again does not clear stale `result` state — if a previous submission failed, the error may persist.

6. **No debounce on availability fetch**: Rapid date/time changes could fire multiple overlapping availability requests. The abort controller partially mitigates this for `handleFindTable`, but the event fetch useEffect has no abort mechanism.

7. **Timer-based cutoff re-render**: The 30-second `setNow(new Date())` interval re-renders the entire component every 30 seconds, even when no cutoff is relevant.

### Error Handling

8. **No retry mechanism**: If the booking submission fails, there is no "Try again" button — the user must manually re-click "Confirm booking".

9. **PayPal create-order failure has no retry**: If the PayPal order creation fails, the user sees an error but the only option is "Start a new booking" — losing all entered data.

10. **No timeout handling**: Fetch calls have no explicit timeout. If the management API hangs, the user sees infinite loading.

### Security / Defence

11. **No CSRF protection**: POST routes have no CSRF token validation. The BFF routes accept any origin.

12. **No rate limiting**: No rate limiting on booking submission, customer lookup, or availability checks. A bot could hammer these endpoints.

13. **No bot detection**: No CAPTCHA or challenge on the public booking form.

### UX Gaps

14. **No back navigation from confirmed state**: After successful booking confirmation, there is only "Book another table" — no link to home page or booking management.

15. **No booking summary on pending_payment step**: The review step shows deposit details but when in pending_payment state, the booking summary (date, time, guests) is only shown inside the PayPal section's `bookingSummary` prop as a compact string.

16. **No session persistence**: If the user refreshes during the flow, all progress is lost. No localStorage/sessionStorage backup of form state.

17. **Sunday lunch "Sunday plans" toggle shows even when cutoff passed**: The toggle renders when `availability?.sunday_lunch_available !== false`, but the cutoff check is a separate condition. If the availability API doesn't return `sunday_lunch_available`, the toggle shows with a greyed-out state.

### Testing

18. **No test coverage for BFF routes**: The API routes under `app/api/table-bookings/` have no test files (except PayPal routes which have `__tests__` dirs).

19. **Test file exists but coverage unknown**: `tests/unit/ManagementTableBookingForm.test.tsx` exists but was not read — coverage depth unknown.

### Documentation

20. **No API contract documentation**: The management API contract (request/response shapes for each endpoint) is only documented implicitly through TypeScript types and runtime code.

### Architectural Debt

21. **Two booking creation paths**: `app/api/booking/submit/route.ts` (legacy) and `app/api/table-bookings/route.ts` (new). The legacy path calls `anchorAPI.createTableBooking()` directly while the new path does a raw `fetch` to the management API. Different validation, different error handling, different response shapes.

22. **AI agent endpoint (`app/api/booking/agent/route.ts`) has stale copy**: Line 155 says "card hold to secure the booking (no charge)" — this is explicitly called out in CLAUDE.md as legacy language that is always a bug. The correct language is "deposit".

23. **PayPal auth inconsistency**: PayPal BFF routes use `Authorization: Bearer` while all other BFF routes use `X-API-Key` header. This suggests different management API endpoint families.
