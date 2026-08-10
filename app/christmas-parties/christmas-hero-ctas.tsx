'use client'

import { Button } from '@/components/ui/primitives/Button'
import { Icon } from '@/components/ui/Icon'
import { trackCtaClick, trackEmailClick, trackPhoneCallClick } from '@/lib/gtm-events'
import { CONTACT } from '@/lib/constants'

type ChristmasHeroMode = 'party' | 'meal'

interface ChristmasHeroOpenFormDetail {
  mode: ChristmasHeroMode
  source: string
}

export const CHRISTMAS_OPEN_FORM_EVENT = 'christmas-open-form'

const CONTACT_EMAIL = CONTACT.email
const CONTACT_PHONE = CONTACT.phone
const CONTACT_PHONE_LINK = CONTACT.phoneHref
const CONTACT_EMAIL_LINK = `mailto:${CONTACT_EMAIL}`

function dispatchChristmasOpenForm(detail: ChristmasHeroOpenFormDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<ChristmasHeroOpenFormDetail>(CHRISTMAS_OPEN_FORM_EVENT, { detail })
  )
}

export function ChristmasHeroPrimaryCta() {
  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:justify-center">
      <Button
        variant="outline"
        size="lg"
        className="w-full md:w-auto"
        onClick={() => {
          trackCtaClick({
            id: 'christmas_hero_party',
            label: 'Plan a Christmas party',
            location: 'christmas_hero',
            destination: 'enquiry_form',
            mode: 'party'
          })
          dispatchChristmasOpenForm({ mode: 'party', source: 'hero_party' })
        }}
      >
        Plan a Christmas party
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="w-full md:w-auto"
        onClick={() => {
          trackCtaClick({
            id: 'christmas_hero_meal',
            label: 'Book Christmas lunch or dinner',
            location: 'christmas_hero',
            destination: 'enquiry_form',
            mode: 'meal'
          })
          dispatchChristmasOpenForm({ mode: 'meal', source: 'hero_meal' })
        }}
      >
        Book lunch or dinner
      </Button>
    </div>
  )
}

/**
 * Real anchors rather than script-driven buttons, so there is always a working
 * route to book above the fold: for a crawler, for a no-JS visitor, and for
 * anyone whose tracking script fails to load.
 */
export function ChristmasHeroSecondaryCta() {
  return (
    <div className="grid w-full grid-cols-2 gap-3 md:flex md:justify-center">
      <Button
        asChild
        variant="primary"
        size="lg"
        className="min-w-0 w-full md:w-auto"
        onClick={() => {
          trackCtaClick({
            id: 'christmas_hero_call',
            label: 'Call The Anchor',
            location: 'christmas_hero',
            destination: 'phone'
          })
          trackPhoneCallClick({ phone: CONTACT_PHONE, source: 'christmas_hero' })
        }}
      >
        <a href={CONTACT_PHONE_LINK}>
          <Icon name="phone" className="mr-2 h-4 w-4" />
          <span className="sm:hidden">Call us</span>
          <span className="hidden sm:inline">Call {CONTACT_PHONE}</span>
        </a>
      </Button>
      <Button
        asChild
        variant="primary"
        size="lg"
        className="min-w-0 w-full md:w-auto"
        onClick={() => {
          trackCtaClick({
            id: 'christmas_hero_email',
            label: 'Email The Anchor',
            location: 'christmas_hero',
            destination: 'email'
          })
          trackEmailClick({ email: CONTACT_EMAIL, source: 'christmas_hero' })
        }}
      >
        <a href={CONTACT_EMAIL_LINK}>
          <Icon name="mail" className="mr-2 h-4 w-4" /> Email us
        </a>
      </Button>
    </div>
  )
}
