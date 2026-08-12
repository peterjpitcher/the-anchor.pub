/**
 * Icicle strand that hangs under the header and over the top of the hero
 * photo, 1 November to 31 December.
 *
 * Rendered from the root layout, not from Navigation, so it stays a server
 * component and no page needs to know the season exists. It sits directly
 * below the sticky header in normal flow, which is what lets it scroll away
 * with the hero rather than following the bar down the page.
 *
 * Deliberately still: no twinkle, no pulse. Earlier animated versions were
 * rejected as looking artificial.
 *
 * A plain <img> background rather than next/image because it tiles: the
 * artwork repeats on the x axis so the strand reads at any viewport width.
 */
export function IcicleLights() {
  return (
    <div
      aria-hidden
      // Shorter than the artwork on purpose, so the bulbs overhang the hero
      // instead of pushing it down the page. The z-index is what makes the
      // overhang visible: the hero is a positioned sibling that paints later
      // and would otherwise cover the strand completely. Below the sticky
      // nav's z-60 so the bar still passes over it on scroll.
      className="pointer-events-none relative z-[59] h-[10px]"
      style={{ opacity: 'var(--winter-lights, 0)', transition: 'opacity .45s ease' }}
    >
      <div
        className="absolute inset-x-0 top-[9px] h-[58px] bg-repeat-x bg-[length:auto_40px] sm:bg-[length:auto_58px]"
        style={{
          backgroundImage: 'url(/images/seasonal/icicle-lights.png)',
          filter: 'drop-shadow(0 2px 8px rgba(232,181,60,0.3))'
        }}
      />
    </div>
  )
}
