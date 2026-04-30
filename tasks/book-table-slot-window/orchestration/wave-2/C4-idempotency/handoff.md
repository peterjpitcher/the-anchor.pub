# Wave 2C4 — Submit-Intent Idempotency Key — Handoff

## Commit

`e280bb1` — `fix(book-table): reuse idempotency key per submit-intent fingerprint`

`git diff HEAD~1 HEAD --name-only` → exactly two files:
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `tests/unit/ManagementTableBookingForm.test.tsx`

## What landed

### New ref next to existing wizard refs (component scope)

```ts
// Submit-intent idempotency cache. Reuse the same Idempotency-Key when the
// customer retries a Confirm with the same booking payload, so the management
// API's server-side dedupe recognises the retry. Generate a fresh key when
// any meaningful payload field changes. Volatile fields (`_t`,
// `turnstile_token`, `website`) are intentionally excluded from the
// fingerprint — they can change between retries without changing the booking
// intent. Stored in a ref because the value is never rendered and we need to
// read/write it inside the submit handler without async state timing issues.
const submitIntentKeyRef = useRef<{ fingerprint: string; key: string } | null>(null)
```

The ref lives immediately after `wizardRef`/`wizardMountedRef` (the existing
mobile-scroll refs). It is **not** React state because the value never renders
and using state would introduce async-set timing issues inside the submit
handler.

### Final implementations (component-scope helpers)

```ts
// Build a stable JSON fingerprint of the meaningful submit-intent fields.
// Volatile anti-bot / telemetry fields (`_t`, `turnstile_token`, `website`)
// are deliberately excluded — see spec §13.2.
function buildSubmitIntentFingerprint(input: {
  phone: string
  firstName?: string
  lastName?: string
  email?: string
  date: string
  time: string
  partySize: number
  purpose: 'food' | 'drinks'
  notes?: string
}): string {
  return JSON.stringify({
    phone: input.phone.trim(),
    firstName: input.firstName?.trim() || '',
    lastName: input.lastName?.trim() || '',
    email: input.email?.trim() || '',
    date: input.date,
    time: input.time,
    partySize: input.partySize,
    purpose: input.purpose,
    notes: input.notes?.trim() || ''
  })
}

// Reuse the cached idempotency key when the fingerprint matches the previous
// submit intent; otherwise mint a new one and replace the cache entry.
function getSubmitIntentIdempotencyKey(fingerprint: string): string {
  if (submitIntentKeyRef.current?.fingerprint === fingerprint) {
    return submitIntentKeyRef.current.key
  }
  const key = createClientIdempotencyKey('tbl_web')
  submitIntentKeyRef.current = { fingerprint, key }
  return key
}

function clearSubmitIntentIdempotencyKey() {
  submitIntentKeyRef.current = null
}
```

These match spec §13.2 byte-for-byte.

### `handleConfirmBooking` integration

`createClientIdempotencyKey('tbl_web')` is **no longer called inline inside the
handler.** The handler now:

1. Calls `deriveSubmitPurpose()` first; if it returns `null`, surfaces the
   existing `Please choose a time again before confirming.` error, sends the
   user back to step `'choose'`, and bails **before any key work runs**.
2. Trims phone / names / email / notes once into local consts.
3. Builds the fingerprint via `buildSubmitIntentFingerprint(...)`.
4. Retrieves the key via `getSubmitIntentIdempotencyKey(fingerprint)`.
5. Constructs the request payload, then appends the **volatile** fields
   (`turnstile_token`, `website`, `_t: ...formLoadedAt diff`) **after** the
   key has been selected. A comment in the source notes this ordering.

The only call site of `createClientIdempotencyKey` in the file is now inside
`getSubmitIntentIdempotencyKey`. Verified:

```
$ grep -n "createClientIdempotencyKey" components/features/TableBooking/ManagementTableBookingForm.tsx
191:function createClientIdempotencyKey(prefix: string): string {
1342:    const key = createClientIdempotencyKey('tbl_web')
```

L191 is the helper definition; L1342 is inside `getSubmitIntentIdempotencyKey`.

### Cache reset wiring

- `handleFindTable()` calls `clearSubmitIntentIdempotencyKey()` immediately
  after `setShowAllTimes(false)` and before `runAvailabilitySearch(...)`. A
  new availability search starts a new submit intent.
- `resetJourney()` calls `clearSubmitIntentIdempotencyKey()` as the last
  step (after `formLoadedAt.current = Date.now()`). Book-another /
  start-a-new-booking flows must mint a fresh key.

### Volatile-field exclusion (verified)

The fingerprint **does not include** `_t`, `turnstile_token`, or `website`.
The fingerprint **does include**: `phone`, `firstName`, `lastName`, `email`,
`date`, `time`, `partySize`, `purpose`, `notes` — all trimmed where they are
user-typed strings.

## Tests

Added a new `describe('Submit-intent idempotency key', ...)` block with 4 cases
matching spec §13.3. The block sits inside the outer
`describe('ManagementTableBookingForm', ...)` immediately after the existing
`Mobile optimisation` block, so all `afterEach(jest.clearAllMocks)` semantics
inherit unchanged.

A small shared helper `fillFindAndProceedToReview(options)` covers the common
"Find a table → choose slot → details → policy-checked review" path and
accepts overrides for party size, date, slot regex, names, phone, and notes.

`setupFetchMock` was extended with three additive options to support the new
tests; existing tests are untouched:

