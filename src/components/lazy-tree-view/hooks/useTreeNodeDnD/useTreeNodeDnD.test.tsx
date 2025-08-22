import { act, renderHook } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDragOverEvent, dragStartEvent, mockDnDTree } from '../../../../mocks/DnD'
import { LazyTreeViewContext } from '../../context/LazyTreeViewContext'
import { DropPosition, type FolderNode, type MoveData, type NodeParents } from '../../types'
import useTreeNodeDnD from './useTreeNodeDnD'

describe('useTreeNodeDnD', () => {
  const mockOnDrop = vi.fn()
  const mockCanDrop = vi.fn().mockReturnValue(false)

  const [rootFolder] = mockDnDTree
  const parentFolder = rootFolder as FolderNode
  const [childrenFolder, childrenItem] = parentFolder.children

  const mockNodeParents: NodeParents = {
    [rootFolder.id]: null,
    [childrenFolder.id]: parentFolder,
    [childrenItem.id]: parentFolder,
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <LazyTreeViewContext.Provider value={{ nodeParents: mockNodeParents }}>
      {children}
    </LazyTreeViewContext.Provider>
  )

  it('should initialize with null drag position', () => {
    const { result } = renderHook(() => useTreeNodeDnD(childrenItem, mockOnDrop, mockCanDrop), {
      wrapper,
    })

    expect(result.current.dragPosition).toBeNull()
  })

  it('should handle drag start correctly', () => {
    const { result } = renderHook(() => useTreeNodeDnD(childrenItem, mockOnDrop, mockCanDrop), {
      wrapper,
    })

    act(() => {
      result.current.handleDragStart(dragStartEvent)
    })

    expect(dragStartEvent.stopPropagation).toHaveBeenCalled()
    expect(dragStartEvent.dataTransfer.effectAllowed).toBe('move')
    expect(dragStartEvent.dataTransfer.setData).toHaveBeenCalledWith(
      'application/json',
      JSON.stringify(childrenItem)
    )
  })

  it('should set dragPosition on drag over', () => {
    const { result } = renderHook(() => useTreeNodeDnD(childrenItem, mockOnDrop, mockCanDrop), {
      wrapper,
    })

    const dragEvent = createDragOverEvent({ offsetHeight: 100, offsetY: 10 })

    act(() => {
      result.current.handleDragOver(dragEvent)
    })

    expect(dragEvent.preventDefault).toHaveBeenCalled()
    expect(dragEvent.stopPropagation).toHaveBeenCalled()
    expect(result.current.dragPosition).not.toBeNull()
  })

  it('should call onDrop with correct data', () => {
    const { result } = renderHook(() => useTreeNodeDnD(childrenFolder, mockOnDrop, () => true), {
      wrapper,
    })

    const dragEvent = createDragOverEvent({
      offsetHeight: 100,
      offsetY: 50,
      dataTransfer: {
        setData: vi.fn(),
        getData: vi.fn().mockReturnValue(JSON.stringify(childrenItem)),
      },
    })

    act(() => {
      result.current.handleDragStart(dragEvent)
      result.current.handleDragOver(dragEvent)
    })

    act(() => {
      result.current.handleDrop(dragEvent)
    })

    const onDropData: MoveData = {
      source: childrenItem,
      target: childrenFolder,
      position: DropPosition.Inside,
      prevParent: parentFolder,
      nextParent: childrenFolder as FolderNode,
    }

    expect(dragEvent.preventDefault).toHaveBeenCalled()
    expect(dragEvent.stopPropagation).toHaveBeenCalled()
    expect(mockOnDrop).toHaveBeenCalledWith(onDropData)
  })

  it('should update isDropAllowed based on canDrop function', () => {
    const mockCanDrop = vi.fn().mockReturnValue(false)

    const { result } = renderHook(() => useTreeNodeDnD(childrenFolder, mockOnDrop, mockCanDrop), {
      wrapper,
    })

    const dragEvent = createDragOverEvent({
      offsetHeight: 100,
      offsetY: 50,
      dataTransfer: {
        setData: vi.fn(),
        getData: vi.fn().mockReturnValue(JSON.stringify(childrenItem)),
      },
    })

    act(() => {
      result.current.handleDragStart(dragEvent)
      result.current.handleDragOver(dragEvent)
    })

    act(() => {
      result.current.handleDrop(dragEvent)
    })

    expect(mockCanDrop).toHaveBeenCalled()
    expect(result.current.isDropAllowed).toBe(false)
    expect(mockOnDrop).not.toHaveBeenCalled()
  })
})
