import type { GameNightConfig } from './types'

/**
 * Karaoke. This is the one config with `promotable: false`, and the constraint
 * is a hard one.
 *
 * docs/SSOT.md §10 (owner-confirmed 11 August 2026): karaoke is "not a regular
 * feature in 2026", it "happens occasionally, nothing more", it must only be
 * promoted when a specific event record lists it, it must never imply a weekly,
 * monthly or Friday slot, it has no fixed host (Nikki hosts music bingo, not
 * karaoke), entry is free, and no recurring EventSeries schema may be published
 * for it.
 *
 * So this page must convert anyone who lands on it while never selling a
 * cadence that does not exist. Its normal state is "no dates listed", which is
 * why the empty state has to be as good as the booked state: it pushes to the
 * nights that are running instead of dead-ending.
 */
export const karaoke: GameNightConfig = {
  slug: 'karaoke',
  name: 'karaoke',
  category: {
    name: 'Karaoke',
    slug: 'karaoke'
  },

  hero: {
    // Interim, the bar rather than the night. Swap when a real karaoke photo
    // from a listed night is available.
    image: '/images/our-pub/the-anchor-bar.jpg',
    focal: '50% 45%',
    crumb: 'Karaoke',
    title: 'Karaoke at The Anchor Near Heathrow',
    // Deliberately no cadence, no host and no day of the week.
    lead:
      'Free entry karaoke in Stanwell Moor. We run it occasionally rather than to a fixed schedule, so any confirmed night is listed below.'
  },

  facts: [
    { label: 'Entry', value: 'Free' },
    { label: 'Runs', value: 'Occasionally, see listings' },
    { label: 'Parking', value: 'Free, right outside' }
  ],

  bookingCtaPrefix: 'Book your table for',
  bookingCtaFallback: 'See what else is on',

  bookingNote: 'Entry is free. Booking just makes sure there is a table waiting for you.',

  objections: [
    {
      question: 'When is the next karaoke night?',
      answer:
        'Karaoke runs occasionally rather than on a fixed night, so there is not a standing date to give you. Any confirmed night appears below as soon as it is booked in.'
    },
    {
      question: 'Is there a charge to get in?',
      answer: 'No, entry is free.'
    },
    {
      question: 'Do I have to sing?',
      answer:
        'Not at all. Plenty of people come for the atmosphere and never touch the mic.'
    },
    {
      question: 'Can we eat before it starts?',
      answer:
        'Yes. Kitchen times vary by date, so check the listing for that night or call 01753 682707.'
    }
  ],

  promotable: false
}
