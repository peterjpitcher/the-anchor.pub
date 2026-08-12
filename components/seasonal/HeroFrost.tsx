/**
 * Frosted-window edge that creeps in around a hero photo, heaviest in the
 * corners, 1 November to 31 December.
 *
 * Always rendered, never conditional. Every layer's opacity resolves through
 * `var(--winter-frost, 0)`, and the root layout only emits that custom
 * property in season, so out of season these are three invisible divs. That
 * keeps 101 interior pages from having to know what month it is.
 *
 * Sits above the hero's scrim and below its content, so the worst-case
 * lightening is in the corners, where no text sits.
 */
export function HeroFrost() {
  const frost = 'var(--winter-frost, 0)'

  return (
    <>
      {/* Bloom: a soft inner rim around the whole photo.
          Lighter than the design brief's `130px 26px` at .42, which was drawn
          against a fixed 1080px board. Over a full-bleed hero and the existing
          dark scrim it rendered as a wall of grey that hid the pub entirely.
          These values keep it an edge, which is what the brief asked for. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          opacity: frost,
          transition: 'opacity .45s ease',
          boxShadow:
            'inset 0 0 70px 4px rgba(222,236,246,.20), inset 0 0 24px 3px rgba(255,255,255,.16)'
        }}
      />

      {/* Corners: where real frost gathers first. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          opacity: frost,
          transition: 'opacity .45s ease',
          backgroundImage: [
            'radial-gradient(300px 190px at 0% 0%, rgba(240,247,252,.30), transparent 72%)',
            'radial-gradient(265px 165px at 100% 0%, rgba(240,247,252,.26), transparent 72%)',
            'radial-gradient(315px 205px at 0% 100%, rgba(240,247,252,.24), transparent 72%)',
            'radial-gradient(280px 180px at 100% 100%, rgba(240,247,252,.28), transparent 72%)'
          ].join(', ')
        }}
      />

      {/* Crystal texture: the existing film grain, masked to the edges so the
          middle of the photo stays clean. Gated on mask-composite so browsers
          without it get nothing rather than a full-bleed noise wash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[var(--grain)] [@supports_not_(mask-composite:add)]:hidden"
        style={{
          opacity: `calc(${frost} * .5)`,
          transition: 'opacity .45s ease',
          mixBlendMode: 'screen',
          WebkitMaskImage:
            'linear-gradient(90deg,#000 0,transparent 12%,transparent 88%,#000 100%), linear-gradient(180deg,#000 0,transparent 14%,transparent 86%,#000 100%)',
          maskImage:
            'linear-gradient(90deg,#000 0,transparent 12%,transparent 88%,#000 100%), linear-gradient(180deg,#000 0,transparent 14%,transparent 86%,#000 100%)',
          WebkitMaskComposite: 'source-over',
          maskComposite: 'add'
        }}
      />
    </>
  )
}
