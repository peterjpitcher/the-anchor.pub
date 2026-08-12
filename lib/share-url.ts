import { nowInLondonComponents } from '@/lib/time-london'

const WEBSITE_ORIGIN = 'https://www.the-anchor.pub'

function londonDateKey(now: number): string {
  const { year, month, day } = nowInLondonComponents(new Date(now))
  return [
    year.toString().padStart(4, '0'),
    month.toString().padStart(2, '0'),
    day.toString().padStart(2, '0')
  ].join('-')
}

/** Gives social crawlers a fresh URL when proximity copy changes each day. */
export function withDailyShareMarker(url: string, now: number = Date.now()): string {
  const isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(url)
  const parsed = new URL(url, WEBSITE_ORIGIN)
  parsed.searchParams.set('share', londonDateKey(now))

  if (isAbsolute) return parsed.toString()
  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}
