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
