# Review Pack: book-table-purpose-chooser

**Generated:** 2026-04-29
**Mode:** B (A=Adversarial / B=Code / C=Spec Compliance)
**Project root:** `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub`
**Base ref:** `8eb2141`
**HEAD:** `27f74c0`
**Diff range:** `8eb2141...HEAD`
**Stats:**  8 files changed, 271 insertions(+), 390 deletions(-)

> This pack is the sole input for reviewers. Do NOT read files outside it unless a specific finding requires verification. If a file not in the pack is needed, mark the finding `Needs verification` and describe what would resolve it.

## Changed Files

```
app/api/booking/agent/route.ts
app/api/table-bookings/availability/route.ts
app/api/table-bookings/route.ts
app/book-table/page.tsx
components/features/TableBooking/ManagementTableBookingForm.tsx
lib/api/bookings.ts
lib/api/client.ts
lib/table-booking-service-windows.ts
```

## User Concerns

Submit-time purpose derivation must always select the correct value for the chosen slot, even via the nearest-alternative path. Customer-facing copy must contain ZERO references to food/drinks/booking-type/booking-purpose/kitchen-hours/bar-hours except the per-slot caption. The new combined availability contract must preserve correctness around special-hours edge cases (kitchen: null, is_kitchen_closed, special-day kitchen-open override). The /api/table-bookings POST endpoint must still validate purpose against service windows for direct API submissions.

## Diff (`8eb2141...HEAD`)

