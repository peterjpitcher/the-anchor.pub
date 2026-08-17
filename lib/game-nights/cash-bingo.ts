import type { GameNightConfig } from './types'

/**
 * Cash bingo. Facts from docs/SSOT.md §10: monthly, dates vary, arrive from 6pm
 * with book sales from 6pm, eyes down 7pm, £10 per book and £1 daubers both cash
 * only, ten games, capacity 60, prizes vary by event, and a snowball that grows
 * £20 and 2 calls each month it rolls over. Current jackpot values live in the
 * event records only, never here.
 *
 * The cash-only rule is deliberately the first fact and the first objection.
 * Discovering it on arrival is a bad night out, and discovering it after
 * booking is a no-show.
 */
export const cashBingo: GameNightConfig = {
  slug: 'cash-bingo',
  name: 'cash bingo',
  // The management app calls this category "Bingo Night", not "Cash Bingo". Get
  // this wrong and the page silently lists no dates at all.
  categories: [{ name: 'Bingo Night', slug: 'bingo-night' }],

  hero: {
    // A real cash bingo night, owner-supplied. Landscape source, because the hero
    // runs full-bleed and a portrait photo centre-crops to almost nothing.
    image: '/images/events/cash-bingo/cash-bingo-eyes-down.jpg',
    focal: '50% 50%',
    crumb: 'Cash Bingo',
    title: 'Cash Bingo Night at The Anchor Near Heathrow',
    lead:
      'Monthly cash bingo in Stanwell Moor. Ten games, cash prizes, and a snowball jackpot that grows every month nobody claims it.'
  },

  facts: [
    { label: 'Books', value: '£10 each, cash only' },
    { label: 'Eyes down', value: '7pm, arrive from 6pm' },
    { label: 'Games', value: '10, plus the snowball' },
    { label: 'Age', value: '18+' },
    { label: 'Parking', value: 'Free, right outside' }
  ],

  bookingCtaPrefix: 'Reserve your table for',
  bookingCtaFallback: 'Call about the next cash bingo',

  bookingNote:
    'Booking holds your table. Bingo books are £10 each and daubers £1, both cash only, bought when you arrive.',

  objections: [
    {
      question: 'Can I pay for my books by card?',
      answer:
        'No. Bingo books and daubers are cash only, so bring £10 a book and £1 if you need a dauber. The bar itself takes card as normal.'
    },
    {
      question: 'What do I need to bring?',
      answer:
        'Just cash for your books. Daubers are £1 on the night if you have not got one of your own.'
    },
    {
      question: 'What time should we get here?',
      answer:
        'Book sales start at 6pm and eyes down is 7pm. The pub is open long before that, so come early if you want food and a decent seat.'
    },
    {
      question: 'Is it 18 and over?',
      answer: 'Yes, players need to be 18 or over.'
    },
    {
      question: 'How does the snowball work?',
      answer:
        'If nobody claims it, the snowball grows by £20 and two calls the following month. The current value is on the event listing below.'
    }
  ],

  photos: [
    {
      src: '/images/events/cash-bingo/cash-bingo-eyes-down.jpg',
      alt: 'Players at their tables with bingo books during cash bingo at The Anchor',
      caption: 'Eyes down at 7pm'
    },
    {
      src: '/images/events/cash-bingo/cash-bingo-winners-cash.jpg',
      alt: 'Winners holding their cash prize at cash bingo at The Anchor',
      caption: 'Winnings paid out on the night'
    },
    {
      src: '/images/events/cash-bingo/cash-bingo-players.jpg',
      alt: 'A table of players marking their bingo books between games',
      caption: 'Ten games across the night'
    },
    {
      src: '/images/events/cash-bingo/cash-bingo-room.jpg',
      alt: 'The room set up for cash bingo at The Anchor, Stanwell Moor',
      caption: 'Book sales from 6pm'
    },
    {
      src: '/images/events/cash-bingo/cash-bingo-winner-payout.jpg',
      alt: 'A player collecting a cash payout at bingo at The Anchor',
      caption: 'Cash prizes, cash only books'
    },
    {
      src: '/images/events/cash-bingo/cash-bingo-tables.jpg',
      alt: 'Tables laid out for a cash bingo night at The Anchor',
      caption: 'Come early for a good seat'
    }
  ],

  promotable: true
}
