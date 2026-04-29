'use client'

import { useEffect, useRef, useState } from 'react'
import { pushToDataLayer } from '@/lib/gtm-events'
import type { LaunchAnnouncementVariant } from './LaunchAnnouncement'

interface LaunchAnnouncementClientProps {
  variant: LaunchAnnouncementVariant
  initialCopy: string | null
  className: string
  preLaunchCopy: string | null
  launchDayCopy: string
  startsAtMs: number
  endsAtMs: number
}

type BannerState = 'pre_launch' | 'launch_day' | 'hidden'

function resolveBannerState(now: number, startsAtMs: number, endsAtMs: number): BannerState {
  if (now >= endsAtMs) return 'hidden'
  if (now < startsAtMs) return 'pre_launch'
  return 'launch_day'
}

/**
 * Client child for <LaunchAnnouncement>. Re-checks the launch state on mount
 * and every 60 seconds so cached/static pages flip from pre-launch copy →
 * launch-day copy → hidden without requiring a hard reload.
 *
 * Tracking: fires `banner_interaction` (action `view`) on first visible render
 * and on every state transition (pre_launch → launch_day → hidden) so the
 * lifecycle of the walk-in launch banner can be measured in GA4. See spec §7.6
 * + recommendations doc tier-1 task 3.
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
  // Track the last reported state so we only fire `banner_interaction` once
  // on initial render and once per transition, never on every interval tick.
  const lastReportedStateRef = useRef<BannerState | null>(null)

  useEffect(() => {
    function recompute() {
      const now = Date.now()
      const state = resolveBannerState(now, startsAtMs, endsAtMs)
      if (state === 'hidden') {
        setCopy(null)
      } else if (state === 'pre_launch') {
        // preLaunchCopy may be null for variants that are hidden pre-launch
        // (e.g. footer slim per spec §8.7).
        setCopy(preLaunchCopy)
      } else {
        setCopy(launchDayCopy)
      }

      // Only emit a tracking event if the state has changed since the last
      // tick (the first run also counts as a change because lastReported is
      // null). This keeps the dataLayer free of duplicate ticks.
      if (lastReportedStateRef.current !== state) {
        lastReportedStateRef.current = state
        pushToDataLayer({
          event: 'banner_interaction',
          banner_id: 'sunday_walk_in_launch',
          banner_action: 'view',
          banner_campaign: 'walk_in_launch_2026',
          banner_label: state,
        })
      }
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
