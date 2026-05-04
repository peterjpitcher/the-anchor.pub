export type OrganicSearchClusterKey =
  | 'planeSpotting'
  | 'heathrowDining'
  | 'heathrowParking'
  | 'pubsNearHeathrow'
  | 'beerGarden'
  | 'localPub'
  | 'events'
  | 'privateRooms'
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
        href: '/sunday-lunch',
        label: 'Sunday lunch',
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
        description: 'Dogs welcome in the garden with water bowls available.',
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
    successEvents: ['private_hire_enquiry_started', 'call_clicked'],
    supportingRoutes: [
      {
        href: '/function-room-hire',
        label: 'Function room hire',
        description: 'Room bookings for celebrations, wakes and company events.',
        anchor: 'function room hire near Heathrow'
      },
      {
        href: '/private-party-venue',
        label: 'Party venue',
        description: 'Birthday parties, milestone celebrations and late licence options.',
        anchor: 'party venue near Staines'
      },
      {
        href: '/corporate-events',
        label: 'Corporate events',
        description: 'Team meals, work events and airport business gatherings.',
        anchor: 'corporate event venue near Heathrow'
      }
    ]
  },
  workspace: {
    key: 'workspace',
    label: 'Workspace near Heathrow',
    targetIntent: 'Travellers, crews and remote workers searching for somewhere to work near Heathrow with WiFi and food.',
    primaryRoute: '/near-heathrow',
    primaryAnchor: 'workspace near Heathrow Airport',
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
