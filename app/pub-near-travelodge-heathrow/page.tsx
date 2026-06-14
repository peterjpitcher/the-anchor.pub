import { Metadata } from 'next'
import { HotelProximityPage, buildHotelProximityMetadata } from '@/components/features/HotelProximityPage'

const HOTEL_NAME = 'Travelodge London Heathrow'
const SHORT_NAME = 'Travelodge'
const SLUG = 'pub-near-travelodge-heathrow'

export const metadata: Metadata = buildHotelProximityMetadata({
  hotelName: HOTEL_NAME,
  slug: SLUG,
  metaName: 'Travelodge',
})

export default function PubNearTravelodgeHeathrowPage() {
  return (
    <HotelProximityPage
      hotelName={HOTEL_NAME}
      shortName={SHORT_NAME}
      slug={SLUG}
      brandNote="staying somewhere great value"
    />
  )
}
