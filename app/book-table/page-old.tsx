import type { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero'
import { Container } from '@/components/ui/layout/Container'
import { Section } from '@/components/ui/layout/Section'
import { Card, CardBody } from '@/components/ui/layout/Card'
import TableBookingForm from '@/components/features/TableBooking/TableBookingForm'
import SundayLunchBookingForm from '@/components/features/TableBooking/SundayLunchBookingForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/Tabs'
import { Icon } from '@/components/ui/Icon'
import { PhoneLink } from '@/components/PhoneLink'
import { Alert } from '@/components/ui/feedback/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Badge } from '@/components/ui/primitives/Badge'
import ScrollDepthTracker from '@/components/tracking/ScrollDepthTracker'
import { InfoBoxGrid } from '@/components/ui'
import { SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'

export const metadata: Metadata = {
  title: 'Book a Table | The Anchor - Heathrow Pub & Dining',
  description: 'Book your table at The Anchor - Heathrow Pub & Dining. Reserve your spot for our delicious food, Sunday roasts, or special events. Easy online booking with instant confirmation.',
  openGraph: {
    title: 'Book a Table at The Anchor',
    description: 'Reserve your table for great food and drinks at The Anchor - Heathrow Pub & Dining. Online booking available.',
    images: [DEFAULT_PAGE_HEADER_IMAGE]
  }
}

export default function BookTablePage({
  searchParams
}: {
  searchParams: { tab?: string }
}) {
  const defaultTab = searchParams.tab === 'sunday' ? 'sunday' : 'regular'
  
  return (
    <>
      <ScrollDepthTracker />
      
      <HeroWrapper
        route="/book-table"
        variant="default"
        title="Book a Table"
        description="Reserve your spot for great food and drinks"
        image={{
          src: DEFAULT_PAGE_HEADER_IMAGE,
          alt: 'The Anchor entrance with warm lighting and traditional British pub signage',
          priority: true
        }}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Booking' }
        ]}
        tags={[
          { label: 'Easy Online Booking', icon: '', size: 'small' },
          { label: 'Instant Confirmation', icon: '', size: 'small' },
          { label: 'Sunday Roasts', icon: '', size: 'small' }
        ]}
      />

      <Section className="py-8 md:py-12">
        <Container>
          {/* Booking tabs */}
          <div className="w-full md:max-w-3xl md:mx-auto">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="regular">
                  <Icon name="calendar" className="mr-2 h-4 w-4" />
                  Regular Booking
                </TabsTrigger>
                <TabsTrigger value="sunday">
                  <Icon name="utensils" className="mr-2 h-4 w-4" />
                  Sunday Roast
                </TabsTrigger>
              </TabsList>

              <TabsContent value="regular" className="space-y-6">
                <Alert variant="info">
                  <Icon name="info" className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Walk-ins always welcome!</p>
                    <p className="text-sm mt-1">
                      Can't find the time you want? Just pop in - we always try to accommodate walk-ins.
                    </p>
                  </div>
                </Alert>

                <TableBookingForm />

                <div className="text-center text-sm text-muted-foreground">
                  <p>For groups larger than 20, please call us on{' '}
                    <PhoneLink
                      phone="01753682707"
                      source="booking_page_large_group"
                      className="text-primary hover:text-primary-dark underline"
                      showIcon={false}
                    >
                      01753 682707
                    </PhoneLink>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="sunday" className="space-y-6">
	                <div className="text-center mb-8">
	                  <Badge variant="warning" size="lg" className="mb-4">
	                    Pre-Order Required
	                  </Badge>
	                  <h3 className="text-xl font-semibold mb-2">Traditional Sunday Roast</h3>
	                  <p className="text-muted-foreground mb-4">
	                    Enjoy our famous Sunday roasts - freshly prepared and served with all the trimmings
	                  </p>
		                  <p className="text-sm text-muted-foreground">
		                    Pre-order by 1pm Saturday. Sunday lunch bookings require a £{SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP} per person deposit, deducted from your final bill.
		                  </p>
		                </div>

                <SundayLunchBookingForm />

                <Alert variant="info" className="mt-6">
                  <Icon name="info" className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Can't pre-order?</p>
                    <p className="text-sm mt-1">
                      Our regular menu is also available on Sundays without pre-order.
                    </p>
                  </div>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>

          {/* Additional information */}
          <div className="mt-8 border-t pt-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">Booking Information</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Icon name="info" className="mr-2 h-5 w-5 text-primary" />
                    Good to Know
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Tables are held for 15 minutes</li>
                    <li>• Kitchen hours vary by day</li>
                    <li>• No food service on Mondays</li>
                    <li>• 20 free parking spaces</li>
                    <li>• Dogs welcome throughout</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Icon name="users" className="mr-2 h-5 w-5 text-primary" />
                    Groups & Events
                  </h3>
	                  <ul className="space-y-2 text-sm text-muted-foreground">
	                    <li>• Private hire: minimum 30 people</li>
	                    <li>• Corporate functions: minimum 15 people</li>
	                    <li>• £250 deposit required</li>
	                    <li>• Buffets, sit-down meals & canapés</li>
	                    <li>• Contact us for pricing</li>
	                  </ul>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Planning a special event or need a private space?
                </p>
                <a href="/private-party-venue">
                  <Button variant="outline" size="lg" className="w-auto inline-flex items-center whitespace-nowrap">
                    <Icon name="sparkles" className="mr-2 flex-shrink-0" />
                    <span className="whitespace-nowrap">View Private Hire</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
          
          {/* Info Cards - Opening Hours, Kitchen Hours, Need Help */}
          <div className="mt-8 max-w-5xl mx-auto">
            <InfoBoxGrid
              columns={3}
              boxes={[
                {
                  title: "Opening Hours",
                  content: (
                    <>
                      <p className="font-medium mb-2">Bar Opening Times:</p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>Mon-Thu: 3pm-11pm</li>
                        <li>Friday: 12pm-12am</li>
                        <li>Saturday: 12pm-12am</li>
                        <li>Sunday: 12pm-10pm</li>
                      </ul>
                      <p className="text-sm text-gray-600 mt-3 italic">Live hours shown in header</p>
                    </>
                  ),
                  variant: "colored",
                  color: "bg-gray-50"
                },
                {
                  title: "Kitchen Hours",
                  content: (
                    <>
                      <p className="font-medium mb-2">Food Service:</p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>Monday: CLOSED</li>
                        <li>Tue-Fri: 6pm-9pm</li>
                        <li>Saturday: 1pm-7pm</li>
                        <li>Sunday: 1pm-6pm</li>
                      </ul>
                      <p className="text-sm text-amber-700 mt-3 font-medium">Sunday roasts require pre-order</p>
                    </>
                  ),
                  variant: "colored",
                  color: "bg-gray-50"
                },
                {
                  title: "Need Help?",
                  content: (
                    <>
                      <p className="text-sm text-gray-700 mb-3">Can't find what you're looking for? We're here to help!</p>
                      <div className="space-y-2">
                        <div>
                          <PhoneLink
                            phone="01753682707"
                            source="booking_help_card"
                            className="text-primary hover:text-primary-dark font-medium"
                          >
                            Call: 01753 682707
                          </PhoneLink>
                        </div>
                        <div>
                          <a href="mailto:manager@the-anchor.pub" className="text-primary hover:text-primary-dark font-medium">
                            Email us
                          </a>
                        </div>
                      </div>
                    </>
                  ),
                  variant: "colored",
                  color: "bg-gray-50"
                }
              ]}
            />
          </div>
        </Container>
      </Section>
    </>
  )
}
