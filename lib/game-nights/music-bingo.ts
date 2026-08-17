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
    // A real music bingo night, owner-supplied. This one is natively 640x360, so
    // it is the only photo across the three sets that needs no crop to run as a
    // wide hero.
    image: '/images/events/music-bingo/music-bingo-room-wide.jpg',
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

  photos: [
    {
      src: '/images/events/music-bingo/music-bingo-packed-tables.jpg',
      alt: 'Packed tables of players with their cards up during music bingo at The Anchor',
      caption: 'It genuinely does sell out'
    },
    {
      src: '/images/events/music-bingo/music-bingo-hands-up.jpg',
      alt: 'Players with hands raised during a music bingo round at The Anchor',
      caption: 'Hands up when you get the track'
    },
    {
      src: '/images/events/music-bingo/music-bingo-full-room.jpg',
      alt: 'A full room during music bingo, hosted by Nikki Manfadge',
      caption: 'Hosted by Nikki Manfadge'
    },
    {
      src: '/images/events/music-bingo/music-bingo-singalong.jpg',
      alt: 'Tables of people singing along between rounds at music bingo',
      caption: 'Singing along is compulsory'
    },
    {
      src: '/images/events/music-bingo/music-bingo-group-celebrating.jpg',
      alt: 'A large group celebrating together at music bingo at The Anchor',
      caption: 'Bring a mixed crew'
    },
    {
      src: '/images/events/music-bingo/music-bingo-room-wide.jpg',
      alt: 'Wide view of the room during music bingo at The Anchor, Stanwell Moor',
      caption: 'Doors 6:30pm, first game 8pm'
    }
  ],

  promotable: true
}
