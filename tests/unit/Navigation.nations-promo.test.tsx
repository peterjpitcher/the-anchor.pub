import { render, screen, cleanup } from '@testing-library/react'
import { Navigation } from '@/components/layout/Navigation'
import { getHeaderPromoCtas } from '@/lib/header-promos'
jest.mock('@/lib/gtm-events', () => ({ trackModalClose: jest.fn(), trackModalEngage: jest.fn(), trackModalOpen: jest.fn(), trackNavigationClick: jest.fn() }))
jest.mock('@/hooks/useFocusTrap', () => ({ useFocusTrap: () => ({ current: null }) }))
afterEach(() => { cleanup(); jest.useRealTimers() })
it.each([
  ['2026-09-04T22:59:00Z', false],
  ['2026-09-04T23:00:00Z', true],
  ['2026-11-29T23:59:00Z', true],
  ['2026-11-30T00:00:00Z', false],
])('shows the tournament link only in its London date window at %s', (instant, visible) => {
  jest.useFakeTimers().setSystemTime(new Date(instant))
  render(<Navigation promoCtaButtons={getHeaderPromoCtas(new Date(instant))} />)
  expect(screen.queryAllByRole('link', { name: 'Nations Championship' }).length > 0).toBe(visible)
})
