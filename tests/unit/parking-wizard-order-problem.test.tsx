import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ParkingBookingWizard } from '@/components/features/ParkingBookingWizard'

// When the booking system turns down something the guest typed (a mobile number
// that is not one, a stay under 30 minutes, no surname), the payment step shows
// the sentence the server chose, so the guest can put it right, instead of the
// general "could not be completed" line. Any other failure keeps that line.

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
// The PayPal script reports itself loaded as soon as the payment step renders it.
jest.mock('next/script', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react')
  return {
    __esModule: true,
    default: ({ onLoad }: { onLoad?: () => void }) => {
      ReactActual.useEffect(() => {
        onLoad?.()
      }, [])
      return null
    }
  }
})

type ButtonsConfig = {
  createOrder: () => Promise<string>
  onError: (error: unknown) => void
}

const rates = {
  id: 'test-rate-card', effective_from: '2026-09-01', created_at: '2026-09-01',
  hourly_rate: 5, daily_rate: 15, weekly_rate: 75, monthly_rate: 265
}

const originalFetch = global.fetch
const originalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
const mockFetch = jest.fn()
let buttonsConfig: ButtonsConfig | null = null
let createOrderAnswer: () => Response = () => response({}, 500)

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

beforeEach(() => {
  buttonsConfig = null
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-client-id'
  ;(window as unknown as { paypal?: unknown }).paypal = {
    Buttons: (config: ButtonsConfig) => {
      buttonsConfig = config
      return { render: jest.fn() }
    }
  }
  global.fetch = mockFetch
  mockFetch.mockReset()
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/create-order')) return Promise.resolve(createOrderAnswer())
    return Promise.resolve(response({ success: true, data: url.includes('/rates') ? rates : [{ remaining: 2 }] }))
  })
})

afterEach(() => {
  global.fetch = originalFetch
  delete (window as unknown as { paypal?: unknown }).paypal
  if (originalClientId === undefined) delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  else process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = originalClientId
})

async function reachPaymentStep() {
  render(<ParkingBookingWizard />)
  fireEvent.click(screen.getByRole('button', { name: 'Check availability' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Pat' } })
  fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Example' } })
  fireEvent.change(screen.getByLabelText('Mobile number'), { target: { value: '12345' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

  fireEvent.change(screen.getByLabelText('Vehicle registration'), { target: { value: 'AB12CDE' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

  await waitFor(() => expect(buttonsConfig).not.toBeNull())
}

/** What the PayPal button does when the order cannot be created: createOrder throws, then onError. */
async function pressPayPalAndFail() {
  await act(async () => {
    await buttonsConfig!.createOrder().catch(() => undefined)
    buttonsConfig!.onError(new Error('Could not create order'))
  })
}

describe('parking payment step: what the guest is told when the order cannot be created', () => {
  it('shows the sentence for a detail the guest can put right', async () => {
    const sentence = 'Please enter a valid phone number. Call 01753 682707 if you need help.'
    createOrderAnswer = () => response({ error: sentence, code: 'VALIDATION_ERROR' }, 400)

    await reachPaymentStep()
    await pressPayPalAndFail()

    expect(screen.getByRole('alert')).toHaveTextContent(sentence)
    expect(screen.queryByText(/Payment could not be completed/)).not.toBeInTheDocument()
  })

  it('keeps the general line, with our number, for a failure on our side', async () => {
    createOrderAnswer = () =>
      response({ error: 'We could not start your parking payment. Please try again, or call 01753 682707 and we will book your space.' }, 502)

    await reachPaymentStep()
    await pressPayPalAndFail()

    expect(screen.getByRole('alert')).toHaveTextContent(/Payment could not be completed/)
    expect(screen.getByRole('alert')).toHaveTextContent('01753 682707')
  })

  it('does not show a 400 without the code, such as the form check on the website itself', async () => {
    createOrderAnswer = () => response({ error: 'Invalid email address' }, 400)

    await reachPaymentStep()
    await pressPayPalAndFail()

    expect(screen.getByRole('alert')).toHaveTextContent(/Payment could not be completed/)
    expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument()
  })

  it('drops the sentence when the guest tries again', async () => {
    const sentence = 'Please enter your surname. Call 01753 682707 if you need help.'
    createOrderAnswer = () => response({ error: sentence, code: 'VALIDATION_ERROR' }, 400)

    await reachPaymentStep()
    await pressPayPalAndFail()
    expect(screen.getByRole('alert')).toHaveTextContent(sentence)

    createOrderAnswer = () => response({ error: 'Something else went wrong' }, 502)
    await pressPayPalAndFail()

    expect(screen.getByRole('alert')).toHaveTextContent(/Payment could not be completed/)
    expect(screen.queryByText(sentence)).not.toBeInTheDocument()
  })
})
