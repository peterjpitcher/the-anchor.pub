'use client'

import { useEffect, useState } from 'react'
import type { LaunchAnnouncementVariant } from './LaunchAnnouncement'

interface LaunchAnnouncementClientProps {
  variant: LaunchAnnouncementVariant
  initialCopy: string | null
  className: string
  preLaunchCopy: string
  launchDayCopy: string
  startsAtMs: number
  endsAtMs: number
}

/**
 * Client child for <LaunchAnnouncement>. Re-checks the launch state on mount
 * and every 60 seconds so cached/static pages flip from pre-launch copy →
 * launch-day copy → hidden without requiring a hard reload.
 */
export function LaunchAnnouncementClient({
  initialCopy,
  className,
  preLaunchCopy,
  launchDayCopy,
  startsAtMs,
  endsAtMs,
}: LaunchAnnouncementClientProps) {
  const [copy, setCopy] = useState<string | null>(initialCopy)

  useEffect(() => {
    function recompute() {
      const now = Date.now()
      if (now >= endsAtMs) {
        setCopy(null)
        return
      }
      if (now < startsAtMs) {
        setCopy(preLaunchCopy)
        return
      }
      setCopy(launchDayCopy)
    }

    recompute()
    const id = setInterval(recompute, 60_000)
    return () => clearInterval(id)
  }, [startsAtMs, endsAtMs, preLaunchCopy, launchDayCopy])

  if (!copy) return null

  return (
    <div role="status" aria-live="polite" className={className}>
      {copy}
    </div>
  )
}
