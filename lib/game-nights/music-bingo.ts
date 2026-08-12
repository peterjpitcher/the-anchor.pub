import type { GameNightConfig } from './types'

/**
 * Music bingo. Facts from docs/SSOT.md §10: dates vary, doors 6:30pm, start 8pm
 * unless the event record says otherwise, £3 per person unless the event record
 * says otherwise, two games plus interactive music games and quizzes, song clips
 * replace bingo numbers, capacity 90, hosted by Nikki Manfadge, and private
 * nights available on request.
 *
 * Naming Nikki as a drag host is allowed here and only here: the SSOT retires
 * drag cabaret as a format but states "Music Bingo is the only drag night" and
 * that music bingo copy may still refer to its drag host.
 *
 * Start time and price both carry an "unless the event record says otherwise"
 * caveat in the SSOT. The live event cards sit directly below these chips and
 * show the actual figures per date, so the chips carry the usual case.
 */
export const musicBingo: GameNightConfig = {
  slug: 'music-bingo',
  name: 'music bingo',
  categories: [{ name: 'Music Bingo', slug: 'music-bingo' }],

  hero: {
    // Interim, the bar rather than the night. The one photo of Nikki in the
    // repo is 360x640, far too small to run full-bleed, so it cannot serve
    // here yet. Swap for a real music bingo photo when the shoot lands.
    image: '/images/our-pub/the-anchor-main-bar-area.jpg',
    focal: '50% 45%',
    crumb: 'Music Bingo',
    title: 'Music Bingo at The Anchor Near Heathrow',
    lead:
      'Song clips instead of numbers, hosted by Nikki Manfadge. Two games, interactive music rounds, and it sells out, so book ahead.'
  },

  facts: [
    { label: 'Entry', value: '£3 per person' },
    { label: 'Starts', value: '8pm, doors 6:30pm' },
    { label: 'Games', value: 'Two, plus music rounds' },
    { label: 'Host', value: 'Nikki Manfadge' },
    { label: 'Parking', value: 'Free, right outside' }
  ],

  bookingCtaPrefix: 'Book your table for',
  bookingCtaFallback: 'Call about the next music bingo',

  bookingNote:
    'Booking holds your table. Entry is £3 per person paid on the night, so there is nothing to pay now.',

  objections: [
    {
      question: 'I have never played music bingo, how does it work?',
      answer:
        'Song clips replace the numbers. You mark off the tracks you hear on your card. If you recognise songs, you can play it, there is nothing to learn.'
    },
    {
      question: 'Do I need to be good at music?',
      answer:
        'No. The clips span decades, so mixed groups tend to do best. There are two games plus interactive rounds and quizzes between them.'
    },
    {
      question: 'Does it sell out?',
      answer:
        'Often, yes. Book a table rather than turning up on the night, and if a date is full you can join the waitlist below.'
    },
    {
      question: 'Do we have to pay now?',
      answer:
        'No. It is £3 per person on the night. Booking just holds the table.'
    },
    {
      question: 'Can we book music bingo for a private group?',
      answer:
        'Yes, private music bingo nights are available on request. Call 01753 682707 and we will put one together for your group.'
    }
  ],

  promotable: true
}
