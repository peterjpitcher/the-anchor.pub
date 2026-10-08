export {}

import { readFileSync } from 'fs'
import { join } from 'path'

import {
  CHILDREN_WELCOME_WORDING,
  COACH_PARKING_WORDING,
  COMMENTARY_WORDING,
  DOGS_WORDING,
  FAMILIES_WORDING,
  PARKING_WORDING,
  SIX_NATIONS_WORDING,
  SPORT_WORDING,
  TAXI_WORDING,
  ULEZ_WORDING,
} from '@/lib/approved-wording'
import { bookingConfig } from '@/lib/booking-config'
import {
  BUS,
  BUS_WORDING,
  CONTACT,
  DRIVE_TIMES,
  GEO_COORDINATES_SCHEMA,
  HEATHROW_DISTANCES,
  HEATHROW_TIMES,
  HEATHROW_TIMES_WORDING,
  PARKING,
  POSTAL_ADDRESS_SCHEMA,
  PRICE_RANGE,
  WAKE_VENUE_DRIVE_MINUTES,
} from '@/lib/constants'
import { landmarks } from '@/lib/local-seo-data'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
import { parkingFacilitySchema } from '@/lib/schemas/parking'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rules = require('./helpers/one-home-for-facts-rules.js') as {
  check: (root: string, files?: string[]) => string[]
  offences: (piece: string, file: string) => string[]
  blogFiles: (root: string) => string[]
  customerFacingFiles: (root: string) => string[]
  copyText: (root: string, file: string) => string
}

// One home for each fact (site review of 7 October 2026, package P10).
//
// The review found the same few facts typed into page after page, and
// drifting: terminal drive times that disagreed on ten pages, three buses
// named where one stops, "parties of 250" on a page whose limit is 150, a
// parking count of 30 in the structured data, children "until 8pm", dogs "in
// the bar and garden", and left against right in hand-typed directions.
//
// Each of those facts now has one home. This suite fails when the home and the
// SSOT disagree, and when a page types the fact again instead of reading it.
// The patterns live in tests/helpers/one-home-for-facts-rules.js.

const ROOT = join(__dirname, '..')
const read = (file: string): string => readFileSync(join(ROOT, file), 'utf8')
const ssot = JSON.parse(read('SSOT.json'))
const ssotMarkdown = read('docs/SSOT.md')
const PAGE = 'app/example/page.tsx'
const fails = (line: string, file = PAGE): boolean => rules.offences(line, file).length > 0

