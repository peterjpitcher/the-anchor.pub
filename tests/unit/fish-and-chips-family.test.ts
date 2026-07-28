import { isFishAndChipsFamily } from '@/lib/menu-page-data'

// menu-page-data reaches for React's `cache` at module scope, which is not
// available outside a server render. Same shim the other menu-page-data tests use.
jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    cache: (fn: unknown) => fn
  }
})

// The fish and chips landing page, its Product/Menu structured data, and the
// gluten-free exclusions are all driven by this matcher. It used to test for
// /fish|scampi/ only, so renaming the flagship dish to "Beer Battered Cod &
// Chips" silently emptied the page. These cases are the live menu.

describe('isFishAndChipsFamily', () => {
  it.each([
    'Beer Battered Cod & Chips',
    'Half Fish & Chips',
    'Fish Fingers & Chips',
    'Fish Finger Wrap',
    'Scampi & Chips'
  ])('matches %s', name => {
    expect(isFishAndChipsFamily({ name })).toBe(true)
  })

  it.each([
    'Chicken Goujons & Chips',
    'Jumbo Sausage & Chips',
    'Salt & Chilli Squid & Chips',
    'Beef & Ale Pie',
    'Chunky Chips',
    'Chocolate Fudge Cake'
  ])('does not match %s', name => {
    expect(isFishAndChipsFamily({ name })).toBe(false)
  })

  it('does not match a missing or empty name', () => {
    expect(isFishAndChipsFamily({})).toBe(false)
    expect(isFishAndChipsFamily({ name: null })).toBe(false)
    expect(isFishAndChipsFamily({ name: '' })).toBe(false)
  })

  it('only matches the species at a word start, not mid-word', () => {
    expect(isFishAndChipsFamily({ name: 'Fishcake Bites' })).toBe(true)
    expect(isFishAndChipsFamily({ name: 'Rocod Salad' })).toBe(false)
  })
})
