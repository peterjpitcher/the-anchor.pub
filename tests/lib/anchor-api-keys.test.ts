import { getAnchorBookingsApiKey, getAnchorReadApiKey, hasSeparateBookingsApiKey } from '@/lib/anchor-api-keys'

/**
 * BK-108: bookings and payments send their own management app key, so page reads cannot use up
 * the allowance a guest needs to book or pay. Until that key is set they keep using the read key.
 */
describe('management app API keys', () => {
  const original = { read: process.env.ANCHOR_API_KEY, bookings: process.env.ANCHOR_BOOKINGS_API_KEY }

  afterEach(() => {
    process.env.ANCHOR_API_KEY = original.read
    if (original.bookings === undefined) delete process.env.ANCHOR_BOOKINGS_API_KEY
    else process.env.ANCHOR_BOOKINGS_API_KEY = original.bookings
  })

  it('sends the bookings key for bookings and the read key for reads when both are set', () => {
    process.env.ANCHOR_API_KEY = 'read-key'
    process.env.ANCHOR_BOOKINGS_API_KEY = 'bookings-key'

    expect(getAnchorReadApiKey()).toBe('read-key')
    expect(getAnchorBookingsApiKey()).toBe('bookings-key')
    expect(hasSeparateBookingsApiKey()).toBe(true)
  })

  it('falls back to the read key for bookings until the second key exists', () => {
    process.env.ANCHOR_API_KEY = 'read-key'
    delete process.env.ANCHOR_BOOKINGS_API_KEY

    expect(getAnchorBookingsApiKey()).toBe('read-key')
    expect(hasSeparateBookingsApiKey()).toBe(false)
  })

  it('treats a blank bookings key as not set', () => {
    process.env.ANCHOR_API_KEY = 'read-key'
    process.env.ANCHOR_BOOKINGS_API_KEY = '   '

    expect(getAnchorBookingsApiKey()).toBe('read-key')
  })

  it('has no key at all when neither is set', () => {
    delete process.env.ANCHOR_API_KEY
    delete process.env.ANCHOR_BOOKINGS_API_KEY

    expect(getAnchorBookingsApiKey()).toBeUndefined()
    expect(getAnchorReadApiKey()).toBeUndefined()
  })
})
