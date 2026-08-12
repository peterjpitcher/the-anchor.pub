import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SectionHeadingProps {
  /** Small uppercase label above the title (Outfit 600, accent colour). */
  kicker?: ReactNode
  /** Optional handwritten line above the title (Clicker Script, accent colour). */
  script?: ReactNode
  /** The heading itself (DM Serif Display). */
  title: ReactNode
  /** Supporting paragraph below the title (Outfit, muted, max 56ch). */
  lead?: ReactNode
  /** `'right'` is a deprecated legacy value and renders left-aligned. */
  align?: 'left' | 'center' | 'right'
  className?: string

  // --- Deprecated aliases from the old SectionHeader API (kept for migration) ---
  /** @deprecated use `kicker` */
  eyebrow?: ReactNode
  /** @deprecated folds into `lead` (use `script` for a warm handwritten aside) */
  subtitle?: ReactNode
  /** @deprecated use `lead` */
  description?: ReactNode
}

/**
 * Canonical section heading (redesign spec §4.5). Replaces the old
 * `components/SectionHeader`. Render order: kicker, script, title, lead.
 *
 * Backward aliases: `eyebrow → kicker`, `description → lead`. The old
 * `subtitle` folds into `lead` by default (it was used as a supporting line,
 * not a warm aside); pages that want the handwritten treatment should pass
 * `script` explicitly. The legacy `align="right"` is mapped to `left`.
 */
export function SectionHeading({
  kicker,
  script,
  title,
  lead,
  align = 'center',
  className,
  eyebrow,
  subtitle,
  description,
}: SectionHeadingProps) {
  const resolvedKicker = kicker ?? eyebrow
  // subtitle and description both historically rendered as supporting copy.
  // Prefer the explicit `lead`; otherwise fold subtitle/description into it.
  const resolvedLead = lead ?? subtitle ?? description
  // If both subtitle and description were supplied, keep the second line.
  const secondaryLead = lead ? undefined : subtitle && description ? description : undefined

  const isCentre = align === 'center'
  const constrain = isCentre ? 'mx-auto' : ''

  return (
    <div className={cn('flex flex-col gap-3 mb-12', isCentre ? 'items-center text-center' : 'items-start text-left', className)}>
      {resolvedKicker && (
        <p className="font-sans font-semibold text-xs uppercase tracking-[0.18em] text-accent-text">
          {resolvedKicker}
        </p>
      )}

      {script && (
        <p className="font-script text-script leading-none text-accent-text">{script}</p>
      )}

      <h2 className="font-display text-h2 text-ink-strong">{title}</h2>

      {resolvedLead && (
        <p className={cn('font-sans text-xl leading-relaxed text-ink-muted', constrain)}>
          {resolvedLead}
        </p>
      )}

      {secondaryLead && (
        <p className={cn('font-sans text-base text-ink-muted', constrain)}>{secondaryLead}</p>
      )}
    </div>
  )
}
