import { useEffect } from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QuickBookSheet } from '@/components/features/TableBooking/QuickBookSheet'
import { fetchAvailability } from '@/lib/table-booking/availability'
import { londonNowParts } from '@/lib/table-booking-service-windows'
import {
  trackBookingErrorShown,
  trackFormComplete,
  trackTableBookingClick,
} from '@/lib/gtm-events'

/**
 * A booking that says yes must mean yes.
 *
 * This renders the REAL sheet. The two other tests that mention it replace it
 * with a stub, which is how it came to tell guests "You're booked in." for a
 * booking the management app had refused: the app answers a refusal with HTTP
 * 200 and `success: true`, and says what happened in `data.state`. The sheet
 * read the status and the success flag and nothing else.
 *
 * Nothing here books anything. `fetch` is replaced for the whole file and
 * refuses any address but the one mocked POST.
 */
jest.mock('@/lib/gtm-events')
jest.mock('@/lib/table-booking/availability', () => ({
  ...jest.requireActual('@/lib/table-booking/availability'),
  fetchAvailability: jest.fn(),
}))
// The bot check is not what is under test. If a site key is configured the
// sheet waits for a token before it enables the button, so hand it one.
jest.mock('@/components/security/TurnstileField', () => ({
  TurnstileField: ({ onTokenChange }: { onTokenChange: (token: string | null) => void }) => {
    useEffect(() => {
      onTokenChange('test-token')
    }, [onTokenChange])
    return null
  },
}))

const mockFetchAvailability = fetchAvailability as jest.MockedFunction<typeof fetchAvailability>
const PHONE = '01753 682707'
const originalFetch = global.fetch

type Answer = { status: number; body?: unknown; notJson?: boolean }

function answerBookingWith(answer: Answer | Error): jest.Mock {
  const mock = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url !== '/api/table-bookings' || init?.method !== 'POST') {
      return Promise.reject(new Error(`Unexpected fetch in a test that must not book: ${init?.method} ${url}`))
    }
    if (answer instanceof Error) return Promise.reject(answer)
    return Promise.resolve({
      ok: answer.status >= 200 && answer.status < 300,
      status: answer.status,
      json: answer.notJson
        ? () => Promise.reject(new SyntaxError('Unexpected token < in JSON'))
        : () => Promise.resolve(answer.body),
    })
  })
  ;(global as any).fetch = mock
  return mock
}

function availabilityWith(times: string[]) {
  return {
    date: londonNowParts().isoDate,
    available: true,
    calculation_state: 'complete' as const,
    time_slots: times.map((time) => ({
      time,
      available: true,
      available_capacity: 8,
      bookable_purpose: 'food_or_drinks' as const,
    })),
  }
}

/** Open the sheet, pick 7pm, fill both fields and press Book table. */
async function bookAtSeven() {
  render(<QuickBookSheet open onClose={jest.fn()} source="test" />)
  fireEvent.click(await screen.findByRole('button', { name: /^7pm/ }))
  fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700 900123' } })
  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
  const book = screen.getByRole('button', { name: 'Book table' })
  await waitFor(() => expect(book).toBeEnabled())
  // Inside act so the reply, and everything the sheet does with it, has
  // settled before the assertions run.
  await act(async () => {
    fireEvent.click(book)
  })
}

