# Standards Enforcer Report -- Spam Protection & API Route Handlers

**Date:** 2026-04-08
**Scope:** `app/api/table-bookings/route.ts`, `app/api/public/private-booking/route.ts`, `app/api/event-bookings/route.ts`, `app/api/event-waitlist/route.ts`, `app/api/enquiry/open-mic/route.ts`, `lib/spam-protection.ts`, `lib/turnstile.ts`, `app/api/customers/lookup/route.ts`
**Focus:** TypeScript strictness, error handling, consistency, hardcoded values, console.log, naming, proxy structure

---

## Findings

### STD-001: `any` types in shared error-handling utility

- **File:** `lib/error-handling.ts` (lines 87-89, 111)
- **Severity:** Medium
- **Standard:** Workspace CLAUDE.md -- "No `any` types unless absolutely justified with a comment"
- **Current code:**
  ```typescript
  export function createApiErrorResponse(
    message: string,
    status: number = 500,
    details?: any        // <-- untyped
  ) {
    const response: any = {  // <-- untyped
  ```
  Also `logError` uses `Record<string, any>` for `additionalInfo`.
- **Expected code:**
  ```typescript
  export function createApiErrorResponse(
    message: string,
    status: number = 500,
    details?: Record<string, unknown>
  ): Response {
    const response: Record<string, unknown> = {
  ```
  And `additionalInfo?: Record<string, unknown>` on `logError`.
- **Auto-fixable:** Yes

---

### STD-002: Missing explicit return type on exported `POST` handlers

- **Files:** All reviewed route handlers
- **Severity:** Medium
- **Standard:** Workspace CLAUDE.md -- "Explicit return types on all exported functions"
- **Current code (example from `app/api/table-bookings/route.ts`):**
  ```typescript
  export async function POST(request: NextRequest) {
  ```
- **Expected code:**
  ```typescript
  export async function POST(request: NextRequest): Promise<Response> {
  ```
- **Affected files:**
  - `app/api/table-bookings/route.ts` (line 298)
  - `app/api/public/private-booking/route.ts` (line 82)
  - `app/api/event-bookings/route.ts` (line 120)
  - `app/api/event-waitlist/route.ts` (line 95)
  - `app/api/enquiry/open-mic/route.ts` (line 17)
  - `app/api/customers/lookup/route.ts` (line 44, `GET` handler)
- **Auto-fixable:** Yes

---

### STD-003: Missing explicit return type on exported `verifyTurnstileToken`

- **File:** `lib/turnstile.ts` (line 8)
- **Severity:** Low
- **Standard:** Workspace CLAUDE.md -- "Explicit return types on all exported functions"
- **Current code:**
  ```typescript
  export async function verifyTurnstileToken(token: string | null | undefined): Promise<TurnstileVerifyResult> {
  ```
- **Status:** Compliant. No action needed.

---

### STD-004: Missing explicit return type on exported `checkSpamProtection`

- **File:** `lib/spam-protection.ts` (line 89)
- **Severity:** Low
- **Standard:** Workspace CLAUDE.md -- "Explicit return types on all exported functions"
- **Current code:**
  ```typescript
  export async function checkSpamProtection(
    request: NextRequest | Request,
    body: Record<string, unknown>,
    options?: { skipTurnstile?: boolean }
  ): Promise<SpamCheckResult> {
  ```
- **Status:** Compliant. No action needed.

---

### STD-005: `console.error` in production code (`open-mic/route.ts`)

- **File:** `app/api/enquiry/open-mic/route.ts` (line 67)
- **Severity:** Medium
- **Standard:** Definition of Done -- "No console.log or debug statements left in production code"; other routes use `logError()` from `@/lib/error-handling`
- **Current code:**
  ```typescript
  console.error('Open mic performer interest submission failed:', error)
  ```
- **Expected code:**
  ```typescript
  logError('api/enquiry/open-mic', error)
  ```
  (import `logError` from `@/lib/error-handling`)
- **Auto-fixable:** Yes

---