```diff
diff --git a/app/api/booking/agent/route.ts b/app/api/booking/agent/route.ts
index d528a61..9a28be3 100644
--- a/app/api/booking/agent/route.ts
+++ b/app/api/booking/agent/route.ts
@@ -172,18 +172,20 @@ export async function GET(request: Request) {
   const { searchParams } = new URL(request.url)
   const date = searchParams.get('date')
   const partySize = searchParams.get('partySize')
-  // The `type` query param is still accepted for backwards compatibility but
-  // is read-only — Sunday-lunch as a separate booking type is retired (spec §6).
+  // The `type` and `purpose` query params are still accepted for backwards
+  // compatibility but are read-only no-ops on the GET path. Public availability
+  // is now combined (drinks + food) and exposes `kitchen_open` per slot
+  // (spec §6, §9). Sunday-lunch as a separate booking type is also retired.
   void searchParams.get('type')
-  const purposeParam = searchParams.get('purpose')
-  
+  void searchParams.get('purpose')
+
   if (!date) {
     return jsonResponse({
       success: false,
       error: 'Date parameter required'
     }, 400)
   }
-  
+
   try {
     // Parse natural language date if needed
     let checkDate = date
@@ -197,13 +199,9 @@ export async function GET(request: Request) {
       }
       checkDate = parsedDate
     }
-    
-    // Sunday-lunch as a separate booking type is retired (spec §6, §8.1).
-    // Treat every day as 'regular'. The legacy `type` query param is still
-    // accepted for backwards compatibility but it no longer changes behaviour.
+
     const isSunday = new Date(checkDate + 'T12:00:00').getDay() === 0
     const bookingType: BookingType = 'regular'
-    const purpose: BookingPurpose = purposeParam === 'drinks' ? 'drinks' : 'food'
     const normalizedPartySize = Number.parseInt(partySize || '2', 10)
 
     const availabilityParams = new URLSearchParams({
@@ -211,9 +209,7 @@ export async function GET(request: Request) {
       time: '12:00',
       party_size: Number.isFinite(normalizedPartySize) && normalizedPartySize > 0
         ? String(normalizedPartySize)
-        : '2',
-      booking_type: bookingType,
-      purpose
+        : '2'
     })
 
     const availabilityUrl = new URL('/api/table-bookings/availability', request.url)
@@ -241,28 +237,41 @@ export async function GET(request: Request) {
     }
 
     const availability = availabilityBody?.data || availabilityBody
-    
-    return jsonResponse({
-      success: true,
-      date: checkDate,
-      available: availability.available,
-      times:
-        availability.time_slots?.map((slot: any) => {
+
+    type UpstreamSlot = {
+      time?: string
+      available?: boolean
+      available_capacity?: number
+      kitchen_open?: boolean
+    }
+
+    const times = Array.isArray(availability?.time_slots)
+      ? (availability.time_slots as UpstreamSlot[]).map((slot) => {
           const availableCapacity =
             typeof slot.available_capacity === 'number'
               ? slot.available_capacity
               : 0
-          return {
-            time: slot.time,
+          const entry: { time: string; available: boolean; kitchen_open?: boolean } = {
+            time: String(slot.time ?? ''),
             available: slot.available ?? availableCapacity > 0
           }
-        }) || [],
+          if (typeof slot.kitchen_open === 'boolean') {
+            entry.kitchen_open = slot.kitchen_open
+          }
+          return entry
+        })
+      : []
+
+    return jsonResponse({
+      success: true,
+      date: checkDate,
+      available: availability.available,
+      times,
       isSunday,
       bookingType,
-      purpose,
       message: availability.message || availability.special_notes
     })
-    
+
   } catch (error: unknown) {
     return jsonResponse({
       success: false,
diff --git a/app/api/table-bookings/availability/route.ts b/app/api/table-bookings/availability/route.ts
index 6658944..6ac1ee1 100644
--- a/app/api/table-bookings/availability/route.ts
+++ b/app/api/table-bookings/availability/route.ts
@@ -1,13 +1,12 @@
 import { anchorAPI, type BusinessHours, type TableAvailabilityResponse } from '@/lib/api'
 import { createApiErrorResponse, logError } from '@/lib/error-handling'
 import {
-  buildSlotsFromRanges,
+  buildSlotsWithKitchenState,
   isValidIsoDate,
   isValidTime,
   londonNowParts,
   normalizeTime,
-  resolveServiceRanges,
-  type BookingPurpose,
+  resolveCombinedServiceRanges,
   type BookingType
 } from '@/lib/table-booking-service-windows'
 
@@ -18,20 +17,20 @@ function parsePositiveInt(value: string | null, fallback: number): number {
   return parsed
 }
 
-function buildFallbackAvailability(
+function buildCombinedAvailability(
   businessHours: BusinessHours,
   options: {
     date: string
     partySize: number
     time: string
     bookingType: BookingType
-    purpose: BookingPurpose
   }
 ): TableAvailabilityResponse {
-  const { ranges, message } = resolveServiceRanges(businessHours, options.date, {
-    bookingType: options.bookingType,
-    purpose: options.purpose
-  })
+  const { ranges, kitchenRanges, message } = resolveCombinedServiceRanges(
+    businessHours,
+    options.date,
+    { bookingType: options.bookingType }
+  )
 
   const londonNow = londonNowParts()
   const minMinutesForToday =
@@ -39,7 +38,14 @@ function buildFallbackAvailability(
       ? Math.ceil((londonNow.minutes + 60) / 30) * 30
       : undefined
 
-  const timeSlots = buildSlotsFromRanges(ranges, options.partySize, 30, minMinutesForToday)
+  const timeSlots = buildSlotsWithKitchenState(
+    ranges,
+    kitchenRanges,
+    options.partySize,
+    30,
+    minMinutesForToday
+  )
+
   const available = timeSlots.some(
     (slot) => slot.available === true || (slot.available_capacity || 0) >= options.partySize
   )
@@ -48,9 +54,7 @@ function buildFallbackAvailability(
     message ||
     (available
       ? 'These times are based on current service windows and will be confirmed instantly when you continue.'
-      : options.purpose === 'food'
-      ? 'No online food times are currently available for this request. You can try drinks-only times or call us.'
-      : 'No online times are currently available for this request. Please choose an alternative or join the waitlist.')
+      : 'No online times are currently available for this request. Please choose another date or call 01753 682707.')
 
   return {
     date: options.date,
@@ -60,9 +64,7 @@ function buildFallbackAvailability(
     time_slots: timeSlots,
     message: fallbackMessage,
     special_notes:
-      options.purpose === 'food'
-        ? 'Food bookings follow kitchen service hours. For later slots, switch to drinks-only or call 01753 682707.'
-        : 'If your preferred time is unavailable, choose a nearby slot or call 01753 682707 to join the waitlist.'
+      'If your preferred time is unavailable, choose a nearby slot or call 01753 682707.'
   }
 }
 
@@ -71,15 +73,14 @@ export async function GET(request: Request) {
   const date = searchParams.get('date')
   const partySizeRaw = searchParams.get('party_size')
   const requestedTime = searchParams.get('time') || '19:00'
-  // Sunday-lunch as a separate booking type is retired with the walk-in launch
-  // (spec §6, §8.1). The booking_type query param is still accepted for
-  // backwards compatibility but every request resolves as 'regular'.
+
+  // booking_type and purpose query params are accepted for backwards compatibility
+  // with stale links/clients but are intentionally ignored: the public availability
+  // contract is now a single combined slot list with per-slot kitchen_open.
   void searchParams.get('booking_type')
+  void searchParams.get('purpose')
   const bookingType: BookingType = 'regular'
 
-  const purpose: BookingPurpose =
-    searchParams.get('purpose') === 'drinks' ? 'drinks' : 'food'
-
   if (!date || !partySizeRaw) {
     return createApiErrorResponse(
       'Missing required parameters: date and party_size are required',
@@ -100,12 +101,11 @@ export async function GET(request: Request) {
 
   try {
     const businessHours = await anchorAPI.getBusinessHours()
-    const fallback = buildFallbackAvailability(businessHours, {
+    const fallback = buildCombinedAvailability(businessHours, {
       date,
       partySize,
       time: normalizedTime,
-      bookingType,
-      purpose
+      bookingType
     })
 
     return new Response(
@@ -114,7 +114,7 @@ export async function GET(request: Request) {
         data: fallback,
         meta: {
           source: 'schedule_fallback',
-          purpose
+          service_model: 'combined_food_drinks'
         }
       }),
       {
@@ -129,8 +129,7 @@ export async function GET(request: Request) {
       date,
       time: normalizedTime,
       partySize,
-      bookingType,
-      purpose
+      bookingType
     })
 
     return createApiErrorResponse(
diff --git a/app/api/table-bookings/route.ts b/app/api/table-bookings/route.ts
index 313c071..930e13b 100644
--- a/app/api/table-bookings/route.ts
+++ b/app/api/table-bookings/route.ts
@@ -205,12 +205,12 @@ function validatePayload(payload: ManagementTableBookingPayload): string | null
   return null
 }
 
-function buildServiceWindowError(payload: ManagementTableBookingPayload): string {
-  if (payload.purpose === 'food') {
-    return 'Food bookings are only available during kitchen hours. For later bookings, switch to drinks-only or call 01753 682707.'
-  }
-
-  return 'That time is outside our drinks booking window. Please choose another time or call 01753 682707.'
+// Customer-facing copy is intentionally neutral (no food/drinks/kitchen/bar
+// references) so the public booking flow no longer exposes the internal
+// purpose classification (spec §7, plan T5). Server-side logging still
+// records `purpose` for diagnostics — see logError calls below.
+function buildServiceWindowError(_payload: ManagementTableBookingPayload): string {
+  return 'That time is outside online booking hours. Please choose another time or call 01753 682707.'
 }
 
 export async function POST(request: NextRequest) {
diff --git a/app/book-table/page.tsx b/app/book-table/page.tsx
index 7b1247a..3c878ac 100644
--- a/app/book-table/page.tsx
+++ b/app/book-table/page.tsx
@@ -43,7 +43,6 @@ type BookTablePageProps = {
     date?: string
     time?: string
     party_size?: string
-    purpose?: string
   }
 }
 
@@ -54,19 +53,15 @@ function parsePartySize(value?: string): number | undefined {
   return Math.min(Math.max(parsed, 1), 20)
 }
 
-function parsePurpose(value?: string): 'food' | 'drinks' | undefined {
-  if (value === 'food' || value === 'drinks') return value
-  return undefined
-}
-
 export default function BookPage({ searchParams }: BookTablePageProps) {
-  // sunday_lunch and mothers_day query params are silently ignored — Sunday-lunch
-  // as a separate booking type is retired with the walk-in launch (spec §6, §8.1).
+  // sunday_lunch, mothers_day, and purpose query params are silently ignored.
+  // Sunday-lunch as a separate booking type is retired with the walk-in launch
+  // (spec §6, §8.1); the booking purpose chooser is replaced by per-slot
+  // kitchen-open captions and submit-time derivation (spec §5, §8).
   const prefill = {
     date: searchParams?.date,
     time: searchParams?.time,
-    partySize: parsePartySize(searchParams?.party_size),
-    purpose: parsePurpose(searchParams?.purpose)
+    partySize: parsePartySize(searchParams?.party_size)
   }
 
   return (
diff --git a/components/features/TableBooking/ManagementTableBookingForm.tsx b/components/features/TableBooking/ManagementTableBookingForm.tsx
index 2265bcd..9a96c19 100644
--- a/components/features/TableBooking/ManagementTableBookingForm.tsx
+++ b/components/features/TableBooking/ManagementTableBookingForm.tsx
@@ -29,7 +29,6 @@ import { PayPalDepositSection } from './PayPalDepositSection'
 
 const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
 
-type BookingPurpose = 'food' | 'drinks'
 type LookupState = 'idle' | 'loading' | 'known' | 'unknown'
 type BookingStep = 'find' | 'choose' | 'details' | 'review'
 
@@ -80,6 +79,7 @@ type AvailabilitySlot = {
   available?: boolean
   available_capacity: number
   reason?: string
+  kitchen_open?: boolean
 }
 
 type AvailabilityData = {
@@ -90,11 +90,14 @@ type AvailabilityData = {
   special_notes?: string
 }
 
-type AlternativeSlot = {
+type SelectedSlotService = {
   date: string
   time: string
+  kitchen_open?: boolean
 }
 
+type AlternativeSlot = SelectedSlotService
+
 type SuggestedEvent = {
   id: string
   slug: string | null
@@ -110,7 +113,6 @@ interface ManagementTableBookingFormProps {
     date?: string
     time?: string
     partySize?: number
-    purpose?: BookingPurpose
   }
 }
 
@@ -224,7 +226,9 @@ function normalizeAvailabilityResponse(payload: any): AvailabilityData {
       time,
       available,
       available_capacity: availableCapacity,
-      reason: typeof source.reason === 'string' ? source.reason : undefined
+      reason: typeof source.reason === 'string' ? source.reason : undefined,
+      kitchen_open:
+        typeof source.kitchen_open === 'boolean' ? source.kitchen_open : undefined
     })
   }
 
@@ -524,6 +528,12 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
   const [date, setDate] = useState(defaultDate)
   const [requestedTime, setRequestedTime] = useState(defaultRequestedTime)
   const [selectedTime, setSelectedTime] = useState<string>('')
+  // Captured at slot-select time so the submit step can derive `purpose`
+  // ('food' | 'drinks') from the slot's `kitchen_open` flag without re-fetching
+  // availability — covers the nearest-alternative path where the slot is not
+  // in the current `availability.time_slots`.
+  const [selectedSlotService, setSelectedSlotService] =
+    useState<SelectedSlotService | null>(null)
 
   const [availability, setAvailability] = useState<AvailabilityData | null>(null)
   const [availabilityLoading, setAvailabilityLoading] = useState(false)
@@ -531,10 +541,6 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
   const [dateError, setDateError] = useState<string | null>(null)
   const [alternativeSlots, setAlternativeSlots] = useState<AlternativeSlot[]>([])
   const [alternativesLoading, setAlternativesLoading] = useState(false)
-  const [drinksAlternative, setDrinksAlternative] = useState<{
-    available: boolean
-    slotCount: number
-  } | null>(null)
   const [eventsByDate, setEventsByDate] = useState<Record<string, SuggestedEvent[]>>({})
   const [eventErrorsByDate, setEventErrorsByDate] = useState<Record<string, string>>({})
   const [eventsLoadingDate, setEventsLoadingDate] = useState<string | null>(null)
@@ -552,7 +558,6 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
   const [firstName, setFirstName] = useState('')
   const [lastName, setLastName] = useState('')
   const [email, setEmail] = useState('')
-  const [purpose, setPurpose] = useState<BookingPurpose>(prefill?.purpose || 'food')
   const [notes, setNotes] = useState('')
 
   const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
@@ -644,8 +649,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
 
     return {
       summary: parts.join(' · '),
-      footer:
-        'Tables booked here are for dining — you’re welcome to come in any time during bar hours for a drink first, no booking needed.'
+      footer: null as string | null
     }
   }, [date, businessHours])
 
@@ -763,14 +767,12 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
   async function fetchAvailabilityForDate(
     targetDate: string,
     targetTime: string,
-    targetPurpose: BookingPurpose,
     signal?: AbortSignal
   ): Promise<AvailabilityData> {
     const params = new URLSearchParams({
       date: targetDate,
       party_size: String(partySize),
-      time: targetTime,
-      purpose: targetPurpose
+      time: targetTime
     })
 
     const response = await fetch(`/api/table-bookings/availability?${params.toString()}`, {
@@ -791,7 +793,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     return normalizeAvailabilityResponse(body)
   }
 
-  async function loadNearestAlternatives(targetDate: string, targetTime: string, targetPurpose: BookingPurpose) {
+  async function loadNearestAlternatives(targetDate: string, targetTime: string) {
     setAlternativesLoading(true)
     setAlternativeSlots([])
 
@@ -800,7 +802,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
       const candidateResponses = await Promise.all(
         dateCandidates.map(async (candidateDate) => {
           try {
-            return await fetchAvailabilityForDate(candidateDate, targetTime, targetPurpose)
+            return await fetchAvailabilityForDate(candidateDate, targetTime)
           } catch {
             return null
           }
@@ -814,7 +816,11 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
         const slots = response.time_slots
           .filter((slot) => isSlotAvailable(slot, partySize))
           .slice(0, 2)
-          .map((slot) => ({ date: response.date || targetDate, time: slot.time }))
+          .map((slot) => ({
+            date: response.date || targetDate,
+            time: slot.time,
+            kitchen_open: slot.kitchen_open
+          }))
 
         alternatives.push(...slots)
         if (alternatives.length >= 6) {
@@ -831,7 +837,6 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
   async function runAvailabilitySearch(input: {
     targetDate: string
     targetTime: string
-    targetPurpose: BookingPurpose
     source: string
     context: string
     signal?: AbortSignal
@@ -849,7 +854,6 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     const availabilityData = await fetchAvailabilityForDate(
       input.targetDate,
       input.targetTime,
-      input.targetPurpose,
       input.signal
     )
     const closestTime = pickClosestSlot(availabilityData.time_slots, input.targetTime, partySize)
@@ -858,29 +862,12 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     setRequestedTime(input.targetTime)
     setAvailability(availabilityData)
     setSelectedTime(closestTime || '')
+    // A new availability response invalidates the previous slot selection.
+    setSelectedSlotService(null)
     setStep('choose')
 
     if (!closestTime) {
-      void loadNearestAlternatives(input.targetDate, input.targetTime, input.targetPurpose)
-
-      // Auto-check drinks availability when food returns no slots
-      if (input.targetPurpose === 'food') {
-        try {
-          const drinksData = await fetchAvailabilityForDate(
-            input.targetDate,
-            input.targetTime,
-            'drinks',
-            input.signal
-          )
-          const drinksSlots = (drinksData.time_slots || []).filter((s) => isSlotAvailable(s, partySize))
-          setDrinksAlternative({
-            available: drinksSlots.length > 0,
-            slotCount: drinksSlots.length
-          })
-        } catch {
-          setDrinksAlternative(null)
-        }
-      }
+      void loadNearestAlternatives(input.targetDate, input.targetTime)
     }
   }
 
@@ -912,15 +899,13 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     setResult(null)
     setAvailabilityLoading(true)
     setAlternativeSlots([])
-    setDrinksAlternative(null)
 
     try {
       await runAvailabilitySearch({
         targetDate: date,
         targetTime: requestedTime,
-        targetPurpose: purpose,
         source: 'book_table_find_table',
-        context: `availability_first_${purpose}`,
+        context: 'availability_first',
         signal: controller.signal
       })
     } catch (availabilityFailure: unknown) {
@@ -952,9 +937,14 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     })
   }
 
-  function handleSlotSelect(slotTime: string) {
-    setSelectedTime(slotTime)
-    setRequestedTime(slotTime)
+  function handleSlotSelect(slot: AvailabilitySlot) {
+    setSelectedTime(slot.time)
+    setRequestedTime(slot.time)
+    setSelectedSlotService({
+      date,
+      time: slot.time,
+      kitchen_open: slot.kitchen_open
+    })
     trackTableBookingClick({
       source: 'book_table_slot_selected',
       context: 'availability_step'
@@ -965,6 +955,14 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     setDate(alternative.date)
     setRequestedTime(alternative.time)
     setSelectedTime(alternative.time)
+    // Carry the alternative's kitchen_open through so submit-time purpose
+    // derivation can find the slot even though the current `availability`
+    // belongs to the originally-requested date.
+    setSelectedSlotService({
+      date: alternative.date,
+      time: alternative.time,
+      kitchen_open: alternative.kitchen_open
+    })
     setStep('details')
     setError(null)
   }
@@ -999,7 +997,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     setAvailability(null)
     setAlternativeSlots([])
     setSelectedTime('')
-    setDrinksAlternative(null)
+    setSelectedSlotService(null)
     if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
       const todayMidnight = new Date()
       todayMidnight.setHours(0, 0, 0, 0)
@@ -1014,20 +1012,6 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     }
   }
 
-  function handlePurposeSelection(nextPurpose: BookingPurpose) {
-    if (nextPurpose === purpose) return
-
-    markFunnelStart()
-    setPurpose(nextPurpose)
-    setDrinksAlternative(null)
-
-    setSelectedTime('')
-    setAvailability(null)
-    setAvailabilityError(null)
-    setAlternativeSlots([])
-    setError(null)
-  }
-
   function renderDateEventSuggestions(options: {
     title: string
     description: string
@@ -1216,6 +1200,28 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     setStep('review')
   }
 
+  // Derive the management-API `purpose` field from the chosen slot's
+  // `kitchen_open` flag. Strict rule (spec §8 → "Submit Purpose Derivation"):
+  //   1. Prefer `selectedSlotService` if it matches the current date/time.
+  //   2. Otherwise look up the slot in the current `availability.time_slots`.
+  //   3. If a matching slot exists and `kitchen_open === false`, return 'drinks'.
+  //   4. If a matching slot exists and `kitchen_open` is `true` or `undefined`, return 'food'.
+  //   5. If no matching slot can be found, return null — the caller must block submit.
+  function deriveSubmitPurpose(): 'food' | 'drinks' | null {
+    const matchService =
+      selectedSlotService &&
+      selectedSlotService.date === date &&
+      selectedSlotService.time === selectedTime
+        ? selectedSlotService
+        : null
+    if (matchService) {
+      return matchService.kitchen_open === false ? 'drinks' : 'food'
+    }
+    const slot = availability?.time_slots.find((s) => s.time === selectedTime)
+    if (!slot) return null
+    return slot.kitchen_open === false ? 'drinks' : 'food'
+  }
+
   async function handleConfirmBooking() {
     setError(null)
     setResult(null)
@@ -1229,6 +1235,13 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
       return
     }
 
+    const purpose = deriveSubmitPurpose()
+    if (!purpose) {
+      setError('Please choose a time again before confirming.')
+      setStep('choose')
+      return
+    }
+
     const trimmedPhone = phone.trim()
     const resolvedFirstName = firstName.trim()
     const resolvedLastName = lastName.trim()
@@ -1258,6 +1271,8 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
       // Public payload no longer carries sunday_lunch / menu_selections / booking_type.
       // The proxy at /api/table-bookings strips these defensively (spec §6, §8.1)
       // and always forwards booking_type='regular' to the management API.
+      // `purpose` is derived from the selected slot's kitchen_open flag — see
+      // deriveSubmitPurpose() above.
       const payload = {
         phone: trimmedPhone,
         default_country_code: '44',
@@ -1370,11 +1385,11 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     setDate(defaultDate)
     setRequestedTime(defaultRequestedTime)
     setSelectedTime('')
+    setSelectedSlotService(null)
     setAvailability(null)
     setAvailabilityError(null)
     setAlternativeSlots([])
     setAlternativesLoading(false)
-    setDrinksAlternative(null)
     setDismissedEventDates([])
     setSelectedSuggestedEvent(null)
     setPhone('')
@@ -1384,7 +1399,6 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
     setFirstName('')
     setLastName('')
     setEmail('')
-    setPurpose(prefill?.purpose || 'food')
     setNotes('')
     setPolicyAccepted(false)
     setError(null)
@@ -1510,7 +1524,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
             <div>
               <h3 className="text-lg font-semibold text-anchor-gold-vivid">Find a table</h3>
               <p className="mt-1 text-sm text-anchor-cream-text/70">
-                {`Start with party size, date, booking type, and time. We'll ask for contact details after you pick a slot.`}
+                {`Start with party size, date, and time. We'll ask for contact details after you pick a slot.`}
               </p>
             </div>
 
