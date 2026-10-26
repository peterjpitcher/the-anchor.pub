import fs from 'fs'
import path from 'path'
import { fireEvent, render, screen } from '@testing-library/react'
import { contrastRatio } from '@/lib/contrast'
import { fieldControlClass } from '@/components/ui/primitives/Input'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { SlotPickerGrid } from '@/components/features/TableBooking/SlotPickerGrid'
import { SeasonalPeriodQuestion } from '@/components/features/TableBooking/SeasonalPeriodQuestion'
import type { GroupedSlots } from '@/lib/table-booking/slot-groups'
import type { BookingPeriod } from '@/lib/api/bookings'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { faintFieldEdges } = require('../../scripts/audit-a11y.js') as {
  faintFieldEdges: () => Array<{ name: string; ratio: number }>
}

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookingStart: jest.fn(),
  trackEventBookingComplete: jest.fn(),
  trackEventBookingFunnelStep: jest.fn(),
  trackDirectionsClick: jest.fn(),
  trackAddToCalendarClick: jest.fn()
}))

/**
 * Review BK-104. From September to March the site wears its dark skin, and the
 * edge of every booking and enquiry field measured 2.31:1 against the card, the
 * event question boxes 1.47:1, against the 3:1 a control's edge needs (WCAG
 * 1.4.11). The chosen time, high chair count and Christmas answer turned the
 * fixed brand green on a green card, 1.55:1, and lost the outline the other
 * choices kept. axe does not test any of this, so these tests do, and the
 * browser audit measures the fields it can see.
 */

const read = (file: string): string => fs.readFileSync(path.join(process.cwd(), file), 'utf8')
const css = read('app/globals.css')

const declarations = (selector: string): Record<string, string> => {
  const start = css.indexOf(selector)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('\n}', start))
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}
const light = declarations(':root {')
const skins: Record<'light' | 'dark', Record<string, string>> = {
  light,
  dark: { ...light, ...declarations('[data-theme="dark"] {') }
}
const resolve = (skin: 'light' | 'dark', name: string): string => {
  let value = skins[skin][name]
  while (value?.startsWith('var(')) value = skins[skin][value.slice(4, -1)]
  return value
}

