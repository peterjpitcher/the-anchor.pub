import fs from 'fs'
import path from 'path'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { ReviewsCarousel } from '@/components/reviews/ReviewsCarousel'
import { PrivateBookingInquiryForm } from '@/components/PrivateBookingInquiryForm'
import { Alert } from '@/components/ui/feedback/Alert'
import { getCategoryChipStyle } from '@/components/events/event-display'
import { contrastRatio } from '@/lib/contrast'
import type { GoogleReview } from '@/lib/google/types'
import type { Event } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  createPrivateBooking: jest.fn(),
}))

jest.mock('@/lib/gtm-events', () => ({
  trackPrivateHireEnquiryStarted: jest.fn(),
  trackPrivateHireEnquirySubmitted: jest.fn(),
}))

/**
 * The accessibility package of the 7 October 2026 site review (P18). One suite
 * for the fixes that had no home in an existing one. The focus trap, the
 * Christmas pop-up, Modal and Button have their own.
 */

const read = (file: string): string => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

// ---------------------------------------------------------------------------
// Colours, resolved from app/globals.css for each skin.
// ---------------------------------------------------------------------------
const css = read('app/globals.css')
const declarations = (selector: string): Record<string, string> => {
  const start = css.indexOf(selector)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('\n}', start))
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}
const light = declarations(':root {')
const skins: Record<'light' | 'dark', Record<string, string>> = {
  light,
  dark: { ...light, ...declarations('[data-theme="dark"] {') },
}
const resolve = (skin: 'light' | 'dark', name: string): string => {
  let value = skins[skin][name]
  while (value?.startsWith('var(')) value = skins[skin][value.slice(4, -1)]
  return value
}

type Rgb = [number, number, number]
const toRgb = (hex: string): Rgb => {
  const clean = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16)) as Rgb
}
const toHex = (rgb: Rgb): string => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
/** `top` at `alpha` painted over `bottom`. */
const over = (top: string, alpha: number, bottom: string): string => {
  const a = toRgb(top)
  const b = toRgb(bottom)
  return toHex(a.map((v, i) => v * alpha + b[i] * (1 - alpha)) as Rgb)
}

describe('AX-003: the quick booking sheet date field has a background of its own', () => {
  const source = read('components/features/TableBooking/QuickBookSheet.tsx')
  const field = source.slice(source.indexOf('id="quick-book-date"'))
  const className = /className="([^"]+)"/.exec(field)?.[1] ?? ''

  it('sets the surface behind its text, so the browser\'s white field cannot show through', () => {
    expect(className.split(' ')).toEqual(expect.arrayContaining(['bg-surface', 'text-ink']))
  })

  it.each(['light', 'dark'] as const)('reads at 4.5:1 or better in the %s skin', (skin) => {
    // It was the dark skin's cream text on the browser's white: 1.25:1.
    expect(contrastRatio(resolve('dark', '--text'), '#ffffff')).toBeLessThan(1.3)
    expect(contrastRatio(resolve(skin, '--text'), resolve(skin, '--surface'))).toBeGreaterThanOrEqual(4.5)
  })

  it('asks for the dark picker only under the dark skin', () => {
    const rule = /\.theme-dark input\[type='date'\][^{]*\{([^}]*)\}/.exec(css)
    expect(rule?.[1]).toMatch(/color-scheme:\s*dark/)
    expect(css.replace(rule?.[0] ?? '', '')).not.toMatch(/color-scheme/)
  })
})