@@ -1520,7 +1534,9 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                   {formatDateForDisplay(date)}
                 </p>
                 <p className="mt-1">{hoursNote.summary}</p>
-                <p className="mt-2 text-xs text-anchor-cream-text/60">{hoursNote.footer}</p>
+                {hoursNote.footer ? (
+                  <p className="mt-2 text-xs text-anchor-cream-text/60">{hoursNote.footer}</p>
+                ) : null}
               </div>
             ) : null}
 
@@ -1540,7 +1556,7 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                 if (Number.isNaN(parsed)) return
                 const clamped = Math.min(Math.max(parsed, 1), 20)
                 setPartySize(clamped)
-                setDrinksAlternative(null)
+                setSelectedSlotService(null)
               }}
               onBlur={() => {
                 const parsed = Number.parseInt(partySizeDisplay, 10)
@@ -1571,26 +1587,6 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
               }}
             />
 
-            <div>
-              <label htmlFor="table-booking-purpose-find" className="mb-1 block text-sm font-medium text-anchor-cream-text/70">
-                Booking for
-              </label>
-              <select
-                id="table-booking-purpose-find"
-                value={purpose}
-                onChange={(event) => handlePurposeSelection(event.target.value === 'drinks' ? 'drinks' : 'food')}
-                className="w-full rounded-lg border border-anchor-gold/30 bg-anchor-bg-card px-4 py-2 text-anchor-cream-text focus:border-transparent focus:outline-none focus:ring-2 focus:ring-anchor-gold"
-              >
-                <option value="food">Food (kitchen hours)</option>
-                <option value="drinks">Drinks (bar hours)</option>
-              </select>
-              <p className="mt-2 text-xs text-anchor-cream-text/60">
-                {purpose === 'food'
-                  ? 'Food bookings are shown within kitchen service hours.'
-                  : 'Drinks-only bookings can include later bar slots when available.'}
-              </p>
-            </div>
-
             {(showDateEventSuggestions || selectedDateEventsLoading) &&
               renderDateEventSuggestions({
                 title: 'Events on this date',
@@ -1622,9 +1618,6 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
               <p className="mt-1 text-sm text-anchor-cream-text/70">
                 {formatDateForDisplay(date)} for {partySize} {partySize === 1 ? 'guest' : 'guests'}.
               </p>
-              <p className="mt-1 text-xs text-anchor-cream-text/60">
-                Showing {purpose === 'drinks' ? 'drinks-only' : 'food'} slots.
-              </p>
             </div>
 
             {availabilityLoading ? (
@@ -1639,14 +1632,21 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                     <button
                       key={slot.time}
                       type="button"
-                      onClick={() => handleSlotSelect(slot.time)}
-                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
+                      onClick={() => handleSlotSelect(slot)}
+                      className={`rounded-xl border px-3 py-3 text-center transition-colors ${
                         isSelected
                           ? 'border-anchor-gold bg-anchor-gold/15 text-anchor-gold-vivid'
                           : 'border-anchor-gold/25 bg-anchor-bg-card text-anchor-cream-text hover:border-anchor-gold'
                       }`}
                     >
-                      {formatTimeForDisplay(slot.time)}
+                      <span className="block text-base font-semibold">
+                        {formatTimeForDisplay(slot.time)}
+                      </span>
+                      {typeof slot.kitchen_open === 'boolean' ? (
+                        <span className="mt-1 block text-xs font-normal text-anchor-cream-text/60">
+                          {slot.kitchen_open ? 'Drinks & food' : 'Drinks only'}
+                        </span>
+                      ) : null}
                     </button>
                   )
                 })}
@@ -1661,27 +1661,6 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
               </Alert>
             )}
 
