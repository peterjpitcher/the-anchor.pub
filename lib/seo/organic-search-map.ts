import { HEATHROW_TIMES, DRIVE_TIMES } from '@/lib/constants'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'
export type OrganicSearchClusterKey =
  | 'planeSpotting'
  | 'heathrowDining'
  | 'heathrowParking'
  | 'pubsNearHeathrow'
  | 'beerGarden'
  | 'localPub'
  | 'events'
  | 'privateRooms'
  | 'christmas'
  | 'thingsToDo'
  | 'workspace'

export type OrganicSearchLink = {
  href: string
  label: string
  description: string
  anchor: string
}

export type OrganicSearchCluster = {
  key: OrganicSearchClusterKey
  label: string
  targetIntent: string
  primaryRoute: string
  primaryAnchor: string
  /** Sentence-case heading for readers, where the search phrase would read oddly. */
  primaryLabel: string
  /** What a reader finds on the primary page. targetIntent is an internal note and is never shown. */
  primaryDescription: string
  successEvents: string[]
  supportingRoutes: OrganicSearchLink[]
}

export const organicSearchClusters: Record<OrganicSearchClusterKey, OrganicSearchCluster> = {
  planeSpotting: {
    key: 'planeSpotting',
    label: 'Heathrow plane spotting',
    targetIntent: 'People comparing Heathrow viewing areas and looking for a comfortable plane spotting base.',
    primaryRoute: '/blog/heathrow-plane-spotting-locations',
    primaryAnchor: 'best Heathrow plane spotting locations',
    primaryLabel: "Heathrow plane spotting spots",
    primaryDescription: "Where to watch the planes around Heathrow, and what each spot is like.",
    successEvents: ['table_booking_started', 'directions_clicked', 'menu_viewed'],
    supportingRoutes: [
      {
        href: '/plane-spotting-heathrow',
        label: 'Plane spotting pub',
        description: 'Beer garden viewing, food, WiFi and free parking under the flight path.',
        anchor: 'Heathrow plane spotting pub'
      },
      {
        href: '/beer-garden',
        label: 'Beer garden views',
        description: 'Outdoor tables, dog-friendly seating and aircraft overhead.',
        anchor: 'beer garden near Heathrow for plane spotting'
      },
      {
        href: '/food-menu',
        label: 'Food while spotting',
        description: 'Live food menu before, during or after a spotting session.',
        anchor: 'pub food near Heathrow plane spotting spots'
      }
    ]
  },
  heathrowDining: {
    key: 'heathrowDining',
    label: 'Restaurants and food near Heathrow',
    targetIntent: 'Travellers and locals comparing where to eat near Heathrow before flights, after arrivals or during layovers.',
    primaryRoute: '/restaurants-near-heathrow',
    primaryAnchor: 'where to eat near Heathrow',
    primaryLabel: "Where to eat near Heathrow",
    primaryDescription: "Where to eat near the airport before a flight, after you land or on a layover.",
    successEvents: ['table_booking_started', 'menu_viewed', 'directions_clicked'],
    supportingRoutes: [
      {
        href: '/food-menu',
        label: 'Live food menu',
        description: 'Current dishes, prices, kitchen status and dietary options.',
        anchor: 'pub food menu near Heathrow'
      },
      {
        href: '/heathrow-layover-dining',
        label: 'Layover dining plan',
        description: 'Timed meal plans for 90-minute and 3-hour Heathrow layovers.',
        anchor: 'Heathrow layover dining guide'
      },
      {
        href: '/sunday-roast',
        label: 'Sunday roast',
        description: 'Traditional roast dinners near Heathrow and Staines.',
        anchor: 'Sunday roast near Heathrow'
      }
    ]
  },
  heathrowParking: {
    key: 'heathrowParking',
    label: 'Cheap Heathrow parking',
    targetIntent: 'Drivers comparing cheaper off-airport parking with official Heathrow parking.',
    primaryRoute: '/heathrow-parking',
    primaryAnchor: 'cheap Heathrow parking from The Anchor',
    primaryLabel: "Heathrow parking at The Anchor",
    primaryDescription: "Leave your car with us while you fly. Prices and booking are on the page.",
    successEvents: ['parking_booking_started', 'parking_booking_completed', 'call_clicked'],
    supportingRoutes: [
      {
        href: '/blog/cheap-heathrow-parking-alternatives',
        label: 'Parking comparison guide',
        description: 'Compare official, meet-and-greet, hotel and local parking options.',
        anchor: 'cheap Heathrow parking alternatives'
      },
      {
        href: '/heathrow-parking/terminal-5',
        label: 'Terminal 5 parking',
        description: 'T5 transfer times, taxi notes and off-airport pricing.',
        anchor: 'cheap Heathrow Terminal 5 parking'
      },
      {
        href: '/find-us',
        label: 'Directions and postcode',
        description: 'Use TW19 6AQ for The Anchor parking and transfers.',
        anchor: 'directions to Heathrow parking at The Anchor'
      }
    ]
  },
  pubsNearHeathrow: {
    key: 'pubsNearHeathrow',
    label: 'Pubs near Heathrow',
    targetIntent: 'People looking for a real pub close to Heathrow terminals and hotels.',
    primaryRoute: '/near-heathrow',
    primaryAnchor: 'pub near Heathrow Airport',
    primaryLabel: "A pub near Heathrow",
    primaryDescription: "How to reach us from each terminal, and what you'll find when you get here.",
    successEvents: ['table_booking_started', 'call_clicked', 'directions_clicked'],
    supportingRoutes: [
      {
        href: '/near-heathrow/terminal-5',
        label: 'Terminal 5 pub',
        description: 'Seven-minute T5 taxi route, food and free customer parking.',
        anchor: 'pub near Heathrow Terminal 5'
      },
      {
        href: '/heathrow-hotels-pub',
        label: 'Hotel guest pub',
        description: 'A pub alternative to hotel bars near Heathrow.',
        anchor: 'pub near Heathrow hotels'
      },
      {
        href: '/find-us',
        label: 'Directions',
        description: 'Taxi, bus and driving directions from every terminal.',
        anchor: 'directions to a pub near Heathrow'
      }
    ]
  },
  beerGarden: {
    key: 'beerGarden',
    label: 'Beer garden near Heathrow',
    targetIntent: 'People looking for outdoor pub seating, dog-friendly garden space and aircraft views near Heathrow.',
    primaryRoute: '/beer-garden',
    primaryAnchor: 'beer garden near Heathrow',
    primaryLabel: "Our beer garden",
    primaryDescription: "Outdoor tables under the flight path, with dogs welcome on a lead.",
    successEvents: ['table_booking_started', 'directions_clicked', 'menu_viewed'],
    supportingRoutes: [
      {
        href: '/plane-spotting-heathrow',
        label: 'Plane spotting pub',
        description: 'Watch aircraft from a pub table under the flight path.',
        anchor: 'Heathrow plane spotting beer garden'
      },
      {
        href: '/food-menu',
        label: 'Garden food',
        description: 'Food, pizza, Sunday roast and drinks served during kitchen hours.',
        anchor: 'outdoor pub food near Heathrow'
      },
      {
        href: '/dog-friendly-pub-heathrow',
        label: 'Dog-friendly pub',
        description: 'Dogs welcome throughout the pub, on a lead, with water bowls and biscuits.',
        anchor: 'dog-friendly pub garden near Heathrow'
      }
    ]
  },
  localPub: {
    key: 'localPub',
    label: 'Local pub searches',
    targetIntent: 'Nearby village and town searches for Staines, Stanwell, Ashford, Feltham and surrounding areas.',
    primaryRoute: '/staines-pub',
    primaryAnchor: 'pub near Staines',
    primaryLabel: "A pub near Staines",
    primaryDescription: `${DRIVE_TIMES.staines} minutes from Staines by car, with free parking.`,
    successEvents: ['table_booking_started', 'directions_clicked', 'call_clicked'],
    supportingRoutes: [
      {
        href: '/stanwell-pub',
        label: 'Stanwell pub',
        description: 'Your local in Stanwell Moor with food, events and free parking.',
        anchor: 'Stanwell Moor pub'
      },
      {
        href: '/pubs-in-stanwell',
        label: 'Pubs in Stanwell',
        description: 'Local pub guide for Stanwell and Stanwell Moor.',
        anchor: 'pubs in Stanwell'
      },
      {
        href: '/find-us',
        label: 'Find us',
        description: 'Horton Road, Stanwell Moor, TW19 6AQ.',
        anchor: 'The Anchor Stanwell Moor directions'
      }
    ]
  },
  events: {
    key: 'events',
    label: 'Events and live sport',
    targetIntent: 'People looking for pub events, quiz nights, bingo, karaoke and major sport near Heathrow.',
    primaryRoute: '/whats-on',
    primaryAnchor: "what's on near Heathrow",
    primaryLabel: "What's on",
    primaryDescription: "Quiz nights, bingo and the rest of the diary, with dates and prices.",
    successEvents: ['event_booking_started', 'table_booking_started', 'call_clicked'],
    supportingRoutes: [
      {
        href: '/live-sport',
        label: 'Live sport',
        description: 'Major free-to-air sport on pub screens with food and drinks.',
        anchor: 'live sport pub near Heathrow'
      },
      {
        href: '/quiz-night',
        label: 'Quiz night',
        description: 'Monthly pub quiz with prizes and table bookings.',
        anchor: 'quiz night near Heathrow'
      },
      {
        href: '/music-bingo',
        label: 'Music Bingo',
        description: 'Hosted song-clip bingo nights with Nikki Manfadge.',
        anchor: 'Music Bingo near Heathrow'
      }
    ]
  },
  privateRooms: {
    key: 'privateRooms',
    label: 'Private rooms and hire',
    targetIntent: 'People searching for private rooms, party venues and event spaces near Staines and Heathrow.',
    primaryRoute: '/private-hire',
    primaryAnchor: 'private rooms near Staines and Heathrow',
    primaryLabel: "Private hire",
    primaryDescription: "The spaces you can hire, the hourly rates and an instant estimate.",
    successEvents: ['private_hire_enquiry_started', 'call_clicked'],
    supportingRoutes: [
      {
        href: '/private-hire/wakes',
        label: 'Wakes and memorials',
        description: 'A quiet private room near local crematoriums, with a private entrance area.',
        anchor: 'wake venue near Heathrow'
      },
      {
        href: '/private-hire/milestone-birthdays',
        label: 'Birthday parties',
        description: 'Milestone birthdays and celebrations with food, drinks and free parking.',
        anchor: 'birthday party venue near Staines'
      },
      {
        href: '/corporate-events',
        label: 'Corporate events',
        description: 'Team meals, work events and airport business gatherings.',
        anchor: 'corporate event venue near Heathrow'
      }
    ]
  },
  christmas: {
    key: 'christmas',
    label: 'Christmas parties near Heathrow',
    targetIntent: 'Organisers planning a work or family Christmas meal near Heathrow, Staines and Stanwell Moor.',
    primaryRoute: '/christmas-parties',
    primaryAnchor: 'Christmas party venue near Heathrow',
    primaryLabel: "Christmas at The Anchor",
    primaryDescription: "The Christmas menu, the dates and how to book your group.",
    successEvents: ['christmas_enquiry', 'table_booking_started', 'call_clicked'],
    supportingRoutes: [
      {
        href: '/corporate-events',
        label: 'Work Christmas parties',
        description: `Office parties, team meals and business events around ${HEATHROW_TIMES.terminal5} minutes from Terminal 5.`,
        anchor: 'work Christmas party venue near Heathrow'
      },
      {
        href: '/private-hire',
        label: 'Private hire',
        description: `Hire the dining room or beer garden for a festive gathering, ${PRIVATE_HIRE_CAPACITY.recommendedRange}.`,
        anchor: 'private room hire for a Christmas party'
      },
      {
        href: '/food-menu',
        label: 'Everyday menu',
        description: 'The regular pub menu with live prices, for visits outside the festive service window.',
        anchor: 'pub food near Heathrow all year round'
      },
      {
        href: '/whats-on',
        label: "What's on",
        description: 'Live listings for quiz nights, Music Bingo and everything else in the diary.',
        anchor: "what's on at The Anchor this season"
      }
    ]
  },
  thingsToDo: {
    key: 'thingsToDo',
    label: 'Things to do near Heathrow',
    targetIntent: 'Travellers and local visitors looking for useful activities near Heathrow during a layover or before a flight.',
    primaryRoute: '/blog/things-to-do-near-heathrow',
    primaryAnchor: 'things to do near Heathrow Airport',
    primaryLabel: "Things to do near Heathrow",
    primaryDescription: "Ideas for a layover or a spare few hours near the airport.",
    successEvents: ['table_booking_started', 'directions_clicked', 'menu_viewed'],
    supportingRoutes: [
      {
        href: '/plane-spotting-heathrow',
        label: 'Plane spotting',
        description: `Watch aircraft from the beer garden around ${HEATHROW_TIMES.terminal5} minutes from Terminal 5.`,
        anchor: 'Heathrow plane spotting'
      },
      {
        href: '/heathrow-layover-dining',
        label: 'Layover dining',
        description: 'Plan enough time for a meal away from the terminal and a safe return.',
        anchor: 'what to do on a Heathrow layover'
      },
      {
        href: '/luggage-storage-heathrow',
        label: 'Luggage storage',
        description: 'Store bags while you eat, visit locally or wait for a flight.',
        anchor: 'luggage storage near Heathrow'
      }
    ]
  },
  workspace: {
    key: 'workspace',
    label: 'Workspace near Heathrow',
    targetIntent: 'Travellers, crews and remote workers searching for somewhere to work near Heathrow with WiFi and food.',
    primaryRoute: '/near-heathrow',
    primaryAnchor: 'workspace near Heathrow Airport',
    primaryLabel: "Getting here from Heathrow",
    primaryDescription: "How to reach us from each terminal.",
    successEvents: ['table_booking_started', 'directions_clicked', 'menu_viewed'],
    supportingRoutes: [
      {
        href: '/food-menu',
        label: 'Work lunch menu',
        description: 'Coffee, lunch, pizza and pub classics while you work.',
        anchor: 'work lunch near Heathrow'
      },
      {
        href: '/find-us',
        label: 'Directions',
        description: 'Reach us by taxi, bus or car from every terminal.',
        anchor: 'workspace near Heathrow directions'
      },
      {
        href: '/book-table',
        label: 'Book a table',
        description: 'Reserve a quieter table for lunch, work or a pre-flight stop.',
        anchor: 'book a workspace table near Heathrow'
      }
    ]
  }
}

export function getOrganicSearchCluster(key: OrganicSearchClusterKey): OrganicSearchCluster {
  return organicSearchClusters[key]
}
