import fs from 'node:fs'
import path from 'node:path'
import {
  REQUIRED_IN_PRODUCTION,
  assertRequiredEnv,
  isTurnstilePairBroken,
  missingRequiredEnv
} from '@/lib/required-env'

/**
 * The site used to build and go live with the keys its forms need missing.
 * A production build now stops, naming the setting. A preview only warns, and
 * CI and a laptop are left alone.
 */

const ALL_SET: Record<string, string> = Object.fromEntries(
  REQUIRED_IN_PRODUCTION.map((setting) => [setting.name, `value-of-${setting.name}`])
)

describe('what is required', () => {
  it('is the eight settings the public write paths cannot work without', () => {
    expect(REQUIRED_IN_PRODUCTION.map((setting) => setting.name)).toEqual([
      'ANCHOR_API_KEY',
      'TURNSTILE_SECRET_KEY',
      'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
      'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
      'MICROSOFT_TENANT_ID',
      'MICROSOFT_CLIENT_ID',
      'MICROSOFT_CLIENT_SECRET',
      'MICROSOFT_USER_EMAIL'
    ])
  })

  it('is listed in .env.example, so a new set-up knows about every one', () => {
    const example = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8')
    for (const setting of REQUIRED_IN_PRODUCTION) {
      expect(example).toMatch(new RegExp(`^${setting.name}=`, 'm'))
    }
  })

  it('is loaded by next.config.js, which is what makes it a build-time check', () => {
    const config = fs.readFileSync(path.join(process.cwd(), 'next.config.js'), 'utf8')
    expect(config).toContain("require('./lib/required-env').assertRequiredEnv()")
  })
})

describe('a production build', () => {
  it('passes when every required setting is present', () => {
    expect(assertRequiredEnv({ ...ALL_SET, VERCEL_ENV: 'production' })).toEqual({ checked: 'production', missing: [] })
  })

  it.each(REQUIRED_IN_PRODUCTION.map((setting) => setting.name))('is stopped when %s is missing, and names it', (name) => {
    const env = { ...ALL_SET, VERCEL_ENV: 'production' }
    delete (env as Record<string, string>)[name]

    expect(() => assertRequiredEnv(env)).toThrow(name)
    expect(() => assertRequiredEnv(env)).toThrow('The production build was stopped')
  })

  it('treats an empty or blank value as missing', () => {
    expect(() => assertRequiredEnv({ ...ALL_SET, VERCEL_ENV: 'production', ANCHOR_API_KEY: '' })).toThrow('ANCHOR_API_KEY')
    expect(() => assertRequiredEnv({ ...ALL_SET, VERCEL_ENV: 'production', ANCHOR_API_KEY: '   ' })).toThrow('ANCHOR_API_KEY')
  })

  it('names every missing setting at once, and never prints a value', () => {
    const env = { VERCEL_ENV: 'production', ANCHOR_API_KEY: 'super-secret-value' }

    let message = ''
    try {
      assertRequiredEnv(env)
    } catch (error) {
      message = (error as Error).message
    }

    for (const setting of REQUIRED_IN_PRODUCTION) {
      if (setting.name === 'ANCHOR_API_KEY') expect(message).not.toContain('ANCHOR_API_KEY')
      else expect(message).toContain(setting.name)
    }
    expect(message).not.toContain('super-secret-value')
  })

  it('says the two Turnstile settings must be set together', () => {
    const env = { ...ALL_SET, VERCEL_ENV: 'production' } as Record<string, string>
    delete env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    expect(isTurnstilePairBroken(env)).toBe(true)
    expect(() => assertRequiredEnv(env)).toThrow('must be set together')
  })
})

describe('a preview build', () => {
  it('warns, names the setting, and carries on', () => {
    const warn = jest.fn()
    const env = { ...ALL_SET, VERCEL_ENV: 'preview' } as Record<string, string>
    delete env.MICROSOFT_CLIENT_SECRET

    expect(assertRequiredEnv(env, { warn })).toEqual({ checked: 'preview', missing: ['MICROSOFT_CLIENT_SECRET'] })
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('MICROSOFT_CLIENT_SECRET')
    expect(warn.mock.calls[0][0]).toContain('the build carries on')
  })

  it('says nothing when everything is present', () => {
    const warn = jest.fn()
    expect(assertRequiredEnv({ ...ALL_SET, VERCEL_ENV: 'preview' }, { warn })).toEqual({ checked: 'preview', missing: [] })
    expect(warn).not.toHaveBeenCalled()
  })

  it('is not failed for lacking a production-only setting the build does not require', () => {
    // The review found these five are set in Production and absent from Preview.
    const warn = jest.fn()
    const env = { ...ALL_SET, VERCEL_ENV: 'preview' }
    for (const name of [
      'CHEERSAI_BASE_URL',
      'CHEERSAI_BOOKING_CONVERSIONS_SECRET',
      'CHEERSAI_FEED_API_KEY',
      'CHEERSAI_NATIONS_FEED_API_KEY',
      'NEXT_PUBLIC_META_PIXEL_ID'
    ]) {
      expect(env).not.toHaveProperty(name)
    }

    expect(() => assertRequiredEnv(env, { warn })).not.toThrow()
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('CI and a laptop', () => {
  it.each([undefined, 'development', ''])('are left alone with nothing set (VERCEL_ENV=%p)', (target) => {
    const warn = jest.fn()
    const env: Record<string, string | undefined> = target === undefined ? {} : { VERCEL_ENV: target }

    expect(assertRequiredEnv(env, { warn })).toEqual({ checked: 'skipped', missing: [] })
    expect(warn).not.toHaveBeenCalled()
  })

  it('still reports what is missing to anything that asks, such as the health check', () => {
    expect(missingRequiredEnv({})).toHaveLength(REQUIRED_IN_PRODUCTION.length)
    expect(missingRequiredEnv(ALL_SET)).toEqual([])
  })
})
