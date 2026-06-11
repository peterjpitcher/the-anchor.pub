'use client'

import { useEffect, useState } from 'react'
import { getSundayRoastContent } from '@/lib/sunday-roast'

function pickBody(now: number): string {
  return getSundayRoastContent(new Date(now)).availabilityLong
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
    <p className="text-ink-muted text-lg leading-relaxed">
      {body}
    </p>
  )
}
