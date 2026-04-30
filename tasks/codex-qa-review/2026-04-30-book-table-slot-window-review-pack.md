# Review Pack: book-table-slot-window

**Generated:** 2026-04-30
**Mode:** B (A=Adversarial / B=Code / C=Spec Compliance)
**Project root:** `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub`
**Base ref:** `c28d298`
**HEAD:** `7f6a99d`
**Diff range:** `c28d298...HEAD`
**Stats:**  9 files changed, 986 insertions(+), 92 deletions(-)

> This pack is the sole input for reviewers. Do NOT read files outside it unless a specific finding requires verification. If a file not in the pack is needed, mark the finding `Needs verification` and describe what would resolve it.

## Changed Files

```
app/events/[id]/page.tsx
app/robots.ts
components/features/TableBooking/ManagementTableBookingForm.tsx
config/redirects/additional-redirects.json
config/redirects/drinks-redirects.json
lib/table-booking-service-windows.ts
lib/table-booking-slot-window.ts
tasks/gsc-indexing-fix/REVIEW-PACK.md
tasks/gsc-indexing-fix/SPEC.md
```

## User Concerns

Slot window must operate on availableSlots not raw time_slots; expander must not collapse on slot select; slotWindowAnchorTime must be set only on successful search not on slot select; party-size threading must use the freshly typed value not stale closure; ALL date/time computations must use Europe/London (no toISOString().slice(0,10), no browser-local Date for booking validation); idempotency-key fingerprint must reuse on identical payload retries and reissue on changed payload, MUST exclude _t/turnstile_token/website volatile fields; mobile tap targets must be >=48px; aria-label on slot buttons must combine time + service caption; scrollIntoView must not fire on initial mount.

## Diff (`c28d298...HEAD`)

