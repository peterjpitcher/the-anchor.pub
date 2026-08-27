import { stripBrandSuffix } from '@/lib/metadata/strip-brand-suffix'

describe('stripBrandSuffix', () => {
  it('removes a trailing pipe-separated brand', () => {
    expect(stripBrandSuffix('Gavin & Stacey Quiz Night | The Anchor')).toBe(
      'Gavin & Stacey Quiz Night',
    )
  })

  it('removes a trailing "at The Anchor"', () => {
    expect(stripBrandSuffix('Cash Bingo Night at The Anchor')).toBe('Cash Bingo Night')
  })

  it('removes trailing brand with a location qualifier', () => {
    expect(stripBrandSuffix('Event Brochures | The Anchor Stanwell Moor')).toBe('Event Brochures')
    expect(stripBrandSuffix("Karaoke Night at The Anchor Pub")).toBe('Karaoke Night')
  })

  it('lifts a mid-title "at The Anchor" out, including a location qualifier', () => {
    expect(stripBrandSuffix('Bingo Night at The Anchor Stanwell Moor | Cash Prizes Monthly')).toBe(
      'Bingo Night | Cash Prizes Monthly',
    )
  })

  it('leaves clean titles untouched', () => {
    expect(stripBrandSuffix('Halloween Party Near Heathrow, Free Entry')).toBe(
      'Halloween Party Near Heathrow, Free Entry',
    )
  })

  it('never returns an empty title', () => {
    expect(stripBrandSuffix('The Anchor')).toBe('The Anchor')
    expect(stripBrandSuffix('')).toBe('')
    expect(stripBrandSuffix(null)).toBe('')
    expect(stripBrandSuffix(undefined)).toBe('')
  })

  it('is idempotent', () => {
    const once = stripBrandSuffix('Quiz Night | The Anchor')
    expect(stripBrandSuffix(once)).toBe(once)
  })
})

describe('stripBrandSuffix, mid-title "at The Anchor"', () => {
  it('lifts out the prepositional phrase and keeps the rest', () => {
    expect(stripBrandSuffix('A Hint of Halloween Quiz Night at The Anchor | 7 October')).toBe(
      'A Hint of Halloween Quiz Night | 7 October',
    )
    expect(stripBrandSuffix('Quiz Night at The Anchor Stanwell Moor | Pub Pursuit Trivia')).toBe(
      'Quiz Night | Pub Pursuit Trivia',
    )
    expect(stripBrandSuffix('Spectacular Bingo Night at The Anchor - £240 Snowball Finale!')).toBe(
      'Spectacular Bingo Night - £240 Snowball Finale!',
    )
  })

  it('leaves the brand alone when it is the grammatical subject', () => {
    // Removing the noun here would produce broken English. Editorial fix, not a regex one.
    for (const t of [
      'Join The Anchor Cash Bingo Night | Fun & Prizes Await',
      'Dog Friendly Pub Near Heathrow | The Anchor Welcomes Dogs in Stanwell Moor',
      "International Women's Day Pub Near Heathrow | The Anchor Celebrates",
    ]) {
      expect(stripBrandSuffix(t)).toBe(t)
    }
  })

  it('stays idempotent after the infix rule', () => {
    const once = stripBrandSuffix('Karaoke Night at The Anchor | February 2026')
    expect(stripBrandSuffix(once)).toBe(once)
  })
})
