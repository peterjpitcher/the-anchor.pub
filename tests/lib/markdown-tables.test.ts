import fs from 'fs'
import path from 'path'
import { wrapTablesForScrolling } from '@/lib/markdown-tables'

/**
 * Blog tables on a phone.
 *
 * On 6 October 2026 the comparison table on /blog/best-sunday-roast-surrey was
 * 856px wide on a 390px screen and could not be scrolled, because <body> hides
 * sideways overflow. 19 posts had a table cut off the same way. Each table now
 * sits in a region that scrolls on its own.
 *
 * remark is ESM-only and cannot be loaded here, so the HTML below is what
 * remark-gfm and remark-html really give for a markdown table, copied from the
 * pipeline's output rather than written to suit the test.
 */

const TABLE = `<table>
<thead>
<tr>
<th>Pub</th>
<th>Location</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>The Anchor</strong></td>
<td><a href="/find-us">Stanwell Moor</a></td>
</tr>
</tbody>
</table>`

const regions = (html: string): HTMLElement[] => {
  const holder = document.createElement('div')
  holder.innerHTML = html
  return Array.from(holder.querySelectorAll<HTMLElement>('[role="region"]'))
}

describe('wrapTablesForScrolling', () => {
  it('puts a table inside a region that scrolls sideways and takes keyboard focus', () => {
    const [region, ...others] = regions(wrapTablesForScrolling(`<h2>Quick Comparison</h2>\n${TABLE}`))

    expect(others).toHaveLength(0)
    expect(region.tagName).toBe('DIV')
    expect(region.className).toBe('table-scroll')
    expect(region.getAttribute('tabindex')).toBe('0')
    // The table is the region's only child, whole and unchanged.
    expect(region.children).toHaveLength(1)
    expect(region.firstElementChild?.outerHTML).toBe(TABLE)
  })

  it('names the region after the heading the table sits under', () => {
    const html = wrapTablesForScrolling(
      `<h2>Quick <em>Comparison</em>: Best Sunday Roasts</h2>\n<p>Some words.</p>\n${TABLE}`
    )

    expect(regions(html)[0].getAttribute('aria-label')).toBe('Table: Quick Comparison: Best Sunday Roasts')
  })

  it('gives every table in a post a different name', () => {
    const html = wrapTablesForScrolling(
      [`<h2>Prices</h2>`, TABLE, TABLE, `<h3>Parking</h3>`, TABLE].join('\n')
    )

    expect(regions(html).map((region) => region.getAttribute('aria-label'))).toEqual([
      'Table: Prices',
      'Table: Prices (2)',
      'Table: Parking',
    ])
  })

  it('still names a table that comes before any heading', () => {
    const html = wrapTablesForScrolling(`<p>Intro.</p>\n${TABLE}\n${TABLE}`)

    expect(regions(html).map((region) => region.getAttribute('aria-label'))).toEqual(['Table', 'Table (2)'])
  })

  it('keeps a heading with quotes or an ampersand from breaking the name', () => {
    // remark escapes & itself and leaves double quotes alone.
    const html = wrapTablesForScrolling(`<h2>The "big" roast &#x26; trimmings</h2>\n${TABLE}`)
    const [region] = regions(html)

    expect(region.getAttribute('aria-label')).toBe('Table: The "big" roast & trimmings')
    expect(region.getAttribute('tabindex')).toBe('0')
    expect(region.querySelector('table')).not.toBeNull()
  })

  it('leaves a post with no table exactly as it was', () => {
    const html = '<h2>No table here</h2>\n<p>Just words, and a <a href="/sunday-roast">link</a>.</p>'

    expect(wrapTablesForScrolling(html)).toBe(html)
  })
})

describe('the blog post template', () => {
  // The function above is only any use if the template calls it and the
  // stylesheet makes its wrapper scroll. Nothing else would notice either one
  // being dropped: the a11y audit measures the page's own scroll width, and
  // <body> hides exactly the overflow this is about.
  const read = (file: string): string => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

  it('passes the post through wrapTablesForScrolling before rendering it', () => {
    const source = read('app/blog/[slug]/page.tsx')

    expect(source).toMatch(/const contentWithImages = wrapTablesForScrolling\(/)
    expect(source).toMatch(/dangerouslySetInnerHTML=\{\{ __html: contentWithImages \}\}/)
  })

  it('has a stylesheet rule that makes the wrapper scroll sideways', () => {
    expect(read('app/globals.css')).toMatch(/^\.prose \.table-scroll \{[^}]*overflow-x: auto;/m)
  })
})
