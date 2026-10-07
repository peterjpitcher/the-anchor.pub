/**
 * The Six Nations 2026 pop-up is switched off (owner decision, 6 October 2026).
 *
 * `/live-sport/six-nations` mounted `SixNationsLightbox`, which opened on exit
 * intent or after 40 seconds and told visitors "Don't Miss Kick Off!". It was
 * still doing that in October 2026, and docs/SSOT.md has no Six Nations entry
 * to say the event is running. The page no longer mounts it.
 *
 * The component was deleted on 7 October 2026, also by owner decision: it still
 * promised "Every match live", which docs/SSOT.md does not support. This test
 * stops any pop-up being put on the page without a decision: nothing opens on
 * exit intent, nothing opens on a timer, and the old component stays deleted.
 */

import fs from 'fs'
import path from 'path'
import { act, render, screen } from '@testing-library/react'
import SixNationsPage from '@/app/live-sport/six-nations/page'

jest.mock('next/navigation', () => ({
  usePathname: () => '/live-sport/six-nations'
}))

jest.mock('@/lib/gtm-events', () => ({
  ...jest.requireActual('@/lib/gtm-events'),
  trackModalOpen: jest.fn(),
  trackModalClose: jest.fn(),
  trackModalEngage: jest.fn()
}))

// The page loaded the pop-up through next/dynamic with `ssr: false`. Left to
// itself under Jest that can render nothing, and this test would pass with the
// pop-up still mounted. So load whatever the page asks for straight away.
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require('react')
    return function Dynamic(props: Record<string, unknown>) {
      const [Loaded, setLoaded] = React.useState(null)
      React.useEffect(() => {
        let live = true
        loader().then((component) => {
          if (live) setLoaded(() => component)
        })
        return () => {
          live = false
        }
      }, [])
      return Loaded ? React.createElement(Loaded, props) : null
    }
  }
}))

const SIX_NATIONS_TIMER_MS = 40_000

/** Let a dynamic import and the render that follows it finish. */
async function flush(): Promise<void> {
  await act(async () => {
    for (let i = 0; i < 10; i += 1) await Promise.resolve()
  })
}

describe('/live-sport/six-nations', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('does not open the Six Nations pop-up on exit intent', async () => {
    render(<SixNationsPage />)
    await flush()

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave', { clientY: -1 }))
    })
    await flush()

    expect(screen.queryByText("Don't Miss Kick Off!")).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument()
  })

  it('does not open the Six Nations pop-up once its 40 second timer would have fired', async () => {
    render(<SixNationsPage />)
    await flush()

    act(() => {
      jest.advanceTimersByTime(SIX_NATIONS_TIMER_MS + 1_000)
    })
    await flush()

    expect(screen.queryByText("Don't Miss Kick Off!")).not.toBeInTheDocument()
    expect(localStorage.getItem('six_nations_2026_lightbox_seen')).toBeNull()
  })

  it('opens no dialog of any kind on exit intent or after a long wait', async () => {
    render(<SixNationsPage />)
    await flush()

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave', { clientY: -1 }))
      jest.advanceTimersByTime(120_000)
    })
    await flush()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps the deleted pop-up and its two images deleted', () => {
    const root = process.cwd()
    expect(fs.existsSync(path.join(root, 'components', 'features', 'six-nations'))).toBe(false)
    expect(fs.existsSync(path.join(root, 'public', 'images', 'six-nations'))).toBe(false)
  })

  it('still renders the page itself', async () => {
    render(<SixNationsPage />)
    await flush()

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