| Option | Purpose |
|---|---|
| `captureHeaders` | Single-shot capture of the most recent POST headers (object map). |
| `captureBookingHistory` | Cumulative log of every `/api/table-bookings` POST as `{ headers, body }` — used by every idempotency test to compare keys across retries. |
| `bookingHandler(init, callIndex)` | Returns a custom `Response` for a specific call index (e.g. fail call #0 with 503). Falls through to the default `confirmed` response when it returns `null`. |

The 4 cases:

1. **Reuses Idempotency-Key across Confirm retries when the booking intent is
   unchanged.** First Confirm gets a 503 response from the mocked endpoint; we
   wait for the visible `/Temporarily unavailable/i` error, then click Confirm
   again. Asserts both POSTs share the same `idempotency-key` header.
2. **Issues a new Idempotency-Key after a fresh availability search (Book
   another).** Successful Confirm → "Book another table" → search a different
   date → fill details → Confirm. Asserts the second POST's key differs from
   the first.
3. **Reuses Idempotency-Key across Back-to-details and forward-to-review when
   nothing changes.** First Confirm fails, customer clicks Back to details,
   immediately Continue to review (no field edits, policy stays checked),
   Confirm. Asserts the keys match.
4. **Issues a new Idempotency-Key when the customer changes notes after backing
   out of review.** First Confirm fails, Back to details, edit Notes, Continue
   to review, Confirm. Asserts the second POST's key differs.

TDD pre-flight: all 4 tests were added first and run against pre-fix code.
Tests 1 and 3 failed at the equality assertion (`expect(secondKey).toBe(firstKey)`)
exactly as expected (current code rotated the key per click). Tests 2 and 4
incidentally passed against pre-fix code because the previous implementation
always rotated; after the fix they pass for the *right* reason — the
fingerprint legitimately differs.

## Verification

```
$ npx jest tests/unit/ManagementTableBookingForm.test.tsx
  Tests:       38 passed, 38 total
  (12 baseline + 9 from Wave 2C1 + 5 from Wave 2C2 + 8 from Wave 2C3 + 4 new idempotency)

$ npx jest tests/unit/ManagementTableBookingForm.test.tsx -t "Submit-intent idempotency"
  Tests:       34 skipped, 4 passed, 38 total

$ TZ=America/New_York npx jest tests/unit/ManagementTableBookingForm.test.tsx -t "London"
  Tests:       33 skipped, 5 passed, 38 total

$ npx jest tests/unit/table-booking-slot-window.test.ts
  Tests:       15 passed, 15 total

$ npx tsc --noEmit
  (clean — no output)

$ npx eslint components/features/TableBooking/ManagementTableBookingForm.tsx tests/unit/ManagementTableBookingForm.test.tsx --max-warnings=0
  (clean — no output)
```

## Judgment calls

- **`setupFetchMock` was extended with `captureBookingHistory` and
  `bookingHandler` rather than rewritten.** Existing tests use only the prior
  `capturePayload` / `captureUrl` shapes; adding optional fields keeps every
  pre-existing test green. The new options are documented in the test file
  via their type annotations.
- **The "Back" button is found via `screen.getAllByRole('button', { name: 'Back' })`
  with `[length - 1]`.** On the review screen the wizard renders multiple
  Back buttons (e.g. inside collapsed details on some flows); the last one
  in document order is the review-step Back. The same idiom is used by
  `findIndex`-style tests already in the file.
- **The policy checkbox is left checked when going back-to-details and
  forward-to-review.** `policyAccepted` only resets in `resetJourney()`
  (line 1545 in the post-fix file), so the test deliberately does **not**
  toggle it on the second pass; toggling would un-check it and the second
  Confirm would never fire a fetch.
- **Failed-Confirm retry uses a 503 response, not a thrown rejection.** The
  wizard's catch handler treats `!response.ok` and `body.success === false`
  identically — both surface the upstream error message. A 503 is a more
  realistic timeout/proxy-failure simulation and lets the test wait for the
  observable `/Temporarily unavailable/i` error before clicking again.
- **`buildSubmitIntentFingerprint` and `getSubmitIntentIdempotencyKey` are
  defined inside the component**, not extracted to `lib/`. They close over
  `submitIntentKeyRef` (the cache lives per-instance), so module-level
  extraction would require passing the ref in. Spec §13.2's reference
  implementation is in-component, and matching that shape keeps the diff
  surgical.
- **Volatile fields are appended to the payload after key selection** with
  an inline comment explaining the ordering rule. This is enforced by code
  layout, not by a runtime check — the next reader sees the comment.

## Notes for downstream work

- No public exports, props, or types changed.
- No changes to `lib/`, `app/api/`, the proxy, or the management API contract.
- The fingerprint includes `purpose`, derived via the existing
  `deriveSubmitPurpose()` (which is unchanged). If a future task extends the
  payload (e.g. adding `dietary_requirements` from spec §4 follow-up), that
  field must be added to the fingerprint as well so a customer who edits it
  gets a fresh key.
- The `getSubmitIntentIdempotencyKey` lookup is keyed on **strict string
  equality** of the JSON fingerprint. Object-key ordering inside
  `buildSubmitIntentFingerprint` is fixed (declaration order is preserved by
  V8/JSC for string keys), so a new field added in the middle of the literal
  is equivalent to a new field — both invalidate the cache and mint a new key.
