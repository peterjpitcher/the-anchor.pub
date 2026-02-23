'use client'

import { Button } from '@/components/ui/primitives/Button'
import { Icon } from '@/components/ui/Icon'
import { trackCtaClick, trackEmailClick, trackPhoneCallClick } from '@/lib/gtm-events'

type ChristmasHeroMode = 'dinner' | 'buffet'

interface ChristmasHeroOpenFormDetail {
  mode: ChristmasHeroMode
  source: string
}

export const CHRISTMAS_OPEN_FORM_EVENT = 'christmas-open-form'

const CONTACT_EMAIL = 'manager@the-anchor.pub'
const CONTACT_PHONE = '01753 682707'
const CONTACT_PHONE_LINK = 'tel:+441753682707'
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
        variant="danger"
        size="lg"
        className="w-full md:w-auto"
        onClick={() => {
          trackCtaClick({
            id: 'christmas_hero_dinner',
            label: 'Request a Christmas Booking (up to 25)',
            location: 'christmas_hero',
            destination: 'enquiry_form',
            mode: 'dinner'
          })
          dispatchChristmasOpenForm({ mode: 'dinner', source: 'hero_dinner' })
        }}
      >
        Request a Christmas Booking (up to 25)
      </Button>
      <Button
        variant="danger"
        size="lg"
        className="w-full md:w-auto"
        onClick={() => {
          trackCtaClick({
            id: 'christmas_hero_buffet',
            label: 'Plan a Buffet Party (26+)',
            location: 'christmas_hero',
            destination: 'enquiry_form',
            mode: 'buffet'
          })
          dispatchChristmasOpenForm({ mode: 'buffet', source: 'hero_buffet' })
        }}
      >
        Plan a Buffet Party (26+)
      </Button>
    </div>
  )
}

export function ChristmasHeroSecondaryCta() {
  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:justify-center">
      <Button
        variant="primary"
        size="lg"
        className="w-full md:w-auto"
        onClick={() => {
          trackCtaClick({
            id: 'christmas_hero_call',
            label: 'Call The Anchor',
            location: 'christmas_hero',
            destination: 'phone'
          })
          trackPhoneCallClick({ phone: CONTACT_PHONE, source: 'christmas_hero' })
          window.location.href = CONTACT_PHONE_LINK
        }}
      >
        <Icon name="phone" className="mr-2 h-4 w-4" /> Call {CONTACT_PHONE}
      </Button>
      <Button
        variant="primary"
        size="lg"
        className="w-full md:w-auto"
        onClick={() => {
          trackCtaClick({
            id: 'christmas_hero_email',
            label: 'Email The Anchor',
            location: 'christmas_hero',
            destination: 'email'
          })
          trackEmailClick({ email: CONTACT_EMAIL, source: 'christmas_hero' })
          window.location.href = CONTACT_EMAIL_LINK
        }}
      >
        <Icon name="mail" className="mr-2 h-4 w-4" /> Email us
      </Button>
    </div>
  )
}
