import { Metadata } from 'next'
import { HotelProximityPage, buildHotelProximityMetadata } from '@/components/features/HotelProximityPage'

const HOTEL_NAME = 'Novotel London Heathrow'
const SHORT_NAME = 'Novotel'
const SLUG = 'pub-near-novotel-heathrow'

export const metadata: Metadata = buildHotelProximityMetadata({
  hotelName: HOTEL_NAME,
  slug: SLUG,
  metaName: 'Novotel',
})

export default function PubNearNovotelHeathrowPage() {
  return (
    <HotelProximityPage
      hotelName={HOTEL_NAME}
      shortName={SHORT_NAME}
      slug={SLUG}
    />
  )
}
