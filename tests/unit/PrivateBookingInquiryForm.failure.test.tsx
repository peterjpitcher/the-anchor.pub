import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PrivateBookingInquiryForm } from '@/components/PrivateBookingInquiryForm'

/**
 * The cost estimator's enquiry form, with the REAL request helper.
 *
 * The route answers some failures with `error` as an object. The helper used
 * to copy that object into `message`, the form rendered it, React threw
 * "Objects are not valid as a React child", the whole page fell to the error
 * boundary and everything the guest had typed was gone. The form's older test
 * mocks the helper and feeds it a string, so the real shape was never tried.
 */

// The real helper, reached through the barrel the form imports it from.
jest.mock('@/lib/api', () => ({
  createPrivateBooking: (...args: unknown[]) =>
    (jest.requireActual('@/lib/api/private-bookings') as { createPrivateBooking: (...inner: unknown[]) => unknown }).createPrivateBooking(...args)
}))

jest.mock('@/lib/gtm-events', () => ({
  trackPrivateHireEnquiryStarted: jest.fn(),
  trackPrivateHireEnquirySubmitted: jest.fn()
}))

jest.mock('@/lib/error-handling', () => ({
  ...jest.requireActual('@/lib/error-handling'),
  logError: jest.fn()
}))

import { trackPrivateHireEnquirySubmitted } from '@/lib/gtm-events'

const PHONE = '01753 682707'
const NOTES = 'Sixty of us for a fortieth. Two vegans and one coeliac, and we would like the garden if it is dry.'

type Answer = () => Response | Promise<Response>

function answerEnquiryWith(enquiry: Answer) {
  ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/customers/lookup')) {
      return Promise.resolve(
        new Response(JSON.stringify({ success: true, data: { known: false } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    }
    if (url.includes('/public/private-booking')) return Promise.resolve().then(enquiry)
    return Promise.reject(new Error(`Unexpected fetch: ${url}`))
  })
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

async function fillAndSend() {
  render(<PrivateBookingInquiryForm />)

  const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement
  fireEvent.change(phoneInput, { target: { value: '07700900123' } })
  fireEvent.click(screen.getByRole('button', { name: /continue/i }))

  await waitFor(() => expect(screen.getByRole('button', { name: /send inquiry/i })).toBeInTheDocument())

  const textInputs = document.querySelectorAll('input[type="text"]')
  fireEvent.change(textInputs[0], { target: { value: 'Alice' } })
  fireEvent.change(textInputs[1], { target: { value: 'Booker' } })
  fireEvent.change(document.querySelector('textarea') as HTMLTextAreaElement, { target: { value: NOTES } })

  fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }))
}

function expectFormStillFilledIn() {
  // Not the error boundary, and not the success screen.
  expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  expect(screen.queryByText('Inquiry Received!')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /send inquiry/i })).toBeInTheDocument()

  // Everything the guest typed is still there.
  const textInputs = document.querySelectorAll('input[type="text"]')
  expect((textInputs[0] as HTMLInputElement).value).toBe('Alice')
  expect((textInputs[1] as HTMLInputElement).value).toBe('Booker')
  expect((document.querySelector('textarea') as HTMLTextAreaElement).value).toBe(NOTES)

  expect(trackPrivateHireEnquirySubmitted).not.toHaveBeenCalled()
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('the estimator enquiry form when the enquiry cannot be sent', () => {
  it.each<[string, Answer, string]>([
    [
      'an object-shaped error, both routes to a person having failed (502)',
      () => json({ success: false, error: { code: 'UPSTREAM_ERROR', message: 'We could not submit that enquiry. Please call 01753 682707 and we will take your details.' } }, 502),
      'We could not submit that enquiry. Please call 01753 682707 and we will take your details.'
    ],
    [
      'an object-shaped error for notes that are too long (400)',
      () => json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Your enquiry details are too long. Please shorten your notes or call 01753 682707 so we can record every detail.' } }, 400),
      'Your enquiry details are too long. Please shorten your notes or call 01753 682707 so we can record every detail.'
    ],
    [
      'an object-shaped error with no message in it',
      () => json({ success: false, error: { code: 'PROXY_ERROR' } }, 500),
      'We could not submit that enquiry. Please call 01753 682707 and we will take your details.'
    ],
    [
      'a plain string from the spam guard (400)',
      () => json({ success: false, error: 'We could not accept that submission. Please try again, or call us on 01753 682707 and we will take your details.' }, 400),
      'We could not accept that submission. Please try again, or call us on 01753 682707 and we will take your details.'
    ],
    [
      'a sentence the management app wrote for a developer',
      () => json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } }, 401),
      'We could not submit that enquiry. Please call 01753 682707 and we will take your details.'
    ],
    [
      'a gateway page that is not JSON',
      () => new Response('<!doctype html><html><body>Bad gateway</body></html>', { status: 502 }),
      'We could not submit that enquiry. Please call 01753 682707 and we will take your details.'
    ],
    [
      'a 200 that does not say it succeeded',
      () => json({ success: false, error: { code: 'UPSTREAM_ERROR', message: 'Failed to create booking via proxy' } }, 200),
      'We could not submit that enquiry. Please call 01753 682707 and we will take your details.'
    ],
    [
      'no connection at all',
      () => Promise.reject(new TypeError('Failed to fetch')),
      'We could not submit that enquiry. Please call 01753 682707 and we will take your details.'
    ]
  ])('shows a sentence and keeps what the guest typed: %s', async (_label, answer, expected) => {
    answerEnquiryWith(answer)

    await fillAndSend()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(expected)
    expect(alert).toHaveTextContent(PHONE)
    expect(alert.textContent).not.toMatch(/\[object Object\]|Failed to fetch|API key|proxy|Unexpected token/)
    expectFormStillFilledIn()
  })

  it('lets the guest try again after a failure, and succeeds', async () => {
    let attempt = 0
    answerEnquiryWith(() => {
      attempt += 1
      return attempt === 1
        ? json({ success: false, error: { code: 'UPSTREAM_ERROR', message: 'We could not submit that enquiry. Please call 01753 682707 and we will take your details.' } }, 502)
        : json({ success: true, data: { id: 'pb-1', reference: 'PB-1' }, state: 'enquiry_created' }, 200)
    })

    await fillAndSend()
    await screen.findByRole('alert')

    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }))

    expect(await screen.findByText('Inquiry Received!')).toBeInTheDocument()
    expect(trackPrivateHireEnquirySubmitted).toHaveBeenCalledTimes(1)
  })
})
