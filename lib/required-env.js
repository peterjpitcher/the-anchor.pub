// @ts-check

/**
 * The settings the public write paths cannot work without, checked when the
 * site is built.
 *
 * Plain CommonJS on purpose: next.config.js loads it with require() before any
 * TypeScript has been compiled. The health route imports the same list, so the
 * build and the running site can never disagree about what is required.
 *
 * What happens where (owner-approved spec P04, 7 October 2026):
 *
 *   VERCEL_ENV=production  a missing setting FAILS the build, naming it. The
 *                          site used to build and go live without the keys its
 *                          forms need, and guests found out before we did.
 *   VERCEL_ENV=preview     a missing setting is a WARNING in the build log. A
 *                          preview may legitimately lack a production-only
 *                          setting, and the review found five that it does
 *                          lack today, so a preview is never failed.
 *   anything else          nothing. CI builds without secrets on purpose and a
 *                          laptop builds from .env.local.
 *
 * Only the eight below are required. All eight were confirmed present in both
 * Production and Preview on 7 October 2026 (names only, values never read).
 * Settings with a safe fallback or a feature that simply switches off are not
 * listed: making them required would turn a quiet default into a failed deploy.
 */

/** @typedef {{ name: string, why: string }} RequiredSetting */

/** @type {ReadonlyArray<RequiredSetting>} */
const REQUIRED_IN_PRODUCTION = Object.freeze([
  { name: 'ANCHOR_API_KEY', why: 'every booking, enquiry and payment is sent to the management app with it' },
  { name: 'TURNSTILE_SECRET_KEY', why: 'every form is refused without it (the security check fails closed)' },
  { name: 'NEXT_PUBLIC_TURNSTILE_SITE_KEY', why: 'the security check cannot appear on any form without it' },
  { name: 'NEXT_PUBLIC_PAYPAL_CLIENT_ID', why: 'no deposit, ticket or parking payment can start without it' },
  { name: 'MICROSOFT_TENANT_ID', why: 'the fallback and alert emails cannot be sent without it' },
  { name: 'MICROSOFT_CLIENT_ID', why: 'the fallback and alert emails cannot be sent without it' },
  { name: 'MICROSOFT_CLIENT_SECRET', why: 'the fallback and alert emails cannot be sent without it' },
  { name: 'MICROSOFT_USER_EMAIL', why: 'the fallback and alert emails have no sender without it' }
])

/** Two settings that only work as a pair. One without the other breaks every form. */
const TURNSTILE_PAIR = Object.freeze(['TURNSTILE_SECRET_KEY', 'NEXT_PUBLIC_TURNSTILE_SITE_KEY'])

/**
 * @param {Record<string, string | undefined>} env
 * @param {string} name
 */
function isSet(env, name) {
  const value = env[name]
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * The names of the required settings that are missing. Names only, never values.
 * @param {Record<string, string | undefined>} [env]
 * @returns {string[]}
 */
function missingRequiredEnv(env = process.env) {
  return REQUIRED_IN_PRODUCTION.filter((setting) => !isSet(env, setting.name)).map((setting) => setting.name)
}

/**
 * True when exactly one of the Turnstile pair is set.
 * @param {Record<string, string | undefined>} [env]
 */
function isTurnstilePairBroken(env = process.env) {
  const present = TURNSTILE_PAIR.filter((name) => isSet(env, name))
  return present.length === 1
}

/**
 * @param {string[]} missing
 */
function describeMissing(missing) {
  return missing
    .map((name) => {
      const setting = REQUIRED_IN_PRODUCTION.find((entry) => entry.name === name)
      return `  - ${name}: ${setting ? setting.why : 'required'}`
    })
    .join('\n')
}

/**
 * Called from next.config.js. Throws on a production build with a setting
 * missing, warns on a preview, and is silent everywhere else.
 *
 * @param {Record<string, string | undefined>} [env]
 * @param {{ warn?: (message: string) => void }} [options]
 * @returns {{ checked: 'production' | 'preview' | 'skipped', missing: string[] }}
 */
function assertRequiredEnv(env = process.env, options = {}) {
  const warn = options.warn ?? ((message) => console.warn(message))
  const target = env.VERCEL_ENV

  if (target !== 'production' && target !== 'preview') {
    return { checked: 'skipped', missing: [] }
  }

  const missing = missingRequiredEnv(env)
  const pairBroken = isTurnstilePairBroken(env)

  if (missing.length === 0 && !pairBroken) {
    return { checked: target, missing }
  }

  const lines = [
    `Required settings are missing from the ${target} environment:`,
    describeMissing(missing),
    ...(pairBroken
      ? ['  TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY must be set together: with only one, every form is refused.']
      : []),
    'Add them in Vercel (Project, Settings, Environment Variables) and deploy again.'
  ].filter(Boolean)

  if (target === 'production') {
    throw new Error(`[required-env] The production build was stopped.\n${lines.join('\n')}`)
  }

  warn(`[required-env] ${lines.join('\n')}\nThis is a preview, so the build carries on.`)
  return { checked: target, missing }
}

module.exports = {
  REQUIRED_IN_PRODUCTION,
  TURNSTILE_PAIR,
  missingRequiredEnv,
  isTurnstilePairBroken,
  assertRequiredEnv
}
