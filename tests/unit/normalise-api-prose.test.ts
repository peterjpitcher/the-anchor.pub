import {
  NORMALISED_PROSE_FIELDS,
  normaliseEventProse,
  normaliseFaqProse,
  normaliseProseField,
  normaliseProseList,
} from '@/lib/text/normalise-api-prose'

/**
 * U+2014 and U+2013 are built from their code points. Typing either literal
 * into this file would trip the write hook that bans em dashes in the repo.
 */
const EM = String.fromCharCode(0x2014)
const EN = String.fromCharCode(0x2013)

describe('normaliseProseField', () => {
  it('replaces a spaced em dash with a comma, the live event page case', () => {
    // Verbatim from the served HTML of the 11 September 2026 music bingo page.
    const input = `plenty of chances to join in ${EM} no music expertise needed`
    expect(normaliseProseField(input)).toBe(
      'plenty of chances to join in, no music expertise needed',
    )
  })

  it('replaces an unspaced em dash with a comma and a space', () => {
    expect(normaliseProseField(`doors at 7pm${EM}bingo starts at 8pm`)).toBe(
      'doors at 7pm, bingo starts at 8pm',
    )
  })

  it('replaces a parenthetical pair with a comma pair', () => {
    expect(normaliseProseField(`Free entry ${EM} no tickets needed ${EM} just turn up`)).toBe(
      'Free entry, no tickets needed, just turn up',
    )
  })

  it('leaves no em dash anywhere in the output', () => {
    const input = `One ${EM} two${EM}three ${EM}${EM} four`
    expect(normaliseProseField(input)).not.toContain(EM)
  })

  it('does not strand a comma before a full stop or a closing bracket', () => {
    expect(normaliseProseField(`Big prizes ${EM}, every round`)).toBe('Big prizes, every round')
    expect(normaliseProseField(`Big prizes ${EM}. Every round`)).toBe('Big prizes. Every round')
    expect(normaliseProseField(`(quiz night ${EM}) is monthly`)).toBe('(quiz night) is monthly')
  })

  it('drops a dash that opens or closes the value, or opens a line', () => {
    expect(normaliseProseField(`${EM} Free entry`)).toBe('Free entry')
    expect(normaliseProseField(`Free entry ${EM}`)).toBe('Free entry')
    expect(normaliseProseField(`Doors 7pm\n${EM} Bingo 8pm`)).toBe('Doors 7pm\nBingo 8pm')
  })

  it('keeps paragraph breaks intact', () => {
    expect(normaliseProseField(`Doors 7pm ${EM} bingo 8pm\n\nBook online.`)).toBe(
      'Doors 7pm, bingo 8pm\n\nBook online.',
    )
  })

  it('leaves an en dash alone, because only the em dash is banned', () => {
    const input = `Open 12pm ${EN} 11pm every Friday`
    expect(normaliseProseField(input)).toBe(input)
  })

  it('leaves a URL untouched', () => {
    const url = `https://www.the-anchor.pub/events/music${EM}bingo-2026-09-11`
    expect(normaliseProseField(url)).toBe(url)
  })

  it('leaves a URL embedded in prose untouched while normalising the prose around it', () => {
    const input = `Book at https://www.the-anchor.pub/events/music${EM}bingo ${EM} no fee`
    expect(normaliseProseField(input)).toBe(
      `Book at https://www.the-anchor.pub/events/music${EM}bingo, no fee`,
    )
  })

  it('leaves a serialised JSON payload untouched', () => {
    const payload = JSON.stringify({
      '@type': 'Event',
      description: `Join us ${EM} big prizes`,
    })
    expect(normaliseProseField(payload)).toBe(payload)
  })

  it('leaves a serialised JSON array untouched', () => {
    const payload = JSON.stringify([`Join us ${EM} big prizes`])
    expect(normaliseProseField(payload)).toBe(payload)
  })

  it('leaves a slug or identifier untouched', () => {
    const slug = `music${EM}bingo-2026-09-11`
    expect(normaliseProseField(slug)).toBe(slug)
    const id = `evt${EM}9f2c4a10`
    expect(normaliseProseField(id)).toBe(id)
  })

  it('leaves an ISO date untouched', () => {
    const iso = `2026-09-11T19:00:00${EM}00:00`
    expect(normaliseProseField(iso)).toBe(iso)
  })

  it('leaves a whole HTML document untouched', () => {
    const doc = `<!doctype html><html><body><p>Join us ${EM} big prizes</p></body></html>`
    expect(normaliseProseField(doc)).toBe(doc)
  })

  it('is safe on empty, null and undefined input', () => {
    expect(normaliseProseField('')).toBe('')
    expect(normaliseProseField('   ')).toBe('   ')
    expect(normaliseProseField(null)).toBeNull()
    expect(normaliseProseField(undefined)).toBeUndefined()
  })

  it('returns prose without an em dash byte for byte', () => {
    const input = 'Music bingo, doors 7pm. Free entry, no tickets needed.'
    expect(normaliseProseField(input)).toBe(input)
  })

  it('survives a closing script tag without breaking escaping', () => {
    // Hostile copy pasted into the management app. The adapter must not decode,
    // re-encode or re-escape anything: it only swaps dash characters in the
    // text between tags, so whatever sanitisation runs downstream sees the same
    // markup it would have seen before.
    const hostile = `Join us ${EM} big prizes</script><script>alert("xss")</script>`
    expect(normaliseProseField(hostile)).toBe(
      'Join us, big prizes</script><script>alert("xss")</script>',
    )
  })

  it('leaves escaped entities and tag attributes alone', () => {
    const input = `<a href="/events/music${EM}bingo" title="Bingo ${EM} 8pm">Book ${EM} it&apos;s free</a>`
    expect(normaliseProseField(input)).toBe(
      `<a href="/events/music${EM}bingo" title="Bingo ${EM} 8pm">Book, it&apos;s free</a>`,
    )
  })
})

