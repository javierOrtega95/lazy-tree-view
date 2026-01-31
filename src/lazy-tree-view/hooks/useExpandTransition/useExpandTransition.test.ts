import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExpandTransition } from './useExpandTransition'

describe('useExpandTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should return closed state when isOpen is false', () => {
      const { result } = renderHook(() => useExpandTransition({ isOpen: false }))

      expect(result.current.transitionState).toBe('closed')
      expect(result.current.shouldRender).toBe(false)
    })

    it('should return open state when isOpen is true', () => {
      const { result } = renderHook(() => useExpandTransition({ isOpen: true }))

      expect(result.current.transitionState).toBe('open')
      expect(result.current.shouldRender).toBe(true)
    })
  })

  describe('opening transition', () => {
    it('should transition from closed to opening when isOpen changes to true', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useExpandTransition({ isOpen }),
        { initialProps: { isOpen: false } }
      )

      rerender({ isOpen: true })

      expect(result.current.transitionState).toBe('opening')
      expect(result.current.shouldRender).toBe(true)
    })

    it('should transition to open after delay', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useExpandTransition({ isOpen }),
        { initialProps: { isOpen: false } }
      )

      rerender({ isOpen: true })

      expect(result.current.transitionState).toBe('opening')

      act(() => {
        vi.advanceTimersByTime(10) // OPEN_DELAY_MS
      })

      expect(result.current.transitionState).toBe('open')
    })
  })

  describe('closing transition', () => {
    it('should transition from open to closing when isOpen changes to false', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useExpandTransition({ isOpen }),
        { initialProps: { isOpen: true } }
      )

      rerender({ isOpen: false })

      expect(result.current.transitionState).toBe('closing')
      expect(result.current.shouldRender).toBe(true)
    })

    it('should transition to closed after transitionDuration', () => {
      const transitionDuration = 300
      const { result, rerender } = renderHook(
        ({ isOpen }) => useExpandTransition({ isOpen, transitionDuration }),
        { initialProps: { isOpen: true } }
      )

      rerender({ isOpen: false })

      expect(result.current.transitionState).toBe('closing')

      act(() => {
        vi.advanceTimersByTime(transitionDuration)
      })

      expect(result.current.transitionState).toBe('closed')
      expect(result.current.shouldRender).toBe(false)
    })

    it('should respect custom transitionDuration', () => {
      const customDuration = 500
      const { result, rerender } = renderHook(
        ({ isOpen }) => useExpandTransition({ isOpen, transitionDuration: customDuration }),
        { initialProps: { isOpen: true } }
      )

      rerender({ isOpen: false })

      act(() => {
        vi.advanceTimersByTime(300) // Less than custom duration
      })

      expect(result.current.transitionState).toBe('closing')

      act(() => {
        vi.advanceTimersByTime(200) // Complete the duration
      })

      expect(result.current.transitionState).toBe('closed')
    })
  })

  describe('disableAnimations', () => {
    it('should skip opening animation when disabled', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useExpandTransition({ isOpen, disableAnimations: true }),
        { initialProps: { isOpen: false } }
      )

      rerender({ isOpen: true })

      // Should go directly to open without waiting
      expect(result.current.transitionState).toBe('open')
    })

    it('should skip closing animation when disabled', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useExpandTransition({ isOpen, disableAnimations: true }),
        { initialProps: { isOpen: true } }
      )

      rerender({ isOpen: false })

      // Should go directly to closed without waiting
      expect(result.current.transitionState).toBe('closed')
    })
  })

  describe('shouldRender', () => {
    it('should be false only when state is closed', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useExpandTransition({ isOpen }),
        { initialProps: { isOpen: false } }
      )

      expect(result.current.shouldRender).toBe(false)

      rerender({ isOpen: true })
      expect(result.current.shouldRender).toBe(true) // opening

      act(() => {
        vi.advanceTimersByTime(10)
      })
      expect(result.current.shouldRender).toBe(true) // open

      rerender({ isOpen: false })
      expect(result.current.shouldRender).toBe(true) // closing

      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(result.current.shouldRender).toBe(false) // closed
    })
  })

  describe('cleanup', () => {
    it('should clear timeout on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
      const { rerender, unmount } = renderHook(
        ({ isOpen }) => useExpandTransition({ isOpen }),
        { initialProps: { isOpen: false } }
      )

      rerender({ isOpen: true })
      unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()
      clearTimeoutSpy.mockRestore()
    })
  })
})