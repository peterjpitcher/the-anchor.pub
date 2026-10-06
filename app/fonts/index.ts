import localFont from 'next/font/local'

/**
 * The site's three typefaces, read from the files in this folder.
 *
 * These are the same files `next/font/google` used to download from Google
 * Fonts during every build (README.md here records where each one came from).
 * That download made a build depend on Google answering in the shape Next
 * expects. On 6 October 2026 it did not, and two Vercel builds failed inside
 * the font loader (vercel/next.js#99114). Reading local files means a build
 * makes no network call for fonts at all.
 *
 * Everything below mirrors what `next/font/google` generated, so nothing a
 * visitor sees changes:
 *
 * - Google serves each family as two files, "latin" and "latin-ext", told
 *   apart by `unicode-range`. `next/font/local` can attach only one
 *   `unicode-range` per call, hence two calls per family. Only the latin file
 *   is preloaded, as before. A latin-ext file is fetched only by a page that
 *   uses one of its characters.
 * - Outfit is a single variable file. Google declared it once for each weight
 *   asked for, not as a range, so a weight in between snaps to the nearest
 *   hundred. It is declared the same way here to keep that behaviour.
 * - `adjustFontFallback` is off because the size-matched fallback faces are
 *   written out in globals.css with the numbers Next generated for the Google
 *   versions. `next/font/local` would work out slightly different ones.
 *
 * globals.css joins each pair into the variable the rest of the site reads:
 * --font-display, --font-body and --font-script.
 *
 * Every option has to be a literal, because Next reads these calls at compile
 * time. That is why the two unicode-range strings are repeated.
 */

const displayLatin = localFont({
  src: [
    { path: './dm-serif-display-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './dm-serif-display-latin-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-display-latin',
  display: 'swap',
  adjustFontFallback: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

const displayLatinExt = localFont({
  src: [
    { path: './dm-serif-display-latin-ext-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './dm-serif-display-latin-ext-400-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-display-latin-ext',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
    },
  ],
})

const bodyLatin = localFont({
  src: [
    { path: './outfit-latin-variable.woff2', weight: '300', style: 'normal' },
    { path: './outfit-latin-variable.woff2', weight: '400', style: 'normal' },
    { path: './outfit-latin-variable.woff2', weight: '500', style: 'normal' },
    { path: './outfit-latin-variable.woff2', weight: '600', style: 'normal' },
    { path: './outfit-latin-variable.woff2', weight: '700', style: 'normal' },
    { path: './outfit-latin-variable.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-body-latin',
  display: 'swap',
  adjustFontFallback: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

const bodyLatinExt = localFont({
  src: [
    { path: './outfit-latin-ext-variable.woff2', weight: '300', style: 'normal' },
    { path: './outfit-latin-ext-variable.woff2', weight: '400', style: 'normal' },
    { path: './outfit-latin-ext-variable.woff2', weight: '500', style: 'normal' },
    { path: './outfit-latin-ext-variable.woff2', weight: '600', style: 'normal' },
    { path: './outfit-latin-ext-variable.woff2', weight: '700', style: 'normal' },
    { path: './outfit-latin-ext-variable.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-body-latin-ext',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
    },
  ],
})

const scriptLatin = localFont({
  src: [{ path: './clicker-script-latin-400-normal.woff2', weight: '400', style: 'normal' }],
  variable: '--font-script-latin',
  display: 'swap',
  adjustFontFallback: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

const scriptLatinExt = localFont({
  src: [{ path: './clicker-script-latin-ext-400-normal.woff2', weight: '400', style: 'normal' }],
  variable: '--font-script-latin-ext',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
    },
  ],
})

/** The classes that set every font variable. They go on `<html>`. */
export const fontVariables: string = [
  displayLatin,
  displayLatinExt,
  bodyLatin,
  bodyLatinExt,
  scriptLatin,
  scriptLatinExt,
]
  .map((font) => font.variable)
  .join(' ')
