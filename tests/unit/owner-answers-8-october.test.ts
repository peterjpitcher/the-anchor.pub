/**
 * The owner's answers of 8 October 2026 that are wording, not behaviour.
 * Each test pins one answer so a later edit cannot quietly put the old
 * wording back. Notes: tasks/changes/2026-10-08-owner-answers.md.
 */

import fs from 'fs'
import path from 'path'

const read = (file: string): string => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

/** Source with its comments taken out, so a comment explaining a rule cannot trip it. */
const code = (file: string): string =>
  read(file)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

describe('/private-hire/near/great-fosters-egham is about a hotel, not a register office', () => {
  const WEDDING_WORDING = /regist|ceremon|reception|wedding|brunch|bride|groom|vows/i

  it('holds only the name, the address and wording the SSOT supports', async () => {
    const { landmarks } = await import('@/lib/local-seo-data')
    const entry = landmarks.find((l) => l.slug === 'great-fosters-egham')

    expect(entry).toBeDefined()
    expect(entry).toEqual({
      slug: 'great-fosters-egham',
      name: 'Great Fosters',
      type: 'other',
      address: 'Stroude Road, Egham TW20 9UR',
      description: expect.any(String),
    })
    // No drive time: "12 mins drive" was in no source, so there is none.
    expect(entry?.distance).toBeUndefined()
    expect(JSON.stringify(entry)).not.toMatch(/\d+\s*(?:min|mile|km)/i)
    expect(JSON.stringify(entry)).not.toMatch(WEDDING_WORDING)
  })

  it('has metadata that says "near", with no figure, no "undefined" and no ceremony', async () => {
    const { generateMetadata } = await import('@/app/private-hire/near/[slug]/page')
    const metadata = JSON.stringify(await generateMetadata({ params: { slug: 'great-fosters-egham' } }))

    expect(metadata).toContain('Private Hire Venue near Great Fosters.')
    expect(metadata).not.toContain('undefined')
    expect(metadata).not.toMatch(/\d+\s*mins?/i)
    expect(metadata).not.toMatch(WEDDING_WORDING)
  })

  it('leaves no register office type or template for a later entry to pick up', () => {
    expect(read('lib/local-seo-data.ts')).not.toMatch(/type:\s*'registry_office'|\|\s*'registry_office'/)
    const nearPage = code('app/private-hire/near/[slug]/page.tsx')
    expect(nearPage).not.toContain('registry_office')
    expect(nearPage).not.toMatch(/post-ceremony|after your ceremony|renewal celebrations|family receptions/i)
    expect(code('app/private-hire/page.tsx')).not.toContain('registry_office')
  })

  // Since 8 October 2026 a landmark has a drive time only where docs/SSOT.md
  // gives one (tests/one-home-for-facts-guard.test.ts), so most have none, of
  // every type. What matters here is that no page prints a blank one.
  it('prints no blank drive time for any entry that has none', async () => {
    const { landmarks } = await import('@/lib/local-seo-data')
    const { generateMetadata } = await import('@/app/private-hire/near/[slug]/page')
    const without = landmarks.filter((l) => !l.distance)

    expect(without.map((l) => l.slug)).toContain('great-fosters-egham')
    expect(new Set(without.map((l) => l.type)).size).toBeGreaterThan(1)
    for (const entry of without) {
      const metadata = JSON.stringify(await generateMetadata({ params: { slug: entry.slug } }))
      expect(`${entry.slug}: ${metadata}`).not.toContain('undefined')
      expect(`${entry.slug}: ${metadata}`).not.toMatch(/\d+\s*mins?/i)
    }
  })

  it('finds the copied register office wording on no other near entry', async () => {
    const { landmarks } = await import('@/lib/local-seo-data')
    for (const entry of landmarks) {
      expect(`${entry.slug}: ${entry.description}`).not.toMatch(/regist|wedding|brunch|day-after/i)
    }
  })
})

describe('the World Cup sweepstake page names nobody', () => {
  const PAGE = 'app/live-sport/world-cup/sweepstake/page.tsx'
  const SHEET_PDF = '/downloads/the-anchor-world-cup-sweep-draw-results.pdf'
  const SHEET_IMAGE = '/images/events/world-cup/world-cup-sweep-draw-results.png'

  // What a name looked like in the old data: a `customer` field, and sentences
  // of the form "<Name> won £50 with <team>". The names themselves are not
  // written here, or this file would be the one still holding them.
  it('has no customer field and no "<someone> won" sentence in its source', () => {
    const page = read(PAGE)

    expect(page).not.toMatch(/customer/i)
    expect(page).not.toMatch(/\b[A-Z][a-z]+(?: [A-Z][a-z]*)? won\b/)
    expect(page).not.toMatch(/winners are [A-Z]/)
  })

  it('lists each prize by its team only, in data whose every value is a prize, an amount, a team or the goal', () => {
    const page = read(PAGE)
    const dataBlock = page.slice(page.indexOf('const MAIN_PRIZES'), page.indexOf('const PRIZE_COUNT'))
    const keys = [...dataBlock.matchAll(/\b([a-z]+):/g)].map((m) => m[1])

    expect([...new Set(keys)].sort()).toEqual(['amount', 'detail', 'prize', 'team'])
    expect(dataBlock).toContain("team: 'Spain'")
  })

  it('sends no result sheet to Google or to a share card', async () => {
    const { metadata } = await import('@/app/live-sport/world-cup/sweepstake/page')
    const serialised = JSON.stringify(metadata)

    expect(serialised).not.toContain('sweep-draw-results')
    expect(serialised).not.toMatch(/customer|winner/i)
    expect(read(PAGE)).not.toContain('sweep-draw-results')
    // Still out of search.
    expect(metadata.robots).toEqual({ index: false, follow: true })
  })

  it('has deleted the result sheet, which listed every entrant by name, and redirects its two addresses', async () => {
    for (const file of [SHEET_PDF, SHEET_IMAGE]) {
      expect(fs.existsSync(path.join(process.cwd(), 'public', file))).toBe(false)
    }

    const { NextRequest } = await import('next/server')
    const { middleware } = await import('@/middleware')
    for (const file of [SHEET_PDF, SHEET_IMAGE]) {
      for (const host of ['www.the-anchor.pub', 'the-anchor.pub']) {
        const response = middleware(
          new NextRequest(`https://${host}${file}`, { headers: { host, 'x-forwarded-proto': 'https' } })
        )
        expect(response.status).toBe(301)
        expect(response.headers.get('location')).toBe('https://www.the-anchor.pub/live-sport/world-cup/sweepstake')
      }
    }
    // The destination is the page itself, which still exists.
    expect(fs.existsSync(path.join(process.cwd(), PAGE))).toBe(true)
  })
})

describe('garden parties: "Receptions" is not on the "Perfect for" list', () => {
  // On its own the word reads as wedding receptions, which the pub takes on
  // enquiry but does not market (docs/SSOT.md section 14).
  it('names birthdays, team socials and christenings, and no reception or wedding', () => {
    const page = code('app/summer-garden-parties/page.tsx')

    for (const occasion of ['Birthdays', 'Team Socials', 'Christenings']) {
      expect(page).toContain(`>${occasion}<`)
    }
    expect(page).not.toMatch(/reception/i)
    expect(page).not.toMatch(/wedding/i)
  })
})
