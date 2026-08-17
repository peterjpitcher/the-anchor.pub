import type { GameNightConfig } from './types'

/**
 * Karaoke. This is the one config with `promotable: false`, and the constraint
 * is a hard one.
 *
 * docs/SSOT.md §10 (owner-confirmed 11 August 2026): karaoke is "not a regular
 * feature in 2026", it "happens occasionally, nothing more", it must only be
 * promoted when a specific event record lists it, it must never imply a weekly,
 * monthly or Friday slot, it has no fixed host (Nikki hosts music bingo, not
 * karaoke), entry is free, and no recurring EventSeries schema may be published
 * for it.
 *
 * So this page must convert anyone who lands on it while never selling a
 * cadence that does not exist. Its normal state is "no dates listed", which is
 * why the empty state has to be as good as the booked state: it pushes to the
 * nights that are running instead of dead-ending.
 *
 * Owner-confirmed 17 August 2026, and both corrections matter:
 *
 *  1. **Ticketed, communal seating, no reserved tables.** The page used to
 *     promise "there is a table waiting for you" in the booking note while the
 *     FAQ two screens below said tables were first come, first served. Both
 *     cannot be true and the second one was closer. `booking_mode` on the listed
 *     night is `communal`. Never reinstate a reserved-table promise here.
 *  2. **All ages welcome at all times**, with under-18s accompanied by a
 *     supervising adult. The retired "strictly 18+ after 9pm" rule contradicted
 *     the event record's own family-friendly wording and must not come back.
 *
 * Worth knowing before anyone trims this page: "karaoke near me" measures 50,000
 * UK searches a month in GKP, with "karaoke bar near me" at another 5,000. That
 * is roughly ten times the quiz demand and forty times cash bingo, which makes
 * this the largest organic opportunity across the four game pages despite being
 * the format that runs least often. See
 * tasks/keyword-plan-game-nights-2026-08-17.md. Target the query, never claim to
 * be a karaoke bar: the SSOT forbids implying a cadence.
 */
export const karaoke: GameNightConfig = {
  slug: 'karaoke',
  name: 'karaoke',
  categories: [
    { name: 'Karaoke', slug: 'karaoke-night' },
    {
      // Legacy category matcher only. Nikki Manfadge does NOT host karaoke
      // (owner-confirmed 11 August 2026), she hosts Music Bingo. This entry is
      // kept so any older event still filed under this category in the
      // management app is still found and listed, rather than silently
      // disappearing from the page. Do not use this name in new copy, and
      // retire the category in the management app when convenient.
      name: "Nikki's Karaoke Night",
      slug: 'nikkis-karaoke-night'
    }
  ],

  hero: {
    // INTERIM. There is still no photograph of an actual karaoke night in this
    // repo, which is the single biggest unfixed weakness on the page: it is the
    // largest demand cluster on the site and the only one of the four with no
    // proof that the night happens at all.
    //
    // This is the room rather than the bar counter, which at least shows where a
    // group would sit. It is not a fix. Swap it the moment a real photo exists:
    // a singer mid-song, the host nearby, friends laughing along, and the lyrics
    // screen or microphone visible so it unmistakably reads as karaoke.
    image: '/images/our-pub/the-anchor-main-bar-2026.jpg',
    focal: '50% 55%',
    crumb: 'Karaoke',
    title: 'Karaoke Nights at The Anchor, Stanwell Moor',
    // Deliberately no cadence, no day of the week. The reassurance leads,
    // because "will I be made to sing" is the objection that stops the booking.
    lead:
      'Free entry karaoke in Stanwell Moor. Sing solo, share a duet, or just come and cheer everyone else on. We run it occasionally rather than to a fixed schedule, so any confirmed night is listed below.'
  },

  facts: [
    { label: 'Entry', value: 'Free' },
    { label: 'Seating', value: 'Communal, no reserved tables' },
    { label: 'Ages', value: 'All welcome, under 18s with an adult' },
    { label: 'Runs', value: 'Occasionally, see listings' },
    { label: 'Parking', value: 'Free, 20 spaces' }
  ],

  bookingCtaPrefix: 'Book free places for',
  bookingCtaFallback: 'See what else is on',

  bookingNote:
    'Entry is free. Book a free place for each person so we know how many seats to lay out. Seating is communal, so there are no reserved tables, and you do not need a separate table booking to eat.',

  objections: [
    {
      question: 'Do I have to sing?',
      answer:
        'Not at all. Plenty of people come for the atmosphere and never touch the microphone. Singing along from your seat counts.'
    },
    {
      question: 'When is the next karaoke night?',
      answer:
        'Karaoke runs occasionally rather than on a fixed night, so there is not a standing date to give you. Any confirmed night appears below as soon as it is booked in.'
    },
    {
      question: 'Is there a charge to get in?',
      answer:
        'No, entry is free and singing is free. You still book a place per person, because seating is communal and we need to know how many to lay out.'
    },
    {
      question: 'Do we get our own table?',
      answer:
        'No, seating is communal on karaoke nights. Book everyone in one booking and we will seat your group together, but a long table may be shared with other guests.'
    },
    {
      question: 'Can I bring my children?',
      answer:
        'Yes. All ages are welcome at any point in the evening, with under-18s accompanied by a supervising adult.'
    },
    {
      question: 'How do I get a song on?',
      answer:
        'Ask the host on the night and they will add you to the queue. The song list covers several decades, so most people find something they know.'
    },
    {
      question: 'Can we eat before it starts?',
      answer:
        'Yes, and the pub is open from 12pm. Kitchen times vary by date, so check the listing for that night or call 01753 682707.'
    }
  ],

  // No karaoke photos supplied yet, so no gallery renders here. The other three
  // pages have one. Add shots from a listed karaoke night when there are some:
  // this is the highest-value photography gap on the site, see the hero note.
  photos: [],

  promotable: false
}
