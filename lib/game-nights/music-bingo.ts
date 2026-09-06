import type { GameNightConfig } from './types'

/**
 * Music bingo. Facts from docs/SSOT.md §10: dates vary, arrive from 6:30pm, start
 * 7pm unless the event record says otherwise, £5 per person unless the event record
 * says otherwise, two games plus interactive music games and quizzes, song clips
 * replace bingo numbers, capacity 60, hosted by Nikki Manfadge, and private
 * nights available on request.
 *
 * Price corrected from £3 to £5 on 17 August 2026. The £3 figure was stale in three
 * places on this page while the live event records all said 5, so the page argued
 * with itself and with the booking step. Every scheduled music bingo in the
 * management DB is priced at 5. Anything still saying £3 is wrong.
 *
 * Naming Nikki as a drag host is allowed here and only here: the SSOT retires
 * drag cabaret as a format but states "Music Bingo is the only drag night" and
 * that music bingo copy may still refer to its drag host. This is also the whole
 * basis of the "drag bingo near me" keyword cluster, which has the same measured
 * demand as "music bingo near me" (GKP 500/mo) at a competition index of zero.
 * See tasks/keyword-plan-game-nights-2026-08-17.md.
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
    // wide hero. Deliberately kept over the close shot of Nikki: the packed room
    // is the claim that needs proving, and every alternative is portrait and
    // centre-crops to almost nothing at hero width.
    image: '/images/events/music-bingo/music-bingo-hero-room-wide.jpg',
    focal: '50% 45%',
    crumb: 'Music Bingo',
    // Stanwell Moor first, not Heathrow. These pages are for people who live
    // within a few miles and already know where the pub is.
    title: 'Music Bingo at The Anchor, Stanwell Moor',
    lead:
      'Song clips instead of numbers, hosted by drag queen Nikki Manfadge. Two themed games, prizes across both, and communal seating, so book ahead and we will keep your group together.'
  },

  facts: [
    { label: 'Entry', value: '£5 per person, cash' },
    { label: 'Starts', value: '7pm, arrive from 6:30pm' },
    { label: 'Games', value: 'Two, plus music rounds' },
    { label: 'Host', value: 'Nikki Manfadge' },
    // "Free, right outside" read as a guarantee on a night that fills up. There
    // are 20 spaces (docs/SSOT.md §8), so say so.
    { label: 'Parking', value: 'Free, 20 spaces' }
  ],

  bookingCtaPrefix: 'Book your places for',
  bookingCtaFallback: 'Call about the next music bingo',

  bookingNote:
    'Your booking is your seat, and you do not need a separate table booking to eat. Entry is £5 per person paid in cash on the night, so there is nothing to pay now.',

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
      question: 'What time does it start?',
      answer:
        'First game is 7pm and the room is set from 6:30pm. The pub itself is open from 12pm, so come whenever you like and eat first.'
    },
    {
      question: 'Will my group sit together?',
      answer:
        'Yes. Seating is communal, so book everyone in your group in one booking and we will seat you together. On a busy night a long table may be shared with another group.'
    },
    {
      question: 'Do we have to pay now?',
      answer:
        'No. It is £5 per person in cash on the night. The booking just holds your places.'
    },
    {
      question: 'Can we book music bingo for a private group?',
      answer:
        'Yes, private music bingo nights are available on request. Call 01753 682707 and we will put one together for your group.'
    }
  ],

  // Six deliberately different moments, not six frames of one. This set needed it
  // most: perceptual hashing found one cluster of 36 near-identical photos and
  // another of 22, and the first pass drew several picks from the same cluster.
  // One per cluster now, and the hero shot is excluded.
  photos: [
    {
      src: '/images/events/music-bingo/music-bingo-packed-tables.jpg',
      alt: 'Nikki Manfadge working a full room of seated players during music bingo at The Anchor',
      caption: 'Communal tables, and everyone joins in'
    },
    {
      src: '/images/events/music-bingo/music-bingo-host-on-the-mic.jpg',
      alt: 'Drag host Nikki Manfadge on the microphone at music bingo at The Anchor',
      caption: 'Hosted by Nikki Manfadge'
    },
    {
      src: '/images/events/music-bingo/music-bingo-big-group.jpg',
      alt: 'A large group posing together at music bingo at The Anchor',
      caption: 'Bring a mixed crew'
    },
    {
      src: '/images/events/music-bingo/music-bingo-table-of-friends.jpg',
      alt: 'A table of friends with drinks at music bingo at The Anchor',
      caption: 'Good for a group night out'
    },
    {
      src: '/images/events/music-bingo/music-bingo-winner-with-host.jpg',
      alt: 'A music bingo winner collecting their prize from the host at The Anchor',
      caption: 'Prizes across both games'
    },
    {
      src: '/images/events/music-bingo/music-bingo-group-standing.jpg',
      alt: 'A group standing with drinks at music bingo at The Anchor',
      caption: 'Arrive from 6:30pm, first game 7pm'
    }
  ],

  promotable: true
}