### STD-006: Inconsistent error response shape in `open-mic/route.ts`

- **File:** `app/api/enquiry/open-mic/route.ts` (lines 21-25, 66-69)
- **Severity:** Medium
- **Standard:** Consistent proxy route patterns (observed in `table-bookings`, `event-bookings`, `event-waitlist`)
- **Current code:**
  ```typescript
  // 503 check uses inline NextResponse.json with custom shape
  return NextResponse.json(
    { success: false, error: 'Server is not configured...' },
    { status: 500 }
  )
  // Catch block exposes raw error message to client
  const message = error instanceof Error ? error.message : 'Unexpected error submitting form.'
  return NextResponse.json({ success: false, error: message }, { status: 500 })
  ```
- **Expected code:**
  ```typescript
  // Use createApiErrorResponse for consistent shape
  return createApiErrorResponse('Open mic submissions are unavailable', 503)
  // Catch block should not leak internal error messages
  return createApiErrorResponse(
    'We could not submit your details right now. Please call 01753 682707.',
    503
  )
  ```
- **Auto-fixable:** Yes (with import addition)

---

### STD-007: Internal error message leaked to client in `open-mic/route.ts`

- **File:** `app/api/enquiry/open-mic/route.ts` (line 68)
- **Severity:** High
- **Standard:** Security best practice; other routes return user-friendly messages in catch blocks
- **Current code:**
  ```typescript
  const message = error instanceof Error ? error.message : 'Unexpected error submitting form.'
  return NextResponse.json({ success: false, error: message }, { status: 500 })
  ```
- **Expected code:**
  ```typescript
  logError('api/enquiry/open-mic', error)
  return createApiErrorResponse(
    'We could not submit your details right now. Please call 01753 682707.',
    503
  )
  ```
- **Auto-fixable:** Yes

---

### STD-008: Duplicated utility functions across route handlers

- **Files:**
  - `app/api/table-bookings/route.ts` (lines 105-123)
  - `app/api/public/private-booking/route.ts` (lines 28-46)
  - `app/api/event-bookings/route.ts` (lines 24-42)
  - `app/api/event-waitlist/route.ts` (lines 24-42)
- **Severity:** Medium
- **Standard:** DRY principle; workspace CLAUDE.md pattern guidance
- **Detail:** `asTrimmedString()`, `asPositiveInt()`, and `createIdempotencyKey()` are copy-pasted identically (or near-identically) across four route files.
- **Expected:** Extract to a shared utility, e.g. `lib/api-helpers.ts`:
  ```typescript
  export function asTrimmedString(value: unknown): string | undefined { ... }
  export function asPositiveInt(value: unknown): number | undefined { ... }
  export function createIdempotencyKey(prefix: string): string { ... }
  ```
- **Auto-fixable:** No (requires file creation + import rewiring)

---

### STD-009: Turnstile token not forwarded to upstream in `event-bookings` and `event-waitlist`

- **Files:**
  - `app/api/event-bookings/route.ts` (lines 145-154)
  - `app/api/event-waitlist/route.ts` (lines 120-129)
