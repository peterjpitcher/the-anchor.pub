import type { Event } from './api'

// Helper to create recurring event objects that can use the EventSchema component
export function createRecurringEvent(params: {
  id: string
  slug: string
  name: string
  description: string
  longDescription?: string
  shortDescription?: string
  image: string[]
  price?: string
  duration?: string
  category?: {
    id: string
    name: string
    slug: string
    color: string
    icon: string
  }
  performer?: {
    name: string
    type?: 'Person' | 'Organization' | 'MusicGroup'
  }
  organizer?: {
    name: string
    url?: string
  }
  dayOfWeek?: string
  startTime?: string
  endTime?: string
  maximumAttendeeCapacity?: number
  remainingAttendeeCapacity?: number
}): Event {
  const now = new Date()
  const oneYearLater = new Date(now)
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

  return {
    '@type': 'Event',
    id: params.id,
    slug: params.slug,
    name: params.name,
    description: params.description,
    longDescription: params.longDescription || params.description,
    shortDescription: params.shortDescription || params.description.substring(0, 100),
    startDate: now.toISOString(),
    endDate: oneYearLater.toISOString(),
    duration: params.duration || 'PT3H',
    image: params.image,
    offers: {
      '@type': 'Offer',
      price: params.price || '0',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      validFrom: now.toISOString(),
      url: `https://www.the-anchor.pub/events/${params.slug}`
    },
    location: {
      '@type': 'Place',
      name: 'The Anchor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      }
    },
    performer: params.performer ? {
      '@type': params.performer.type || 'Person',
      name: params.performer.name
    } : undefined,
    organizer: params.organizer || {
      '@type': 'Organization',
      name: 'The Anchor',
      url: 'https://www.the-anchor.pub'
    },
    maximumAttendeeCapacity: params.maximumAttendeeCapacity || 100,
    remainingAttendeeCapacity: params.remainingAttendeeCapacity || 100,
    isAccessibleForFree: params.price === '0' || params.price === undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    category: params.category || {
      id: 'events',
      name: 'Events',
      slug: 'events',
      color: '#D4AF37',
      icon: '🎉'
    }
  } as Event
}

