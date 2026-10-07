export {}

import { readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

import ssotJson from '@/SSOT.json'
import {
  CHRISTMAS_PRIVATE_DEPOSIT_WORDING,
  EVENT_TICKET_REFUND_WORDING,
  GROUP_DEPOSIT_REFUND_WORDING,
  GROUP_DEPOSIT_WORDING,
  PARKING_REFUND_WORDING,
  PRIVATE_HIRE_DEPOSIT_WORDING,
  ROOM_HIRE_WORDING,
} from '@/lib/approved-wording'
import { LARGE_GROUP_DEPOSIT_POLICY_COPY } from '@/lib/constants'

// Money wording, from the 7 October 2026 site review (package P08) and the
// owner's decisions of the same day.
//
// What was live: the wakes page said three times that room hire was included,
// with "no hidden charges", while wakes are charged room hire by the hour. Five
// posts said the room cost nothing extra. The wake guide said a wake took no
// deposit. Book a Table said "Free to cancel" above a form that takes a deposit
// which is only half refunded inside seven days. The parking page promised "a
// full refund" in its FAQ and "minus any card processing fees" in its terms.
// Taxi fares were typed into 14 pages, up to four different prices on one.
//
// This is copy only. Nothing here works out or charges a price.

const ROOT = join(__dirname, '..')
const read = (file: string): string => readFileSync(join(ROOT, file), 'utf8')

function files(globs: string): string[] {
  const out = execSync(`git ls-files ${globs}`, { cwd: ROOT, encoding: 'utf8' })
  return out
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean)
    .filter((f) => !/(?:\.test\.|__tests__\/)/.test(f))
}

