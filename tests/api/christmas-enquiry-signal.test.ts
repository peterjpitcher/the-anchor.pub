/**
 * BK-190: the Christmas enquiry forms' no-personal-data signal. One log line per stage, built only
 * from fixed lists, so it can show a dead form ("opened, never submitted") without ever carrying
 * what a visitor typed.
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/enquiry/christmas/signal/route'

function send(body: string) {
  return POST(
    new NextRequest('http://localhost/api/enquiry/christmas/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.7' },
      body
    })
  )
}

describe('POST /api/enquiry/christmas/signal', () => {
  let info: jest.SpyInstance

  beforeEach(() => {
    info = jest.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => info.mockRestore())

  it('logs the stage, the form, the journey and the reason, and nothing else', async () => {
    const response = await send(JSON.stringify({
      stage: 'blocked', form: 'main', mode: 'party', reason: 'no_security_token', name: 'Jo Bloggs', phone: '07700900123'
    }))

    expect(response.status).toBe(204)
    expect(info).toHaveBeenCalledWith(
      '[christmas-enquiry-signal]',
      JSON.stringify({ stage: 'blocked', form: 'main', mode: 'party', reason: 'no_security_token' })
    )
    expect(JSON.stringify(info.mock.calls)).not.toMatch(/Jo Bloggs|07700900123/)
  })

  it('drops anything outside the fixed lists', async () => {
    await send(JSON.stringify({ stage: 'opened', form: 'quick', mode: 'brunch', reason: 'free text' }))
    expect(info).toHaveBeenCalledWith(
      '[christmas-enquiry-signal]',
      JSON.stringify({ stage: 'opened', form: 'quick', mode: null, reason: null })
    )
  })

  it('logs nothing for an unknown stage or form, and never fails the caller', async () => {
    expect((await send(JSON.stringify({ stage: 'hacked', form: 'main' }))).status).toBe(204)
    expect((await send('not json')).status).toBe(204)
    expect(info).not.toHaveBeenCalled()
  })
})
