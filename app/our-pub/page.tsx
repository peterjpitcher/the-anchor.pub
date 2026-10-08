import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { Container } from '@/components/ui'
import { DirectionsButton } from '@/components/DirectionsButton'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT, HEATHROW_TIMES, PARKING } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { JsonLd } from '@/components/JsonLd'
import { InteractiveVenueFloorPlan } from '@/components/private-hire/venue-tour'
import { DOGS_WORDING } from '@/lib/approved-wording'
import { PRIVATE_HIRE_CAPACITY } from '@/lib/private-hire-capacity'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Our Pub, Garden & Facilities | Stanwell Moor',
  description:
    `Look around The Anchor: the bar, a sunlit dining room, a beer garden under the Heathrow flight path, pool and darts. ${HEATHROW_TIMES.terminal5} minutes from Terminal 5.`,
  openGraph: {
    title: 'Inside The Anchor | Our Pub, Garden & Facilities',
    description:
      'Take a look around The Anchor in Stanwell Moor. Bar, dining room, beer garden under the Heathrow flight path, pool table and darts. Free parking, dog-friendly.',
    images: ['/images/our-pub/the-anchor-main-bar-area.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Inside The Anchor | Our Pub, Garden & Facilities',
    description:
      `Take a look around The Anchor in Stanwell Moor, bar, dining room, garden, pool and darts. ${HEATHROW_TIMES.terminal5} min from Heathrow T5.`,
    images: ['/images/our-pub/the-anchor-main-bar-area.jpg'],
  }),
  alternates: { canonical: '/our-pub' },
}

const imageGallerySchema = {
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: 'Inside The Anchor, Photos of Our Pub in Stanwell Moor',
  description:
    'Photo tour of The Anchor pub in Stanwell Moor near Heathrow Airport. Bar, dining room, beer garden, pool table and games area.',
  url: 'https://www.the-anchor.pub/our-pub',
  publisher: {
    '@type': 'BarOrPub',
    name: 'The Anchor',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Horton Road',
      addressLocality: 'Stanwell Moor',
      addressRegion: 'Surrey',
      postalCode: 'TW19 6AQ',
      addressCountry: 'GB',
    },
  },
}

const PHOTOS = {
  bar: {
    src: '/images/our-pub/the-anchor-bar.jpg',
    alt: 'Fully stocked bar at The Anchor with draught taps, spirits and gin collection',
  },
  diningIn: {
    src: '/images/our-pub/the-anchor-dining-room-interior.jpg',
    alt: 'The Anchor dining room interior with warm lighting and table settings',
  },
  diningOut: {
    src: '/images/our-pub/the-anchor-dining-room-garden-view.jpg',
    alt: 'View from The Anchor dining room through french doors to the garden',
  },
  garden: {
    src: '/images/our-pub/the-anchor-beer-garden-heathrow.jpg',
    alt: 'The Anchor beer garden with seating directly under the Heathrow flight path',
  },
  mainBar: {
    src: '/images/our-pub/the-anchor-main-bar-area.jpg',
    alt: 'Main bar area at The Anchor with dartboard and jukebox',
  },
  pool: {
    src: '/images/our-pub/the-anchor-pool-table.jpg',
    alt: 'Pool table area at The Anchor pub in Stanwell Moor',
  },
  poolBay: {
    src: '/images/our-pub/the-anchor-pool-table-bay-window.jpg',
    alt: 'Bay window seating near the pool table at The Anchor, perfect for a quieter meal',
  },
} as const