-            {drinksAlternative?.available && purpose === 'food' && availableSlots.length === 0 && (
-              <div className="rounded-xl border border-anchor-gold/30 bg-anchor-gold/10 p-4 text-center">
-                <p className="text-sm font-semibold text-anchor-gold-vivid mb-2">
-                  Our kitchen is closed, but the bar is open
-                </p>
-                <p className="text-sm text-anchor-cream-text/80 mb-3">
-                  {drinksAlternative.slotCount} drinks-only {drinksAlternative.slotCount === 1 ? 'time' : 'times'} available
-                </p>
-                <button
-                  type="button"
-                  onClick={() => {
-                    setDrinksAlternative(null)
-                    handlePurposeSelection('drinks')
-                  }}
-                  className="rounded-xl border border-anchor-gold bg-anchor-gold/20 px-4 py-2 text-sm font-semibold text-anchor-gold-vivid hover:bg-anchor-gold/30 transition-colors"
-                >
-                  Check drinks availability
-                </button>
-              </div>
-            )}
-
             {(showDateEventSuggestions || selectedDateEventsLoading) &&
               renderDateEventSuggestions({
                 title:
@@ -1851,24 +1830,13 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
             ) : null}
 
             {detailsUnlocked ? (
-              <>
-                <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-4 text-sm text-anchor-cream-text/70">
-                  <p className="font-semibold text-anchor-cream-text">
-                    Booking for: {purpose === 'drinks' ? 'Drinks (bar hours)' : 'Food (kitchen hours)'}
-                  </p>
-                  <p className="mt-1 text-xs text-anchor-cream-text/60">
-                    Need to switch between food and drinks? Go back to step 1 and tap Find a table again.
-                  </p>
-                </div>
-
-                <Textarea
-                  label="Notes (optional)"
-                  value={notes}
-                  onChange={(event) => setNotes(event.target.value)}
-                  placeholder="Special requests, accessibility needs, occasion details..."
-                  rows={3}
-                />
-              </>
+              <Textarea
+                label="Notes (optional)"
+                value={notes}
+                onChange={(event) => setNotes(event.target.value)}
+                placeholder="Special requests, accessibility needs, occasion details..."
+                rows={3}
+              />
             ) : null}
 
             <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
@@ -1906,10 +1874,6 @@ export function ManagementTableBookingForm({ prefill }: ManagementTableBookingFo
                   <dt className="font-medium">Time</dt>
                   <dd>{formatTimeForDisplay(selectedTime || requestedTime)}</dd>
                 </div>
-                <div className="flex justify-between gap-3">
-                  <dt className="font-medium">Booking for</dt>
-                  <dd>{purpose === 'drinks' ? 'Drinks' : 'Food'}</dd>
-                </div>
                 <div className="flex justify-between gap-3">
                   <dt className="font-medium">Mobile</dt>
                   <dd>{phone}</dd>
diff --git a/lib/api/bookings.ts b/lib/api/bookings.ts
index 1fcc653..1494957 100644
--- a/lib/api/bookings.ts
+++ b/lib/api/bookings.ts
@@ -6,6 +6,7 @@ export interface TableAvailabilitySlot {
   available_capacity: number
   reason?: string
   requires_prepayment?: boolean
+  kitchen_open?: boolean
 }
 
 export interface TableAvailabilityResponse {
diff --git a/lib/api/client.ts b/lib/api/client.ts
index a4079a8..a8645b2 100644
--- a/lib/api/client.ts
+++ b/lib/api/client.ts
@@ -3,13 +3,20 @@
 import { logError } from '@/lib/error-handling'
 import { getManagementApiBaseUrl } from '@/lib/management-api-base'
 import { computeLargeGroupDepositAmount } from '@/lib/constants'
+import {
+  buildSlotsWithKitchenState,
+  londonNowParts,
+  normalizeTime,
+  resolveCombinedServiceRanges,
+  type BookingType
+} from '@/lib/table-booking-service-windows'
 
 import type { EventsResponse, EventCategoriesResponse, EventAvailability, Event } from './events'
 import { FALLBACK_EVENT_CATEGORIES, createFallbackEvent, createFallbackEventsResponse } from './events'
 import type { MenuResponse, DietaryMenuResponse, SundayLunchMenuResponse, MenuSectionItem } from './menu'
 import { FALLBACK_SUNDAY_LUNCH_MENU } from './menu'
 import type { BusinessHours, AmenitiesResponse } from './hours'
-import type { TableAvailabilitySlot, TableAvailabilityResponse, TableBookingRequest, TableBookingResponse } from './bookings'
+import type { TableAvailabilityResponse, TableBookingRequest, TableBookingResponse } from './bookings'
 import type {
   ParkingRateCard,
   ParkingAvailabilitySlot,
@@ -417,156 +424,26 @@ export class AnchorAPI {
       booking_type?: 'regular' | 'sunday_lunch'
     }
   ): TableAvailabilityResponse {
-    const bookingType = params.booking_type === 'sunday_lunch' ? 'sunday_lunch' : 'regular'
-    const normalizeClock = (value: string): string => {
-      if (/^\d{2}:\d{2}$/.test(value)) return value
-      if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5)
-      return value
-    }
-    const isValidClock = (value: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
-    const toMinutes = (value: string): number => {
-      const normalized = normalizeClock(value)
-      const [hours, minutes] = normalized.split(':')
-      return (Number.parseInt(hours || '0', 10) * 60) + Number.parseInt(minutes || '0', 10)
-    }
-    const toClock = (totalMinutes: number): string => {
-      const normalized = ((totalMinutes % 1440) + 1440) % 1440
-      const hours = Math.floor(normalized / 60)
-      const minutes = normalized % 60
-      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
-    }
-    const londonNowParts = (): { isoDate: string; minutes: number } => {
-      const formatter = new Intl.DateTimeFormat('en-CA', {
-        timeZone: 'Europe/London',
-        year: 'numeric',
-        month: '2-digit',
-        day: '2-digit',
-        hour: '2-digit',
-        minute: '2-digit',
-        hour12: false
-      })
-      const parts = formatter.formatToParts(new Date())
-      const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
-      return {
-        isoDate: `${map.year}-${map.month}-${map.day}`,
-        minutes: (Number.parseInt(map.hour || '0', 10) * 60) + Number.parseInt(map.minute || '0', 10)
-      }
-    }
+    // The public availability contract is now combined: a single bookable slot
+    // set with `kitchen_open` stamped per slot, regardless of any `booking_type`
+    // or `purpose` hint. Mirror `app/api/table-bookings/availability/route.ts`.
+    const bookingType: BookingType = 'regular'
+    const normalizedTime = normalizeTime(params.time)
+
+    const { ranges, kitchenRanges, closed, message } = resolveCombinedServiceRanges(
+      businessHours,
+      params.date,
+      { bookingType }
+    )
 
-    const [yearRaw, monthRaw, dayRaw] = params.date.split('-')
-    const year = Number.parseInt(yearRaw || '', 10)
-    const month = Number.parseInt(monthRaw || '', 10)
-    const day = Number.parseInt(dayRaw || '', 10)
-    const dayKey = Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)
-      ? new Date(Date.UTC(year, month - 1, day))
-          .toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })
-          .toLowerCase()
-      : 'monday'
-
-    const regularDay = (businessHours.regularHours?.[dayKey] || null) as Record<string, unknown> | null
-    const specialDay = ((businessHours.specialHours || []) as Array<Record<string, unknown>>).find(
-      (entry) => entry?.date === params.date
-    ) || null
-
-    const isClosed =
-      specialDay?.status === 'closed' ||
-      specialDay?.is_closed === true ||
-      (specialDay && specialDay.opens === null && specialDay.closes === null) ||
-      regularDay?.is_closed === true
-
-    if (isClosed) {
+    if (closed) {
       return {
         date: params.date,
-        time: normalizeClock(params.time),
+        time: normalizedTime,
         party_size: params.party_size,
         available: false,
         time_slots: [],
-        message: 'We are closed on that date. Please choose another day.'
-      }
-    }
-
-    const parseScheduleConfig = (value: unknown): Array<{ startsAt: string; endsAt: string; bookingType?: string; capacity: number }> => {
-      if (!Array.isArray(value)) return []
-      const entries: Array<{ startsAt: string; endsAt: string; bookingType?: string; capacity: number }> = []
-
-      for (const entry of value) {
-        if (!entry || typeof entry !== 'object') continue
-
-        const source = entry as Record<string, unknown>
-        const startsAt = normalizeClock(String(source.starts_at || ''))
-        const endsAt = normalizeClock(String(source.ends_at || ''))
-        if (!isValidClock(startsAt) || !isValidClock(endsAt) || toMinutes(endsAt) <= toMinutes(startsAt)) {
-          continue
-        }
-
-        const rawCapacity = source.capacity
-        const parsedCapacity =
-          typeof rawCapacity === 'number'
-            ? Math.floor(rawCapacity)
-            : typeof rawCapacity === 'string'
-            ? Number.parseInt(rawCapacity, 10)
-            : 50
-
-        entries.push({
-          startsAt,
-          endsAt,
-          bookingType: this.asTrimmedString(source.booking_type),
-          capacity: Number.isFinite(parsedCapacity) && parsedCapacity > 0 ? parsedCapacity : 50
-        })
-      }
-
-      return entries
-    }
-
-    const scheduleConfig = parseScheduleConfig(
-      (specialDay?.schedule_config as unknown) ?? (regularDay?.schedule_config as unknown)
-    )
-    const typedSchedule = scheduleConfig.filter((entry) => entry.bookingType === bookingType)
-    const fallbackSchedule = bookingType === 'regular' && typedSchedule.length === 0
-      ? scheduleConfig
-      : typedSchedule
-
-    const ranges = fallbackSchedule.map((entry) => ({
-      startsAt: entry.startsAt,
-      endsAt: entry.endsAt,
-      capacity: entry.capacity
-    }))
-
-    if (ranges.length === 0) {
-      const kitchen = (specialDay !== null
-        ? (specialDay?.kitchen as any ?? null)
-        : (regularDay?.kitchen as any ?? null)) as Record<string, unknown> | null
-      const kitchenOpens = typeof kitchen?.opens === 'string' ? normalizeClock(kitchen.opens) : null
-      const kitchenCloses = typeof kitchen?.closes === 'string' ? normalizeClock(kitchen.closes) : null
-
-      if (bookingType === 'sunday_lunch') {
-        return {
-          date: params.date,
-          time: normalizeClock(params.time),
-          party_size: params.party_size,
-          available: false,
-          time_slots: [],
-          message: 'Sunday lunch is unavailable for that date. Please choose another date or call us.'
-        }
-      } else {
-        const venueOpens = normalizeClock(String(specialDay?.opens || regularDay?.opens || kitchenOpens || '12:00'))
-        const venueCloses = normalizeClock(String(specialDay?.closes || regularDay?.closes || kitchenCloses || '22:00'))
-        if (!isValidClock(venueOpens) || !isValidClock(venueCloses) || toMinutes(venueCloses) <= toMinutes(venueOpens)) {
-          return {
-            date: params.date,
-            time: normalizeClock(params.time),
-            party_size: params.party_size,
-            available: false,
-            time_slots: [],
-            message: 'We could not determine available times for that date.'
-          }
-        }
-
-        ranges.push({
-          startsAt: venueOpens,
-          endsAt: venueCloses,
-          capacity: 50
-        })
+        message: message || 'We are closed on that date. Please choose another day.'
       }
     }
 
@@ -576,57 +453,29 @@ export class AnchorAPI {
         ? Math.ceil((londonNow.minutes + 60) / 30) * 30
         : undefined
 
-    const slots = new Map<string, TableAvailabilitySlot>()
-    for (const range of ranges) {
-      const start = toMinutes(range.startsAt)
-      const end = toMinutes(range.endsAt)
-      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue
-
-      for (let cursor = start; cursor < end; cursor += 30) {
-        if (typeof minMinutesForToday === 'number' && cursor < minMinutesForToday) {
-          continue
-        }
-
-        const slotTime = toClock(cursor)
-        const availableCapacity = Math.max(range.capacity, 0)
-        const isAvailable = availableCapacity >= params.party_size
-        const existing = slots.get(slotTime)
-
-        if (!existing) {
-          slots.set(slotTime, {
-            time: slotTime,
-            available: isAvailable,
-            available_capacity: availableCapacity,
-            reason: isAvailable ? undefined : 'party_too_large'
-          })
-          continue
-        }
-
-        const mergedCapacity = Math.max(existing.available_capacity || 0, availableCapacity)
-        const mergedAvailable = mergedCapacity >= params.party_size
-        slots.set(slotTime, {
-          ...existing,
-          available_capacity: mergedCapacity,
-          available: mergedAvailable,
-          reason: mergedAvailable ? undefined : existing.reason || 'party_too_large'
-        })
-      }
-    }
+    const timeSlots = buildSlotsWithKitchenState(
+      ranges,
+      kitchenRanges,
+      params.party_size,
+      30,
+      minMinutesForToday
+    )
 
-    const timeSlots = Array.from(slots.values()).sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
-    const available = timeSlots.some((slot) => slot.available === true || (slot.available_capacity || 0) >= params.party_size)
+    const available = timeSlots.some(
+      (slot) => slot.available === true || (slot.available_capacity || 0) >= params.party_size
+    )
 
     return {
       date: params.date,
-      time: normalizeClock(params.time),
+      time: normalizedTime,
       party_size: params.party_size,
       available,
       time_slots: timeSlots,
-      message: available
+      message: message || (available
         ? 'These times are based on current service windows and will be confirmed instantly when you continue.'
-        : 'No online times are currently available for this request. Please choose an alternative or join the waitlist.',
+        : 'No online times are currently available for this request. Please choose another date or call 01753 682707.'),
       special_notes:
-        'If your preferred time is unavailable, choose a nearby slot or call 01753 682707 to join the waitlist.'
+        'If your preferred time is unavailable, choose a nearby slot or call 01753 682707.'
     }
   }
 
diff --git a/lib/table-booking-service-windows.ts b/lib/table-booking-service-windows.ts
index 14ad7f0..ac1328c 100644
--- a/lib/table-booking-service-windows.ts
+++ b/lib/table-booking-service-windows.ts
@@ -331,3 +331,67 @@ export function resolveServiceRanges(
     closed: false
   }
 }
+
+export type CombinedServiceRangeResolution = {
+  ranges: ServiceRange[]
+  kitchenRanges: ServiceRange[]
+  closed: boolean
+  message?: string
+}
+
+export function resolveCombinedServiceRanges(
+  businessHours: BusinessHours,
+  isoDate: string,
+  options?: { bookingType?: BookingType }
+): CombinedServiceRangeResolution {
+  const bookingType: BookingType = options?.bookingType ?? 'regular'
+
+  const drinks = resolveServiceRanges(businessHours, isoDate, {
+    bookingType,
+    purpose: 'drinks'
+  })
+
+  if (drinks.closed) {
+    return {
+      ranges: [],
+      kitchenRanges: [],
+      closed: true,
+      message: drinks.message
+    }
+  }
+
+  const food = resolveServiceRanges(businessHours, isoDate, {
+    bookingType,
+    purpose: 'food'
+  })
+
+  return {
+    ranges: drinks.ranges,
+    kitchenRanges: food.closed ? [] : food.ranges,
+    closed: false,
+    message: drinks.message
+  }
+}
+
+export function buildSlotsWithKitchenState(
+  ranges: ServiceRange[],
+  kitchenRanges: ServiceRange[],
+  partySize: number,
+  slotIntervalMinutes = 30,
+  minMinutesForToday?: number
+): Array<{
+  time: string
+  available: boolean
+  available_capacity: number
+  reason?: string
+  kitchen_open: boolean
+}> {
+  const baseSlots = buildSlotsFromRanges(ranges, partySize, slotIntervalMinutes, minMinutesForToday)
+  return baseSlots.map((slot) => ({
+    time: slot.time,
+    available: slot.available ?? false,
+    available_capacity: slot.available_capacity,
+    reason: slot.reason,
+    kitchen_open: isTimeWithinRanges(slot.time, kitchenRanges)
+  }))
+}
```

## Changed File Contents

### `app/api/booking/agent/route.ts`

```
import { NextRequest } from 'next/server'
import { anchorAPI } from '@/lib/api'
import type { TableBookingRequest } from '@/lib/api'
import { checkSpamProtection } from '@/lib/spam-protection'
import {
  isTimeWithinRanges,
  normalizeTime,
  resolveServiceRanges,
  type BookingPurpose,
  type BookingType
} from '@/lib/table-booking-service-windows'

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * AI Agent Booking Endpoint
 * Accepts structured JSON for direct booking creation
 * Designed for GPT-5 and other AI agents
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    const spam = await checkSpamProtection(request, body)
    if (spam.blocked) return spam.response

    // Validate required fields
    if (!body.date || !body.time || !body.partySize || !body.customer) {
      return jsonResponse({
        success: false,
        error: 'Missing required fields: date, time, partySize, customer'
      }, 400)
    }
    
    // Validate customer data
    if (!body.customer.firstName || !body.customer.lastName || !body.customer.phone) {
      return jsonResponse({
        success: false,
        error: 'Missing customer fields: firstName, lastName, phone'
      }, 400)
    }
    
    // Parse natural language date if needed
    let bookingDate = body.date
    if (isNaN(Date.parse(bookingDate))) {
      // Try to parse natural language dates
      bookingDate = parseNaturalDate(body.date)
      if (!bookingDate) {
        return jsonResponse({
          success: false,
          error: `Unable to parse date: ${body.date}. Please use YYYY-MM-DD format or natural language like "tomorrow" or "next Sunday"`
        }, 400)
      }
    }
    
    // Sunday-lunch as a separate booking type is retired with the walk-in launch
    // (spec §6, §8.1). The AI-agent endpoint creates regular bookings on every
    // day; deposit messaging below is gated on partySize >= 10 alone.
    const bookingType: BookingType = 'regular'
    const purpose: BookingPurpose = body.purpose === 'drinks' ? 'drinks' : 'food'
    const normalizedBookingTime = normalizeTime(String(body.time))

    try {
      const businessHours = await anchorAPI.getBusinessHours()
      const serviceWindow = resolveServiceRanges(businessHours, bookingDate, {
        bookingType,
        purpose
      })

      const canBookTime =
        !serviceWindow.closed &&
        serviceWindow.ranges.length > 0 &&
        isTimeWithinRanges(normalizedBookingTime, serviceWindow.ranges)

      if (!canBookTime) {
        const message =
          serviceWindow.message ||
          (purpose === 'food'
            ? 'Food bookings are only available during kitchen service hours. Please choose another time or switch to drinks.'
            : 'That time is outside our drinks booking window. Please choose another time or call 01753 682707.')

        return jsonResponse({
          success: false,
          error: {
            code: 'OUTSIDE_SERVICE_WINDOW',
            message
          }
        }, 400)
      }
    } catch (error) {
      console.error('AI agent service window check failed:', error)
      return jsonResponse({
        success: false,
        error: {
          code: 'SERVICE_WINDOW_CHECK_FAILED',
          message: 'We could not verify service hours right now. Please try again or call 01753 682707.'
        }
      }, 503)
    }
    
    // Create booking request
    const bookingRequest: TableBookingRequest = {
      booking_type: bookingType,
      date: bookingDate,
      time: body.time,
      party_size: body.partySize,
      purpose,
      customer: {
        first_name: body.customer.firstName,
        last_name: body.customer.lastName,
        email: body.customer.email,
        mobile_number: body.customer.phone,
        sms_opt_in: body.customer.smsOptIn ?? false
      },
      duration_minutes: body.duration || 120,
      special_requirements: body.specialRequirements,
      dietary_requirements: body.dietaryRequirements,
      allergies: body.allergies,
      celebration_type: body.occasion,
      source: 'ai_agent'
    }
    
    // Create booking via API
    const booking = await anchorAPI.createTableBooking(bookingRequest)
    
    // Return structured response for AI agent
    return jsonResponse({
      success: true,
      booking: {
        reference: booking.booking_reference,
        status: booking.status,
        date: booking.confirmation_details?.date || bookingDate,
        time: booking.confirmation_details?.time || body.time,
        partySize: booking.confirmation_details?.party_size || body.partySize,
        type: bookingType,
        purpose,
        customer: {
          name: `${body.customer.firstName} ${body.customer.lastName}`,
          phone: body.customer.phone
        },
        message: `Booking confirmed for ${body.partySize} people on ${formatDateForDisplay(bookingDate)} at ${formatTimeForDisplay(body.time)}`,
        specialInstructions: body.partySize >= 10
          ? 'Bookings of 10 or more require a £10 per person deposit, fully deducted from your bill on the day.'
          : null
      }
    })
    
  } catch (error: unknown) {
    console.error('AI agent booking error:', error)

    // Return structured error for AI agent
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking',
      suggestion: 'Please verify all fields are correct or call the restaurant at 01753 682707'
    }, 500)
  }
}