describe('AX-007: colours that follow the skin', () => {
  const pairs: Array<{ what: string; text: (s: 'light' | 'dark') => string; on: (s: 'light' | 'dark') => string }> = [
    {
      what: "'Drinks only' on a tinted time button (accent text on gold at 10% over the surface)",
      text: (s) => resolve(s, '--accent-text'),
      on: (s) => over(resolve(s, '--anchor-gold'), 0.1, resolve(s, '--surface')),
    },
    {
      what: 'the busy caption and the high chair flag on a plain time button',
      text: (s) => resolve(s, '--accent-text'),
      on: (s) => resolve(s, '--surface'),
    },
    {
      what: 'the selected seat count (page colour on the accent)',
      text: (s) => resolve(s, '--bg'),
      on: (s) => resolve(s, '--accent'),
    },
    {
      what: "'Get directions' on the game night pages (accent on the sunk surface)",
      text: (s) => resolve(s, '--accent'),
      on: (s) => resolve(s, '--surface-sunk'),
    },
    {
      what: 'the contact links on /find-us and the four links on the not-found page (accent text on the page)',
      text: (s) => resolve(s, '--accent-text'),
      on: (s) => resolve(s, '--bg'),
    },
    {
      what: 'the contact links on a card',
      text: (s) => resolve(s, '--accent-text'),
      on: (s) => resolve(s, '--surface'),
    },
    {
      what: 'the flight notice and a free event price (success colour on the sunk surface)',
      text: (s) => resolve(s, '--status-success'),
      on: (s) => resolve(s, '--surface-sunk'),
    },
    {
      what: 'step numbers, the instant quote button and the other labels that sat on mid gold (white on dark gold)',
      text: () => '#ffffff',
      on: (s) => resolve(s, '--anchor-gold-dark'),
    },
  ]

  it.each(pairs.flatMap((pair) => (['light', 'dark'] as const).map((skin) => [pair.what, skin, pair] as const)))(
    '%s reads at 4.5:1 or better in the %s skin',
    (_what, skin, pair) => {
      expect(contrastRatio(pair.text(skin), pair.on(skin))).toBeGreaterThanOrEqual(4.5)
    }
  )

  it('keeps text off the mid gold, which takes neither white nor charcoal at 4.5:1', () => {
    const gold = resolve('light', '--anchor-gold')
    expect(contrastRatio('#ffffff', gold)).toBeLessThan(4.5)
    expect(contrastRatio(resolve('light', '--anchor-charcoal'), gold)).toBeLessThan(4.5)

    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(path.join(process.cwd(), dir), { withFileTypes: true })) {
        const file = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(file)
        else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) {
          read(file).split('\n').forEach((line, index) => {
            // A resting fill of mid gold with a text colour on the same class
            // string. Hover fills and 2px rules are not text backgrounds.
            if (/(^|[\s"'`])(data-\[state=active\]:)?bg-anchor-gold(?=[\s"'`])/.test(line) && /text-(white|ink-on-gold)/.test(line)) {
              offenders.push(`${file}:${index + 1}`)
            }
          })
        }
      }
    }
    walk('app')
    walk('components')
    expect(offenders).toEqual([])
  })

  it('writes an event category chip in the page\'s own ink on a tint of the category colour', () => {
    // The colour comes from the management app, so it can be anything. As the
    // text colour, purple #9333ea was 2.58:1 on the dark card.
    const style = getCategoryChipStyle({ category: { color: '#9333ea' } } as unknown as Event)
    expect(style).toEqual({ backgroundColor: '#9333ea1f', color: 'var(--text)' })

    for (const skin of ['light', 'dark'] as const) {
      for (const colour of ['#9333ea', '#ffff00', '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#808080']) {
        for (const surface of ['--surface', '--surface-raised', '--surface-sunk', '--bg']) {
          const chip = over(colour, 0x1f / 255, resolve(skin, surface))
          expect(contrastRatio(resolve(skin, '--text'), chip)).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  })

  it('has no category when the event has none', () => {
    expect(getCategoryChipStyle({} as Event)).toBeNull()
  })
})

describe('AX-008: the focus ring', () => {
  it('beats focus:outline-none, which Tailwind writes after everything else in the stylesheet', () => {
    // Two classes and a pseudo-class against Tailwind's one class and a pseudo-class.
    expect(css).toMatch(/\.focus\\:outline-none\.focus\\:outline-none:focus-visible/)
    expect(css).toMatch(/\.focus-visible\\:outline-none\.focus-visible\\:outline-none:focus-visible/)
  })

  it.each([
    ['light', '--bg'],
    ['light', '--surface'],
    ['light', '--surface-sunk'],
    ['dark', '--bg'],
    ['dark', '--surface'],
    ['dark', '--surface-raised'],
    ['dark', '--surface-sunk'],
    // The header and its strip in the dark skin, where the fixed dark gold was 1.69:1.
    ['dark', '--anchor-green'],
  ] as const)('is 3:1 or better against %s %s', (skin, surface) => {
    expect(contrastRatio(resolve(skin, '--focus-ring'), resolve(skin, surface))).toBeGreaterThanOrEqual(3)
  })

  it('leaves no fixed dark gold focus colour outside the cookie banner', () => {
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(path.join(process.cwd(), dir), { withFileTypes: true })) {
        const file = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(file)
        // The cookie banner is being rewritten separately; the stylesheet rule covers it meanwhile.
        else if (/\.tsx?$/.test(entry.name) && file !== path.join('components', 'CookieBanner.tsx')) {
          if (/(focus|focus-visible|focus-within):(ring|border|outline)-anchor-gold-dark\b/.test(read(file))) offenders.push(file)
        }
      }
    }
    walk('app')
    walk('components')
    expect(offenders).toEqual([])
  })
})

