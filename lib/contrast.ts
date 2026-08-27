/**
 * Pick a readable text colour for an arbitrary background.
 *
 * Category colours come from the management database, so any of them can land
 * anywhere on the spectrum. RelatedEvents hardcoded white text on whatever the
 * category colour happened to be, and one of them (a purple, #a658e9) came out
 * at 4.04:1 against white, under the 4.5:1 AA threshold.
 *
 * Hardcoding the other way would only move the problem to pale categories. This
 * measures instead, so it stays correct for colours nobody has picked yet.
 */
const DARK_INK = '#1a1a1a'
const LIGHT_INK = '#ffffff'

function channels(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '').trim()
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number]
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const ca = channels(a)
  const cb = channels(b)
  if (!ca || !cb) return 1
  const la = relativeLuminance(ca)
  const lb = relativeLuminance(cb)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/**
 * Returns whichever of near-black or white reads better on `background`.
 * Falls back to near-black for an unparseable value, which is safe on the
 * pale defaults such a value usually indicates.
 */
export function readableInkOn(background: string): string {
  if (!channels(background)) return DARK_INK
  return contrastRatio(DARK_INK, background) >= contrastRatio(LIGHT_INK, background)
    ? DARK_INK
    : LIGHT_INK
}
