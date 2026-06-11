import Image from 'next/image'
import Link from 'next/link'
import { Button, Icon } from '@/components/ui'
import type { RecruitmentRoleValue } from '../recruitmentContent'

type Fact = {
  label: string
  value: string
}

type LinkCard = {
  title: string
  href: string
  description: string
  outcome: string
  cta: string
}

export function QuickFactsBox({ facts, title = 'Quick facts' }: { facts: Fact[]; title?: string }) {
  return (
    <div className="rounded-lg border border-anchor-gold-dark/20 bg-anchor-green-card p-5 sm:p-6">
      <h2 className="text-2xl font-bold text-anchor-gold-bright">{title}</h2>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-md border border-anchor-gold-dark/15 bg-anchor-green-deep px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-anchor-gold-bright">
              {fact.label}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-anchor-cream-text/80">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function PayNotice() {
  return (
    <div className="rounded-lg border border-anchor-gold-dark/25 bg-anchor-green-card p-5">
      <p className="text-lg font-semibold text-anchor-cream-text">Pay: £12.71 per hour base rate</p>
      <p className="mt-2 text-sm leading-relaxed text-anchor-cream-text/70">
        Holiday pay is handled in line with current UK holiday pay rules and will be clearly shown in your
        contract and payslip.
      </p>
    </div>
  )
}

export function RoleCards({ roles }: { roles: LinkCard[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {roles.map((role) => (
        <Link
          key={role.href}
          href={role.href}
          className="group block h-full rounded-lg border border-anchor-gold-dark/20 bg-anchor-green-card p-6 transition hover:-translate-y-1 hover:border-anchor-gold-dark/50 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
        >
          <div className="flex h-full flex-col">
            <h3 className="text-2xl font-bold text-anchor-cream-text group-hover:text-anchor-gold-bright">
              {role.title}
            </h3>
            <p className="mt-4 text-anchor-cream-text/75">{role.description}</p>
            <p className="mt-4 text-anchor-cream-text/75">{role.outcome}</p>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-anchor-gold-bright">
              {role.cta}
              <Icon name="arrowRight" className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function BulletListSection({
  title,
  intro,
  items,
  className = ''
}: {
  title: string
  intro?: string
  items: string[]
  className?: string
}) {
  return (
    <div className={className}>
      <h2 className="text-3xl font-bold text-anchor-gold-bright">{title}</h2>
      {intro ? <p className="mt-4 max-w-3xl text-anchor-cream-text/75">{intro}</p> : null}
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 rounded-md border border-anchor-gold-dark/15 bg-anchor-green-card p-4">
            <Icon name="check" className="mt-0.5 h-5 w-5 flex-none text-anchor-gold-bright" aria-hidden="true" />
            <span className="text-anchor-cream-text/80">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RoleQuickFacts({ role }: { role?: RecruitmentRoleValue }) {
  const roleLabel = role && role !== 'Either role' && role !== 'Not sure yet' ? role : 'Bar Staff, Kitchen Team'

  return (
    <QuickFactsBox
      facts={[
        { label: 'Role', value: roleLabel },
        { label: 'Pay', value: '£12.71 per hour base rate' },
        { label: 'Hours', value: 'Part-time, mainly evenings and weekends' },
        { label: 'Location', value: 'The Anchor, Stanwell Moor, TW19 6AQ' },
        { label: 'Parking', value: 'Free on-site parking' },
        { label: 'Experience', value: 'Minimum 1 year preferred' }
      ]}
    />
  )
}

export function StandardsPledge() {
  return (
    <div className="rounded-lg border border-anchor-gold-dark/25 bg-anchor-green-raised p-6">
      <p className="text-lg leading-relaxed text-anchor-cream-text/85">
        We are proud of the standards we set, whether guests are joining us for a quiet drink, a Sunday
        roast, a busy event night or a private celebration. Every member of the team plays a part in making
        that experience feel warm, well-run and worth coming back for.
      </p>
    </div>
  )
}

export function LocationTransportSection() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <h2 className="text-3xl font-bold text-anchor-gold-bright">Location and transport</h2>
        <p className="mt-4 text-anchor-cream-text/75">
          The Anchor is in Stanwell Moor Village, close to Heathrow Terminal 5.
        </p>
        <address className="mt-5 not-italic text-anchor-cream-text/85">
          <strong className="text-anchor-cream-text">The Anchor</strong>
          <br />
          Horton Road
          <br />
          Stanwell Moor Village
          <br />
          TW19 6AQ
        </address>
        <p className="mt-5 text-anchor-cream-text/75">
          There is free on-site parking for staff.
        </p>
        <p className="mt-3 text-anchor-cream-text/75">
          Before applying, please make sure you can reliably get to and from the pub for evening and weekend
          shifts, including later finishes when public transport may be limited.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <a href="https://maps.google.com/maps?q=The+Anchor+Stanwell+Moor+TW19+6AQ">
              <Icon name="mapPin" className="h-4 w-4" aria-hidden="true" />
              Get Directions
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/find-us">
              <Icon name="navigation" className="h-4 w-4" aria-hidden="true" />
              View Travel Details
            </Link>
          </Button>
        </div>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-anchor-gold-dark/20">
        <Image
          src="/images/page-headers/private-hire/private-hire.jpg"
          alt="Private hire space at The Anchor in Stanwell Moor"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 42vw"
        />
      </div>
    </div>
  )
}

export function RecruitmentImageStrip() {
  const images = [
    {
      src: '/images/our-pub/the-anchor-bar.jpg',
      alt: 'The Anchor bar in Stanwell Moor'
    },
    {
      src: '/images/join-our-team/guinness-handover.jpg',
      alt: 'A pint being handed across the bar at The Anchor'
    },
    {
      src: '/images/food/sunday-roast/the-anchor-sunday-roast-hero.jpg',
      alt: 'Sunday roast at The Anchor'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {images.map((image) => (
        <div key={image.src} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-anchor-gold-dark/20">
          <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      ))}
    </div>
  )
}