```diff
diff --git a/app/events/[id]/page.tsx b/app/events/[id]/page.tsx
index c3aa4f6..f59f77c 100644
--- a/app/events/[id]/page.tsx
+++ b/app/events/[id]/page.tsx
@@ -1,7 +1,7 @@
 import { Metadata } from 'next'
 import Image from 'next/image'
 import Link from 'next/link'
-import { notFound, permanentRedirect } from 'next/navigation'
+import { permanentRedirect } from 'next/navigation'
 import { Button, Container, Section, Card, CardBody, Alert } from '@/components/ui'
 import { EventSchema } from '@/components/seo/EventSchema'
 import { EventBookingButton } from '@/components/EventBookingButton'
@@ -240,9 +240,13 @@ export default async function EventPage({ params }: Props) {
     permanentRedirect(`/events/${encodeURIComponent(canonicalSegment)}`)
   }
 
+  if (!event) {
+    permanentRedirect('/whats-on')
+  }
+
   const status = normalizeEventStatus(event)
   if (status === 'draft') {
-    notFound()
+    permanentRedirect('/whats-on')
   }
 
   // Event lifecycle SEO strategy — redirect stale past events to next upcoming event
diff --git a/app/robots.ts b/app/robots.ts
index 63609e6..91c4311 100644
--- a/app/robots.ts
+++ b/app/robots.ts
@@ -10,7 +10,6 @@ export default function robots(): MetadataRoute.Robots {
           '/api/',
           // Allow static assets so crawlers can render pages correctly.
           '/_next/data/',
-          '/*?dpl=*',
           '/_serverless/',
           '/_partials/',
           '/_api/',
diff --git a/components/features/TableBooking/ManagementTableBookingForm.tsx b/components/features/TableBooking/ManagementTableBookingForm.tsx
index 9a96c19..89ecb43 100644
--- a/components/features/TableBooking/ManagementTableBookingForm.tsx
+++ b/components/features/TableBooking/ManagementTableBookingForm.tsx
@@ -3,12 +3,19 @@
 import { useEffect, useMemo, useRef, useState } from 'react'
 import { useSearchParams } from 'next/navigation'
 import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
+import { ChevronDown } from 'lucide-react'
 import { Alert } from '@/components/ui/feedback/Alert'
 import { Card, CardBody } from '@/components/ui/layout/Card'
 import { Input, Textarea } from '@/components/ui/primitives/Input'
 import { Button } from '@/components/ui/primitives/Button'
 import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
 import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
+import { pickSlotWindow } from '@/lib/table-booking-slot-window'
+import {
+  londonIsoDate,
+  londonNowParts,
+  toTimeString,
+} from '@/lib/table-booking-service-windows'
 import {
   pushToDataLayer,
   trackTableBookingClick,
@@ -141,15 +148,16 @@ function toIsoDateInputValue(value: string | undefined): string {
   if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
   const date = new Date(value)
   if (Number.isNaN(date.getTime())) return ''
-  return date.toISOString().slice(0, 10)
+  return londonIsoDate(date)
 }
 
 function getDefaultTimeValue(): string {
-  const now = new Date()
-  now.setMinutes(now.getMinutes() + 60)
-  const roundedMinutes = now.getMinutes() >= 30 ? 30 : 0
-  now.setMinutes(roundedMinutes, 0, 0)
-  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
+  // Compute "now + 1 hour, rounded up to the next 30-minute slot" in
+  // Europe/London. The previous implementation used the browser-local clock,
+  // which is wrong for any visitor whose device is not on UK time.
+  const { minutes } = londonNowParts()
+  const next = Math.ceil((minutes + 60) / 30) * 30
+  return toTimeString(next % 1440)
 }
 
 function toTimeInputValue(value: string | undefined): string {
@@ -300,8 +308,18 @@ function formatTimeForDisplay(time: string): string {
 function addDays(isoDate: string, days: number): string {
   if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
   const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
+  // UTC arithmetic from a date-only anchor + format through London. BST/GMT
+  // shifts never cross noon, so this produces the correct calendar date in
+  // every browser timezone.
   const date = new Date(Date.UTC(year, month - 1, day + days))
-  return date.toISOString().slice(0, 10)
+  return londonIsoDate(date)
+}
+
+function isPastLondonDate(value: string): boolean {
+  // Compare YYYY-MM-DD strings against London today. We deliberately do NOT
+  // parse `value` with `new Date(...)` — that would re-introduce browser-local
+  // timezone drift on the customer's device.
+  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value < londonNowParts().isoDate
 }
 
 function getLondonIsoDate(dateTimeValue: string): string | null {
@@ -467,6 +485,9 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
   // (Retained because the LaunchAnnouncement, hold-expiry and other time-derived
   // surfaces benefit from a periodic tick; the legacy Sunday-lunch / Mother's-Day
   // cutoff calculations that originally drove this have been retired in §8.1.)
+  //
+  // Re-render tick only. Booking date/time computations must use Europe/London
+  // helpers (londonIsoDate / londonNowParts), not the browser-local value below.
   const [, setNow] = useState(() => new Date())
   useEffect(() => {
     if (typeof window === 'undefined') return
@@ -516,7 +537,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     })
   }
 
-  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
+  const today = useMemo(() => londonNowParts().isoDate, [])
   const defaultDate = toIsoDateInputValue(prefill?.date) || today
   const defaultRequestedTime = toTimeInputValue(prefill?.time) || getDefaultTimeValue()
   const defaultPartySize = Math.min(Math.max(prefill?.partySize || 2, 1), 20)
@@ -528,6 +549,11 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
   const [date, setDate] = useState(defaultDate)
   const [requestedTime, setRequestedTime] = useState(defaultRequestedTime)
   const [selectedTime, setSelectedTime] = useState<string>('')
+  // Step-2 slot window. `slotWindowAnchorTime` is captured at search time so
+  // selecting a slot (which mutates `requestedTime`) does not re-centre the
+  // visible grid; `showAllTimes` toggles the "See more times" expander.
+  const [showAllTimes, setShowAllTimes] = useState(false)
+  const [slotWindowAnchorTime, setSlotWindowAnchorTime] = useState(defaultRequestedTime)
   // Captured at slot-select time so the submit step can derive `purpose`
   // ('food' | 'drinks') from the slot's `kitchen_open` flag without re-fetching
   // availability — covers the nearest-alternative path where the slot is not
@@ -575,6 +601,30 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
   const formLoadedAt = useRef(Date.now())
   const [result, setResult] = useState<ManagementTableBookingResult | null>(null)
 
+  // Wizard root ref for scroll-to-top on step transitions. Mounted-guard ref
+  // prevents the effect from firing on initial mount — only step changes
+  // after first paint should scroll.
+  const wizardRef = useRef<HTMLDivElement>(null)
+  const wizardMountedRef = useRef(false)
+
+  useEffect(() => {
+    if (!wizardMountedRef.current) {
+      wizardMountedRef.current = true
+      return
+    }
+    wizardRef.current?.scrollIntoView({ block: 'start' })
+  }, [step])
+
+  // Submit-intent idempotency cache. Reuse the same Idempotency-Key when the
+  // customer retries a Confirm with the same booking payload, so the management
+  // API's server-side dedupe recognises the retry. Generate a fresh key when
+  // any meaningful payload field changes. Volatile fields (`_t`,
+  // `turnstile_token`, `website`) are intentionally excluded from the
+  // fingerprint — they can change between retries without changing the booking
+  // intent. Stored in a ref because the value is never rendered and we need to
+  // read/write it inside the submit handler without async state timing issues.
+  const submitIntentKeyRef = useRef<{ fingerprint: string; key: string } | null>(null)
+
   const holdExpiry = formatHoldExpiry(result?.hold_expires_at || null)
   // Sunday lunch as a separate booking type, the Saturday-1pm cutoff, the
   // dedicated Mother's Day mode, and the Sunday menu pre-order flow are all
@@ -596,6 +646,15 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
       (availability?.time_slots || []).filter((slot) => isSlotAvailable(slot, partySize)),
     [availability?.time_slots, partySize]
   )
+  // Visible step-2 slots: by default a 7-slot window centred on the search-time
+  // anchor, expanded to the full list when the customer taps "See more times".
+  const visibleSlots = useMemo(
+    () =>
+      showAllTimes
+        ? availableSlots
+        : pickSlotWindow(availableSlots, slotWindowAnchorTime),
+    [availableSlots, showAllTimes, slotWindowAnchorTime]
+  )
 
   // Date-aware bar / kitchen hours summary, shown above the party-size
   // field on the Find step. Pulls from the global BusinessHoursProvider
@@ -767,11 +826,12 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
   async function fetchAvailabilityForDate(
     targetDate: string,
     targetTime: string,
+    targetPartySize: number,
     signal?: AbortSignal
   ): Promise<AvailabilityData> {
     const params = new URLSearchParams({
       date: targetDate,
-      party_size: String(partySize),
+      party_size: String(targetPartySize),
       time: targetTime
     })
 
@@ -793,7 +853,11 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     return normalizeAvailabilityResponse(body)
   }
 
-  async function loadNearestAlternatives(targetDate: string, targetTime: string) {
+  async function loadNearestAlternatives(
+    targetDate: string,
+    targetTime: string,
+    targetPartySize: number
+  ) {
     setAlternativesLoading(true)
     setAlternativeSlots([])
 
@@ -802,7 +866,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
       const candidateResponses = await Promise.all(
         dateCandidates.map(async (candidateDate) => {
           try {
-            return await fetchAvailabilityForDate(candidateDate, targetTime)
+            return await fetchAvailabilityForDate(candidateDate, targetTime, targetPartySize)
           } catch {
             return null
           }
@@ -814,7 +878,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
         if (!response) continue
 
         const slots = response.time_slots
-          .filter((slot) => isSlotAvailable(slot, partySize))
+          .filter((slot) => isSlotAvailable(slot, targetPartySize))
           .slice(0, 2)
           .map((slot) => ({
             date: response.date || targetDate,
@@ -837,6 +901,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
   async function runAvailabilitySearch(input: {
     targetDate: string
     targetTime: string
+    targetPartySize: number
     source: string
     context: string
     signal?: AbortSignal
@@ -854,12 +919,21 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     const availabilityData = await fetchAvailabilityForDate(
       input.targetDate,
       input.targetTime,
+      input.targetPartySize,
       input.signal
     )
-    const closestTime = pickClosestSlot(availabilityData.time_slots, input.targetTime, partySize)
+    const closestTime = pickClosestSlot(
+      availabilityData.time_slots,
+      input.targetTime,
+      input.targetPartySize
+    )
 
     setDate(input.targetDate)
     setRequestedTime(input.targetTime)
+    // Pin the slot-window anchor at the originally-requested time. Subsequent
+    // slot selections may move `requestedTime`, but the visible window stays put.
+    setSlotWindowAnchorTime(input.targetTime)
+    setShowAllTimes(false)
     setAvailability(availabilityData)
     setSelectedTime(closestTime || '')
     // A new availability response invalidates the previous slot selection.
@@ -867,26 +941,25 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     setStep('choose')
 
     if (!closestTime) {
-      void loadNearestAlternatives(input.targetDate, input.targetTime)
+      void loadNearestAlternatives(input.targetDate, input.targetTime, input.targetPartySize)
     }
   }
 
   async function handleFindTable() {
-    // Sync partySizeDisplay → partySize on submit in case blur hasn't fired
+    // Sync partySizeDisplay → partySize on submit in case blur hasn't fired.
+    // The clamped value is also threaded explicitly through the availability
+    // search so the network request sees the freshly-typed size, not stale state.
     const parsedSize = Number.parseInt(partySizeDisplay, 10)
     const clampedSize = (!Number.isFinite(parsedSize) || parsedSize < 1) ? 1 : Math.min(parsedSize, 20)
     setPartySize(clampedSize)
     setPartySizeDisplay(String(clampedSize))
 
-    // Reject past dates before hitting the API.
-    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
-      const todayMidnight = new Date()
-      todayMidnight.setHours(0, 0, 0, 0)
-      const selectedDate = new Date(date + 'T00:00:00')
-      if (selectedDate < todayMidnight) {
-        setDateError('Please select a future date')
-        return
-      }
+    // Reject past dates before hitting the API. Compared as YYYY-MM-DD strings
+    // against Europe/London today — the customer's browser-local clock is
+    // intentionally ignored.
+    if (isPastLondonDate(date)) {
+      setDateError('Please select a future date')
+      return
     }
 
     // Cancel any in-flight availability request before starting a new one.
@@ -899,11 +972,17 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     setResult(null)
     setAvailabilityLoading(true)
     setAlternativeSlots([])
+    setShowAllTimes(false)
+    // A new availability search starts a new submit-intent. Drop any cached
+    // idempotency key so the next Confirm cannot accidentally dedupe with a
+    // pre-search booking attempt. See spec §13.2.
+    clearSubmitIntentIdempotencyKey()
 
     try {
       await runAvailabilitySearch({
         targetDate: date,
         targetTime: requestedTime,
+        targetPartySize: clampedSize,
         source: 'book_table_find_table',
         context: 'availability_first',
         signal: controller.signal
@@ -991,6 +1070,14 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     })
   }
 
+  function handleRequestedTimeChange(value: string) {
+    markFunnelStart()
+    setRequestedTime(value)
+    setSlotWindowAnchorTime(value)
+    setShowAllTimes(false)
+    setSelectedSlotService(null)
+  }
+
   function handleDateChange(value: string) {
     markFunnelStart()
     setDate(value)
@@ -998,15 +1085,12 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     setAlternativeSlots([])
     setSelectedTime('')
     setSelectedSlotService(null)
+    setShowAllTimes(false)
     if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
-      const todayMidnight = new Date()
-      todayMidnight.setHours(0, 0, 0, 0)
-      const selectedDate = new Date(value + 'T00:00:00')
-      if (selectedDate < todayMidnight) {
-        setDateError('Please select a future date')
-      } else {
-        setDateError(null)
-      }
+      // Past-date validation runs in Europe/London. Do not parse value with
+      // `new Date(...)` for booking validation — that re-introduces the
+      // browser-local timezone bug on travellers outside the UK.
+      setDateError(isPastLondonDate(value) ? 'Please select a future date' : null)
     } else {
       setDateError(null)
     }
@@ -1222,6 +1306,48 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     return slot.kitchen_open === false ? 'drinks' : 'food'
   }
 
+  // Build a stable JSON fingerprint of the meaningful submit-intent fields.
+  // Volatile anti-bot / telemetry fields (`_t`, `turnstile_token`, `website`)
+  // are deliberately excluded — see spec §13.2.
+  function buildSubmitIntentFingerprint(input: {
+    phone: string
+    firstName?: string
+    lastName?: string
+    email?: string
+    date: string
+    time: string
+    partySize: number
+    purpose: 'food' | 'drinks'
+    notes?: string
+  }): string {
+    return JSON.stringify({
+      phone: input.phone.trim(),
+      firstName: input.firstName?.trim() || '',
+      lastName: input.lastName?.trim() || '',
+      email: input.email?.trim() || '',
+      date: input.date,
+      time: input.time,
+      partySize: input.partySize,
+      purpose: input.purpose,
+      notes: input.notes?.trim() || ''
+    })
+  }
+
+  // Reuse the cached idempotency key when the fingerprint matches the previous
+  // submit intent; otherwise mint a new one and replace the cache entry.
+  function getSubmitIntentIdempotencyKey(fingerprint: string): string {
+    if (submitIntentKeyRef.current?.fingerprint === fingerprint) {
+      return submitIntentKeyRef.current.key
+    }
+    const key = createClientIdempotencyKey('tbl_web')
+    submitIntentKeyRef.current = { fingerprint, key }
+    return key
+  }
+
+  function clearSubmitIntentIdempotencyKey() {
+    submitIntentKeyRef.current = null
+  }
+
   async function handleConfirmBooking() {
     setError(null)
     setResult(null)
@@ -1246,7 +1372,24 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     const resolvedFirstName = firstName.trim()
     const resolvedLastName = lastName.trim()
     const resolvedEmail = (isKnownCustomer ? knownCustomer?.email : email.trim()) || undefined
-    const idempotencyKey = createClientIdempotencyKey('tbl_web')
+    const trimmedNotes = notes.trim()
+
+    // Build the submit-intent fingerprint from non-volatile payload fields,
+    // then look up (or mint) the idempotency key. This guarantees that a retry
+    // of the same booking intent reuses the key, while a changed slot or guest
+    // detail forces a new key. See spec §13.2.
+    const idempotencyFingerprint = buildSubmitIntentFingerprint({
+      phone: trimmedPhone,
+      firstName: resolvedFirstName,
+      lastName: resolvedLastName,
+      email: resolvedEmail,
+      date,
+      time: selectedTime,
+      partySize,
+      purpose,
+      notes: trimmedNotes
+    })
+    const idempotencyKey = getSubmitIntentIdempotencyKey(idempotencyFingerprint)
 
     setLoading(true)
 
@@ -1283,7 +1426,9 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
         time: selectedTime,
         party_size: partySize,
         purpose,
-        ...(notes.trim() ? { notes: notes.trim() } : {}),
+        ...(trimmedNotes ? { notes: trimmedNotes } : {}),
+        // Volatile fields below — added after the idempotency key has already
+        // been selected so they cannot influence the submit-intent fingerprint.
         ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
         ...(website ? { website } : {}),
         _t: Math.floor((Date.now() - formLoadedAt.current) / 1000)
@@ -1384,6 +1529,8 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     setPartySizeDisplay(String(defaultPartySize))
     setDate(defaultDate)
     setRequestedTime(defaultRequestedTime)
+    setSlotWindowAnchorTime(defaultRequestedTime)
+    setShowAllTimes(false)
     setSelectedTime('')
     setSelectedSlotService(null)
     setAvailability(null)
@@ -1412,6 +1559,9 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     turnstileRef.current?.reset()
     setWebsite('')
     formLoadedAt.current = Date.now()
+    // Drop the cached submit-intent key so the next booking minted by the
+    // wizard cannot reuse a previous booking's Idempotency-Key. See spec §13.2.
+    clearSubmitIntentIdempotencyKey()
   }
 
   if (selectedSuggestedEvent) {
@@ -1434,7 +1584,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
             <Button
               type="button"
               variant="outline"
-              className="w-full sm:w-auto"
+              className="w-full sm:w-auto min-h-12"
               onClick={() => setSelectedSuggestedEvent(null)}
             >
               Back to table booking
@@ -1474,7 +1624,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
             <p>&#x2022; If anything changes, give us a ring on 01753 682707</p>
           </div>
 
-          <Button type="button" variant="outline" onClick={resetJourney}>
+          <Button type="button" variant="outline" size="lg" onClick={resetJourney}>
             Book another table
           </Button>
         </CardBody>
@@ -1484,6 +1634,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
 
 
   return (
+    <div ref={wizardRef}>
     <Card variant="elevated">
       <CardBody className="space-y-6">
         <BookingProgressBar currentStep={currentStepIndex + 1} totalSteps={STEP_ORDER.length} />
@@ -1520,7 +1671,13 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
         )}
 
         {step === 'find' && (
-          <div className="space-y-4">
+          <form
+            className="space-y-4"
+            onSubmit={(event) => {
+              event.preventDefault()
+              void handleFindTable()
+            }}
+          >
             <div>
               <h3 className="text-lg font-semibold text-anchor-gold-vivid">Find a table</h3>
               <p className="mt-1 text-sm text-anchor-cream-text/70">
@@ -1543,6 +1700,9 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
             <Input
               label="Party Size"
               type="number"
+              size="lg"
+              inputMode="numeric"
+              pattern="[0-9]*"
               min={1}
               max={20}
               required
@@ -1557,18 +1717,22 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                 const clamped = Math.min(Math.max(parsed, 1), 20)
                 setPartySize(clamped)
                 setSelectedSlotService(null)
+                setShowAllTimes(false)
               }}
               onBlur={() => {
                 const parsed = Number.parseInt(partySizeDisplay, 10)
                 const clamped = (!Number.isFinite(parsed) || parsed < 1) ? 1 : Math.min(parsed, 20)
                 setPartySize(clamped)
                 setPartySizeDisplay(String(clamped))
+                setSelectedSlotService(null)
+                setShowAllTimes(false)
               }}
             />
 
             <Input
               label="Date"
               type="date"
+              size="lg"
               min={today}
               required
               value={date}
@@ -1579,12 +1743,10 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
             <Input
               label="Preferred Time"
               type="time"
+              size="lg"
               required
               value={requestedTime}
-              onChange={(event) => {
-                markFunnelStart()
-                setRequestedTime(event.target.value)
-              }}
+              onChange={(event) => handleRequestedTimeChange(event.target.value)}
             />
 
             {(showDateEventSuggestions || selectedDateEventsLoading) &&
@@ -1605,10 +1767,10 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
               </Alert>
             )}
 
-            <Button type="button" fullWidth size="lg" loading={availabilityLoading} onClick={handleFindTable}>
+            <Button type="submit" fullWidth size="lg" loading={availabilityLoading}>
               Find a table
             </Button>
-          </div>
+          </form>
         )}
 
         {step === 'choose' && (
@@ -1625,32 +1787,51 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
             ) : null}
 
             {availableSlots.length > 0 ? (
-              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
-                {availableSlots.map((slot) => {
-                  const isSelected = selectedTime === slot.time
-                  return (
-                    <button
-                      key={slot.time}
-                      type="button"
-                      onClick={() => handleSlotSelect(slot)}
-                      className={`rounded-xl border px-3 py-3 text-center transition-colors ${
-                        isSelected
-                          ? 'border-anchor-gold bg-anchor-gold/15 text-anchor-gold-vivid'
-                          : 'border-anchor-gold/25 bg-anchor-bg-card text-anchor-cream-text hover:border-anchor-gold'
-                      }`}
-                    >
-                      <span className="block text-base font-semibold">
-                        {formatTimeForDisplay(slot.time)}
-                      </span>
-                      {typeof slot.kitchen_open === 'boolean' ? (
-                        <span className="mt-1 block text-xs font-normal text-anchor-cream-text/60">
-                          {slot.kitchen_open ? 'Drinks & food' : 'Drinks only'}
+              <>
+                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
+                  {visibleSlots.map((slot) => {
+                    const isSelected = selectedTime === slot.time
+                    // Combined aria-label so screen readers announce time + service
+                    // as one phrase. When `kitchen_open` is undefined (legacy
+                    // path) we default to "drinks and food" to match the visual
+                    // default.
+                    const serviceCaption = slot.kitchen_open === false ? 'drinks only' : 'drinks and food'
+                    return (
+                      <button
+                        key={slot.time}
+                        type="button"
+                        aria-label={`${formatTimeForDisplay(slot.time)}, ${serviceCaption}`}
+                        onClick={() => handleSlotSelect(slot)}
+                        className={`min-h-14 rounded-xl border px-3 py-3 text-center transition-colors ${
+                          isSelected
+                            ? 'border-anchor-gold bg-anchor-gold/15 text-anchor-gold-vivid'
+                            : 'border-anchor-gold/25 bg-anchor-bg-card text-anchor-cream-text hover:border-anchor-gold'
+                        }`}
+                      >
+                        <span className="block text-base font-semibold">
+                          {formatTimeForDisplay(slot.time)}
                         </span>
-                      ) : null}
-                    </button>
-                  )
-                })}
-              </div>
+                        {typeof slot.kitchen_open === 'boolean' ? (
+                          <span className="mt-1 block text-xs font-normal text-anchor-cream-text/60">
+                            {slot.kitchen_open ? 'Drinks & food' : 'Drinks only'}
+                          </span>
+                        ) : null}
+                      </button>
+                    )
+                  })}
+                </div>
+
+                {!showAllTimes && availableSlots.length > visibleSlots.length ? (
+                  <button
+                    type="button"
+                    onClick={() => setShowAllTimes(true)}
+                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-anchor-gold/30 px-4 py-3 text-base font-medium text-anchor-gold-vivid transition-colors hover:border-anchor-gold hover:bg-anchor-gold/5 focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 sm:w-auto sm:px-6"
+                  >
+                    See more times
+                    <ChevronDown aria-hidden="true" className="h-4 w-4" />
+                  </button>
+                ) : null}
+              </>
             ) : (
               <Alert variant="warning" title="No online times available">
                 <p>
@@ -1689,7 +1870,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                         key={`${option.date}-${option.time}`}
                         type="button"
                         onClick={() => handleChooseAlternative(option)}
-                        className="flex w-full items-center justify-between rounded-lg border border-anchor-gold/25 bg-anchor-bg-card px-3 py-2 text-left text-sm hover:border-anchor-gold"
+                        className="flex min-h-12 w-full items-center justify-between rounded-lg border border-anchor-gold/25 bg-anchor-bg-card px-3 py-3 text-left text-base hover:border-anchor-gold"
                       >
                         <span className="font-medium text-anchor-cream-text/80">{formatDateForDisplay(option.date)}</span>
                         <span className="text-anchor-gold-vivid font-semibold">{formatTimeForDisplay(option.time)}</span>
@@ -1704,7 +1885,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                   <p className="font-semibold">Join waitlist</p>
                   <p className="mt-1">Call us and we'll add you to the waitlist for cancellations.</p>
                   <div className="mt-2">
-                    <Button asChild size="sm" variant="secondary">
+                    <Button asChild size="sm" variant="secondary" className="min-h-12">
                       <a href="tel:+441753682707">Join waitlist by phone</a>
                     </Button>
                   </div>
@@ -1713,7 +1894,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
             )}
 
             <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
-              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleBackToFind}>
+              <Button type="button" variant="outline" className="w-full sm:w-auto min-h-12" onClick={handleBackToFind}>
                 Back
               </Button>
 
@@ -1721,6 +1902,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                 <Button
                   type="button"
                   variant="primary"
+                  size="lg"
                   className="w-full sm:w-auto"
                   onClick={() => {
                     setStep('details')
@@ -1747,6 +1929,9 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
               <Input
                 label="Mobile Number"
                 type="tel"
+                size="lg"
+                inputMode="tel"
+                autoComplete="tel"
                 required
                 value={phone}
                 disabled={detailsUnlocked}
@@ -1763,7 +1948,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                   <Button
                     type="button"
                     size="md"
-                    className="w-full sm:w-auto"
+                    className="w-full sm:w-auto min-h-12"
                     loading={lookupState === 'loading'}
                     onClick={handlePhoneLookup}
                   >
@@ -1774,7 +1959,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                     type="button"
                     size="md"
                     variant="outline"
-                    className="w-full sm:w-auto"
+                    className="w-full sm:w-auto min-h-12"
                     onClick={resetPhoneLookup}
                   >
                     Use Different Number
@@ -1804,6 +1989,8 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                 <Input
                   label="First Name"
                   type="text"
+                  size="lg"
+                  autoComplete="given-name"
                   required
                   value={firstName}
                   onChange={(event) => setFirstName(event.target.value)}
@@ -1812,6 +1999,8 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                 <Input
                   label="Last Name"
                   type="text"
+                  size="lg"
+                  autoComplete="family-name"
                   required
                   value={lastName}
                   onChange={(event) => setLastName(event.target.value)}
@@ -1821,6 +2010,9 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                   <Input
                     label="Email (optional)"
                     type="email"
+                    size="lg"
+                    inputMode="email"
+                    autoComplete="email"
                     value={email}
                     onChange={(event) => setEmail(event.target.value)}
                     placeholder="name@example.com"
@@ -1840,12 +2032,12 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
             ) : null}
 
             <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
-              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleBackToChoose}>
+              <Button type="button" variant="outline" className="w-full sm:w-auto min-h-12" onClick={handleBackToChoose}>
                 Back
               </Button>
 
               {detailsUnlocked ? (
-                <Button type="button" variant="primary" className="w-full sm:w-auto" onClick={handleContinueToReview}>
+                <Button type="button" variant="primary" size="lg" className="w-full sm:w-auto" onClick={handleContinueToReview}>
                   Continue to review
                 </Button>
               ) : null}
@@ -1980,7 +2172,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                 )}
 
                 {paymentState !== 'confirmed' && (
-                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={resetJourney}>
+                  <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={resetJourney}>
                     Start a new booking
                   </Button>
                 )}
@@ -2012,7 +2204,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                   />
                 )}
 
-                <label className="flex items-start gap-2 text-sm text-anchor-cream-text/70">
+                <label className="flex min-h-12 items-start gap-2 py-2 text-sm text-anchor-cream-text/70">
                   <input
                     type="checkbox"
                     checked={policyAccepted}
@@ -2025,12 +2217,13 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                 </label>
 
                 <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
-                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setStep('details')}>
+                  <Button type="button" variant="outline" className="w-full sm:w-auto min-h-12" onClick={() => setStep('details')}>
                     Back
                   </Button>
                   <Button
                     type="button"
                     variant="primary"
+                    size="lg"
                     className="w-full sm:w-auto"
                     loading={loading}
                     disabled={TURNSTILE_SITE_KEY ? !turnstileToken : false}
@@ -2045,5 +2238,6 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
         )}
       </CardBody>
     </Card>
+    </div>
   )
 }
diff --git a/config/redirects/additional-redirects.json b/config/redirects/additional-redirects.json
index 1506088..a08c6b2 100644
--- a/config/redirects/additional-redirects.json
+++ b/config/redirects/additional-redirects.json
@@ -485,5 +485,10 @@
     "source": "/private-hire/weddings",
     "destination": "/private-hire",
     "permanent": true
+  },
+  {
+    "source": "/hr",
+    "destination": "/",
+    "permanent": true
   }
 ]
diff --git a/config/redirects/drinks-redirects.json b/config/redirects/drinks-redirects.json
index 7e23fce..8154953 100644
--- a/config/redirects/drinks-redirects.json
+++ b/config/redirects/drinks-redirects.json
@@ -373,10 +373,5 @@
     "source": "/drinks/havana-club-3",
     "destination": "/drinks",
     "permanent": true
-  },
-  {
-    "source": "/drinks/baby-guinness",
-    "destination": "/drinks",
-    "permanent": true
   }
 ]
diff --git a/lib/table-booking-service-windows.ts b/lib/table-booking-service-windows.ts
index 7eb5134..ef4655f 100644
--- a/lib/table-booking-service-windows.ts
+++ b/lib/table-booking-service-windows.ts
@@ -52,25 +52,31 @@ export function toTimeString(totalMinutes: number): string {
   return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
 }
 
-export function londonNowParts(): { isoDate: string; minutes: number } {
-  const formatter = new Intl.DateTimeFormat('en-CA', {
+export function londonIsoDate(date: Date = new Date()): string {
+  return new Intl.DateTimeFormat('en-CA', {
     timeZone: 'Europe/London',
     year: 'numeric',
     month: '2-digit',
-    day: '2-digit',
+    day: '2-digit'
+  }).format(date)
+}
+
+export function londonNowParts(): { isoDate: string; minutes: number } {
+  const formatter = new Intl.DateTimeFormat('en-CA', {
+    timeZone: 'Europe/London',
     hour: '2-digit',
     minute: '2-digit',
     hour12: false
   })
 
-  const parts = formatter.formatToParts(new Date())
+  const now = new Date()
+  const parts = formatter.formatToParts(now)
   const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
-  const isoDate = `${map.year}-${map.month}-${map.day}`
   const hours = Number.parseInt(map.hour || '0', 10)
   const minutes = Number.parseInt(map.minute || '0', 10)
 
   return {
-    isoDate,
+    isoDate: londonIsoDate(now),
     minutes: hours * 60 + minutes
   }
 }
diff --git a/lib/table-booking-slot-window.ts b/lib/table-booking-slot-window.ts
new file mode 100644
index 0000000..ae9f902
--- /dev/null
+++ b/lib/table-booking-slot-window.ts
@@ -0,0 +1,51 @@
+import type { TableAvailabilitySlot } from '@/lib/api'
+import { isValidTime, normalizeTime, toMinutes } from '@/lib/table-booking-service-windows'
+
+export const DEFAULT_SLOT_WINDOW_SIZE = 7
+
+export function pickSlotWindow<T extends Pick<TableAvailabilitySlot, 'time'>>(
+  slots: T[],
+  requestedTime: string,
+  size: number = DEFAULT_SLOT_WINDOW_SIZE
+): T[] {
+  if (size <= 0) {
+    return []
+  }
+
+  if (slots.length <= size) {
+    return slots
+  }
+
+  const normalizedRequestedTime = normalizeTime(requestedTime)
+  if (!isValidTime(normalizedRequestedTime)) {
+    return slots.slice(0, size)
+  }
+
+  const requestedMinutes = toMinutes(normalizedRequestedTime)
+  let centerIndex = 0
+  let bestDistance = Number.POSITIVE_INFINITY
+
+  slots.forEach((slot, index) => {
+    const distance = Math.abs(toMinutes(slot.time) - requestedMinutes)
+    if (distance < bestDistance) {
+      bestDistance = distance
+      centerIndex = index
+    }
+  })
+
+  const half = Math.floor(size / 2)
+  let start = centerIndex - half
+  let end = start + size
+
+  if (start < 0) {
+    end += -start
+    start = 0
+  }
+
+  if (end > slots.length) {
+    start = Math.max(0, start - (end - slots.length))
+    end = slots.length
+  }
+
+  return slots.slice(start, end)
+}
diff --git a/tasks/gsc-indexing-fix/REVIEW-PACK.md b/tasks/gsc-indexing-fix/REVIEW-PACK.md
new file mode 100644
index 0000000..e4908c1
--- /dev/null
+++ b/tasks/gsc-indexing-fix/REVIEW-PACK.md
@@ -0,0 +1,397 @@
+# GSC Indexing — Third-Party Review Pack
+
+**Prepared:** 2026-04-30
+**Repo:** `OJ-The-Anchor.pub` (Next.js 14 marketing/booking site for The Anchor pub, Stanwell Moor)
+**Last code change for this work:** commit [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) on `main`
+**GSC export consumed:** `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (0..7)/` — exported 2026-04-29
+
+This pack is for an external reviewer. Everything here is intended to stand alone — links to source files, line numbers, dates, and confidence levels are included so the reviewer can independently verify each claim.
+
+The Anchor's website indexing problems are not new. Prior attempts (see §2) have made progress but left some categories stuck. This document covers the full picture, what just shipped, what's still open, and where I'm uncertain.
+
+---
+
+## 1. Executive summary (plain English)
+
+Google Search Console exported 596 URLs across 8 indexing-status categories on 2026-04-29.
+
+Of those 596:
+
+- **≈ 277** are Google reporting redirects, canonical tags, or stale historical state working correctly. No code change needed.
+- **4 real, actionable issues** in code were fixed today and pushed to `main` ([`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6)). They will resolve once the deploy lands and Google re-crawls.
+- **3 items are not fully resolved.** One needs investigation after the next re-crawl, one is an external/legacy reference that can't be fixed in code (confirmed by prior reviews), and one cohort of ~116 URLs is "Google chose not to index" — a content-quality issue, not a code bug.
+
+Honest assessment of confidence: I am **highly confident** in the four shipped fixes (verified against built output). I am **moderately confident** that they will resolve the categories I claim. I am **low confidence** that the 7 "Redirect error" cohort will clear without further work — I deferred that and would welcome a reviewer's view on whether to dig in now or wait.
+
+---
+
+## 2. Prior fix attempts (context for the reviewer)
+
+The Anchor has had ongoing GSC indexing issues for at least a year. There are **147 SEO/redirect/robots/sitemap-tagged commits** in the git log since 2025-05-01. The most recent and most relevant:
+
+| Date | Commit | Summary |
+|---|---|---|
+| 2026-04-30 | [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) | **This session.** Four GSC fixes: robots `/*?dpl=*` removed, events redirect to `/whats-on`, drinks/baby-guinness conflict resolved, `/hr` redirect added. |
+| 2026-04-30 | `c28d298` | Eliminated duplicate `@id: /#business` JSON-LD declarations across 23 files (separate problem, also from this session). |
+| 2026-04-30 | `d56cfaf` | Sunday-lunch FAQPage duplicate fix (separate, this session). |
+| 2026-04-21 | `6181bbd` | **Prior robots.txt attempt.** Added `/_next/static/` to allow list. Did **not** remove `/*?dpl=*` — that's the gap I closed today. |
+| 2026-04-21 | `1079fb5` | Removed test pages, fixed redirect chains, cleaned duplicate redirects. |
+| 2026-04-12 | `2084315` | Consolidated thin blog tag pages via 301 redirects (added many of the redirects I confirmed are working today). |
+| 2026-03-02 | `689589e` | Resolved earlier GSC 404s and meta description issues. |
+| 2026-02-23 | `a9acca3` | Hardened redirects, unified hero templates. |
+| 2026-02-18 | `bf1959b1` | Added the catch-block redirect on `/events/[id]` for missing events; also added `/*?dpl=*` to robots disallow (the rule I just removed). |
+| 2026-01-27 | `5017e9c` | Earlier GSC indexing fix sweep. |
+
+Prior third-party (Codex) reviews on the same problem space, located in `tasks/codex-qa-review/`:
+
+- `2026-04-12-gsc-coverage-fix-*` — five reports investigating an earlier GSC spec
+- `2026-04-21-seo-growth-plan-implementation-review-pack.md` — full SEO growth plan review
+- `2026-04-11-event-redirect-*` — reviews of the events redirect work
+
+**Key historical finding (from the 2026-04-12 Codex review):** the broken image URL `/images/page-headers/drinks/optimized/drinks-1920w` was confirmed not to exist anywhere in the codebase. Codex concluded it's a legacy Wix reference Google still has cached, not a fixable code issue. I'm treating that conclusion as authoritative — see §6.
+
+---
+
+## 3. The full set of problems
+
+596 URLs reported by GSC on 2026-04-29, broken down by category and pattern. All counts are derived directly from the Table.csv in each export folder.
+
+### 3.1 Page with redirect — 221 URLs
+
+URLs that returned a redirect when crawled. The `Last crawled` column shows when Google last hit them.
+
+| Pattern | Count | Source | Status |
+|---|---|---|---|
+| `/blog/tag/*` redirects | 120 | `config/redirects/tag-redirects.json` consolidates synonym tags | **Working as designed.** GSC will drop these as it re-crawls. |
+| `/post/*` (Wix legacy) | 28 | `config/redirects/blog-redirects.json` | **Working as designed.** |
+| `/blog/page/*` paginated | 8 | `config/redirects/additional-redirects.json` | **Working as designed.** |
+| `/event-details/*` (legacy) | 6 | `config/redirects/legacy-redirects.json` + wix | **Working as designed.** |
+| Various dated `/events/*` | 12 | `config/redirects/additional-redirects.json` | **Working as designed.** |
+| `/drinks/*` retired SKUs | 9 | `config/redirects/drinks-redirects.json` | **Working as designed.** |
+| HTTP→HTTPS / apex→www | 4 | `middleware.ts` lines 16–25 | **Working as designed.** |
+| Other one-offs | 34 | various | **Working as designed.** |
+
+### 3.2 Blocked by robots.txt — 137 URLs
+
+| Pattern | Count | Status |
+|---|---|---|
+| `/_next/static/css/HASH.css?dpl=DEPLOY_ID` | 106 | **Was blocked by `/*?dpl=*` rule. Fixed in [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6).** |
+| `/api/calendar/event/...` | 21 | **Correctly blocked by `/api/` rule. No fix needed.** |
+| `/test-*`, `/debug-*`, `/components`, `/gtm-debug`, `/demo-header`, `/p5-demo` | 11 | **Stale GSC report.** None match any current `disallow` rule in `app/robots.ts`. The pages don't exist — they likely return 404 today. Will drop on re-crawl. |
+
+### 3.3 Excluded by 'noindex' tag — 57 URLs
+
+| Pattern | Count | Status |
+|---|---|---|
+| `/blog/<slug>` posts with `noindex: true` frontmatter | 52 | **By design.** Spot-checked 5 (`unique-events`, `day-of-the-dead-halloween-party-costumes-dance-and`, `national-burger-day`, `british-pie-week-2024`, `calling-all-pool-players`) — all confirmed `noindex: true` in their frontmatter. Author opt-in is the documented mechanism at `app/blog/[slug]/page.tsx:140`. |
+| `/post/*` (Wix legacy) | 2 | Stale — these now redirect. |
+| `/booking-confirmation` | 1 | Stale — page now does `redirect('/book-table')` (file `app/booking-confirmation/page.tsx`). |
+| `/event-details/*` | 1 | Stale — redirected. |
+| `/events/st-patricks-day-2026` | 1 | Past event. |
+
+### 3.4 Not found (404) — 30 URLs
+
+| Pattern | Count | Status |
+|---|---|---|
+| `/blog/tag/*` | 17 | **Stale.** All 17 have redirects in code today. Last crawl of each was *before* the redirect was added. Confirmed by cross-referencing `Last crawled` against `git blame` on `tag-redirects.json` and `additional-redirects.json` (see §4 for evidence). Will resolve on re-crawl + GSC "Validate fix". |
+| `/events/*` (dated 2026-XX-XX + slugless `karaoke`/`drag-shows`/`quiz-night`) | 10 | **Now redirects.** [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) modified `app/events/[id]/page.tsx` to `permanentRedirect('/whats-on')` on draft/missing events. Verified compiled `page.js` contains 3× `permanentRedirect("/whats-on")` calls. |
+| `/hr` | 1 | **Now redirects to `/`** via [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6). |
+| `/post/<slug>` | 1 | Stale (covered by Wix redirects). |
+| `/images/page-headers/drinks/optimized/drinks-1920w` | 1 | **Cannot fix from code.** Confirmed non-existent in repo by prior Codex review (`tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-assumption-breaker-report.md` §2). Legacy Wix image URL Google still has cached. |
+
+### 3.5 Crawled — currently not indexed — 116 URLs
+
+These were crawled successfully and Google chose not to index. This is a **content-quality signal**, not a technical error.
+
+| Pattern | Count | Likely cause |
+|---|---|---|
+| `/blog/tag/*` (consolidated thin tags) | 22 | Tag pages with 1–2 posts |
+| `/post/*` (Wix legacy) | 16 | Old URLs, redirected, Google slow to drop |
+| `/event-details/*` (legacy) | 11 | Same |
+| `/events/*` past dates | ~25 | Past events; expected to fall out |
+| Individual `/blog/*` posts | ~30 | Older posts with low engagement |
+| `/drinks/*` retired SKUs | 5 | Same as drinks-redirects |
+| Misc one-offs | ~7 | Mostly UTM/query variants |
+
+**Status:** unaddressed in this session beyond the redirect fixes. Most will resolve naturally as the redirected ones drop out and past events expire from the API. Anything left after that is a content quality task — out of scope for a redirect/config audit.
+
+### 3.6 Alternative page with proper canonical tag — 11 URLs
+
+UTM-tagged or query-string variants where the canonical correctly points at the parent URL. Working as designed; no action.
+
+### 3.7 Redirect error — 7 URLs
+
+| URL | Redirect destination | Redirect added | Last crawled |
+|---|---|---|---|
+| `https://www.the-anchor.pub/blog/tag/premier-league` | `/blog/tag/sports` | 2025-12-28 (`tag-redirects.json`) | 2026-01-23 |
+| `https://www.the-anchor.pub/blog/tag/rugby` | `/blog/tag/sports` | 2025-12-28 | 2026-01-20 |
+| `https://www.the-anchor.pub/blog/tag/dog-friendly` | `/blog/tag/community` | 2025-12-28 | 2026-01-07 |
+| `https://www.the-anchor.pub/blog/tag/pet-friendly` | `/blog/tag/community` | 2025-07-16 | 2026-01-18 |
+| Apex variants of `pet-friendly`, `premier-league`, `rugby` | (same) | (same) | 2026-01-05 to 2026-01-23 |
+
+All four destinations (`community`, `sports`) are live tag pages with posts. Redirects existed at crawl time. **Root cause unknown.**
+
+Hypotheses (in order of plausibility):
+1. Apex variants double-hop: `the-anchor.pub` → `www.the-anchor.pub` (middleware) → `/blog/tag/<destination>` (next.config redirect). Google sometimes flags 2-hop chains.
+2. Transient response failure / timeout at crawl time on the destination page.
+3. Cache-related issue at Vercel edge.
+
+**Status: deferred.** I want to see if these clear after the next re-crawl following [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6). If they don't, options are (a) flatten the apex variants to single-hop edge redirects, (b) instrument the destination pages for timeout monitoring.
+
+### 3.8 Discovered — currently not indexed — 17 URLs
+
+Found via sitemap, not yet crawled. Mostly recent additions: 5× `/private-hire/near/*` programmatic landmark pages, 6× recent blog posts, and 6 individual one-offs. **Normal for new content.** Re-check in 30 days.
+
+---
+
+## 4. Evidence cross-reference table — verifying which "404" reports are stale
+
+This table is the single most important evidence in this document. It shows, for the 17 tag-URLs marked "Not found (404)", that the redirect was added *after* Google's last crawl — i.e. the live site is no longer 404'ing them.
+
+| Slug | Redirect destination | Redirect added (commit) | Last crawled | Stale? |
+|---|---|---|---|---|
+| mental-health | community | 2026-03-02 (`689589e3`) | 2026-02-17 | YES |
+| cider | food-and-drink | 2026-03-02 | 2026-02-17 | YES |
+| feedback | community | 2026-03-02 | 2026-02-17 | YES |
+| children | community | 2026-03-02 | 2026-02-03 | YES |
+| private-dining | events | 2026-03-02 | 2026-01-26 | YES |
+| live-matches | sports | 2026-03-02 | 2026-01-22 | YES |
+| terrestrial-sport | sports | 2026-03-02 | 2026-01-22 | YES |
+| cash-prizes | events | 2026-03-02 | 2026-01-20 | YES |
+| traditional | community | 2026-03-02 | 2026-01-20 | YES |
+| family | community | 2026-03-02 | 2026-01-20 | YES |
+| british-history | community | 2026-03-02 | 2026-01-19 | YES |
+| pub-menu | food-and-drink | 2026-03-02 | 2026-01-19 | YES |
+| annual-celebrations | seasonal | 2026-03-02 | 2026-01-19 | YES |
+| mexican-culture | food-and-drink | 2026-03-02 | 2026-01-19 | YES |
+| local-area | community | 2026-03-02 | 2026-01-18 | YES |
+| lunch | food-and-drink | 2026-03-02 | 2026-01-06 | YES |
+| craft-beer | food-and-drink | 2025-12-29 (in `additional-redirects.json`) | 2025-11-15 | YES |
+
+**How to verify:** for any row, run
+
+```
+git blame --date=short config/redirects/tag-redirects.json | grep -B2 -A2 '"<slug>"'
+```
+
+against the slug, and compare the committer date to the `Last crawled` value in the GSC export at `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (3)/Table.csv`.
+
+---
+
+## 5. What I shipped this session
+
+Four code changes, one PR, pushed as commit [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) on `main`.
+
+### 5.1 `app/robots.ts` — removed `/*?dpl=*` from disallow list
+
+**Before:** `disallow: ['/api/', '/_next/data/', '/*?dpl=*', '/_serverless/', ...]`
+**After:** `disallow: ['/api/', '/_next/data/', '/_serverless/', ...]`
+
+**Why:** the wildcard matched any URL containing `?dpl=`, including the static CSS/JS assets Vercel auto-tags with `?dpl=<deployment-id>` for cache busting. The `allow: /_next/static/` rule on line 8 was being overridden by this more-specific disallow. 106 stylesheet URLs were being marked "Blocked by robots.txt".
+
+**Why this wasn't caught in commit `6181bbd` on 2026-04-21:** that fix added `_next/static/` to the allow list but didn't remove the more-specific dpl wildcard. In Google's robots.txt parser the more-specific match wins.
+
+**Verification (high confidence):**
+- `cat .next/server/app/robots.txt.body` after build shows the dpl line is gone.
+- The static assets remain `noindex,nofollow` via the `X-Robots-Tag` header set in `next.config.js:130-141` — so they won't suddenly appear in search.
+- The canonical tags on every HTML page handle deployment-pinned URL dedup independently.
+
+**Risk:** very low. The X-Robots-Tag header is the correct tool for "don't index this asset URL"; robots.txt is the wrong tool because Googlebot needs to *fetch* the asset to render the page. That's exactly what the dpl rule was preventing.
+
+**Resolves:** 106 URLs in §3.2.
+
+### 5.2 `app/events/[id]/page.tsx` — drafts and missing events redirect to `/whats-on`
+
+**Before:**
+```ts
+const status = normalizeEventStatus(event)
+if (status === 'draft') {
+  notFound()  // returns 404
+}
+```
+
+**After:**
+```ts
+if (!event) {
+  permanentRedirect('/whats-on')
+}
+
+const status = normalizeEventStatus(event)
+if (status === 'draft') {
+  permanentRedirect('/whats-on')  // returns 308
+}
+```
+
+Also removed unused `notFound` import.
+
+**Why:** the existing catch block at lines 234–236 already redirects when `anchorAPI.getEvent()` throws, but two failure modes weren't covered:
+- `anchorAPI.getEvent()` returning a falsy value without throwing (defensive — TypeScript types say it never does, but the call path is non-trivial).
+- Events that exist in the API but have `status === 'draft'`. Those returned 404; now they redirect.
+
+**Verification (medium-high confidence):**
+- Compiled `.next/server/app/events/[id]/page.js` contains 3× `permanentRedirect("/whats-on")` (catch block + draft + safety net).
+- I have **not** end-to-end tested a missing-event request against the deployed build because we haven't deployed yet. The compiled output has the right code; the runtime behaviour will need to be confirmed once deployed.
+
+**A failed earlier attempt during this session (transparency):** I first tried adding `app/events/[id]/not-found.tsx` calling `permanentRedirect('/whats-on')`. It compiled clean but Next.js silently dropped the file from the build output (I confirmed `EventNotFound` doesn't appear in any `.next/server/**/*.js`). My hypothesis is that Next.js requires `not-found.tsx` to render UI for the 404 status code — a pure-redirect implementation gets tree-shaken or rejected. I then deleted the file and used the page.tsx approach instead, which the build does compile. I'm flagging this in case the reviewer has direct experience with Next.js 14 not-found behaviour.
+
+**Resolves:** up to 10 URLs in §3.4.
+
+### 5.3 `config/redirects/drinks-redirects.json` — removed `/drinks/baby-guinness` rule
+
+**Before:**
+```json
+{ "source": "/drinks/baby-guinness", "destination": "/drinks", "permanent": true }
+```
+
+**After:** entry deleted.
+
+**Why:** `app/sitemap.ts:110` declares `/drinks/baby-guinness` as a canonical URL **and** the page exists at `app/drinks/baby-guinness/page.tsx`. The redirect rule was contradicting the sitemap and the page. GSC reported the URL as "Discovered — currently not indexed" (i.e. found via sitemap, not yet crawled), so Google had not yet observed the contradiction — but it would have on next crawl.
+
+**Audit follow-on completed:** I scanned all 76 entries in `drinks-redirects.json` against the 2 drinks paths declared in `app/sitemap.ts`. Only `/drinks/baby-guinness` was a contradiction. `/drinks/managers-special` is in the sitemap and not in drinks-redirects, so no conflict. No other entries needed changing.
+
+**Verification (high confidence):**
+- `routes-manifest.json` after rebuild shows zero redirect entries with source `/drinks/baby-guinness`.
+- Static page exists at `.next/server/app/drinks/baby-guinness.html`.
+
+**Resolves:** 1 URL.
+
+### 5.4 `config/redirects/additional-redirects.json` — added `/hr → /`
+
+```json
+{ "source": "/hr", "destination": "/", "permanent": true }
+```
+
+**Why:** `/hr` was returning 404 (no page in `app/hr/`, no redirect rule). Following the convention used by other retired URLs (`/join-the-team`, `/honey-bee-mine`, etc.) which all redirect to `/`, I added the same.
+
+**Verification (high confidence):** `routes-manifest.json` after rebuild contains `{ "source": "/hr", "destination": "/", "statusCode": 301, ... }`.
+
+**Resolves:** 1 URL.
+
+---
+
+## 6. What's still open
+
+### 6.1 The 7 "Redirect error" tag URLs (§3.7)
+
+**Status:** deferred. Redirects exist in code; root cause unknown.
+
+**My recommendation:** wait for the next Google re-crawl after [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) deploys. If they clear, no action. If they don't, investigate by:
+1. Manually testing the apex→consolidated redirect chain for each affected slug (e.g. `curl -I https://the-anchor.pub/blog/tag/premier-league` and follow redirects, check status codes).
+2. Looking at Vercel function logs around the GSC crawl times for any 5xx or timeout responses on those URLs.
+3. Considering whether to flatten the 2-hop redirects.
+
+**Reviewer question:** Is there value in pre-emptively investigating now, or is "wait and see" the right call?
+
+### 6.2 The broken image URL `/images/page-headers/drinks/optimized/drinks-1920w` (§3.4)
+
+**Status:** confirmed unfixable from code by a prior Codex review (`tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-assumption-breaker-report.md` §2). I verified independently:
+- `grep -rn "drinks-1920w"` across `app/`, `components/`, `lib/`, `content/`, `public/` — no matches except in prior review docs.
+- `public/images/page-headers/drinks/` exists; `public/images/page-headers/drinks/optimized/` does not.
+
+This is an external/legacy URL Google cached. It will drop from GSC once Google stops re-crawling it.
+
+**No action available.**
+
+### 6.3 The 116 "Crawled — currently not indexed" URLs (§3.5)
+
+**Status:** unaddressed in this session.
+
+**Analysis:** these aren't a code bug. Google fetched the pages, parsed them, and decided not to index. The most common causes for this status are:
+- Thin content (tag pages with 1–2 posts)
+- Duplicate content (similar to other indexed pages)
+- Stale or low-engagement pages
+- Past events / time-bound content
+
+**Likely path forward:**
+- ~50 URLs are past events / Wix legacy → will drop naturally as the redirects ([5.2](#52-appeventsidpagetsx--drafts-and-missing-events-redirect-to-whats-on) above) take effect.
+- ~22 thin tag pages → would need content consolidation (write more posts under those tags, or noindex the thin ones).
+- ~30 individual blog posts → case-by-case content review.
+
+**Reviewer question:** is this worth expanding into a content-quality task, or is "let the redirects do their work and revisit in 60 days" the right call?
+
+### 6.4 Out-of-scope clean-ups noticed during discovery
+
+These weren't part of the original GSC categories but I noticed them during the audit. Surfaced for the reviewer's awareness; not actioned.
+
+- `next.config.js` loads 6 redirect JSON files merging to **647 rules** (after my +1 / −1). At some scale this becomes a maintenance and cold-start concern. Vercel's documented soft limit is around 1,024 redirects before edge-function performance starts to degrade.
+- `app/blog/tag/[tag]/page.tsx:73-75` calls `permanentRedirect('/blog/tags')` if a tag has no posts. This relies on `dynamicParams` defaulting to true and the page reaching the redirect at runtime. It works in theory; a small refactor to put unknown tags in the explicit redirect file would make the behaviour more deterministic.
+
+---
+
+## 7. Files for the reviewer to inspect
+
+To independently verify everything in this document:
+
+| File | Why |
+|---|---|
+| `app/robots.ts` | Confirm `/*?dpl=*` is gone; allow list contains `/_next/static/`. |
+| `app/events/[id]/page.tsx` lines 232–250 | Confirm catch-block redirect, falsy-event redirect, and draft redirect. |
+| `config/redirects/drinks-redirects.json` | Confirm no `/drinks/baby-guinness` entry. |
+| `config/redirects/additional-redirects.json` last 5 lines | Confirm `/hr → /` rule. |
+| `app/sitemap.ts:110` | Confirm `/drinks/baby-guinness` declared canonical. |
+| `app/blog/[slug]/page.tsx:140` | Confirm `noindex` mechanism for blog posts. |
+| `app/blog/tag/[tag]/page.tsx:73-75` | Confirm tag-with-no-posts behaviour. |
+| `middleware.ts:16-25` | Confirm apex→www redirect. |
+| `next.config.js:130-141` | Confirm `X-Robots-Tag: noindex,nofollow` on `/_next/static/*`. |
+| `tasks/gsc-indexing-fix/SPEC.md` | The discovery spec produced earlier in this session (now superseded by this review pack but useful for audit trail). |
+| `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (0..7)/` | Source data — Table.csv per category. |
+| `tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-*.md` | Prior third-party review of the same problem space. |
+
+To verify the 17 stale tag 404s:
+```
+python3 -c "
+import csv
+from urllib.parse import urlparse
+p = 'temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (3)/Table.csv'
+with open(p) as f:
+    rdr = csv.reader(f); next(rdr, None)
+    for r in rdr:
+        path = urlparse(r[0]).path
+        if path.startswith('/blog/tag/'):
+            print(r[1], path)
+"
+```
+
+…and cross-reference each with `git blame --date=short config/redirects/tag-redirects.json`.
+
+---
+
+## 8. Where I might be wrong (explicit list of risks)
+
+1. **The events page change might not actually fix the 7 dated-event 404s.** Those events were last crawled between Feb 19 and Apr 16, after the Feb 18 catch-block redirect was added. The catch block already redirects on API errors, so my added `if (!event)` and `if (status === 'draft')` redirects are belt-and-braces. The actual reason Google saw 404 is still unknown — could be SSG-prerendered stale HTML for events that existed at build time but were deleted from the API. I want a reviewer's view on whether to also clean the SSG cache for missing events.
+
+2. **The robots.txt fix relies on Google re-fetching `robots.txt`.** Google caches it for ~24 hours. The 106 URLs won't update in GSC until a re-crawl after the re-fetch.
+
+3. **My "stale GSC report" claim depends on Google re-crawling.** If for some reason these URLs aren't re-crawled (low-priority pages), the GSC report won't update even though the live site behaves correctly. Validation in GSC's "Validate fix" UI nudges Google to re-prioritise.
+
+4. **I have not deployed yet.** All verification above is against the local build (`.next/`). Actual production behaviour will need to be re-verified once Vercel deploys [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6).
+
+5. **The not-found.tsx misadventure (5.2) is unresolved as a question.** I worked around it by editing `page.tsx` instead, but I don't fully understand why my `not-found.tsx` was dropped from the build. If the reviewer has Next.js 14 expertise, an explanation would be welcome.
+
+---
+
+## 9. Verification plan after deploy
+
+Once [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) is live (typically 2–5 min from push):
+
+1. Fetch live `https://www.the-anchor.pub/robots.txt` and confirm no `Disallow: /*?dpl=*` line.
+2. Fetch `https://www.the-anchor.pub/_next/static/css/<HASH>.css?dpl=<DEPLOY_ID>` for any current CSS hash and confirm it returns 200 (not 403/blocked).
+3. Fetch `https://www.the-anchor.pub/events/quiz-night-2026-12-02` (or any of the §3.4 missing-event URLs) and confirm a 308 to `/whats-on`.
+4. Fetch `https://www.the-anchor.pub/drinks/baby-guinness` and confirm 200 with the actual page content.
+5. Fetch `https://www.the-anchor.pub/hr` and confirm 308 to `/`.
+6. In GSC → Page indexing, click "Validate fix" on these four reports:
+   - Page with redirect
+   - Blocked by robots.txt
+   - Not found (404)
+   - Excluded by 'noindex' tag
+7. Wait 14 days for Google to re-crawl, then re-export GSC drilldowns and rerun the discovery script in `tasks/gsc-indexing-fix/SPEC.md` to see the new shape.
+
+---
+
+## 10. Open questions for the reviewer
+
+1. The deferred 7 "Redirect error" URLs (§6.1) — investigate now or wait?
+2. The 116 "Crawled — currently not indexed" (§6.3) — content task or accept?
+3. The Next.js 14 `not-found.tsx` behaviour (§5.2 / §8.5) — any insight on why a redirect-only `not-found.tsx` was silently dropped?
+4. Anything in the prior third-party reviews (`tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-*`) that's still relevant and not addressed by what's been done since?
+5. Anything missing from this audit that you'd expect to see?
diff --git a/tasks/gsc-indexing-fix/SPEC.md b/tasks/gsc-indexing-fix/SPEC.md
new file mode 100644
index 0000000..e7c91eb
--- /dev/null
+++ b/tasks/gsc-indexing-fix/SPEC.md
@@ -0,0 +1,243 @@
+# GSC Indexing Fix — Discovery & Spec
+
+**Source data:** `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (0..7)/Table.csv`
+**Pages flagged:** 596 across 8 GSC categories
+**Date of GSC export:** 2026-04-29
+**Last revised:** 2026-04-30 (verified findings against git history; B3 reclassified)
+
+This spec is for review. **Nothing has been changed yet.** Each finding cites evidence (URL counts, file paths, line numbers, dates); each proposal is sized so it can be approved, deferred, or rejected independently.
+
+---
+
+## Verification log (2026-04-30)
+
+Before recommending any fix, I cross-referenced each cohort's "Last crawled" date in GSC with `git log` / `git blame` on the relevant config files. This caught one wrong recommendation in the original draft:
+
+- **B3 (17 tag URLs marked 404):** all 17 are *already* redirected in `config/redirects/tag-redirects.json` (16) or `config/redirects/additional-redirects.json` (1). They were last crawled by Google **before** those redirect entries were added. The "404" status is stale GSC data — the live site no longer 404s these tags. **No code change needed.** B3 is moved from Group B to Group A4.
+- **B4 (7 tag URLs marked "Redirect error"):** redirects existed at crawl time, so this *is* a real bug — kept in Group B for investigation.
+- **B1, B2, B5:** rules / dates / page state are current. Recommendations stand.
+- **C6 (11 test/debug pages):** none are actually disallowed in `app/robots.ts`. Status reflects an older robots.txt — also stale GSC data. Moved from Group C to Group A4.
+
+---
+
+## Bottom line (revised)
+
+- **≈ 277 URLs (Group A)** are GSC reporting redirects, canonicals, or stale historical state. No code change needed.
+- **≈ 124 URLs (Group B)** are real issues caused by 4 root-cause buckets.
+- **≈ 195 URLs (Group C)** are "Crawled — currently not indexed" + "Discovered — currently not indexed". Quality signals from Google. Most resolve themselves; a few need targeted edits.
+
+The high-leverage code changes are now **3 surgical fixes plus 1 investigation**. Everything else is data hygiene or already shipped.
+
+---
+
+## Group A — Status reports / stale data, no fix needed
+
+### A1. Page with redirect — 221 URLs
+GSC reporting "this URL was hit, it returned a redirect, OK". Correct outcome of the cleanup redirects in `next.config.js`.
+
+| Pattern | Count | Source |
+|---|---|---|
+| `/blog/tag/*` redirects | 120 | `config/redirects/tag-redirects.json` |
+| `/post/*` (Wix legacy) | 28 | `config/redirects/blog-redirects.json` |
+| `/blog/page/*` paginated | 8 | `config/redirects/additional-redirects.json` |
+| `/event-details/*` (legacy) | 6 | `config/redirects/legacy-redirects.json` + wix |
+| Various `/events/*` past dates | 12 | `config/redirects/additional-redirects.json` |
+| `/drinks/*` retired SKUs | 9 | `config/redirects/drinks-redirects.json` |
+| 4 protocol/host redirects | 4 | `middleware.ts` (apex→www, http→https) |
+| Other one-offs | 34 | various |
+
+**Action:** none. These will fade over months as Google forgets the source URLs.
+
+### A2. Alternative page with proper canonical tag — 11 URLs
+UTM-tagged or query-parameter variants where the canonical tag correctly points at the parent URL.
+
+**Action:** none. Working as designed.
+
+### A3. Discovered — currently not indexed — 17 URLs
+Google found via sitemap or links but hasn't crawled yet (mostly recent additions).
+
+**Action:** none. Re-check in 30 days.
+
+### A4. Stale GSC data — already-fixed pages reported under their old status (≈ 28 URLs)
+
+**A4a. 17 tag URLs marked "Not found (404)"** — all 17 have redirects in place today. Last crawl of each was before the redirect was added.
+
+| Slug | Redirect destination | Redirect added | Last crawled |
+|---|---|---|---|
+| mental-health, cider, feedback, children, private-dining, live-matches, terrestrial-sport, cash-prizes, traditional, family, british-history, pub-menu, annual-celebrations, mexican-culture, local-area, lunch | various (community / food-and-drink / sports / events / seasonal) — see `tag-redirects.json` lines 676–795 | 2026-03-02 (most) | 2026-01-06 to 2026-02-17 |
+| craft-beer | /blog/tag/food-and-drink (in `additional-redirects.json:79–82`) | 2025-12-29 | 2025-11-15 |
+
+**Action:** click "Validate fix" in GSC for the "Not found (404)" report. Wait for Google to re-crawl. No code change.
+
+**A4b. 11 test/debug pages marked "Blocked by robots.txt"** — none of these match any `disallow` rule in current `app/robots.ts`. They were last crawled Jan–Mar 2026; the actual response today is most likely 404 because the routes don't exist in `app/`.
+
+URLs: `/test-simple`, `/test-tracking`, `/test-reviews`, `/test-gtm`, `/test-navigation-tracking`, `/test-hours`, `/gtm-debug`, `/debug-hours`, `/components`, `/demo-header`, `/p5-demo`-adjacent.
+
+**Action:** none. Will drop out of GSC reports as Google re-crawls.
+
+---
+
+## Group B — Real fixes
+
+### B1. `robots.txt` `/*?dpl=*` rule blocks Vercel deploy-tagged static assets
+
+**Evidence:**
+- `app/robots.ts:13` declares `disallow: ['/*?dpl=*', ...]` — added 2026-02-18 (commit `bf1959b1`)
+- `app/robots.ts:8` declares `allow: ['/', '/_next/static/']`
+- 106 URLs flagged "Blocked by robots.txt" all match `/_next/static/css/HASH.css?dpl=DEPLOY_ID`
+- Vercel auto-appends `?dpl=<deployment-id>` to static assets
+- Latest `_next/static/` URL was crawled 2026-04-21, after the rule was added — so the rule is actively blocking, not stale
+
+**Why it's an issue:** `/*?dpl=*` matches any URL containing `?dpl=`, including the static CSS/JS assets that Googlebot needs to fetch when rendering pages. The `allow: /_next/static/` rule is more general; Google's parser uses the more specific match (the dpl wildcard). We end up telling Googlebot it can't load our stylesheet during render.
+
+The rule was presumably added to stop Google indexing the *HTML* version of `?dpl=` URLs. That's better solved with canonical tags (already in place) than with robots.txt.
+
+**Proposed fix:** remove the line `'/*?dpl=*',` from the disallow list in `app/robots.ts`. Keep the rest. The `X-Robots-Tag: noindex, nofollow` header already on `_next/static/*` (set in `next.config.js:130-141`) prevents asset URLs appearing in search.
+
+**Risk:** very low. Canonical tags already handle dedup.
+
+**Files touched:** `app/robots.ts` (1 line removed).
+
+**Resolves:** 106 URLs in "Blocked by robots.txt".
+
+---
+
+### B2. Past/removed `/events/*` URLs return 404 instead of redirecting
+
+**Evidence:**
+- 10 URLs in "Not found (404)" matching `/events/quiz-night-2026-XX-XX`, `/events/bingo-2026-XX-XX`, slugless `/events/karaoke`, `/events/drag-shows`, `/events/quiz-night`
+- `app/sitemap.ts:268-274` excludes events older than `PAST_EVENT_REDIRECT_DAYS` from the sitemap, but no catch-all picks them up after that
+- The 404'd events are ones the management API no longer returns
+
+**Proposed fix:** add `app/events/[slug]/not-found.tsx` that calls `permanentRedirect('/whats-on')`. Any 404 hit on an `/events/<slug>` URL becomes a 308 redirect to the events index.
+
+**Risk:** low. Live events route normally; only missing slugs hit the redirect.
+
+**Files touched:** `app/events/[slug]/not-found.tsx` (new file).
+
+**Resolves:** 10 URLs in "Not found (404)" + future drift.
+
+---
+
+### B4. 7 `/blog/tag/*` URLs hit "Redirect error"
+
+**Evidence:**
+- 7 URLs (3 apex + 4 www): `premier-league` (2×), `rugby` (2×), `pet-friendly` (2×), `dog-friendly` (1×)
+- All four source tags have redirects in `tag-redirects.json` that were added on or before 2025-12-28 — *before* the GSC crawls (2026-01-05 to 2026-01-23)
+- All four destinations (`community`, `sports`) are live tag pages with posts
+- Apex variants double-hop: `the-anchor.pub` → `www.the-anchor.pub` (middleware) → `www.the-anchor.pub/blog/tag/<dest>` (next.config redirect)
+
+**Hypothesis:** either Google's tooling flagged the 2-hop chain, or there was a transient response failure (timeout / cache miss) at crawl time.
+
+**Proposed fix:** investigation only in v1. Once B1 and B2 ship and the site is re-crawled, click "Validate fix" in GSC for these 7 and see if the error clears. If it persists, we'll need to either:
+- shorten the chain (rare — middleware host-canonicalisation is working correctly); or
+- look at whether the destination pages had a transient render failure at crawl time.
+
+**Risk:** none in v1 (no code change).
+
+**Resolves:** to be determined.
+
+---
+
+### B5. Sitemap/redirect contradiction on `/drinks/baby-guinness`
+
+**Evidence:**
+- `app/sitemap.ts:110` declares `/drinks/baby-guinness` as a canonical URL
+- `config/redirects/drinks-redirects.json` declares `/drinks/baby-guinness` → `/drinks` as a permanent redirect
+- The page exists in `app/drinks/[slug]/...` (build output confirms it renders)
+- GSC shows `/drinks/baby-guinness` in "Discovered — currently not indexed" — consistent with sitemap discovery, no redirect observed yet
+
+**Proposed fix:** remove the entry `{ source: "/drinks/baby-guinness", destination: "/drinks", permanent: true }` from `config/redirects/drinks-redirects.json`. The page is live and listed in the sitemap.
+
+**Audit follow-on:** scan all 76 entries in `drinks-redirects.json` against live drinks routes (`app/drinks/[slug]/...`) and remove any other contradictions. I will produce that diff once you approve B5.
+
+**Risk:** low.
+
+**Resolves:** 1 URL plus drift prevention.
+
+---
+
+## Group C — Quality / data hygiene
+
+### C1. 116 URLs in "Crawled — currently not indexed"
+Google crawled and chose not to index. Causes are content quality, duplication, or staleness — not technical errors.
+
+| Pattern | Count | Likely cause |
+|---|---|---|
+| `/blog/tag/*` (consolidated thin tags) | 22 | Tag pages with 1–2 posts |
+| `/post/*` (Wix legacy) | 16 | Old URLs, redirected, slow to drop out |
+| `/event-details/*` (legacy) | 11 | Same |
+| `/events/*` past dates | ~25 | Past events; expected to fall out |
+| Individual `/blog/*` posts | ~30 | Older posts with low engagement |
+| `/drinks/*` retired SKUs | 5 | Same as drinks-redirects |
+| Misc one-offs | ~7 | Mostly UTM/query variants |
+
+**Action:** most resolve once B1/B2/B5 ship. Thin tag consolidation and old-post review are out of scope here — flag as a follow-on SEO content task.
+
+### C2. 52 blog posts marked "Excluded by 'noindex' tag"
+Mechanism: `post.noindex` frontmatter, consumed at `app/blog/[slug]/page.tsx:140`. By design — author opt-in.
+
+**Action:** spot-check 5 of the 52 to confirm intentional. If any should be indexable, remove the frontmatter on those posts.

[diff truncated at line 1500 — total was 1563 lines. Consider scoping the review to fewer files.]
```

## Changed File Contents

### `app/events/[id]/page.tsx`

```
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { permanentRedirect } from 'next/navigation'
import { Button, Container, Section, Card, CardBody, Alert } from '@/components/ui'
import { EventSchema } from '@/components/seo/EventSchema'
import { EventBookingButton } from '@/components/EventBookingButton'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { anchorAPI, formatEventDate, formatEventTime, formatDoorTime, formatEventDuration, formatPrice } from '@/lib/api'
import { EventPageTracker } from '@/components/tracking/EventPageTracker'
import { PhoneButton } from '@/components/PhoneButton'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { EventSecondaryActions } from '@/components/events/EventSecondaryActions'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'
import {
  formatClockTime,
  getEventBookingBlockReason,
  getEventBookingModeLabel,
  getEventCanonicalSegment,
  getEventStatusLabel,
  isEventInPast,
  normalizeEventStatus
} from '@/lib/event-lifecycle'
import {
  buildMothersDayBookingUrl,
  isMothersDayEvent,
  MOTHERS_DAY_BOOKING_CTA_LABEL
} from '@/lib/mothers-day-booking'
import { getEventPriceLabel } from '@/lib/event-pricing'
import { getEventSeoStrategy, getCategoryPageUrl, isFallbackEvent, PAST_EVENT_REDIRECT_DAYS, CANCELLED_INDEX_DAYS } from '@/lib/event-seo-strategy'
import { getUpcomingEventsByCategory } from '@/lib/api/events'
import RelatedEvents from '@/components/events/RelatedEvents'
import LiteYouTube from '@/components/events/LiteYouTube'

type Props = {
  params: { id: string }
}

function getStatusNotice(status: ReturnType<typeof normalizeEventStatus>, pastEvent: boolean): {
  variant: 'info' | 'warning'
  title: string
  message: string
} | null {
  if (status === 'cancelled') {
    return {
      variant: 'warning',
      title: 'This event has been cancelled',
      message: 'Please see our upcoming events below or call us if you need help.'
    }
  }

  if (status === 'postponed') {
    return {
      variant: 'warning',
      title: 'This event has been postponed',
      message: 'Please check the latest details below before making plans.'
    }
  }

  if (status === 'rescheduled') {
    return {
      variant: 'info',
      title: 'This event has been rescheduled',
      message: 'Please review the updated date and time before booking.'
    }
  }

  if (status === 'sold_out') {
    return {
      variant: 'info',
      title: 'This event is currently sold out',
      message: 'Call us to check cancellations or alternative options.'
    }
  }

  if (pastEvent) {
    return {
      variant: 'info',
      title: 'This event has ended',
      message: 'Browse our upcoming events for the latest listings.'
    }
  }

  return null
}

function getBookingDisabledCopy(reason: ReturnType<typeof getEventBookingBlockReason>): {
  title: string
  message: string
} {
  if (reason === 'cancelled') {
    return {
      title: 'Booking unavailable',
      message: 'This event has been cancelled.'
    }
  }

  if (reason === 'sold_out') {
    return {
      title: 'Booking unavailable',
      message: 'This event is sold out right now. Call us to ask about cancellations.'
    }
  }

  if (reason === 'bookings_disabled') {
    return {
      title: 'No booking required',
      message: 'No booking is needed for this event — just turn up!'
    }
  }

  if (reason === 'past') {
    return {
      title: 'Booking unavailable',
      message: 'This event has already taken place.'
    }
  }

  return {
    title: 'Booking unavailable',
    message: 'This event is not available to book online.'
  }
}

function EventHighlights({
  highlights,
  className = '',
  compact = false
}: {
  highlights?: string[] | null
  className?: string
  compact?: boolean
}) {
  if (!Array.isArray(highlights) || highlights.length === 0) {
    return null
  }

  return (
    <Card
      variant="default"
      padding={compact ? 'none' : undefined}
      className={`border border-anchor-gold/15 bg-anchor-bg-card rounded-none ${className}`.trim()}
    >
      <CardBody className={compact ? 'p-4' : 'p-4 md:p-6'}>
        <h3 className={compact ? 'text-xl font-bold text-anchor-gold-vivid mb-2' : 'text-xl md:text-2xl font-bold text-anchor-gold-vivid mb-3 md:mb-4'}>
          Event Highlights
        </h3>
        <ul className={compact ? 'space-y-1.5' : 'space-y-2'}>
          {highlights.map((highlight, index) => (
            <li key={`${highlight}-${index}`} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-anchor-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className={compact ? 'text-anchor-cream-text/70 text-sm' : 'text-anchor-cream-text/70 text-base'}>
                {highlight.replace(/(\d+,\d+\+?\s+)/g, (match) => match.replace(/\s+/g, '\u00A0'))}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const event = await anchorAPI.getEvent(params.id)
    const canonical = `/events/${event.slug || params.id}`
    const ogImage = `${canonical}/opengraph-image`
    const description =
      event.metaDescription ||
      event.shortDescription ||
      event.description ||
      `Join us for ${event.name} at The Anchor in Stanwell Moor. ${formatEventDate(event.startDate)} at ${formatEventTime(event.startDate)}.`
    
    // Determine if event should be noindexed
    const eventDate = Date.parse(event.startDate)
    const daysSinceEvent = (Date.now() - eventDate) / (1000 * 60 * 60 * 24)
    const eventStatus = normalizeEventStatus(event)
    const shouldNoindex =
      (daysSinceEvent > PAST_EVENT_REDIRECT_DAYS) ||
      (eventStatus === 'cancelled' && daysSinceEvent > CANCELLED_INDEX_DAYS)

    // Merge keyword arrays
    const keywords = [
      ...(event.primary_keywords || []),
      ...(event.secondary_keywords || []),
      ...(event.local_seo_keywords || [])
    ].join(', ') || undefined

    return {
      title: event.metaTitle || event.name,
      description,
      keywords,
      ...(shouldNoindex ? { robots: { index: false, follow: true } } : {}),
      alternates: {
        canonical,
      },
      openGraph: {

[truncated at line 200 — original has 798 lines]
```

### `app/robots.ts`

```
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/_next/static/'],
        disallow: [
          '/api/',
          // Allow static assets so crawlers can render pages correctly.
          '/_next/data/',
          '/_serverless/',
          '/_partials/',
          '/_api/',
          '/_scripts/',
          '/cdn-cgi/',
          '/subscribe',
          '/leave-a-review',
          '/subscribe-for-digital-flyers',
          '/p5-demo'
        ]
      }
    ],
    sitemap: ['https://www.the-anchor.pub/sitemap.xml'],
  }
}
```

### `components/features/TableBooking/ManagementTableBookingForm.tsx`

```
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { ChevronDown } from 'lucide-react'
import { Alert } from '@/components/ui/feedback/Alert'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Input, Textarea } from '@/components/ui/primitives/Input'
import { Button } from '@/components/ui/primitives/Button'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
import { pickSlotWindow } from '@/lib/table-booking-slot-window'
import {
  londonIsoDate,
  londonNowParts,
  toTimeString,
} from '@/lib/table-booking-service-windows'
import {
  pushToDataLayer,
  trackTableBookingClick,
  trackTableBookingFunnel,
} from '@/lib/gtm-events'
import {
  LARGE_GROUP_DEPOSIT_PER_PERSON_GBP,
  LARGE_GROUP_DEPOSIT_POLICY_COPY,
  requiresDeposit,
} from '@/lib/constants'
import {
  formatTimeNoSeconds,
  getEffectiveDayHours,
  isKitchenClosed,
  isVenueClosed,
} from '@/lib/hours-utils'
import { PayPalDepositSection } from './PayPalDepositSection'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

type LookupState = 'idle' | 'loading' | 'known' | 'unknown'
type BookingStep = 'find' | 'choose' | 'details' | 'review'

type CustomerLookupResult = {
  known: boolean
  lookup_degraded?: boolean
  normalized_phone?: string
  customer?: {
    id?: string
    first_name?: string | null
    last_name?: string | null
    full_name?: string | null
    email?: string | null
    mobile_e164?: string | null
    mobile_number?: string | null
  } | null
}

type ManagementTableBookingResult = {
  state: 'confirmed' | 'pending_payment' | 'blocked'
  table_booking_id: string | null
  booking_reference: string | null
  reason: string | null
  blocked_reason:
    | 'outside_hours'
    | 'cut_off'
    | 'no_table'
    | 'private_booking_blocked'
    | 'too_large_party'
    | 'customer_conflict'
    | 'in_past'
    | 'blocked'
    | null
  next_step_url: string | null
  hold_expires_at: string | null
  table_name: string | null
  booking_id?: string
  deposit_amount?: number
  // Set by the management API when inline PayPal setup fails for a 10+ booking.
  // Surfaced to the customer as a recovery link alongside the call-us copy.
  // See spec §6 ("Failed-PayPal recovery") and §8.1 (PayPal failure recovery).
  fallback_payment_url?: string | null
  payment_required?: boolean
}

type AvailabilitySlot = {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
  kitchen_open?: boolean
}

type AvailabilityData = {
  date: string
  available: boolean
  time_slots: AvailabilitySlot[]
  message?: string
  special_notes?: string
}

type SelectedSlotService = {
  date: string
  time: string
  kitchen_open?: boolean
}

type AlternativeSlot = SelectedSlotService

type SuggestedEvent = {
  id: string
  slug: string | null
  name: string
  startDate: string
  shortDescription: string | null
  seatsRemaining: number | null
  priceLabel: string | null
}

interface ManagementTableBookingFormProps {
  prefill?: {
    date?: string
    time?: string
    partySize?: number
  }
}

const STEP_ORDER: BookingStep[] = ['find', 'choose', 'details', 'review']

const STEP_LABELS: Record<BookingStep, string> = {
  find: 'Find table',
  choose: 'Choose time',
  details: 'Guest details',
  review: 'Review & book'
}

const BLOCKED_REASON_COPY: Record<string, string> = {
  outside_hours: 'That time is outside our booking hours. Please choose another time or call us.',
  cut_off: 'Online bookings for that slot are now closed. Please call us and we will try to help.',
  no_table: 'No tables available at that time. Try a different time or give us a call on 01753 682707.',
  private_booking_blocked: 'This slot is unavailable because of a private event.',
  too_large_party: 'For larger groups, please call us so we can arrange your booking.',
  customer_conflict: 'You already have a nearby booking. Please call us if you need help changing it.',
  in_past: 'That booking time is in the past. Please choose a future date and time.',
  blocked: 'This slot is not available for online booking right now.'
}

function toIsoDateInputValue(value: string | undefined): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return londonIsoDate(date)
}

function getDefaultTimeValue(): string {
  // Compute "now + 1 hour, rounded up to the next 30-minute slot" in
  // Europe/London. The previous implementation used the browser-local clock,
  // which is wrong for any visitor whose device is not on UK time.
  const { minutes } = londonNowParts()
  const next = Math.ceil((minutes + 60) / 30) * 30
  return toTimeString(next % 1440)
}

function toTimeInputValue(value: string | undefined): string {
  if (!value) return ''
  if (/^\d{2}:\d{2}$/.test(value)) return value
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5)
  return ''
}

function formatHoldExpiry(value: string | null): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Europe/London'
  })
}

function formatGbpCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(value)
}

function createClientIdempotencyKey(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function parseLookupResponse(payload: any): CustomerLookupResult {
  const data = payload?.data || payload

[truncated at line 200 — original has 2243 lines]
```

### `config/redirects/additional-redirects.json`

```
[
  {
    "source": "/blog/sunday-lunch-at-the-anchor-is-back-pre-order-now",
    "destination": "/sunday-lunch",
    "permanent": true
  },
  {
    "source": "/pizza-tuesday",
    "destination": "/food-menu",
    "permanent": true
  },
  {
    "source": "/live-sport/premier-league",
    "destination": "/live-sport",
    "permanent": true
  },
  {
    "source": "/blog/euro-2024-viewing",
    "destination": "/live-sport",
    "permanent": true
  },
  {
    "source": "/blog/autumn-internationals-2024-full-fixtures-highlight",
    "destination": "/live-sport",
    "permanent": true
  },
  {
    "source": "/live-sport-pub",
    "destination": "/live-sport",
    "permanent": true
  },
  {
    "source": "/profile/:path*",
    "destination": "/",
    "permanent": true
  },
  {
    "source": "/food/pizza",
    "destination": "/food-menu#pizza",
    "permanent": false,
    "statusCode": 301
  },
  {
    "source": "/contact",
    "destination": "/find-us",
    "permanent": true
  },
  {
    "source": "/free-parking",
    "destination": "/heathrow-parking",
    "permanent": true
  },
  {
    "source": "/event-",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/Events/Curry-Club---August-8,-2019",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/favicon.ico",
    "destination": "/favicon.png",
    "permanent": true
  },
  {
    "source": "/blog/hashtags/:tag",
    "destination": "/blog/tags",
    "permanent": true
  },
  {
    "source": "/blog/tag/LiveMusic",
    "destination": "/live-music",
    "permanent": true
  },
  {
    "source": "/blog/tag/craft-beer",
    "destination": "/blog/tag/food-and-drink",
    "permanent": true
  },
  {
    "source": "/blog/tag/FamilyFriendly",
    "destination": "/blog/tag/community",
    "permanent": true
  },
  {
    "source": "/blog/tag/FamilyFirst",
    "destination": "/blog",
    "permanent": true
  },
  {
    "source": "/blog/tag/NYEParty",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/blog/tag/CommunitySpirit",
    "destination": "/blog",
    "permanent": true
  },
  {
    "source": "/blog/tag/LiveDJ",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/blog/tag/FreeEntry",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/blog/tag/BurgersAndBeats",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/blog/tag/NewYearsEve",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/blog/tag/GreatSpiritsGreatValue",
    "destination": "/drinks/managers-special",
    "permanent": true
  },
  {
    "source": "/blog/tag/VillageNewYear",
    "destination": "/whats-on",
    "permanent": true
  },
  {
    "source": "/blog/tag/DoubleUpOffer",
    "destination": "/drinks/managers-special",
    "permanent": true
  },
  {
    "source": "/blog/tag/TheAnchorCelebration",
    "destination": "/blog",
    "permanent": true
  },
  {
    "source": "/blog/tag/GinEnthusiasts",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/blog/tag/lovelocal",
    "destination": "/blog",
    "permanent": true
  },
  {
    "source": "/blog/tag/supportlocal",
    "destination": "/blog",
    "permanent": true
  },
  {
    "source": "/blog/tag/TheAnchorCommunity",
    "destination": "/blog",
    "permanent": true
  },
  {
    "source": "/blog/tag/ChildrensMentalHealthWeek",
    "destination": "/blog/childrens-mental-health-week",
    "permanent": true
  },
  {
    "source": "/blog/tag/InspireInclusion",
    "destination": "/blog",
    "permanent": true
  },
  {
    "source": "/blog/tag/StayLocal",
    "destination": "/blog",
    "permanent": true
  },
  {
    "source": "/subscription-terms-and-conditions",
    "destination": "/privacy-policy",
    "permanent": true
  },
  {
    "source": "/copy-of-gin-whiskey-vodka-and-rum",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/book",
    "destination": "/book-table",
    "permanent": true
  },
  {
    "source": "/special-offers",
    "destination": "/drinks/managers-special",
    "permanent": true
  },
  {
    "source": "/newsletter",
    "destination": "/",

[truncated at line 200 — original has 494 lines]
```

### `config/redirects/drinks-redirects.json`

```
[
  {
    "source": "/drinks/el-pico-sauvignon-blanc",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/el-pico-cabernet-sauvignon",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/desperados",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/giorgio-and-gianni-spumante",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/carling",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/abbot-ale",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/wine",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/counterpoint-shiraz",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/archers",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/newcastle-brown-ale",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/magners",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/counterpoint-chardonnay",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/chambord",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/gordons",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/disaronno",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/coors-light",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/inches-cider",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/bombay-sapphire",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/corona-extra",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/cointreau",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/greene-king-ipa",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/jagermeister",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/captain-morgans-original-dark-rum",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/sambuca-raspberry",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/giotto-pino-grigio",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/bacardi",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/bacardi-breeze",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/whiskey",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/havana-club-7",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/pimm's",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/fosters",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/bailey's-hot-chocolate",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/gold-ginger",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/hendricks",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/jack-daniel's-apple",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/jagerbomb",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/san-miguel",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/bottles",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/bailey's",
    "destination": "/drinks",
    "permanent": true
  },
  {
    "source": "/drinks/courvoisier",
    "destination": "/drinks",
    "permanent": true

[truncated at line 200 — original has 377 lines]
```

### `lib/table-booking-service-windows.ts`

```
import type { BusinessHours } from '@/lib/api'

export type BookingPurpose = 'food' | 'drinks'
export type BookingType = 'regular' | 'sunday_lunch'

type ScheduleConfigEntry = {
  starts_at?: string
  ends_at?: string
  booking_type?: string
  capacity?: number
}

export type ServiceRange = {
  startsAt: string
  endsAt: string
  capacity: number
}

export type ServiceRangeResolution = {
  ranges: ServiceRange[]
  closed: boolean
  message?: string
}

export function normalizeTime(value: string): string {
  if (/^\d{2}:\d{2}$/.test(value)) return value
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5)
  return value
}

export function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)
}

export function toMinutes(time: string): number {
  const normalized = normalizeTime(time)
  const [hoursRaw, minutesRaw] = normalized.split(':')
  const hours = Number.parseInt(hoursRaw || '0', 10)
  const minutes = Number.parseInt(minutesRaw || '0', 10)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0
  return hours * 60 + minutes
}

export function toTimeString(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function londonIsoDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function londonNowParts(): { isoDate: string; minutes: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const now = new Date()
  const parts = formatter.formatToParts(now)
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const hours = Number.parseInt(map.hour || '0', 10)
  const minutes = Number.parseInt(map.minute || '0', 10)

  return {
    isoDate: londonIsoDate(now),
    minutes: hours * 60 + minutes
  }
}

function getDayKey(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  return new Date(Date.UTC(year, month - 1, day))
    .toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })
    .toLowerCase()
}

function extractScheduleConfig(input: unknown): ScheduleConfigEntry[] {
  if (!Array.isArray(input)) return []

  const entries: ScheduleConfigEntry[] = []

  for (const entry of input) {
    if (!entry || typeof entry !== 'object') continue

    const source = entry as Record<string, unknown>
    const startsAt = typeof source.starts_at === 'string' ? normalizeTime(source.starts_at) : undefined
    const endsAt = typeof source.ends_at === 'string' ? normalizeTime(source.ends_at) : undefined
    if (!startsAt || !endsAt || !isValidTime(startsAt) || !isValidTime(endsAt)) continue

    entries.push({
      starts_at: startsAt,
      ends_at: endsAt,
      booking_type: typeof source.booking_type === 'string' ? source.booking_type : undefined,
      capacity:
        typeof source.capacity === 'number'
          ? source.capacity
          : typeof source.capacity === 'string'
          ? Number.parseInt(source.capacity, 10)
          : undefined
    })
  }

  return entries
}

function toServiceRanges(entries: ScheduleConfigEntry[]): ServiceRange[] {
  return entries
    .map((entry) => ({
      startsAt: normalizeTime(entry.starts_at || ''),
      endsAt: normalizeTime(entry.ends_at || ''),
      capacity: Number.isFinite(entry.capacity) ? Number(entry.capacity) : 50
    }))
    .filter((entry) => isValidTime(entry.startsAt) && isValidTime(entry.endsAt) && toMinutes(entry.endsAt) > toMinutes(entry.startsAt))
}

function isInWindow(targetMinutes: number, startMinutes: number, endMinutes: number): boolean {
  if (endMinutes > startMinutes) {
    return targetMinutes >= startMinutes && targetMinutes < endMinutes
  }

  return targetMinutes >= startMinutes || targetMinutes < endMinutes
}

export function isTimeWithinRanges(time: string, ranges: ServiceRange[]): boolean {
  if (!isValidTime(time)) return false
  const targetMinutes = toMinutes(time)

  return ranges.some((range) => {
    if (!isValidTime(range.startsAt) || !isValidTime(range.endsAt)) return false
    return isInWindow(targetMinutes, toMinutes(range.startsAt), toMinutes(range.endsAt))
  })
}

export function buildSlotsFromRanges(
  ranges: ServiceRange[],
  partySize: number,
  slotIntervalMinutes = 30,
  minMinutesForToday?: number
): Array<{
  time: string
  available: boolean
  available_capacity: number
  reason?: string
}> {
  const slots = new Map<string, { time: string; available: boolean; available_capacity: number; reason?: string }>()

  for (const range of ranges) {
    const start = toMinutes(range.startsAt)
    const end = toMinutes(range.endsAt)
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      continue
    }

    for (let cursor = start; cursor < end; cursor += slotIntervalMinutes) {
      if (typeof minMinutesForToday === 'number' && cursor < minMinutesForToday) {
        continue
      }

      const slotTime = toTimeString(cursor)
      const availableCapacity = Math.max(range.capacity, 0)
      const isAvailable = availableCapacity >= partySize

      if (!slots.has(slotTime)) {
        slots.set(slotTime, {
          time: slotTime,
          available: isAvailable,
          available_capacity: availableCapacity,
          reason: isAvailable ? undefined : 'party_too_large'
        })
        continue
      }

      const existing = slots.get(slotTime)
      if (!existing) continue

      const mergedCapacity = Math.max(existing.available_capacity || 0, availableCapacity)
      const mergedAvailable = mergedCapacity >= partySize
      slots.set(slotTime, {
        ...existing,
        available_capacity: mergedCapacity,
        available: mergedAvailable,
        reason: mergedAvailable ? undefined : existing.reason || 'party_too_large'
      })
    }
  }


[truncated at line 200 — original has 399 lines]
```

### `lib/table-booking-slot-window.ts`

```
import type { TableAvailabilitySlot } from '@/lib/api'
import { isValidTime, normalizeTime, toMinutes } from '@/lib/table-booking-service-windows'

export const DEFAULT_SLOT_WINDOW_SIZE = 7

export function pickSlotWindow<T extends Pick<TableAvailabilitySlot, 'time'>>(
  slots: T[],
  requestedTime: string,
  size: number = DEFAULT_SLOT_WINDOW_SIZE
): T[] {
  if (size <= 0) {
    return []
  }

  if (slots.length <= size) {
    return slots
  }

  const normalizedRequestedTime = normalizeTime(requestedTime)
  if (!isValidTime(normalizedRequestedTime)) {
    return slots.slice(0, size)
  }

  const requestedMinutes = toMinutes(normalizedRequestedTime)
  let centerIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  slots.forEach((slot, index) => {
    const distance = Math.abs(toMinutes(slot.time) - requestedMinutes)
    if (distance < bestDistance) {
      bestDistance = distance
      centerIndex = index
    }
  })

  const half = Math.floor(size / 2)
  let start = centerIndex - half
  let end = start + size

  if (start < 0) {
    end += -start
    start = 0
  }

  if (end > slots.length) {
    start = Math.max(0, start - (end - slots.length))
    end = slots.length
  }

  return slots.slice(start, end)
}
```

### `tasks/gsc-indexing-fix/REVIEW-PACK.md`

```
# GSC Indexing — Third-Party Review Pack

**Prepared:** 2026-04-30
**Repo:** `OJ-The-Anchor.pub` (Next.js 14 marketing/booking site for The Anchor pub, Stanwell Moor)
**Last code change for this work:** commit [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) on `main`
**GSC export consumed:** `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (0..7)/` — exported 2026-04-29

This pack is for an external reviewer. Everything here is intended to stand alone — links to source files, line numbers, dates, and confidence levels are included so the reviewer can independently verify each claim.

The Anchor's website indexing problems are not new. Prior attempts (see §2) have made progress but left some categories stuck. This document covers the full picture, what just shipped, what's still open, and where I'm uncertain.

---

## 1. Executive summary (plain English)

Google Search Console exported 596 URLs across 8 indexing-status categories on 2026-04-29.

Of those 596:

- **≈ 277** are Google reporting redirects, canonical tags, or stale historical state working correctly. No code change needed.
- **4 real, actionable issues** in code were fixed today and pushed to `main` ([`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6)). They will resolve once the deploy lands and Google re-crawls.
- **3 items are not fully resolved.** One needs investigation after the next re-crawl, one is an external/legacy reference that can't be fixed in code (confirmed by prior reviews), and one cohort of ~116 URLs is "Google chose not to index" — a content-quality issue, not a code bug.

Honest assessment of confidence: I am **highly confident** in the four shipped fixes (verified against built output). I am **moderately confident** that they will resolve the categories I claim. I am **low confidence** that the 7 "Redirect error" cohort will clear without further work — I deferred that and would welcome a reviewer's view on whether to dig in now or wait.

---

## 2. Prior fix attempts (context for the reviewer)

The Anchor has had ongoing GSC indexing issues for at least a year. There are **147 SEO/redirect/robots/sitemap-tagged commits** in the git log since 2025-05-01. The most recent and most relevant:

| Date | Commit | Summary |
|---|---|---|
| 2026-04-30 | [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) | **This session.** Four GSC fixes: robots `/*?dpl=*` removed, events redirect to `/whats-on`, drinks/baby-guinness conflict resolved, `/hr` redirect added. |
| 2026-04-30 | `c28d298` | Eliminated duplicate `@id: /#business` JSON-LD declarations across 23 files (separate problem, also from this session). |
| 2026-04-30 | `d56cfaf` | Sunday-lunch FAQPage duplicate fix (separate, this session). |
| 2026-04-21 | `6181bbd` | **Prior robots.txt attempt.** Added `/_next/static/` to allow list. Did **not** remove `/*?dpl=*` — that's the gap I closed today. |
| 2026-04-21 | `1079fb5` | Removed test pages, fixed redirect chains, cleaned duplicate redirects. |
| 2026-04-12 | `2084315` | Consolidated thin blog tag pages via 301 redirects (added many of the redirects I confirmed are working today). |
| 2026-03-02 | `689589e` | Resolved earlier GSC 404s and meta description issues. |
| 2026-02-23 | `a9acca3` | Hardened redirects, unified hero templates. |
| 2026-02-18 | `bf1959b1` | Added the catch-block redirect on `/events/[id]` for missing events; also added `/*?dpl=*` to robots disallow (the rule I just removed). |
| 2026-01-27 | `5017e9c` | Earlier GSC indexing fix sweep. |

Prior third-party (Codex) reviews on the same problem space, located in `tasks/codex-qa-review/`:

- `2026-04-12-gsc-coverage-fix-*` — five reports investigating an earlier GSC spec
- `2026-04-21-seo-growth-plan-implementation-review-pack.md` — full SEO growth plan review
- `2026-04-11-event-redirect-*` — reviews of the events redirect work

**Key historical finding (from the 2026-04-12 Codex review):** the broken image URL `/images/page-headers/drinks/optimized/drinks-1920w` was confirmed not to exist anywhere in the codebase. Codex concluded it's a legacy Wix reference Google still has cached, not a fixable code issue. I'm treating that conclusion as authoritative — see §6.

---

## 3. The full set of problems

596 URLs reported by GSC on 2026-04-29, broken down by category and pattern. All counts are derived directly from the Table.csv in each export folder.

### 3.1 Page with redirect — 221 URLs

URLs that returned a redirect when crawled. The `Last crawled` column shows when Google last hit them.

| Pattern | Count | Source | Status |
|---|---|---|---|
| `/blog/tag/*` redirects | 120 | `config/redirects/tag-redirects.json` consolidates synonym tags | **Working as designed.** GSC will drop these as it re-crawls. |
| `/post/*` (Wix legacy) | 28 | `config/redirects/blog-redirects.json` | **Working as designed.** |
| `/blog/page/*` paginated | 8 | `config/redirects/additional-redirects.json` | **Working as designed.** |
| `/event-details/*` (legacy) | 6 | `config/redirects/legacy-redirects.json` + wix | **Working as designed.** |
| Various dated `/events/*` | 12 | `config/redirects/additional-redirects.json` | **Working as designed.** |
| `/drinks/*` retired SKUs | 9 | `config/redirects/drinks-redirects.json` | **Working as designed.** |
| HTTP→HTTPS / apex→www | 4 | `middleware.ts` lines 16–25 | **Working as designed.** |
| Other one-offs | 34 | various | **Working as designed.** |

### 3.2 Blocked by robots.txt — 137 URLs

| Pattern | Count | Status |
|---|---|---|
| `/_next/static/css/HASH.css?dpl=DEPLOY_ID` | 106 | **Was blocked by `/*?dpl=*` rule. Fixed in [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6).** |
| `/api/calendar/event/...` | 21 | **Correctly blocked by `/api/` rule. No fix needed.** |
| `/test-*`, `/debug-*`, `/components`, `/gtm-debug`, `/demo-header`, `/p5-demo` | 11 | **Stale GSC report.** None match any current `disallow` rule in `app/robots.ts`. The pages don't exist — they likely return 404 today. Will drop on re-crawl. |

### 3.3 Excluded by 'noindex' tag — 57 URLs

| Pattern | Count | Status |
|---|---|---|
| `/blog/<slug>` posts with `noindex: true` frontmatter | 52 | **By design.** Spot-checked 5 (`unique-events`, `day-of-the-dead-halloween-party-costumes-dance-and`, `national-burger-day`, `british-pie-week-2024`, `calling-all-pool-players`) — all confirmed `noindex: true` in their frontmatter. Author opt-in is the documented mechanism at `app/blog/[slug]/page.tsx:140`. |
| `/post/*` (Wix legacy) | 2 | Stale — these now redirect. |
| `/booking-confirmation` | 1 | Stale — page now does `redirect('/book-table')` (file `app/booking-confirmation/page.tsx`). |
| `/event-details/*` | 1 | Stale — redirected. |
| `/events/st-patricks-day-2026` | 1 | Past event. |

### 3.4 Not found (404) — 30 URLs

| Pattern | Count | Status |
|---|---|---|
| `/blog/tag/*` | 17 | **Stale.** All 17 have redirects in code today. Last crawl of each was *before* the redirect was added. Confirmed by cross-referencing `Last crawled` against `git blame` on `tag-redirects.json` and `additional-redirects.json` (see §4 for evidence). Will resolve on re-crawl + GSC "Validate fix". |
| `/events/*` (dated 2026-XX-XX + slugless `karaoke`/`drag-shows`/`quiz-night`) | 10 | **Now redirects.** [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) modified `app/events/[id]/page.tsx` to `permanentRedirect('/whats-on')` on draft/missing events. Verified compiled `page.js` contains 3× `permanentRedirect("/whats-on")` calls. |
| `/hr` | 1 | **Now redirects to `/`** via [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6). |
| `/post/<slug>` | 1 | Stale (covered by Wix redirects). |
| `/images/page-headers/drinks/optimized/drinks-1920w` | 1 | **Cannot fix from code.** Confirmed non-existent in repo by prior Codex review (`tasks/codex-qa-review/2026-04-12-gsc-coverage-fix-assumption-breaker-report.md` §2). Legacy Wix image URL Google still has cached. |

### 3.5 Crawled — currently not indexed — 116 URLs

These were crawled successfully and Google chose not to index. This is a **content-quality signal**, not a technical error.

| Pattern | Count | Likely cause |
|---|---|---|
| `/blog/tag/*` (consolidated thin tags) | 22 | Tag pages with 1–2 posts |
| `/post/*` (Wix legacy) | 16 | Old URLs, redirected, Google slow to drop |
| `/event-details/*` (legacy) | 11 | Same |
| `/events/*` past dates | ~25 | Past events; expected to fall out |
| Individual `/blog/*` posts | ~30 | Older posts with low engagement |
| `/drinks/*` retired SKUs | 5 | Same as drinks-redirects |
| Misc one-offs | ~7 | Mostly UTM/query variants |

**Status:** unaddressed in this session beyond the redirect fixes. Most will resolve naturally as the redirected ones drop out and past events expire from the API. Anything left after that is a content quality task — out of scope for a redirect/config audit.

### 3.6 Alternative page with proper canonical tag — 11 URLs

UTM-tagged or query-string variants where the canonical correctly points at the parent URL. Working as designed; no action.

### 3.7 Redirect error — 7 URLs

| URL | Redirect destination | Redirect added | Last crawled |
|---|---|---|---|
| `https://www.the-anchor.pub/blog/tag/premier-league` | `/blog/tag/sports` | 2025-12-28 (`tag-redirects.json`) | 2026-01-23 |
| `https://www.the-anchor.pub/blog/tag/rugby` | `/blog/tag/sports` | 2025-12-28 | 2026-01-20 |
| `https://www.the-anchor.pub/blog/tag/dog-friendly` | `/blog/tag/community` | 2025-12-28 | 2026-01-07 |
| `https://www.the-anchor.pub/blog/tag/pet-friendly` | `/blog/tag/community` | 2025-07-16 | 2026-01-18 |
| Apex variants of `pet-friendly`, `premier-league`, `rugby` | (same) | (same) | 2026-01-05 to 2026-01-23 |

All four destinations (`community`, `sports`) are live tag pages with posts. Redirects existed at crawl time. **Root cause unknown.**

Hypotheses (in order of plausibility):
1. Apex variants double-hop: `the-anchor.pub` → `www.the-anchor.pub` (middleware) → `/blog/tag/<destination>` (next.config redirect). Google sometimes flags 2-hop chains.
2. Transient response failure / timeout at crawl time on the destination page.
3. Cache-related issue at Vercel edge.

**Status: deferred.** I want to see if these clear after the next re-crawl following [b319ee6](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6). If they don't, options are (a) flatten the apex variants to single-hop edge redirects, (b) instrument the destination pages for timeout monitoring.

### 3.8 Discovered — currently not indexed — 17 URLs

Found via sitemap, not yet crawled. Mostly recent additions: 5× `/private-hire/near/*` programmatic landmark pages, 6× recent blog posts, and 6 individual one-offs. **Normal for new content.** Re-check in 30 days.

---

## 4. Evidence cross-reference table — verifying which "404" reports are stale

This table is the single most important evidence in this document. It shows, for the 17 tag-URLs marked "Not found (404)", that the redirect was added *after* Google's last crawl — i.e. the live site is no longer 404'ing them.

| Slug | Redirect destination | Redirect added (commit) | Last crawled | Stale? |
|---|---|---|---|---|
| mental-health | community | 2026-03-02 (`689589e3`) | 2026-02-17 | YES |
| cider | food-and-drink | 2026-03-02 | 2026-02-17 | YES |
| feedback | community | 2026-03-02 | 2026-02-17 | YES |
| children | community | 2026-03-02 | 2026-02-03 | YES |
| private-dining | events | 2026-03-02 | 2026-01-26 | YES |
| live-matches | sports | 2026-03-02 | 2026-01-22 | YES |
| terrestrial-sport | sports | 2026-03-02 | 2026-01-22 | YES |
| cash-prizes | events | 2026-03-02 | 2026-01-20 | YES |
| traditional | community | 2026-03-02 | 2026-01-20 | YES |
| family | community | 2026-03-02 | 2026-01-20 | YES |
| british-history | community | 2026-03-02 | 2026-01-19 | YES |
| pub-menu | food-and-drink | 2026-03-02 | 2026-01-19 | YES |
| annual-celebrations | seasonal | 2026-03-02 | 2026-01-19 | YES |
| mexican-culture | food-and-drink | 2026-03-02 | 2026-01-19 | YES |
| local-area | community | 2026-03-02 | 2026-01-18 | YES |
| lunch | food-and-drink | 2026-03-02 | 2026-01-06 | YES |
| craft-beer | food-and-drink | 2025-12-29 (in `additional-redirects.json`) | 2025-11-15 | YES |

**How to verify:** for any row, run

```
git blame --date=short config/redirects/tag-redirects.json | grep -B2 -A2 '"<slug>"'
```

against the slug, and compare the committer date to the `Last crawled` value in the GSC export at `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (3)/Table.csv`.

---

## 5. What I shipped this session

Four code changes, one PR, pushed as commit [`b319ee6`](https://github.com/peterjpitcher/the-anchor.pub/commit/b319ee6) on `main`.

### 5.1 `app/robots.ts` — removed `/*?dpl=*` from disallow list

**Before:** `disallow: ['/api/', '/_next/data/', '/*?dpl=*', '/_serverless/', ...]`
**After:** `disallow: ['/api/', '/_next/data/', '/_serverless/', ...]`

**Why:** the wildcard matched any URL containing `?dpl=`, including the static CSS/JS assets Vercel auto-tags with `?dpl=<deployment-id>` for cache busting. The `allow: /_next/static/` rule on line 8 was being overridden by this more-specific disallow. 106 stylesheet URLs were being marked "Blocked by robots.txt".

**Why this wasn't caught in commit `6181bbd` on 2026-04-21:** that fix added `_next/static/` to the allow list but didn't remove the more-specific dpl wildcard. In Google's robots.txt parser the more-specific match wins.

**Verification (high confidence):**
- `cat .next/server/app/robots.txt.body` after build shows the dpl line is gone.
- The static assets remain `noindex,nofollow` via the `X-Robots-Tag` header set in `next.config.js:130-141` — so they won't suddenly appear in search.
- The canonical tags on every HTML page handle deployment-pinned URL dedup independently.

**Risk:** very low. The X-Robots-Tag header is the correct tool for "don't index this asset URL"; robots.txt is the wrong tool because Googlebot needs to *fetch* the asset to render the page. That's exactly what the dpl rule was preventing.


[truncated at line 200 — original has 397 lines]
```

### `tasks/gsc-indexing-fix/SPEC.md`

```
# GSC Indexing Fix — Discovery & Spec

**Source data:** `temp/GSC Errors/the-anchor.pub-Coverage-Drilldown-2026-04-30 (0..7)/Table.csv`
**Pages flagged:** 596 across 8 GSC categories
**Date of GSC export:** 2026-04-29
**Last revised:** 2026-04-30 (verified findings against git history; B3 reclassified)

This spec is for review. **Nothing has been changed yet.** Each finding cites evidence (URL counts, file paths, line numbers, dates); each proposal is sized so it can be approved, deferred, or rejected independently.

---

## Verification log (2026-04-30)

Before recommending any fix, I cross-referenced each cohort's "Last crawled" date in GSC with `git log` / `git blame` on the relevant config files. This caught one wrong recommendation in the original draft:

- **B3 (17 tag URLs marked 404):** all 17 are *already* redirected in `config/redirects/tag-redirects.json` (16) or `config/redirects/additional-redirects.json` (1). They were last crawled by Google **before** those redirect entries were added. The "404" status is stale GSC data — the live site no longer 404s these tags. **No code change needed.** B3 is moved from Group B to Group A4.
- **B4 (7 tag URLs marked "Redirect error"):** redirects existed at crawl time, so this *is* a real bug — kept in Group B for investigation.
- **B1, B2, B5:** rules / dates / page state are current. Recommendations stand.
- **C6 (11 test/debug pages):** none are actually disallowed in `app/robots.ts`. Status reflects an older robots.txt — also stale GSC data. Moved from Group C to Group A4.

---

## Bottom line (revised)

- **≈ 277 URLs (Group A)** are GSC reporting redirects, canonicals, or stale historical state. No code change needed.
- **≈ 124 URLs (Group B)** are real issues caused by 4 root-cause buckets.
- **≈ 195 URLs (Group C)** are "Crawled — currently not indexed" + "Discovered — currently not indexed". Quality signals from Google. Most resolve themselves; a few need targeted edits.

The high-leverage code changes are now **3 surgical fixes plus 1 investigation**. Everything else is data hygiene or already shipped.

---

## Group A — Status reports / stale data, no fix needed

### A1. Page with redirect — 221 URLs
GSC reporting "this URL was hit, it returned a redirect, OK". Correct outcome of the cleanup redirects in `next.config.js`.

| Pattern | Count | Source |
|---|---|---|
| `/blog/tag/*` redirects | 120 | `config/redirects/tag-redirects.json` |
| `/post/*` (Wix legacy) | 28 | `config/redirects/blog-redirects.json` |
| `/blog/page/*` paginated | 8 | `config/redirects/additional-redirects.json` |
| `/event-details/*` (legacy) | 6 | `config/redirects/legacy-redirects.json` + wix |
| Various `/events/*` past dates | 12 | `config/redirects/additional-redirects.json` |
| `/drinks/*` retired SKUs | 9 | `config/redirects/drinks-redirects.json` |
| 4 protocol/host redirects | 4 | `middleware.ts` (apex→www, http→https) |
| Other one-offs | 34 | various |

**Action:** none. These will fade over months as Google forgets the source URLs.

### A2. Alternative page with proper canonical tag — 11 URLs
UTM-tagged or query-parameter variants where the canonical tag correctly points at the parent URL.

**Action:** none. Working as designed.

### A3. Discovered — currently not indexed — 17 URLs
Google found via sitemap or links but hasn't crawled yet (mostly recent additions).

**Action:** none. Re-check in 30 days.

### A4. Stale GSC data — already-fixed pages reported under their old status (≈ 28 URLs)

**A4a. 17 tag URLs marked "Not found (404)"** — all 17 have redirects in place today. Last crawl of each was before the redirect was added.

| Slug | Redirect destination | Redirect added | Last crawled |
|---|---|---|---|
| mental-health, cider, feedback, children, private-dining, live-matches, terrestrial-sport, cash-prizes, traditional, family, british-history, pub-menu, annual-celebrations, mexican-culture, local-area, lunch | various (community / food-and-drink / sports / events / seasonal) — see `tag-redirects.json` lines 676–795 | 2026-03-02 (most) | 2026-01-06 to 2026-02-17 |
| craft-beer | /blog/tag/food-and-drink (in `additional-redirects.json:79–82`) | 2025-12-29 | 2025-11-15 |

**Action:** click "Validate fix" in GSC for the "Not found (404)" report. Wait for Google to re-crawl. No code change.

**A4b. 11 test/debug pages marked "Blocked by robots.txt"** — none of these match any `disallow` rule in current `app/robots.ts`. They were last crawled Jan–Mar 2026; the actual response today is most likely 404 because the routes don't exist in `app/`.

URLs: `/test-simple`, `/test-tracking`, `/test-reviews`, `/test-gtm`, `/test-navigation-tracking`, `/test-hours`, `/gtm-debug`, `/debug-hours`, `/components`, `/demo-header`, `/p5-demo`-adjacent.

**Action:** none. Will drop out of GSC reports as Google re-crawls.

---

## Group B — Real fixes

### B1. `robots.txt` `/*?dpl=*` rule blocks Vercel deploy-tagged static assets

**Evidence:**
- `app/robots.ts:13` declares `disallow: ['/*?dpl=*', ...]` — added 2026-02-18 (commit `bf1959b1`)
- `app/robots.ts:8` declares `allow: ['/', '/_next/static/']`
- 106 URLs flagged "Blocked by robots.txt" all match `/_next/static/css/HASH.css?dpl=DEPLOY_ID`
- Vercel auto-appends `?dpl=<deployment-id>` to static assets
- Latest `_next/static/` URL was crawled 2026-04-21, after the rule was added — so the rule is actively blocking, not stale

**Why it's an issue:** `/*?dpl=*` matches any URL containing `?dpl=`, including the static CSS/JS assets that Googlebot needs to fetch when rendering pages. The `allow: /_next/static/` rule is more general; Google's parser uses the more specific match (the dpl wildcard). We end up telling Googlebot it can't load our stylesheet during render.

The rule was presumably added to stop Google indexing the *HTML* version of `?dpl=` URLs. That's better solved with canonical tags (already in place) than with robots.txt.

**Proposed fix:** remove the line `'/*?dpl=*',` from the disallow list in `app/robots.ts`. Keep the rest. The `X-Robots-Tag: noindex, nofollow` header already on `_next/static/*` (set in `next.config.js:130-141`) prevents asset URLs appearing in search.

**Risk:** very low. Canonical tags already handle dedup.

**Files touched:** `app/robots.ts` (1 line removed).

**Resolves:** 106 URLs in "Blocked by robots.txt".

---

### B2. Past/removed `/events/*` URLs return 404 instead of redirecting

**Evidence:**
- 10 URLs in "Not found (404)" matching `/events/quiz-night-2026-XX-XX`, `/events/bingo-2026-XX-XX`, slugless `/events/karaoke`, `/events/drag-shows`, `/events/quiz-night`
- `app/sitemap.ts:268-274` excludes events older than `PAST_EVENT_REDIRECT_DAYS` from the sitemap, but no catch-all picks them up after that
- The 404'd events are ones the management API no longer returns

**Proposed fix:** add `app/events/[slug]/not-found.tsx` that calls `permanentRedirect('/whats-on')`. Any 404 hit on an `/events/<slug>` URL becomes a 308 redirect to the events index.

**Risk:** low. Live events route normally; only missing slugs hit the redirect.

**Files touched:** `app/events/[slug]/not-found.tsx` (new file).

**Resolves:** 10 URLs in "Not found (404)" + future drift.

---

### B4. 7 `/blog/tag/*` URLs hit "Redirect error"

**Evidence:**
- 7 URLs (3 apex + 4 www): `premier-league` (2×), `rugby` (2×), `pet-friendly` (2×), `dog-friendly` (1×)
- All four source tags have redirects in `tag-redirects.json` that were added on or before 2025-12-28 — *before* the GSC crawls (2026-01-05 to 2026-01-23)
- All four destinations (`community`, `sports`) are live tag pages with posts
- Apex variants double-hop: `the-anchor.pub` → `www.the-anchor.pub` (middleware) → `www.the-anchor.pub/blog/tag/<dest>` (next.config redirect)

**Hypothesis:** either Google's tooling flagged the 2-hop chain, or there was a transient response failure (timeout / cache miss) at crawl time.

**Proposed fix:** investigation only in v1. Once B1 and B2 ship and the site is re-crawled, click "Validate fix" in GSC for these 7 and see if the error clears. If it persists, we'll need to either:
- shorten the chain (rare — middleware host-canonicalisation is working correctly); or
- look at whether the destination pages had a transient render failure at crawl time.

**Risk:** none in v1 (no code change).

**Resolves:** to be determined.

---

### B5. Sitemap/redirect contradiction on `/drinks/baby-guinness`

**Evidence:**
- `app/sitemap.ts:110` declares `/drinks/baby-guinness` as a canonical URL
- `config/redirects/drinks-redirects.json` declares `/drinks/baby-guinness` → `/drinks` as a permanent redirect
- The page exists in `app/drinks/[slug]/...` (build output confirms it renders)
- GSC shows `/drinks/baby-guinness` in "Discovered — currently not indexed" — consistent with sitemap discovery, no redirect observed yet

**Proposed fix:** remove the entry `{ source: "/drinks/baby-guinness", destination: "/drinks", permanent: true }` from `config/redirects/drinks-redirects.json`. The page is live and listed in the sitemap.

**Audit follow-on:** scan all 76 entries in `drinks-redirects.json` against live drinks routes (`app/drinks/[slug]/...`) and remove any other contradictions. I will produce that diff once you approve B5.

**Risk:** low.

**Resolves:** 1 URL plus drift prevention.

---

## Group C — Quality / data hygiene

### C1. 116 URLs in "Crawled — currently not indexed"
Google crawled and chose not to index. Causes are content quality, duplication, or staleness — not technical errors.

| Pattern | Count | Likely cause |
|---|---|---|
| `/blog/tag/*` (consolidated thin tags) | 22 | Tag pages with 1–2 posts |
| `/post/*` (Wix legacy) | 16 | Old URLs, redirected, slow to drop out |
| `/event-details/*` (legacy) | 11 | Same |
| `/events/*` past dates | ~25 | Past events; expected to fall out |
| Individual `/blog/*` posts | ~30 | Older posts with low engagement |
| `/drinks/*` retired SKUs | 5 | Same as drinks-redirects |
| Misc one-offs | ~7 | Mostly UTM/query variants |

**Action:** most resolve once B1/B2/B5 ship. Thin tag consolidation and old-post review are out of scope here — flag as a follow-on SEO content task.

### C2. 52 blog posts marked "Excluded by 'noindex' tag"
Mechanism: `post.noindex` frontmatter, consumed at `app/blog/[slug]/page.tsx:140`. By design — author opt-in.

**Action:** spot-check 5 of the 52 to confirm intentional. If any should be indexable, remove the frontmatter on those posts.

### C3. 1 URL `/booking-confirmation` in "Excluded by 'noindex' tag"
Page now does `redirect('/book-table')`. The noindex flag is from a prior version. GSC report is stale.

**Action:** none.

### C4. `/hr` returns 404
No page at `app/hr/`, no redirect rule.

**Action:** add a redirect to whichever recruitment page is canonical. Destination needs your input.

### C5. `/images/page-headers/drinks/optimized/drinks-1920w` returns 404
Broken image URL.

**Action:** grep for the URL across the codebase, fix the source reference, or accept the 404.

---

## Proposed work sequence (revised)


[truncated at line 200 — original has 243 lines]
```

## Related Files (grep hints)

These files reference the basenames of changed files. They are hints for verification — not included inline. Read them only if a specific finding requires it.

```
.claude/fix-function/brief.md
.claude/fix-function/final-report.md
.claude/fix-function/phase-1/qa-specialist/test-matrix.md
.superpowers/brainstorm/50042-1777211709/content/hero-approaches.html
.superpowers/brainstorm/50042-1777211709/content/hero-design-proposal.html
.superpowers/brainstorm/62983-1773235742/approaches.html
.superpowers/brainstorm/62983-1773235742/architecture.html
.superpowers/brainstorm/62983-1773235742/confirmation-page.html
.superpowers/brainstorm/62983-1773235742/confirmation-v2.html
.superpowers/brainstorm/62983-1773235742/flow.html
```

## Workspace Conventions (`Cursor/CLAUDE.md`)

```markdown
# CLAUDE.md — Workspace Standards

Shared guidance for Claude Code across all projects. Project-level `CLAUDE.md` files take precedence over this one — always read them first.

## Default Stack

Next.js 15 App Router, React 19, TypeScript (strict), Tailwind CSS, Supabase (PostgreSQL + Auth + RLS), deployed on Vercel.

## Workspace Architecture

21 projects across three brands, plus shared tooling:

| Prefix | Brand | Examples |
|--------|-------|----------|
| `OJ-` | Orange Jelly | AnchorManagementTools, CheersAI2.0, Planner2.0, MusicBingo, CashBingo, QuizNight, The-Anchor.pub, DukesHeadLeatherhead.com, OrangeJelly.co.uk, WhatsAppVideoCreator |
| `GMI-` | GMI | MixerAI2.0 (canonical auth reference), TheCookbook, ThePantry |
| `BARONS-` | Barons | CareerHub, EventHub, BrunchLaunchAtTheStar, StPatricksDay, DigitalExperienceMockUp, WebsiteContent |
| (none) | Shared / test | Test, oj-planner-app |

## Core Principles

**How to think:**
- **Simplicity First** — make every change as simple as possible; minimal code impact
- **No Laziness** — find root causes; no temporary fixes; senior developer standards
- **Minimal Impact** — only touch what's necessary; avoid introducing bugs

**How to act:**
1. **Do ONLY what is asked** — no unsolicited improvements
2. **Ask ONE clarifying question maximum** — if unclear, proceed with safest minimal implementation
3. **Record EVERY assumption** — document in PR/commit messages
4. **One concern per changeset** — if a second concern emerges, park it
5. **Fail safely** — when in doubt, stop and request human approval

### Source of Truth Hierarchy

1. Project-level CLAUDE.md
2. Explicit task instructions
3. Existing code patterns in the project
4. This workspace CLAUDE.md
5. Industry best practices / framework defaults

## Ethics & Safety

AI MUST stop and request explicit approval before:
- Any operation that could DELETE user data or drop DB columns/tables
- Disabling authentication/authorisation or removing encryption
- Logging, sending, or storing PII in new locations
- Changes that could cause >1 minute downtime
- Using GPL/AGPL code in proprietary projects

## Communication

- When the user asks to "remove" or "clean up" something, clarify whether they mean a code change or a database/data cleanup before proceeding
- Ask ONE clarifying question maximum — if still unclear, proceed with the safest interpretation

## Debugging & Bug Fixes

- When fixing bugs, check the ENTIRE application for related issues, not just the reported area — ask: "Are there other places this same pattern exists?"
- When given a bug report: just fix it — don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user

## Code Changes

- Before suggesting new environment variables or database columns, check existing ones first — use `grep` to find existing env vars and inspect the current schema before proposing additions
- One logical change per commit; one concern per changeset

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- One task per subagent for focused execution

### 3. Task Tracking
- Write plan to `tasks/todo.md` with checkable items before starting
- Mark items complete as you go; document results when done

### 4. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules that prevent the same mistake; review lessons at session start

### 5. Verification Before Done
- Never mark a task complete without proving it works
- Run tests, check logs, demonstrate correctness
- Ask yourself: "Would a staff engineer approve this?"
- For non-trivial changes: pause and ask "is there a more elegant way?"

### 6. Codex Integration Hook
Uses OpenAI Codex CLI to audit, test and simulate — catches what Claude misses.

```
when: "running tests OR auditing OR simulating"
do:
  - run_skill(codex-review, target=current_task)
  - compare_outputs(claude_result, codex_result)
  - flag_discrepancies(threshold=medium)
  - merge_best_solution()
```

The full multi-specialist QA review skill lives in `~/.claude/skills/codex-qa-review/`. Trigger with "QA review", "codex review", "second opinion", or "check my work". Deploys four specialist agents (Bug Hunter, Security Auditor, Performance Analyst, Standards Enforcer) into a single prioritised report.

## Common Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint (zero warnings enforced)
npm test          # Run tests (Vitest unless noted otherwise)
npm run typecheck # TypeScript type checking (npx tsc --noEmit)
npx supabase db push   # Apply pending migrations (Supabase projects)
```

## Coding Standards

### TypeScript
- No `any` types unless absolutely justified with a comment
- Explicit return types on all exported functions
- Props interfaces must be named (not inline anonymous objects for complex props)
- Use `Promise<{ success?: boolean; error?: string }>` for server action return types

### Frontend / Styling
- Use design tokens only — no hardcoded hex colours in components
- Always consider responsive breakpoints (`sm:`, `md:`, `lg:`)
- No conflicting or redundant class combinations
- Design tokens should live in `globals.css` via `@theme inline` (Tailwind v4) or `tailwind.config.ts`
- **Never use dynamic Tailwind class construction** (e.g., `bg-${color}-500`) — always use static, complete class names due to Tailwind's purge behaviour

### Date Handling
- Always use the project's `dateUtils` (typically `src/lib/dateUtils.ts`) for display
- Never use raw `new Date()` or `.toISOString()` for user-facing dates
- Default timezone: Europe/London
- Key utilities: `getTodayIsoDate()`, `toLocalIsoDate()`, `formatDateInLondon()`

### Phone Numbers
- Always normalise to E.164 format (`+44...`) using `libphonenumber-js`

## Server Actions Pattern

All mutations use `'use server'` functions (typically in `src/app/actions/` or `src/actions/`):

```typescript
'use server';
export async function doSomething(params): Promise<{ success?: boolean; error?: string }> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  // ... permission check, business logic, audit log ...
  revalidatePath('/path');
  return { success: true };
}
```

## Database / Supabase

See `.claude/rules/supabase.md` for detailed patterns. Key rules:
- DB columns are `snake_case`; TypeScript types are `camelCase`
- Always wrap DB results with a conversion helper (e.g. `fromDb<T>()`)
- RLS is always on — use service role client only for system/cron operations
- Two client patterns: cookie-based auth client and service-role admin client

### Before Any Database Work
Before making changes to queries, migrations, server actions, or any code that touches the database, query the live schema for all tables involved:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name IN ('relevant_table') ORDER BY ordinal_position;
```
Also check for views referencing those tables — they will break silently if columns change:
```sql
SELECT table_name FROM information_schema.view_table_usage
WHERE table_name IN ('relevant_table');
```

### Migrations
- Always verify migrations don't conflict with existing timestamps
- Test the connection string works before pushing
- PostgreSQL views freeze their column lists — if underlying tables change, views must be recreated
- Never run destructive migrations (DROP COLUMN/TABLE) without explicit approval

## Git Conventions

See `.claude/rules/pr-and-git-standards.md` for full PR templates, branch naming, and reviewer checklists. Key rules:
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Never force-push to `main`
- One logical change per commit
- Meaningful commit messages explaining "why" not just "what"

## Rules Reference

Core rules (always loaded from `.claude/rules/`):

| File | Read when… |
|------|-----------|
| `ui-patterns.md` | Building or modifying UI components, forms, buttons, navigation, or accessibility |
| `testing.md` | Adding, modifying, or debugging tests; setting up test infrastructure |
| `definition-of-ready.md` | Starting any new feature — check requirements are clear before coding |
| `definition-of-done.md` | Finishing any feature — verify all quality gates pass |
| `complexity-and-incremental-dev.md` | Scoping a task that touches 4+ files or involves schema changes |
| `pr-and-git-standards.md` | Creating branches, writing commit messages, or opening PRs |
| `verification-pipeline.md` | Before pushing — run the full lint → typecheck → test → build pipeline |
| `supabase.md` | Any database query, migration, RLS policy, or client usage |

Domain rules (auto-injected from `.claude/docs/` when you edit relevant files):

| File | Domain |
|------|--------|
| `auth-standard.md` | Auth, sessions, middleware, RBAC, CSRF, password reset, invites |
| `background-jobs.md` | Async job queues, Vercel Cron, retry logic |
| `api-key-auth.md` | External API key generation, validation, rotation |
| `file-export.md` | PDF, DOCX, CSV generation and download |
| `rate-limiting.md` | Upstash rate limiting, 429 responses |
| `qr-codes.md` | QR code generation (client + server) |
| `toast-notifications.md` | Sonner toast patterns |
| `email-notifications.md` | Resend email, templates, audit logging |
| `ai-llm.md` | LLM client, prompts, token tracking, vision |
| `payment-processing.md` | Stripe/PayPal two-phase payment flows |
| `data-tables.md` | TanStack React Table v8 patterns |

## Quality Gates

A feature is only complete when it passes the full Definition of Done checklist (`.claude/rules/definition-of-done.md`). At minimum: builds, lints, type-checks, tests pass, no hardcoded secrets, auth checks in place, code commented where complex.
```

## Project Conventions (`CLAUDE.md`)

```markdown
# CLAUDE.md — The Anchor Pub Website

Project-specific guidance. The workspace CLAUDE.md at `/Users/peterpitcher/Cursor/CLAUDE.md` covers general standards (TypeScript, Tailwind, Supabase, Git, testing, auth). Read this file for what's unique to this project.

---

## ⚠ Before writing any customer-facing content — read the SSOT

**Mandatory pre-flight for any task that produces customer-facing content** (page copy, JSON-LD schemas, blog posts, social copy, marketing emails, email templates, press copy, alt text, meta descriptions, etc.):

1. Read **`docs/SSOT.md`** — the single source of truth for every brand and operational fact.
2. For structured lookups (menu prices, drinks inventory, hours), `SSOT.json` mirrors a subset of the SSOT in JSON.
3. **The SSOT wins.** If existing page copy disagrees with the SSOT, the page is wrong — not the SSOT. Fix the page.
4. **Do not invent facts.** If a claim you want to make is not in the SSOT, stop and ask. Do not infer, do not embellish, do not fall back on training data.
5. **When operational reality changes, update `docs/SSOT.md` first.** Page copy, JSON-LD, and the management DB all follow.

`docs/SSOT.md` covers: identity & voice · contact & location · opening hours · Sunday roast · weekday food · drinks · booking & deposits · venue/parking/amenities · beer garden · events · private hire · ratings · areas served · banned claims.

---

## Stack

- **Next.js 14** App Router, TypeScript, Tailwind CSS, CVA
- **No database** — this is a marketing/booking website only; all data lives in the management app
- **Hosting:** Vercel | **DNS:** Cloudflare | **Analytics:** Google Tag Manager
- **Tests:** Jest (`npm test`) in `tests/`

---

## Relationship with OJ-AnchorManagementTools

These two applications form a paired system. Understanding their relationship is essential before making changes to anything involving bookings, hours, or availability.

### What each app does

| | The Anchor Website (`OJ-The-Anchor.pub`) | Management App (`OJ-AnchorManagementTools`) |
|---|---|---|
| **Purpose** | Customer-facing marketing site + booking flow | Staff/admin tool for managing the pub |
| **Users** | Public customers | Staff and managers |
| **Database** | None | Supabase (PostgreSQL) — sole source of truth |
| **Hosting** | Vercel (this repo) | Vercel (separate repo at `/Users/peterpitcher/Cursor/OJ-AnchorManagementTools`) |

### Data flow

```
Management App (Supabase DB)
        │
        │  REST API (ANCHOR_API_KEY auth)
        │  Base URL: management.orangejelly.co.uk
        ▼
  Website (this repo)
  Next.js API routes proxy the calls
  (protects API key, handles CORS, adds caching)
```

The website **never writes to any database directly**. All mutations (create booking, submit enquiry, etc.) go through the management API.

### Key API endpoints the website consumes

| Endpoint | Purpose |
|---|---|
| `GET /business/hours` | Regular opening hours + special hours overrides |
| `GET /table-bookings/availability` | Available booking slots for a given date/type |
| `POST /table-bookings` | Create a table booking |
| `GET /events` | Upcoming events |
| `GET /menus` | Food/drink menus |

### Special hours override pattern

The management app stores per-date overrides in a `special_hours` table. The website receives these via `/business/hours`. Critical fields:

- `kitchen: null` — kitchen is closed for that date
- `is_kitchen_closed: true` — explicit kitchen closure flag (defence-in-depth)
- `is_closed: true` — full venue closure
- `schedule_config: []` — custom booking schedule for the date

**Important:** `kitchen: null` must be treated as a deliberate "closed" signal — not as "data absent". Use `??` not `||` when resolving special vs regular kitchen data. Using `||` will cause `null` to fall through to regular hours. This has bitten us before (March 2026 bug).

### Booking type → kitchen dependency

| Booking type | Requires kitchen |
|---|---|
| `sunday_lunch` | Yes |
| `food` | Yes |
| `drinks` | No |

If `is_kitchen_closed` or `kitchen === null` for a date, food/sunday_lunch slots must return empty. Drinks slots are unaffected.

### Key files in this repo that touch the management API

| File | Role |
|---|---|
| `lib/api.ts` | Main API client — `anchorAPI.*` methods. Also contains `buildTableAvailabilityFromBusinessHours()` (fallback slot generator) |
| `lib/table-booking-service-windows.ts` | `resolveServiceRanges()` — converts business hours into bookable time slots |
| `lib/hours-utils.ts` | `getEffectiveDayHours()`, `isKitchenClosed()` — correct `??`-based utilities for hours logic |
| `app/api/*/route.ts` | API proxy routes — never expose `ANCHOR_API_KEY` client-side |

---

## Critical Business Rules

These are short reminders. The full set of operational claims and banned phrases lives in **`docs/SSOT.md`** — read it before writing any content.

- **Brand:** Always "The Anchor" (not "The Anchor Pub") in customer-facing copy.
- **Contact:** manager@the-anchor.pub | 01753 682707.
- **Location:** Stanwell Moor, near Heathrow Airport.
- **Monday kitchen:** Always closed unless a special-hours record explicitly opens it.
- **Sunday lunch:** Walk-ins welcome 1pm – 6pm. **No pre-order, no Saturday cutoff, no per-roast prepayment** (changed at the 17 May 2026 walk-in launch). Blocked only if the kitchen is closed for that date.
- **Sunday roast menu (current):** Beef Topside £22 · Pork Leg £20 · Turkey w/ Stuffing Ball £19 · Beef & Ale Pie £21 · Chicken & Wild Mushroom Pie £21 · Vegan Wellington £20 · Kids Roast £14. Wellington is **vegan**, never "vegetarian". See `docs/SSOT.md` §4 for full rules (gravy, accompaniments, retired items).
- **Group deposit:** Groups of 10+ on any day, any booking type — £10 per person, deducted from the bill.
- **No service:** No breakfast, no delivery, no Sky/TNT Sports, no guest ales, no real-ale positioning, no wedding receptions, no accessible toilet, no baby changing.
- **Verified copy:** `docs/SSOT.md` is canonical. `SSOT.json` mirrors the structured subset.

---

## SEO & Domain

- **Canonical domain:** `https://www.the-anchor.pub` (with www — Cloudflare + Vercel)
- **Cloudflare TLS:** Must be "Full" or "Full (strict)" — never "Flexible" (causes redirect loops)

### Canonical URL pattern — DO NOT hardcode in root layout

```typescript
// app/layout.tsx — metadataBase only, NO alternates.canonical here
export const metadata: Metadata = {
  metadataBase: new URL('https://www.the-anchor.pub'),
}

// Individual pages — relative canonical
export const metadata: Metadata = {
  alternates: { canonical: './' },
}
```

Hardcoding `canonical` in the root layout makes every page claim to be the homepage. This was a past bug — don't repeat it.

---

## Architecture

```
app/                  Next.js App Router pages
  api/                Proxy routes to management API
  book-table/         Booking wizard flow
components/
  ui/                 Reusable primitives (Button, Input, Badge, etc.)
  features/           Business-domain components
  tracking/           GTM analytics components
lib/
  api.ts              Management API client + availability logic
  table-booking-service-windows.ts  Slot resolution
  hours-utils.ts      Business hours utilities
  gtm-events.ts       Analytics event helpers
  constants.ts        Business constants
public/               Static assets
docs/                 Documentation (SSOT.md ← canonical brand/claims source, api-integration.md, parking-api.md)
tests/                Jest test files
```

### Patterns

- **Default to Server Components.** Add `'use client'` only for interactivity.
- **API proxy pattern:** All calls to `management.orangejelly.co.uk` go through `app/api/*/route.ts`. Never call the management API directly from client components.
- **Hours single source of truth:** Use `lib/hours-utils.ts` utilities for any hours display logic. Do not re-implement hours parsing inline.
- **CVA for component variants** — use `cva()`, not ad-hoc Tailwind conditionals.

---

## Adding a New Page

```typescript
// app/new-route/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title | The Anchor Stanwell Moor',
  description: 'Page description',
  alternates: { canonical: './' },
}

export default function Page() {
  return <>{/* content */}</>
}
```

Also add the route to `app/sitemap.ts`.

---

## Analytics

```typescript
'use client'
import { trackEventName } from '@/lib/gtm-events'

<Button onClick={() => trackEventName('source_location')}>Action</Button>
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `ANCHOR_API_KEY` | Auth key for management.orangejelly.co.uk |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID |
| `NEXT_PUBLIC_AVIATIONSTACK_API_KEY` | Flight data (Heathrow parking feature) |
```

## Rule: `/Users/peterpitcher/Cursor/.claude/rules/definition-of-done.md`

```markdown
# Definition of Done (DoD)

A feature is ONLY complete when ALL applicable items pass. This extends the Quality Gates in the root CLAUDE.md.

## Code Quality

- [ ] Builds successfully — `npm run build` with zero errors
- [ ] Linting passes — `npm run lint` with zero warnings
- [ ] Type checks pass — `npx tsc --noEmit` clean (or project equivalent)
- [ ] No `any` types unless justified with a comment
- [ ] No hardcoded secrets or API keys
- [ ] No hardcoded hex colours — use design tokens
- [ ] Server action return types explicitly typed

## Testing

- [ ] All existing tests pass
- [ ] New tests written for business logic (happy path + at least 1 error case)
- [ ] Coverage meets project minimum (default: 80% on business logic)
- [ ] External services mocked — never hit real APIs in tests
- [ ] If no test suite exists yet, note this in the PR as tech debt

## Security

- [ ] Auth checks in place — server actions re-verify server-side
- [ ] Permission checks present — RBAC enforced on both UI and server
- [ ] Input validation complete — all user inputs sanitised (Zod or equivalent)
- [ ] No new PII logging, sending, or storing without approval
- [ ] RLS verified (Supabase projects) — queries respect row-level security

## Accessibility

- [ ] Interactive elements have visible focus styles
- [ ] Colour is not the sole indicator of state
- [ ] Modal dialogs trap focus and close on Escape
- [ ] Tables have proper `<thead>`, `<th scope>` markup
- [ ] Images have meaningful `alt` text
- [ ] Keyboard navigation works for all interactive elements

## Documentation

- [ ] Complex logic commented — future developers can understand "why"
- [ ] README updated if new setup, config, or env vars are needed
- [ ] Environment variables documented in `.env.example`
- [ ] Breaking changes noted in PR description

## Deployment

- [ ] Database migrations tested locally before pushing
- [ ] Rollback plan documented for schema changes
- [ ] No console.log or debug statements left in production code
- [ ] Verification pipeline passes (see `verification-pipeline.md`)
```

## Rule: `/Users/peterpitcher/Cursor/.claude/rules/supabase.md`

```markdown
# Supabase Conventions

## Client Patterns

Two Supabase client patterns — always use the correct one:

```typescript
// Server-side auth (anon key + cookie session) — use for auth checks:
const supabase = await getSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();

// Server-side data (service-role, bypasses RLS) — use for system/cron operations:
const db = await getDb(); // or createClient() with service role
const { data } = await db.from("table").select("*").eq("id", id).single();

// Browser-only (client components):
const supabase = getSupabaseBrowserClient();
```

ESLint rules should prevent importing the admin/service-role client in client components.

## snake_case ↔ camelCase Conversion

DB columns are always `snake_case`; TypeScript types are `camelCase` with Date objects. Always wrap DB results:

```typescript
import { fromDb } from "@/lib/utils";
const record = fromDb<MyType>(dbRow); // converts snake_case keys + ISO strings → Date
```

All type definitions should live in a central types file (e.g. `src/types/database.ts`).

## Row Level Security (RLS)

- RLS is always enabled on all tables
- Use the anon-key client for user-scoped operations (respects RLS)
- Use the service-role client only for system operations, crons, and webhooks
- Never disable RLS "temporarily" — create a proper service-role path instead

## Migrations

```bash
npx supabase db push          # Apply pending migrations
npx supabase migration new    # Create a new migration file
```

- Migrations live in `supabase/migrations/`
- Full schema reference in `supabase/schema.sql` (paste into SQL Editor for fresh setup)
- Never run destructive migrations (DROP COLUMN/TABLE) without explicit approval
- Test migrations locally with `npx supabase db push --dry-run` before pushing (see `verification-pipeline.md`)

### Dropping columns or tables — mandatory function audit

When a migration drops a column or table, you MUST search for every function and trigger that references it and update them in the same migration. Failing to do so leaves silent breakage: PL/pgSQL functions that reference a dropped column/table throw an exception at runtime, and if any of those functions have an `EXCEPTION WHEN OTHERS THEN` handler, the error is swallowed and returned as a generic blocked/failure state — making the bug invisible until someone notices the feature is broken.

**Before writing any `DROP COLUMN` or `DROP TABLE`:**

```sql
-- Find all functions that reference the column or table
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition ILIKE '%column_or_table_name%'
  AND routine_type = 'FUNCTION';
```

Or search the migrations directory:
```bash
grep -r "column_or_table_name" supabase/migrations/ --include="*.sql" -l
```

For each function found: update it in the same migration to remove or replace the reference. Never leave a function referencing infrastructure that no longer exists.

This also applies to **triggers** — check trigger functions separately:
```bash
grep -r "column_or_table_name" supabase/migrations/ --include="*.sql" -n
```

## Auth

- Supabase Auth with JWT + HTTP-only cookies
- Auth checks happen in layout files or middleware
- Server actions must always re-verify auth server-side (never rely on UI hiding)
- Public routes must be explicitly allowlisted

## Audit Logging

All mutations (create, update, delete) in server actions must call `logAuditEvent()`:

```typescript
await logAuditEvent({
  user_id: user.id,
  operation_type: 'update',
  resource_type: 'thing',
  operation_status: 'success'
});
```
```

## Rule: `/Users/peterpitcher/Cursor/.claude/rules/ui-patterns.md`

```markdown
# UI Patterns & Component Standards

## Server vs Client Components

- Default to **Server Components** — only add `'use client'` when you need interactivity, hooks, or browser APIs
- Server Components can fetch data directly (no useEffect/useState for data loading)
- Client Components should receive data as props from server parents where possible

## Data Fetching & Display

Every data-driven UI must handle all three states:
1. **Loading** — skeleton loaders or spinners (not blank screens)
2. **Error** — user-facing error message or error boundary
3. **Empty** — meaningful empty state component (not just no content)

## Forms

- Use React Hook Form + Zod for validation where configured
- Validation errors displayed inline, not just console logs
- Required field indicators visible
- Loading/disabled state during submission (prevent double-submit)
- Server action errors surfaced to user via toast or inline message
- Form reset after successful submission where appropriate

## Buttons

Check every button for:
- Consistent variant usage (primary, secondary, destructive, ghost) — no ad-hoc Tailwind-only buttons
- Loading states on async actions (spinner/disabled during server action calls)
- Disabled states when form is invalid or submission in progress
- `type="button"` to prevent accidental form submission (use `type="submit"` only on submit buttons)
- Confirmation dialogs on destructive actions (delete, archive, bulk operations)
- `aria-label` on icon-only buttons

## Navigation

- Breadcrumbs on nested pages
- Active state on current nav item
- Back/cancel navigation returns to correct parent page
- New sections added to project navigation with correct permission gating
- Mobile responsiveness of all nav elements

## Permissions (RBAC)

- Every authenticated page must check permissions via the project's permission helper
- UI elements (edit, delete, create buttons) conditionally rendered based on permissions
- Server actions must re-check permissions server-side (never rely on UI hiding alone)

## Accessibility Baseline

These items are also enforced in the Definition of Done (`definition-of-done.md`):

- Interactive elements have visible focus styles
- Colour is not the only indicator of state
- Modal dialogs trap focus and close on Escape
- Tables use proper `<thead>`, `<th scope>` markup
- Images have meaningful `alt` text
- Keyboard navigation works for all interactive elements
```

---

_End of pack._
