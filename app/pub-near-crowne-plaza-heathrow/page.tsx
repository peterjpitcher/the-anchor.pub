import { Metadata } from 'next'
import { HotelProximityPage, buildHotelProximityMetadata } from '@/components/features/HotelProximityPage'

const HOTEL_NAME = 'Crowne Plaza London Heathrow'
const SHORT_NAME = 'Crowne Plaza'
const SLUG = 'pub-near-crowne-plaza-heathrow'

export const metadata: Metadata = buildHotelProximityMetadata({
  hotelName: HOTEL_NAME,
  slug: SLUG,
  metaName: 'Crowne Plaza',
})

export default function PubNearCrownePlazaHeathrowPage() {
  return (
    <HotelProximityPage
      hotelName={HOTEL_NAME}
      shortName={SHORT_NAME}
      slug={SLUG}
      brandNote="in good company with the business travellers who stay here"
    />
  )
}