/** Words as a reader sees them: code comments dropped, entities decoded. */
function copyLines(file: string): string[] {
  const isCode = /\.tsx?$/.test(file)
  return read(file)
    .split('\n')
    .map((line) => (isCode && /^\s*(?:\/\/|\/\*|\*|\{\/\*)/.test(line) ? '' : line))
    .map((line) => line.replace(/&pound;|\\u00a3/gi, '£').replace(/&apos;|&rsquo;/g, "'"))
}

type Rule = readonly [RegExp, string]

function offendersIn(lines: string[], label: string, rules: ReadonlyArray<Rule>): string[] {
  const found: string[] = []
  lines.forEach((line, i) => {
    for (const [pattern, why] of rules) {
      if (pattern.test(line)) found.push(`${label}:${i + 1} (${why})`)
    }
  })
  return found
}

function scan(globs: string, rules: ReadonlyArray<Rule>): string[] {
  return files(globs).flatMap((file) => offendersIn(copyLines(file), file, rules))
}

describe('money wording matches docs/SSOT.md section 16', () => {
  const ssot = read('docs/SSOT.md')

  it.each([
    ['Group deposit', GROUP_DEPOSIT_WORDING],
    ['Refunds on a group deposit', GROUP_DEPOSIT_REFUND_WORDING],
    ['Refunds on event tickets', EVENT_TICKET_REFUND_WORDING],
    ['Private hire deposit', PRIVATE_HIRE_DEPOSIT_WORDING],
    ['Room hire', ROOM_HIRE_WORDING],
    ['Airport parking refund', PARKING_REFUND_WORDING],
    ['Christmas party of more than 20', CHRISTMAS_PRIVATE_DEPOSIT_WORDING],
  ])('%s', (heading, wording) => {
    expect(ssot).toContain(`### ${heading}\n\n> ${wording}\n`)
  })

  it('states the refund bands of the SSOT section 7 table, and no others', () => {
    expect(ssot).toContain('| Group deposit (15 or more guests) | Refunded in full | Half refunded | Not refunded |')
    expect(ssot).toContain('| Event tickets, when seats are given up | Refunded in full | Half refunded | Not refunded |')
    for (const wording of [GROUP_DEPOSIT_REFUND_WORDING, EVENT_TICKET_REFUND_WORDING]) {
      expect(wording).toMatch(/7 or more days before, your (?:deposit is|tickets are) refunded in full\./)
      expect(wording).toMatch(/3 to 6 days before, half is refunded\./)
      expect(wording).toMatch(/Fewer than 3 days before, (?:it isn't|they aren't) refunded\./)
    }
  })

  it('keeps one group deposit sentence: the booking form copy is the approved one', () => {
    expect(LARGE_GROUP_DEPOSIT_POLICY_COPY).toBe(GROUP_DEPOSIT_WORDING)
  })

  it('SSOT.json carries the parking refund sentence word for word', () => {
    expect(ssotJson.heathrow_parking.cancellation).toBe(PARKING_REFUND_WORDING)
  })

  it('SSOT.json puts a Sunday Christmas sitting on the weekend price', () => {
    expect(ssotJson.christmas_2026.weekday_weekend_definition.weekend).toBe('Friday to Sunday')
    expect(ssot).toContain('Weekend means Friday to Sunday.')
  })
})

describe('parking refunds: one sentence, and never "a full refund"', () => {
  const PARKING_FILES =
    "'app/heathrow-parking/**/*.tsx' 'components/features/ParkingBookingWizard/**/*.tsx' 'content/blog/cheap-heathrow-parking-alternatives/index.md'"

  it('the parking page and the terminal pages render the constant', () => {
    for (const file of ['app/heathrow-parking/page.tsx', 'app/heathrow-parking/[terminal]/page.tsx']) {
      expect(read(file)).toContain('PARKING_REFUND_WORDING')
    }
    // FAQ and terms on the main page.
    expect(read('app/heathrow-parking/page.tsx').split('{PARKING_REFUND_WORDING}').length - 1).toBe(2)
  })

  it('promises no full refund and prints no fee figure', () => {
    const rules: Rule[] = [
      [/full refund/i, 'a parking refund is less the payment fee'],
      [/refund[^.]{0,80}\d+(?:\.\d+)?\s?%|\d+(?:\.\d+)?\s?%[^.]{0,80}(?:fee|refund)/i, 'never publish a fee percentage'],
    ]
    expect(scan(PARKING_FILES, rules)).toEqual([])
    expect(offendersIn(['You can amend or cancel up to 24 hours before arrival for a full refund.'], 'retired', rules)).not.toEqual([])
    expect(offendersIn([PARKING_REFUND_WORDING], 'approved', rules)).toEqual([])
  })

  it('types no parking price on the terminal pages, and no Heathrow price on the parking page', () => {
    expect(read('app/heathrow-parking/[terminal]/page.tsx')).not.toMatch(/£\s?\d/)
    const main = copyLines('app/heathrow-parking/page.tsx').join('\n')
    expect(main).not.toMatch(/46\.80|£8 for 29 minutes|Apple Pay|Google Pay|instant receipts|checked May 2026/)
    // Our own prices on the main page are read from the rate card, never typed.
    expect(main.replace(/£\$\{/g, '')).not.toMatch(/£\s?\d/)
  })
})

describe('private hire: room hire is charged, and the deposit is the approved sentence', () => {
  const SITE = "'app/**/*.tsx' 'app/**/*.ts' 'components/**/*.tsx' 'components/**/*.ts' 'lib/**/*.ts' 'content/blog/**/*.md'"

  const RETIRED: Rule[] = [
    [/room hire(?: is|,)[^.]{0,80}\bincluded\b/i, 'room hire is charged by the hour, wakes included'],
    [/packages? include[^.]{0,40}(?:use of|room hire|private dining room)/i, 'a package covers food and staff, not the room'],
    [/no hidden (?:charges|costs|fees|extras)/i, 'room hire and the deposit are charges: say what they are'],
    [/(?:the )?room costs nothing|not paying for an empty room|every pound goes toward/i, 'room hire is charged by the hour'],
    [/no (?:separate )?(?:room )?hire fee|no room hire charge|room hire is free|free room hire/i, 'room hire is charged by the hour'],
    [/(?:counts?|goes) towards? (?:it|the total|your room hire)/i, 'food and drink spend does not pay for the room'],
    [/(?:don't|do not|doesn't|does not) (?:require|need|take) a deposit for (?:a )?wake|no deposit for (?:a )?wake|don't worry about deposits/i, 'a wake pays the £250 private hire deposit'],
    [/["']?plus VAT["']? surprises/i, 'private hire prices are shown before VAT today, so this promise is false'],
  ]

  it('fails on each retired line', () => {
    const retired = [
      'Room hire, dedicated staff, setup, and cleardown are all included in our packages.',
      'All packages include use of our private dining room, dedicated staff, free parking, and setup and cleardown.',
      'All funeral tea packages include use of the private dining room, dedicated staff, setup, cleardown, and free parking.',
      'There are no hidden charges.',
      'Simple, honest pricing with no hidden charges',
      "The quote-on-enquiry model means you're not paying for an empty room, every pound goes toward food and drinks.",
      "your food and drink count towards the total, there's no separate hire fee",
      'your spend on food and drinks counts towards it',
      "Many venues, including The Anchor, don't require a deposit for wake bookings.",
      '5. **Don\'t worry about deposits.**',
      'No car park surcharges. No "plus VAT" surprises.',
    ]
    for (const line of retired) {
      expect(offendersIn([line], 'retired', RETIRED)).not.toEqual([])
    }
  })

  it('passes the correct sentences', () => {
    const allowed = [
      ROOM_HIRE_WORDING,
      PRIVATE_HIRE_DEPOSIT_WORDING,
      'Our packages cover the food, dedicated staff, setup, and cleardown.',
      'Room hire is charged by the hour for the space you use, on top of the catering you choose and anything from the bar.',
      'Staff and parking are included.',
      'Brochure prices exclude VAT at 20%.',
      'Yes, a room hire fee applies for baby showers.',
      'No deposit for tables of 14 or fewer',
    ]
    for (const line of allowed) {
      expect(offendersIn([line], 'allowed', RETIRED)).toEqual([])
    }
  })

  it('finds none of the retired lines in the site', () => {
    expect(scan(SITE, RETIRED)).toEqual([])
  })

  it('never shortens the £250 deposit sentence', () => {
    // Wherever the opening of the approved sentence is typed out, the rest must
    // follow word for word. Pages should render PRIVATE_HIRE_DEPOSIT_WORDING.
    const opening = 'A £250 booking and damage deposit secures your date'
    const offenders: string[] = []
    for (const file of files(SITE)) {
      if (file === 'lib/approved-wording.ts') continue
      const text = copyLines(file).join(' ')
      let at = text.indexOf(opening)
      while (at >= 0) {
        if (!text.startsWith(PRIVATE_HIRE_DEPOSIT_WORDING, at)) offenders.push(`${file}: "${text.slice(at, at + 110)}"`)
        at = text.indexOf(opening, at + 1)
      }
    }
    expect(offenders).toEqual([])
  })

  it.each([
    'app/private-hire/_components/CateringPackagesCard.tsx',
    'app/private-hire/page.tsx',
    'app/private-hire/wakes/page.tsx',
    'app/private-hire/anniversary-parties/page.tsx',
    'app/private-hire/engagement-parties/page.tsx',
  ])('%s renders the deposit from the shared constant', (file) => {
    expect(read(file)).toContain('PRIVATE_HIRE_DEPOSIT_WORDING')
  })

  it('the wakes page says room hire is charged, three times over', () => {
    const wakes = read('app/private-hire/wakes/page.tsx')
    expect(wakes.split('ROOM_HIRE_WORDING}').length - 1).toBeGreaterThanOrEqual(3)
    expect(wakes).not.toContain('Everything Included')
  })
})

describe('deposits and tickets: the refund bands sit beside the pay button', () => {
  it('the deposit pay box shows the note it is given, and the form gives it the group bands', () => {
    const section = read('components/features/TableBooking/PayPalDepositSection.tsx')
    expect(section).toContain('{refundNote ? <p className="text-ink-muted text-xs">{refundNote}</p> : null}')
    expect(section.indexOf('{refundNote ?')).toBeLessThan(section.indexOf('<PayPalButtons'))

    const form = read('components/features/TableBooking/ManagementTableBookingForm.tsx')
    expect(form).toContain('refundNote={groupDepositRefundNote}')
    // A Christmas sitting has its own refund rule, so it must never get the bands.
    expect(form).toContain('const groupDepositRefundNote = seasonalRequiresFoodService ? undefined : GROUP_DEPOSIT_REFUND_WORDING')
  })

  it('the ticket pay box shows the ticket bands above the button', () => {
    const section = read('components/features/EventBooking/PayPalEventPaymentSection.tsx')
    expect(section).toContain('{EVENT_TICKET_REFUND_WORDING}')
    expect(section.indexOf('{EVENT_TICKET_REFUND_WORDING}')).toBeLessThan(section.indexOf('<PayPalButtons'))
  })

  it('Book a Table does not say "Free to cancel", and its deposit answer carries the bands', () => {
    const page = read('app/book-table/page.tsx')
    expect(page).toContain('<RegretReduction variant="table" />')
    expect(page).not.toMatch(/free to cancel/i)
    expect(page).toContain('${GROUP_DEPOSIT_WORDING} ${GROUP_DEPOSIT_REFUND_WORDING}')
  })
})

describe('Christmas: more than 20 pays the private hire deposit, and Sunday is the weekend price', () => {
  const page = read('app/christmas-parties/client-components.tsx')

  it('no longer says the £10 deposit applies at any size', () => {
    expect(page).not.toMatch(/every booking, any size|whatever the size of (?:your|the) group|One deposit rule/i)
    expect(page).toContain('{CHRISTMAS_PRIVATE_DEPOSIT_WORDING} {PRIVATE_HIRE_DEPOSIT_WORDING}')
    expect(page).toContain('${CHRISTMAS_PRIVATE_DEPOSIT_WORDING} ${PRIVATE_HIRE_DEPOSIT_WORDING}')
  })

  it('names Sunday with Friday and Saturday wherever the two prices are explained', () => {
    expect(page).not.toMatch(/Friday to Saturday|Fri-Sat/)
    expect(page).toContain('Priced differently Tuesday to Thursday and Friday to Sunday.')
    expect(page).toContain('Friday, Saturday and Sunday are the weekend rate')
  })
})

describe('third-party prices are off the main pages (owner decision 17)', () => {
  // The blog guides are a later batch, so this reads page code only.
  const PAGES = "'app/**/*.tsx' 'app/**/*.ts' 'components/**/*.tsx' 'lib/**/*.ts'"

  const RULES: Rule[] = [
    // Word boundaries matter: "dauber" contains "uber".
    [/\b(?:taxis?|uber|cab|rideshares?)\b[^.<>]{0,60}£\s?\d|£\s?\d[^.<>]{0,40}\b(?:taxis?|uber|cab fare)\b/i, 'a taxi fare is not ours to print'],
    [/fixed fare/i, 'a taxi fare is not ours to print'],
    [/\btaxi\b[^.<>]{0,60}(?:fiver|tenner|five pounds|ten pounds|quid)/i, 'a taxi fare is not ours to print'],
    [/(?:parking|car park|short[- ]stay|Park & Ride|Heathrow \()[^.<>]{0,80}(?:£\s?\d|quid an hour)/i, "another car park's price is not ours to print"],
  ]

  it('fails on each retired line', () => {
    const retired = [
      '7 minute taxi or Uber (£20-25 fixed fare) from BA arrivals',
      'Taxi fare ~£18, free parking on arrival saves £20+',
      'Taxis and rideshares average £22 each way',
      "It's about £20-25 by taxi (11 minutes) or £15-20 by Uber.",
      'A taxi costs £10-15 each way.',
      'A taxi takes about fifteen minutes and costs less than a tenner.',
      'a taxi from there to us is barely five pounds',
      'Compare: Heathrow T5 Short Stay = £7.50/hour | The Anchor = FREE!',
      "Terminal 2's short-stay car park charges £6.90 for just 30 minutes",
      "heathrow: 'T5 Park & Ride starts from £46.80'",
      'you swap Windsor’s parking charges (easily three or four quid an hour) for 20 free spaces',
      'compared to Staines town centre pubs where parking can cost £3-5.',
    ]
    for (const line of retired) {
      expect(offendersIn([line.replace(/’/g, "'")], 'retired', RULES)).not.toEqual([])
    }
  })

  it('passes journey times, free parking and our own live price', () => {
    const allowed = [
      '7 minute taxi or Uber from BA arrivals',
      "It's about 11 minutes by taxi or Uber.",
      'Ask your driver for The Anchor, Horton Road, Stanwell Moor, TW19 6AQ',
      'Parking at The Anchor is free while you visit.',
      "Priced by date. Check Heathrow's own site for yours.",
    ]
    for (const line of allowed) {
      expect(offendersIn([line], 'allowed', RULES)).toEqual([])
    }
  })

  it('finds none in the page code', () => {
    expect(scan(PAGES, RULES)).toEqual([])
  })
})
