import type { ReactNode } from 'react'

// CtaBand (spec §5.7): the closing green band on nearly every page. A dark-green,
// centred column — H2 + optional copy + an actions row.
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
    <section className={`theme-dark bg-anchor-green py-section-y${className ? ` ${className}` : ''}`}>
      <div className="container">
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-5 text-center">
          <h2 className="text-h2 text-anchor-cream-text">{title}</h2>
          {copy ? (
            <p className="max-w-[50ch] text-lg text-anchor-cream-text/85">{copy}</p>
          ) : null}
          {actions ? (
            <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