type Rgba = [number, number, number, number]
const parse = (value: string): Rgba => {
  if (value.startsWith('#')) {
    const hex = value.slice(1)
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).concat(1) as Rgba
  }
  const parts = /^rgba?\(([^)]+)\)$/.exec(value)?.[1].split(/[\s,]+/).map(Number)
  if (!parts) throw new Error(`Cannot read colour ${value}`)
  return [parts[0], parts[1], parts[2], parts[3] ?? 1]
}
const toHex = (rgb: number[]): string =>
  `#${rgb.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
/** `top` painted over an opaque `bottom`. */
const over = (top: string, bottom: string): string => {
  const a = parse(top)
  const b = parse(bottom)
  return toHex([0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])))
}

describe('the field edge token', () => {
  const surfaces = ['--surface', '--surface-sunk', '--surface-raised', '--bg']

  it.each(['light', 'dark'] as const)('is 3:1 or better against every surface a field sits on, %s skin', (skin) => {
    const short = surfaces.filter((surface) => {
      const background = resolve(skin, surface)
      return contrastRatio(over(resolve(skin, '--border-field'), background), background) < 3
    })
    expect(short).toEqual([])
  })

  it('replaces a border that fell short in both skins', () => {
    // The two numbers the review measured, so this suite fails if the field
    // edge is ever pointed back at the divider colour.
    expect(contrastRatio(over(resolve('light', '--border-strong'), '#ffffff'), '#ffffff')).toBeLessThan(3)
    expect(
      contrastRatio(over(resolve('dark', '--border-strong'), resolve('dark', '--surface')), resolve('dark', '--surface'))
    ).toBeLessThan(3)
  })

  it('is the edge of the one field style, and a Tailwind colour', () => {
    expect(fieldControlClass.split(' ')).toContain('border-line-field')
    expect(fieldControlClass).not.toContain('border-line-strong')
    expect(read('tailwind.config.ts')).toContain("field: mixable('var(--border-field)')")
  })
})

describe('the event question boxes use the one field style', () => {
  it('draws the text and choice questions exactly like the name and phone boxes', () => {
    render(
      <ManagementEventBookingForm
        event={{
          id: 'question-style',
          name: 'Question fixture',
          startDate: '2999-01-01T19:00:00Z',
          payment_mode: 'prepaid',
          price: 10,
          booking_questions: [
            { id: 'diet', label: 'Any dietary needs?', type: 'text', required: true },
            { id: 'first', label: 'First time with us?', type: 'yes_no', required: true }
          ]
        }}
      />
    )

    const [textAnswer] = screen.getAllByLabelText('Any dietary needs? (required)')
    const [choiceAnswer] = screen.getAllByLabelText('First time with us? (required)')
    for (const answer of [textAnswer, choiceAnswer]) {
      expect(answer.className).toContain('border-line-field')
      expect(answer.className).not.toMatch(/\bborder-line\b(?!-)/)
    }
  })
})

describe('a chosen option is filled with the accent and ticked', () => {
  const slot = (time: string) => ({ time, available: true, available_capacity: 8, bookable_purpose: 'food_or_drinks' as const })

  it('marks the chosen time more strongly than the others, not less', () => {
    const grouped = {
      lunch: [{ slot: slot('12:30'), state: 'available' }, { slot: slot('13:00'), state: 'available' }],
      evening: [],
      selectableTimes: ['12:30', '13:00'],
      hiddenForHighChairs: 0
    } as unknown as GroupedSlots
    render(<SlotPickerGrid grouped={grouped} selectedTime="13:00" onSelect={jest.fn()} />)

    const chosen = screen.getByRole('button', { name: /^1pm,/ })
    const other = screen.getByRole('button', { name: /^12:30pm,/ })
    expect(chosen.className).toContain('bg-accent')
    expect(chosen.className).toContain('text-canvas')
    expect(chosen.className).not.toContain('bg-anchor-green')
    expect(chosen.querySelector('svg')).not.toBeNull()
    expect(other.querySelector('svg')).toBeNull()
  })

  it('marks the chosen Christmas answer the same way', () => {
    const period = {
      id: 'xmas',
      name: 'Christmas',
      bookable: true,
      guest_question: 'Are you coming for Christmas dinner?',
      guest_blurb: null,
      not_bookable_message: null,
      requires_preorder: false,
      menu: []
    } as unknown as BookingPeriod
    const onAnswer = jest.fn()
    render(<SeasonalPeriodQuestion period={period} deposit={null} answer={true} onAnswer={onAnswer} />)

    const yes = screen.getByRole('button', { name: 'Yes please' })
    const no = screen.getByRole('button', { name: 'No thanks' })
    expect(yes.className).toContain('bg-accent')
    expect(yes.querySelector('svg')).not.toBeNull()
    expect(no.querySelector('svg')).toBeNull()
    fireEvent.click(no)
    expect(onAnswer).toHaveBeenCalledWith(false)
  })
})

describe('the browser audit measures field edges, because axe does not', () => {
  function field(border: string, background = 'rgb(255, 255, 255)') {
    document.body.innerHTML = ''
    document.body.style.backgroundColor = background
    const input = document.createElement('input')
    input.setAttribute('aria-label', 'Your name')
    input.style.border = `1.5px solid ${border}`
    input.style.backgroundColor = background
    input.getBoundingClientRect = () => ({ width: 200, height: 48 }) as DOMRect
    document.body.appendChild(input)
  }

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.backgroundColor = ''
  })

  it('reports the old light-skin edge, 1.65:1 on white', () => {
    field('rgb(210, 201, 180)')
    expect(faintFieldEdges()).toEqual([{ name: 'Your name', ratio: 1.65 }])
  })

  it('reports the old dark-skin edge, translucent gold painted over the card', () => {
    field('rgba(201, 160, 32, 0.45)', 'rgb(23, 45, 30)')
    const [problem] = faintFieldEdges()
    expect(problem.name).toBe('Your name')
    expect(problem.ratio).toBeLessThan(3)
  })

  it('leaves out a field no guest can see, such as one in a closed drawer', () => {
    field('rgb(210, 201, 180)')
    const drawer = document.createElement('div')
    drawer.setAttribute('inert', '')
    drawer.appendChild(document.querySelector('input')!)
    document.body.appendChild(drawer)
    expect(faintFieldEdges()).toEqual([])
  })

  it('passes the new edge in both skins', () => {
    field('rgb(133, 123, 106)')
    expect(faintFieldEdges()).toEqual([])
    field('rgba(201, 160, 32, 0.75)', 'rgb(23, 45, 30)')
    expect(faintFieldEdges()).toEqual([])
  })
})
