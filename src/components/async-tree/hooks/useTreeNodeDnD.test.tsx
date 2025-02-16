import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DropPosition, FolderNode, MoveData, NodeParents, TreeNode } from '../types'
import useTreeNodeDnD from './useTreeNodeDnD'
import { ReactNode } from 'react'
import { AsyncTreeContext } from '../context/AsyncTreeContext'

describe('useTreeNodeDnD', () => {
  const mockOnDrop = vi.fn()

  const mockTree: TreeNode[] = [
    {
      id: crypto.randomUUID(),
      name: 'Folder 1',
      children: [
        {
          id: crypto.randomUUID(),
          name: 'Folder 2',
          children: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Item 1',
        },
      ],
    },
  ]

  const [rootFolder] = mockTree
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
    <AsyncTreeContext.Provider value={{ nodeParents: mockNodeParents }}>
      {children}
    </AsyncTreeContext.Provider>
  )

  it('should initialize with null drag position', () => {
    const { result } = renderHook(() => useTreeNodeDnD(childrenItem, mockOnDrop), { wrapper })

    expect(result.current.dragPosition).toBeNull()
  })

  it('should handle drag start correctly', () => {
    const { result } = renderHook(() => useTreeNodeDnD(childrenItem, mockOnDrop), { wrapper })

    const dragEvent = {
      stopPropagation: vi.fn(),
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
    } as unknown as React.DragEvent

    act(() => {
      result.current.handleDragStart(dragEvent)
    })

    expect(dragEvent.stopPropagation).toHaveBeenCalled()
    expect(dragEvent.dataTransfer.effectAllowed).toBe('move')
    expect(dragEvent.dataTransfer.setData).toHaveBeenCalledWith(
      'application/json',
      JSON.stringify(childrenItem)
    )
  })

  it('should set dragPosition on drag over', () => {
    const { result } = renderHook(() => useTreeNodeDnD(childrenItem, mockOnDrop), { wrapper })

    const dragEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      currentTarget: { offsetHeight: 100 },
      nativeEvent: { offsetY: 10 },
      dataTransfer: {
        dropEffect: '',
      },
    } as unknown as React.DragEvent

    act(() => {
      result.current.handleDragOver(dragEvent as unknown as React.DragEvent)
    })

    expect(dragEvent.preventDefault).toHaveBeenCalled()
    expect(dragEvent.stopPropagation).toHaveBeenCalled()
    expect(result.current.dragPosition).not.toBeNull()
  })

  it('should call onDrop with correct data', () => {
    const { result } = renderHook(() => useTreeNodeDnD(childrenFolder, mockOnDrop), { wrapper })

    const dragEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
      currentTarget: { offsetHeight: 100 },
      nativeEvent: { offsetY: 50 },
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
        getData: vi.fn().mockReturnValue(JSON.stringify(childrenItem)),
      },
    } as unknown as React.DragEvent

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
})