export default function OurPubPage() {
  return (
    <>
      <JsonLd data={imageGallerySchema} />

      {/* Hero */}
      <InteriorHero
        image="/images/page-headers/our-pub/the-anchor-our-pub.jpg"
        crumb="Our Pub"
        title="Take a Look Around"
        lead="A proper village pub since 1751, here's what's waiting for you"
      />

      {/* Interactive venue map */}
      <section className="border-b border-line bg-canvas py-section-y">
        <Container>
          <div className="mx-auto">
            <div className="mb-8 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
                Interactive venue map
              </p>
              <h2 className="font-display text-h2 text-ink-strong">
                Explore The Anchor
              </h2>
              <p className="mx-auto mt-3 text-ink-muted">
                Select a hire space or open a photo marker to look around the pub.
              </p>
            </div>

            <InteractiveVenueFloorPlan
              source="our_pub_page"
              initialSpaceId="dining-room"
            />
          </div>
        </Container>
      </section>

      {/* Intro */}
      <section className="py-section-y bg-surface border-b border-line">
        <Container>
          <p className="text-center text-lg md:text-xl text-ink mx-auto leading-relaxed">
            We could tell you all about The Anchor, a village pub since 1751,
            the plane-spotting garden, the gins behind the bar. But honestly?
            It&apos;s better to just show you. Here&apos;s a look around our pub in
            Stanwell Moor, just {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal&nbsp;5.
          </p>
        </Container>
      </section>

      {/* ── The Bar ── */}
      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="mx-auto">
            <h2 className="text-h3 text-ink-strong mb-8">
              Our Bar
            </h2>

            <div className="relative w-full aspect-[16/10] rounded-md overflow-hidden mb-8">
              <Image
                src={PHOTOS.bar.src}
                alt={PHOTOS.bar.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
                priority
              />
            </div>

            <div className="space-y-4">
              <p className="text-ink leading-relaxed">
                Whether you&apos;re after a cold pint, a gin and tonic or a
                whisky, the bar has you covered.
              </p>
              <p className="text-ink leading-relaxed">
                What&apos;s on draught and behind the bar changes from time to
                time, so the current list is on our drinks menu.{' '}
                <Link
                  href="/drinks"
                  className="text-accent-text font-semibold hover:text-accent hover:underline"
                >
                  Browse the full drinks menu&nbsp;&rarr;
                </Link>
              </p>
              <p className="text-ink leading-relaxed">
                We accept all major credit cards (yes, including American Express)
                and cash.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── The Dining Room ── */}
      <section className="py-section-y bg-surface border-b border-line">
        <Container>
          <div className="mx-auto">
            <h2 className="text-h3 text-ink-strong mb-8">
              The Dining Room
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden">
                <Image
                  src={PHOTOS.diningIn.src}
                  alt={PHOTOS.diningIn.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 550px"
                />
              </div>
              <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden">
                <Image
                  src={PHOTOS.diningOut.src}
                  alt={PHOTOS.diningOut.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 550px"
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-ink leading-relaxed">
                Our dining room is one of those spaces that changes with the
                seasons, and somehow gets better each time. In summer,
                sunshine floods through the french doors, which open straight out
                to the garden for that fresh, airy feel. In winter, the heating
                keeps things properly cosy. It seats {PRIVATE_HIRE_CAPACITY.spaces.diningRoom.seated} and it&apos;s always a
                lovely spot for a meal.
              </p>
              <p className="text-ink leading-relaxed">
                Here&apos;s the bit people don&apos;t expect: step out into the
                garden and planes land right overhead on their way into
                Heathrow. It&apos;s genuinely brilliant, especially if
                you&apos;ve got kids (or, let&apos;s be honest, if you&apos;re just
                into{' '}
                <Link
                  href="/plane-spotting-heathrow"
                  className="text-accent-text font-semibold hover:text-accent hover:underline"
                >
                  plane spotting
                </Link>
                ).
              </p>
              <p className="text-ink leading-relaxed">
                The dining room doubles as our{' '}
                <Link
                  href="/private-hire"
                  className="text-accent-text font-semibold hover:text-accent hover:underline"
                >
                  private hire space
                </Link>{' '}
                too. Book it for{' '}
                <Link
                  href="/private-hire/milestone-birthdays"
                  className="text-accent-text font-semibold hover:text-accent hover:underline"
                >
                  birthday parties
                </Link>
                , retirement dos, baby showers or business meetings,
                you get exclusive use of the room and full access to the bar.
                There&apos;s a TV in there as well, handy for a slideshow or a
                presentation.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── The Garden ── */}
      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="mx-auto">
            <h2 className="text-h3 text-ink-strong mb-8">
              The Garden
            </h2>

            <div className="relative w-full aspect-[16/10] rounded-md overflow-hidden mb-8">
              <Image
                src={PHOTOS.garden.src}
                alt={PHOTOS.garden.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
              />
            </div>

            <div className="space-y-4">
              <p className="text-ink leading-relaxed">
                This is the one we&apos;re properly proud of. Our{' '}
                <Link
                  href="/beer-garden"
                  className="text-accent-text font-semibold hover:text-accent hover:underline"
                >
                  beer garden
                </Link>{' '}
                sits directly under Heathrow&apos;s southern runway approach
                path. Planes come over about every 90&nbsp;seconds at peak times, at around 500 to
                800&nbsp;feet. It&apos;s mesmerising. Grab a drink, stretch out on
                the grass, and just look up. There&apos;s nothing quite like it.
              </p>
              <p className="text-ink leading-relaxed">
                With {PRIVATE_HIRE_CAPACITY.spaces.gardenTerrace.seated}&nbsp;seats across tables and open lawn, there&apos;s plenty
                of room whether you&apos;re here for a quiet pint, a family lunch
                or a bigger group. It&apos;s dog-friendly too, so bring the whole
                pack. On a warm afternoon, this{' '}
                <Link
                  href="/beer-garden"
                  className="text-accent-text font-semibold hover:text-accent hover:underline"
                >
                  pub garden near Heathrow
                </Link>{' '}
                is one of our favourite places to be, and we&apos;re rated
                4.6&nbsp;stars on Google.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Where the Action Happens ── */}
      <section className="py-section-y bg-surface border-b border-line">
        <Container>
          <div className="mx-auto">
            <h2 className="text-h3 text-ink-strong mb-8">
              Where the Action Happens
            </h2>

            <div className="relative w-full aspect-[16/10] rounded-md overflow-hidden mb-8">
              <Image
                src={PHOTOS.mainBar.src}
                alt={PHOTOS.mainBar.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
              />
            </div>

            <div className="space-y-4">
              <p className="text-ink leading-relaxed">
                The main bar area is the heart of The Anchor. This is where
                you&apos;ll find the dartboard, the jukebox and, more often
                than not, a good conversation with whoever&apos;s sitting
                next to you.
              </p>
              <p className="text-ink leading-relaxed">
                And the{' '}
                <Link
                  href="/pool-darts-pub"
                  className="text-accent-text font-semibold hover:text-accent hover:underline"
                >
                  dartboard
                </Link>
                ? Proper pub darts.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Pool, Games & a Quiet Corner ── */}
      <section className="py-section-y bg-canvas border-b border-line">
        <Container>
          <div className="mx-auto">
            <h2 className="text-h3 text-ink-strong mb-8">
              Pool, Games &amp; a Quiet Corner
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden">
                <Image
                  src={PHOTOS.pool.src}
                  alt={PHOTOS.pool.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 550px"
                />
              </div>
              <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden">
                <Image
                  src={PHOTOS.poolBay.src}
                  alt={PHOTOS.poolBay.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 550px"
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-ink leading-relaxed">
                Our{' '}
                <Link
                  href="/pool-darts-pub"
                  className="text-accent-text font-semibold hover:text-accent hover:underline"
                >
                  pool table
                </Link>{' '}
                is &pound;1 a game. It&apos;s
                tucked into its own area, the kind of spot where you&apos;ll
                lose an hour without noticing, especially with a couple of pints on
                the go. Mates, dates, work colleagues, everyone ends up round
                the pool table eventually.
              </p>
              <p className="text-ink leading-relaxed">
                Just past the pool table, there&apos;s a table in our second bay
                window. It&apos;s a little more removed from the buzz of the main
                bar, perfect if you want a quieter bite to eat or a catch-up
                without shouting over the jukebox. Best of both worlds: close enough
                to the action, far enough to actually hear each other.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <FAQAccordionWithSchema
        faqs={[
          {
            question: 'What drinks do you have on draught?',
            answer:
              'What\'s on draught changes from time to time, so the current list is on our drinks menu.',
          },
          {
            question: 'Can I hire the dining room for a private event?',
            answer:
              `Yes. Our dining room seats ${PRIVATE_HIRE_CAPACITY.spaces.diningRoom.seated} and is available for private hire, birthday parties, business meetings, retirement dos and more. You get exclusive use of the room with full bar access. Call us on 01753 682707 to discuss.`,
          },
          {
            question: 'Is the pub dog-friendly?',
            answer:
              `Yes. ${DOGS_WORDING}`,
          },
          {
            question: 'How much is the pool table?',
            answer:
              'The pool table is £1 a game.',
          },
          {
            question: 'Do you have parking?',
            answer:
              `We have ${PARKING.capacity} free parking spaces on site, all covered by CCTV and floodlit. We're just ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5.`,
          },
        ]}
      />

      {/* CTA */}
      <CtaBand
        title="That's The Anchor"
        copy={`A proper village pub since 1751, ${HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5, with ${PARKING.capacity} free parking spaces and room for everyone. Come and see it for yourself.`}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <BookTableButton source="our_pub_cta" size="lg" variant="primary" />
            <PhoneButton phone={CONTACT.phone} source="our-pub_cta" variant="outline" size="lg">
              Call {CONTACT.phone}
            </PhoneButton>
            <DirectionsButton href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor" source="our_pub_directions" variant="outline" size="lg">
              Get Directions
            </DirectionsButton>
          </div>
          <p className="text-sm text-anchor-cream-text/70">
            Just {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5 &middot; Free parking &middot; Dogs welcome
          </p>
          {/* /history, /about and /about/the-anchor-facts had no editorial
              inbound links at all, only nav and footer. This page is the
              natural place to send anyone who wants the longer version. */}
          <p className="text-sm text-anchor-cream-text/70">
            Want the longer version? Read{' '}
            <Link href="/history" className="font-semibold underline underline-offset-4">
              our history since 1751
            </Link>
            , find out{' '}
            <Link href="/about" className="font-semibold underline underline-offset-4">
              who we are
            </Link>{' '}
            or skim{' '}
            <Link href="/about/the-anchor-facts" className="font-semibold underline underline-offset-4">
              the facts and figures
            </Link>
            .
          </p>
        </div>
      </CtaBand>
    </>
  )
}
