import { useEffect, useRef } from 'react'

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive) return

    // Save current focus
    previousFocus.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    // Only controls that can take focus right now. The selector alone also
    // matches links inside a collapsed section (display: none), a [hidden]
    // block or an [inert] one. focus() does nothing on those, so with them in
    // the list Tab stuck on the control before the first hidden one: in the
    // phone menu that was the first heading, 'Food' (site review AX-001,
    // 7 October 2026).
    const canTakeFocus = (element: HTMLElement) => {
      if (element.closest('[hidden], [inert]')) return false
      if (window.getComputedStyle(element).visibility === 'hidden') return false
      // display: none on the control or on anything between it and the
      // container takes it out of the page. Read from the styles, not from the
      // element's boxes, so the answer is the same where nothing is laid out.
      for (let node: HTMLElement | null = element; node; node = node.parentElement) {
        if (window.getComputedStyle(node).display === 'none') return false
        if (node === container) break
      }
      return true
    }

    const getFocusableElements = () => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ]

      return (Array.from(
        container.querySelectorAll(focusableSelectors.join(','))
      ) as HTMLElement[]).filter(canTakeFocus)
    }

    // Focus first element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    // Handle tab navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
      
      if (e.shiftKey) {
        // Shift + Tab
        e.preventDefault()
        const nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
        focusableElements[nextIndex].focus()
      } else {
        // Tab
        e.preventDefault()
        const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1
        focusableElements[nextIndex].focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      // Restore focus when closing
      if (previousFocus.current && previousFocus.current.focus) {
        previousFocus.current.focus()
      }
    }
  }, [isActive])

  return containerRef
}