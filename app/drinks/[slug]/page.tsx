import { permanentRedirect } from 'next/navigation'

type DrinksRedirectProps = {
  params: {
    slug: string
  }
}

export default function LegacyDrinksRedirect({ params }: DrinksRedirectProps) {
  // Legacy individual drink URLs should now point at the drinks overview page.
  // Specific drinks with bespoke content have dedicated routes (e.g. baby-guinness),
  // so this catch-all only handles legacy slugs.
  if (!params?.slug) {
    permanentRedirect('/drinks')
  }

  permanentRedirect('/drinks')
}
