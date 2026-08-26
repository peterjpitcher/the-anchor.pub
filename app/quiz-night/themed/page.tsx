import { Metadata } from 'next'
import Link from 'next/link'
import { Badge, Container, Card, CardBody } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { InteriorHero } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { InternalLinkingSection } from '@/components/seo/InternalLinkingSection'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { CONTACT } from '@/lib/constants'

/**
 * Themed quiz nights hub.
 *
 * Keyword Planner, UK, August 2026: "gavin and stacey quiz" is 500 searches a
 * month at a paid competition index of ZERO, and "only fools and horses quiz"
 * 500 at index 2. Nobody is bidding on either. The category phrasings
 * ("themed quiz night near me", "tv quiz night near me") return no data at
 * all, so demand attaches to the named show, not to the idea of a themed quiz.
 * See tasks/keyword-plan-2026-08-17-site-growth.md.
 *
 * Scope is deliberately narrow. The management database confirms exactly TWO
 * genuinely show-themed quizzes: Gavin & Stacey (15 May 2026) and the Only
 * Fools and Horses charity night (25 September 2026). The seasonal nights
 * ("A Hint of Halloween", "Sparks & Sparklers", "Tinsel & Trivia") say in
 * their own copy that they are the normal quiz with a light flavour and that
 * teams need no specialist knowledge, so they are described here as exactly
 * that rather than padded in as themes.
 *
 * Cannibalisation: /quiz-night keeps "pub quiz near me" (5,000/mo). This page
 * takes only the named-show terms. Both link to each other.
 */
export const metadata: Metadata = {
  title: 'Themed Quiz Nights Near Heathrow',
  description:
    'Show-themed quiz nights in Stanwell Moor, £3 a player. Gavin & Stacey and an Only Fools and Horses charity night, plus the monthly pub quiz.',
  openGraph: {
    title: 'Themed Quiz Nights at The Anchor, Stanwell Moor',
    description:
      'Occasional show-themed quiz nights alongside the monthly pub quiz. £3 a player, teams of up to six, free parking.',
    images: [{ url: DEFAULT_EVENT_IMAGE, width: 1200, height: 630, alt: 'Quiz night at The Anchor pub in Stanwell Moor' }]
  },
  twitter: getTwitterMetadata({
    title: 'Themed Quiz Nights at The Anchor, Stanwell Moor',
    description:
      'Occasional show-themed quiz nights alongside the monthly pub quiz. £3 a player, teams of up to six, free parking.',
    images: [DEFAULT_EVENT_IMAGE]
  }),
  alternates: { canonical: './' }
}

/**
 * Only nights the management database confirms actually ran or are scheduled.
 * Do not add a theme here speculatively: an unrun themed quiz that ranks is a
 * page that disappoints everyone who clicks it.
 */
const THEMED_NIGHTS = [
  {
    name: 'Only Fools and Horses',
    fullName: 'Lovely Jubbly: Only Fools and Horses Charity Quiz Night',
    date: 'Friday 25 September 2026',
    status: 'upcoming' as const,
    href: '/events/pub-quiz-lovely-jubbly-only-fools-and-horses-quiz-night-2026-09-25',
    copy:
      'A full Only Fools and Horses quiz, in partnership with the Stanwell Moor Community Wellbeing Garden in aid of Macmillan Cancer Support. 7pm to 9.30pm, £3 a player.'
  },
  {
    name: 'Gavin & Stacey',
    fullName: 'Gavin & Stacey Quiz Night',
    date: 'Friday 15 May 2026',
    status: 'past' as const,
    href: '/events/gavin-and-stacey-quiz-night-2026-05-15',
    copy:
      'Our Gavin and Stacey quiz ran on a Friday night in May: rounds on Barry, Essex and everyone in between, for fans and for people who had simply watched enough of it. A £25 bar voucher for the winners.'
  }
]

const FAQS = [
  {
    question: 'What is a themed quiz night?',
    answer:
      'Every round is built around one subject, usually a television show, instead of the mix of general knowledge, music and pictures you get at our normal quiz. It suits people who know the show well, and it is still perfectly playable if you have just watched a few series.'
  },
  {
    question: 'Do I need to be a superfan to join in?',
    answer:
      'No. We write the rounds so a casual viewer can score, with a few harder questions in each round for the people who know every episode. Teams are capped at six, so bring the friend who has seen it all.'
  },
  {
    question: 'How much is entry and do I need to book?',
    answer:
      'It is £3 per player, paid in cash on the night, the same as our normal quiz. Themed nights fill up faster than the monthly quiz, so booking a table is worth doing. Call 01753 682707 if online booking is closed.'
  },
  {
    question: 'When is the next themed quiz night?',
    answer:
      'The next one is our Only Fools and Horses quiz on Friday 25 September 2026, in partnership with the Stanwell Moor Community Wellbeing Garden and raising money for Macmillan Cancer Support. New themes are announced on our What’s On page as they are confirmed.'
  },
  {
    question: 'Are the Halloween and Christmas quizzes themed?',
    answer:
      'Not fully, and we would rather say so. Nights like A Hint of Halloween and Tinsel & Trivia are our normal varied quiz with a few seasonal questions mixed in. You do not need specialist knowledge for those, unlike a show-themed night.'
  },
  {
    question: 'Can you run a themed quiz for our group?',
    answer:
      'Yes. We put on custom trivia nights for work teams, birthdays and fundraisers, with rounds written around whatever you like. Email manager@the-anchor.pub or call 01753 682707.'
  }
]

