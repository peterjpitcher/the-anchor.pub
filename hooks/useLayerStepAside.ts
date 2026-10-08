'use client'

import { useEffect, useState, type RefObject } from 'react'

/**
 * True while the page footer is underneath a floating card.
 *
 * At the bottom of a page a card pinned above the bottom edge sits on the
 * footer's row of legal links (Privacy Policy, Cookie settings and the rest)
 * until it is closed. The card steps aside while the footer is under it and
 * comes back when the visitor scrolls up again. This only records where the
 * footer is; the card hides itself with a class, so it stays mounted.
 *
 * `bottomOffsetPx` is how far above the bottom of the screen the card's lower
 * edge sits: anything that scrolls up past that line is underneath it.
 */
export function useFooterBehind(enabled: boolean, bottomOffsetPx: number): boolean {
  const [footerBehind, setFooterBehind] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const footer = document.querySelector('footer[role="contentinfo"]')
    if (!footer) return

    const observer = new IntersectionObserver(
      ([entry]) => setFooterBehind(entry.isIntersecting),
      { rootMargin: `0px 0px -${bottomOffsetPx}px 0px` }
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [enabled, bottomOffsetPx])

  return footerBehind
}

function isKeyboardFocused(element: Element): boolean {
  try {
    return element.matches(':focus-visible')
  } catch {
    // A browser with no :focus-visible: treat any focus as keyboard focus.
    return true
  }
}

/**
 * True while the control that has keyboard focus is underneath a floating card.
 *
 * WCAG 2.2 SC 2.4.11 (Focus Not Obscured): a focused control must not be wholly
 * hidden by other content. The bars at the bottom of the screen are handled by
 * `scroll-padding-bottom` on the page, which keeps a focused control clear of
 * them. A card floats higher up the window, where scroll padding cannot help,
 * so it steps aside instead (site review AX-004).
 *
 * The card must hide with `visibility`, never `display`: its box is what this
 * measures, and a card with no box would be read as out of the way, shown
 * again, and found in the way again.
 */
export function useFocusedControlBehind(cardRef: RefObject<HTMLElement>, enabled: boolean): boolean {
  const [focusBehind, setFocusBehind] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setFocusBehind(false)
      return
    }

    const evaluate = () => {
      const card = cardRef.current
      const focused = document.activeElement
      if (!card || !focused || focused === document.body || card.contains(focused) || !isKeyboardFocused(focused)) {
        setFocusBehind(false)
        return
      }
      const cardBox = card.getBoundingClientRect()
      const focusBox = focused.getBoundingClientRect()
      const overlaps =
        focusBox.width > 0 &&
        focusBox.height > 0 &&
        focusBox.left < cardBox.right &&
        focusBox.right > cardBox.left &&
        focusBox.top < cardBox.bottom &&
        focusBox.bottom > cardBox.top
      setFocusBehind(overlaps)
    }

    // The browser scrolls a focused control into view after the focus event, so
    // look again once it has. Scrolling by hand moves the control too.
    let frame = 0
    const onFocus = () => {
      evaluate()
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(evaluate)
    }

    document.addEventListener('focusin', onFocus)
    window.addEventListener('scroll', evaluate, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('focusin', onFocus)
      window.removeEventListener('scroll', evaluate)
    }
  }, [cardRef, enabled])

  return focusBehind
}
