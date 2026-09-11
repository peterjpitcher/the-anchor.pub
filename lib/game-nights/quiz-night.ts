import type { GameNightConfig } from './types'

/**
 * Quiz night. Facts from docs/SSOT.md §10: monthly, currently Wednesdays, arrive
 * from 6:30pm, start usually 7pm, aims to finish 9:30pm, £3 per person, teams
 * capped at six, five rounds (four of ten questions plus an interactive quick-fire
 * round in the middle, played on your phone) and a comfort break, capacity 60, a
 * £25 bar voucher for the winners and a bottle of house wine for second from last,
 * and phones away except in the interactive round, with a 5 point penalty.
 *
 * Owner-confirmed 11 September 2026: the prize is a voucher, not a bar tab, and
 * seating is team tables. Each team has its own table, so nothing here may say a
 * team shares its table with another team or that quiz seating is communal. Also
 * owner-confirmed that day: five rounds, with the phone-based interactive round in
 * the middle, and prizes for first and second from last only, so no league tables,
 * quiz food deals, spot prizes, free-drink questions or best team name prize.
 *
 * Finish time corrected from ~9:45pm to 9:30pm on 17 August 2026, owner-confirmed
 * and matching `end_time` 21:30 on every scheduled quiz in the management DB. The
 * category page said 9:45pm while the event pages said 9:30pm, so a customer
 * working out whether they could get a babysitter home got two answers.
 *
 * "Wednesday" is deliberate and load-bearing: "wednesday pub quiz" measures 500/mo
 * in the UK at a paid competition index of zero, and the quizzes genuinely are
 * Wednesdays. See tasks/keyword-plan-game-nights-2026-08-17.md.
 */
export const quizNight: GameNightConfig = {
  slug: 'quiz-night',
  name: 'quiz night',
  categories: [{ name: 'Pub Quiz Night', slug: 'quiz-night-stanwell-moor' }],

  hero: {
    // A real quiz night, owner-supplied. Landscape source, because the hero runs
    // full-bleed and a portrait photo centre-crops to almost nothing.
    image: '/images/events/quiz-night/quiz-night-hero-tables-full.jpg',
    focal: '50% 45%',
    crumb: 'Quiz Night',
    title: 'Wednesday Pub Quiz at The Anchor, Stanwell Moor',
    lead:
      'A proper monthly pub quiz, 7pm to 9:30pm. Five rounds, a £25 bar voucher for the winners, and a bottle of house wine for whoever comes second from last.'
  },

  share: {
    // The hero photograph, which is a real quiz night and the widest of the set.
    image: '/images/events/quiz-night/quiz-night-hero-tables-full.jpg',
    alt: 'A full room of teams playing the Wednesday pub quiz at The Anchor, Stanwell Moor',
    width: 640,
    height: 480
  },

  facts: [
    { label: 'Entry', value: '£3 per player, cash' },
    { label: 'Teams', value: 'Up to 6 players' },
    { label: 'Time', value: '7pm to 9:30pm' },
    { label: 'House rule', value: 'Phones away, except the interactive round' },
    { label: 'Parking', value: 'Free, 20 spaces' }
  ],

  bookingCtaPrefix: 'Book your team in for',
  bookingCtaFallback: 'Call about the next quiz night',

  bookingNote:
    'Your booking is your team’s table, and you do not need a separate table booking to eat. Entry is £3 per player paid in cash on the night, so there is nothing to pay now.',

  objections: [
    {
      question: 'We have not got a full team',
      answer:
        'Come anyway. Solo players and pairs get matched up with others on arrival, and teams are capped at six so nobody can field a small army.'
    },
    {
      question: 'Are the questions too hard?',
      answer:
        'General knowledge, no specialist rounds. Roughly half the questions are gettable for anyone, and the rest are the ones worth arguing over. Friendly rather than serious, with the odd bit of adult humour.'
    },
    {
      question: 'What time will we get home?',
      answer:
        'We aim to finish at 9:30pm. Tables are set from 6:30pm and the pub is open from 12pm, so come early and eat first if you want a full evening of it.'
    },
    {
      // No kitchen closing time: it varies by date and comes from the live
      // hours (docs/SSOT.md §3). Worded as karaoke's is. This said 9pm.
      question: 'Can we eat first?',
      answer:
        'Yes, and the pub is open from 12pm. Kitchen times vary by date, so call 01753 682707 if you want to check that night’s times.'
    },
    {
      question: 'Will my team sit together?',
      answer:
        'Yes. Every team has its own table. Book your whole team in one booking, and that booking is your table.'
    },
    {
      question: 'Do we have to pay now?',
      answer:
        'No. It is £3 per player in cash on the night. The booking just holds your team’s table.'
    }
  ],

  // Six deliberately different moments, not six frames of one. The first pass took
  // several shots from the same burst and the gallery read as one photo repeated:
  // perceptual hashing put eleven of these photos in a single near-identical
  // cluster. One per cluster now, and the hero shot is excluded so it does not
  // appear twice on the same page.
  photos: [
    {
      src: '/images/events/quiz-night/quiz-night-busy-room.jpg',
      alt: 'A busy room of quiz players at The Anchor on quiz night',
      caption: 'A full room most months'
    },
    {
      src: '/images/events/quiz-night/quiz-night-host-and-room.jpg',
      alt: 'The quizmaster reading a question to a room of seated teams at The Anchor',
      caption: 'Five rounds, run by a proper quizmaster'
    },
    {
      src: '/images/events/quiz-night/quiz-night-team-writing.jpg',
      alt: 'A quiz team writing their answer down together at The Anchor',
      caption: 'Heads together on the tricky ones'
    },
    {
      src: '/images/events/quiz-night/quiz-night-food-on-the-table.jpg',
      alt: 'Quiz players with food and drinks on the table before the first round',
      caption: 'Eat before the first round'
    },
    {
      src: '/images/events/quiz-night/quiz-night-winners.jpg',
      alt: 'Quiz night winners with their prize at The Anchor',
      caption: '£25 bar voucher for the winners'
    },
    {
      src: '/images/events/quiz-night/quiz-night-second-room.jpg',
      alt: 'Teams playing the quiz in the second room at The Anchor, Stanwell Moor',
      caption: 'Solo players get matched up'
    }
  ],

  promotable: true
}
