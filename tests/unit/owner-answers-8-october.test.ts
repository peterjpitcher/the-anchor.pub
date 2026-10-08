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

  it('only lets an `other` entry go without a drive time, so no page prints a blank one', async () => {
    const { landmarks } = await import('@/lib/local-seo-data')
    const without = landmarks.filter((l) => !l.distance)

    expect(without.map((l) => l.slug)).toEqual(['great-fosters-egham'])
    expect(without.every((l) => l.type === 'other')).toBe(true)
  })

  it('finds the copied register office wording on no other near entry', async () => {
    const { landmarks } = await import('@/lib/local-seo-data')
    for (const entry of landmarks) {
      expect(`${entry.slug}: ${entry.description}`).not.toMatch(/regist|wedding|brunch|day-after/i)
    }
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
