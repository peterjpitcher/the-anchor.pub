import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { HeroWrapper } from '@/components/hero'
import { JsonLd } from '@/components/JsonLd'
import { FAQAccordionWithSchema } from '@/components/FAQAccordionWithSchema'
import { BookTableButton } from '@/components/BookTableButton'
import { DirectionsButton } from '@/components/DirectionsButton'
import { PhoneButton } from '@/components/PhoneButton'
import { CONTACT } from '@/lib/constants'
import { getTwitterMetadata } from '@/lib/twitter-metadata'
import { CTASection } from '@/components/CTASection'
import {
  Container,
  Section,
  SectionHeader,
} from '@/components/ui'

export const metadata: Metadata = {
  title: 'History of The Anchor, Stanwell Moor | Village Pub Since 1751',
  description:
    'The history of The Anchor in Stanwell Moor, a village pub since at least 1751 with roots reaching back to 1730. Locally listed Victorian building near Heathrow Terminal 5.',
  alternates: { canonical: '/history' },
  openGraph: {
    title: 'The History of The Anchor | Stanwell Moor Village Pub Since 1751',
    description:
      'Discover the story of The Anchor in Stanwell Moor. From an 18th-century inn on the moor to the closest traditional pub to Heathrow. Nearly three centuries of village life.',
    url: '/history',
    siteName: 'The Anchor',
    locale: 'en_GB',
    type: 'article',
    images: [
      {
        url: '/images/history/lal-and-charlie-eeles.jpg',
        width: 1200,
        height: 800,
        alt: 'Lal and Charlie Eeles behind the bar at The Anchor, Stanwell Moor',
      },
    ],
  },
  twitter: getTwitterMetadata({
    title: 'The History of The Anchor | Stanwell Moor Village Pub Since 1751',
    description:
      'From an 18th-century inn on the moor to the closest traditional pub to Heathrow. Nearly three centuries of Stanwell Moor village life.',
    images: ['/images/history/lal-and-charlie-eeles.jpg'],
  }),
}

const historyPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  name: 'The History of The Anchor, Stanwell Moor',
  headline: 'The History of The Anchor, Stanwell Moor',
  description:
    'The history of The Anchor in Stanwell Moor, a village pub since at least 1751 with roots reaching back to 1730. Locally listed Victorian building near Heathrow.',
  url: 'https://www.the-anchor.pub/history',
  datePublished: '2026-05-21',
  dateModified: '2026-05-21',
  publisher: {
    '@type': 'BarOrPub',
    name: 'The Anchor',
    url: 'https://www.the-anchor.pub',
  },
  about: {
    '@type': 'BarOrPub',
    name: 'The Anchor',
    foundingDate: '1751',
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

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.the-anchor.pub',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Our History',
      item: 'https://www.the-anchor.pub/history',
    },
  ],
}

