import { Metadata } from 'next'
import { HotelProximityPage, buildHotelProximityMetadata } from '@/components/features/HotelProximityPage'

const HOTEL_NAME = 'Holiday Inn Heathrow'
const SHORT_NAME = 'Holiday Inn'
const SLUG = 'pub-near-holiday-inn-heathrow'

export const metadata: Metadata = buildHotelProximityMetadata({
  hotelName: HOTEL_NAME,
  slug: SLUG,
  metaName: 'Holiday Inn',
})

export default function PubNearHolidayInnHeathrowPage() {
  return (
    <HotelProximityPage
      hotelName={HOTEL_NAME}
      shortName={SHORT_NAME}
      slug={SLUG}
    />
  )
}
