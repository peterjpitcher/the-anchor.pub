/** The feed resolves this stable slug within the API key's tournament scope. */
export const NATIONS_CHAMPIONSHIP_SLUG = 'nations-championship-2026'
export const NATIONS_CHAMPIONSHIP_PATH = '/live-sport/nations-championship'

/**
 * When the tournament is promoted on the site, as London dates: from 5 September
 * 2026 through Finals Weekend (owner request). The header link and the strip on
 * every page that carries it (the homepage, /whats-on, /live-sport, /staines-pub and
 * /live-sport/six-nations) all read this, so there is one end date to change.
 */
export const NATIONS_CHAMPIONSHIP_PROMO_WINDOW = {
  startsOn: '2026-09-05',
  endsOn: '2026-11-29',
  leadDays: 0
} as const
