import type { GameNightConfig } from './types'

/**
 * Quiz night. Facts from docs/SSOT.md §10: monthly, dates vary, doors usually
 * 6:30pm, start usually 7pm, ends around 9:45pm, £3 per person, teams capped at
 * six, four rounds of ten questions plus an interactive quick-fire round and a
 * comfort break, capacity 80, £25 bar tab for the winners and a bottle of house
 * wine for second from last, phone-free with a 5 point penalty.
 */
export const quizNight: GameNightConfig = {
  slug: 'quiz-night',
  name: 'quiz night',
  categories: [{ name: 'Pub Quiz Night', slug: 'quiz-night-stanwell-moor' }],

  hero: {
    // A real quiz night, owner-supplied. Landscape source, because the hero runs
    // full-bleed and a portrait photo centre-crops to almost nothing.
    image: '/images/events/quiz-night/quiz-night-tables-full.jpg',
    focal: '50% 45%',
    crumb: 'Quiz Night',
    title: 'Pub Quiz Night at The Anchor Near Heathrow',
    lead:
      'Monthly pub quiz near Heathrow and Staines. Four rounds, a £25 bar tab for the winners, and a bottle of wine for whoever comes second from last.'
  },

  facts: [
    { label: 'Entry', value: '£3 per player' },
    { label: 'Teams', value: 'Up to 6 players' },
    { label: 'Starts', value: '7pm, doors 6:30pm' },
    { label: 'House rule', value: 'Phones away' },
    { label: 'Parking', value: 'Free, right outside' }
  ],

  bookingCtaPrefix: 'Book your table for',
  bookingCtaFallback: 'Call about the next quiz night',

  bookingNote:
    'Booking holds your table. Entry is £3 per player paid on the night, so there is nothing to pay now.',

  objections: [
    {
      question: 'We have not got a full team',
      answer:
        'Come anyway. Solo players and pairs get matched up with others on arrival, and teams are capped at six so nobody can field a small army.'
    },
    {
      question: 'Are the questions too hard?',
      answer:
        'General knowledge, no specialist rounds. Roughly half the questions are gettable for anyone, and the rest are the ones worth arguing over.'
    },
    {
      question: 'Can we eat first?',
      answer:
        'Yes. Doors open at 6:30pm and the kitchen runs to 9pm, so order before the first round or during the comfort break.'
    },
    {
      question: 'Do we have to pay now?',
      answer:
        'No. It is £3 per player on the night. Booking just holds the table so your team has somewhere to sit.'
    },
    {
      question: 'Where do we park?',
      answer:
        'Free parking right outside, and we are about seven minutes from Heathrow Terminal 5 depending on traffic.'
    }
  ],

  photos: [
    {
      src: '/images/events/quiz-night/quiz-night-packed-room.jpg',
      alt: 'A full room of quiz teams at their tables on quiz night at The Anchor',
      caption: 'A full room most months'
    },
    {
      src: '/images/events/quiz-night/quiz-night-teams-playing.jpg',
      alt: 'Quiz teams working through a round together at The Anchor',
      caption: 'Heads together on the tricky ones'
    },
    {
      src: '/images/events/quiz-night/quiz-night-long-table.jpg',
      alt: 'A long table of players with drinks and answer sheets at quiz night',
      caption: 'Big groups take the long table'
    },
    {
      src: '/images/events/quiz-night/quiz-night-room-wide.jpg',
      alt: 'Wide view of the room during quiz night at The Anchor, Stanwell Moor',
      caption: 'Doors at 6:30pm, quiz at 7pm'
    },
    {
      src: '/images/events/quiz-night/quiz-night-team-answering.jpg',
      alt: 'A team conferring over their answer sheet during a quiz round',
      caption: 'Teams of up to six'
    },
    {
      src: '/images/events/quiz-night/quiz-night-tables-full.jpg',
      alt: 'Tables full of quiz players in the dining room at The Anchor',
      caption: 'Solo players get matched up'
    }
  ],

  promotable: true
}
