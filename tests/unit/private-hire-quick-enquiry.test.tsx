import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { PrivateHireQuickEnquiry } from '@/components/PrivateHireQuickEnquiry'

jest.mock('@/lib/gtm-events', () => ({ trackPrivateHireEnquiryStarted: jest.fn(), trackPrivateHireEnquirySubmitted: jest.fn() }))
jest.mock('@/components/security/TurnstileField', () => ({ TurnstileField: () => null }))

const fetchMock = jest.fn()
beforeEach(() => { jest.clearAllMocks(); global.fetch = fetchMock })
function fill(): void {
  fireEvent.change(screen.getByLabelText('Approximate guests'), { target: { value: '250' } })
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Test Guest' } })
  fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+447700900000' } })
}
function send(): void { fireEvent.submit(screen.getByRole('form', { name: 'Short private hire enquiry' })) }
function accepted(): void { fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { id: 'test-enquiry' }, state: 'enquiry_created' }) }) }

test('undecided enquiry keeps occasion, space, large party and explicit consent without a dummy date or booking items', async () => {
  accepted()
  render(<PrivateHireQuickEnquiry eventType="Birthday Party" initialSpaceId="dining-room" />)
  fill(); send()
  await screen.findByText('Enquiry received')
  const payload = JSON.parse(fetchMock.mock.calls[0][1].body)
  expect(fetchMock.mock.calls[0][0]).toBe('/api/private-booking-enquiry')
  expect(payload).toMatchObject({ event_type: 'Birthday Party', guest_count: 250, communication_consent: { marketing_email_opt_in: false, marketing_sms_opt_in: false, service_contact_notice_shown: true } })
  expect(payload.internal_notes).toContain('Space of interest: dining-room')
  expect(payload.internal_notes).toContain('Date undecided')
  expect(payload).not.toHaveProperty('event_date')
  expect(payload).not.toHaveProperty('items')
  expect(payload).not.toHaveProperty('contact_email')
  expect(screen.getByRole('status')).toHaveTextContent('does not hold your date')
})

test('dated enquiry records notes and requested email reply', async () => {
  accepted(); render(<PrivateHireQuickEnquiry eventType="Corporate Event" />); fill()
  fireEvent.click(screen.getByLabelText('Date undecided'))
  fireEvent.change(screen.getByLabelText('Preferred date'), { target: { value: '2026-12-01' } })
  fireEvent.change(screen.getByLabelText('Email (optional)'), { target: { value: 'test@example.invalid' } })
  fireEvent.change(screen.getByLabelText('Preferred reply method'), { target: { value: 'Email' } })
  fireEvent.change(screen.getByLabelText('Notes (optional)'), { target: { value: 'Please discuss catering' } })
  send(); await screen.findByText('Enquiry received')
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ event_date: '2026-12-01', contact_email: 'test@example.invalid', internal_notes: expect.stringContaining('Requested reply method: Email') })
})

test('failure retains inputs, suppresses double submit, and retries the same business payload', async () => {
  fetchMock.mockRejectedValueOnce(new Error('Network unavailable'))
  render(<PrivateHireQuickEnquiry eventType="Birthday Party" />); fill(); send(); send()
  await screen.findByRole('alert')
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(screen.getByLabelText('Your name')).toHaveValue('Test Guest')
  accepted(); send(); await screen.findByText('Enquiry received')
  const first = JSON.parse(fetchMock.mock.calls[0][1].body)
  const second = JSON.parse(fetchMock.mock.calls[1][1].body)
  delete first._t; delete second._t
  expect(second).toEqual(first)
})

test('invalid phone does not submit', () => {
  render(<PrivateHireQuickEnquiry eventType="Birthday Party" />); fill()
  fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: 'wrong' } }); send()
  expect(screen.getByRole('alert')).toHaveTextContent('valid phone')
  expect(fetchMock).not.toHaveBeenCalled()
})

test('bot rejection remains a recoverable error and never confirms receipt', async () => {
  fetchMock.mockResolvedValue({ ok: false, json: async () => ({ success: false, error: { message: 'Security check failed' } }) })
  render(<PrivateHireQuickEnquiry eventType="Birthday Party" />); fill(); send()
  expect(await screen.findByRole('alert')).toHaveTextContent('Security check failed')
  expect(screen.queryByText('Enquiry received')).not.toBeInTheDocument()
})

test('email fallback is distinguished from a saved enquiry', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { id: null }, state: 'enquiry_emailed' }) })
  render(<PrivateHireQuickEnquiry eventType="Birthday Party" />); fill(); send()
  await screen.findByText('Enquiry emailed to our team')
  expect(screen.getByRole('status')).toHaveTextContent('could not save your enquiry')
})


test('consent labels target their own form when two enquiry forms are mounted', () => {
  render(<><PrivateHireQuickEnquiry eventType="Birthday Party" /><PrivateHireQuickEnquiry eventType="Corporate Event" /></>)
  const forms = screen.getAllByRole('form')
  const first = within(forms[0]).getByLabelText(/Email me the latest/) as HTMLInputElement
  const second = within(forms[1]).getByLabelText(/Email me the latest/) as HTMLInputElement
  expect(first.id).not.toBe(second.id)
  fireEvent.click(second)
  expect(second).toBeChecked()
  expect(first).not.toBeChecked()
})


test('a timed out submission keeps details for a retry', async () => {
  jest.useFakeTimers()
  fetchMock.mockImplementation((_url, options: RequestInit) => new Promise((_resolve, reject) => {
    options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
  }))
  try {
    render(<PrivateHireQuickEnquiry eventType="Birthday Party" />); fill(); send()
    await act(async () => { jest.advanceTimersByTime(45000) })
    expect(screen.getByRole('alert')).toHaveTextContent('could not confirm receipt')
    expect(screen.getByLabelText('Your name')).toHaveValue('Test Guest')
    expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeEnabled()
  } finally { jest.useRealTimers() }
})