// Pre-configured events that can be imported and used
export const staticEvents = {
  corporateEvents: createRecurringEvent({
    id: 'corporate-events',
    slug: 'corporate-events',
    name: 'Corporate Events & Meetings',
    description: 'Professional venue hire for corporate events, meetings, and team building activities.',
    longDescription: 'Transform your next corporate event at The Anchor. Our flexible venue spaces accommodate meetings, presentations, team building activities, and corporate celebrations. Full catering options, AV equipment, and dedicated event support available.',
    shortDescription: 'Professional corporate event venue near Heathrow',
    image: [
      '/images/venue/function-room/the-anchor-corporate-events-stanwell-moor.jpg',
      '/images/venue/function-room/meeting-room-setup-the-anchor.jpg'
    ],
    price: 'Variable',
    duration: 'PT8H',
    category: {
      id: 'corporate',
      name: 'Corporate',
      slug: 'corporate',
      color: '#1e3a8a',
      icon: '💼'
    },
    performer: {
      name: 'The Anchor Events Team',
      type: 'Organization'
    }
  }),

  christmasParties: createRecurringEvent({
    id: 'christmas-parties-2024',
    slug: 'christmas-parties',
    name: 'Christmas Party Bookings',
    description: 'Book your Christmas party at The Anchor. Festive menus, decorations, and entertainment.',
    longDescription: 'Make your Christmas celebration special at The Anchor. We offer tailored Christmas party packages including festive menus, seasonal decorations, and optional entertainment. Perfect for office parties, family gatherings, or festive get-togethers.',
    shortDescription: 'Festive party venue with full Christmas packages',
    image: [
      '/images/events/christmas/the-anchor-christmas-party-venue.jpg',
      '/images/events/christmas/festive-dining-the-anchor.jpg'
    ],
    price: 'Contact for pricing',
    duration: 'PT4H',
    category: {
      id: 'seasonal',
      name: 'Seasonal Events',
      slug: 'seasonal',
      color: '#dc2626',
      icon: '🎄'
    },
    performer: {
      name: 'The Anchor Entertainment',
      type: 'Organization'
    },
    startTime: '12:00',
    endTime: '23:00'
  }),

  privateParties: createRecurringEvent({
    id: 'private-parties',
    slug: 'private-parties',
    name: 'Private Parties at The Anchor',
    description: 'Celebrate birthdays, anniversaries, and special occasions at The Anchor. Flexible venue spaces with custom catering and free parking.',
    longDescription: 'Transform your special occasion into an unforgettable celebration at The Anchor. Our versatile venue spaces can accommodate intimate gatherings of 10 or grand celebrations up to 200 guests. We offer flexible catering options from buffets to sit-down meals, full bar service, and work with your preferred vendors for decorations, entertainment, and more.',
    shortDescription: 'Perfect venue for birthdays, anniversaries & celebrations',
    image: [
      '/images/venue/function-room/the-anchor-private-party-venue-stanwell-moor.jpg',
      '/images/venue/function-room/party-setup-the-anchor.jpg'
    ],
    price: 'From 15',
    duration: 'PT5H',
    category: {
      id: 'private-events',
      name: 'Private Events',
      slug: 'private-events',
      color: '#7c3aed',
      icon: '🎉'
    },
    maximumAttendeeCapacity: 200
  }),

  quizNight: createRecurringEvent({
    id: 'monthly-quiz-night',
    slug: 'quiz-night',
    name: 'Monthly Quiz Night',
    description: 'Test your knowledge at our popular monthly quiz night. 3 entry, great prizes!',
    longDescription: 'Join us for our monthly quiz night featuring questions on general knowledge, sports, music, and more. Entry is just 3 per person, teams up to 6 people. Prizes include a 25 bar voucher for 1st place, and the 2nd from last team wins a bottle of wine!',
    shortDescription: '3 entry quiz with cash prizes',
    image: [
      '/images/events/quiz-night/the-anchor-quiz-night-stanwell-moor.jpg'
    ],
    price: '3',
    duration: 'PT3H',
    category: {
      id: 'games',
      name: 'Games & Activities',
      slug: 'games',
      color: '#3b82f6',
      icon: '🧠'
    },
    performer: {
      name: 'Question One Quiz Masters',
      type: 'Organization'
    },
    startTime: '19:00',
    endTime: '22:00',
    maximumAttendeeCapacity: 80
  }),

  bingoNight: createRecurringEvent({
    id: 'monthly-cash-bingo',
    slug: 'bingo-night',
    name: 'Monthly Cash Bingo',
    description: 'Monthly bingo night with cash prizes. 10 per book entry.',
    longDescription: 'Try your luck at our monthly cash bingo night! 10 per book gets you 10 games throughout the evening with various prizes including drinks, chocolates, vouchers, and a cash jackpot on the final game. A fun night out for all ages!',
    shortDescription: '10 per book, cash prizes',
    image: [
      '/images/events/bingo/the-anchor-bingo-night-stanwell-moor.jpg'
    ],
    price: '10',
    duration: 'PT2H',
    category: {
      id: 'games',
      name: 'Games & Activities',
      slug: 'games',
      color: '#3b82f6',
      icon: '🎱'
    },
    startTime: '19:00',
    endTime: '21:00',
    maximumAttendeeCapacity: 60
  }),

  musicBingo: createRecurringEvent({
    id: 'music-bingo-night',
    slug: 'music-bingo',
    name: 'Music Bingo Night',
    description: 'Song snippets replace numbers in this singalong bingo night with prizes.',
    longDescription: 'Join our Music Bingo nights for a high-energy twist on classic bingo. We play short song clips instead of numbers, you mark the track on your card, and prizes land every round. Expect singalong moments, themed rounds, and a friendly crowd close to Heathrow.',
    shortDescription: 'Song clips, bingo cards, prizes, and singalong fun.',
    image: [
      '/content/blog/music-bingo-nights/hero.png',
      '/content/blog/music-bingo-nights/image-1.png'
    ],
    price: '0',
    duration: 'PT3H',
    category: {
      id: 'games',
      name: 'Games & Activities',
      slug: 'games',
      color: '#3b82f6',
      icon: '🎵'
    },
    performer: {
      name: 'Nikki Manfadge',
      type: 'Person'
    },
    startTime: '19:30',
    endTime: '22:00',
    maximumAttendeeCapacity: 90
  }),

  liveMusic: createRecurringEvent({
    id: 'live-music-events',
    slug: 'live-music',
    name: 'Live Music at The Anchor',
    description: 'Live bands, acoustic sets and local talent. Free entry and great atmosphere.',
    longDescription: 'Experience the best live music near Heathrow at The Anchor. From acoustic soloists to full party bands, we host regular live music nights that get the pub jumping. Enjoy great tunes, cold pints, and a proper pub atmosphere. Entry is always free!',
    shortDescription: 'Live bands & acoustic sets. Free entry.',
    image: [
      '/images/events/live-music/the-anchor-live-music-band.jpg'
    ],
    price: '0',
    duration: 'PT3H',
    category: {
      id: 'live-music',
      name: 'Live Music',
      slug: 'live-music',
      color: '#22c55e',
      icon: '🎶'
    },
    performer: {
      name: 'Various Artists',
      type: 'MusicGroup'
    },
    startTime: '20:30',
    endTime: '23:30',
    maximumAttendeeCapacity: 150
  }),

  karaoke: createRecurringEvent({
    id: 'monthly-karaoke',
    slug: 'karaoke',
    name: 'Karaoke at The Anchor',
    description: 'Sing your heart out at our lively karaoke nights. Free entry and thousands of songs.',
    longDescription: 'Take the stage at The Anchor’s karaoke nights! Choose from thousands of songs, grab the mic, and enjoy a night of singing, laughter, and great vibes. Whether you’re a power baladeer or a rock star, everyone’s welcome to have a go. Great drinks, supportive crowd, and free entry!',
    shortDescription: 'Free entry karaoke with thousands of songs.',
    image: [
      '/images/events/karaoke/the-anchor-karaoke-night.jpg'
    ],
    price: '0',
    duration: 'PT4H',
    category: {
      id: 'entertainment',
      name: 'Entertainment',
      slug: 'entertainment',
      color: '#ec4899',
      icon: '🎤'
    },
    startTime: '20:00',
    endTime: '23:59',
    maximumAttendeeCapacity: 100
  })
}
