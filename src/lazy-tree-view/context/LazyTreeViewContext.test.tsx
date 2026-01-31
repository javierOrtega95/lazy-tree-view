import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { LazyTreeViewContext, useLazyTreeView } from './LazyTreeViewContext'
import type { LazyTreeViewContextData } from './LazyTreeViewContext'
import type { ReactNode } from 'react'

describe('LazyTreeViewContext', () => {
  describe('useLazyTreeView', () => {
    it('should throw an error when used outside of Provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useLazyTreeView())
      }).toThrow('useLazyTreeView must be used within an LazyTreeViewContext.Provider')

      consoleSpy.mockRestore()
    })

    it('should return context value when used within Provider', () => {
      const mockContextValue: LazyTreeViewContextData = {
        nodeParents: {},
        draggingNode: null,
        hoveredNodeId: null,
        focusedNodeId: null,
        setDraggingNode: vi.fn(),
        setHoveredNodeId: vi.fn(),
        setFocusedNodeId: vi.fn(),
      }

      const wrapper = ({ children }: { children: ReactNode }) => (
        <LazyTreeViewContext.Provider value={mockContextValue}>
          {children}
        </LazyTreeViewContext.Provider>
      )

      const { result } = renderHook(() => useLazyTreeView(), { wrapper })

      expect(result.current).toBe(mockContextValue)
    })

    it('should return updated context values', () => {
      const mockParentFolder = { id: 'parent-1', name: 'Parent', children: [] }
      const mockNode = { id: 'node-1', name: 'Test Node' }
      const mockContextValue: LazyTreeViewContextData = {
        nodeParents: { 'child-1': mockParentFolder },
        draggingNode: mockNode,
        hoveredNodeId: 'hovered-1',
        focusedNodeId: 'focused-1',
        setDraggingNode: vi.fn(),
        setHoveredNodeId: vi.fn(),
        setFocusedNodeId: vi.fn(),
      }

      const wrapper = ({ children }: { children: ReactNode }) => (
        <LazyTreeViewContext.Provider value={mockContextValue}>
          {children}
        </LazyTreeViewContext.Provider>
      )

      const { result } = renderHook(() => useLazyTreeView(), { wrapper })

      expect(result.current.nodeParents['child-1']).toBe(mockParentFolder)
      expect(result.current.draggingNode).toBe(mockNode)
      expect(result.current.hoveredNodeId).toBe('hovered-1')
      expect(result.current.focusedNodeId).toBe('focused-1')
    })
  })
})
