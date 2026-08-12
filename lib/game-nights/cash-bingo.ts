import type { GameNightConfig } from './types'

/**
 * Cash bingo. Facts from docs/SSOT.md §10: monthly, dates vary, doors 6pm with
 * book sales from 6pm, eyes down 7pm, £10 per book and £1 daubers both cash
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
  category: {
    name: 'Cash Bingo',
    slug: 'cash-bingo'
  },

  hero: {
    // Interim, same as the other game pages: the room rather than the night.
    // Swap for a real cash bingo photo when the shoot lands.
    image: '/images/our-pub/the-anchor-dining-room-garden-view.jpg',
    focal: '50% 50%',
    crumb: 'Cash Bingo',
    title: 'Cash Bingo Night at The Anchor Near Heathrow',
    lead:
      'Monthly cash bingo in Stanwell Moor. Ten games, cash prizes, and a snowball jackpot that grows every month nobody claims it.'
  },

  facts: [
    { label: 'Books', value: '£10 each, cash only' },
    { label: 'Eyes down', value: '7pm, doors 6pm' },
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
        'Doors and book sales open at 6pm, eyes down at 7pm. Come early if you want food and a decent seat.'
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

  promotable: true
}
