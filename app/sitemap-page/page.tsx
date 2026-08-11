import Link from 'next/link'
import { Metadata } from 'next'
import { InteriorHero } from '@/components/hero'
import { Card, CardBody, Container } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneLink } from '@/components/PhoneLink'
import { EmailLink } from '@/components/EmailLink'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { seasonalOccasionLinks, trustLinks } from '@/lib/internal-linking-data'
import { landmarks } from '@/lib/local-seo-data'
import { formatEventDate, getPastEvents, type Event } from '@/lib/api'

type SitemapLink = {
  label: string
  href: string
  note?: string
}

type SitemapSection = {
  title: string
  links: SitemapLink[]
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Complete sitemap of The Anchor website. Find all our pages including menus, events, location information and special offers.',
  robots: {
    index: true,
    follow: true,
  },
  twitter: getTwitterMetadata({
    title: 'Sitemap | The Anchor - Heathrow Pub & Dining',
    description: 'Complete sitemap of The Anchor website. Find all our pages including menus, events, location information and special offers.'
  }),
  alternates: {
    canonical: '/sitemap-page'
  }
}

const sitemapSections: SitemapSection[] = [
  {
    title: 'Main Pages',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Find Us', href: '/find-us' },
      { label: 'Book a Table', href: '/book-table' },
      { label: 'Private Hire & Events', href: '/private-hire' },
      { label: 'Join Our Team', href: '/join-our-team' },
      { label: 'Sitemap', href: '/sitemap-page' },
    ]
  },
  {
    title: 'Jobs at The Anchor',
    links: [
      { label: 'Join Our Team', href: '/join-our-team' },
      { label: 'Bar Staff Jobs Near Heathrow', href: '/join-our-team/bar-staff' },
      { label: 'Kitchen Jobs Near Heathrow', href: '/join-our-team/kitchen-team' },
    ]
  },
  {
    title: 'Food & Drink',
    links: [
      { label: 'Food Menu', href: '/food-menu' },
      { label: 'Sunday Roast', href: '/sunday-roast' },
      { label: 'Stone-Baked Pizza', href: '/pizza-menu' },
      { label: 'Fish & Chips', href: '/fish-and-chips-heathrow' },
      { label: 'Kids Menu', href: '/food-menu#kids' },
      { label: 'Vegetarian Menu', href: '/food-menu/vegetarian' },
      { label: 'Vegan Options', href: '/food-menu/vegan' },
      { label: 'NGCI Menu', href: '/food-menu/gluten-free' },
      { label: 'Drinks Menu', href: '/drinks' },
      { label: "Manager's Special", href: '/drinks/managers-special' },
      { label: 'Baby Guinness', href: '/drinks/baby-guinness' },
    ]
  },
  {
    title: 'Events & Entertainment',
    links: [
      { label: "What's On", href: '/whats-on' },
      { label: 'Quiz Night', href: '/quiz-night' },
      { label: 'Cash Bingo', href: '/cash-bingo' },
      { label: 'Music Bingo', href: '/music-bingo' },
      { label: 'Karaoke', href: '/karaoke' },
      { label: 'Six Nations Rugby', href: '/live-sport/six-nations' },
      { label: 'F1 Racing', href: '/live-sport/f1' },
      { label: 'Boxing Nights', href: '/live-sport/boxing' },
      { label: 'World Cup 2026', href: '/live-sport/world-cup' },
    ]
  },
  {
    title: 'Seasonal Events & Occasions',
    links: seasonalOccasionLinks.map((link) => ({
      label: link.label,
      href: link.href,
    })),
  },
  {
    title: 'Private Hire & Celebrations',
    links: [
      { label: 'Private Hire Overview', href: '/private-hire' },
      { label: 'Corporate Events', href: '/corporate-events' },
      { label: 'Christmas Parties', href: '/christmas-parties' },
      { label: 'Wakes & Memorials', href: '/private-hire/wakes' },
      { label: 'Christenings', href: '/private-hire/christenings' },
      { label: 'Baby Showers', href: '/private-hire/baby-showers' },
      { label: 'Engagement Parties', href: '/private-hire/engagement-parties' },
      { label: 'Anniversary Parties', href: '/private-hire/anniversary-parties' },
      { label: 'Gender Reveal Parties', href: '/private-hire/gender-reveal' },
      { label: 'Milestone Birthdays', href: '/private-hire/milestone-birthdays' },
      { label: 'Retirement Parties', href: '/private-hire/retirement-parties' },
    ]
  },
  {
    title: 'Private Hire Near Local Venues',
    links: landmarks.map((landmark) => ({
      label: landmark.name,
      href: `/private-hire/near/${landmark.slug}`,
    })),
  },
  {
    title: 'Heathrow & Travel',
    links: [
      { label: 'Near Heathrow Overview', href: '/near-heathrow' },
      { label: 'Terminal 2', href: '/near-heathrow/terminal-2' },
      { label: 'Terminal 3', href: '/near-heathrow/terminal-3' },
      { label: 'Terminal 4', href: '/near-heathrow/terminal-4' },
      { label: 'Terminal 5', href: '/near-heathrow/terminal-5' },
      { label: 'Heathrow Hotels', href: '/heathrow-hotels-pub' },
      { label: 'M25 Junction 14', href: '/m25-junction-14-pub' },
      { label: 'Layover Dining', href: '/heathrow-layover-dining' },
      { label: 'Pre-Flight Meal', href: '/pre-flight-meal' },
      { label: 'Family Dining', href: '/heathrow-family-dining' },
      { label: 'Luggage Storage', href: '/luggage-storage-heathrow' },
      { label: 'Heathrow Parking', href: '/heathrow-parking' },
      { label: 'Coach Parking', href: '/coach-parking-heathrow' },
      { label: 'Restaurants Near Heathrow', href: '/restaurants-near-heathrow' },
      { label: 'Pubs in Stanwell', href: '/pubs-in-stanwell' },
    ]
  },
  {
    title: 'Highlights & Facilities',
    links: [
      { label: 'Our Pub', href: '/our-pub' },
      { label: 'Beer Garden', href: '/beer-garden' },
      { label: 'Plane Spotting Guide', href: '/plane-spotting-heathrow' },
      { label: 'Live Sport Pub', href: '/live-sport' },
      { label: 'Pool & Darts', href: '/pool-darts-pub' },
      { label: 'Dog Friendly Pub', href: '/dog-friendly-pub-heathrow' },
      { label: 'Family Friendly', href: '/family-friendly-pub-heathrow' },
      { label: 'Free Parking', href: '/heathrow-parking' },
    ]
  },
  {
    title: 'Areas We Serve',
    links: [
      { label: 'Ashford', href: '/ashford-pub' },
      { label: 'Bedfont', href: '/bedfont-pub' },
      { label: 'Colnbrook', href: '/colnbrook-pub' },
      { label: 'Egham', href: '/egham-pub' },
      { label: 'Feltham', href: '/feltham-pub' },
      { label: 'Horton', href: '/horton-pub' },
      { label: 'Longford', href: '/longford-pub' },
      { label: 'Staines', href: '/staines-pub' },
      { label: 'Stanwell', href: '/stanwell-pub' },
      { label: 'Sunbury', href: '/sunbury-pub' },
      { label: 'Windsor', href: '/windsor-pub' },
      { label: 'Wraysbury', href: '/wraysbury-pub' },
    ]
  },
  {
    title: 'Blog',
    links: [
      { label: 'All Posts', href: '/blog' },
      { label: 'Browse Tags', href: '/blog/tags' },
    ]
  },
  {
    title: 'Guest Services',
    links: [
      ...trustLinks.map((link) => ({
        label: link.label,
        href: link.href,
      })),
      { label: 'Leave a Review', href: '/leave-review' },
      { label: 'Accessibility', href: '/accessibility' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
    ]
  },
]