export default function ThemedQuizNightsPage() {
  const upcoming = THEMED_NIGHTS.filter((n) => n.status === 'upcoming')
  const past = THEMED_NIGHTS.filter((n) => n.status === 'past')

  return (
    <>
      <InteriorHero
        image="/images/page-headers/whats-on/whats-on.jpg"
        crumb="Themed Quiz Nights"
        kicker="£3 a player, teams of up to six"
        title="Themed quiz nights"
        lead="Every so often we throw out the general knowledge and build the whole quiz around one show. Same £3 entry, same six-a-side teams, considerably more shouting."
        actions={<BookTableButton source="themed_quiz_hero" />}
      />

      <section className="bg-surface py-section-y">
        <Container>
          <div className="space-y-4">
            <h2 className="text-h3 text-ink-strong">What makes it different</h2>
            <p className="text-lg leading-relaxed text-ink-muted">
              Our{' '}
              <Link
                href="/quiz-night"
                className="font-semibold text-accent-text underline decoration-dotted hover:text-anchor-gold"
              >
                monthly pub quiz
              </Link>{' '}
              mixes general knowledge, music, television, film and pictures. A themed night does not.
              Every round comes from one show, so the people who quote it constantly finally have their
              moment, and everyone else discovers how much they absorbed by accident.
            </p>
            <p className="leading-relaxed text-ink-muted">
              The format stays the same: £3 a player paid in cash, teams of up to six, 7pm start, and a
              comfort break in the middle. Phones stay in pockets during the rounds. Food is served
              before and during, and parking is free.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Badge variant="green">£3 a player</Badge>
              <Badge variant="green">Teams up to six</Badge>
              <Badge variant="green">One show, every round</Badge>
              <Badge variant="success">Free parking</Badge>
            </div>
          </div>
        </Container>
      </section>

      {upcoming.length > 0 && (
        <section className="bg-canvas py-section-y">
          <Container>
            <div>
              <h2 className="mb-6 text-h3 text-ink-strong">Coming up</h2>
              {upcoming.map((night) => (
                <Card key={night.name} className="mb-4">
                  <CardBody className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-wide text-accent-text">
                      {night.date}
                    </p>
                    <h3 className="font-display text-h4 text-ink-strong">{night.fullName}</h3>
                    <p className="leading-relaxed text-ink-muted">{night.copy}</p>
                    <Link
                      href={night.href}
                      className="inline-block font-semibold text-accent-text underline decoration-dotted hover:text-anchor-gold"
                    >
                      See the details and book
                    </Link>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="bg-surface py-section-y">
        <Container>
          <div>
            <h2 className="mb-6 text-h3 text-ink-strong">Themes we have run</h2>
            {past.map((night) => (
              <Card key={night.name} className="mb-4">
                <CardBody className="space-y-3">
                  <p className="text-sm text-ink-muted">{night.date}</p>
                  <h3 className="font-display text-h4 text-ink-strong">{night.fullName}</h3>
                  <p className="leading-relaxed text-ink-muted">{night.copy}</p>
                  <Link
                    href={night.href}
                    className="inline-block font-semibold text-accent-text underline decoration-dotted hover:text-anchor-gold"
                  >
                    How that night went
                  </Link>
                </CardBody>
              </Card>
            ))}
            <p className="mt-6 leading-relaxed text-ink-muted">
              Got a show you would turn out for? Tell us on the night, or call {CONTACT.phone}. Most of
              our themes started as somebody at the bar suggesting one.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-canvas py-section-y">
        <Container>
          <div className="space-y-4">
            <h2 className="text-h3 text-ink-strong">Seasonal nights are a different thing</h2>
            <p className="leading-relaxed text-ink-muted">
              Worth being straight about this, because the names suggest otherwise. Nights like{' '}
              <em>A Hint of Halloween</em>, <em>Sparks &amp; Sparklers</em> and{' '}
              <em>Tinsel &amp; Trivia</em> are our normal varied quiz with a few seasonal questions
              folded in. There is no specialist knowledge required and no costume needed. If you want a
              night where every round is one subject, that is a themed quiz, and they are listed above.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <BookTableButton source="themed_quiz_body" />
              <PhoneButton phone={CONTACT.phone} source="themed_quiz_body" />
            </div>
          </div>
        </Container>
      </section>

      <FAQAccordionWithSchema faqs={FAQS} title="Themed quiz night FAQs" />

      <CtaBand
        title="Next one is Only Fools and Horses"
        copy="Friday 25 September, £3 a player, raising money for Macmillan Cancer Support. Book a table and bring the friend who quotes it constantly."
        primary={<BookTableButton source="themed_quiz_cta" size="lg" />}
      />

      <InternalLinkingSection
        title="More nights at The Anchor"
        links={[
          { href: '/quiz-night', title: 'Monthly pub quiz', description: 'General knowledge, music and pictures, £3 a player.' },
          { href: '/cash-bingo', title: 'Cash bingo', description: 'Ten games, cash prizes and a rolling snowball jackpot.' },
          { href: '/music-bingo', title: 'Music bingo', description: 'Song clips instead of numbers, hosted by Nikki Manfadge.' },
          { href: '/whats-on', title: "What's on", description: 'Every upcoming night at the pub in one place.' }
        ]}
      />
    </>
  )
}
