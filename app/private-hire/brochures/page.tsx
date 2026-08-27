import type { Metadata } from 'next'
import Link from 'next/link'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { PhoneButton } from '@/components/PhoneButton'
import { Button, Container, SectionHeading } from '@/components/ui'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { BrochureGrid } from '@/components/features/PrivateHire/BrochureGrid'
import { CONTACT } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Event Brochures',
  description:
    'Download our 2026 event brochures. Spaces, buffets, drinks packages and how to book, for birthdays, christenings, baby showers, wakes, corporate events and more.',
  alternates: { canonical: './' },
}

export default function BrochuresPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Private Hire', url: '/private-hire' },
          { name: 'Event Brochures', url: '/private-hire/brochures' },
        ]}
      />

      <InteriorHero
        image="/images/page-headers/private-hire/private-hire.jpg"
        crumb="Brochures"
        title="2026 Event Brochures"
        lead="Everything we offer, written down. Pick the one that matches your occasion, or take the full brochure and browse the lot."
        actions={
          <>
            <Link href="/private-hire#enquiry">
              <Button variant="primary" size="lg" fullWidth>
                Build a quote
              </Button>
            </Link>
            <PhoneButton
              phone={CONTACT.phone}
              source="brochures_hero"
              variant="outline"
              size="lg"
            >
              Call {CONTACT.phone}
            </PhoneButton>
          </>
        }
      />

      <section className="py-section-y bg-canvas">
        <Container>
          <SectionHeading
            title="Pick your occasion"
            lead="Each brochure covers the same four spaces, every buffet and drinks package, and the four steps to book. The only difference is which combinations we put front and centre."
          />
          <BrochureGrid source="brochures_index" />
        </Container>
      </section>

      <section className="py-section-y bg-surface">
        <Container>
          <div className="rounded-xl border border-line bg-surface-sunk p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-accent-text">
              A note on the prices inside
            </h2>
            <div className="mt-3 space-y-3 text-ink-muted">
              <p>
                Brochure prices exclude VAT at 20%, and they were correct when the
                brochure was printed. Your written quote is the figure that counts, and
                it itemises VAT for you.
              </p>
              <p>
                For a number you can rely on today, use the{' '}
                <Link
                  href="/private-hire#enquiry"
                  className="font-semibold text-accent-text underline"
                >
                  cost estimator
                </Link>
                . It reads our live prices, so it stays right even when a brochure has
                been sitting in your downloads folder for a few months.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Not sure which space fits?"
        copy="Tell us your date and rough numbers and we will tell you straight what works, including if the date has gone."
        primary={
          <Link href="/private-hire#enquiry">
            <Button variant="primary" size="lg">
              Check availability
            </Button>
          </Link>
        }
        secondary={
          <PhoneButton
            phone={CONTACT.phone}
            source="brochures_cta_band"
            variant="outline"
            size="lg"
          >
            Call {CONTACT.phone}
          </PhoneButton>
        }
      />
    </>
  )
}
