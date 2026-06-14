import { Metadata } from 'next'
import { HotelProximityPage, buildHotelProximityMetadata } from '@/components/features/HotelProximityPage'

const HOTEL_NAME = 'Premier Inn Heathrow'
const SHORT_NAME = 'Premier Inn'
const SLUG = 'pub-near-premier-inn-heathrow'

export const metadata: Metadata = buildHotelProximityMetadata({
  hotelName: HOTEL_NAME,
  slug: SLUG,
  metaName: 'Premier Inn',
})

export default function PubNearPremierInnHeathrowPage() {
  return (
    <HotelProximityPage
      hotelName={HOTEL_NAME}
      shortName={SHORT_NAME}
      slug={SLUG}
      brandNote="staying somewhere great value"
    />
  )
}
