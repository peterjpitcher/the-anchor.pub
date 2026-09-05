import { isValidElement } from 'react'
import HeathrowParkingPage from '@/app/heathrow-parking/page'

const mockGetParkingRates = jest.fn()
jest.mock('@/lib/api', () => ({ anchorAPI: { getParkingRates: () => mockGetParkingRates() } }))
jest.mock('@/components/features/ParkingBookingWizard', () => ({ ParkingBookingWizard: () => null }))
jest.mock('@/components/reviews', () => ({ ReviewSection: () => null }))

const rates = {
  id: 'test-rate-card', effective_from: '2026-09-01', created_at: '2026-09-01',
  hourly_rate: 6, daily_rate: 18, weekly_rate: 90, monthly_rate: 300
}

beforeEach(() => { mockGetParkingRates.mockReset() })
afterEach(() => { jest.restoreAllMocks() })

it('uses the fetched rate card in visible copy, FAQ and structured offers', async () => {
  mockGetParkingRates.mockResolvedValue(rates)
  const page = await HeathrowParkingPage()
  const output = JSON.stringify(page, (_key, value) => isValidElement(value) ? value.props : value)
  expect(output).toContain('£6.00 per hour')
  expect(output).toContain('£18.00 per day')
  expect(output).toContain('£90.00 per week')
  expect(output).toContain('£300.00 per month')
  expect(output).not.toMatch(/£(?:5|15|75|265)(?:\.00)?(?:\/day| per | daily | weekly )/)
  const scripts = page.props.children.filter((child: { type?: string }) => child?.type === 'script')
  const schemas = scripts.map((child: { props: { dangerouslySetInnerHTML: { __html: string } } }) => JSON.parse(child.props.dangerouslySetInnerHTML.__html))
  expect(schemas.find((schema: { '@type': string }) => schema['@type'] === 'ParkingFacility')).toMatchObject({ offers: { price: 18 } })
})

it('omits price offers and supplies a contact fallback when management is unavailable', async () => {
  mockGetParkingRates.mockRejectedValue(new Error('Upstream unavailable'))
  jest.spyOn(console, 'error').mockImplementation(() => {})
  const page = await HeathrowParkingPage()
  const output = JSON.stringify(page, (_key, value) => isValidElement(value) ? value.props : value)
  expect(output).toContain('We could not load current parking prices')
  expect(output).not.toMatch(/£(?:5|15|75|265)(?:\.00)?(?:\/day| per | daily | weekly )/)
  const scripts = page.props.children.filter((child: { type?: string }) => child?.type === 'script')
  const schemas = scripts.map((child: { props: { dangerouslySetInnerHTML: { __html: string } } }) => JSON.parse(child.props.dangerouslySetInnerHTML.__html))
  for (const schema of schemas) {
    expect(schema).not.toHaveProperty('offers')
    expect(schema).not.toHaveProperty('priceRange')
  }
})
