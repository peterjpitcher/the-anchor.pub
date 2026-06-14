import { Metadata } from 'next'
import { HotelProximityPage, buildHotelProximityMetadata } from '@/components/features/HotelProximityPage'

const HOTEL_NAME = 'Sofitel London Heathrow'
const SHORT_NAME = 'Sofitel'
const SLUG = 'pub-near-sofitel-heathrow'

export const metadata: Metadata = buildHotelProximityMetadata({
  hotelName: HOTEL_NAME,
  slug: SLUG,
  metaName: 'Sofitel',
})

export default function PubNearSofitelHeathrowPage() {
  return (
    <HotelProximityPage
      hotelName={HOTEL_NAME}
      shortName={SHORT_NAME}
      slug={SLUG}
      brandNote="right by Terminal 5"
    />
  )
}
