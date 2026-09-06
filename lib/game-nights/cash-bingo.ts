import type { GameNightConfig } from './types'

/**
 * Cash bingo. Facts from docs/SSOT.md §10: monthly, dates vary, arrive by 6:30pm,
 * first game 7pm, finishes about 9:30pm, £10 per book and £1 daubers both cash
 * only, ten games, capacity 60, 18+ to play with supervised under-18s welcome to
 * attend, prizes vary by event, and a snowball that grows £20 and 2 calls each
 * month it rolls over. Current jackpot values live in the event records only,
 * never here.
 *
 * Arrival corrected on 17 August 2026. The page previously carried three
 * different arrival times (6pm in the chips, 6:30pm in the listings, "sales and
 * seating open at 6pm" in the FAQ), which is exactly the kind of contradiction
 * that makes a customer doubt the booking will be handled properly. There is now
 * one arrival time, owner-confirmed: "I want people in for 6:30pm so they have
 * time to get a drink, order some food, get their books and get comfortable for a
 * 7pm start." Books are bought on arrival, so do not reintroduce a separate
 * book-sales time.
 *
 * The pub is open from 12pm and the copy has to say so. An arrival time presented
 * on its own reads as an opening time, which is wrong and costs the earlier food
 * trade. See the banned-"Doors" note at the head of docs/SSOT.md §10.
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
    image: '/images/events/cash-bingo/cash-bingo-hero-eyes-down.jpg',
    focal: '50% 50%',
    crumb: 'Cash Bingo',
    title: 'Cash Bingo at The Anchor, Stanwell Moor',
    lead:
      'Traditional cash bingo in the pub, not a bingo hall. Ten games, winnings paid out on the night, and a snowball jackpot that grows every month nobody claims it.'
  },

  share: {
    // The hero photograph, which is a real cash bingo night.
    image: '/images/events/cash-bingo/cash-bingo-hero-eyes-down.jpg',
    alt: 'Players marking their books at a cash bingo night at The Anchor, Stanwell Moor',
    width: 640,
    height: 480
  },

  facts: [
    { label: 'Books', value: '£10 each, cash only' },
    { label: 'First game', value: '7pm, arrive by 6:30pm' },
    { label: 'Games', value: '10, plus the snowball' },
    // Both halves of the age rule, never one without the other (docs/SSOT.md
    // §10): "18+ to play. Supervised under-18s are welcome to attend but may
    // not play." This chip published only the first half, which reads as a door
    // policy and turns away a family that could have come.
    { label: 'Age', value: '18+ to play, supervised under 18s welcome' },
    { label: 'Parking', value: 'Free, 20 spaces' }
  ],

  bookingCtaPrefix: 'Reserve your places for',
  bookingCtaFallback: 'Call about the next cash bingo',

  bookingNote:
    'Your booking is your seat, and you do not need a separate table booking to eat. Books are £10 each and daubers £1, both cash only, bought when you arrive.',

  objections: [
    {
      question: 'Can I pay for my books by card?',
      answer:
        'No. Bingo books and daubers are cash only, so bring £10 a book and £1 if you need a dauber. The bar itself takes card as normal.'
    },
    {
      question: 'What does the £10 actually buy?',
      answer:
        'One book covering all ten games. Half of every book sold goes into the final cash jackpot, so the fuller the room, the bigger that last prize gets.'
    },
    {
      question: 'What time should we get here?',
      answer:
        'By 6:30pm, so you have time for a drink, to order food and to buy your books before the first game at 7pm. The pub itself is open from 12pm, so come earlier if you like. We finish about 9:30pm.'
    },
    {
      question: 'Can I bring my children?',
      answer:
        'Yes, with a supervising adult. Only guests aged 18 and over can buy a book and play for the cash prizes.'
    },
    {
      question: 'Will my group sit together?',
      answer:
        'Yes. Seating is communal, so book everyone in one booking and we will seat you together. On a busy night a long table may be shared with another group.'
    },
    {
      question: 'How does the snowball work?',
      answer:
        'If nobody claims it, the snowball grows by £20 and two calls the following month. The current value and who is eligible are on the event listing below.'
    }
  ],

  // Three photographs, not six. The set previously ran six and the weakest three
  // were doing active harm: a general beer-garden shot with no bingo visible in
  // it at all, and a chocolate-and-prosecco prize shot whose alt text claimed it
  // showed players marking books. Three that each do a distinct job beats six
  // where half of them sell the wrong thing. The 3-column gallery also fills one
  // clean row at this count.
  photos: [
    {
      src: '/images/events/cash-bingo/cash-bingo-winners-cash.jpg',
      alt: 'Two winners holding fans of cash after a game of bingo at The Anchor',
      caption: 'Winnings paid out on the night'
    },
    {
      src: '/images/events/cash-bingo/cash-bingo-cash-and-book.jpg',
      alt: 'A player holding a ten pound note and her bingo books at The Anchor',
      caption: 'One £10 book covers all ten games'
    },
    {
      src: '/images/events/cash-bingo/cash-bingo-garden-group.jpg',
      alt: 'Five players marking their bingo books with daubers at a table at The Anchor',
      caption: 'Books, daubers, ten games'
    }
  ],

  promotable: true
}
