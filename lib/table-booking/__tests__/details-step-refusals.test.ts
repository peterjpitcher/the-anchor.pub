import {
  findDetailsStepRefusal,
  findDetailsStepRefusals,
  type DetailsStepState
} from '@/lib/table-booking/journey'

/**
 * Review BK-102: each refusal names the control it belongs to, so the form can
 * show it beside that control, and the name and email refusals come back
 * together so one press of Confirm points at everything still missing.
 */

const READY: DetailsStepState = {
  revalidatingAvailability: false,
  selectedTime: '13:00',
  phone: '07700900123',
  firstName: 'Sam',
  email: 'sam@example.com',
  highChairShortfall: null,
  highChairShortfallAcknowledged: true,
  selectionRefusedByReading: false
}

describe('findDetailsStepRefusals', () => {
  it('has nothing to say about a complete details step', () => {
    expect(findDetailsStepRefusals(READY)).toEqual([])
    expect(findDetailsStepRefusal(READY)).toBeNull()
  })

  it('returns the name and email refusals together, each tied to its field', () => {
    const refusals = findDetailsStepRefusals({ ...READY, firstName: ' ', email: 'sam@example' })

    expect(refusals).toEqual([
      { code: 'name_missing', message: 'Please enter your first name.', field: 'firstName' },
      {
        code: 'email_invalid',
        message: 'That email address does not look right. Please check it.',
        field: 'email'
      }
    ])
    // The single-answer form still gives the first, as before.
    expect(findDetailsStepRefusal({ ...READY, firstName: ' ', email: 'sam@example' })?.code).toBe('name_missing')
  })

  it('returns the phone refusal with the others, because every box is on screen from the start', () => {
    // The number used to be checked before the name and email boxes appeared, so a phone
    // refusal came back alone. That check is gone (review BK-107).
    expect(findDetailsStepRefusals({ ...READY, phone: ' ', firstName: '', email: '' })).toEqual([
      { code: 'phone_missing', message: 'Please enter your mobile number.', field: 'phone' },
      { code: 'name_missing', message: 'Please enter your first name.', field: 'firstName' },
      {
        code: 'email_missing',
        message: 'Please enter your email address so we can send your confirmation.',
        field: 'email'
      }
    ])
  })

  it('returns a refusal about the booking as a whole alone, with no field', () => {
    const [refusal, ...rest] = findDetailsStepRefusals({ ...READY, selectedTime: '', firstName: '' })

    expect(rest).toEqual([])
    expect(refusal).toMatchObject({ code: 'no_time_selected', returnToChoose: true })
    expect(refusal.field).toBeUndefined()
  })

  it('asks about a high-chair shortfall only once the fields are complete', () => {
    const shortfall = { highChairShortfall: { free: 1, requested: 2 }, highChairShortfallAcknowledged: false }

    expect(findDetailsStepRefusals({ ...READY, ...shortfall, email: '' }).map((r) => r.code)).toEqual([
      'email_missing'
    ])
    expect(findDetailsStepRefusals({ ...READY, ...shortfall }).map((r) => r.code)).toEqual([
      'high_chair_shortfall_unacknowledged'
    ])
  })
})