describe('the home says what the SSOT says', () => {
  it('terminal times, distances and the general range', () => {
    const times = ssot.heathrow_proximity.terminal_times
    expect(HEATHROW_TIMES.terminal2).toBe(times.terminal_2.minutes)
    expect(HEATHROW_TIMES.terminal3).toBe(times.terminal_3.minutes)
    expect(HEATHROW_TIMES.terminal4).toBe(times.terminal_4.minutes)
    expect(HEATHROW_TIMES.terminal5).toBe(times.terminal_5.minutes)
    expect(HEATHROW_TIMES.range).toBe(ssot.heathrow_proximity.general_range)
    expect(HEATHROW_TIMES.rangeWords).toBe(HEATHROW_TIMES.range.replace('-', ' to '))
    expect(HEATHROW_DISTANCES.terminal3).toBe(ssot.heathrow_proximity.distances.terminal_3)
    expect(HEATHROW_DISTANCES.terminal5).toBe(ssot.heathrow_proximity.distances.terminal_5)
    // The SSOT gives no distance for Terminals 2 and 4, so the home has none.
    expect(Object.keys(HEATHROW_DISTANCES).sort()).toEqual(['terminal3', 'terminal5'])
    // The one-clause form pairs Terminals 2 and 3, which is only true while they match.
    expect(HEATHROW_TIMES.terminal2).toBe(HEATHROW_TIMES.terminal3)
    expect(HEATHROW_TIMES_WORDING).toBe(
      '7 minutes from Terminal 5, 11 minutes from Terminals 2 and 3, and 12 minutes from Terminal 4 by car'
    )
  })

  it('the M25 and Staines', () => {
    expect(ssot.location.access.near_m25).toBe(`${DRIVE_TIMES.m25Junction14} minutes from M25 Junction 14`)
    expect(ssot.heathrow_proximity.nearby_from).toBe(`${DRIVE_TIMES.staines} minutes from Staines`)
    // No other place has a figure, so the home holds no other place.
    expect(Object.keys(DRIVE_TIMES).sort()).toEqual(['m25Junction14', 'staines'])
  })

  it('the bus: the 442 only, from Terminal 5', () => {
    expect(ssot.location.access.bus_routes).toEqual([BUS.route])
    expect(ssot.location.access.bus_boards_at).toBe(BUS.boardsAt)
    expect(ssot.location.access.bus_stop).toBe(BUS.stop)
    expect(BUS_WORDING).toBe('The 442 bus stops on Horton Road by the pub and runs from Heathrow Terminal 5.')
    expect(ssotMarkdown).toContain('The 441 and the 555 do not come to Stanwell Moor, so never name them.')
  })

  it('parking, the price band, the address and the map position', () => {
    expect(PARKING.capacity).toBe(ssot.venue.parking.free_spaces)
    expect(PRICE_RANGE).toBe(ssot.venue.price_range)
    expect(CONTACT.coordinates.lat).toBe(ssot.location.coordinates.latitude)
    expect(CONTACT.coordinates.lng).toBe(ssot.location.coordinates.longitude)
    expect(CONTACT.address).toEqual(ssot.location.address)
    expect(GEO_COORDINATES_SCHEMA.latitude).toBe(ssot.location.coordinates.latitude)
    expect(POSTAL_ADDRESS_SCHEMA.streetAddress).toBe(ssot.location.address.street)
    expect(POSTAL_ADDRESS_SCHEMA.addressLocality).toBe(ssot.location.address.town)
  })

  it('room capacities and the online party limit', () => {
    const capacity = ssot.venue.capacity
    const spaces = PRIVATE_HIRE_CAPACITY.spaces
    expect(PRIVATE_HIRE_CAPACITY.recommendedRange).toBe(capacity.private_hire)
    expect([spaces.diningRoom.seated, spaces.diningRoom.standing]).toEqual([
      capacity.dining_room_seated,
      capacity.dining_room_standing,
    ])
    expect([spaces.mainArea.seated, spaces.mainArea.standing]).toEqual([
      capacity.main_area_seated,
      capacity.main_area_standing,
    ])
    expect([spaces.gardenTerrace.seated, spaces.gardenTerrace.standing]).toEqual([
      capacity.beer_garden_seats,
      capacity.beer_garden_standing,
    ])
    expect([spaces.entirePub.seated, spaces.entirePub.standing]).toEqual([capacity.maximum_seated, capacity.maximum])
    expect(bookingConfig.maxOnlinePartySize).toBe(ssot.sunday_roast.booking_policy.max_online_party_size)
  })

  it('the approved sentences are the section 16 blocks, word for word', () => {
    const section16 = ssotMarkdown.slice(ssotMarkdown.indexOf('## 16. Approved Wording'))
    for (const wording of [
      PARKING_WORDING,
      COACH_PARKING_WORDING,
      TAXI_WORDING,
      DOGS_WORDING,
      FAMILIES_WORDING,
      SPORT_WORDING,
      SIX_NATIONS_WORDING,
      COMMENTARY_WORDING,
    ]) {
      expect(section16).toContain(`> ${wording}`)
    }
    expect(ssotMarkdown).toContain(`"${ULEZ_WORDING}"`)
    expect(PARKING_WORDING).toContain(`${PARKING.capacity} free spaces`)
    expect(ssot.venue.family_facilities.children_welcome_until).toMatch(/^Always welcome/)
    expect(CHILDREN_WELCOME_WORDING).toBe('Children are welcome at all hours.')
  })

  it('a landmark has a drive time only where the SSOT gives one', () => {
    const fromSsot = Object.fromEntries(
      (ssot.private_hire.nearby_venues_for_wakes as Array<{ name: string; drive_time: string }>).map((v) => [
        v.name,
        v.drive_time,
      ])
    )
    expect(Object.values(WAKE_VENUE_DRIVE_MINUTES).sort()).toEqual(
      Object.values(fromSsot)
        .map((t) => parseInt(String(t), 10))
        .sort()
    )
    const withDistance = landmarks.filter((l) => l.distance)
    expect(withDistance.map((l) => l.slug).sort()).toEqual(
      [...Object.keys(WAKE_VENUE_DRIVE_MINUTES), 'heathrow-airport'].sort()
    )
    for (const [slug, minutes] of Object.entries(WAKE_VENUE_DRIVE_MINUTES)) {
      expect(landmarks.find((l) => l.slug === slug)?.distance).toBe(`${minutes} mins drive`)
    }
    // The Terminal 5 time is not the time to the whole airport.
    expect(landmarks.find((l) => l.slug === 'heathrow-airport')?.distance).toBe(
      `${HEATHROW_TIMES.terminal5} to ${HEATHROW_TIMES.terminal4} mins drive, depending on the terminal`
    )
  })

  it('the parking structured data carries the count and the sentence, not its own', () => {
    expect(parkingFacilitySchema.numberOfParkingSpaces).toBe(String(PARKING.capacity))
    expect(parkingFacilitySchema.description).toBe(PARKING_WORDING)
    expect(read('lib/schemas/parking.ts')).not.toMatch(/numberOfParkingSpaces['"]?\s*:\s*['"]?\d/)
  })

  it('/llms.txt, which cannot import a constant, gives the same figures', () => {
    const llms = read('public/llms.txt')
    expect(llms).toContain(`Terminal 5: ${HEATHROW_TIMES.terminal5} minutes by car (${HEATHROW_DISTANCES.terminal5})`)
    expect(llms).toContain(`Terminals 2 & 3: ${HEATHROW_TIMES.terminal2} minutes by car`)
    expect(llms).toContain(`Terminal 4: ${HEATHROW_TIMES.terminal4} minutes by car`)
    expect(llms).toContain(
      `${DRIVE_TIMES.m25Junction14} minutes from M25 Junction 14 and ${DRIVE_TIMES.staines} minutes from Staines`
    )
    expect(llms).toContain(`the ${BUS.route} stops on Horton Road by the pub and runs from ${BUS.boardsAt}`)
    expect(llms).not.toMatch(/\b(?:441|555)\b/)
  })
})

describe('the rules catch a fact that is typed in again', () => {
  it('fails on the lines the review found', () => {
    const retired = [
      // journeys
      'Just 10 minutes from Ashford with free parking',
      'We are 7 minutes from Terminal 5.',
      'Seven minutes from Heathrow Terminal 5',
      '7 mins from Heathrow',
      'Heathrow T5: 7 mins',
      '15 mins',
      'Journey time: 10 minutes in normal traffic',
      'A taxi takes about fifteen minutes.',
      'Allow 12-14 minutes from Terminals 2 and 4.',
      'Pleasant 20-minute walk through residential areas.',
      'about 11 minutes (4.5 miles)',
      '3 miles from Ashford Hospital',
      // the bus
      'Buses 441, 442 and 555 from Heathrow Central Bus Station',
      'the 117 bus route connects Feltham to nearby Stanwell Moor',
      'The 442 bus stops directly outside',
      'The bus runs every 30 minutes',
      'Our bus runs from Terminal 2 to Stanwell Moor',
      // parking
      'A large on-site car park with around 20 spaces',
      'We have 20 free parking spaces on site.',
      'Our 20-space car park is free',
      'with guaranteed free parking at the other end',
      'Free parking always available',
      'Free parking means nobody needs a designated driver.',
      'Park free with us while dropping off or collecting passengers',
      'Cars can stay overnight in the car park.',
      // ULEZ
      "We're outside the ULEZ zone, avoiding the daily charge.",
      'Outside ULEZ zone - no charges for any vehicles',
      'which saves Sunbury drivers a few quid on the ULEZ',
      'This is a ULEZ-free route',
      'Free parking, no congestion charge worries',
      // dogs and families
      'welcoming dogs in both our bar area and beer garden',
      'Well-behaved dogs are welcome in the early evening.',
      'Dogs are welcome inside the pub and in the beer garden.',
      'Children are allowed until 8pm.',
      // capacities, structured data, directions, groups, the area, kitchen days
      'from intimate dinners to parties of 250!',
      'Our dining room seats 26',
      'A private dining room for 10+ to 150 guests',
      'Private hire works from 10 guests up to 150',
      'The Anchor - Heathrow Pub & Dining',
      'Turn right onto Horton Road',
      'The Anchor is on your left',
      'At the roundabout, take the 2nd exit',
      'Tables for 8+ guests, please call.',
      'If you walk the Horton Country Park trails',
      "We're just off the A308",
    ]
    for (const line of retired) expect([line, fails(line)]).toEqual([line, true])
    expect(fails('Kitchen open Tue-Sun with pizza, burgers and Sunday roasts', 'app/near-heathrow/terminal-5/page.tsx')).toBe(true)
    expect(fails('pizzas served Tuesday-Saturday from the live menu', 'app/wraysbury-pub/page.tsx')).toBe(true)
  })

  it('passes a fact read from its home, the approved sentences and ordinary copy', () => {
    const fine = [
      '{HEATHROW_TIMES.terminal5} minutes from Terminal 5',
      '`We are ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car.`',
      '{HEATHROW_TIMES.terminal5}-minute drive with free parking at the pub.',
      '{DRIVE_TIMES.staines} minutes from Staines',
      'A short drive from Ashford, with free parking.',
      'Staines Moor and the King George VI Reservoir are each about a 30-minute walk, one way.',
      'Arrive from 6:30pm for a 7pm start.',
      'A pre-flight roast works well with around 90 minutes to spare',
      'Allow 90 minutes door-to-door from Terminal 5 (longer if using Terminals 2 to 4).',
      '{BUS_WORDING}',
      '{PARKING.capacity} free spaces',
      '{PARKING_WORDING}',
      PARKING_WORDING.replace('20', '{PARKING.capacity}'),
      ULEZ_WORDING,
      'Outside the ULEZ zone',
      DOGS_WORDING,
      'Dogs welcome',
      'Are dogs welcome?',
      'Assistance dogs are always welcome throughout The Anchor, including the beer garden.',
      FAMILIES_WORDING,
      CHILDREN_WELCOME_WORDING,
      'Private hire for {PRIVATE_HIRE_CAPACITY.recommendedRange}',
      'It seats {PRIVATE_HIRE_CAPACITY.spaces.diningRoom.seated}',
      'Groups of more than {bookingConfig.maxOnlinePartySize}, give us a call',
      'A £250 booking and damage deposit secures your date.',
      'Get directions',
      'Kitchen times vary by date, so check before you come or call 01753 682707',
    ]
    for (const line of fine) expect([line, rules.offences(line, PAGE)]).toEqual([line, []])
  })

  it('reads every page, including the ones a "**" pathspec skips', () => {
    const files = rules.customerFacingFiles(ROOT)
    for (const file of ['app/page.tsx', 'app/layout.tsx', 'lib/schema.ts', 'lib/local-seo-data.ts', 'components/layout/Navigation.tsx']) {
      expect(files).toContain(file)
    }
    expect(files.some((f) => f.startsWith('content/blog/'))).toBe(false)
  })

  it('drops comments without dropping the copy after them', () => {
    // A first version read from a "{/*" to the next "*/}" and so skipped most
    // of this file, which has a doc comment on a type before any JSX comment.
    const file = 'app/private-hire/near/[slug]/page.tsx'
    const kept = rules.copyText(ROOT, file)
    expect(kept.length).toBeGreaterThan(read(file).replace(/\s+/g, ' ').length * 0.6)
    expect(kept).toContain('generateStaticParams')
    expect(kept).toContain('FAMILIES_WORDING')
  })
})

describe('no page types a fact that has a home', () => {
  it('finds none in the site', () => {
    expect(rules.check(ROOT)).toEqual([])
  })

  it('no blog post names the 441 or the 555', () => {
    const offenders = rules
      .blogFiles(ROOT)
      .filter((file) => /\b(?:441|555)\b[^.\n]{0,40}\bbus|\bbus(?:es)?\b[^.\n]{0,40}\b(?:441|555)\b|\broutes? (?:441|555)\b/i.test(read(file)))
    expect(offenders).toEqual([])
  })
})

describe('the pages the review named carry the fact from its home', () => {
  const uses = (file: string, name: string): boolean => new RegExp(`\\b${name}\\b`).test(read(file))

  it('the bus sentence', () => {
    for (const file of [
      'app/page.tsx',
      'app/_components/HomeFaq.tsx',
      'app/find-us/page.tsx',
      'app/near-heathrow/_components/JourneyTimesCard.tsx',
      'app/restaurants-near-heathrow/page.tsx',
      'app/karaoke/page.tsx',
      'app/cash-bingo/page.tsx',
      'app/music-bingo/page.tsx',
      'app/live-sport/six-nations/page.tsx',
      'app/live-sport/world-cup/page.tsx',
    ]) {
      expect([file, uses(file, 'BUS_WORDING') || uses(file, 'BUS')]).toEqual([file, true])
    }
  })

  it('children at live sport: all hours, with the families wording', () => {
    const page = read('app/live-sport/page.tsx')
    expect(page).toContain('Yes, at all hours. ${FAMILIES_WORDING}')
    expect(page).not.toMatch(/until 8 ?pm/i)
  })

  it('families: wherever baby or child facilities are listed, the missing baby changing is said', () => {
    for (const file of [
      'app/private-hire/christenings/page.tsx',
      'app/private-hire/near/[slug]/page.tsx',
      'app/family-friendly-pub-heathrow/page.tsx',
      'app/near-heathrow/page.tsx',
      'app/near-heathrow/terminal-3/page.tsx',
      'app/safety-and-respect/page.tsx',
      'app/about/the-anchor-facts/page.tsx',
    ]) {
      expect([file, uses(file, 'FAMILIES_WORDING')]).toEqual([file, true])
    }
  })

  it('dogs: the approved sentence on the pages that welcomed them in other words', () => {
    for (const file of [
      'app/_components/HomeFaq.tsx',
      'app/about/page.tsx',
      'app/about/the-anchor-facts/page.tsx',
      'app/book-table/page.tsx',
      'app/beer-garden/page.tsx',
      'app/our-pub/page.tsx',
      'app/new-years-eve/page.tsx',
      'app/dog-friendly-pub-heathrow/page.tsx',
    ]) {
      expect([file, uses(file, 'DOGS_WORDING')]).toEqual([file, true])
    }
  })

  it('"Free Customer Parking" leads to the parking part of Find Us, not the paid airport product', () => {
    expect(read('components/layout/Navigation.tsx')).toContain(
      "{ label: 'Free Customer Parking', href: '/find-us#parking'"
    )
    expect(read('app/sitemap-page/page.tsx')).toContain("{ label: 'Free Parking', href: '/find-us#parking' }")
    expect(read('app/find-us/page.tsx')).toMatch(/id="parking"/)
  })

  it('the sport pages import the approved wording and keep no copy of their own', () => {
    for (const file of [
      'app/live-sport/six-nations/page.tsx',
      'app/live-sport/world-cup/page.tsx',
      'components/features/nations-championship/NationsChampionshipStanding.tsx',
    ]) {
      expect([file, /^const (?:SPORT|PARKING|DOGS|FAMILIES|GROUP_DEPOSIT|COMMENTARY)_WORDING =/m.test(read(file))]).toEqual([
        file,
        false,
      ])
    }
  })

  it('no page publishes hand-typed directions, and the helper that built them is gone', () => {
    expect(read('lib/enhanced-schemas.ts')).not.toContain('HowTo')
  })
})
