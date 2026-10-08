import { HEATHROW_TIMES, PARKING } from '@/lib/constants'

/**
 * When this year's Halloween party stops being upcoming.
 *
 * The page previously stated "Saturday 31 October, 8pm till midnight, free
 * entry" as flat fact, with no date logic anywhere. On 1 November it would have
 * carried on inviting people to a party that had already happened, in the page
 * body AND in the search result, until somebody remembered to edit it.
 * Seasonal pages get most of their traffic exactly when the date is closest,
 * which is also when being wrong costs the most.
 *
 * Keyed to the END of the night, not the start: someone checking at 10pm on the
 * 31st is still coming, and half an hour past midnight covers the stragglers.
 *
 * The instant is written with its offset. The clocks go back on 25 October
 * 2026, so 00:30 on 1 November in London is 00:30 GMT. Without the offset the
 * moment was read in the server's own zone, which is only right by luck.
 *
 * Lives here rather than in the page because Next only permits a fixed set of
 * exports from a route file, and because `generateMetadata`, the body and the
 * questions and answers must all read the same value: a search result and the
 * page it points at should never disagree about whether the night has happened.
 *
 * ANNUAL ROLLOVER. Owner: Peter Pitcher. Update this and the copy below once
 * next year's date and theme are confirmed. Until then the page says the theme
 * is not yet announced rather than inventing one.
 */
export const HALLOWEEN_PARTY_ENDS = new Date('2026-11-01T00:30:00Z')

export function isHalloweenPartyOver(now: Date = new Date()): boolean {
  return now.getTime() > HALLOWEEN_PARTY_ENDS.getTime()
}

export interface HalloweenFaq {
  question: string
  answer: string
}

export interface HalloweenCopy {
  partyOver: boolean
  metaTitle: string
  metaDescription: string
  socialTitle: string
  socialDescription: string
  heroKicker?: string
  heroLead: string
  ctaTitle: string
  ctaCopy: string
  faqs: HalloweenFaq[]
}

const THEME = 'Enter If You Dare: The House of Horrors'

/**
 * Every line on /halloween that names this year's date, times, theme or food
 * service, in both states.
 *
 * Before the party it carries the facts in SSOT section 10 (Party nights):
 * Saturday 31 October 2026, 8pm to midnight, free entry, full menu until 6pm,
 * no food 6pm to 9pm, pizza 9pm to midnight. After it, none of those are true
 * of any night we can name, so the "over" set states only what holds every
 * year. It does not promise next year's party, its date or its food.
 *
 * The Hint of Halloween quiz (7 October 2026) is not mentioned in either set.
 * It was typed into two answers and was still described as coming up the
 * morning after it happened.
 */
export function getHalloweenCopy(now: Date = new Date(), addressLine?: string): HalloweenCopy {
  const partyOver = isHalloweenPartyOver(now)
  const parkingAnswer =
    `Free on-site parking is available, with ${PARKING.capacity} spaces. We’re about ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 by car.` +
    (addressLine ? ` You’ll find us at ${addressLine}.` : '')

  const fancyDress: HalloweenFaq = {
    question: 'Do I have to wear fancy dress?',
    answer:
      'Fancy dress is the heart of the night and very much encouraged, but it is not compulsory. Come dressed up, or come as you are.',
  }
  const parking: HalloweenFaq = { question: 'Is there parking?', answer: parkingAnswer }

  if (partyOver) {
    return {
      partyOver,
      metaTitle: 'Halloween Party Near Heathrow',
      metaDescription:
        'Our Halloween fancy-dress party near Heathrow, in Stanwell Moor. This year has been and gone; next year’s theme goes up as soon as it is confirmed.',
      socialTitle: 'Halloween Party Near Heathrow | The Anchor',
      socialDescription:
        'Our Halloween fancy-dress party in Stanwell Moor, near Heathrow. This year has been and gone; next year’s details go up once they are confirmed.',
      heroLead:
        'This year’s Halloween party has been and gone. Thanks to everyone who dressed up. Next year’s theme and date go up here once they’re confirmed.',
      ctaTitle: 'This year’s Halloween has been and gone',
      ctaCopy:
        'Next year’s details go up here once they’re confirmed. In the meantime, see what’s on or book a table.',
      faqs: [
        {
          question: 'Is there a Halloween party at The Anchor?',
          answer:
            'This year’s party has been and gone. Next year’s theme and date go up on this page and on What’s On once they are confirmed.',
        },
        fancyDress,
        {
          question: 'What is the Halloween theme?',
          answer:
            'The fancy-dress theme changes every year. Next year’s has not been announced yet.',
        },
        parking,
      ],
    }
  }

  return {
    partyOver,
    metaTitle: 'Halloween Party Near Heathrow, Free Entry',
    metaDescription:
      'Halloween party near Heathrow, Saturday 31 October. Free entry, fancy dress, free parking. This year’s theme: Enter If You Dare, The House of Horrors.',
    socialTitle: 'Halloween Party Near Heathrow, Free Entry | The Anchor',
    socialDescription:
      'Halloween party at The Anchor near Heathrow, Saturday 31 October, 8pm till midnight. Free entry, fancy dress and free parking. This year: The House of Horrors.',
    heroKicker: 'Saturday 31 October, 8pm till midnight',
    heroLead:
      `${THEME} is this year's Halloween party at The Anchor in Stanwell Moor. Free entry, fancy dress encouraged, music all night and the bar open until midnight. Eat before the party, park for free, and walk in.`,
    ctaTitle: 'Halloween at The Anchor, Saturday 31 October',
    ctaCopy:
      `${THEME} runs from 8pm until midnight. Free entry, fancy dress encouraged and free parking. Book a table if you want to eat first, or just walk in.`,
    faqs: [
      {
        question: 'Is there a Halloween party at The Anchor?',
        answer:
          `Yes. This year it is ${THEME}, on Saturday 31 October from 8pm until midnight. Entry is free, fancy dress is encouraged and the bar is open until midnight.`,
      },
      fancyDress,
      {
        question: 'What is this year’s Halloween theme?',
        answer:
          `${THEME}. The fancy-dress theme changes every year, so it is never the same night twice. Come as anything that fits the theme, or just come as something spooky.`,
      },
      {
        question: 'Do you serve food on Halloween?',
        answer:
          'Yes, but plan around the kitchen. The full menu runs until 6pm, the kitchen is closed from 6pm to 9pm, and pizza is served from 9pm to midnight, to eat in or take away. Book a table if you’d like to eat before 6pm.',
      },
      {
        question: 'What Halloween events are on near me?',
        answer:
          'The House of Horrors Halloween party on Saturday 31 October, which is free to get into. It is in Stanwell Moor, a few minutes from Heathrow and a short drive from Staines.',
      },
      {
        question: 'How much does it cost to get in?',
        answer: 'The Halloween party on 31 October is free entry, with no ticket needed.',
      },
      parking,
    ],
  }
}
