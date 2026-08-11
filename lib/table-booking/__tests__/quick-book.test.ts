import {
  DEFAULT_PARTY_SIZE,
  QUICK_BOOK_MAX_PARTY,
  buildQuickBookIntentFingerprint,
  buildQuickBookPayload,
  defaultQuickBookState,
  findQuickBookRefusal,
  fullFormHref,
  quickDateChoices,
  requiresFullForm,
  resolveEmptyState,
  resolveSubmitPurpose,
  selectableSlots,
  type QuickBookSubmission,
} from '../quick-book'
import type { AvailabilityData, AvailabilitySlot } from '../availability'

function slot(overrides: Partial<AvailabilitySlot> = {}): AvailabilitySlot {
  return {
    time: '19:00',
    available: true,
    available_capacity: 8,
    bookable_purpose: 'food_or_drinks',
    ...overrides,
  }
}

function availability(overrides: Partial<AvailabilityData> = {}): AvailabilityData {
  return {
    date: '2026-08-12',
    available: true,
    time_slots: [slot()],
    calculation_state: 'complete',
    ...overrides,
  }
}

describe('the defaults are the common case, not a guess', () => {
  it('defaults to a table for two', () => {
    // 134 of 308 bookings in the 90 days to 2026-08-09 were for exactly two people.
    expect(DEFAULT_PARTY_SIZE).toBe(2)
    expect(defaultQuickBookState().partySize).toBe(2)
  })

  it('defaults to eating rather than drinks', () => {
    // Failing safe. A food slot also seats a drinker; a drinks slot does not feed anyone,
    // so defaulting the other way would quietly show times the kitchen cannot serve.
    expect(defaultQuickBookState().purpose).toBe('food')
  })

  it('offers Today and Tomorrow as one-tap chips', () => {
    const labels = quickDateChoices().map((c) => c.label)
    expect(labels[0]).toBe('Today')
    expect(labels[1]).toBe('Tomorrow')
  })

  it('adds Sunday when it is not already offered', () => {
    const choices = quickDateChoices()
    const labels = choices.map((c) => c.label)
    const hasSunday = choices.some(
      (c) => new Date(`${c.value}T00:00:00Z`).getUTCDay() === 0
    )
    // Sunday is the busiest booking day by a distance: 113 of 308 in 90 days, more than
    // Friday and Saturday combined. It should never be more than one tap away.
    expect(hasSunday).toBe(true)
    expect(labels.length).toBeGreaterThanOrEqual(2)
    expect(labels.length).toBeLessThanOrEqual(3)
  })

  it('never offers the same date twice', () => {
    const values = quickDateChoices().map((c) => c.value)
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('which slots a guest may tap', () => {
  it('offers only food-capable slots when they want to eat', () => {
    const data = availability({
      time_slots: [
        slot({ time: '12:00', bookable_purpose: 'food_or_drinks' }),
        slot({ time: '21:00', bookable_purpose: 'drinks_only' }),
      ],
    })
    expect(selectableSlots(data, 2, 'food').map((s) => s.time)).toEqual(['12:00'])
  })

  it('offers every slot when they only want a drink', () => {
    const data = availability({
      time_slots: [
        slot({ time: '12:00', bookable_purpose: 'food_or_drinks' }),
        slot({ time: '21:00', bookable_purpose: 'drinks_only' }),
      ],
    })
    // A food-bookable table still seats somebody who only wants a pint.
    expect(selectableSlots(data, 2, 'drinks')).toHaveLength(2)
  })

  it('hides slots too small for the party', () => {
    const data = availability({ time_slots: [slot({ available_capacity: 3 })] })
    expect(selectableSlots(data, 4, 'food')).toHaveLength(0)
    expect(selectableSlots(data, 3, 'food')).toHaveLength(1)
  })

  it('shows nothing at all when the authoritative check never ran', () => {
    // Locally guessed times presented as bookable is how a guest ends up holding a
    // confirmation for a table that does not exist.
    const data = availability({ calculation_state: 'unknown' })
    expect(selectableSlots(data, 2, 'food')).toHaveLength(0)
  })
})

describe('an empty grid explains itself', () => {
  it('recovers a kitchen-closed day into a drinks booking', () => {
    // The one that earns real money. On a Monday the kitchen is shut but the bar is open,
    // and "no availability" sends away a guest who could have had a table.
    const data = availability({
      time_slots: [slot({ bookable_purpose: 'drinks_only' })],
    })
    expect(resolveEmptyState(data, 2, 'food', false)).toBe(
      'kitchen_closed_but_drinks_available'
    )
  })

  it('says nothing is free when drinks would not help either', () => {
    const data = availability({ time_slots: [slot({ available_capacity: 1 })] })
    expect(resolveEmptyState(data, 6, 'food', false)).toBe('nothing_today')
  })

  it('distinguishes a failed check from a full day', () => {
    const data = availability({ calculation_state: 'unknown' })
    expect(resolveEmptyState(data, 2, 'food', false)).toBe('check_failed')
  })

  it('reports nothing when there are times to show', () => {
    expect(resolveEmptyState(availability(), 2, 'food', false)).toBe('none')
  })

  it('stays in loading while the request is in flight', () => {
    expect(resolveEmptyState(null, 2, 'food', true)).toBe('loading')
  })
})

describe('the slot narrows the purpose, not the guest', () => {
  it('submits drinks against a drinks-only slot even when they asked to eat', () => {
    // On a day where the food check failed the whole grid is drinks_only. Submitting
    // 'food' is rejected by the service-window check with an error nobody can act on.
    expect(resolveSubmitPurpose('drinks_only', 'food')).toBe('drinks')
  })

  it('respects the guest on a slot that permits both', () => {
    expect(resolveSubmitPurpose('food_or_drinks', 'food')).toBe('food')
    expect(resolveSubmitPurpose('food_or_drinks', 'drinks')).toBe('drinks')
  })
})

describe('handing over to the full form', () => {
  it('hands over above the quick-book party cap', () => {
    expect(requiresFullForm(QUICK_BOOK_MAX_PARTY)).toBe(false)
    expect(requiresFullForm(QUICK_BOOK_MAX_PARTY + 1)).toBe(true)
  })

  it('carries the choices already made', () => {
    const href = fullFormHref({ partySize: 4, date: '2026-08-12', time: '19:00' })
    expect(href).toContain('party_size=4')
    expect(href).toContain('date=2026-08-12')
    expect(href).toContain('time=19%3A00')
  })

  it('sends only params the booking page actually reads', () => {
    // app/book-table/page.tsx reads date, time and party_size. Sending `purpose` would
    // look like it carried the food choice over and silently would not, so the guest
    // re-answers a question they believe they have answered.
    const href = fullFormHref({ partySize: 2, date: '2026-08-12', purpose: 'drinks' })
    expect(href).not.toContain('purpose')
  })

  it('falls back to a bare link with nothing chosen', () => {
    expect(fullFormHref({})).toBe('/book-table')
  })
})

describe('validation reports fields in the order they were filled in', () => {
  const base = { time: '19:00', phone: '07700900000', firstName: 'Jane' }

  it('accepts a complete booking', () => {
    expect(findQuickBookRefusal(base)).toBeNull()
  })

  it('asks for a time before anything else', () => {
    expect(findQuickBookRefusal({ ...base, time: null, phone: '', firstName: '' })?.field).toBe(
      'time'
    )
  })

  it('asks for the phone before the name', () => {
    // Reporting the last field first makes a form feel like it is arguing back.
    expect(findQuickBookRefusal({ ...base, phone: '', firstName: '' })?.field).toBe('phone')
  })

  it('catches an obviously incomplete number', () => {
    expect(findQuickBookRefusal({ ...base, phone: '0770' })?.field).toBe('phone')
  })

  it('accepts the shapes real guests type', () => {
    for (const phone of ['07700 900000', '+44 7700 900000', '(07700) 900000']) {
      expect(findQuickBookRefusal({ ...base, phone })).toBeNull()
    }
  })
})

describe('the submitted payload', () => {
  it('carries every field the create endpoint requires', () => {
    const payload = buildQuickBookPayload({
      state: { partySize: 4, date: '2026-08-12', purpose: 'food' },
      time: '19:00',
      slotPurpose: 'food_or_drinks',
      phone: '  07700 900000 ',
      firstName: '  Jane ',
    })

    // The route rejects with 'Missing required fields' without all five.
    expect(payload).toMatchObject({
      phone: '07700 900000',
      date: '2026-08-12',
      time: '19:00',
      party_size: 4,
      purpose: 'food',
      first_name: 'Jane',
    })
  })

  it('downgrades purpose when the slot only permits drinks', () => {
    const payload = buildQuickBookPayload({
      state: { partySize: 2, date: '2026-08-12', purpose: 'food' },
      time: '21:00',
      slotPurpose: 'drinks_only',
      phone: '07700900000',
      firstName: 'Jane',
    })
    expect(payload.purpose).toBe('drinks')
  })

  it('sends the dialling code as digits, not an ISO country code', () => {
    // 'GB' here 400d every single booking from the sticky button: /api/table-bookings and
    // the management API both validate this field against exactly this pattern.
    const payload = buildQuickBookPayload({
      state: { partySize: 2, date: '2026-08-12', purpose: 'food' },
      time: '19:00',
      slotPurpose: 'food_or_drinks',
      phone: '07700900000',
      firstName: 'Jane',
    })

    expect(payload.default_country_code).toMatch(/^\d{1,4}$/)
    expect(payload.default_country_code).toBe('44')
  })
})

describe('the submit-intent fingerprint', () => {
  const submission: QuickBookSubmission = {
    state: { partySize: 2, date: '2026-08-12', purpose: 'food' },
    time: '19:00',
    slotPurpose: 'food_or_drinks',
    phone: '07700900000',
    firstName: 'Jane',
  }

  const fingerprintOf = (overrides: Partial<QuickBookSubmission> = {}) =>
    buildQuickBookIntentFingerprint(buildQuickBookPayload({ ...submission, ...overrides }))

  it('is stable for an unchanged intent, so a double tap cannot book twice', () => {
    expect(fingerprintOf()).toBe(fingerprintOf())
  })

  it('changes when the guest changes their answer, so the retry is not a 409', () => {
    // The bug this exists to prevent: refused for food, switched to drinks, resubmitted at
    // the same time. The old key named only phone, date, time and party size, so it stayed
    // identical while the management API's request hash changed, and the guest was shown a
    // raw IDEMPOTENCY_KEY_CONFLICT.
    expect(fingerprintOf({ slotPurpose: 'drinks_only' })).not.toBe(fingerprintOf())
  })

  it('varies with every field the payload carries', () => {
    const base = fingerprintOf()

    expect(fingerprintOf({ state: { ...submission.state, partySize: 4 } })).not.toBe(base)
    expect(fingerprintOf({ state: { ...submission.state, date: '2026-08-13' } })).not.toBe(base)
    expect(fingerprintOf({ time: '19:30' })).not.toBe(base)
    expect(fingerprintOf({ phone: '07700900001' })).not.toBe(base)
    expect(fingerprintOf({ firstName: 'Sam' })).not.toBe(base)
  })

  it('ignores whitespace, which is not a different booking', () => {
    expect(fingerprintOf({ phone: '  07700900000 ', firstName: ' Jane ' })).toBe(fingerprintOf())
  })
})