function expectNotBooked() {
  expect(screen.queryByText("You're booked in.")).not.toBeInTheDocument()
  expect(screen.queryByText('Table booked')).not.toBeInTheDocument()
  expect(screen.queryByText(/We've sent/)).not.toBeInTheDocument()
  // The completion events are what the booking numbers are counted from.
  expect(trackFormComplete).not.toHaveBeenCalled()
  expect(trackTableBookingClick).not.toHaveBeenCalled()
}

function expectPhoneLink() {
  const links = screen.getAllByRole('link', { name: PHONE })
  expect(links.length).toBeGreaterThan(0)
  expect(links[0]).toHaveAttribute('href', 'tel:+441753682707')
}

beforeEach(() => {
  jest.clearAllMocks()
  mockFetchAvailability.mockResolvedValue(availabilityWith(['18:30', '19:00', '19:30']))
})

afterEach(() => {
  global.fetch = originalFetch
})

describe('QuickBookSheet reads the state of the booking, not the status of the reply', () => {
  it('a refused booking (200, success true, state blocked) is not shown as booked', async () => {
    const post = answerBookingWith({
      status: 200,
      body: { success: true, data: { state: 'blocked', blocked_reason: 'no_table', booking_reference: null } },
    })

    await bookAtSeven()

    const refusal = await screen.findByRole('alert')
    expect(refusal).toHaveTextContent(
      'No tables available at that time. Try a different time or give us a call on 01753 682707.'
    )
    expect(within(refusal).getByRole('link', { name: PHONE })).toHaveAttribute('href', 'tel:+441753682707')
    expectNotBooked()
    expect(post).toHaveBeenCalledTimes(1)
    expect(trackBookingErrorShown).toHaveBeenCalledWith({ code: 'quick_book_blocked_no_table' })
  })

  it('returns the guest to the time grid with fresh times after a refusal', async () => {
    answerBookingWith({
      status: 200,
      body: { success: true, data: { state: 'blocked', blocked_reason: 'no_table', booking_reference: null } },
    })
    // What the grid looks like once the table has gone.
    mockFetchAvailability
      .mockResolvedValueOnce(availabilityWith(['18:30', '19:00', '19:30']))
      .mockResolvedValueOnce(availabilityWith(['18:30', '19:30']))

    await bookAtSeven()

    // Back on the grid: the details form has gone, the other times are there
    // to tap, and the time that was refused is no longer offered.
    expect(await screen.findByRole('button', { name: /^7:30pm/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^7pm/ })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Mobile number')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Book table' })).not.toBeInTheDocument()
    expect(mockFetchAvailability).toHaveBeenCalledTimes(2)
    // And the reason is still on screen above them.
    expect(screen.getByRole('alert')).toHaveTextContent(/No tables available at that time/)
  })

  it('gives every refusal the phone number, including one whose copy does not carry it', async () => {
    answerBookingWith({
      status: 200,
      body: { success: true, data: { state: 'blocked', blocked_reason: 'cut_off', booking_reference: null } },
    })

    await bookAtSeven()

    const refusal = await screen.findByRole('alert')
    expect(refusal).toHaveTextContent(
      'Online bookings for that slot are now closed. Please call us and we will try to help. Ring us on 01753 682707.'
    )
    expectPhoneLink()
    expectNotBooked()
  })

  it('a refusal for a reason it has no copy for still reads as a refusal', async () => {
    answerBookingWith({
      status: 200,
      body: { success: true, data: { state: 'blocked', blocked_reason: 'something_new', booking_reference: null } },
    })

    await bookAtSeven()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This slot is not available for online booking right now. Ring us on 01753 682707.'
    )
    expectNotBooked()
  })

  it('an answer with no state is an error, with the phone number, and is not booked', async () => {
    answerBookingWith({ status: 200, body: { success: true, data: { booking_reference: 'TB-1' } } })

    await bookAtSeven()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Booking response was incomplete. Please try again. Ring us on 01753 682707.'
    )
    expectPhoneLink()
    expectNotBooked()
    // Still on the details screen, so the guest can try again without retyping.
    expect(screen.getByLabelText('Mobile number')).toHaveValue('07700 900123')
    expect(trackBookingErrorShown).toHaveBeenCalledWith({ code: 'quick_book_submit_failed' })
  })

  it('a state it does not recognise is treated as not booked', async () => {
    answerBookingWith({ status: 200, body: { success: true, data: { state: 'on_request', booking_reference: 'TB-1' } } })

    await bookAtSeven()

    expect(await screen.findByRole('alert')).toHaveTextContent(/Booking response was incomplete/)
    expectNotBooked()
  })

  it('a table held for a deposit is not shown as booked, and the guest is given the payment link', async () => {
    answerBookingWith({
      status: 201,
      body: {
        success: true,
        data: {
          state: 'pending_payment',
          booking_reference: 'TB-HELD1',
          next_step_url: 'https://management.orangejelly.co.uk/g/token/table-payment',
          fallback_payment_url: 'https://management.orangejelly.co.uk/g/token/table-payment',
          notification_channel: 'sms',
        },
      },
    })

    await bookAtSeven()

    expect(await screen.findByText('Your table is held, not booked yet.')).toBeInTheDocument()
    expect(screen.getByText(/only confirmed once the deposit is paid/)).toBeInTheDocument()
    expect(screen.getByText('TB-HELD1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pay the deposit' })).toHaveAttribute(
      'href',
      'https://management.orangejelly.co.uk/g/token/table-payment'
    )
    expectPhoneLink()
    expectNotBooked()
  })

  it('a held table with no usable payment link still gets the phone number, never a dead button', async () => {
    answerBookingWith({
      status: 201,
      body: {
        success: true,
        data: { state: 'pending_payment', booking_reference: 'TB-HELD2', next_step_url: 'javascript:alert(1)' },
      },
    })

    await bookAtSeven()

    expect(await screen.findByText('Your table is held, not booked yet.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Pay the deposit' })).not.toBeInTheDocument()
    expectPhoneLink()
    expectNotBooked()
  })

  it('a confirmed booking the system says it messaged shows the done screen and names the channel', async () => {
    answerBookingWith({
      status: 201,
      body: {
        success: true,
        data: { state: 'confirmed', booking_reference: 'TB-OK1', notification_sent: true, notification_channel: 'sms' },
      },
    })

    await bookAtSeven()

    expect(await screen.findByText("You're booked in.")).toBeInTheDocument()
    expect(screen.getByText('TB-OK1')).toBeInTheDocument()
    expect(screen.getByText("We've sent confirmation details by SMS.")).toBeInTheDocument()
    expect(trackFormComplete).toHaveBeenCalledTimes(1)
    expect(trackFormComplete).toHaveBeenCalledWith({ formName: 'quick_book_sheet', formLocation: 'test' })
    expect(trackTableBookingClick).toHaveBeenCalledTimes(1)
  })

  // The management app says whether a message went: `notification_sent`. Every
  // answer below is a confirmed booking that does NOT say one went, so the done
  // screen must say the table is booked, give the number for anyone who wants
  // that confirmed by a person, and claim no message.
  it.each([
    ['notification_sent false', { notification_sent: false, notification_channel: null }],
    ['notification_sent false beside a channel', { notification_sent: false, notification_channel: 'email' }],
    ['a channel but no notification_sent (an older answer)', { notification_channel: 'sms' }],
    ['neither field', {}],
    ['notification_sent as the string "true"', { notification_sent: 'true', notification_channel: 'sms' }],
  ])('a confirmed booking with %s does not claim a message was sent', async (_label, notice) => {
    answerBookingWith({
      status: 201,
      body: { success: true, data: { state: 'confirmed', booking_reference: 'TB-OK2', ...notice } },
    })

    await bookAtSeven()

    expect(await screen.findByText("You're booked in.")).toBeInTheDocument()
    expect(screen.queryByText(/We've sent/)).not.toBeInTheDocument()
    expect(screen.queryByText(/by (email|SMS|WhatsApp)/i)).not.toBeInTheDocument()
    expect(
      screen.getByText(
        (_content, element) =>
          element?.tagName === 'P' &&
          element.textContent === "Your table is booked. If you'd like it confirmed by a person, call 01753 682707."
      )
    ).toBeInTheDocument()
    expectPhoneLink()
    expect(screen.getByText('TB-OK2')).toBeInTheDocument()
    expect(trackFormComplete).toHaveBeenCalledTimes(1)
  })

  it('with no message and no reference it still says the table is booked and gives the number', async () => {
    answerBookingWith({ status: 201, body: { success: true, data: { state: 'confirmed', booking_reference: null } } })

    await bookAtSeven()

    expect(await screen.findByText("You're booked in.")).toBeInTheDocument()
    expect(screen.getByText(/Your table is booked\./)).toBeInTheDocument()
    expectPhoneLink()
    expect(screen.queryByText(/We've sent/)).not.toBeInTheDocument()
    expect(screen.queryByText(/reference/i)).not.toBeInTheDocument()
  })

  it('a second booking in the same sheet does not inherit the first one\'s "sent"', async () => {
    answerBookingWith({
      status: 201,
      body: {
        success: true,
        data: { state: 'confirmed', booking_reference: 'TB-A', notification_sent: true, notification_channel: 'email' },
      },
    })
    const { rerender } = render(<QuickBookSheet open onClose={jest.fn()} source="test" />)
    fireEvent.click(await screen.findByRole('button', { name: /^7pm/ }))
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700 900123' } })
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Book table' })).toBeEnabled())
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Book table' }))
    })
    expect(await screen.findByText("We've sent confirmation details by email.")).toBeInTheDocument()

    // Closed and opened again: the next answer says nothing about a message.
    rerender(<QuickBookSheet open={false} onClose={jest.fn()} source="test" />)
    answerBookingWith({ status: 201, body: { success: true, data: { state: 'confirmed', booking_reference: 'TB-B' } } })
    rerender(<QuickBookSheet open onClose={jest.fn()} source="test" />)
    fireEvent.click(await screen.findByRole('button', { name: /^7pm/ }))
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '07700 900123' } })
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Book table' })).toBeEnabled())
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Book table' }))
    })

    expect(await screen.findByText('TB-B')).toBeInTheDocument()
    expect(screen.queryByText(/We've sent/)).not.toBeInTheDocument()
  })

  it('does not promise a text before the booking is made', async () => {
    answerBookingWith({ status: 201, body: { success: true, data: { state: 'confirmed' } } })
    render(<QuickBookSheet open onClose={jest.fn()} source="test" />)
    fireEvent.click(await screen.findByRole('button', { name: /^7pm/ }))

    expect(screen.getByText('So we can confirm your booking.')).toBeInTheDocument()
    expect(screen.queryByText(/text your confirmation/)).not.toBeInTheDocument()
  })
})

