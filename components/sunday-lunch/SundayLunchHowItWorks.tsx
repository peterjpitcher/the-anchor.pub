'use client'

import { useEffect, useState } from 'react'
import { WALK_IN_LAUNCH_STARTS_AT_MS } from '@/lib/constants'

const PRE_LAUNCH_BODY =
  'From 17 May 2026, walk-ins are welcome on Sundays 1pm–6pm — no pre-order needed. Until then, our kitchen is open on Sundays with our weekday menu.'
const POST_LAUNCH_BODY =
  'Walk-ins welcome on Sundays 1pm–6pm. Booking is still recommended for groups of six or more.'

function pickBody(now: number): string {
  return now < WALK_IN_LAUNCH_STARTS_AT_MS ? PRE_LAUNCH_BODY : POST_LAUNCH_BODY
}

/**
 * Date-aware introductory paragraph for the /sunday-lunch "How Sundays work"
 * section. Server-rendered at build/revalidate time and re-checked on the
 * client every 60s so cached pages flip on 17 May 2026 without a hard reload.
 *
 * Mirrors the cache-aware pattern used by <LaunchAnnouncement>. See spec
 * §8.6 (date-aware body copy convention).
 */
export function SundayLunchHowItWorks() {
  const [body, setBody] = useState<string>(() => pickBody(Date.now()))

  useEffect(() => {
    function recompute() {
      setBody(pickBody(Date.now()))
    }

    recompute()
    const id = setInterval(recompute, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <p className="text-anchor-cream-text/80 text-lg leading-relaxed">
      {body}
    </p>
  )
}
