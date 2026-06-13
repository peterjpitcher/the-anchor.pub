export type InternalSeoLink = {
  label: string
  href: string
  description: string
}

export const seasonalOccasionLinks: InternalSeoLink[] = [
  {
    label: "Valentine's Day",
    href: '/valentines-day',
    description: 'Romantic meals and tables for two near Heathrow.',
  },
  {
    label: "Mother's Day",
    href: '/mothers-day',
    description: 'Sunday roast and family tables for Mothering Sunday.',
  },
  {
    label: 'Easter',
    href: '/easter',
    description: 'Easter meals, family visits and long-weekend bookings.',
  },
  {
    label: "Father's Day",
    href: '/fathers-day',
    description: 'Sunday roast, pints and family bookings for dads.',
  },
  {
    label: 'Summer Garden Parties',
    href: '/summer-garden-parties',
    description: 'Beer garden gatherings and private summer events.',
  },
  {
    label: 'Halloween',
    href: '/halloween',
    description: 'Spooky pub nights, costumes and seasonal parties.',
  },
  {
    label: 'Christmas Parties',
    href: '/christmas-parties',
    description: 'Festive lunches, work parties and private Christmas events.',
  },
  {
    label: "New Year's Eve",
    href: '/new-years-eve',
    description: 'See in the new year at The Anchor.',
  },
]

export const trustLinks: InternalSeoLink[] = [
  {
    label: 'Guest Reviews',
    href: '/reviews',
    description: 'Read recent guest feedback and Google review highlights.',
  },
  {
    label: 'Safety and Respect',
    href: '/safety-and-respect',
    description: 'How we keep The Anchor welcoming, inclusive and safe.',
  },
  {
    label: 'Sustainability',
    href: '/sustainability',
    description: 'Our approach to waste, local suppliers and responsible operations.',
  },
]
