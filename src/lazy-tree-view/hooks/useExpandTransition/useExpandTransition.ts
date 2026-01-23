import { useCallback, useEffect, useRef, useState } from 'react'
import { UseExpandTransitionOptions, UseExpandTransitionReturn } from './types'

// Delay to ensure DOM update before CSS transition
const OPEN_DELAY_MS = 10

/**
 * Hook that manages expand/collapse transitions while optimizing performance
 * by conditionally rendering content only when needed.
 */
export function useExpandTransition({
  isOpen,
  transitionDuration = 300,
}: UseExpandTransitionOptions): UseExpandTransitionReturn {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [showOpen, setShowOpen] = useState(isOpen)

  const timeoutRef = useRef<number | null>(null)
  const prevIsOpen = useRef(isOpen)

  const cleanupTimeout = useCallback(() => {
    if (!timeoutRef.current) return

    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  const startOpeningTransition = useCallback(() => {
    setShouldRender(true)
    setShowOpen(false)

    timeoutRef.current = setTimeout(() => setShowOpen(true), OPEN_DELAY_MS)
  }, [])

  const startClosingTransition = useCallback(() => {
    setShowOpen(false)

    timeoutRef.current = setTimeout(() => setShouldRender(false), transitionDuration)
  }, [transitionDuration])

  useEffect(() => {
    cleanupTimeout()

    const wasOpening = !prevIsOpen.current && isOpen
    const wasClosing = prevIsOpen.current && !isOpen

    if (!wasOpening && !wasClosing) {
      prevIsOpen.current = isOpen

      return
    }

    void (wasOpening ? startOpeningTransition() : startClosingTransition())

    prevIsOpen.current = isOpen
  }, [isOpen, cleanupTimeout, startOpeningTransition, startClosingTransition])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      cleanupTimeout()
    }
  }, [cleanupTimeout])

  return {
    shouldRender,
    className: shouldRender && showOpen ? 'open' : '',
  }
}
