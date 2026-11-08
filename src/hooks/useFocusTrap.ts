import { useEffect, useRef } from "react"

/**
 * Custom hook to trap keyboard focus within a modal dialog and manage focus restoration.
 * Ensures WCAG 2.1 Level AA compliance for dialog windows without duplicate Escape handlers.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose?: () => void,
  enableEscape: boolean = false
) {
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Save previous active element to restore upon dismissal
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      previousActiveElement.current = document.activeElement
    }

    const container = containerRef.current
    if (!container) return

    const getFocusableElements = () => {
      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      return Array.from(focusable).filter(
        (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
      )
    }

    // Direct initial focus to first interactive element
    const focusables = getFocusableElements()
    if (focusables.length > 0) {
      focusables[0].focus()
    } else {
      container.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (enableEscape && e.key === "Escape") {
        e.stopPropagation()
        onClose?.()
        return
      }

      if (e.key === "Tab") {
        const elements = getFocusableElements()
        if (elements.length === 0) {
          e.preventDefault()
          return
        }

        const firstElement = elements[0]
        const lastElement = elements[elements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === container) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === "function") {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, onClose, enableEscape, containerRef])
}
