# Performance Analyst Report — Spam Protection & API Proxy Routes

**Date:** 2026-04-08
**Scope:** API route handlers, spam protection, Turnstile verification, customer lookup
**Reviewer:** Performance Analyst (Codex QA)

---

## Findings

### PERF-001: Unbounded in-memory rate limit Map (spam-protection)

| Field | Value |
|-------|-------|
| **File** | `lib/spam-protection.ts` (line 7) |
| **Severity** | HIGH |
| **Category** | Memory leak |
| **Impact** | The module-level `rateLimitMap` (Map<string, number[]>) grows without bound. Every unique IP that hits any form endpoint adds an entry that is never removed. On a Vercel Serverless Function this is partially mitigated by cold starts recycling memory, but on a warm instance receiving sustained traffic (or a bot spray from many IPs), the Map will grow indefinitely until the function is evicted. Stale entries whose timestamps are all older than 60 s are never pruned. |
| **Suggested fix** | Add periodic eviction. After filtering timestamps in `isRateLimited()`, delete the key when the resulting array is empty. Additionally, add a sweep guard that runs at most once per 60 s and removes all keys with zero recent timestamps. Example: |

```typescript
// After filtering in isRateLimited():
if (recent.length === 0 && !rateLimitMap.has(ip)) return false
// ... existing logic ...

// Periodic sweep (cheap guard):
let lastSweep = Date.now()
function maybeSweep() {
  const now = Date.now()
  if (now - lastSweep < RATE_LIMIT_WINDOW_MS) return
  lastSweep = now
  for (const [key, ts] of rateLimitMap) {
    if (ts.every(t => now - t >= RATE_LIMIT_WINDOW_MS)) rateLimitMap.delete(key)
  }
}
```

---

### PERF-002: Unbounded in-memory rate limit Map (customer lookup)

| Field | Value |
|-------|-------|
| **File** | `app/api/customers/lookup/route.ts` (line 12) |
| **Severity** | HIGH |
| **Category** | Memory leak |
| **Impact** | Identical issue to PERF-001 but in a separate module-level `lookupRateLimitMap`. The customer lookup is a GET endpoint hit on every booking form phone-blur event, meaning it accumulates IP entries faster than the POST endpoints. Same unbounded growth problem. |
| **Suggested fix** | Same eviction pattern as PERF-001. Alternatively, extract a shared `InMemoryRateLimiter` class used by both files, with built-in TTL eviction, to eliminate the duplication and fix both leaks in one place. |

---

### PERF-003: Duplicate utility functions across four route files

| Field | Value |
|-------|-------|
| **File** | `app/api/table-bookings/route.ts`, `app/api/public/private-booking/route.ts`, `app/api/event-bookings/route.ts`, `app/api/event-waitlist/route.ts` |
| **Severity** | LOW |
| **Category** | Code duplication / bundle size |
| **Impact** | `asTrimmedString()`, `asPositiveInt()`, and `createIdempotencyKey()` are copy-pasted across four route files (each is its own serverless function bundle). This is not a runtime performance issue but increases maintenance risk — a bug fix in one copy can be missed in others. The table-bookings version of `createIdempotencyKey` also has a redundant `crypto.randomUUID` availability check (crypto is always available in Node 18+/Edge). |
| **Suggested fix** | Extract into `lib/form-utils.ts` and import. No runtime cost change but prevents drift. |

---

### PERF-004: Business hours fetch on every table booking POST with no caching

| Field | Value |
|-------|-------|
| **File** | `app/api/table-bookings/route.ts` (line 345) |
| **Severity** | MEDIUM |
| **Category** | Redundant network call |
| **Impact** | Every table booking submission calls `anchorAPI.getBusinessHours()` which hits the upstream management API with `revalidate: 0` (no cache). Business hours change at most a few times per week. During busy periods (e.g. Sunday lunch rush), dozens of booking attempts will each make a redundant round-trip to the management API just to validate service windows. This adds 100-300 ms of latency to every booking. |
| **Suggested fix** | Add a short TTL in-memory cache (60-120 s) for business hours within the API client or at the route level. Business hours are not user-specific so a simple module-level cache with a timestamp is safe. The service window validation is read-only and tolerates data that is a minute stale. |

```typescript
let cachedHours: { data: BusinessHours; expiry: number } | null = null
async function getCachedBusinessHours(): Promise<BusinessHours> {
  const now = Date.now()
  if (cachedHours && now < cachedHours.expiry) return cachedHours.data
  const data = await anchorAPI.getBusinessHours()
  cachedHours = { data, expiry: now + 60_000 }
  return data
}
```

---

### PERF-005: Spam protection runs sequentially before cheap validation

