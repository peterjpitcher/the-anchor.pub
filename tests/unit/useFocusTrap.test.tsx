import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFocusTrap } from '@/hooks/useFocusTrap'

/**
 * Site review AX-001, 7 October 2026. In the phone menu the Tab key stuck on
 * the first heading, 'Food'. The trap built its list of controls from a
 * selector alone, so it included the eight links inside the collapsed section
 * (display: none). It cancelled Tab and called focus() on the next item in the
 * list, a hidden link, which does nothing, so focus never moved.
 *
 * The four Navigation suites mock this hook, so nothing tested it. jsdom has no
 * layout, so the collapsed section is hidden here with an inline style, which
 * is what Tailwind's `hidden` class comes to in a browser.
 */
function Menu({ foodOpen = false }: { foodOpen?: boolean }) {
  const [open, setOpen] = useState(foodOpen)
  const ref = useFocusTrap(true)

  return (
    <>
      <button>Outside the menu</button>
      <div ref={ref}>
        <button onClick={() => setOpen((value) => !value)}>Food</button>
        <ul style={{ display: open ? undefined : 'none' }}>
          <li><a href="/food-menu">Food menu</a></li>
          <li><a href="/sunday-roast">Sunday roast</a></li>
        </ul>
        <button>Private Hire</button>
        <div hidden>
          <a href="/private-hire">Private hire</a>
        </div>
        {/* React 18's types do not know `inert` yet. */}
        <div {...({ inert: '' } as Record<string, string>)}>
          <a href="/inert">Inert link</a>
        </div>
        <a href="/find-us" style={{ visibility: 'hidden' }}>Not shown</a>
        <a href="/book-table">Book a table</a>
      </div>
    </>
  )
}

const focused = () => (document.activeElement as HTMLElement | null)?.textContent

describe('useFocusTrap', () => {
  it('moves focus into the container when it becomes active', () => {
    render(<Menu />)
    expect(screen.getByRole('button', { name: 'Food' })).toHaveFocus()
  })

  it('walks past a collapsed section instead of sticking on the control before it', async () => {
    const user = userEvent.setup()
    render(<Menu />)

    const seen: Array<string | null | undefined> = [focused()]
    for (let press = 0; press < 5; press += 1) {
      await user.tab()
      seen.push(focused())
    }

    // Food, Private Hire, Book a table, and round again. Before the fix this
    // was 'Food' six times.
    expect(seen).toEqual(['Food', 'Private Hire', 'Book a table', 'Food', 'Private Hire', 'Book a table'])
  })

  it('never lands on a control that is hidden, inert or not rendered, in either direction', async () => {
    const user = userEvent.setup()
    render(<Menu />)

    const seen = new Set<string | null | undefined>()
    for (let press = 0; press < 6; press += 1) {
      await user.tab({ shift: true })
      seen.add(focused())
    }

    expect([...seen].sort()).toEqual(['Book a table', 'Food', 'Private Hire'])
  })

  it('includes a section once it is opened', async () => {
    const user = userEvent.setup()
    render(<Menu />)

    await user.keyboard('{Enter}')
    const seen: Array<string | null | undefined> = []
    for (let press = 0; press < 5; press += 1) {
      await user.tab()
      seen.push(focused())
    }

    expect(seen).toEqual(['Food menu', 'Sunday roast', 'Private Hire', 'Book a table', 'Food'])
  })

  it('keeps focus inside the container', async () => {
    const user = userEvent.setup()
    render(<Menu foodOpen />)

    for (let press = 0; press < 12; press += 1) {
      await user.tab()
      expect(screen.getByRole('button', { name: 'Outside the menu' })).not.toHaveFocus()
    }
  })
})
