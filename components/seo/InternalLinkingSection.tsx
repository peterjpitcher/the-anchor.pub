import Link from 'next/link'
import { Card, CardBody, Section, Container, Grid, GridItem } from '@/components/ui'

interface RelatedLink {
  href: string
  title: string
  description?: string
}

interface InternalLinkingSectionProps {
  title?: string
  links: RelatedLink[]
  className?: string
}

export function InternalLinkingSection({ 
  title = "You might also be interested in",
  links,
  className = ""
}: InternalLinkingSectionProps) {
  if (!links || links.length === 0) return null

  return (
    <Section className={`bg-anchor-green-raised border-b border-anchor-gold-dark/15 ${className}`}>
      <Container>
        <h2 className="text-2xl font-bold text-anchor-cream-text mb-6">{title}</h2>
        <Grid cols={links.length > 2 ? 3 : 2} gap="md">
          {links.map((link, index) => (
            <GridItem key={index}>
              <Link href={link.href} className="block h-full">
                <Card className="h-full hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] transition-shadow hover:-translate-y-0.5">
                  <CardBody>
                    <h3 className="font-semibold text-anchor-gold-bright mb-2">
                      {link.title}
                    </h3>
                    {link.description && (
                      <p className="text-sm text-anchor-cream-text/70">{link.description}</p>
                    )}
                  </CardBody>
                </Card>
              </Link>
            </GridItem>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}

// Predefined link groups for common use cases
export const commonLinkGroups = {
  mainPages: [
    { href: '/whats-on', title: "What's On", description: 'Events and entertainment' },
    { href: '/food-menu', title: 'Food Menu', description: 'Full dining options' },
    { href: '/drinks', title: 'Drinks Menu', description: 'Bar and beverage selection' },
    { href: '/our-pub', title: 'Our Pub', description: 'Photos of the bar, dining room, garden and games area' }
  ],
  events: [
    { href: '/music-bingo', title: 'Music Bingo & Hosted Nights', description: 'See Music Bingo dates and details' },
    { href: '/blog', title: 'Latest News', description: 'Updates and announcements' },
    { href: '/private-hire', title: 'Private Hire & Events', description: 'Get a quote and check availability' }
  ],
  location: [
    { href: '/near-heathrow', title: 'Near Heathrow', description: '5 minutes from all terminals' },
    { href: '/find-us', title: 'Find Us', description: 'Directions and parking' },
    { href: '/beer-garden', title: 'Beer Garden', description: 'Outdoor seating area' }
  ],
  dining: [
    { href: '/sunday-roast', title: 'Sunday Roast', description: 'Traditional roast dinners' },
    { href: '/food-menu#pizza', title: 'Pizza Menu', description: 'Stone-baked pizzas and toppings' },
    { href: '/drinks/managers-special', title: "Manager's Special", description: 'This month\'s featured drink' }
  ]
}