| Field | Value |
|-------|-------|
| **File** | `app/api/table-bookings/route.ts` (lines 306-317), all POST routes |
| **Severity** | LOW |
| **Category** | Unnecessary computation |
| **Impact** | `checkSpamProtection()` runs before payload normalisation and validation. If the payload is malformed (missing required fields, bad date format, etc.), the request would be rejected anyway by the cheap synchronous validators. Running the rate limiter first is fine (it is fast), but the ordering means every malformed request still increments the rate limit counter for that IP, potentially locking out a legitimate user who made a typo and is retrying. In the current code with `skipTurnstile: true` this is a minor concern, but if Turnstile verification is ever enabled on these routes, every malformed request would also make a network call to Cloudflare. |
| **Suggested fix** | Move basic field-presence validation (the cheap synchronous checks) before `checkSpamProtection()`. Keep rate limiting first if desired, but at minimum ensure the Turnstile network call does not fire for obviously invalid payloads. |

---

### PERF-006: Customer lookup has no response caching for repeated phone lookups

| Field | Value |
|-------|-------|
| **File** | `app/api/customers/lookup/route.ts` (line 68) |
| **Severity** | LOW |
| **Category** | Redundant network call |
| **Impact** | The lookup endpoint uses `cache: 'no-store'`. If a user types a phone number, blurs, corrects a digit, and blurs again, the first (incorrect) lookup result cannot be reused. This is acceptable for correctness but means a user editing their phone field generates multiple upstream API calls. The rate limiter (6 per minute) already guards against abuse, but a short (5-10 s) same-phone-number dedup cache would reduce upstream load for the most common case: the same user re-triggering lookup within seconds. |
| **Suggested fix** | Optional improvement. A small LRU cache keyed by normalised phone number with a 10 s TTL would reduce upstream calls without meaningfully affecting data freshness. |

---

### PERF-007: `console.error` in production (open-mic route)

| Field | Value |
|-------|-------|
| **File** | `app/api/enquiry/open-mic/route.ts` (line 67) |
| **Severity** | LOW |
| **Category** | Operational hygiene |
| **Impact** | This route uses raw `console.error` while all other routes use the structured `logError()` utility. This is not a performance issue per se but means errors from this route will not appear in the same log format as the others, making triage harder during incidents. |
| **Suggested fix** | Replace `console.error(...)` with `logError('api/enquiry/open-mic', error)` for consistency. |

---

### PERF-008: Turnstile token forwarded to upstream but never verified locally

| Field | Value |
|-------|-------|
| **File** | `app/api/table-bookings/route.ts` (lines 376-385), `app/api/public/private-booking/route.ts` (lines 136-144) |
| **Severity** | INFO |
| **Category** | Architecture note |
| **Impact** | Both table-bookings and private-booking routes extract `turnstile_token` from the body and forward it to the upstream management API via the `x-turnstile-token` header, while also passing `skipTurnstile: true` to `checkSpamProtection()`. This means the website proxy never validates the token — it trusts the upstream to do so. This is correct (Turnstile tokens are single-use, so verifying twice would fail), but it means if the upstream management API ever stops checking the token, there is no defence. The event-bookings and event-waitlist routes do not forward the token at all. |
| **Suggested fix** | No code change needed unless the upstream stops verifying. Document the trust boundary: "Turnstile verification happens upstream for table-bookings and private-booking; the proxy forwards the token but does not consume it." Ensure event-bookings and event-waitlist either forward the token or have an equivalent defence. |

---

## Summary

| ID | Severity | Category | File(s) |
|----|----------|----------|---------|
| PERF-001 | HIGH | Memory leak | `lib/spam-protection.ts` |
| PERF-002 | HIGH | Memory leak | `app/api/customers/lookup/route.ts` |
| PERF-003 | LOW | Code duplication | Four route files |
| PERF-004 | MEDIUM | Redundant network call | `app/api/table-bookings/route.ts` |
| PERF-005 | LOW | Unnecessary computation | All POST routes |
| PERF-006 | LOW | Redundant network call | `app/api/customers/lookup/route.ts` |
| PERF-007 | LOW | Operational hygiene | `app/api/enquiry/open-mic/route.ts` |
| PERF-008 | INFO | Architecture note | table-bookings, private-booking |

### Priority order for real-user impact

1. **PERF-001 + PERF-002** (HIGH) — Fix both memory leaks together by extracting a shared rate limiter with TTL eviction.
2. **PERF-004** (MEDIUM) — Add short-TTL business hours cache to shave 100-300 ms off every table booking.
3. Everything else is low-severity cleanup that can be addressed opportunistically.

### Mitigating factor

Vercel Serverless Functions recycle instances regularly, which limits the practical damage from PERF-001/002. On a low-traffic site like a single pub, the Maps are unlikely to grow large enough to cause OOM. However, a bot attack (which the spam protection is specifically designed to handle) could create thousands of unique IP entries in a short window on a warm instance, making the leak scenario more plausible precisely when it matters most.
