// tests/unit/HeroWrapper.smart.test.tsx
import React from 'react'

// We test the wiring logic, not full rendering (HeroWrapper is a server component).
// Verify the opt-in conditions by reading the source code patterns.
import fs from 'fs'
import path from 'path'

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('HeroWrapper smart hero integration', () => {
  const source = readSource('components/hero/HeroWrapper.tsx')

  it('should have enableSmartCtas prop defaulting to false', () => {
    expect(source).toMatch(/enableSmartCtas\s*=\s*false/)
  })

  it('should keep showContextStrip as a deprecated compatibility prop', () => {
    expect(source).toMatch(/showContextStrip\?: boolean/)
    expect(source).toMatch(/Deprecated compatibility prop/)
  })

  it('should check all three CTA override props before enabling smart CTAs', () => {
    // Must check primaryCta, secondaryCta, AND cta
    expect(source).toMatch(/primaryCta/)
    expect(source).toMatch(/secondaryCta/)
    expect(source).toMatch(/hasAnyCTAOverride/)
    expect(source).toMatch(/cta\b/)
  })

  it('should only render SmartCTAs when enableSmartCtas is true AND no overrides', () => {
    expect(source).toMatch(/shouldUseSmartCtas\s*=\s*enableSmartCtas\s*&&\s*!hasAnyCTAOverride/)
  })

  it('should not render ContextStrip via bottomSlot', () => {
    expect(source).toMatch(/bottomSlot=\{undefined\}/)
    expect(source).not.toMatch(/<ContextStrip/)
  })

  it('should import SmartCTAs only', () => {
    expect(source).toMatch(/import.*SmartCTAs.*from/)
    expect(source).not.toMatch(/import.*ContextStrip.*from/)
  })
})

describe('HeroSectionServer bottomSlot integration', () => {
  const source = readSource('components/hero/HeroSectionServer.tsx')

  it('should have bottomSlot prop', () => {
    expect(source).toMatch(/bottomSlot\??\s*:\s*ReactNode/)
  })

  it('should render bottomSlot inside the z-10 container', () => {
    expect(source).toMatch(/\{bottomSlot\}/)
  })

  it('should add extra bottom padding when bottomSlot present', () => {
    expect(source).toMatch(/bottomSlot\s*&&\s*'pb-14/)
  })
})