describe('AX-009: the skip link sits above the sticky header', () => {
  it('has a higher layer than the header bar', () => {
    const skip = /href="#main-content"\s+className="([^"]+)"/.exec(read('app/layout.tsx'))?.[1] ?? ''
    const header = /'sticky top-0 z-\[(\d+)\]/.exec(read('components/layout/Navigation.tsx'))
    const skipLayer = /focus:z-\[(\d+)\]/.exec(skip)
    expect(header).not.toBeNull()
    expect(skipLayer).not.toBeNull()
    expect(Number(skipLayer?.[1])).toBeGreaterThan(Number(header?.[1]))
  })
})

describe('AX-010 and AX-016: the private hire enquiry fields', () => {
  beforeEach(() => {
    ;(global as unknown as { fetch: jest.Mock }).fetch = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: true, data: { known: false } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )
  })

  it('names every field by its visible label, and offers autofill on the personal ones', async () => {
    render(<PrivateBookingInquiryForm />)

    const mobile = screen.getByLabelText(/Mobile Number/)
    expect(mobile).toHaveAttribute('type', 'tel')
    expect(mobile).toHaveAttribute('autocomplete', 'tel')

    fireEvent.change(mobile, { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /send inquiry/i })).toBeInTheDocument())

    expect(screen.getByLabelText(/First Name/)).toHaveAttribute('autocomplete', 'given-name')
    expect(screen.getByLabelText(/Last Name/)).toHaveAttribute('autocomplete', 'family-name')
    expect(screen.getByLabelText('Email (Optional)')).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText('Preferred Date')).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText('Start Time')).toHaveAttribute('type', 'time')
    expect(screen.getByLabelText('Approx Guests')).toHaveAttribute('type', 'number')
    expect(screen.getByLabelText('Event Type').tagName).toBe('SELECT')
    expect(screen.getByLabelText('Notes / Special Requests').tagName).toBe('TEXTAREA')
  })

  it('gives the estimator\'s date, guests and hours boxes a name', () => {
    const source = read('components/PrivateBookingCalculator.tsx')
    expect(source).toMatch(/id=\{`\$\{fieldId\}-date-label`\}>When is your event\?/)
    expect(source).toMatch(/type="date"\s+aria-labelledby=\{`\$\{fieldId\}-date-label`\}/)
    for (const name of ['guests', 'hours']) {
      expect(source).toContain(`htmlFor={\`\${fieldId}-${name}\`}`)
      expect(source).toContain(`id={\`\${fieldId}-${name}\`}`)
    }
  })

  it('offers autofill on the parking booking\'s name, email and mobile boxes', () => {
    const source = read('components/features/ParkingBookingWizard/index.tsx')
    const field = (label: string) => {
      const end = source.indexOf(`label="${label}"`)
      return source.slice(source.lastIndexOf('<Input', end), source.indexOf('/>', end))
    }
    expect(field('First name')).toContain('autoComplete="given-name"')
    expect(field('Last name')).toContain('autoComplete="family-name"')
    expect(field('Email address')).toContain('autoComplete="email"')
    expect(field('Mobile number')).toContain('autoComplete="tel"')
    expect(field('Mobile number')).toContain('type="tel"')
  })
})

