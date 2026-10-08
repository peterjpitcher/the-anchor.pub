import Link from 'next/link'
import { Button, SectionHeading, Card, CardBody, Container, Grid, GridItem } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { BusinessHours } from '@/components/BusinessHours'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { PageTitle } from '@/components/ui/typography/PageTitle'
import { CONTACT, DRIVE_TIMES } from '@/lib/constants'
import { DEFAULT_PAGE_HEADER_IMAGE } from '@/lib/image-fallbacks'
import { ACCESS_WORDING, SPORT_WORDING, COMMENTARY_WORDING, PARKING_WORDING, DOGS_WORDING, FAMILIES_WORDING, GROUP_DEPOSIT_WORDING } from '@/lib/approved-wording'

/**
 * /live-sport/nations-championship once the tournament window has closed
 * (owner decision 18, 7 October 2026: year-neutral after 29 November).
 *
 * The tournament page names a year, the November fixtures, Finals Weekend and
 * "Pick your game and book your table". The day after the final none of that
 * is true, so the route renders this instead, in the style of
 * /live-sport/six-nations: no year, no fixture, no date, no channel for a
 * particular game, and no "book for this game" button.
 *
 * Every line rests on docs/SSOT.md. Section 10: "We show Nations Championship
 * games broadcast on terrestrial TV during our existing opening hours." The
 * sport, commentary, parking, dogs, families, access and deposit lines are the
 * approved wording from section 16, pasted as it stands.
 */

export const NATIONS_STANDING_TITLE = 'Nations Championship Rugby | The Anchor Stanwell Moor'
export const NATIONS_STANDING_WORDING = `We show Nations Championship games that are on BBC, ITV or Channel 4, during our usual opening hours. Call us on ${CONTACT.phone} to check a particular game.`
export const NATIONS_STANDING_DESCRIPTION = `Watch Nations Championship rugby near Heathrow. We show games that are on BBC, ITV or Channel 4, during our usual opening hours. Call ${CONTACT.phone} to check a game.`


const features = [
  { title: 'Free parking', description: PARKING_WORDING },
  { title: 'Bring the dog', description: DOGS_WORDING },
  { title: 'Bring the family', description: `Children are welcome at all hours. ${FAMILIES_WORDING}` }
]

const faqs = [
  {
    question: 'Do you show the Nations Championship?',
    answer: `Yes. ${NATIONS_STANDING_WORDING} We don't have Sky Sports or TNT Sports.`
  },
  {
    question: 'Will the commentary be on?',
    answer: `${COMMENTARY_WORDING} Call us on ${CONTACT.phone} to check a particular game.`
  },
  {
    question: 'What if a game starts before you open, or runs past closing?',
    answer: "We show games during our usual opening hours, so an early game is shown from when we open. If a game runs past our usual closing time and people are still here watching, we'll stay open until it finishes. That doesn't extend kitchen times, and it isn't a late opening for new arrivals."
  },
  {
    question: 'Can I book a table?',
    answer: `Yes. Book online, or call us on ${CONTACT.phone}. ${GROUP_DEPOSIT_WORDING} For more than 20 people, call us.`
  },
  {
    question: 'Can I get food while I watch?',
    answer: `That depends on the day and the time. Check the kitchen times on this page, or call us on ${CONTACT.phone}.`
  },
  { question: 'Is there parking?', answer: PARKING_WORDING },
  { question: 'Can I bring my dog?', answer: DOGS_WORDING },
  { question: 'Are children welcome?', answer: `Yes, at all hours. ${FAMILIES_WORDING}` },
  { question: 'Is it step free?', answer: ACCESS_WORDING }
]

export function NationsChampionshipStanding(): React.JSX.Element {
  return (
    <>
      <InteriorHero
        image={DEFAULT_PAGE_HEADER_IMAGE}
        crumb="Nations Championship"
        title="Nations Championship rugby at The Anchor"
        lead="We show Nations Championship games that are on BBC, ITV or Channel 4, during our usual opening hours."
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <div className="mx-auto text-center mb-12">
            <PageTitle className="text-accent-text mb-4">Got a game in mind?</PageTitle>
            <p className="text-lg text-ink-muted">{NATIONS_STANDING_WORDING}</p>
            <p className="mt-4 text-lg text-ink-muted">{SPORT_WORDING}</p>
            <p className="mt-4 text-lg text-ink-muted">{COMMENTARY_WORDING}</p>
          </div>

          <Grid cols={3} gap="md" className="mb-8">
            {features.map((feature) => (
              <GridItem key={feature.title}>
                <Card accent className="h-full">
                  <CardBody className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-ink-strong">{feature.title}</h3>
                    <p className="text-sm text-ink-muted leading-relaxed">{feature.description}</p>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <p className="text-center text-ink-muted">
            For other rugby, see <Link href="/live-sport" className="text-accent-text underline">live sport at The Anchor</Link> or
            our <Link href="/live-sport/six-nations" className="text-accent-text underline">Six Nations page</Link>.
          </p>
        </Container>
      </section>

      <section className="py-section-y bg-surface-sunk">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <SectionHeading title="Food and drink" align="left" className="mb-6" />
              <div className="prose text-ink-muted mb-6 max-w-none prose-strong:text-ink-strong">
                <p>Hungry? Our kitchen times change by day, so check them here before you set off.</p>
                <div className="mt-4">
                  <strong className="text-ink-strong">Opening and kitchen times</strong>
                  <BusinessHours />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="primary"><Link href="/food-menu">See the food menu</Link></Button>
                <Button asChild variant="outline"><Link href="/drinks">See the drinks</Link></Button>
              </div>
            </div>
            <Card accent>
              <CardBody className="p-8">
                <h3 className="text-xl text-accent-text mb-4">Find us</h3>
                <ul className="space-y-3 text-sm text-ink-muted mb-6">
                  <li className="flex gap-2"><span>{CONTACT.address.street}, {CONTACT.address.town}, {CONTACT.address.postcode}</span></li>
                  <li className="flex gap-2"><span>{DRIVE_TIMES.m25Junction14} minutes from Junction 14 of the M25</span></li>
                </ul>
                <Link href="/find-us" className="text-accent-text font-semibold hover:underline">Get directions</Link>
              </CardBody>
            </Card>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema title="Your questions" faqs={faqs} className="bg-surface" />

      <CtaBand
        title="Come and watch with us"
        copy={`Call us on ${CONTACT.phone} to check a particular game, or book a table.`}
      >
        <BookTableButton source="nations_standing_cta" variant="primary" size="lg" className="w-full sm:w-auto">
          Book a table
        </BookTableButton>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/find-us">Get directions</Link>
        </Button>
      </CtaBand>
    </>
  )
}