/**
 * GET endpoint for AI agents to check availability
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const partySize = searchParams.get('partySize')
  // The `type` and `purpose` query params are still accepted for backwards
  // compatibility but are read-only no-ops on the GET path. Public availability
  // is now combined (drinks + food) and exposes `kitchen_open` per slot
  // (spec §6, §9). Sunday-lunch as a separate booking type is also retired.
  void searchParams.get('type')
  void searchParams.get('purpose')

  if (!date) {
    return jsonResponse({
      success: false,
      error: 'Date parameter required'
    }, 400)
  }

  try {
    // Parse natural language date if needed
    let checkDate = date
    if (isNaN(Date.parse(checkDate))) {
      const parsedDate = parseNaturalDate(date)
      if (!parsedDate) {
        return jsonResponse({
          success: false,
          error: `Unable to parse date: ${date}`
        }, 400)
      }
      checkDate = parsedDate

[truncated at line 200 — original has 376 lines]
```

### `app/api/table-bookings/availability/route.ts`

```
import { anchorAPI, type BusinessHours, type TableAvailabilityResponse } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import {
  buildSlotsWithKitchenState,
  isValidIsoDate,
  isValidTime,
  londonNowParts,
  normalizeTime,
  resolveCombinedServiceRanges,
  type BookingType
} from '@/lib/table-booking-service-windows'

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

function buildCombinedAvailability(
  businessHours: BusinessHours,
  options: {
    date: string
    partySize: number
    time: string
    bookingType: BookingType
  }
): TableAvailabilityResponse {
  const { ranges, kitchenRanges, message } = resolveCombinedServiceRanges(
    businessHours,
    options.date,
    { bookingType: options.bookingType }
  )

  const londonNow = londonNowParts()
  const minMinutesForToday =
    londonNow.isoDate === options.date
      ? Math.ceil((londonNow.minutes + 60) / 30) * 30
      : undefined

  const timeSlots = buildSlotsWithKitchenState(
    ranges,
    kitchenRanges,
    options.partySize,
    30,
    minMinutesForToday
  )

  const available = timeSlots.some(
    (slot) => slot.available === true || (slot.available_capacity || 0) >= options.partySize
  )

  const fallbackMessage =
    message ||
    (available
      ? 'These times are based on current service windows and will be confirmed instantly when you continue.'
      : 'No online times are currently available for this request. Please choose another date or call 01753 682707.')

  return {
    date: options.date,
    time: options.time,
    party_size: options.partySize,
    available,
    time_slots: timeSlots,
    message: fallbackMessage,
    special_notes:
      'If your preferred time is unavailable, choose a nearby slot or call 01753 682707.'
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const partySizeRaw = searchParams.get('party_size')
  const requestedTime = searchParams.get('time') || '19:00'

  // booking_type and purpose query params are accepted for backwards compatibility
  // with stale links/clients but are intentionally ignored: the public availability
  // contract is now a single combined slot list with per-slot kitchen_open.
  void searchParams.get('booking_type')
  void searchParams.get('purpose')
  const bookingType: BookingType = 'regular'

  if (!date || !partySizeRaw) {
    return createApiErrorResponse(
      'Missing required parameters: date and party_size are required',
      400
    )
  }

  if (!isValidIsoDate(date)) {
    return createApiErrorResponse('Date must use YYYY-MM-DD format', 400)
  }

  const normalizedTime = normalizeTime(requestedTime)
  if (!isValidTime(normalizedTime)) {
    return createApiErrorResponse('Time must use HH:mm or HH:mm:ss format', 400)
  }

  const partySize = parsePositiveInt(partySizeRaw, 2)

  try {
    const businessHours = await anchorAPI.getBusinessHours()
    const fallback = buildCombinedAvailability(businessHours, {
      date,
      partySize,
      time: normalizedTime,
      bookingType
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: fallback,
        meta: {
          source: 'schedule_fallback',
          service_model: 'combined_food_drinks'
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (fallbackError: any) {
    logError('api/table-bookings/availability-fallback', fallbackError, {
      date,
      time: normalizedTime,
      partySize,
      bookingType
    })

    return createApiErrorResponse(
      'We couldn\'t check table availability right now. Please try again or call us at 01753 682707.',
      503
    )
  }
}
```

### `app/api/table-bookings/route.ts`

```
import { NextRequest } from 'next/server'
import { anchorAPI } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { getSafeUpstreamErrorMessage, safeJsonParse } from '@/lib/upstream-json'
import {
  isTimeWithinRanges,
  normalizeTime,
  resolveServiceRanges
} from '@/lib/table-booking-service-windows'
import { checkSpamProtection } from '@/lib/spam-protection'

const API_BASE_URL = getManagementApiBaseUrl()
const API_KEY = process.env.ANCHOR_API_KEY

type BookingPurpose = 'food' | 'drinks'

type ManagementTableBookingPayload = {
  phone: string
  first_name?: string
  last_name?: string
  email?: string
  date: string
  time: string
  party_size: number
  purpose: BookingPurpose
  notes?: string
  dietary_requirements?: string[]
  allergies?: string[]
  default_country_code?: string
}

type LegacyTableBookingPayload = {
  date?: string
  time?: string
  party_size?: number
  purpose?: BookingPurpose
  customer?: {
    first_name?: string
    last_name?: string
    email?: string
    mobile_number?: string
  }
  customer_phone?: string
  special_requirements?: string
  dietary_requirements?: string[] | string
  allergies?: string[] | string
  celebration_type?: string
  notes?: string
}

function mergeNotes(...parts: Array<string | undefined>): string | undefined {
  const merged = parts
    .map((part) => asTrimmedString(part))
    .filter((part): part is string => Boolean(part))

  if (merged.length === 0) return undefined
  return merged.join('\n')
}

function createIdempotencyKey(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function asPositiveInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.floor(value)
    return rounded > 0 ? rounded : undefined
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value.trim(), 10)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  return undefined
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => asTrimmedString(entry))
      .filter((entry): entry is string => Boolean(entry))
  }

  const single = asTrimmedString(value)
  return single ? [single] : []
}

// Parses either of the two shapes the site currently sends -- the "management"
// top-level shape (ManagementTableBookingForm) and the legacy nested
// shape with a customer{} wrapper -- into the single structured payload the
// management API expects.
//
// Defence in depth (spec §6, §8.1): the public proxy strips inbound
// `sunday_lunch` and `booking_type` from every payload before forwarding,
// regardless of value. Hostile or stale clients sending sunday_lunch=true or
// booking_type='sunday_lunch' are silently neutralised. We always forward
// booking_type='regular' to the management API.
function normaliseIncomingPayload(input: unknown): {
  payload?: ManagementTableBookingPayload
  error?: string
} {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid request body' }
  }

  const body = input as Record<string, unknown>

  // Top-level first_name/last_name/email/phone (management form) takes
  // precedence; fall back to the nested customer{} object for any legacy
  // callers. Either is accepted.
  const customer = (body.customer && typeof body.customer === 'object'
    ? (body.customer as Record<string, unknown>)
    : {}) as Record<string, unknown>

  const phone =
    asTrimmedString(body.phone) ||
    asTrimmedString(customer.mobile_number) ||
    asTrimmedString(body.customer_phone)

  const firstName = asTrimmedString(body.first_name) || asTrimmedString(customer.first_name)
  const lastName = asTrimmedString(body.last_name) || asTrimmedString(customer.last_name)
  const email = asTrimmedString(body.email) || asTrimmedString(customer.email)

  const date = asTrimmedString(body.date)
  const time = asTrimmedString(body.time)
  const partySize = asPositiveInt(body.party_size)
  const defaultCountryCode = asTrimmedString(body.default_country_code)

  // purpose defaults to food (kitchen bookings are the common case via this
  // route). booking_type and sunday_lunch from the inbound body are ignored.
  const explicitPurpose =
    body.purpose === 'drinks' ? 'drinks' : body.purpose === 'food' ? 'food' : undefined
  const purpose: BookingPurpose = explicitPurpose ?? 'food'

  if (!phone || !date || !time || !partySize) {
    return { error: 'Missing required fields: phone, date, time, party_size, purpose' }
  }

  const dietaryRequirements = toStringList(body.dietary_requirements)
  const allergies = toStringList(body.allergies)

  // notes is strictly the user's free-text. Sunday-lunch pre-order menu_selections
  // are no longer supported on the public path (spec §6, §8.1) — Sundays are
  // regular food bookings now.
  const userNote =
    asTrimmedString(body.special_requirements) || asTrimmedString(body.notes)
  const occasionNote = asTrimmedString((body as LegacyTableBookingPayload).celebration_type)
  const notes = mergeNotes(
    occasionNote ? `Occasion: ${occasionNote}` : undefined,
    userNote
  )

  return {
    payload: {
      phone,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(email ? { email } : {}),
      date,
      time,
      party_size: partySize,
      purpose,
      ...(notes ? { notes } : {}),
      ...(dietaryRequirements.length > 0 ? { dietary_requirements: dietaryRequirements } : {}),
      ...(allergies.length > 0 ? { allergies } : {}),
      ...(defaultCountryCode ? { default_country_code: defaultCountryCode } : {}),
    },
  }
}

function validatePayload(payload: ManagementTableBookingPayload): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
    return 'Date must use YYYY-MM-DD format'
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(payload.time)) {
    return 'Time must use HH:mm or HH:mm:ss format'
  }

  if (payload.party_size < 1 || payload.party_size > 20) {
    return 'Party size must be between 1 and 20'
  }

  const phoneDigits = payload.phone.replace(/\D/g, '')
  if (phoneDigits.length < 7) {
    return 'Please enter a valid phone number'
  }


[truncated at line 200 — original has 319 lines]
```

### `app/book-table/page.tsx`

```
import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { PhoneButton } from '@/components/PhoneButton'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import { BookTableUpcomingEventsPanel } from '@/components/features/TableBooking/BookTableUpcomingEventsPanel'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { Section, Button, Grid, Card, CardBody, SectionHeader } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { LARGE_GROUP_DEPOSIT_POLICY_COPY } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { RegretReduction, ValueProofStrip } from '@/components/psychology'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'

// Revalidate every 1 hour for the walk-in launch fortnight (10–22 May 2026)
// so the LaunchAnnouncement banner flips reliably at the cutover even on
// cached pages. See spec §8.5.
// TODO(post-launch): revert to 60 * 60 * 24 (24 hours) after 22 May 2026, or
// drop the export entirely if the original was using Next.js' default.
export const revalidate = 60 * 60 // 1 hour during launch fortnight

export const metadata: Metadata = {
  title: 'Book a Table Near Heathrow | Sunday Roast',
  description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
  openGraph: {
    title: 'Book a Table Near Heathrow | Sunday Roast | The Anchor',
    description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
    images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }]
  },
  twitter: getTwitterMetadata({
    title: 'Book a Table Near Heathrow | Sunday Roast | The Anchor',
    description: 'Reserve your table at The Anchor, Stanwell Moor — instant confirmation. Pub food from £8.95, Sunday roast from £19. Dog-friendly, free parking, 7 mins from T5.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }),
  alternates: {
    canonical: '/book-table'
  }
}

type BookTablePageProps = {
  searchParams?: {
    date?: string
    time?: string
    party_size?: string
  }
}

function parsePartySize(value?: string): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return undefined
  return Math.min(Math.max(parsed, 1), 20)
}

export default function BookPage({ searchParams }: BookTablePageProps) {
  // sunday_lunch, mothers_day, and purpose query params are silently ignored.
  // Sunday-lunch as a separate booking type is retired with the walk-in launch
  // (spec §6, §8.1); the booking purpose chooser is replaced by per-slot
  // kitchen-open captions and submit-time derivation (spec §5, §8).
  const prefill = {
    date: searchParams?.date,
    time: searchParams?.time,
    partySize: parsePartySize(searchParams?.party_size)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              'name': 'Book a Table at The Anchor',
              'description': 'Reserve your table at The Anchor, Stanwell Moor. Instant confirmation. Free parking, 7 mins from Heathrow T5.',
              'url': 'https://www.the-anchor.pub/book-table',
              'potentialAction': {
                '@type': 'ReserveAction',
                'target': {
                  '@type': 'EntryPoint',
                  'urlTemplate': 'https://www.the-anchor.pub/book-table'
                },
                'result': {
                  '@type': 'FoodEstablishmentReservation'
                }
              }
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FoodEstablishmentReservation',
              reservationFor: {
                '@type': 'FoodEstablishment',
                name: 'The Anchor',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: 'Horton Road',
                  addressLocality: 'Stanwell Moor',
                  postalCode: 'TW19 6AQ'
                }
              },
              url: 'https://www.the-anchor.pub/book-table',
              potentialAction: {
                '@type': 'ReserveAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.the-anchor.pub/book-table'
                },
                result: {
                  '@type': 'FoodEstablishmentReservation'
                }
              }
            }
          ])
        }}
      />

      <HeroWrapper
        showContextStrip={true}
        route="/book-table"
        title="Book a Table at The Anchor"
        description="Reserve your table online with mobile confirmation."
        variant="default"
        statusBarPosition="above"
        primaryCta={
          <Link href="#booking-form">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Book Online
            </Button>
          </Link>
        }
        secondaryCta={
          <PhoneButton
            phone="01753 682707"
            source="book_table_hero"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto !bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
          >
            Prefer to call? 01753 682707
          </PhoneButton>
        }
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: 'The Anchor pub - book a table',
          priority: true
        }}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Book a Table' }
        ]}
        tags={[
          { label: 'Direct booking', icon: '', size: 'small' },
          { label: 'Fast confirmation', icon: '', size: 'small' },
          { label: 'Need help? Call us', icon: '', size: 'small' }
        ]}
        secondaryInfo={
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Free parking · 20 spaces</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">7 min from Heathrow T5</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Dog & family friendly</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Super-fast fibre broadband</span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/25 rounded-full px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">Rated 4.6/5 on Google</span>
          </div>
        }
      />

      <Section spacing="xs" container containerSize="md" className="text-center bg-anchor-bg border-b border-anchor-gold/15">
        <PageTitle className="text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
          Reserve Your Table Online
        </PageTitle>
        <p className="mt-3 text-base text-anchor-cream-text/70 md:text-lg">
          Choose your date, time, and party size to reserve your table. Loved by locals and Heathrow travellers every week.
        </p>
      </Section>

      <Section id="booking-form" background="gray" spacing="sm" container containerSize="lg" className="bg-anchor-bg-raised">
        <div className="grid items-start gap-5 lg:gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <div className="order-1">
            <div className="mb-4 space-y-3">
              <LaunchAnnouncement variant="banner" />
              <RegretReduction variant="booking" />
            </div>
            <ManagementTableBookingForm prefill={prefill} />
          </div>

          <aside className="order-2 space-y-4 lg:space-y-6">
            <div className="card-dark p-4 lg:hidden">
              <h2 className="text-lg font-semibold text-anchor-gold-vivid">Need help with your booking?</h2>
              <p className="mt-2 text-sm text-anchor-cream-text/70">
                If you need a larger table, can't find your preferred time, or want a quick answer, call us directly.
              </p>
              <div className="mt-4 space-y-2">
                <PhoneButton
                  phone="01753 682707"

[truncated at line 200 — original has 444 lines]
```

### `components/features/TableBooking/ManagementTableBookingForm.tsx`

```
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Alert } from '@/components/ui/feedback/Alert'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Input, Textarea } from '@/components/ui/primitives/Input'
import { Button } from '@/components/ui/primitives/Button'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
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
  return date.toISOString().slice(0, 10)
}

function getDefaultTimeValue(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 60)
  const roundedMinutes = now.getMinutes() >= 30 ? 30 : 0
  now.setMinutes(roundedMinutes, 0, 0)
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
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
  return {
    known: Boolean(data?.known),
    lookup_degraded: Boolean(data?.lookup_degraded),
    normalized_phone: data?.normalized_phone,
    customer: data?.customer || null
  }
}


[truncated at line 200 — original has 2049 lines]
```

### `lib/api/bookings.ts`

```
// Table Booking domain types

export interface TableAvailabilitySlot {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
  requires_prepayment?: boolean
  kitchen_open?: boolean
}

export interface TableAvailabilityResponse {
  date: string
  day?: string
  available: boolean
  time_slots: TableAvailabilitySlot[]
  kitchen_hours?: {
    opens: string
    closes: string
  } | null
  message?: string
  special_notes?: string
  time?: string
  party_size?: number
  remaining_capacity?: number
}

export interface TableBookingRequest {
  // Required fields
  booking_type: 'regular' | 'sunday_lunch'
  date: string
  time: string
  party_size: number
  purpose?: 'food' | 'drinks'
  customer: {
    first_name: string
    last_name: string
    email?: string
    mobile_number: string
    sms_opt_in?: boolean
  }
  // Optional fields
  duration_minutes?: number  // 60-240, default: 120
  special_requirements?: string
  dietary_requirements?: string[]  // Array of dietary needs
  allergies?: string[]  // Array of allergies
  celebration_type?: string  // birthday, anniversary, etc.
  source?: string  // website, phone, walk-in, social_media (default: website)
  // Legacy fields for backward compatibility
  customer_name?: string
  customer_first_name?: string
  customer_last_name?: string
  customer_phone?: string
  occasion?: string  // UI field that gets mapped to celebration_type
  marketing_opt_in?: boolean
  menu_selections?: Array<{
    custom_item_name: string
    item_type: string
    quantity: number
    guest_name: string
    price_at_booking: number
    special_requests?: string
  }>
}

export interface TableBookingResponse {
  booking_id: string
  booking_reference: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'pending_payment'
  customer_id?: string
  state?: 'confirmed' | 'pending_payment' | 'blocked'
  table_booking_id?: string | null
  reason?: string | null
  blocked_reason?:
    | 'outside_hours'
    | 'cut_off'
    | 'no_table'
    | 'private_booking_blocked'
    | 'too_large_party'
    | 'customer_conflict'
    | 'in_past'
    | 'blocked'
    | null
  next_step_url?: string | null
  hold_expires_at?: string | null
  table_name?: string | null
  // New API format uses confirmation_details instead of booking_details
  confirmation_details?: {
    date: string
    time: string
    party_size: number
    duration_minutes: number
    special_requirements?: string
    occasion?: string
  }
  // Keep booking_details for backward compatibility
  booking_details?: {
    date: string
    time: string
    party_size: number
    duration_minutes: number
    special_requirements?: string
    occasion?: string
  }
  confirmation_sent: boolean
  sms_status?: string
  payment_required?: boolean
  payment_details?: {
    amount?: number  // For compatibility
    deposit_amount: number
    total_amount: number
    outstanding_amount: number
    currency: string
    payment_url: string
    expires_at: string
  }
  cancellation_policy?: string
}
```

### `lib/api/client.ts`

```
// AnchorAPI class and anchorAPI singleton

import { logError } from '@/lib/error-handling'
import { getManagementApiBaseUrl } from '@/lib/management-api-base'
import { computeLargeGroupDepositAmount } from '@/lib/constants'
import {
  buildSlotsWithKitchenState,
  londonNowParts,
  normalizeTime,
  resolveCombinedServiceRanges,
  type BookingType
} from '@/lib/table-booking-service-windows'

import type { EventsResponse, EventCategoriesResponse, EventAvailability, Event } from './events'
import { FALLBACK_EVENT_CATEGORIES, createFallbackEvent, createFallbackEventsResponse } from './events'
import type { MenuResponse, DietaryMenuResponse, SundayLunchMenuResponse, MenuSectionItem } from './menu'
import { FALLBACK_SUNDAY_LUNCH_MENU } from './menu'
import type { BusinessHours, AmenitiesResponse } from './hours'
import type { TableAvailabilityResponse, TableBookingRequest, TableBookingResponse } from './bookings'
import type {
  ParkingRateCard,
  ParkingAvailabilitySlot,
  ParkingBookingRequest,
  ParkingBookingResponse,
  ParkingBookingDetails,
  ParkingCreateOrderRequest,
  ParkingCreateOrderResponse,
  ParkingCaptureResponse
} from './parking'
import { FALLBACK_PARKING_RATES } from './parking'
import type { MenuItem } from './menu'

// Use internal API routes to avoid CORS issues and keep API key secure
const API_BASE_URL = typeof window === 'undefined'
  ? getManagementApiBaseUrl()  // Server-side: normalize env var and ensure /api suffix
  : '/api'  // Client-side: use Next.js API routes

const buildPhaseSkipLogged = new Set<string>()

type ManagementTableBookingPayload = {
  phone: string
  first_name?: string
  last_name?: string
  email?: string
  date: string
  time: string
  party_size: number
  purpose: 'food' | 'drinks'
  notes?: string
  sunday_lunch?: boolean
  default_country_code?: string
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
}

export class AnchorAPI {
  private baseURL: string
  private apiKey: string

  constructor(apiKey?: string) {
    this.baseURL = API_BASE_URL
    this.apiKey = apiKey || process.env.ANCHOR_API_KEY || ''

    // Only warn on server-side where API key is expected
    if (!this.apiKey && typeof window === 'undefined') {
      console.warn('ANCHOR_API_KEY is not set. API calls will fail.')
    }
  }

  private resolveSiteOrigin(): string | null {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }

    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')
    }

    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, '')
    }

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      return 'http://localhost:3000'
    }

    return null
  }

  private asTrimmedString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  private asPositiveInt(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      const rounded = Math.floor(value)
      return rounded > 0 ? rounded : undefined
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number.parseInt(value.trim(), 10)
      if (Number.isFinite(parsed) && parsed > 0) return parsed
    }

    return undefined
  }

  private toStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map((entry) => this.asTrimmedString(entry))
        .filter((entry): entry is string => Boolean(entry))
    }

    const single = this.asTrimmedString(value)
    return single ? [single] : []
  }

  private summarizeMenuSelections(menuSelections: TableBookingRequest['menu_selections']): string | undefined {
    if (!Array.isArray(menuSelections) || menuSelections.length === 0) {
      return undefined
    }

    const summary = menuSelections
      .slice(0, 12)
      .map((item) => {
        const guest = this.asTrimmedString(item?.guest_name) || 'Guest'
        const dish = this.asTrimmedString(item?.custom_item_name) || this.asTrimmedString((item as any)?.item_name)
        const quantity = this.asPositiveInt(item?.quantity) || 1
        if (!dish) return null
        return `${guest}: ${dish} x${quantity}`
      })
      .filter((entry): entry is string => Boolean(entry))
      .join(' | ')

    return summary ? `Sunday lunch pre-order: ${summary}` : undefined
  }

  private buildLegacyTableBookingNotes(data: TableBookingRequest): string | undefined {
    const lines: string[] = []

    const specialRequirements = this.asTrimmedString(data.special_requirements)
    if (specialRequirements) {
      lines.push(`Special requirements: ${specialRequirements}`)
    }

    const occasion = this.asTrimmedString(data.celebration_type) || this.asTrimmedString((data as any).occasion)
    if (occasion) {
      lines.push(`Occasion: ${occasion}`)
    }

    const dietaryRequirements = this.toStringList(data.dietary_requirements)
    if (dietaryRequirements.length > 0) {
      lines.push(`Dietary requirements: ${dietaryRequirements.join(', ')}`)
    }

    const allergies = this.toStringList(data.allergies)
    if (allergies.length > 0) {
      lines.push(`Allergies: ${allergies.join(', ')}`)
    }

    const menuSummary = this.summarizeMenuSelections(data.menu_selections)
    if (menuSummary) {
      lines.push(menuSummary)
    }

    if (lines.length === 0) return undefined

    const notes = lines.join('\n')
    return notes.length <= 500 ? notes : `${notes.slice(0, 497)}...`
  }

  private toManagementTableBookingPayload(data: TableBookingRequest): ManagementTableBookingPayload {
    const customer = data.customer || ({} as TableBookingRequest['customer'])
    const phone = this.asTrimmedString(customer.mobile_number) || this.asTrimmedString((data as any).customer_phone)

    if (!phone) {
      throw {
        code: 'VALIDATION_ERROR',
        message: 'Customer mobile number is required',

[truncated at line 200 — original has 1253 lines]
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

export function londonNowParts(): { isoDate: string; minutes: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const parts = formatter.formatToParts(new Date())
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const isoDate = `${map.year}-${map.month}-${map.day}`
  const hours = Number.parseInt(map.hour || '0', 10)
  const minutes = Number.parseInt(map.minute || '0', 10)

  return {
    isoDate,
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

  return Array.from(slots.values()).sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
}

export function resolveServiceRanges(
  businessHours: BusinessHours,
  isoDate: string,

[truncated at line 200 — original has 397 lines]
```

## Related Files (grep hints)

These files reference the basenames of changed files. They are hints for verification — not included inline. Read them only if a specific finding requires it.

```
.claude/fix-function/brief.md
.claude/fix-function/final-report.md
.claude/fix-function/phase-1/qa-specialist/test-matrix.md
.env.example
.superpowers/brainstorm/50042-1777211709/content/hero-approaches.html
.superpowers/brainstorm/50042-1777211709/content/hero-design-proposal.html
.superpowers/brainstorm/62983-1773235742/approaches.html
.superpowers/brainstorm/62983-1773235742/architecture.html
.superpowers/brainstorm/62983-1773235742/confirmation-page.html
.superpowers/brainstorm/62983-1773235742/confirmation-v2.html
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
