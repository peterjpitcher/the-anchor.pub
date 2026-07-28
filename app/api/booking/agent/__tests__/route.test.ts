import { GET, POST } from '../route'

/**
 * The agent endpoint was retired on 2026-07-28. This replaces the previous suite, which exercised
 * booking creation through it.
 *
 * These tests exist to make the retirement deliberate: if someone reinstates the handlers without
 * putting real authentication in front of them, this fails rather than quietly passing.
 */
describe('retired booking agent endpoint', () => {
  it('refuses POST with 410 Gone rather than creating a booking', async () => {
    const response = await POST()
    expect(response.status).toBe(410)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/retired/i)
    // The caller is given somewhere real to go.
    expect(body.error).toMatch(/book-table|01753/)
  })

  it('refuses GET with 410 Gone', async () => {
    const response = await GET()
    expect(response.status).toBe(410)
    expect((await response.json()).success).toBe(false)
  })

  it('tells caches and clients not to keep retrying', async () => {
    const response = await POST()
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(response.headers.get('Link')).toContain('/book-table')
  })

  it('creates nothing: the handlers take no request, so there is no path to a booking', () => {
    expect(POST.length).toBe(0)
    expect(GET.length).toBe(0)
  })
})