describe('QuickBookSheet fails closed when the booking cannot be made', () => {
  it('a failing upstream (503) shows the error and the phone number', async () => {
    answerBookingWith({
      status: 503,
      body: { success: false, error: 'We could not process your booking right now.' },
    })

    await bookAtSeven()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not process your booking right now. Ring us on 01753 682707.'
    )
    expectPhoneLink()
    expectNotBooked()
    expect(trackBookingErrorShown).toHaveBeenCalledWith({ code: 'quick_book_submit_failed' })
  })

  it.each([
    [401, { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } }, 'API key'],
    [429, { success: false, error: { code: 'SOME_NEW_CODE', message: 'Rate limit exceeded' } }, 'Rate limit'],
    [500, { success: false, error: 'customer_conflict' }, 'customer_conflict'],
    [500, { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create table booking' } }, 'Failed to create']
  ])('never shows the wording of the booking system itself (%s)', async (status, body, wording) => {
    answerBookingWith({ status, body })

    await bookAtSeven()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('01753 682707')
    expect(alert.textContent).not.toContain(wording)
    expectPhoneLink()
    expectNotBooked()
  })

  it('a 200 that says success false is a failure', async () => {
    answerBookingWith({ status: 200, body: { success: false, error: { message: 'Not today.' } } })

    await bookAtSeven()

    expect(await screen.findByRole('alert')).toHaveTextContent('Not today. Ring us on 01753 682707.')
    expectNotBooked()
  })

  it('a reply that is not JSON (a gateway page) shows the error and the phone number', async () => {
    answerBookingWith({ status: 502, notJson: true })

    await bookAtSeven()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not complete your booking. Please try again, or ring us on 01753 682707.'
    )
    expectPhoneLink()
    expectNotBooked()
  })

  it('a 200 with an empty body is a failure, not a booking', async () => {
    answerBookingWith({ status: 200, body: null })

    await bookAtSeven()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expectPhoneLink()
    expectNotBooked()
  })

  it('a request that never arrives shows the error and the phone number', async () => {
    answerBookingWith(new TypeError('Failed to fetch'))

    await bookAtSeven()

    const failure = await screen.findByRole('alert')
    expect(failure).toHaveTextContent(
      'We could not complete your booking. Please try again, or ring us on 01753 682707.'
    )
    // Never the browser's own wording for a dropped connection.
    expect(failure).not.toHaveTextContent(/failed to fetch/i)
    expectPhoneLink()
    expectNotBooked()
  })
})

