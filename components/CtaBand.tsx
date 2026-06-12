import type { ReactNode } from 'react'

// CtaBand (spec §5.7, lightened per owner direction): the closing CTA band on
// nearly every page. A light (warm sunk) centred column — H2 + optional copy +
// an actions row. Footer stays dark; this band is light.
//
// API: pass the heading via `title` and optional supporting `copy`. Provide the
// actions in ONE of two ways:
//   1. `primary` / `secondary` ReactNode props (preferred for the common
//      "one primary lg + one outline lg" pattern), or
//   2. `children` — full control over the actions row when you need something
//      other than the standard two-button layout.
// If `children` is supplied it wins and `primary`/`secondary` are ignored.

export interface CtaBandProps {
  /** Section heading (DM Serif, text-h2, cream). */
  title: string
  /** Optional supporting line (text-lg, cream/85, max 50ch). */
  copy?: string
  /** Primary action node, e.g. a `<Button variant="primary" size="lg">`. */
  primary?: ReactNode
  /** Secondary action node, e.g. a `<Button variant="outline" size="lg">`. */
  secondary?: ReactNode
  /** Custom actions row. Overrides `primary`/`secondary` when present. */
  children?: ReactNode
  className?: string
}

export function CtaBand({ title, copy, primary, secondary, children, className }: CtaBandProps) {
  const actions = children ?? (
    <>
      {primary}
      {secondary}
    </>
  )

  return (
    <section className={`bg-surface-sunk border-t border-line py-section-y${className ? ` ${className}` : ''}`}>
      <div className="container">
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-5 text-center">
          <h2 className="font-display text-h2 text-ink-strong">{title}</h2>
          {copy ? (
            <p className="max-w-[50ch] text-lg text-ink-muted">{copy}</p>
          ) : null}
          {actions ? (
            <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
