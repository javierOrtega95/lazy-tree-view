import { useCallback, useEffect, useRef, useState } from 'react'
import { UseExpandTransitionOptions, UseExpandTransitionReturn } from './types'

// Delay to ensure DOM update before CSS transition
const OPEN_DELAY_MS = 10

type TransitionState = 'closed' | 'opening' | 'open' | 'closing'

/**
 * Hook that manages expand/collapse transitions while optimizing performance
 * by conditionally rendering content only when needed.
 */
export function useExpandTransition({
  isOpen,
  transitionDuration = 300,
  disableAnimations = false,
}: UseExpandTransitionOptions): UseExpandTransitionReturn {
  const [transitionState, setTransitionState] = useState<TransitionState>(
    isOpen ? 'open' : 'closed',
  )

  const timeoutRef = useRef<number | null>(null)
  const prevIsOpen = useRef(isOpen)

  const shouldRender = transitionState !== 'closed'
  const className = transitionState === 'open' ? 'open' : ''

  const cleanupTimeout = useCallback(() => {
    if (!timeoutRef.current) return

    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  useEffect(() => {
    cleanupTimeout()

    const wasOpening = !prevIsOpen.current && isOpen
    const wasClosing = prevIsOpen.current && !isOpen

    if (!wasOpening && !wasClosing) {
      prevIsOpen.current = isOpen
      return
    }

    const startOpeningTransition = () => {
      setTransitionState('opening')

      if (disableAnimations) {
        setTransitionState('open')
        return
      }

      timeoutRef.current = setTimeout(() => setTransitionState('open'), OPEN_DELAY_MS)
    }

    const startClosingTransition = () => {
      setTransitionState('closing')

      if (disableAnimations) {
        setTransitionState('closed')
        return
      }

      timeoutRef.current = setTimeout(() => setTransitionState('closed'), transitionDuration)
    }

    void (wasOpening ? startOpeningTransition() : startClosingTransition())

    prevIsOpen.current = isOpen
  }, [isOpen, disableAnimations, transitionDuration, cleanupTimeout])

  useEffect(() => {
    return () => {
      cleanupTimeout()
    }
  }, [cleanupTimeout])

  return { shouldRender, className }
}