describe('normaliseProseList', () => {
  it('normalises every highlight', () => {
    expect(normaliseProseList([`Free entry ${EM} no tickets`, 'Doors 7pm'])).toEqual([
      'Free entry, no tickets',
      'Doors 7pm',
    ])
  })

  it('is safe on null and undefined', () => {
    expect(normaliseProseList(null)).toBeNull()
    expect(normaliseProseList(undefined)).toBeUndefined()
    expect(normaliseProseList([])).toEqual([])
  })
})

describe('normaliseFaqProse', () => {
  it('normalises question and answer text and keeps every other key', () => {
    const faqs = [
      {
        '@type': 'Question' as const,
        name: `Do I need to book ${EM} or can I turn up?`,
        acceptedAnswer: {
          '@type': 'Answer' as const,
          text: `Just turn up ${EM} entry is free`,
        },
      },
    ]

    expect(normaliseFaqProse(faqs)).toEqual([
      {
        '@type': 'Question',
        name: 'Do I need to book, or can I turn up?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Just turn up, entry is free',
        },
      },
    ])
  })

  it('is safe on null and undefined', () => {
    expect(normaliseFaqProse(null)).toBeNull()
    expect(normaliseFaqProse(undefined)).toBeUndefined()
  })
})

describe('normaliseEventProse', () => {
  const event = {
    id: `evt${EM}9f2c4a10`,
    slug: `music${EM}bingo-2026-09-11`,
    url: `https://www.the-anchor.pub/events/music${EM}bingo-2026-09-11`,
    startDate: `2026-09-11T19:00:00${EM}00:00`,
    name: 'Music Bingo',
    description: `Plenty of chances to join in ${EM} no music expertise needed`,
    longDescription: `Doors at 7pm ${EM} bingo starts at 8pm`,
    about: `A high energy night ${EM} close to Heathrow`,
    metaDescription: `Music bingo in Stanwell Moor ${EM} free entry`,
    image_alt_text: `Music bingo night ${EM} The Anchor`,
    highlights: [`Free entry ${EM} no tickets`],
    faq: [
      {
        '@type': 'Question' as const,
        name: `Is it free ${EM} really?`,
        acceptedAnswer: { '@type': 'Answer' as const, text: `Yes ${EM} always` },
      },
    ],
  }

  it('normalises every named prose field', () => {
    const result = normaliseEventProse(event)

    expect(result.description).toBe('Plenty of chances to join in, no music expertise needed')
    expect(result.longDescription).toBe('Doors at 7pm, bingo starts at 8pm')
    expect(result.about).toBe('A high energy night, close to Heathrow')
    expect(result.metaDescription).toBe('Music bingo in Stanwell Moor, free entry')
    expect(result.image_alt_text).toBe('Music bingo night, The Anchor')
    expect(result.highlights).toEqual(['Free entry, no tickets'])
    expect(result.faq[0].name).toBe('Is it free, really?')
    expect(result.faq[0].acceptedAnswer.text).toBe('Yes, always')
  })

  it('leaves identifiers, slugs, URLs and dates exactly as the API sent them', () => {
    const result = normaliseEventProse(event)

    expect(result.id).toBe(event.id)
    expect(result.slug).toBe(event.slug)
    expect(result.url).toBe(event.url)
    expect(result.startDate).toBe(event.startDate)
  })

  it('does not mutate the event it was given', () => {
    const original = { ...event }
    normaliseEventProse(event)
    expect(event).toEqual(original)
    expect(event.description).toContain(EM)
  })

  it('normalises the legacy faqPage shape', () => {
    const result = normaliseEventProse({
      faqPage: {
        '@type': 'FAQPage' as const,
        mainEntity: [
          {
            '@type': 'Question' as const,
            name: `Is it free ${EM} really?`,
            acceptedAnswer: { '@type': 'Answer' as const, text: `Yes ${EM} always` },
          },
        ],
      },
    })

    expect(result.faqPage.mainEntity[0].name).toBe('Is it free, really?')
    expect(result.faqPage.mainEntity[0].acceptedAnswer.text).toBe('Yes, always')
  })

  it('names only prose fields in its allow list', () => {
    expect(NORMALISED_PROSE_FIELDS).not.toContain('id')
    expect(NORMALISED_PROSE_FIELDS).not.toContain('slug')
    expect(NORMALISED_PROSE_FIELDS).not.toContain('url')
    expect(NORMALISED_PROSE_FIELDS).not.toContain('startDate')
    expect(NORMALISED_PROSE_FIELDS).toContain('description')
  })
})
