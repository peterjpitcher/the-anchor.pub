import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui'
import { getCompetitionContent } from '@/lib/competition-content'
import { getCompetitionStatus } from '@/lib/competition-status'
import { CompetitionStatusNotice } from './CompetitionStatusNotice'

const COMPETITION_SLUG = 'quiz-night-guessing-competition'
const LONDON_TIME_ZONE = 'Europe/London'

export const metadata: Metadata = {
  title: 'Quiz Night Guessing Competition Terms',
  description: 'Terms for The Anchor Quiz Night Guessing Competition.',
  alternates: {
    canonical: '/quiz-night-competition-terms'
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true
    }
  },
  openGraph: {
    title: 'Quiz Night Guessing Competition Terms | The Anchor',
    description: 'Competition details and full terms for The Anchor Quiz Night Guessing Competition.',
    url: '/quiz-night-competition-terms',
    type: 'website'
  }
}

function formatEventDate(eventDate: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${eventDate}T12:00:00Z`))
}

function formatTime(dateTime: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(dateTime)).replace(' ', '')
}

export default async function QuizNightCompetitionTermsPage() {
  const competition = await getCompetitionContent(COMPETITION_SLUG)
  const eventDateLabel = formatEventDate(competition.eventDate)
  const closingTimeLabel = formatTime(competition.closingDateTime)
  const initialStatus = getCompetitionStatus(competition)

  const summaryItems = [
    { label: 'Event date', value: eventDateLabel },
    { label: 'Entries close', value: `${closingTimeLabel} on ${eventDateLabel}` },
    { label: 'Entry channel', value: competition.entryChannel },
    { label: 'Minimum age', value: `${competition.minimumEntryAge} or over` },
    { label: 'Entry limit', value: competition.entryLimit },
    { label: 'Winner announced', value: competition.winnerAnnouncement }
  ]

  return (
    <div className="bg-canvas">
      <section className="border-b border-line bg-surface py-10 sm:py-14">
        <Container as="article">
          <Link
            href="/quiz-night"
            className="text-sm font-semibold text-accent-text hover:underline"
          >
            Back to Quiz Night
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-accent-text">
            {eventDateLabel}
          </p>
          <h1 className="mt-3 font-display text-h2 text-ink-strong">
            {competition.competitionTitle} Terms
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Read the competition details and full terms before entering through the designated WhatsApp group.
          </p>

          <div className="mt-7">
            <CompetitionStatusNotice
              openingDateTime={competition.openingDateTime}
              closingDateTime={competition.closingDateTime}
              eventDateLabel={eventDateLabel}
              closingTimeLabel={closingTimeLabel}
              closedMessage={competition.closedCompetitionMessage}
              initialStatus={initialStatus}
            />
          </div>
        </Container>
      </section>

      <section className="py-8 sm:py-12">
        <Container as="article">
          <div className="rounded-md border border-line bg-surface p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-h4 text-ink-strong">Competition details</h2>

            <dl className="mt-5 divide-y divide-line">
              {summaryItems.map((item) => (
                <div key={item.label} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-5">
                  <dt className="text-sm font-semibold text-ink-strong">{item.label}</dt>
                  <dd className="text-sm leading-relaxed text-ink-muted">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 rounded-md bg-surface-sunk p-4 sm:p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-strong">
                Competition question
              </h2>
              <p className="mt-2 leading-relaxed text-ink-muted">{competition.competitionQuestion}</p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <h2 className="font-semibold text-ink-strong">How the winner is selected</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {competition.winnerSelection}. Tie-break: {competition.tieBreakMethod}.
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-ink-strong">Prize choices</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-muted">
                  {competition.prizeChoices.map((prize) => (
                    <li key={prize}>{prize}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-ink-muted">Redemption: {competition.redemption}.</p>
              </div>
            </div>

            <p className="mt-6 border-t border-line pt-5 text-sm leading-relaxed text-ink-muted">
              <strong className="text-ink-strong">Promoter:</strong>{' '}
              {competition.promoterName}, {competition.promoterAddress}.
            </p>
          </div>

          <div className="mt-8 rounded-md border border-line bg-surface p-5 shadow-sm sm:mt-10 sm:p-8">
            <h2 className="font-display text-h3 text-ink-strong">Full terms</h2>
            <div
              className="prose mt-6 max-w-none prose-headings:font-display prose-headings:text-ink-strong prose-p:text-ink-muted prose-li:text-ink-muted prose-strong:text-ink-strong"
              dangerouslySetInnerHTML={{ __html: competition.fullTermsHtml }}
            />
          </div>
        </Container>
      </section>
    </div>
  )
}
