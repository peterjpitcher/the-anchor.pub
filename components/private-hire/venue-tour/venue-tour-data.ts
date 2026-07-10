import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'

export const VENUE_TOUR_SPACE_SESSION_KEY = 'anchor-private-hire-selected-space'
export const VENUE_TOUR_SPACE_SELECTED_EVENT = 'anchor:venue-tour-space-selected'

export const VENUE_TOUR_EVENT_TYPES = [
  'Birthday Party',
  'Wake / Memorial',
  'Christening / Baby Shower',
  'Corporate Event',
  'Retirement Party',
  'Christmas Party',
  'Other',
] as const

export type VenueTourEventType = (typeof VENUE_TOUR_EVENT_TYPES)[number]

export const VENUE_TOUR_SPACES = [
  {
    id: 'dining-room',
    estimatorNames: ['The Dining Room', 'Dining Room'],
    number: 1,
    name: 'Dining room',
    position: { left: 50, top: 34 },
    image: '/images/our-pub/the-anchor-dining-room-interior.jpg',
    imageAlt: 'The Anchor dining room set with tables and warm lighting',
    capacity: `${PRIVATE_HIRE_CAPACITY.spaces.diningRoom.seated} seated, up to ${PRIVATE_HIRE_CAPACITY.spaces.diningRoom.standing} standing`,
    description:
      'A bright, self-contained room for dinners, celebrations, wakes and meetings, with full access to the main bar.',
    features: [
      'Private use of the room',
      'French doors open onto the beer garden',
      'TV available for presentations or live events',
    ],
  },
  {
    id: 'beer-garden',
    estimatorNames: ['Outdoor Terrace/Garden', 'Beer Garden', 'Garden and Terrace'],
    number: 2,
    name: 'Beer garden',
    position: { left: 19, top: 25 },
    image: '/images/our-pub/the-anchor-beer-garden-heathrow.jpg',
    imageAlt: 'The Anchor beer garden with outdoor tables under the Heathrow flight path',
    capacity: `${PRIVATE_HIRE_CAPACITY.spaces.gardenTerrace.seated} seated, larger events by enquiry`,
    description:
      'An open-air space with plenty of tables, direct access from the dining room and a memorable view of planes passing overhead.',
    features: [
      'Direct access from the dining room',
      'Free WiFi throughout the garden',
      'Outdoor hire and event layouts by enquiry',
    ],
  },
] as const

export type VenueTourSpace = (typeof VENUE_TOUR_SPACES)[number]
export type VenueTourSpaceId = VenueTourSpace['id']

export interface VenueTourPhoto {
  id: string
  title: string
  position: { left: number; top: number }
  image: string
  imageAlt: string
  description: string
  spaceId?: VenueTourSpaceId
}

export const VENUE_TOUR_PHOTOS = [
  {
    id: 'garden-view',
    title: 'The beer garden',
    position: { left: 9, top: 12 },
    image: '/images/our-pub/the-anchor-beer-garden-heathrow.jpg',
    imageAlt: 'Outdoor tables in The Anchor beer garden',
    description: 'Outdoor tables and the garden beneath Heathrow\'s flight path.',
    spaceId: 'beer-garden',
  },
  {
    id: 'dining-room-view',
    title: 'Inside the dining room',
    position: { left: 50, top: 17 },
    image: '/images/our-pub/the-anchor-dining-room-interior.jpg',
    imageAlt: 'The Anchor dining room interior with warm lighting and table settings',
    description: 'A bright private room set up for dining, meetings and celebrations.',
    spaceId: 'dining-room',
  },
  {
    id: 'main-bar-view',
    title: 'The main bar',
    position: { left: 52, top: 80 },
    image: '/images/our-pub/the-anchor-main-bar-area.jpg',
    imageAlt: 'The main bar area at The Anchor in Stanwell Moor',
    description: 'The main bar and trade area at the centre of the pub.',
  },
  {
    id: 'pool-area-view',
    title: 'The pool table area',
    position: { left: 58, top: 68 },
    image: '/images/our-pub/the-anchor-pool-table.jpg',
    imageAlt: 'The pool table area at The Anchor pub',
    description: 'The games area beside the pool table and bay windows.',
  },
] as const satisfies readonly VenueTourPhoto[]

export function isVenueTourSpaceId(value: unknown): value is VenueTourSpaceId {
  return typeof value === 'string' && VENUE_TOUR_SPACES.some((space) => space.id === value)
}

export function isVenueTourEventType(value: unknown): value is VenueTourEventType {
  return typeof value === 'string' && VENUE_TOUR_EVENT_TYPES.some((eventType) => eventType === value)
}

export function getVenueTourSpace(spaceId?: string) {
  return VENUE_TOUR_SPACES.find((space) => space.id === spaceId) ?? VENUE_TOUR_SPACES[0]
}

function buildQuery(spaceId?: VenueTourSpaceId, eventType?: VenueTourEventType) {
  const params = new URLSearchParams()
  if (spaceId) params.set('space', spaceId)
  if (eventType) params.set('event', eventType)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function getVenueTourHref(
  spaceId?: VenueTourSpaceId,
  eventType?: VenueTourEventType
) {
  return `/private-hire/venue-tour${buildQuery(spaceId, eventType)}#venue-map`
}

export function getPrivateHireEnquiryHref(
  spaceId?: VenueTourSpaceId,
  eventType?: VenueTourEventType
) {
  return `/private-hire${buildQuery(spaceId, eventType)}#enquiry`
}

export function getEstimatorSpaceNames(spaceId?: VenueTourSpaceId) {
  return spaceId
    ? VENUE_TOUR_SPACES.find((space) => space.id === spaceId)?.estimatorNames ?? []
    : []
}

export function findEstimatorSpaceForTour<T extends { name: string }>(
  spaces: readonly T[],
  spaceId?: VenueTourSpaceId
) {
  const names = getEstimatorSpaceNames(spaceId).map((name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '')
  )
  return spaces.find((space) =>
    names.includes(space.name.toLowerCase().replace(/[^a-z0-9]+/g, ''))
  )
}

export function getVenueTourSpaceIdForEstimatorName(name?: string) {
  if (!name) return undefined
  const normalisedName = name.toLowerCase().replace(/[^a-z0-9]+/g, '')
  return VENUE_TOUR_SPACES.find((space) =>
    space.estimatorNames.some(
      (candidate) => candidate.toLowerCase().replace(/[^a-z0-9]+/g, '') === normalisedName
    )
  )?.id
}
