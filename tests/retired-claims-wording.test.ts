export {}

import { readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

// Two claims the owner retired on 10 September 2026 (docs/SSOT.md sections 2,
// 11, 14 and 16), both of which had spread across pages, blog posts and shared
// components before anyone noticed:
//
// 1. A ULEZ saving figure. "Save £12.50 a day" reached eight pages (two of them
//    through a shared value strip), six blog posts and /llms.txt. Whether a driver pays the charge
//    depends on their vehicle and their route, so no figure is true for everyone.
//    We say we're outside the ULEZ zone, and stop.
//
// 2. The private-hire deposit "deducted from the final bill". The £250 is a
//    booking and damage deposit, held separately and refunded after the event;
//    the signed contract says so. A private hire also never pays the £10 per
//    person group deposit on top: the £250 replaces it.

const ROOT = join(__dirname, '..')

function customerFacingFiles(): string[] {
  const out = execSync(
    "git ls-files 'app/**/*.tsx' 'app/**/*.ts' 'components/**/*.tsx' 'components/**/*.ts' 'lib/**/*.ts' 'content/blog/**/*.md' 'public/llms.txt'",
    { cwd: ROOT, encoding: 'utf8' }
  )
  return out.split('\n').map(f => f.trim()).filter(Boolean)
}

/**
 * The file's lines as a reader would see the words: code comments dropped (a note
 * to developers is not copy) and the pound sign decoded however the source writes it.
 */
function copyLines(file: string): string[] {
  let contents: string
  try {
    contents = readFileSync(join(ROOT, file), 'utf8')
  } catch {
    return []
  }
  const isCode = /\.tsx?$/.test(file)
  return contents
    .split('\n')
    .map(line => (isCode && /^\s*(?:\/\/|\/\*|\*)/.test(line) ? '' : line))
    .map(line => line.replace(/&pound;|\\u00a3/gi, '£').replace(/&apos;/g, "'"))
}

/**
 * One string per file. Code joins its lines, because JSX copy wraps across them;
 * Markdown and text keep them, because each list item or heading is its own piece.
 */
function flatten(file: string): string {
  const lines = copyLines(file)
  return /\.tsx?$/.test(file) ? lines.join(' ').replace(/\s+/g, ' ') : lines.join('\n').replace(/[ \t]+/g, ' ')
}

/** Pieces of copy: split at sentence ends, line ends, and tag edges, since two spans are two pieces. */
const pieces = (text: string): string[] => text.split(/(?<=[.!?]["']?)\s+|[<>\n]/)

describe('retired claims stay retired', () => {
  it('never quotes a ULEZ saving figure', () => {
    const offenders: string[] = []
    for (const file of customerFacingFiles()) {
      const text = flatten(file)
      // Any pound figure in the same piece of copy as the ULEZ.
      for (const piece of pieces(text)) {
        if (/ULEZ/i.test(piece) && /£\s?\d/.test(piece)) offenders.push(`${file}: "${piece.trim().slice(0, 120)}"`)
      }
      // The retired figure itself anywhere near a ULEZ mention, even split across a heading and its text.
      for (const match of text.matchAll(/ULEZ/gi)) {
        const at = match.index ?? 0
        const around = text.slice(Math.max(0, at - 150), at + 150)
        if (/12\.50/.test(around)) offenders.push(`${file}: 12.50 within 150 characters of "ULEZ"`)
      }
    }
    expect([...new Set(offenders)]).toEqual([])
  })

  it('never says the £250 private-hire deposit comes off the bill', () => {
    const offenders: string[] = []
    for (const file of customerFacingFiles()) {
      const text = flatten(file)
      for (const match of text.matchAll(/£\s?250\b/g)) {
        const at = match.index ?? 0
        const following = text.slice(at, at + 160)
        if (/deducted|deduct from|comes? (?:straight )?off|off (?:your|the) (?:final )?bill|towards (?:your|the) (?:final )?bill/i.test(following)) {
          offenders.push(`${file}: "${following.slice(0, 120)}"`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('never offers the £10 per person group deposit on a private-hire page', () => {
    const offenders: string[] = []
    for (const file of customerFacingFiles().filter(f => f.startsWith('app/private-hire/'))) {
      copyLines(file).forEach((line, i) => {
        if (/£\s?10 ?(?:per (?:person|head)|pp\b)/i.test(line)) offenders.push(`${file}:${i + 1}`)
      })
    }
    expect(offenders).toEqual([])
  })

  it('never lists a pie among the Sunday roasts (retired 11 September 2026)', () => {
    const offenders: string[] = []
    for (const file of customerFacingFiles()) {
      const text = flatten(file)
      for (const piece of pieces(text)) {
        if (/\bpie roasts?\b|\btwo pies\b|roast (?:beef|pork|turkey), (?:and )?pies\b/i.test(piece)) {
          offenders.push(`${file}: "${piece.trim().slice(0, 120)}"`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('keeps the voice the owner confirmed on 11 September 2026, in section 1 and its JSON mirror', () => {
    const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8').replace(/\s+/g, ' ')
    expect(ssot).toContain("**It's about them, not us.**")
    expect(ssot).toContain('2. Is it about them, not us?')

    const json = JSON.parse(readFileSync(join(ROOT, 'SSOT.json'), 'utf8'))
    const voice = json.brand_guidelines.voice
    expect(voice.tone).not.toContain('Cheeky')
    expect(voice.principles[0]).toMatch(/^It's about them, not us/)
    expect(JSON.stringify(voice.principles)).not.toMatch(/Lead with feeling|Cheeky, never snide/)
  })

  it('keeps the emoji rule the owner decided on 12 September 2026', () => {
    const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8').replace(/\s+/g, ' ')
    expect(ssot).toContain('**None on the website, in emails or in texts. One or two at most in a social post.**')

    const json = JSON.parse(readFileSync(join(ROOT, 'SSOT.json'), 'utf8'))
    expect(json.brand_guidelines.voice.emojis).toMatch(/No emojis on the website, in emails or in texts/)
  })

  it('keeps the rules and the approved wording in the SSOT', () => {
    const ssot = readFileSync(join(ROOT, 'docs/SSOT.md'), 'utf8').replace(/\s+/g, ' ')
    expect(ssot).toContain('**A ULEZ saving figure**, in any form')
    expect(ssot).toContain("A £250 booking and damage deposit secures your date. It's held separately from your bill and refunded after the event, less any documented deductions.")
    expect(ssot).toContain('It **replaces** the £10 per person group deposit in §7: a private hire never pays both')
  })
})
