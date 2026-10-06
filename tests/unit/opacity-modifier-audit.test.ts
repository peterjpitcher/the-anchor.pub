// eslint-disable-next-line @typescript-eslint/no-var-requires
const opacityAudit = require('../../scripts/audit-opacity-modifiers.js')

/**
 * A colour class with an opacity modifier is only a string until Tailwind
 * compiles it, and Tailwind drops one it cannot apply without a warning. On
 * 5 October 2026 that had left 60 uses of 23 classes dead, among them the
 * inactive dots of the reviews carousel and the tint of every error and
 * success box.
 *
 * scripts/audit-opacity-modifiers.js compiles the classes the source really
 * uses. This runs it in CI; `npm run lint` runs it at the terminal.
 */
type DeadClass = { className: string; files: string[] }

describe('opacity modifiers on colour classes', () => {
  const config = opacityAudit.loadTailwindConfig()

  it('compiles every colour class with an opacity modifier that the source uses', async () => {
    const result = (await opacityAudit.audit()) as { checked: number; dead: DeadClass[] }

    // An empty scan would pass for the wrong reason.
    expect(result.checked).toBeGreaterThan(20)
    expect(result.dead).toEqual([])
  })

  it('puts the alpha on a variable-backed token with color-mix', async () => {
    const css: string = await opacityAudit.compile(config, ['bg-ink-muted/30', 'border-anchor-danger/[0.08]', 'text-ink-strong/50'])

    expect(css).toContain('background-color: color-mix(in srgb, var(--text-muted) 30%, transparent)')
    expect(css).toContain('border-color: color-mix(in srgb, var(--status-danger) 8%, transparent)')
    expect(css).toContain('color: color-mix(in srgb, var(--text-strong) 50%, transparent)')
  })

  it('leaves a class with no modifier on the bare variable, so it needs no color-mix support', async () => {
    const css: string = await opacityAudit.compile(config, [
      'bg-surface',
      'text-ink-muted',
      'border-line',
      'ring-accent-text',
      'ring-offset-surface',
      'divide-line',
      'from-surface',
    ])

    expect(css).toContain('background-color: var(--surface)')
    expect(css).toContain('color: var(--text-muted)')
    expect(css).toContain('border-color: var(--border)')
    expect(css).toContain('--tw-ring-color: var(--accent-text)')
    expect(css).toContain('--tw-ring-offset-color: var(--surface)')
    expect(css).not.toContain('color-mix')
  })

  it('reports a modifier on a colour Tailwind cannot parse', async () => {
    // The defect itself: a token defined as a bare variable.
    const broken = { ...config, theme: { extend: { colors: { probe: 'var(--probe)' } } } }

    expect(await opacityAudit.deadClasses(broken, ['bg-probe', 'bg-probe/30'])).toEqual(['bg-probe/30'])
  })

  it('reports a modifier that is not a step on the opacity scale', async () => {
    expect(await opacityAudit.deadClasses(config, ['bg-black/40', 'bg-black/33'])).toEqual(['bg-black/33'])
  })
})
