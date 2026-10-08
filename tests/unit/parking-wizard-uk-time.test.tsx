import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ParkingBookingWizard } from '@/components/features/ParkingBookingWizard'

// The parking form's arrival and departure boxes are UK time.
//
// They used to be filled from, read with and printed back on the clock of the device showing the
// page. A phone on New York time sent a typed 10:00 as 15:00 in London, showed 10:00 in the
// summary, and the guest found out on the confirmation page after paying.
//
// The instants asserted here are fixed, so this file must give the same answers in every zone it
// is run in: London (`npm test`), UTC (`npm run test:utc`), and Sydney and Los Angeles
// (`npm run test:zones`). Before the fix it passed only in London.

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('next/script', () => ({ __esModule: true, default: () => null }))

const rates = {
  id: 'test-rate-card', effective_from: '2026-09-01', created_at: '2026-09-01',
  hourly_rate: 6, daily_rate: 18, weekly_rate: 90, monthly_rate: 300
}

const originalFetch = global.fetch
const mockFetch = jest.fn()

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

beforeEach(() => {
  // Pin "now" only; real timers keep running so the wizard's fetches resolve.
  jest.useFakeTimers({ doNotFake: ['setTimeout', 'setInterval', 'setImmediate', 'clearTimeout', 'clearInterval', 'clearImmediate', 'queueMicrotask', 'nextTick', 'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback', 'cancelIdleCallback', 'performance', 'hrtime'] })
  global.fetch = mockFetch
  mockFetch.mockReset()
  mockFetch.mockImplementation((url: string) =>
    Promise.resolve(response({ success: true, data: url.includes('/rates') ? rates : [{ remaining: 2 }] }))
  )
})

afterEach(() => {
  jest.useRealTimers()
  global.fetch = originalFetch
})

function arrivalBox() {
  return screen.getByLabelText(/Parking start/) as HTMLInputElement
}
function departureBox() {
  return screen.getByLabelText(/Parking end/) as HTMLInputElement
}

async function checkAvailability(): Promise<URLSearchParams> {
  fireEvent.click(screen.getByRole('button', { name: 'Check availability' }))
  await waitFor(() =>
    expect(mockFetch.mock.calls.some(([url]) => String(url).includes('/availability'))).toBe(true)
  )
  const url = String(mockFetch.mock.calls.find(([value]) => String(value).includes('/availability'))?.[0])
  return new URLSearchParams(url.split('?')[1])
}

describe('parking form: the boxes are labelled and filled in UK time', () => {
  it('says "UK time" on both boxes', () => {
    jest.setSystemTime(new Date('2026-11-09T09:00:00Z'))
    render(<ParkingBookingWizard />)
    expect(screen.getByLabelText(/Parking start \(arrival, UK time\)/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Parking end \(departure, UK time\)/)).toBeInTheDocument()
  })

  it('starts an hour and four hours from now on the London clock, in winter', () => {
    // 09:00 GMT on Monday 9 November 2026.
    jest.setSystemTime(new Date('2026-11-09T09:00:00Z'))
    render(<ParkingBookingWizard />)
    expect(arrivalBox().value).toBe('2026-11-09T10:00')
    expect(departureBox().value).toBe('2026-11-09T13:00')
    expect(arrivalBox().min).toBe('2026-11-09T09:00')
  })

  it('starts an hour and four hours from now on the London clock, in summer', () => {
    // 09:00 BST on Friday 10 July 2026 is 08:00 UTC.
    jest.setSystemTime(new Date('2026-07-10T08:00:00Z'))
    render(<ParkingBookingWizard />)
    expect(arrivalBox().value).toBe('2026-07-10T10:00')
    expect(departureBox().value).toBe('2026-07-10T13:00')
  })
})

describe('parking form: a typed time is sent as that time in London', () => {
  it('sends 10:00 on 10 November 2026 as 10:00 UTC', async () => {
    jest.setSystemTime(new Date('2026-11-01T09:00:00Z'))
    render(<ParkingBookingWizard />)
    fireEvent.change(arrivalBox(), { target: { value: '2026-11-10T10:00' } })
    fireEvent.change(departureBox(), { target: { value: '2026-11-12T10:00' } })
    const params = await checkAvailability()
    expect(params.get('start')).toBe('2026-11-10T10:00:00.000Z')
    expect(params.get('end')).toBe('2026-11-12T10:00:00.000Z')
  })

  it('sends 10:00 on 10 July 2026 as 09:00 UTC', async () => {
    jest.setSystemTime(new Date('2026-07-01T09:00:00Z'))
    render(<ParkingBookingWizard />)
    fireEvent.change(arrivalBox(), { target: { value: '2026-07-10T10:00' } })
    fireEvent.change(departureBox(), { target: { value: '2026-07-12T10:00' } })
    const params = await checkAvailability()
    expect(params.get('start')).toBe('2026-07-10T09:00:00.000Z')
    expect(params.get('end')).toBe('2026-07-12T09:00:00.000Z')
  })

  it('sends a stay across the October clock change with each end on its own offset', async () => {
    jest.setSystemTime(new Date('2026-10-20T09:00:00Z'))
    render(<ParkingBookingWizard />)
    fireEvent.change(arrivalBox(), { target: { value: '2026-10-24T10:00' } })
    fireEvent.change(departureBox(), { target: { value: '2026-10-26T10:00' } })
    const params = await checkAvailability()
    expect(params.get('start')).toBe('2026-10-24T09:00:00.000Z')
    expect(params.get('end')).toBe('2026-10-26T10:00:00.000Z')
  })

  it('sends a stay across the March clock change with each end on its own offset', async () => {
    jest.setSystemTime(new Date('2027-03-20T09:00:00Z'))
    render(<ParkingBookingWizard />)
    fireEvent.change(arrivalBox(), { target: { value: '2027-03-27T10:00' } })
    fireEvent.change(departureBox(), { target: { value: '2027-03-29T10:00' } })
    const params = await checkAvailability()
    expect(params.get('start')).toBe('2027-03-27T10:00:00.000Z')
    expect(params.get('end')).toBe('2027-03-29T09:00:00.000Z')
  })

  it('moves the departure two hours past an arrival typed after it, on the London clock', () => {
    jest.setSystemTime(new Date('2026-07-01T09:00:00Z'))
    render(<ParkingBookingWizard />)
    fireEvent.change(arrivalBox(), { target: { value: '2026-07-20T22:30' } })
    expect(departureBox().value).toBe('2026-07-21T00:30')
  })
})
