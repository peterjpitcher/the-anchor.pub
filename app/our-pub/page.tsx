import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { Button, Container } from '@/components/ui'
import { InteriorHero } from '@/components/hero'
import { CtaBand } from '@/components/CtaBand'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { JsonLd } from '@/components/JsonLd'
import { InteractiveVenueFloorPlan } from '@/components/private-hire/venue-tour'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Our Pub, Garden & Facilities | Stanwell Moor',
  description:
    'Take a look around The Anchor in Stanwell Moor. Bar with 18 gins and 17 whiskeys, sunlit dining room, beer garden under the Heathrow flight path, pool table and darts. 7 min from T5.',
  openGraph: {
    title: 'Inside The Anchor | Our Pub, Garden & Facilities',
    description:
      'Take a look around The Anchor in Stanwell Moor. Bar, dining room, beer garden under the Heathrow flight path, pool table and darts. Free parking, dog-friendly.',
    images: ['/images/our-pub/the-anchor-main-bar-area.jpg'],
  },
  twitter: getTwitterMetadata({
    title: 'Inside The Anchor | Our Pub, Garden & Facilities',
    description:
      'Take a look around The Anchor in Stanwell Moor, bar, dining room, garden, pool and darts. 7 min from Heathrow T5.',
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
            the plane-spotting garden, the 18&nbsp;gins behind the bar. But honestly?
            It&apos;s better to just show you. Here&apos;s a look around our pub in
            Stanwell Moor, just seven minutes from Heathrow Terminal&nbsp;5.
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
                Whether you&apos;re after a cold pint of Guinness, a Tanqueray and
                tonic, or something from our collection of 17&nbsp;whiskeys, the bar
                has you covered. We pour seven draught lines, Birra Moretti,
                Stella Artois, Fosters, Carlsberg, Guinness, Aspall cider and
                Inch&apos;s.
              </p>
              <p className="text-ink leading-relaxed">
                Behind the bar, things get interesting. Our gin shelf runs
                18&nbsp;deep, from Hendrick&apos;s and Bombay Sapphire to Tanqueray
                Flor de Sevilla, Warner&apos;s Honeybee and Whitley Neill Rhubarb.
                More of a whiskey person? Take your pick from Glenfiddich, Talisker,
                Bowmore 12&nbsp;Year, Maker&apos;s Mark, Monkey Shoulder and plenty
                more besides.{' '}
                <Link
                  href="/drinks"
                  className="text-accent-text font-semibold hover:text-accent hover:underline"
                >
                  Browse the full drinks menu&nbsp;&rarr;
                </Link>
              </p>
              <p className="text-ink leading-relaxed">
                We accept all major credit cards (yes, including American Express)
                and cash. If you&apos;re a regular or bringing the team, we can set
                up business accounts for monthly invoicing too.
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
                keeps things properly cosy. It seats 26 and it&apos;s always a
                lovely spot for a meal.
              </p>
              <p className="text-ink leading-relaxed">
                Here&apos;s the bit people don&apos;t expect: you can watch planes
                landing and taking off from Heathrow right from your table. The
                south runway is close enough that you can spot airline liveries
                while you eat. It&apos;s genuinely brilliant, especially if
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
                you get exclusive use of the room, full access to the bar, and the
                option to extend into the garden. There&apos;s a TV in there as
                well, handy for presentations or watching live events.
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
                sits directly under Heathrow&apos;s south runway, planes
                come over every 90&nbsp;seconds or so, at around 500 to
                800&nbsp;feet. It&apos;s mesmerising. Grab a drink, stretch out on
                the grass, and just look up. There&apos;s nothing quite like it.
              </p>
              <p className="text-ink leading-relaxed">
                With 64&nbsp;seats across tables and open lawn, there&apos;s plenty
                of room whether you&apos;re here for a quiet pint, a family lunch
                or a bigger group. It&apos;s dog-friendly too, so bring the whole
                pack. On a warm afternoon, this{' '}
                <Link
                  href="/beer-garden"
                  className="text-accent-text font-semibold hover:text-accent hover:underline"
                >
                  pub garden near Heathrow
                </Link>{' '}
                is honestly one of the best spots around, and we&apos;re not
                the only ones who think so (4.6&nbsp;stars on Google, 238&nbsp;reviews
                and counting).
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
                The jukebox deserves a mention on its own. It plays throughout the
                pub, inside and out in the garden, so the music
                follows you wherever you go. And the{' '}
                <Link
                  href="/pool-darts-pub"
                  className="text-accent-text font-semibold hover:text-accent hover:underline"
                >
                  dartboard
                </Link>
                ? Proper pub darts. No booking needed, just grab your arrows and
                play.
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
                is &pound;1 a game and available whenever we&apos;re open. It&apos;s
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
              'We pour seven draught lines: Birra Moretti, Stella Artois, Fosters, Carlsberg, Guinness, Aspall cider and Inch\'s cider.',
          },
          {
            question: 'Can I hire the dining room for a private event?',
            answer:
              'Yes. Our dining room seats 26 and is available for private hire, birthday parties, business meetings, retirement dos and more. You get exclusive use of the room with full bar access and the option to extend into the garden. Call us on 01753 682707 to discuss.',
          },
          {
            question: 'Is the pub dog-friendly?',
            answer:
              'Absolutely. Dogs are welcome inside and in the garden. We provide water bowls and treats are available at the bar.',
          },
          {
            question: 'How much is the pool table?',
            answer:
              'The pool table is £1 a game and available at all times we\'re open. No booking needed.',
          },
          {
            question: 'Do you have parking?',
            answer:
              'We have 20 free parking spaces on site, all covered by CCTV and floodlit. We\'re just seven minutes from Heathrow Terminal 5.',
          },
        ]}
      />

      {/* CTA */}
      <CtaBand
        title="That's The Anchor"
        copy="A proper village pub since 1751, seven minutes from Heathrow, with 20 free parking spaces and room for everyone. Come and see it for yourself."
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <BookTableButton source="our_pub_cta" size="lg" variant="primary" />
            <PhoneButton phone={CONTACT.phone} source="our-pub_cta" variant="outline" size="lg">
              Call {CONTACT.phone}
            </PhoneButton>
            <Button asChild size="lg" variant="outline">
              <Link
                href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
              </Link>
            </Button>
          </div>
          <p className="text-sm text-anchor-cream-text/70">
            Just 7 minutes from Heathrow Terminal 5 &middot; Free parking &middot; Dogs welcome
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
