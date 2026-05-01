import {
  WALK_IN_LAUNCH_BANNER_ENDS_AT_MS,
  WALK_IN_LAUNCH_STARTS_AT_MS,
} from '@/lib/constants'
import { getSundayRoastContent } from '@/lib/sunday-roast'
import { LaunchAnnouncementClient } from './LaunchAnnouncementClient'

export type LaunchAnnouncementVariant = 'hero' | 'banner' | 'slim'

export interface LaunchAnnouncementProps {
  variant: LaunchAnnouncementVariant
}

const PRE_LAUNCH_COPY = getSundayRoastContent(new Date(0)).availabilityLong
const LAUNCH_DAY_COPY =
  'Walk-ins welcome today from 1pm — turn up between 1pm-6pm or book ahead'

const VARIANT_CLASSES: Record<LaunchAnnouncementVariant, string> = {
  hero: 'mt-4 rounded-lg bg-anchor-gold/15 px-6 py-3 text-base font-semibold text-anchor-gold-vivid text-center',
  banner: 'rounded-md bg-anchor-gold/10 px-4 py-2 text-sm text-anchor-cream-text text-center',
  slim: 'border-t border-anchor-gold/20 px-3 py-1.5 text-xs text-anchor-cream-text/80 text-center',
}

/**
 * Cache-aware launch announcement banner. Renders one of two visible states
 * (pre-launch / launch-day) or nothing at all once the launch banner window
 * has ended at 18:00 BST on 17 May 2026.
 *
 * Server-render is intentionally idempotent: it does NOT call `Date.now()` so
 * the parent route (e.g. `/sunday-lunch` with `revalidate = 3600`) stays ISR
 * cacheable. The client child computes the real state on mount and re-checks
 * every 60s, so cached pages still flip / hide without a hard reload.
 *
 * See spec sections 7.6 and 8.5; recommendations doc tier-1 task 5.
 */
export function LaunchAnnouncement({ variant }: LaunchAnnouncementProps) {
  return (
    <LaunchAnnouncementClient
      variant={variant}
      initialCopy={null}
      className={VARIANT_CLASSES[variant]}
      preLaunchCopy={variant === 'slim' ? null : PRE_LAUNCH_COPY}
      launchDayCopy={LAUNCH_DAY_COPY}
      startsAtMs={WALK_IN_LAUNCH_STARTS_AT_MS}
      endsAtMs={WALK_IN_LAUNCH_BANNER_ENDS_AT_MS}
    />
  )
}
