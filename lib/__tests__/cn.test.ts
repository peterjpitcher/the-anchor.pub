import { cn } from '../utils'

describe('cn (tailwind-merge with custom font sizes)', () => {
  it('keeps a custom heading size when combined with a colour utility', () => {
    // The custom `text-h2` font size must survive alongside `text-ink-strong`.
    // With a vanilla twMerge config the colour would clobber the size.
    const result = cn('text-h2', 'text-ink-strong')
    expect(result).toContain('text-h2')
    expect(result).toContain('text-ink-strong')
  })

  it('keeps the script size with the accent colour', () => {
    const result = cn('text-script', 'text-accent-text')
    expect(result).toContain('text-script')
    expect(result).toContain('text-accent-text')
  })

  it('still treats two font sizes as a conflict (last wins)', () => {
    expect(cn('text-xl', 'text-h1')).toBe('text-h1')
    expect(cn('text-h3', 'text-h2')).toBe('text-h2')
  })

  it('preserves ordinary tailwind-merge conflict resolution', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })
})
