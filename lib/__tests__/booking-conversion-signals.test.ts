import { createHash } from 'crypto'
import type { NextRequest } from 'next/server'

import {
  getClientIpAddress,
  hashEmailForMeta,
  hashPhoneForMeta,
} from '@/lib/booking-conversion-signals'

const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex')

function makeRequest(headers: Record<string, string>): NextRequest {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as unknown as NextRequest
}

describe('hashEmailForMeta', () => {
  it('normalises (trim + lowercase) before hashing', () => {
    expect(hashEmailForMeta('  Peter@Example.COM ')).toBe(sha256('peter@example.com'))
  })

  it('returns null for missing or invalid emails', () => {
    expect(hashEmailForMeta(null)).toBeNull()
    expect(hashEmailForMeta('')).toBeNull()
    expect(hashEmailForMeta('not-an-email')).toBeNull()
  })

  it('never returns the raw value', () => {
    const result = hashEmailForMeta('peter@example.com')
    expect(result).not.toContain('@')
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('hashPhoneForMeta', () => {
  it('converts a UK local number to country-code form before hashing', () => {
    expect(hashPhoneForMeta('07700 900123')).toBe(sha256('447700900123'))
  })

  it('strips + and 00 international prefixes', () => {
    expect(hashPhoneForMeta('+44 7700 900123')).toBe(sha256('447700900123'))
    expect(hashPhoneForMeta('0044 7700 900123')).toBe(sha256('447700900123'))
  })

  it('respects a custom default country code', () => {
    expect(hashPhoneForMeta('0123 456 789', '33')).toBe(sha256('33123456789'))
  })

  it('returns null for missing or too-short numbers', () => {
    expect(hashPhoneForMeta(null)).toBeNull()
    expect(hashPhoneForMeta('12345')).toBeNull()
  })

  it('falls back to the UK code when the supplied country code is malformed', () => {
    expect(hashPhoneForMeta('07700 900123', 'xx')).toBe(sha256('447700900123'))
    expect(hashPhoneForMeta('07700 900123', '')).toBe(sha256('447700900123'))
  })
})

describe('getClientIpAddress', () => {
  it('uses the first x-forwarded-for hop', () => {
    const request = makeRequest({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })
    expect(getClientIpAddress(request)).toBe('203.0.113.7')
  })

  it('falls back to x-real-ip', () => {
    const request = makeRequest({ 'x-real-ip': '203.0.113.9' })
    expect(getClientIpAddress(request)).toBe('203.0.113.9')
  })

  it('returns null when no header is present', () => {
    expect(getClientIpAddress(makeRequest({}))).toBeNull()
  })
})
