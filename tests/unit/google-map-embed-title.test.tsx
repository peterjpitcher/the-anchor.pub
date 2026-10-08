/**
 * The map frame must have a name.
 *
 * GoogleMapEmbed is mounted on fourteen pages and its iframe carried no
 * `title`, which is a WCAG 2.4.1 failure repeated on every one of them. The
 * component is shared, so the fix had to stay backwards compatible: callers
 * that pass only a query keep the name they already had.
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'

// The frame is only added once the visitor asks for the map (see the last
// block of this file), so every check on the frame presses the button first.
function frameOf(container: HTMLElement): HTMLIFrameElement {
  fireEvent.click(screen.getByRole('button', { name: 'Show the map' }))
  const frame = container.querySelector('iframe')
  if (!frame) throw new Error('No iframe rendered')
  return frame as HTMLIFrameElement
}

describe('GoogleMapEmbed', () => {
  it('titles the frame from the query when the caller passes no title', () => {
    const { container } = render(<GoogleMapEmbed query="The Anchor, Stanwell Moor" />)
    const frame = frameOf(container)

    expect(frame.getAttribute('title')).toBe('Google Map showing The Anchor, Stanwell Moor')
    // The existing callers' accessible name is unchanged.
    expect(frame.getAttribute('aria-label')).toBe('Google Map showing The Anchor, Stanwell Moor')
  })

  it('uses the given title for both the frame title and its accessible name', () => {
    const { container } = render(
      <GoogleMapEmbed
        query="The Anchor Pub, Horton Road, Stanwell Moor, TW19 6AQ"
        title="Map showing where Quiz Night is held, The Anchor in Stanwell Moor"
      />
    )
    const frame = frameOf(container)

    expect(frame.getAttribute('title')).toBe(
      'Map showing where Quiz Night is held, The Anchor in Stanwell Moor'
    )
    expect(frame.getAttribute('aria-label')).toBe(frame.getAttribute('title'))
  })

  it('falls back to the query title rather than leaving the frame unnamed', () => {
    const { container } = render(<GoogleMapEmbed query="The Anchor, Stanwell Moor" title="   " />)
    const frame = frameOf(container)

    expect(frame.getAttribute('title')).toBe('Google Map showing The Anchor, Stanwell Moor')
  })

  it('still points at the queried location', () => {
    const { container } = render(<GoogleMapEmbed query="The Anchor, Stanwell Moor" />)

    expect(frameOf(container).getAttribute('src')).toContain(
      encodeURIComponent('The Anchor, Stanwell Moor')
    )
  })

  // Privacy: a Google Maps frame is a request to Google from the visitor's
  // browser. It must not be made until they ask for the map.
  describe('waits to be asked', () => {
    it('renders no frame, and so contacts Google for nothing, until the button is pressed', () => {
      const { container } = render(<GoogleMapEmbed query="The Anchor, Stanwell Moor" />)

      expect(container.querySelector('iframe')).toBeNull()
      expect(container.innerHTML).not.toContain('output=embed')
    })

    it('holds the same height before and after, so nothing moves when the map arrives', () => {
      const { container } = render(<GoogleMapEmbed query="The Anchor, Stanwell Moor" height={360} />)
      const placeholder = screen.getByRole('button', { name: 'Show the map' }).parentElement as HTMLElement
      expect(placeholder.style.height).toBe('360px')

      fireEvent.click(screen.getByRole('button', { name: 'Show the map' }))
      expect(container.querySelector('iframe')?.getAttribute('height')).toBe('360')
    })

    it('offers a plain link to Google Maps for anyone who would rather open it there', () => {
      render(<GoogleMapEmbed query="The Anchor, Stanwell Moor" />)
      const link = screen.getByRole('link', { name: 'Open in Google Maps' })

      expect(link.getAttribute('href')).toBe(
        `https://maps.google.com/maps?q=${encodeURIComponent('The Anchor, Stanwell Moor')}`
      )
      expect(link.getAttribute('rel')).toContain('noopener')
    })
  })
})
