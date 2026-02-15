import { act, renderHook } from '@testing-library/react'
import { type DragEvent, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DropPosition } from '../../../types/dnd'
import type { NodeParents } from '../../../types/tree'
import {
  LazyTreeViewContext,
  type LazyTreeViewContextData,
} from '../../context/LazyTreeViewContext'
import useTreeNodeDnD from './useTreeNodeDnD'
import { createBranch, createItem } from '../../../test/test-utils'

// Mock calculateDragPosition to avoid DOM dependencies
vi.mock('../../utils/tree-operations', async () => {
  const actual = await vi.importActual('../../utils/tree-operations')
  return {
    ...actual,
    calculateDragPosition: vi.fn(() => DropPosition.Before),
  }
})

const createDragEvent = (overrides: Partial<DragEvent> = {}): DragEvent => {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: {
      effectAllowed: 'uninitialized',
      dropEffect: 'none',
    },
    currentTarget: document.createElement('div'),
    relatedTarget: null,
    nativeEvent: { offsetY: 10 },
    ...overrides,
  } as unknown as DragEvent
}

describe('useTreeNodeDnD', () => {
  let setDraggingNode: ReturnType<typeof vi.fn>
  let setHoveredNodeId: ReturnType<typeof vi.fn>
  let onDrop: ReturnType<typeof vi.fn>

  const createContextValue = (
    overrides: Partial<LazyTreeViewContextData> = {},
  ): LazyTreeViewContextData => ({
    nodeParents: {},
    draggingNode: null,
    hoveredNodeId: null,
    focusedNodeId: null,
    setDraggingNode,
    setHoveredNodeId,
    setFocusedNodeId: vi.fn(),
    ...overrides,
  })

  const createWrapper = (contextValue: LazyTreeViewContextData) => {
    return ({ children }: { children: ReactNode }) => (
      <LazyTreeViewContext.Provider value={contextValue}>{children}</LazyTreeViewContext.Provider>
    )
  }

  beforeEach(() => {
    setDraggingNode = vi.fn()
    setHoveredNodeId = vi.fn()
    onDrop = vi.fn()
  })

  describe('handleDragStart', () => {
    it('should set the dragging node', () => {
      const node = createItem('1')
      const contextValue = createContextValue()

      const { result } = renderHook(() => useTreeNodeDnD(node, onDrop), {
        wrapper: createWrapper(contextValue),
      })

      const event = createDragEvent()

      act(() => {
        result.current.handleDragStart(event)
      })

      expect(setDraggingNode).toHaveBeenCalledWith(node)
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('should set effectAllowed to move', () => {
      const node = createItem('1')
      const contextValue = createContextValue()

      const { result } = renderHook(() => useTreeNodeDnD(node, onDrop), {
        wrapper: createWrapper(contextValue),
      })

      const event = createDragEvent()

      act(() => {
        result.current.handleDragStart(event)
      })

      expect(event.dataTransfer.effectAllowed).toBe('move')
    })
  })

  describe('handleDragEnd', () => {
    it('should clear dragging state', () => {
      const node = createItem('1')
      const contextValue = createContextValue()

      const { result } = renderHook(() => useTreeNodeDnD(node, onDrop), {
        wrapper: createWrapper(contextValue),
      })

      act(() => {
        result.current.handleDragEnd()
      })

      expect(setDraggingNode).toHaveBeenCalledWith(null)
      expect(setHoveredNodeId).toHaveBeenCalledWith(null)
    })
  })

  describe('handleDragLeave', () => {
    it('should clear drag position when leaving to outside element', () => {
      const node = createItem('1')
      const contextValue = createContextValue({ hoveredNodeId: '1' })

      const { result } = renderHook(() => useTreeNodeDnD(node, onDrop), {
        wrapper: createWrapper(contextValue),
      })

      const currentTarget = document.createElement('div')
      const relatedTarget = document.createElement('div') // Outside element
      const event = createDragEvent({ currentTarget, relatedTarget })

      act(() => {
        result.current.handleDragLeave(event)
      })

      expect(setHoveredNodeId).toHaveBeenCalledWith(null)
    })

    it('should not clear state when moving to child element', () => {
      const node = createItem('1')
      const contextValue = createContextValue({ hoveredNodeId: '1' })

      const { result } = renderHook(() => useTreeNodeDnD(node, onDrop), {
        wrapper: createWrapper(contextValue),
      })

      const currentTarget = document.createElement('div')
      const relatedTarget = document.createElement('span')
      currentTarget.appendChild(relatedTarget)
      const event = createDragEvent({ currentTarget, relatedTarget })

      act(() => {
        result.current.handleDragLeave(event)
      })

      expect(setHoveredNodeId).not.toHaveBeenCalled()
    })
  })

  describe('handleDrop', () => {
    it('should call onDrop when drop is valid', () => {
      // Use different parents so the move is valid
      const source = createItem('source')
      const target = createItem('target')
      const sourceParent = createBranch('sourceParent', [source])
      const targetParent = createBranch('targetParent', [target])

      const nodeParents: NodeParents = {
        source: sourceParent,
        target: targetParent,
      }

      const contextValue = createContextValue({
        draggingNode: source,
        nodeParents,
        hoveredNodeId: 'target',
      })

      const { result } = renderHook(() => useTreeNodeDnD(target, onDrop), {
        wrapper: createWrapper(contextValue),
      })

      // Simulate dragOver to set dragPosition (mock returns DropPosition.Before)
      act(() => {
        result.current.handleDragOver(createDragEvent())
      })

      // Then drop
      act(() => {
        result.current.handleDrop(createDragEvent())
      })

      expect(onDrop).toHaveBeenCalledWith(
        expect.objectContaining({
          source,
          target,
        }),
      )
    })

    it('should not call onDrop when dragging onto itself', () => {
      const node = createItem('1')
      const parent = createBranch('parent', [node])

      const nodeParents: NodeParents = {
        '1': parent,
      }

      const contextValue = createContextValue({
        draggingNode: node,
        nodeParents,
        hoveredNodeId: '1',
      })

      const { result } = renderHook(() => useTreeNodeDnD(node, onDrop), {
        wrapper: createWrapper(contextValue),
      })

      // Simulate dragOver
      act(() => {
        result.current.handleDragOver(createDragEvent())
      })

      // isDropAllowed should be false
      expect(result.current.isDropAllowed).toBe(false)
    })

    it('should not call onDrop when no dragging node', () => {
      const node = createItem('1')
      const contextValue = createContextValue({ draggingNode: null })

      const { result } = renderHook(() => useTreeNodeDnD(node, onDrop), {
        wrapper: createWrapper(contextValue),
      })

      act(() => {
        result.current.handleDrop(createDragEvent())
      })

      expect(onDrop).not.toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it('should not allow dropping branch into its descendant', () => {
      const child = createItem('child')
      const branch = createBranch('branch', [child])
      const parent = createBranch('parent', [branch])

      const nodeParents: NodeParents = {
        branch: parent,
        child: branch,
      }

      const contextValue = createContextValue({
        draggingNode: branch,
        nodeParents,
        hoveredNodeId: 'child',
      })

      const { result } = renderHook(() => useTreeNodeDnD(child, onDrop), {
        wrapper: createWrapper(contextValue),
      })

      act(() => {
        result.current.handleDragOver(createDragEvent())
      })

      expect(result.current.isDropAllowed).toBe(false)
    })

    it('should respect canDrop callback', () => {
      // Use different parents so the move passes internal validation
      const source = createItem('source')
      const target = createItem('target')
      const sourceParent = createBranch('sourceParent', [source])
      const targetParent = createBranch('targetParent', [target])

      const nodeParents: NodeParents = {
        source: sourceParent,
        target: targetParent,
      }

      const canDrop = vi.fn(() => false)

      const contextValue = createContextValue({
        draggingNode: source,
        nodeParents,
        hoveredNodeId: 'target',
      })

      const { result } = renderHook(() => useTreeNodeDnD(target, onDrop, canDrop), {
        wrapper: createWrapper(contextValue),
      })

      act(() => {
        result.current.handleDragOver(createDragEvent())
      })

      expect(canDrop).toHaveBeenCalled()
      expect(result.current.isDropAllowed).toBe(false)
    })
  })

  describe('initial state', () => {
    it('should have null dragPosition initially', () => {
      const node = createItem('1')
      const contextValue = createContextValue()

      const { result } = renderHook(() => useTreeNodeDnD(node, onDrop), {
        wrapper: createWrapper(contextValue),
      })

      expect(result.current.dragPosition).toBeNull()
    })

    it('should have isDropAllowed true initially', () => {
      const node = createItem('1')
      const contextValue = createContextValue()

      const { result } = renderHook(() => useTreeNodeDnD(node, onDrop), {
        wrapper: createWrapper(contextValue),
      })

      expect(result.current.isDropAllowed).toBe(true)
    })
  })
})
