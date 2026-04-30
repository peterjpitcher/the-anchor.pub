import Link from 'next/link'
import { Button, Container, SectionHeader } from '@/components/ui'
import { HeroWrapper } from '@/components/hero'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Safety and Respect',
  description: 'A pub where everyone is genuinely welcome. Our commitment to a safe, respectful environment at The Anchor, Stanwell Moor.',
  alternates: {
    canonical: '/safety-and-respect'
  }
}

export default function SafetyAndRespectPage() {
  return (
    <>

      <HeroWrapper
        route="/safety-and-respect"
        title="Safety and Respect"
        description="A pub where you can walk in and feel at ease — whoever you are"
        variant="default"
      />

      {/* Intro */}
      <section className="section-spacing bg-anchor-bg">
        <Container>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-anchor-cream-text/70 leading-relaxed">
              We're the kind of pub where you can walk in on your own or with a group, whatever your background, and feel at ease. That's not accidental — it's how we run things.
            </p>
          </div>
        </Container>
      </section>

      {/* Everyone's welcome */}
      <section className="section-spacing bg-anchor-bg-raised">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader title="Everyone's welcome" />
            <div className="space-y-4 text-anchor-cream-text/70 leading-relaxed">
              <p>
                The Anchor is a proper local, but you don't need to be local to feel welcome here. We get solo visitors who just want a quiet pint, families out for Sunday lunch, groups celebrating birthdays, regulars who've been coming for years, and people who've never set foot in the place before. They all get the same thing: a decent drink, good food if they want it, and staff who actually pay attention.
              </p>
              <p>
                We're near Heathrow, so we see travellers, airline crew, people killing time before a flight, and people who've just landed and want something that isn't an airport bar. We get new residents who've moved to the area and are looking for somewhere to become a regular. We get older couples, younger groups, dog walkers, plane spotters — the lot.
              </p>
              <p>
                The common thread is simple: everyone here treats everyone else with respect. That's not a rule we had to invent. It's just the kind of place this is.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Our standards */}
      <section className="section-spacing bg-anchor-bg">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader title="Our standards" />
            <div className="space-y-4 text-anchor-cream-text/70 leading-relaxed">
              <p>
                We have zero tolerance for harassment, discrimination, or behaviour that makes anyone feel unwelcome. That applies to guests and to staff — no exceptions.
              </p>
              <p>
                Our team is here to help. If something doesn't feel right, tell any member of staff. You don't need to explain. You don't need to make a case. We'll take it from there.
              </p>
              <p>
                We act on concerns promptly. Anyone asked to leave won't be asked twice.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* If something doesn't feel right */}
      <section className="section-spacing bg-anchor-bg-raised">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader title="If something doesn't feel right" />
            <div className="space-y-4 text-anchor-cream-text/70 leading-relaxed">
              <p>
                Tell any member of our team. You don't need a reason or an explanation. We'll deal with it.
              </p>
              <p>
                You can approach the bar, speak to any member of staff on the floor, or ask someone to fetch a manager. Whatever's easiest. We'd rather you said something than sat with it.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Our events */}
      <section className="section-spacing bg-anchor-bg">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader title="Our events" />
            <div className="space-y-4 text-anchor-cream-text/70 leading-relaxed">
              <p>
                We run a full events programme — quiz nights, cash bingo, music bingo, drag cabaret shows and gameshow house parties, many hosted by the brilliant Nikki Manfadge. Our events are designed to be fun, a little ridiculous, and welcoming for everyone. The atmosphere is warm, the crowd is mixed, and nobody takes themselves too seriously.
              </p>
              <p>
                Check our <Link href="/whats-on" className="text-anchor-gold font-semibold hover:text-anchor-gold-vivid transition">what's on page</Link> for upcoming events.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <FAQAccordionWithSchema
        className="bg-anchor-bg"
        title="Frequently Asked Questions"
        faqs={[
          {
            question: 'Is The Anchor dog-friendly?',
            answer: 'Yes, dogs are welcome in the bar and beer garden.'
          },
          {
            question: 'Is The Anchor family-friendly?',
            answer: 'Yes — families are welcome. Children are always welcome — we\'re completely family friendly.'
          },
          {
            question: 'What should I do if I feel uncomfortable?',
            answer: "Tell any member of our team. You don't need to explain yourself. We'll deal with it."
          },
          {
            question: 'Are your events suitable for everyone?',
            answer: "Our events — quiz nights, music bingo, cash bingo, drag cabaret shows and more — are aimed at adults and designed to be fun for everyone. We check the room, not who's in it."
          },
          {
            question: 'Do you have a harassment policy?',
            answer: 'Zero tolerance. Anyone making another guest or member of staff feel unsafe or unwelcome will be asked to leave.'
          }
        ]}
      />

      {/* Contact / CTA */}
      <section className="bg-gradient-to-br from-anchor-green to-anchor-green/90 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Questions? Get in touch.
            </h2>
            <p className="text-lg text-white/90 mb-8">
              If you have any questions about accessibility, events, or anything else, we're happy to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="tel:+441753682707">
                <Button size="lg" variant="secondary" className="bg-anchor-bg-card text-anchor-gold-vivid hover:bg-anchor-bg-raised">
                  Call 01753 682707
                </Button>
              </Link>
              <Link href="/book-table">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  Book a Table
                </Button>
              </Link>
              <Link href="/whats-on">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  What's On
                </Button>
              </Link>
            </div>
            <p className="text-white/70 mt-8 text-sm">
              <Link href="/near-heathrow" className="text-white/70 hover:text-white transition underline">7 minutes from Heathrow</Link> · Free parking · Dogs welcome
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}