describe('AX-011: errors and results are announced', () => {
  it('marks the parking booking\'s failure messages as alerts', () => {
    const source = read('components/features/ParkingBookingWizard/index.tsx')
    expect(source).toContain('{ratesError && <p role="alert"')
    expect(source).toMatch(/availabilityState\.status === 'unavailable' && \(\s*<div role="alert"/)
    expect(source).toMatch(/\{availabilityError && \(\s*<div role="alert"/)
    expect(source).toMatch(/captureState === 'error' && \(\s*<p role="alert"/)
    expect(source).toMatch(/paypalLoadError \|\| !process\.env\.NEXT_PUBLIC_PAYPAL_CLIENT_ID\) && \(\s*<p role="alert"/)
  })

  it('marks both of the quick booking sheet\'s error lines as alerts', () => {
    const source = read('components/features/TableBooking/QuickBookSheet.tsx')
    expect(source).toContain('<p className="text-sm text-anchor-danger" role="alert">{fieldError}</p>')
    expect(source).toMatch(/<p className="text-sm text-anchor-danger" role="alert">\s*<WithPhoneLink message=\{error\} \/>/)
  })

  it('gives the table booking form a status line for the number of times found', () => {
    const source = read('components/features/TableBooking/ManagementTableBookingForm.tsx')
    expect(source).toContain('<p role="status" className="sr-only">{searchStatus}</p>')
  })
})

describe('AX-012: the reviews carousel can be stopped', () => {
  const reviews: GoogleReview[] = Array.from({ length: 4 }, (_, i) => ({
    author_name: `Reviewer ${i + 1}`,
    language: 'en',
    rating: 5,
    relative_time_description: 'a week ago',
    text: `Review text ${i + 1}`,
    time: 1_750_000_000 + i,
  }))
  const current = () =>
    screen
      .getAllByRole('button', { name: /^Go to review \d+$/ })
      .filter((dot) => dot.getAttribute('aria-current') === 'true')
      .map((dot) => dot.getAttribute('aria-label'))

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('stops when Pause is pressed and stays stopped until Play is pressed', () => {
    render(<ReviewsCarousel reviews={reviews} interval={5000} />)
    expect(current()).toEqual(['Go to review 1'])

    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(current()).toEqual(['Go to review 2'])

    fireEvent.click(screen.getByRole('button', { name: 'Pause reviews' }))
    act(() => {
      jest.advanceTimersByTime(30_000)
    })
    expect(current()).toEqual(['Go to review 2'])

    // Hover and focus only pause it; leaving must not start it again.
    const carousel = screen.getByRole('button', { name: 'Play reviews' }).closest('.relative') as HTMLElement
    fireEvent.mouseEnter(carousel)
    fireEvent.mouseLeave(carousel)
    act(() => {
      jest.advanceTimersByTime(30_000)
    })
    expect(current()).toEqual(['Go to review 2'])

    fireEvent.click(screen.getByRole('button', { name: 'Play reviews' }))
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(current()).toEqual(['Go to review 3'])
  })

  it('puts the pause button first in the tab order, ahead of the arrows and dots', () => {
    const { container } = render(<ReviewsCarousel reviews={reviews} />)
    const names = within(container).getAllByRole('button').map((button) => button.getAttribute('aria-label'))
    expect(names.slice(0, 3)).toEqual(['Pause reviews', 'Previous review', 'Next review'])
  })

  it('has no pause button when it does not move by itself', () => {
    render(<ReviewsCarousel reviews={reviews} autoPlay={false} />)
    expect(screen.queryByRole('button', { name: /reviews$/ })).not.toBeInTheDocument()
  })

  it('marks the current dot for a screen reader, and only that one', () => {
    render(<ReviewsCarousel reviews={reviews} autoPlay={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Go to review 3' }))
    expect(current()).toEqual(['Go to review 3'])
  })
})

describe('AX-013: sideways scrollers can be reached by keyboard', () => {
  it.each([
    'components/events/EventBookingFactsStrip.tsx',
    'components/features/VenueSpacesTable.tsx',
    'components/features/CateringPackagesTable.tsx',
    'components/TestimonialSection.tsx',
    'app/heathrow-layover-dining/page.tsx',
    'app/restaurants-near-heathrow/page.tsx',
    'app/sunday-roast/page.tsx',
  ])('%s: every overflow-x-auto box is a focusable, named region', (file) => {
    const tags = read(file).match(/<div[^>]*overflow-x-auto[^>]*>/g) ?? []
    expect(tags.length).toBeGreaterThan(0)
    for (const tag of tags) {
      expect(tag).toContain('role="region"')
      expect(tag).toContain('tabIndex={0}')
      expect(tag).toMatch(/aria-label=/)
    }
  })
})

describe('AX-019: page structure', () => {
  it('has one footer landmark: the layout no longer wraps Footer in a second one', () => {
    const layout = read('app/layout.tsx')
    expect(layout).not.toMatch(/<footer/)
    expect(read('components/layout/Footer.tsx').match(/<footer/g)).toHaveLength(1)
  })

  it('writes the footer column titles as h2, the level that follows a page section', () => {
    const footer = read('components/layout/Footer.tsx')
    expect(footer).not.toMatch(/<h[3-6]/)
    expect(footer.match(/<h2 className=\{headingClass\}>/g)).toHaveLength(3)
  })

  it('lets an alert that sits above the h1 write its title as text, not a heading', () => {
    const { rerender } = render(<Alert title="This event has ended" titleAs="p">It took place on 1 October.</Alert>)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByText('This event has ended').tagName).toBe('P')

    rerender(<Alert title="Check your details">Something is missing.</Alert>)
    expect(screen.getByRole('heading', { level: 3, name: 'Check your details' })).toBeInTheDocument()

    expect(read('app/events/[id]/page.tsx')).toContain('title={statusNotice.title} titleAs="p"')
  })

  it('gives the labelled group of venue buttons a role, so its label is announced', () => {
    expect(read('components/private-hire/venue-tour/InteractiveVenueFloorPlan.tsx')).toContain(
      'role="group" aria-label="Choose a private hire space"'
    )
  })

  it('labels the breadcrumb on a blog post', () => {
    expect(read('app/blog/[slug]/page.tsx')).toContain('<nav aria-label="Blog breadcrumb"')
  })
})

describe('AX-020: footer links are 44px tap targets on a phone', () => {
  const footer = read('components/layout/Footer.tsx')

  it('pads every footer link to 44px below 768px', () => {
    // 20px line of text-sm plus 12px above and below.
    expect(footer).toContain("const tapBlock = 'max-md:inline-block max-md:py-3'")
    expect(footer).toContain("const tapInline = 'max-md:flex max-md:min-h-[44px] max-md:items-center'")
    // Every use of the link style carries one of the two.
    const uses = footer.match(/className=\{[^}]*linkClass[^}]*\}/g) ?? []
    expect(uses.length).toBeGreaterThanOrEqual(8)
    expect(uses.filter((use) => !/tapBlock|tapInline/.test(use))).toEqual([])
  })

  it('makes the round icon links 44px below 768px', () => {
    expect(footer.match(/h-\[38px\] w-\[38px\] max-md:h-11 max-md:w-11/g)).toHaveLength(3)
    expect(footer).not.toMatch(/h-\[38px\] w-\[38px\] items-center/)
  })
})
