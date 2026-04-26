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

  it('should have showContextStrip prop defaulting to false', () => {
    expect(source).toMatch(/showContextStrip\s*=\s*false/)
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

  it('should render ContextStrip via bottomSlot when showContextStrip is true', () => {
    expect(source).toMatch(/bottomSlot=\{showContextStrip/)
    expect(source).toMatch(/<ContextStrip/)
  })

  it('should import SmartCTAs and ContextStrip', () => {
    expect(source).toMatch(/import.*SmartCTAs.*from/)
    expect(source).toMatch(/import.*ContextStrip.*from/)
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

describe('No existing pages affected', () => {
  it('should not have enableSmartCtas or showContextStrip on any page file', () => {
    const appDir = path.join(process.cwd(), 'app')
    const pageFiles = findPageFiles(appDir)

    for (const file of pageFiles) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content).not.toMatch(/enableSmartCtas/)
      expect(content).not.toMatch(/showContextStrip/)
    }
  })
})

function findPageFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findPageFiles(fullPath))
    } else if (entry.name === 'page.tsx') {
      results.push(fullPath)
    }
  }
  return results
}
