import { Metadata } from 'next'
import { HotelProximityPage, buildHotelProximityMetadata } from '@/components/features/HotelProximityPage'

const HOTEL_NAME = 'Radisson Blu Edwardian Heathrow'
const SHORT_NAME = 'Radisson Blu'
const SLUG = 'pub-near-radisson-blu-heathrow'

export const metadata: Metadata = buildHotelProximityMetadata({
  hotelName: HOTEL_NAME,
  slug: SLUG,
  metaName: 'Radisson Blu',
})

export default function PubNearRadissonBluHeathrowPage() {
  return (
    <HotelProximityPage
      hotelName={HOTEL_NAME}
      shortName={SHORT_NAME}
      slug={SLUG}
    />
  )
}
