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
  category: {
    name: 'Pub Quiz Night',
    slug: 'quiz-night-stanwell-moor'
  },

  hero: {
    // Interim. The dining room is where teams actually sit, so it beats the
    // building exterior this page used to show, but it is still the venue
    // rather than the night. Swap for a real quiz night photo when the shoot
    // lands: that is the only change this line needs.
    image: '/images/our-pub/the-anchor-dining-room-interior.jpg',
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

  promotable: true
}
