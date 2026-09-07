/**
 * The map frame must have a name.
 *
 * GoogleMapEmbed is mounted on fourteen pages and its iframe carried no
 * `title`, which is a WCAG 2.4.1 failure repeated on every one of them. The
 * component is shared, so the fix had to stay backwards compatible: callers
 * that pass only a query keep the name they already had.
 */

import { render } from '@testing-library/react'
import { GoogleMapEmbed } from '@/components/ui/GoogleMapEmbed'

function frameOf(container: HTMLElement): HTMLIFrameElement {
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
})
