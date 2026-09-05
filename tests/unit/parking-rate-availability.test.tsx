import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ParkingBookingWizard } from '@/components/features/ParkingBookingWizard'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('next/script', () => ({ __esModule: true, default: () => null }))

const rates = {
  id: 'test-rate-card', effective_from: '2026-09-01', created_at: '2026-09-01',
  hourly_rate: 6, daily_rate: 18, weekly_rate: 90, monthly_rate: 300
}
const originalFetch = global.fetch
const mockFetch = jest.fn()

beforeEach(() => {
  global.fetch = mockFetch
  mockFetch.mockReset()
})
afterEach(() => { global.fetch = originalFetch })

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

it('keeps the visitor on dates when spaces exist but current prices are unavailable', async () => {
  mockFetch.mockImplementation((url: string) => Promise.resolve(url.includes('/rates')
    ? response({ success: false, error: { message: 'Current parking prices unavailable' } }, 503)
    : response({ success: true, data: [{ remaining: 2 }] })))
  render(<ParkingBookingWizard />)
  await screen.findByText('Current parking prices unavailable')
  fireEvent.click(screen.getByRole('button', { name: 'Check availability' }))
  await screen.findByText(/Great news! We have at least 2/)
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
})

it('allows the next step once current prices and availability have both loaded', async () => {
  mockFetch.mockImplementation((url: string) => Promise.resolve(response({ success: true, data: url.includes('/rates') ? rates : [{ remaining: 2 }] })))
  render(<ParkingBookingWizard />)
  await screen.findByText(/Daily: GBP 18.00/)
  fireEvent.click(screen.getByRole('button', { name: 'Check availability' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  expect(screen.getByLabelText(/First name/)).toBeInTheDocument()
})
