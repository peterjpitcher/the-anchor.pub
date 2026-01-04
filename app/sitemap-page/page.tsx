import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero'
import { Button, Section } from '@/components/ui'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { PhoneLink } from '@/components/PhoneLink'
import { EmailLink } from '@/components/EmailLink'
import { PageTitle } from '@/components/ui/typography/PageTitle'

type SitemapLink = {
  label: string
  href: string
  note?: string
}

type SitemapSection = {
  title: string
  links: SitemapLink[]
}

export const metadata: Metadata = {
  title: 'Sitemap | The Anchor - Heathrow Pub & Dining',
  description: 'Complete sitemap of The Anchor website. Find all our pages including menus, events, location information and special offers.',
  robots: {
    index: true,
    follow: true,
  },
  twitter: getTwitterMetadata({
    title: 'Sitemap | The Anchor - Heathrow Pub & Dining',
    description: 'Complete sitemap of The Anchor website. Find all our pages including menus, events, location information and special offers.'
  })
}

const sitemapSections: SitemapSection[] = [
  {
    title: 'Main Pages',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Find Us', href: '/find-us' },
      { label: 'Book a Table', href: '/book-table' },
      { label: 'Book an Event', href: '/book-event' },
      { label: 'Sitemap', href: '/sitemap-page' },
    ]
  },
  {
    title: 'Food & Drink',
    links: [
      { label: 'Food Menu', href: '/food-menu' },
      { label: 'Sunday Lunch', href: '/sunday-lunch' },
      { label: 'Pizza Menu', href: '/pizza-menu' },
      { label: 'Burger Menu', href: '/burger-menu' },
      { label: 'Fish & Chips', href: '/fish-and-chips-heathrow' },
      { label: 'Pizza Tuesday', href: '/pizza-tuesday' },
      { label: 'Drinks Menu', href: '/drinks' },
      { label: "Manager's Special", href: '/drinks/managers-special' },
      { label: 'Baby Guinness', href: '/drinks/baby-guinness' },
    ]
  },
  {
    title: 'Events & Entertainment',
    links: [
      { label: "What's On", href: '/whats-on' },
      { label: 'Drag Shows', href: '/whats-on/drag-shows' },
      { label: 'Quiz Night', href: '/quiz-night' },
      { label: 'Cash Bingo', href: '/cash-bingo' },
      { label: 'Karaoke', href: '/karaoke' },
      { label: 'Live Music', href: '/live-music' },
      { label: 'Premier League', href: '/live-sport/premier-league' },
      { label: 'Six Nations Rugby', href: '/live-sport/six-nations' },
      { label: 'F1 Racing', href: '/live-sport/f1' },
      { label: 'Boxing Nights', href: '/live-sport/boxing' },
      { label: 'Summer Garden Parties', href: '/summer-garden-parties' },
    ]
  },
  {
    title: 'Private Hire & Celebrations',
    links: [
      { label: 'Private Hire Overview', href: '/private-hire' },
      { label: 'Private Party Venue', href: '/private-party-venue' },
      { label: 'Function Room Hire', href: '/function-room-hire' },
      { label: 'Corporate Events', href: '/corporate-events' },
      { label: 'Corporate Christmas Parties', href: '/corporate-christmas-parties' },
      { label: 'Christmas Parties', href: '/christmas-parties' },
      { label: 'Weddings', href: '/private-hire/weddings' },
      { label: 'Wakes & Memorials', href: '/private-hire/wakes' },
      { label: 'Christenings', href: '/private-hire/christenings' },
      { label: 'Baby Showers', href: '/private-hire/baby-showers' },
      { label: 'Engagement Parties', href: '/private-hire/engagement-parties' },
      { label: 'Gender Reveal Parties', href: '/private-hire/gender-reveal' },
      { label: 'Milestone Birthdays', href: '/private-hire/milestone-birthdays' },
      { label: 'Retirement Parties', href: '/private-hire/retirement-parties' },
    ]
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
      { label: 'Beer Garden', href: '/beer-garden' },
      { label: 'Pub Garden', href: '/pub-garden-heathrow' },
      { label: 'Plane Spotting Guide', href: '/plane-spotting-heathrow' },
      { label: 'Live Sport Pub', href: '/live-sport-pub' },
      { label: 'Pool & Darts', href: '/pool-darts-pub' },
      { label: 'Dog Friendly Pub', href: '/dog-friendly-pub-heathrow' },
      { label: 'Family Friendly', href: '/family-friendly-pub-heathrow' },
      { label: 'Free Parking', href: '/free-parking' },
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
      { label: 'Leave a Review', href: '/leave-review' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Booking Confirmation', href: '/booking-confirmation' },
    ]
  },
  {
    title: 'Diagnostics & Demos',
    links: [
      { label: 'Components Library', href: '/components' },
      { label: 'Demo Header', href: '/demo-header' },
      { label: 'Debug Hours', href: '/debug-hours' },
      { label: 'GTM Debug', href: '/gtm-debug' },
      { label: 'Test GTM', href: '/test-gtm' },
      { label: 'Test Hours', href: '/test-hours' },
      { label: 'Test Navigation Tracking', href: '/test-navigation-tracking' },
      { label: 'Test Reviews', href: '/test-reviews' },
      { label: 'Test Simple', href: '/test-simple' },
      { label: 'Test Tracking', href: '/test-tracking' },
    ]
  },
]

export default function SitemapPage() {
  return (
    <>
      {/* Hero Section */}
      <HeroWrapper
        route="/sitemap-page"
        title="Sitemap"
        description="Find your way around The Anchor website"
        variant="feature"
        primaryCta={
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              🏠 Back to Home
            </Button>
          </Link>
        }
        secondaryCta={
          <Link href="/find-us">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              📍 Find Us
            </Button>
          </Link>
        }
      />

      {/* Page Title */}
      <Section spacing="md" container className="bg-white">
        <PageTitle className="text-center text-anchor-green mb-8" seo={{ structured: true, speakable: true }}>
          Sitemap - The Anchor
        </PageTitle>
      </Section>

      {/* Sitemap Links */}
      <Section background="gray" spacing="lg" container containerSize="lg">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sitemapSections.map((section) => (
            <div key={section.title} className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-anchor-green mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.note ? (
                      <span className="text-gray-700">
                        {link.label} <span className="text-sm">({link.note})</span>
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-anchor-gold hover:text-anchor-gold-light transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="mt-12 bg-anchor-sand/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-anchor-green mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-gray-700 mb-6">
            Give us a call and we'll be happy to help
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <PhoneLink 
              phone="01753 682707" 
              source="sitemap_contact"
              className="text-lg font-semibold text-anchor-gold hover:text-anchor-gold-light"
              showIcon={false}
            >
              📞 01753 682707
            </PhoneLink>
            <span className="text-gray-600">|</span>
            <EmailLink
              email="manager@the-anchor.pub"
              source="sitemap_contact"
              className="text-lg font-semibold text-anchor-gold hover:text-anchor-gold-light"
              showIcon={true}
            />
          </div>
        </div>
      </Section>
    </>
  )
}
