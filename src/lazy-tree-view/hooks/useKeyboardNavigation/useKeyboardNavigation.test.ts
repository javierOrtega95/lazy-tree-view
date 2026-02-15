import { act, renderHook } from '@testing-library/react'
import { KeyboardEvent } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBranch, createItem, createTree } from '../../../test/test-utils'
import { createNodeIndex } from '../../utils/tree-recursive'
import { useKeyboardNavigation } from './useKeyboardNavigation'

const createKeyboardEvent = (key: string, shiftKey = false): KeyboardEvent =>
  ({
    key,
    shiftKey,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as unknown as KeyboardEvent

describe('useKeyboardNavigation', () => {
  let setFocusedNodeId: ReturnType<typeof vi.fn>
  let onToggleOpen: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setFocusedNodeId = vi.fn()
    onToggleOpen = vi.fn()
  })

  describe('disabled', () => {
    it('should not respond to keys when disabled', () => {
      const tree = createTree([createItem('1')])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: '1',
          setFocusedNodeId,
          onToggleOpen,
          disabled: true,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'))
      })

      expect(setFocusedNodeId).not.toHaveBeenCalled()
    })
  })

  describe('ArrowDown navigation', () => {
    it('should navigate to next sibling', () => {
      const tree = createTree([createItem('1'), createItem('2'), createItem('3')])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: '1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'))
      })

      expect(setFocusedNodeId).toHaveBeenCalledWith('2')
    })

    it('should navigate into open branch', () => {
      const tree = createTree([createBranch('f1', [createItem('child')], { isOpen: true })])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: 'f1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'))
      })

      expect(setFocusedNodeId).toHaveBeenCalledWith('child')
    })

    it('should skip closed branch children', () => {
      const tree = createTree([
        createBranch('f1', [createItem('child')], { isOpen: false }),
        createItem('2'),
      ])

      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: 'f1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'))
      })

      expect(setFocusedNodeId).toHaveBeenCalledWith('2')
    })
  })

  describe('ArrowUp navigation', () => {
    it('should navigate to previous sibling', () => {
      const tree = createTree([createItem('1'), createItem('2')])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: '2',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowUp'))
      })

      expect(setFocusedNodeId).toHaveBeenCalledWith('1')
    })

    it('should navigate to parent when no previous sibling', () => {
      const tree = createTree([createBranch('f1', [createItem('child')], { isOpen: true })])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: 'child',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowUp'))
      })

      expect(setFocusedNodeId).toHaveBeenCalledWith('f1')
    })

    it('should navigate to last visible descendant of previous sibling', () => {
      const tree = createTree([
        createBranch('f1', [createItem('deep')], { isOpen: true }),
        createItem('2'),
      ])

      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: '2',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowUp'))
      })

      expect(setFocusedNodeId).toHaveBeenCalledWith('deep')
    })
  })

  describe('ArrowRight navigation', () => {
    it('should expand closed branch', () => {
      const branch = createBranch('f1', [createItem('child')], { isOpen: false })
      const tree = createTree([branch])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: 'f1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowRight'))
      })

      expect(onToggleOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'f1' }))
    })

    it('should navigate to first child when branch is already open', () => {
      const tree = createTree([createBranch('f1', [createItem('child')], { isOpen: true })])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: 'f1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowRight'))
      })

      expect(setFocusedNodeId).toHaveBeenCalledWith('child')
    })

    it('should do nothing for items', () => {
      const tree = createTree([createItem('1')])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: '1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowRight'))
      })

      expect(onToggleOpen).not.toHaveBeenCalled()
      expect(setFocusedNodeId).not.toHaveBeenCalled()
    })
  })

  describe('ArrowLeft navigation', () => {
    it('should collapse open branch', () => {
      const branch = createBranch('f1', [createItem('child')], { isOpen: true })
      const tree = createTree([branch])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: 'f1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowLeft'))
      })

      expect(onToggleOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'f1' }))
    })

    it('should navigate to parent when on closed branch or item', () => {
      const tree = createTree([createBranch('f1', [createItem('child')], { isOpen: true })])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: 'child',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowLeft'))
      })

      expect(setFocusedNodeId).toHaveBeenCalledWith('f1')
    })
  })

  describe('Home key', () => {
    it('should navigate to first node', () => {
      const tree = createTree([createItem('1'), createItem('2'), createItem('3')])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: '3',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Home'))
      })

      expect(setFocusedNodeId).toHaveBeenCalledWith('1')
    })
  })

  describe('End key', () => {
    it('should navigate to last visible node', () => {
      const tree = createTree([createItem('1'), createItem('2'), createItem('3')])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: '1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('End'))
      })

      expect(setFocusedNodeId).toHaveBeenCalledWith('3')
    })

    it('should navigate to last visible descendant of last node', () => {
      const tree = createTree([
        createItem('1'),
        createBranch('f1', [createItem('deep')], { isOpen: true }),
      ])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: '1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('End'))
      })

      expect(setFocusedNodeId).toHaveBeenCalledWith('deep')
    })
  })

  describe('Enter and Space keys', () => {
    it('should toggle branch on Enter', () => {
      const branch = createBranch('f1', [createItem('child')], { isOpen: false })
      const tree = createTree([branch])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: 'f1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Enter'))
      })

      expect(onToggleOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'f1' }))
    })

    it('should toggle branch on Space', () => {
      const branch = createBranch('f1', [createItem('child')], { isOpen: true })
      const tree = createTree([branch])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: 'f1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent(' '))
      })

      expect(onToggleOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'f1' }))
    })

    it('should not toggle items', () => {
      const tree = createTree([createItem('1')])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: '1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Enter'))
      })

      expect(onToggleOpen).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should not toggle loading branch on ArrowRight', () => {
      const branch = createBranch('f1', [], { isOpen: false, isLoading: true })
      const tree = createTree([branch])
      const nodeIndex = createNodeIndex(tree)

      const { result } = renderHook(() =>
        useKeyboardNavigation({
          tree,
          nodeIndex,
          focusedNodeId: 'f1',
          setFocusedNodeId,
          onToggleOpen,
        }),
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowRight'))
      })

      expect(onToggleOpen).not.toHaveBeenCalled()
    })
  })
})
