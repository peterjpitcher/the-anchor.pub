import type { Metadata } from 'next'
import Link from 'next/link'
import { InteriorHero } from '@/components/hero'
import { PhoneButton } from '@/components/PhoneButton'
import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT } from '@/lib/constants'
import { ManagementTableBookingForm } from '@/components/features/TableBooking/ManagementTableBookingForm'
import { BookTableUpcomingEventsPanel } from '@/components/features/TableBooking/BookTableUpcomingEventsPanel'
import { StaticHoursSummary } from '@/components/StaticHoursSummary'
import { LaunchAnnouncement } from '@/components/announcements/LaunchAnnouncement'
import { Section, Button, Grid, Card, CardBody, SectionHeading, Badge } from '@/components/ui'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { LARGE_GROUP_DEPOSIT_POLICY_COPY } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { RegretReduction, ValueProofStrip } from '@/components/psychology'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import {
  getFoodMenuPageData,
  getSundayLunchMenuPageData,
  type MenuPageItem
} from '@/lib/menu-page-data'
import { OrganicSearchClusterLinks } from '@/components/seo/OrganicSearchClusterLinks'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { TestimonialSection } from '@/components/TestimonialSection'

// Revalidate every 1 hour for the walk-in launch fortnight (10–22 May 2026)
// so the LaunchAnnouncement banner flips reliably at the cutover even on
// cached pages. See spec §8.5.
// TODO(post-launch): revert to 60 * 60 * 24 (24 hours) after 22 May 2026, or
// drop the export entirely if the original was using Next.js' default.
export const revalidate = 60 * 60 // 1 hour during launch fortnight

export async function generateMetadata(): Promise<Metadata> {
  const [foodMenu, sundayMenu] = await Promise.all([
    getFoodMenuPageData(),
    getSundayLunchMenuPageData()
  ])
  const foodPhrase = foodMenu?.priceFromLabel ? ` Food ${foodMenu.priceFromLabel}.` : ''
  const sundayPhrase = sundayMenu.menuData
    ? ' Sunday roast menu details are loaded live.'
    : ' Sunday roast details are available on request.'
  const description = `Reserve your table at The Anchor, Stanwell Moor, instant confirmation.${foodPhrase}${sundayPhrase} Dog-friendly, free parking, 7 mins from T5.`

  return {
    title: 'Book a Table for Pub Food | The Anchor Stanwell Moor',
    description,
    openGraph: {
        title: 'Book a Table for Pub Food | The Anchor Stanwell Moor',
      description,
      images: [{ url: DEFAULT_PAGE_HEADER_IMAGE, width: 1200, height: 630, alt: 'The Anchor pub in Stanwell Moor near Heathrow' }]
    },
    twitter: getTwitterMetadata({
      title: 'Book a Table at The Anchor | Pub Near Heathrow T5',
      description,
      images: [DEFAULT_PAGE_HEADER_IMAGE]
    }),
    alternates: {
      canonical: '/book-table'
    }
  }
}

type BookTablePageProps = {
  searchParams?: {
    date?: string
    time?: string
    party_size?: string
  }
}

function parsePartySize(value?: string): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return undefined
  return Math.min(Math.max(parsed, 1), 20)
}

function itemPreview(items: MenuPageItem[], limit = 4): MenuPageItem[] {
  return items.slice(0, limit)
}

