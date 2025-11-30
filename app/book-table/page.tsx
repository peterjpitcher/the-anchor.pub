import type { Metadata } from 'next'
import Link from 'next/link'
import { BookingWizard } from '@/components/features/BookingWizard'
import { HeroWrapper } from '@/components/hero/HeroWrapper'
import { Section, Button } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { PhoneButton } from '@/components/PhoneButton'
import { getAvailabilityForNext30Days } from '@/lib/booking-helpers'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getUpcomingEvents, getEventShortDescription } from '@/lib/api'
import type { EventsByDate, DateEventSummary } from '@/components/features/BookingWizard/types'

export const metadata: Metadata = {
  title: 'Book a Table Online | The Anchor - Heathrow Pub & Dining',
  description: 'Book your table at The Anchor in just 2 minutes. Simple booking for our restaurant, Sunday roasts, and special events.',
  keywords: 'book table stanwell moor, restaurant booking, pub reservation, sunday lunch booking',
  openGraph: {
    title: 'Book a Table at The Anchor',
    description: 'Quick and easy table booking. Sunday roasts, regular dining, and special events.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }
}

export default async function BookPage({
  searchParams
}: {
  searchParams: { step?: string; date?: string; type?: string }
}) {
  // Pre-load availability data on server
  const [availabilityData, upcomingEvents] = await Promise.all([
    getAvailabilityForNext30Days(),
    getUpcomingEvents(50)
  ])
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startIso = today.toISOString().split('T')[0]
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 30)
  const endIso = endDate.toISOString().split('T')[0]
  
  const eventsByDate: EventsByDate = upcomingEvents
    .filter(event => {
      if (!event.startDate) {
        return false
      }
      
      const start = new Date(event.startDate)
      if (Number.isNaN(start.getTime())) {
        return false
      }
      
      const eventIso = start.toISOString().split('T')[0]
      return eventIso >= startIso && eventIso <= endIso
    })
    .reduce<EventsByDate>((acc, event) => {
      const start = new Date(event.startDate)
      const eventIso = start.toISOString().split('T')[0]
      
      const eventPath = event.slug ? `/events/${event.slug}` : `/events/${event.id}`

      const summary: DateEventSummary = {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        slug: event.slug,
        url: eventPath,
        shortDescription: getEventShortDescription(event, 200)
      }
      
      if (!acc[eventIso]) {
        acc[eventIso] = [summary]
      } else {
        acc[eventIso] = [...acc[eventIso], summary].sort((a, b) => {
          const aTime = new Date(a.startDate).getTime()
          const bTime = new Date(b.startDate).getTime()
          return aTime - bTime
        })
      }
      
      return acc
    }, {})
  
  // Determine initial step from URL params (for direct linking)
  const initialStep = parseInt(searchParams.step || '1', 10)
  const preselectedDate = searchParams.date
  const bookingType = searchParams.type as 'regular' | 'sunday_lunch' | undefined
  
  return (
    <>
      {/* Schema.org markup for AI agents */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FoodEstablishmentReservation",
            "reservationFor": {
              "@type": "FoodEstablishment",
              "name": "The Anchor",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "High Street",
                "addressLocality": "Stanwell Moor",
                "postalCode": "TW19 6AB"
              }
            },
            "url": "https://www.the-anchor.pub/book",
            "potentialAction": {
              "@type": "ReserveAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.the-anchor.pub/api/booking/agent",
                "httpMethod": "POST",
                "encodingType": "application/json"
              },
              "result": {
                "@type": "FoodEstablishmentReservation"
              }
            }
          })
        }}
      />
      {/* Main Booking Wizard Component */}
      <HeroWrapper
        route="/book-table"
        title="Book a Table at The Anchor"
        description="Reserve your spot for Sunday lunch, family meals, or pre-flight dining in under two minutes."
        variant="default"
        statusBarPosition="above"
        primaryCta={
          <PhoneButton
            phone="01753 682707"
            source="book_table_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            📞 Prefer to call? 01753 682707
          </PhoneButton>
        }
        secondaryCta={
          <Link href="/food-menu" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" fullWidth>
              🍽️ Browse Menu
            </Button>
          </Link>
        }
      />

      <Section spacing="md" container containerSize="md" className="text-center">
        <PageTitle className="text-anchor-green" seo={{ structured: true, speakable: true }}>
          Easy Online Reservations
        </PageTitle>
        <p className="mt-4 text-lg text-gray-700">
          Choose your date, confirm your party size, and let us know any requirements. We’ll send confirmation straight away.
        </p>
      </Section>

      <Section background="gray" spacing="lg" container containerSize="lg">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)] items-start">
          <div className="order-1">
            {/* Hidden form for AI agents - progressive enhancement approach */}
            <noscript>
              <div className="max-w-2xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Book a Table</h1>
                <form action="/api/booking/submit" method="POST" className="space-y-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="party_size" className="block text-sm font-medium mb-1">
                      Number of People
                    </label>
                    <input
                      type="number"
                      id="party_size"
                      name="party_size"
                      min="1"
                      max="20"
                      required
                      defaultValue="2"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium mb-1">
                      Time
                    </label>
                    <select id="time" name="time" required className="w-full p-2 border rounded">
                      <option value="">Select a time</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="12:30">12:30 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="13:30">1:30 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="14:30">2:30 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="15:30">3:30 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="16:30">4:30 PM</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="17:30">5:30 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="18:30">6:30 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="19:30">7:30 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="20:30">8:30 PM</option>
                      <option value="21:00">9:00 PM</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      required
                      autoComplete="given-name"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      required
                      autoComplete="family-name"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      autoComplete="tel"
                      pattern="[0-9+\-\s]+"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      autoComplete="email"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="special_requirements" className="block text-sm font-medium mb-1">
                      Special Requirements (optional)
                    </label>
                    <textarea
                      id="special_requirements"
                      name="special_requirements"
                      rows={3}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-anchor-green text-white py-3 px-6 rounded font-medium hover:bg-anchor-green-dark"
                  >
                    Book Table
                  </button>
                </form>
              </div>
            </noscript>

            {/* AI Agent Helper Form - Hidden but parseable */}
            <div 
              data-ai-booking-form="true" 
              style={{ position: 'absolute', left: '-9999px' }}
              aria-hidden="true"
            >
              <form id="ai-booking-helper">
                <input type="text" name="ai_date" data-accepts="natural-language" placeholder="tomorrow, next Sunday, January 15" />
                <input type="number" name="ai_party_size" min="1" max="20" />
                <select name="ai_time" data-availability="preloaded">
                  {/* Times will be populated based on availability */}
                </select>
                <input type="text" name="ai_booking_type" data-options="regular,sunday_lunch" />
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <BookingWizard
                availabilityData={availabilityData}
                eventsByDate={eventsByDate}
                initialStep={initialStep}
                preselectedDate={preselectedDate}
                bookingType={bookingType}
                className="rounded-2xl"
              />
            </div>
          </div>

          <aside className="order-2 lg:order-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-anchor-green mb-3">
                Quick Tips
              </h2>
              <ul className="space-y-2 text-sm text-gray-700 text-left">
                <li>• Arrive a few minutes early so we can seat your whole party together.</li>
                <li>• Let us know about access needs or allergies in the final step.</li>
                <li>• Sunday Roast? Select the Sunday option when prompted to pre-book roasts.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-anchor-green mb-3">
                Prefer to Talk?
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                Our team can help with tables of 8+, special celebrations, or last-minute changes.
              </p>
              <PhoneButton
                phone="01753 682707"
                source="book_table_sidebar"
                variant="secondary"
                className="w-full"
              >
                📞 Call 01753 682707
              </PhoneButton>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-anchor-green mb-3">
                Useful to Know
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 text-left">
                <li>• 20 free parking spaces on site.</li>
                <li>• Dog friendly inside and out.</li>
                <li>• Step-free access from the car park.</li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>

    </>
  )
}
