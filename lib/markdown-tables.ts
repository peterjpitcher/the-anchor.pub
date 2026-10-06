/**
 * Gives every table in rendered markdown its own sideways scroll.
 *
 * A comparison table is as wide as its columns need, and on a phone that is
 * wider than the screen: 856px against 390px on /blog/best-sunday-roast-surrey.
 * app/globals.css sets `overflow-x: hidden` on <body>, so the page cannot be
 * scrolled sideways either. Everything past the first screen width was cut off
 * with no way to reach it, on 19 posts (measured 6 October 2026).
 *
 * The wrapper is a named, focusable region so a keyboard user can scroll it
 * with the arrow keys and a screen reader says what it is (WCAG 2.2 AA: 1.4.10
 * reflow, 2.1.1 keyboard). The name comes from the heading the table sits
 * under, so two tables in one post are told apart.
 *
 * It works on the HTML string, after remark has finished, because remark-html
 * sanitises its output and drops `role` and `aria-label` from a <div>. That
 * same sanitising is what makes matching on tags safe here: the HTML never
 * holds a tag the author typed, only ones remark wrote.
 *
 * The scroll and the spacing are `.prose .table-scroll` in app/globals.css,
 * which also moves the table's margin onto the wrapper so the space around a
 * table is what it was.
 */

const WRAPPER_CLASS = 'table-scroll'

const HEADING_OR_TABLE = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>|<table\b[^>]*>|<\/table>/g

// Heading text arrives already escaped by remark, apart from double quotes,
// which are legal in text and would end the attribute early.
function headingText(headingHtml: string): string {
  return headingHtml
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/"/g, '&quot;')
}

export function wrapTablesForScrolling(html: string): string {
  let heading = ''
  const timesUsed = new Map<string, number>()

  return html.replace(HEADING_OR_TABLE, (match: string, _level?: string, headingHtml?: string) => {
    if (match === '</table>') return '</table></div>'

    if (headingHtml !== undefined) {
      heading = headingText(headingHtml)
      return match
    }

    const name = heading ? `Table: ${heading}` : 'Table'
    const count = (timesUsed.get(name) ?? 0) + 1
    timesUsed.set(name, count)
    const label = count > 1 ? `${name} (${count})` : name

    return `<div class="${WRAPPER_CLASS}" role="region" aria-label="${label}" tabindex="0">${match}`
  })
}
