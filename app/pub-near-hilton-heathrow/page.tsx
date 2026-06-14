import { Metadata } from 'next'
import { HotelProximityPage, buildHotelProximityMetadata } from '@/components/features/HotelProximityPage'

const HOTEL_NAME = 'Hilton London Heathrow Airport'
const SHORT_NAME = 'Hilton'
const SLUG = 'pub-near-hilton-heathrow'

export const metadata: Metadata = buildHotelProximityMetadata({
  hotelName: HOTEL_NAME,
  slug: SLUG,
  metaName: 'Hilton',
})

export default function PubNearHiltonHeathrowPage() {
  return (
    <HotelProximityPage
      hotelName={HOTEL_NAME}
      shortName={SHORT_NAME}
      slug={SLUG}
      brandNote="in good company with the business travellers who stay here"
    />
  )
}