export default async function BookPage({ searchParams }: BookTablePageProps) {
  const [foodMenu, sundayMenu] = await Promise.all([
    getFoodMenuPageData(),
    getSundayLunchMenuPageData()
  ])
  const previewItems = itemPreview(foodMenu?.items ?? [])
  // sunday_lunch, mothers_day, and purpose query params are silently ignored.
  // Sunday-lunch as a separate booking type is retired with the walk-in launch
  // (spec §6, §8.1); the booking purpose chooser is replaced by per-slot
  // kitchen-open captions and submit-time derivation (spec §5, §8).
  const prefill = {
    date: searchParams?.date,
    time: searchParams?.time,
    partySize: parsePartySize(searchParams?.party_size)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              'name': 'Book a Table at The Anchor',
              'description': 'Reserve your table at The Anchor, Stanwell Moor. Instant confirmation. Free parking, 7 mins from Heathrow T5.',
              'url': 'https://www.the-anchor.pub/book-table',
              'potentialAction': {
                '@type': 'ReserveAction',
                'target': {
                  '@type': 'EntryPoint',
                  'urlTemplate': 'https://www.the-anchor.pub/book-table'
                },
                'result': {
                  '@type': 'FoodEstablishmentReservation'
                }
              }
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FoodEstablishmentReservation',
              reservationFor: {
                '@type': 'FoodEstablishment',
                name: 'The Anchor',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: 'Horton Road',
                  addressLocality: 'Stanwell Moor',
                  postalCode: 'TW19 6AQ'
                }
              },
              url: 'https://www.the-anchor.pub/book-table',
              potentialAction: {
                '@type': 'ReserveAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.the-anchor.pub/book-table'
                },
                result: {
                  '@type': 'FoodEstablishmentReservation'
                }
              }
            }
          ])
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Book a Table', url: '/book-table' }
        ]}
      />

      <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb="Book a Table"
        title="Book a Table for Pub Food at The Anchor, Stanwell Moor"
        lead="Reserve for pub classics, stone-baked pizzas, Sunday roast, drinks or a relaxed meal seven minutes from Heathrow T5."
        badges={
          <>
            <Badge variant="sand">Direct booking</Badge>
            <Badge variant="sand">Fast confirmation</Badge>
            <Badge variant="sand">Need help? Call us</Badge>
          </>
        }
      />

      <Section spacing="xs" container containerSize="md" className="text-center bg-anchor-green-deep border-b border-anchor-gold-dark/15">
        <PageTitle className="text-anchor-cream-text" seo={{ structured: true, speakable: true }}>
          Reserve Your Table Online
        </PageTitle>
        <p className="mt-3 text-base text-anchor-cream-text/70 md:text-lg">
          Choose your date, time, and party size to reserve your table. Loved by locals and Heathrow travellers every week.
        </p>
      </Section>

      <Section id="booking-form" background="gray" spacing="sm" container containerSize="lg" className="bg-anchor-green-raised">
        <div className="grid items-start gap-5 lg:gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <div className="order-1">
            <div className="mb-4 space-y-3">
              <LaunchAnnouncement variant="banner" />
              <RegretReduction variant="booking" />
            </div>
            <ManagementTableBookingForm prefill={prefill} />
          </div>

          <aside className="order-2 space-y-4 lg:space-y-6">
            <div className="card-dark p-4 lg:hidden">
              <h2 className="text-lg font-semibold text-anchor-gold-bright">Need help with your food booking?</h2>
              <p className="mt-2 text-sm text-anchor-cream-text/70">
                If you need a larger table, can't find your preferred time, or want a quick answer, call us directly.
              </p>
              <div className="mt-4 space-y-2">
                <PhoneButton
                  phone="01753 682707"
                  source="book_table_mobile_help"
                  variant="outline"
                  className="w-full"
                >
                  Call 01753 682707
                </PhoneButton>
                <Link href="/food-menu" className="block">
                  <Button variant="outline" className="w-full">
                    View food menu
                  </Button>
                </Link>
              </div>
            </div>

            <StaticHoursSummary compact />

            <div className="hidden card-dark p-5 lg:block">
              <h3 className="text-base font-semibold text-anchor-gold-bright mb-3">Why The Anchor?</h3>
              <ValueProofStrip variant="food" />
            </div>

            <div className="hidden card-dark p-6 lg:block">
              <h2 className="text-xl font-semibold text-anchor-gold-bright">Quick tips</h2>
              <ul className="mt-3 space-y-2 text-left text-sm text-anchor-cream-text/70">
                <li>• For groups of 20+, please call us.</li>
                <li>• {LARGE_GROUP_DEPOSIT_POLICY_COPY}</li>
                <li>• Add access needs or dietary notes in the notes box.</li>
                <li>• Can't see the time you want? Give us a ring.</li>
              </ul>
            </div>

            <div className="hidden card-dark p-6 lg:block">
              <h3 className="text-xl font-semibold text-anchor-gold-bright">Prefer to talk?</h3>
              <p className="mt-2 text-sm text-anchor-cream-text/70">
                Our team can help with tables of 20+, special celebrations, or last-minute changes.
              </p>
              <div className="mt-4">
                <PhoneButton
                  phone="01753 682707"
                  source="book_table_sidebar"
                  variant="outline"
                  className="w-full"
                >
                  Call 01753 682707
                </PhoneButton>
              </div>
            </div>

            <div className="hidden card-dark p-6 lg:block">
              <h3 className="text-xl font-semibold text-anchor-gold-bright">Useful to know</h3>
              <ul className="mt-3 space-y-2 text-left text-sm text-anchor-cream-text/70">
                <li>• 20 free parking spaces on site.</li>
                <li>• Dog friendly inside and out.</li>
                <li>• Step-free access from the car park.</li>
              </ul>
            </div>

          </aside>
        </div>
      </Section>

      <Section background="white" spacing="sm" container containerSize="md" className="bg-anchor-green-deep border-b border-anchor-gold-dark/15">
        <h2 className="text-2xl font-bold text-anchor-gold-bright mb-4">Accessibility</h2>
        <p className="text-anchor-cream-text/70 mb-3">
          Step-free access to the bar, dining area and beer garden.
        </p>
        <p className="text-anchor-cream-text/70 mb-4">
          We currently don&apos;t have an accessible toilet. If you&apos;d like to visit and want to check what will work best for you, give us a call on{' '}
          <PhoneLink phone={CONTACT.phone} source="book-table_accessibility" className="text-anchor-gold-bright font-semibold hover:underline" showIcon={false} /> and we&apos;ll help.
        </p>
        <Link href="/accessibility" className="text-anchor-gold-bright font-semibold hover:underline">
          Full accessibility information &rarr;
        </Link>
      </Section>

      {/* What to Expect section */}
      <Section spacing="lg" container containerSize="lg" className="bg-anchor-green-raised">
        <SectionHeading
          title="What to Expect When You Dine With Us"
          subtitle="Good food, a warm welcome, and no fuss."
          align="center"
        />
        <Grid cols={3} gap="md">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-anchor-gold-bright mb-2">Current Food Menu</h3>
              <p className="text-anchor-cream-text/70 text-sm mb-4">
                Dish names, descriptions and prices follow the latest kitchen menu.
              </p>
              <Link href="/food-menu" className="text-anchor-gold-bright font-semibold text-sm hover:underline">
                View food menu &rarr;
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-anchor-gold-bright mb-2">Sunday Roast</h3>
              <p className="text-anchor-cream-text/70 text-sm mb-4">
                Sunday roast has a dedicated page. {sundayMenu.menuData ? 'Current Sunday dishes are listed there.' : 'Call us for the current Sunday menu while the online dish list is unavailable.'}
              </p>
              <Link href="/sunday-roast" className="text-anchor-gold-bright font-semibold text-sm hover:underline">
                About Sunday roast &rarr;
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-anchor-gold-bright mb-2">Free Parking &amp; Easy Access</h3>
              <p className="text-anchor-cream-text/70 text-sm mb-4">
                We have 20 free on-site parking spaces and are just 7 minutes from Heathrow Terminal 5. Step-free access from the car park. Dogs welcome inside and out.
              </p>
              <Link href="/find-us" className="text-anchor-gold-bright font-semibold text-sm hover:underline">
                Get directions &rarr;
              </Link>
            </CardBody>
          </Card>
        </Grid>
      </Section>

      {/* Signature Dishes Preview */}
      <Section spacing="md" container containerSize="md" className="bg-anchor-green-deep border-b border-anchor-gold-dark/15">
        <SectionHeading
          title="A Taste of What&rsquo;s on the Menu"
          subtitle="A live sample from the current food menu."
          align="center"
        />
        <div className="space-y-4 max-w-2xl mx-auto">
          {previewItems.length > 0 ? (
            previewItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-4 py-3 border-b border-anchor-gold-dark/10 last:border-b-0">
                <div>
                  <h3 className="font-semibold text-anchor-cream-text">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-anchor-cream-text/60 mt-1">{item.description}</p>
                  )}
                </div>
                {item.priceLabel && (
                  <span className="text-anchor-gold-bright font-semibold whitespace-nowrap">{item.priceLabel}</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-anchor-cream-text/70">
              Menu preview temporarily unavailable. Call us for the current dish list.
            </p>
          )}
        </div>
        <p className="text-center mt-6">
          <Link href="/food-menu" className="text-anchor-gold-bright font-semibold hover:underline">
            See the full food menu &rarr;
          </Link>
        </p>
      </Section>

      <Section spacing="md" container containerSize="lg" className="bg-anchor-green-raised border-b border-anchor-gold-dark/15">
        <SectionHeading
          title="Events are a bonus, food booking comes first"
          subtitle="If you are booking around quiz, bingo or live music, reserve food early and then choose your event."
          align="center"
        />
        <div className="mx-auto max-w-3xl">
          <BookTableUpcomingEventsPanel />
        </div>
      </Section>

      <OrganicSearchClusterLinks
        cluster="heathrowDining"
        currentPath="/book-table"
        title="Plan your meal near Heathrow"
        intro="Compare the restaurant guide, live menu and Sunday roast options before reserving."
      />

      {/* Customer Review */}
      <TestimonialSection
        variant="pull-quote"
        className="bg-anchor-green-raised border-b border-anchor-gold-dark/15"
        reviews={[{
          quote: "Lovely pub, great food, friendly staff. We stopped in on our way to Heathrow and wished we'd found it sooner. Will definitely be back.",
          author: "Anonymous",
          source: "Google Review",
          rating: 5
        }]}
      />

      {/* Getting Here */}
      <Section spacing="md" container containerSize="md" className="bg-anchor-green-deep border-b border-anchor-gold-dark/15">
        <SectionHeading
          title="Getting Here"
          subtitle="Easy to find, plenty of parking, and closer than you think."
          align="center"
        />
        <div className="max-w-2xl mx-auto">
          <div className="prose prose-invert max-w-none text-anchor-cream-text/70 space-y-4">
            <p>
              The Anchor Pub is on Horton Road, Stanwell Moor, Surrey, TW19 6AQ, just 2 minutes from M25 Junction 14 and 7 minutes from Heathrow Terminal 5. Whether you&apos;re booking a pub table near Heathrow for a pre-flight meal, a layover lunch, or a restaurant reservation near Heathrow for a special evening, we&apos;re easy to reach from all directions.
            </p>
            <p>
              We have 20 free on-site parking spaces with CCTV and floodlighting. No meters, no time limits while you&apos;re dining. The car park has a level surface with step-free access to the bar and dining area.
            </p>
            <p>
              By bus, we&apos;re served by the 441, 442, and 555 routes from Heathrow Central Bus Station. We&apos;re also outside the ULEZ zone, avoiding the daily charge if you&apos;re driving from London.
            </p>
          </div>
          <p className="mt-6 text-center">
            <Link href="/find-us" className="text-anchor-gold-bright font-semibold hover:underline">
              View map and full directions &rarr;
            </Link>
          </p>
        </div>
      </Section>

      {/* FAQ section */}
      <FAQAccordionWithSchema
        title="Booking FAQs"
        faqs={[
          {
            question: 'Do I need to book in advance?',
            answer: 'Walk-ins are welcome when tables are available. We still recommend booking ahead for larger groups and busy weekend evenings, booking takes under a minute online and guarantees your table.'
          },
          {
            question: 'Is there a deposit required?',
            answer: 'A £10 per person deposit is required for groups of 10 or more. This is fully deductible from your final bill on the day. No deposit required for smaller groups.'
          },
          {
            question: 'Can I book for a special occasion?',
            answer: 'Yes, we love hosting birthdays, anniversaries, and celebrations. Use the notes field when booking to let us know, or call us on 01753 682707 to discuss any special arrangements.'
          },
          {
            question: 'Do you cater for dietary requirements?',
            answer: 'Yes. We offer vegetarian and vegan options and can accommodate most common allergies. Please add a note when booking, and our team will make sure your visit goes smoothly.'
          },
          {
            question: 'How far are you from Heathrow Airport?',
            answer: 'The Anchor is in Stanwell Moor, just 7 minutes from Heathrow Terminal 5 by car. We\'re a popular choice for pre-flight meals, layover dining, and airport hotel guests looking for a proper pub nearby.'
          },
          {
            question: 'What are your kitchen hours?',
            answer: 'Kitchen hours are updated live on our website. Check the opening hours section on our homepage or call 01753 682707 for today\'s kitchen times, as they can vary on bank holidays.'
          },
          {
            question: 'Is The Anchor dog-friendly?',
            answer: 'Yes, dogs are welcome both inside the pub and in the beer garden. We have water bowls available and our team love a visit from a four-legged friend. Just mention it when you book if you\'re bringing a dog.'
          },
          {
            question: 'Can I book for a Heathrow layover meal?',
            answer: 'Absolutely. Many of our guests book a table during a long Heathrow layover. We\'re 7 minutes from T5, offer free parking, and our kitchen can turn around a full meal in good time. Call us if you have a tight window and we\'ll do our best.'
          }
        ]}
      />
    </>
  )
}
