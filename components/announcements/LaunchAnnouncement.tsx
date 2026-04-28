import {
  WALK_IN_LAUNCH_BANNER_ENDS_AT_MS,
  WALK_IN_LAUNCH_STARTS_AT_MS,
} from '@/lib/constants'
import { LaunchAnnouncementClient } from './LaunchAnnouncementClient'

export type LaunchAnnouncementVariant = 'hero' | 'banner' | 'slim'

export interface LaunchAnnouncementProps {
  variant: LaunchAnnouncementVariant
}

const PRE_LAUNCH_COPY =
  'Sunday lunch walk-ins start 17 May 2026, 1pm-6pm. Until then, our kitchen is open on Sundays with our weekday menu.'
const LAUNCH_DAY_COPY =
  'Walk-ins welcome today from 1pm — turn up between 1pm-6pm or book ahead'

function pickCopy(now: number): string | null {
  if (now >= WALK_IN_LAUNCH_BANNER_ENDS_AT_MS) return null
  if (now < WALK_IN_LAUNCH_STARTS_AT_MS) return PRE_LAUNCH_COPY
  return LAUNCH_DAY_COPY
}

const VARIANT_CLASSES: Record<LaunchAnnouncementVariant, string> = {
  hero: 'mt-4 rounded-lg bg-anchor-gold/15 px-6 py-3 text-base font-semibold text-anchor-gold-vivid',
  banner: 'rounded-md bg-anchor-gold/10 px-4 py-2 text-sm text-anchor-cream-text',
  slim: 'border-t border-anchor-gold/20 px-3 py-1.5 text-xs text-anchor-cream-text/80',
}

/**
 * Cache-aware launch announcement banner. Renders one of two visible states
 * (pre-launch / launch-day) or nothing at all once the launch banner window
 * has ended at 18:00 BST on 17 May 2026.
 *
 * Server-rendered initial copy + a small client child that re-checks every
 * 60s so cached pages flip / hide without a hard reload.
 *
 * See spec sections 7.6 and 8.5.
 */
export function LaunchAnnouncement({ variant }: LaunchAnnouncementProps) {
  const initialCopy = pickCopy(Date.now())
  return (
    <LaunchAnnouncementClient
      variant={variant}
      initialCopy={initialCopy}
      className={VARIANT_CLASSES[variant]}
      preLaunchCopy={PRE_LAUNCH_COPY}
      launchDayCopy={LAUNCH_DAY_COPY}
      startsAtMs={WALK_IN_LAUNCH_STARTS_AT_MS}
      endsAtMs={WALK_IN_LAUNCH_BANNER_ENDS_AT_MS}
    />
  )
}