- **Severity:** Medium
- **Standard:** Consistent proxy behaviour; `table-bookings/route.ts` and `private-booking/route.ts` both forward `x-turnstile-token` header
- **Current code (event-bookings):**
  ```typescript
  const upstream = await fetch(`${API_BASE_URL}/event-bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      'Idempotency-Key': idempotencyKey
    },
    // No turnstile token forwarding
  ```
- **Expected code:**
  ```typescript
  const turnstileToken = typeof body.turnstile_token === 'string' ? body.turnstile_token : null

  const upstream = await fetch(`${API_BASE_URL}/event-bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      'Idempotency-Key': idempotencyKey,
      ...(turnstileToken ? { 'x-turnstile-token': turnstileToken } : {})
    },
  ```
- **Auto-fixable:** Yes

---

### STD-010: Inconsistent error response patterns -- mixed `NextResponse.json` and `createApiErrorResponse`

- **Files:**
  - `app/api/public/private-booking/route.ts` -- uses `NextResponse.json` with custom `{ success, error: { code, message } }` shape throughout
  - `app/api/event-bookings/route.ts` -- uses `createApiErrorResponse` for most errors but `NextResponse.json` with a different shape for policy violations (line 173)
  - `app/api/enquiry/open-mic/route.ts` -- uses `NextResponse.json` with `{ success, error }` (flat string) shape
  - `app/api/table-bookings/route.ts` -- uses `createApiErrorResponse` consistently
  - `app/api/event-waitlist/route.ts` -- uses `createApiErrorResponse` consistently
- **Severity:** Low
- **Standard:** Consistent patterns across similar routes (project CLAUDE.md architecture guidance)
- **Detail:** Three different error response shapes exist across the reviewed routes:
  1. `{ error: string, status: number, timestamp: string }` (via `createApiErrorResponse`)
  2. `{ success: false, error: { code: string, message: string } }` (private-booking)
  3. `{ success: false, error: string }` (open-mic)
- **Expected:** Standardise on `createApiErrorResponse` for all proxy error responses, or document the intentional divergence.
- **Auto-fixable:** Partially (private-booking shape may be contractual with frontend)

---

### STD-011: In-memory rate limiter does not evict old entries

- **Files:**
  - `lib/spam-protection.ts` (line 7)
  - `app/api/customers/lookup/route.ts` (line 12)
- **Severity:** Low
- **Standard:** No memory leaks in production; serverless function best practices
- **Detail:** `rateLimitMap` and `lookupRateLimitMap` are `Map<string, number[]>` that grow unbounded. Old IP entries are filtered but never deleted. In a long-lived process (or high-traffic Vercel function with fluid compute), this could accumulate stale keys.
- **Current code:**
  ```typescript
  const rateLimitMap = new Map<string, number[]>()
  ```
- **Expected code (periodic eviction or size cap):**
  ```typescript
  const rateLimitMap = new Map<string, number[]>()
  // Evict stale entries periodically
  if (rateLimitMap.size > 10_000) {
    const now = Date.now()
    for (const [ip, timestamps] of rateLimitMap) {
      if (timestamps.every(t => now - t >= RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(ip)
      }
    }
  }
  ```
- **Auto-fixable:** Yes

---

### STD-012: Unsafe `as Record<string, unknown>` casts without null guard in `spam-protection.ts`

- **File:** `lib/spam-protection.ts` (lines 64-65)
- **Severity:** Low
- **Standard:** TypeScript strictness
- **Current code:**
  ```typescript
  (typeof (body.customer as Record<string, unknown>)?.mobile_number === 'string'
    && (body.customer as Record<string, unknown>).mobile_number as string)
  ```
- **Detail:** If `body.customer` is a non-object truthy value (e.g. a string), casting it to `Record<string, unknown>` is unsafe. The optional chaining on the first access guards against `null/undefined` but not against non-object types.
- **Expected code:**
  ```typescript
  const customer = body.customer && typeof body.customer === 'object' ? body.customer as Record<string, unknown> : null
  const customerPhone = typeof customer?.mobile_number === 'string' ? customer.mobile_number : null
  ```
- **Auto-fixable:** Yes

---

### STD-013: `res.json()` can throw on non-JSON upstream responses (`private-booking/route.ts`)

- **File:** `app/api/public/private-booking/route.ts` (line 149)
- **Severity:** Medium
- **Standard:** Defensive error handling; `table-bookings` and `event-bookings` use `safeJsonParse(await upstream.text())` pattern
- **Current code:**
  ```typescript
  const data = await res.json()
  ```
- **Expected code:**
  ```typescript
  const rawText = await res.text()
  const data = safeJsonParse(rawText)
  const fallbackPayload = {
    success: false,
    error: getSafeUpstreamErrorMessage(rawText, 'Private booking request failed')
  }
  ```
  (import `safeJsonParse` and `getSafeUpstreamErrorMessage` from `@/lib/upstream-json`)
- **Auto-fixable:** Yes

---

### STD-014: Unused `NextResponse` import in some files

- **File:** `app/api/event-waitlist/route.ts` (line 1)
- **Severity:** Low
- **Standard:** Clean imports; lint should catch this
- **Current code:**
  ```typescript
  import { NextRequest, NextResponse } from 'next/server'
  ```
- **Detail:** `NextResponse` is used on line 138 (`NextResponse.json`), so this is actually in use. However, it is inconsistent with `table-bookings/route.ts` which only imports `NextRequest` and uses raw `Response` constructor. The inconsistency is noted but not a violation.
- **Status:** No action required, but see STD-010 for the broader consistency issue.

---

### STD-015: `open-mic/route.ts` missing idempotency key handling

- **File:** `app/api/enquiry/open-mic/route.ts`
- **Severity:** Low
- **Standard:** Consistent proxy pattern; other POST routes (`table-bookings`, `private-booking`, `event-bookings`, `event-waitlist`) all generate/forward idempotency keys
- **Current code:** No idempotency key generated or forwarded.
- **Expected code:**
  ```typescript
  const idempotencyKey = request.headers.get('Idempotency-Key') || `omic_${crypto.randomUUID()}`
  // Include in upstream fetch headers:
  'Idempotency-Key': idempotencyKey,
  ```
- **Auto-fixable:** Yes

---

### STD-016: Missing `cache: 'no-store'` on upstream fetch in `private-booking/route.ts` and `open-mic/route.ts`

- **Files:**
  - `app/api/public/private-booking/route.ts` (line 138)
  - `app/api/enquiry/open-mic/route.ts` (line 43)
- **Severity:** Low
- **Standard:** Consistent proxy pattern; `table-bookings`, `event-bookings`, and `event-waitlist` all specify `cache: 'no-store'`
- **Current code (private-booking):**
  ```typescript
  const res = await fetch(`${API_BASE_URL}/private-booking-enquiry`, {
    method: 'POST',
    headers: { ... },
    body: JSON.stringify(mappedPayload)
  })
  ```
- **Expected code:**
  ```typescript
  const res = await fetch(`${API_BASE_URL}/private-booking-enquiry`, {
    method: 'POST',
    headers: { ... },
    cache: 'no-store',
    body: JSON.stringify(mappedPayload)
  })
  ```
- **Auto-fixable:** Yes

---

### STD-017: `customers/lookup/route.ts` has no spam protection

- **File:** `app/api/customers/lookup/route.ts`
- **Severity:** Low
- **Standard:** Consistent spam protection; all other reviewed routes call `checkSpamProtection()`
- **Detail:** This is a GET endpoint with its own rate limiter, so `checkSpamProtection()` (designed for POST bodies) does not directly apply. The custom rate limiter is appropriate. However, the route lacks the honeypot and timing checks that POST routes get. This is acceptable for a GET lookup endpoint. No action required, noted for completeness.
- **Status:** Acceptable divergence.

---

## Summary

| Severity | Count | Auto-fixable |
|----------|-------|-------------|
| High     | 1     | 1           |
| Medium   | 7     | 5           |
| Low      | 6     | 4           |
| **Total** | **14** | **10**    |

### Priority fixes (recommended order)

1. **STD-007** (High) -- Stop leaking internal error messages to clients in `open-mic/route.ts`
2. **STD-005** (Medium) -- Replace `console.error` with `logError` in `open-mic/route.ts`
3. **STD-006** (Medium) -- Standardise error response shape in `open-mic/route.ts`
4. **STD-013** (Medium) -- Use `safeJsonParse` in `private-booking/route.ts` for defensive upstream parsing
5. **STD-009** (Medium) -- Forward turnstile token in `event-bookings` and `event-waitlist` routes
6. **STD-002** (Medium) -- Add explicit return types to all exported route handlers
7. **STD-001** (Medium) -- Remove `any` types from `createApiErrorResponse` and `logError`
8. **STD-008** (Medium) -- Extract duplicated utilities to shared module