/**
 * Review BK-195 and BK-103. The sheet reloads its times on every chip without a
 * word to a screen reader, printed '13:00' where the full form prints '1pm',
 * shared one error line between two boxes that were not marked required, and
 * left focus nowhere once the booking was made.
 */
describe('QuickBookSheet says what it is doing, in the full form\'s words', () => {
  it('prints times the way the full form does, on the buttons and in the summary', async () => {
    answerBookingWith({ status: 201, body: { success: true, data: { state: 'confirmed', booking_reference: 'TB-12' } } })
    render(<QuickBookSheet open onClose={jest.fn()} source="test" />)

    expect(await screen.findByRole('button', { name: /^6:30pm/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^7:30pm/ })).toBeInTheDocument()
    expect(screen.queryByText('19:00')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^7pm/ }))
    expect(screen.getByText(/at 7pm\./)).toBeInTheDocument()
  })

  it('tells a screen reader how many times there are, from a region that was there all along', async () => {
    render(<QuickBookSheet open onClose={jest.fn()} source="test" />)
    const region = screen.getAllByRole('status').find((element) => element.className.includes('sr-only'))
    expect(region).toBeDefined()

    await screen.findByRole('button', { name: /^7pm/ })
    expect(region).toHaveTextContent('3 times available.')

    mockFetchAvailability.mockResolvedValueOnce(availabilityWith(['19:00']))
    fireEvent.click(screen.getByRole('button', { name: '4 people' }))
    await waitFor(() => expect(region).toHaveTextContent('1 time available.'))
  })

  it('marks both boxes required, and puts each refusal under its own box with focus on the first', async () => {
    const post = answerBookingWith({ status: 201, body: { success: true, data: { state: 'confirmed' } } })
    render(<QuickBookSheet open onClose={jest.fn()} source="test" />)
    fireEvent.click(await screen.findByRole('button', { name: /^7pm/ }))

    const phone = screen.getByLabelText('Mobile number')
    const firstName = screen.getByLabelText('First name')
    expect(phone).toBeRequired()
    expect(firstName).toBeRequired()

    fireEvent.click(screen.getByRole('button', { name: 'Book table' }))

    await waitFor(() => expect(phone).toHaveFocus())
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    expect(phone).toHaveAccessibleDescription('Please enter your mobile number.')
    expect(firstName).toHaveAttribute('aria-invalid', 'true')
    expect(firstName).toHaveAccessibleDescription('Please enter your first name.')
    expect(post).not.toHaveBeenCalled()

    // Fixing one clears its own message and leaves the other.
    fireEvent.change(phone, { target: { value: '07700 900123' } })
    expect(phone).not.toHaveAttribute('aria-invalid')
    expect(firstName).toHaveAttribute('aria-invalid', 'true')
  })

  it('moves focus to the result once the booking is made', async () => {
    answerBookingWith({ status: 201, body: { success: true, data: { state: 'confirmed', booking_reference: 'TB-9' } } })

    await bookAtSeven()

    const outcome = await screen.findByText("You're booked in.")
    await waitFor(() => expect(outcome).toHaveFocus())
  })
})

