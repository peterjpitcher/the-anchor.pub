import { fireEvent, render, screen } from '@testing-library/react'
import {
  ALLERGEN_FALLBACK,
  SeasonalPreorderPicker,
  emptyPreorderChoice,
  formatAllergens,
  type PreorderChoice
} from '@/components/features/TableBooking/SeasonalPreorderPicker'
import { parseAllergyList } from '@/lib/table-booking/allergies'
import { buildTableBookingPayload } from '@/lib/table-booking/submission'
import { buildSubmitIntentFingerprint } from '@/lib/table-booking-idempotency'
import { DEFAULT_COMMUNICATION_CONSENT_STATE } from '@/lib/communication-consent'

/**
 * BK-052, BK-060 and BK-148: allergies in their own field, a dish's allergens shown beside the
 * choice (never "no allergens" when none are recorded), and an optional name and dietary note for
 * every guest, 1 course included (owner decision D23).
 */

const MENU = [
  { id: 'turkey', course: 'main', name: 'Christmas Dinner - Turkey', description: null, price_gbp: null, allergens: 'Celery, mustard' as unknown as string[] },
  { id: 'wellington', course: 'main', name: 'Vegetable Wellington', description: null, price_gbp: null, allergens: null },
  { id: 'cheese', course: 'addon', name: 'Farmhouse cheeseboard', description: null, price_gbp: 7.95, allergens: ['Milk'] }
]

function Harness({ initial, onChange }: { initial: PreorderChoice[]; onChange: (choices: PreorderChoice[]) => void }) {
  return (
    <SeasonalPreorderPicker partySize={initial.length} menu={MENU} choices={initial} courseAware onChange={onChange} />
  )
}

describe('parseAllergyList', () => {
  it('splits the box into the list the management app stores', () => {
    expect(parseAllergyList(' peanuts, shellfish;\nmilk ,, ')).toEqual(['peanuts', 'shellfish', 'milk'])
    expect(parseAllergyList('')).toEqual([])
  })
})

describe('formatAllergens', () => {
  it('reads the text the management app sends, or a list', () => {
    expect(formatAllergens('Celery, mustard')).toBe('Celery, mustard')
    expect(formatAllergens(['Milk', 'Eggs'])).toBe('Milk, Eggs')
    expect(formatAllergens(null)).toBeNull()
    expect(formatAllergens('  ')).toBeNull()
  })
})

describe('SeasonalPreorderPicker guest details', () => {
  it('offers a name and a dietary note for every guest, 1 course included', () => {
    const choices = [
      { ...emptyPreorderChoice(0), courseCount: 1 as const },
      { ...emptyPreorderChoice(1), courseCount: 2 as const }
    ]
    const onChange = jest.fn()
    render(<Harness initial={choices} onChange={onChange} />)

    expect(screen.getAllByLabelText(/^Name/)).toHaveLength(2)
    expect(screen.getAllByLabelText(/^Dietary needs/)).toHaveLength(2)

    fireEvent.change(screen.getAllByLabelText(/^Name/)[0], { target: { value: 'Sam' } })
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ guestIndex: 0, guestName: 'Sam' }),
      expect.objectContaining({ guestIndex: 1 })
    ])
  })

  it('keeps the name when the guest changes their number of courses', () => {
    const choices = [{ ...emptyPreorderChoice(0), courseCount: 1 as const, guestName: 'Sam', dietaryNote: 'No dairy' }]
    const onChange = jest.fn()
    render(<Harness initial={choices} onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Number of courses'), { target: { value: '2' } })
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ courseCount: 2, guestName: 'Sam', dietaryNote: 'No dairy', mainId: null })
    ])
  })
})

describe('SeasonalPreorderPicker allergens', () => {
  it('shows the chosen dish allergens beside the choice, and the SSOT wording when none are recorded', () => {
    const { rerender } = render(
      <SeasonalPreorderPicker partySize={1} menu={MENU} courseAware onChange={() => {}}
        choices={[{ ...emptyPreorderChoice(0), courseCount: 2, mainId: 'turkey' }]} />
    )
    expect(screen.getByText('Allergens: Celery, mustard')).toBeInTheDocument()

    rerender(
      <SeasonalPreorderPicker partySize={1} menu={MENU} courseAware onChange={() => {}}
        choices={[{ ...emptyPreorderChoice(0), courseCount: 2, mainId: 'wellington' }]} />
    )
    expect(screen.getByText(`Allergens: ${ALLERGEN_FALLBACK}`)).toBeInTheDocument()
    expect(screen.getByText('Allergens: Milk')).toBeInTheDocument()
    expect(screen.queryByText(/no allergens/i)).not.toBeInTheDocument()
  })
})

describe('allergies and guest details on the wire', () => {
  const base = {
    phone: '+447700900123', firstName: 'Jo', lastName: 'Bloggs', date: '2026-12-05', time: '19:00',
    partySize: 2, purpose: 'food' as const, notes: '', highChairCount: 0, isOutsideSeating: false,
    requiresAccessibleTable: false, communicationConsent: {} as never, seasonalAnswer: null,
    attribution: {} as never, turnstileToken: null, website: '', secondsOnForm: 12
  }

  it('sends allergies only when given', () => {
    expect(buildTableBookingPayload({ ...base, allergies: ['Peanuts'] }).allergies).toEqual(['Peanuts'])
    expect(buildTableBookingPayload(base)).not.toHaveProperty('allergies')
    expect(buildTableBookingPayload({ ...base, allergies: [] })).not.toHaveProperty('allergies')
  })

  const intent = {
    phone: '07700900000', firstName: 'Sam', lastName: 'Walker', email: '', date: '2026-12-05', time: '19:00',
    partySize: 2, purpose: 'food' as const, notes: '', highChairCount: 0, isOutsideSeating: false,
    communicationConsent: DEFAULT_COMMUNICATION_CONSENT_STATE
  }

  it('mints a new key when allergies or a guest name change, as the management app hashes both', () => {
    const plain = buildSubmitIntentFingerprint(intent)
    expect(buildSubmitIntentFingerprint({ ...intent, allergies: ['Peanuts'] })).not.toBe(plain)
    const seat = { main_menu_item_id: 'turkey' }
    const withSeat = buildSubmitIntentFingerprint({ ...intent, preorder: [seat] })
    expect(buildSubmitIntentFingerprint({ ...intent, preorder: [{ ...seat, guest_name: 'Sam' }] })).not.toBe(withSeat)
    expect(buildSubmitIntentFingerprint({ ...intent, preorder: [{ ...seat, dietary_note: 'No dairy' }] })).not.toBe(withSeat)
  })

  it('keeps the old fingerprint when neither is given, so a retry across the deploy still replays', () => {
    expect(buildSubmitIntentFingerprint({ ...intent, allergies: [] })).toBe(buildSubmitIntentFingerprint(intent))
    expect(buildSubmitIntentFingerprint({ ...intent, preorder: [{ main_menu_item_id: 'turkey' }] })).toBe(
      JSON.stringify({
        ...JSON.parse(buildSubmitIntentFingerprint(intent)),
        preorder: [{ starter: null, main: 'turkey', dessert: null, addons: [] }]
      })
    )
  })
})