export default function HistoryPage(): React.JSX.Element {
  return (
    <>
      <JsonLd data={[historyPageSchema, breadcrumbSchema]} />

      {/* Hero */}
      <HeroWrapper
        route="/history"
        title="The History of The Anchor"
        description="A village pub in Stanwell Moor since at least 1751"
        variant="default"
        tags={[
          { label: 'Est. 1751', variant: 'default', size: 'medium' },
          { label: 'Locally Listed', variant: 'success', size: 'medium' },
          { label: 'Stanwell Moor', variant: 'primary', size: 'medium' },
        ]}
        primaryCta={
          <BookTableButton
            source="history_hero"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          />
        }
        secondaryCta={
          <DirectionsButton
            href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ"
            source="history_hero"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Get Directions
          </DirectionsButton>
        }
      />

      {/* Intro */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="A Pub on the Moor Since at Least 1751"
              subtitle="Nearly three centuries of pouring pints and welcoming strangers"
            />

            <div className="space-y-6 text-lg text-anchor-cream-text/80 leading-relaxed">
              <p>
                The Anchor is more than a pub near Heathrow. It is one of Stanwell
                Moor&apos;s oldest landmarks, a village local with roots reaching back
                through centuries of rural life, family stories, wartime loss and
                community gatherings.
              </p>

              <p>
                The pub&apos;s own history gives an establishment date of <strong>1751</strong>,
                and local historic records suggest that an Anchor Inn was already present
                in Stanwell Moor by <strong>1730</strong>. The building standing today is
                believed to be mid-Victorian, built on the site of that earlier inn. The
                story of The Anchor is older than the present walls.
              </p>

              <p>
                In <strong>2004</strong>, Spelthorne Borough Council locally listed The
                Anchor (reference LL/072), recognising its architectural and historic
                interest. The listing describes it as a mid-Victorian pub with a
                two-storey hipped-roof main building, single-storey side wings, a central
                porch and bay windows, standing at the junction opposite Horton Road.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Auctions, Blacksmiths and Working Village Life */}
      <Section background="dark" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Auctions, Blacksmiths and Working Village Life"
              subtitle="Long before anyone dreamed of building an airport next door"
            />

            <div className="space-y-6 text-lg text-anchor-cream-text/80 leading-relaxed">
              <p>
                Long before the sound of aircraft overhead, Stanwell Moor was a working
                village of farms, mills, cottages, horses and carts. The Anchor stood at
                the heart of that life. In <strong>1813</strong>, a nearby smithy and
                cottage were put up for auction at the pub. Local history records describe
                The Anchor as a key village landmark, routinely used for public events
                such as auctions.
              </p>

              <p>
                The pub&apos;s link with the blacksmith trade gives a glimpse of the old
                village. Before motor vehicles, local farms, carts and mills depended on
                horses and repairs. In <strong>1861</strong>, a blacksmith named William
                Webb was recorded at The Anchor, with enough work to employ a colleague.
                By <strong>1915</strong>, a former forge adjoining The Anchor Inn was
                being offered for sale, marking the fading of a trade that had once been
                central to village life.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* The Publicans of The Anchor */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="The Publicans of The Anchor"
              subtitle="The families who called this pub home"
            />

            <div className="max-w-2xl mx-auto mb-10">
              <div className="relative w-full overflow-hidden border border-anchor-gold/20">
                <Image
                  src="/images/history/the-anchor-c1910.png"
                  alt="The Anchor, Stanwell Moor, around 1910 — the brick pub with Isleworth Brewery 'Ales and Stout' signage and a group of villagers gathered outside the entrance"
                  width={1532}
                  height={1027}
                  className="w-full h-auto"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>
              <p className="text-sm text-anchor-cream-text/50 mt-3 text-center">
                The Anchor around 1910, in its Isleworth Brewery days
              </p>
            </div>

            <div className="space-y-6 text-lg text-anchor-cream-text/80 leading-relaxed">
              <p>
                Victorian records bring some of The Anchor&apos;s early publicans into
                view. <strong>J Lintill</strong> is recorded at the pub in{' '}
                <strong>1855</strong>, one of the earliest named people connected directly
                to The Anchor after the 1730 evidence.
              </p>

              <p>
                The <strong>Sidwell family</strong> appears through the second half of the
                nineteenth century. R F Sidwell is listed in 1866, then Edwin Sidwell in
                the 1870s and 1880s. In the <strong>1881 census</strong>, Edwin Sidwell
                was described as a licensed victualler, aged 38, born in Stanwell. His
                household included his wife Fanny, children Amy Gertrude, Ernest Walter
                and Bertie Alfred, and a 14-year-old domestic servant. The Anchor was not
                just a bar. It was a family home, a workplace and a place where servants,
                boarders, travellers and locals crossed paths.
              </p>

              <p>
                <strong>Mrs Mary Ann Benn</strong> is recorded through the 1890s. In the{' '}
                <strong>1891 census</strong> she is listed as landlady, aged 50, born in
                Hampton Wick, with a visitor and a boarder from Denham in her household.
                Mary Ann Benn and Sarah Cooper, who followed her, give The Anchor a strong
                thread of women running the pub, a fact that a lot of pub histories
                overlook.
              </p>
            </div>

            {/* Timeline */}
            <div className="mt-12 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-anchor-cream-text mb-8 text-center">
                Known Publicans and Key Dates
              </h3>
              <div className="space-y-4">
                {[
                  { year: '1751', event: "The Anchor's established date" },
                  { year: '1813', event: 'Smithy and cottage auctioned at The Anchor' },
                  { year: '1855', event: 'J Lintill recorded at The Anchor' },
                  { year: '1861', event: 'Blacksmith William Webb recorded at the pub' },
                  { year: '1864–70', event: 'Present mid-Victorian building appears on Ordnance Survey' },
                  { year: '1866', event: 'R F Sidwell at The Anchor' },
                  { year: '1874–81', event: 'Edwin Sidwell, licensed victualler' },
                  { year: '1890–99', event: 'Mrs Mary Ann Benn, landlady' },
                  { year: 'c. 1902', event: 'William and Sarah Cooper become landlords' },
                  { year: '1907', event: 'William Cooper dies; Sarah continues as licensee' },
                  { year: '1915', event: 'Former forge adjoining The Anchor offered for sale' },
                  { year: '1917', event: 'Harry Cooper lost on HMS Vanguard' },
                  { year: '1922', event: 'Charles Edwin Eeles placed at The Anchor Inn' },
                  { year: '1937', event: 'Sarah Cooper last recorded at the pub' },
                  { year: '1951–52', event: 'Charlie Eeles identified in Stanwell Moor FC photo' },
                  { year: '2004', event: 'Locally listed by Spelthorne Borough Council (LL/072)' },
                  { year: '2005–19', event: 'Martine and Ronnie at The Anchor' },
                  { year: '2019–', event: 'Billy and Peter take over The Anchor' },
                ].map((item) => (
                  <div key={item.year} className="flex gap-4 items-baseline">
                    <span className="text-anchor-gold-vivid font-bold text-sm whitespace-nowrap min-w-[100px] text-right">
                      {item.year}
                    </span>
                    <span className="text-anchor-cream-text/80">
                      {item.event}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Sarah Cooper and Harry Cooper */}
      <Section background="dark" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Sarah Cooper and the Loss of Harry Cooper"
              subtitle="A wartime story that begins and ends at The Anchor"
            />

            <div className="space-y-6 text-lg text-anchor-cream-text/80 leading-relaxed">
              <p>
                <strong>Sarah Cooper</strong> is one of the most important names in The
                Anchor&apos;s story. She is recorded as landlady from at least{' '}
                <strong>1914</strong> through to <strong>1937</strong>. Family history says
                William and Sarah Cooper became landlords around 1902, with Sarah running
                the pub while William worked elsewhere during the day. After William died
                in <strong>1907</strong>, Sarah continued as licensee with help from her
                family.
              </p>

              <p>
                Sarah&apos;s story is also tied to one of the saddest episodes in the
                pub&apos;s history. Her son, <strong>Harry Cooper</strong>, was a railway
                worker before the war. A family account says he often drank in his
                mother&apos;s pub and was friends with George Slade. According to that
                account, a remark made in the pub about men in protected railway jobs
                being cowards angered Harry enough to volunteer for service.
              </p>

              <p>
                Harry joined the Royal Navy in <strong>1916</strong> and served as a
                Stoker 1st Class on HMS Vanguard. On <strong>9 July 1917</strong>, HMS
                Vanguard was destroyed by an accidental internal explosion at Scapa Flow.{' '}
                <strong>843 men were lost and only 2 survived.</strong> Harry was 33 years
                old.
              </p>

              <p>
                The Commonwealth War Graves Commission records Harry as the son of William
                and Sarah Cooper of <strong>&ldquo;The Anchor Inn,&rdquo; Stanwell
                Moor, Staines</strong>. A remark made in this pub sent a young man to war,
                and his name came back on a casualty list to the same address.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* The Eeles Family */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="The Eeles Family and Village Memories"
              subtitle="Football, families and the village local"
            />

            <div className="md:flex md:gap-10 md:items-start">
              <div className="md:flex-1 space-y-6 text-lg text-anchor-cream-text/80 leading-relaxed">
                <p>
                  The Eeles family is another important part of The Anchor&apos;s story. A{' '}
                  <strong>1922</strong> London Gazette notice places{' '}
                  <strong>Charles Edwin Eeles</strong> at &ldquo;The Anchor Inn, Stanwell
                  Moor, Staines, Middlesex.&rdquo;
                </p>

                <p>
                  Later, a <strong>1951&ndash;52</strong> photograph of Stanwell Moor
                  Football Club cup winners, likely taken at the side of The Anchor,
                  identifies <strong>Charlie Eeles</strong> with the pub. The Anchor was
                  not just a drinking place. It was a backdrop to village sport, local
                  pride and community photographs.
                </p>

                <p>
                  Local memories connect Charlie and <strong>Lal Eeles</strong> with The
                  Anchor across the middle decades of the twentieth century. The
                  photograph here shows them behind the bar, with Watney&apos;s Special
                  Mild, Carlsberg and Ben Truman on the pumps, a snapshot of a proper
                  village local in its heyday.
                </p>

                <p className="text-anchor-cream-text/60 italic">
                  We are still gathering dates and memories from the Eeles period. If you
                  have photographs, stories or family connections, we would love to hear
                  from you.
                </p>
              </div>

              <div className="mt-8 md:mt-0 md:w-[420px] flex-shrink-0">
                <div className="relative aspect-[4/3] w-full overflow-hidden border border-anchor-gold/20">
                  <Image
                    src="/images/history/lal-and-charlie-eeles.jpg"
                    alt="Lal and Charlie Eeles behind the bar at The Anchor, Stanwell Moor, with Watney's Special Mild, Carlsberg and Ben Truman visible on the pumps"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 420px"
                  />
                </div>
                <p className="text-sm text-anchor-cream-text/50 mt-3 text-center">
                  Lal and Charlie Eeles behind the bar at The Anchor
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Lal's Prayer */}
      <Section background="dark" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="Lal&apos;s Prayer"
              subtitle="Written by Lal Eeles, landlady of The Anchor"
            />

            <div className="max-w-xl mx-auto">
              <div className="relative w-full overflow-hidden border border-anchor-gold/20">
                <Image
                  src="/images/history/lals-prayer-handwritten.png"
                  alt="The original handwritten manuscript of Lal's Prayer by Lal Eeles, landlady of The Anchor"
                  width={800}
                  height={1400}
                  className="w-full h-auto"
                  sizes="(max-width: 768px) 100vw, 576px"
                />
              </div>
              <p className="text-sm text-anchor-cream-text/50 mt-3 text-center">
                The original handwritten manuscript
              </p>
            </div>

            <details className="mt-8 max-w-xl mx-auto">
              <summary className="text-sm text-anchor-cream-text/60 cursor-pointer hover:text-anchor-cream-text/80 transition-colors text-center list-none">
                <span className="underline underline-offset-4">Read transcript</span>
              </summary>
              <div className="mt-6 space-y-5 text-anchor-cream-text/70 leading-relaxed italic text-center text-sm">
                <div className="space-y-0.5">
                  <p>Oh Lord! Your help I beg of thee</p>
                  <p>To treat my flock as family</p>
                  <p>Their bad points make me not to see</p>
                  <p>Oh Lord I have such faith in thee</p>
                </div>
                <div className="space-y-0.5">
                  <p>Oh Lord show me and help me know</p>
                  <p>The people here that come and go</p>
                  <p>Such a good and kind and cheerful crew</p>
                  <p>Yet I&apos;ve cursed and shouted, often loud</p>
                </div>
                <div className="space-y-0.5">
                  <p>Oh Lord, tis Sundays I can&apos;t abide</p>
                  <p>The bloody pub is packed inside</p>
                  <p>The dinners cooking smelling great</p>
                  <p>I&apos;ll just pop in to check my fate</p>
                </div>
                <div className="space-y-0.5">
                  <p>All our profit Charlie&apos;s rassled</p>
                  <p>The Sunday joint the dogs have snaffled</p>
                  <p>What a bloody sorry state!</p>
                  <p>Not even a kipper to grace my plate.</p>
                </div>
                <div className="space-y-0.5">
                  <p>Oh Lord if you&apos;ve time to help me out</p>
                  <p>There&apos;s poor old Charlie sore with gout</p>
                  <p>My temper&apos;s strayed I&apos;m tuckered out</p>
                  <p>Come on Gents &ndash; TIME!! &ndash; Sod off out!</p>
                </div>
                <div className="space-y-0.5">
                  <p>Oh Lord so won&apos;t you hear my prayer</p>
                  <p>And help me treat my customers fair</p>
                  <p>For I have acted wickedly.</p>
                  <p>Please help this humble licensee</p>
                </div>
              </div>
            </details>
          </div>
        </Container>
      </Section>

      {/* The Anchor in the 1950s and Changing Village */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="Buses, Heathrow and a Changing Village"
              subtitle="From a horse-powered moor to the world's busiest flight path"
            />

            <div className="space-y-6 text-lg text-anchor-cream-text/80 leading-relaxed">
              <p>
                By the 1950s, The Anchor was still very much part of village life.
                A Francis Frith photograph from around <strong>1955</strong> shows the pub
                as it looked then, and Stanwell Moor History Group has compared that old
                view with a modern photograph looking north-west from Horton Road.
              </p>

              <p>
                The second half of the twentieth century changed Stanwell Moor. Roads were
                widened, reservoirs were dug, and Heathrow grew from a grass airstrip into
                one of the world&apos;s busiest airports. After the Staines West to West
                Drayton railway line closed in <strong>1965</strong>, the London Country{' '}
                <strong>444 bus route</strong> served Stanwell Moor, with The Anchor as
                one of the main stops. In <strong>1977</strong>, the Golden Miller 606
                also picked up at the pub.
              </p>

              <p>
                For some villagers, The Anchor was not only where you went for a drink.
                It was the place you got the bus.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* The Anchor Today */}
      <Section background="dark" spacing="md" className="bg-anchor-bg-raised border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              title="The Anchor Today"
              subtitle="A village pub in the shadow of the world's busiest airport"
            />

            <div className="max-w-xs mx-auto mb-10">
              <div className="relative aspect-square w-full overflow-hidden border border-anchor-gold/20">
                <Image
                  src="/images/history/handover-day-2019.jpg"
                  alt="Handover day at The Anchor, 5 March 2019 — Martine and Ronnie's last drink and Billy and Peter's first"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
              <p className="text-sm text-anchor-cream-text/50 mt-3 text-center">
                Handover day, 5 March 2019 — Martine and Ronnie&apos;s last drink
                and Billy and Peter&apos;s first
              </p>
            </div>

            <div className="space-y-6 text-lg text-anchor-cream-text/80 leading-relaxed">
              <p>
                Today, The Anchor has a new identity as a traditional village pub beside
                Heathrow. It is just{' '}
                <Link href="/near-heathrow/terminal-5" className="text-anchor-gold-vivid hover:text-anchor-gold underline underline-offset-4">
                  seven minutes from Terminal 5
                </Link>
                , with a{' '}
                <Link href="/beer-garden" className="text-anchor-gold-vivid hover:text-anchor-gold underline underline-offset-4">
                  beer garden under the flight path
                </Link>
                ,{' '}
                <Link href="/find-us" className="text-anchor-gold-vivid hover:text-anchor-gold underline underline-offset-4">
                  free parking
                </Link>
                {' '}and a warm welcome for locals, travellers, families, dogs and plane
                spotters.
              </p>

              <p>
                The flight path that runs over the beer garden turned out to be one of the
                best things about the place. Planes pass overhead every 90 seconds during
                peak times, and what started as background noise became a genuine
                attraction. People come from miles around to watch A380s and Dreamliners
                descend while enjoying a cold pint.
              </p>

              <p>
                But behind the modern Heathrow setting is a much older story: an inn on
                the moor, a Victorian pub, a blacksmith&apos;s neighbour, a family home, a
                wartime memory and a meeting place for generations of Stanwell Moor people.
              </p>

              <p>
                We have our{' '}
                <Link href="/quiz-night" className="text-anchor-gold-vivid hover:text-anchor-gold underline underline-offset-4">
                  quiz nights
                </Link>
                ,{' '}
                <Link href="/music-bingo" className="text-anchor-gold-vivid hover:text-anchor-gold underline underline-offset-4">
                  music bingo
                </Link>
                {' '}and{' '}
                <Link href="/karaoke" className="text-anchor-gold-vivid hover:text-anchor-gold underline underline-offset-4">
                  karaoke
                </Link>
                . The kids play in the garden while the dogs snooze under the tables. The{' '}
                <Link href="/food-menu" className="text-anchor-gold-vivid hover:text-anchor-gold underline underline-offset-4">
                  kitchen turns out honest British food
                </Link>
                , and on Sundays we serve{' '}
                <Link href="/sunday-roast" className="text-anchor-gold-vivid hover:text-anchor-gold underline underline-offset-4">
                  proper roasts with all the trimmings
                </Link>
                . That&apos;s what we&apos;ve been doing since George II was on the
                throne, and we don&apos;t plan on stopping.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Share Your Memories */}
      <Section background="dark" spacing="md" className="bg-anchor-bg border-b border-anchor-gold/15">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeader
              title="Share Your Memories of The Anchor"
              subtitle="Help us tell the full story"
            />

            <p className="text-lg text-anchor-cream-text/80 leading-relaxed mb-8">
              We know there are gaps in this story, particularly around the Eeles years
              and the mid-twentieth century. If you have photographs, dates, family
              connections or memories of The Anchor, we would love to hear from you.
              Every detail helps us piece together the full history of this village pub.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PhoneButton
                phone={CONTACT.phone}
                source="history_memories"
                size="lg"
                variant="primary"
              >
                Call Us
              </PhoneButton>
              <a
                href={`mailto:${CONTACT.email}?subject=Memories%20of%20The%20Anchor`}
                className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold border border-anchor-gold/30 text-anchor-cream-text hover:bg-anchor-gold/10 transition-colors"
              >
                Email Your Stories
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <FAQAccordionWithSchema
        className="bg-anchor-bg-raised"
        title="History of The Anchor: Questions & Answers"
        faqs={[
          {
            question: 'When was The Anchor in Stanwell Moor established?',
            answer:
              'The Anchor gives an establishment date of 1751. However, local historic records, including the Victoria County History, suggest an Anchor Inn was already present in Stanwell Moor by at least 1730. The present building is believed to be mid-Victorian.',
          },
          {
            question: 'Is The Anchor a listed building?',
            answer:
              'The Anchor is locally listed by Spelthorne Borough Council (reference LL/072, listed 19 February 2004). It is recognised for its architectural and historic interest as a mid-Victorian pub standing on the site of an earlier inn.',
          },
          {
            question: 'What is the connection between The Anchor and HMS Vanguard?',
            answer:
              'Harry Cooper, son of Sarah Cooper, landlady of The Anchor, died on 9 July 1917 when HMS Vanguard was destroyed by an accidental explosion at Scapa Flow. The Commonwealth War Graves Commission records him as the son of William and Sarah Cooper of "The Anchor Inn," Stanwell Moor.',
          },
          {
            question: 'Who were Lal and Charlie Eeles?',
            answer:
              'The Eeles family were closely connected with The Anchor across the mid-twentieth century. A 1922 London Gazette notice places Charles Edwin Eeles at The Anchor Inn, and a 1951-52 Stanwell Moor Football Club photo identifies Charlie Eeles with the pub. Lal Eeles, his wife, was also landlady and wrote "Lal\'s Prayer," a poem about pub life.',
          },
          {
            question: 'How old is The Anchor compared to Heathrow Airport?',
            answer:
              'The Anchor has been a pub since at least 1751, while Heathrow began as a grass airstrip in the 1940s. The pub predates the airport by nearly two centuries.',
          },
          {
            question: 'Where is The Anchor in Stanwell Moor?',
            answer:
              'The Anchor is on Horton Road, Stanwell Moor, Surrey, TW19 6AQ. It is 7 minutes by car from Heathrow Terminal 5, 2 minutes from M25 Junction 14, and has 20 free parking spaces.',
          },
        ]}
      />

      {/* CTA */}
      <CTASection
        title="Come and See for Yourself"
        description="Book a table, grab a pint, or just pop in and say hello. We've been here since 1751, we're not going anywhere."
        variant="green"
        footer="Horton Road, Stanwell Moor, Surrey TW19 6AQ · 7 mins from Heathrow T5 · Free parking"
        buttons={[
          {
            text: 'Book a Table',
            href: '/book-table',
            variant: 'white',
            bookingContext: 'history_cta',
          },
          {
            text: 'Get Directions',
            href: 'https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ',
            variant: 'white',
            isDirections: true,
            directionsSource: 'history_cta',
          },
          {
            text: `Call ${CONTACT.phone}`,
            href: `tel:${CONTACT.phone}`,
            variant: 'white',
            isPhone: true,
            phoneSource: 'history_cta',
          },
        ]}
      />
    </>
  )
}