// Review BK-162. The sheet takes no email, so a number the management app cannot
// text (a landline, an overseas number) would leave the guest with no confirmation.
// The guest is stopped under the number and pointed at the full form, which asks
// for an email.
describe('QuickBookSheet and a number that cannot take texts', () => {
  const MESSAGE =
    'We can only text UK mobile numbers. Please use the full booking form so you can add an email for your confirmation.'

  it('stops a landline before anything is sent, says why under the number, and keeps the way to the full form', async () => {
    const post = answerBookingWith({ status: 201, body: { success: true, data: { state: 'confirmed' } } })

    render(<QuickBookSheet open onClose={jest.fn()} source="test" />)
    fireEvent.click(await screen.findByRole('button', { name: /^7pm/ }))
    fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '01753 682707' } })
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } })
    const book = screen.getByRole('button', { name: 'Book table' })
    await waitFor(() => expect(book).toBeEnabled())
    fireEvent.click(book)

    const phone = screen.getByLabelText('Mobile number')
    await waitFor(() => expect(phone).toHaveFocus())
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    expect(phone).toHaveAccessibleDescription(MESSAGE)
    expect(post).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Use the full form' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/book-table\?/)
    )
  })

  it("shows the management app's refusal of such a number under the number, not as a booking", async () => {
    answerBookingWith({
      status: 400,
      body: {
        success: false,
        code: 'EMAIL_REQUIRED_FOR_NON_MOBILE',
        error: {
          code: 'EMAIL_REQUIRED_FOR_NON_MOBILE',
          message: 'We can only text UK mobile numbers, so please add an email for your confirmation. Call 01753 682707 if you need help.',
        },
      },
    })

    await bookAtSeven()

    const phone = screen.getByLabelText('Mobile number')
    await waitFor(() => expect(phone).toHaveAccessibleDescription(MESSAGE))
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    expectNotBooked()
  })
})