function buildRecentEventSection(events: Event[]): SitemapSection | null {
  if (events.length === 0) return null

  return {
    title: 'Past Events',
    links: events.map((event) => ({
      label: `${event.name} - ${formatEventDate(event.startDate)}`,
      href: `/events/${event.slug || event.id}`,
    })),
  }
}

export default async function SitemapPage() {
  // Every past event, not just the last twelve. These pages are kept live and
  // indexed so their content can accumulate, which only works if something
  // links to them: 3 of 39 were reachable by clicking before this.
  const recentEvents = await getPastEvents().catch(() => [] as Event[])
  const recentEventSection = buildRecentEventSection(recentEvents)
  const sections = recentEventSection
    ? [...sitemapSections.slice(0, 4), recentEventSection, ...sitemapSections.slice(4)]
    : sitemapSections

  return (
    <>
      {/* Hero Section */}
      <InteriorHero
        image="/images/page-headers/home/page-headers-homepage.jpg"
        crumb="Sitemap"
        title="Sitemap"
        lead="Find your way around The Anchor website"
      />

      {/* Page Title */}
      <section className="py-section-y bg-canvas">
        <Container>
          <PageTitle className="text-center text-ink-strong mb-8" seo={{ structured: true, speakable: true }}>
            Sitemap - The Anchor
          </PageTitle>
        </Container>
      </section>

      {/* Sitemap Links */}
      <section className="py-section-y bg-surface">
        <Container size="lg">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <Card key={section.title} accent>
              <CardBody>
              <h2 className="text-xl text-ink-strong mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.note ? (
                      <span className="text-ink-muted">
                        {link.label} <span className="text-sm">({link.note})</span>
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-accent-text hover:text-accent transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card accent className="mt-12">
          <CardBody className="p-8 text-center">
          <h2 className="text-2xl text-ink-strong mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-ink-muted mb-6">
            Give us a call and we'll be happy to help
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <PhoneLink
              phone="01753 682707"
              source="sitemap_contact"
              className="text-lg font-semibold text-accent-text hover:text-accent"
              showIcon={false}
            >
              01753 682707
            </PhoneLink>
            <span className="text-ink-muted">|</span>
            <EmailLink
              email="manager@the-anchor.pub"
              source="sitemap_contact"
              className="text-lg font-semibold text-accent-text hover:text-accent"
              showIcon={true}
            />
          </div>
          </CardBody>
        </Card>
        </Container>
      </section>
    </>
  )
}
