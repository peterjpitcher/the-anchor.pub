import Link from 'next/link'
import { Metadata } from 'next'
import { Button, Card, Container, SectionHeading } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { getPastEvents, type Event } from '@/lib/api'
import { formatEventLocalDate } from '@/lib/event-calendar'
import { getEventWebsitePath } from '@/lib/event-url'
import { getCategoryPageUrl } from '@/lib/event-seo-strategy'

export const revalidate = 60 * 60 // 1 hour

export const metadata: Metadata = {
  title: 'Past Events',
  description:
    'Every quiz night, music bingo and cash bingo we have hosted at The Anchor in Stanwell Moor. Browse past nights to see what one is like before booking the next.',
  alternates: { canonical: './' },
  // A navigation surface, not a search landing page, so it follows the same
  // rule as the blog tag archives in tasks/gsc-indexing-fix/url-lifecycle-policy.md
  // §2 (case E): noindex but followed, so link equity still reaches the event
  // pages it exists to connect. Those pages are the ones meant to rank.
  robots: { index: false, follow: true },
}

type EventGroup = { key: string; label: string; events: Event[] }

/** Group past events under a "Month Year" heading, newest first. */
function groupByMonth(events: Event[]): EventGroup[] {
  const groups = new Map<string, EventGroup>()

  for (const event of events) {
    const date = new Date(event.startDate)
    if (Number.isNaN(date.getTime())) continue
    const key = formatEventLocalDate(event.startDate, { year: 'numeric', month: '2-digit' }) || ''
    const label = formatEventLocalDate(event.startDate, { month: 'long', year: 'numeric' }) || ''
    if (!key || !label) continue

    const existing = groups.get(label)
    if (existing) {
      existing.events.push(event)
    } else {
      groups.set(label, { key, label, events: [event] })
    }
  }

  return Array.from(groups.values())
}

export default async function EventArchivePage() {
  const pastEvents = await getPastEvents()
  const groups = groupByMonth(pastEvents)

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: "What's On", url: '/whats-on' },
          { name: 'Past Events', url: '/whats-on/archive' },
        ]}
      />

      <InteriorHero
        image="/images/events/quiz-night/the-anchor-quiz-night-stanwell-moor.jpg"
        focal="center"
        crumb="What's On"
        title="Past events at The Anchor"
        lead="Every night we have hosted, still online. Have a look at what one of our evenings is actually like before you book the next one."
        actions={
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/whats-on">See what&rsquo;s coming up</Link>
          </Button>
        }
      />

      <section className="bg-canvas py-section-y">
        <Container>
          {groups.length === 0 ? (
            <div className="mx-auto text-center">
              <p className="text-ink-muted">
                We could not load the event archive just now. Please{' '}
                <Link href="/whats-on" className="font-semibold underline">
                  see what is coming up
                </Link>{' '}
                instead.
              </p>
            </div>
          ) : (
            <>
              <SectionHeading
                kicker="The archive"
                title={`${pastEvents.length} nights and counting`}
                lead="Listed newest first. Every page shows the theme, the host and what the night involved."
              />

              <div className="mx-auto space-y-10">
                {groups.map((group) => (
                  <div key={group.label}>
                    <h2 className="mb-4 border-b border-line pb-2 text-h4 text-ink-strong">
                      {group.label}
                    </h2>
                    <ul className="space-y-3">
                      {group.events.map((event) => {
                        const categoryUrl = getCategoryPageUrl(event.category?.slug)
                        return (
                          <li key={event.id || event.slug}>
                            <Card hover accent className="p-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                                <div className="min-w-0">
                                  <Link
                                    href={getEventWebsitePath(event)}
                                    className="text-lg font-semibold text-ink-strong underline-offset-2 hover:underline"
                                  >
                                    {event.name}
                                  </Link>
                                  <p className="mt-1 text-sm text-ink-muted">
                                    {formatEventLocalDate(event.startDate, {
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })}
                                  </p>
                                </div>
                                {event.category?.name && categoryUrl !== '/whats-on' && (
                                  <Link
                                    href={categoryUrl}
                                    className="shrink-0 text-sm font-semibold text-accent-text hover:underline"
                                  >
                                    More {event.category.name} &rarr;
                                  </Link>
                                )}
                              </div>
                            </Card>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </Container>
      </section>

      <CtaBand
        title="Fancy the next one?"
        copy="Our quiz nights, music bingo and cash bingo run every month. Pick a date and reserve a table."
      >
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/whats-on">See what&rsquo;s on</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/book-table">Book a table</Link>
        </Button>
      </CtaBand>
    </>
  )
}