// Review BK-079. The sheet showed the table form's notice, which talks about an
// email and an unsubscribe link though the sheet asks for no email, and sent no
// consent record at all.
describe('QuickBookSheet and the guest notice', () => {
  const QUICK_NOTICE =
    'We will use your phone to manage this booking, and to text you the latest from The Anchor: what is on, new menus, offers, and any changes. Reply NOEVENTS to stop those texts. Booking confirmations and reminders carry on either way.'

  it('shows its own notice, which mentions no email', async () => {
    answerBookingWith({ status: 201, body: { success: true, data: { state: 'confirmed' } } })
    render(<QuickBookSheet open onClose={jest.fn()} source="test" />)
    fireEvent.click(await screen.findByRole('button', { name: /^7pm/ }))

    expect(screen.getByText(QUICK_NOTICE)).toBeInTheDocument()
    expect(screen.queryByText(/unsubscribe link/)).not.toBeInTheDocument()
  })

  it('sends a consent record naming that notice with the booking', async () => {
    const post = answerBookingWith({ status: 201, body: { success: true, data: { state: 'confirmed', booking_reference: 'TB-9' } } })

    await bookAtSeven()

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    const sent = JSON.parse(String(post.mock.calls[0][1]?.body)) as Record<string, unknown>
    expect(sent.communication_consent).toEqual({
      service_contact_notice_shown: true,
      marketing_email_opt_in: false,
      marketing_sms_opt_in: false,
      whatsapp_opt_in: false,
      marketing_whatsapp_opt_in: false,
      consent_text_version: 'guest-comms-consent-v6',
      notice_key: 'table_quick_book_v1',
    })
  })
})
