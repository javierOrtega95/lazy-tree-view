import { DragEvent } from 'react'
import { vi } from 'vitest'
import type { TreeNode } from '../components/lazy-tree-view/types'

export const mockDnDTree: TreeNode[] = [
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

export const dragStartEvent = {
  stopPropagation: vi.fn(),
  dataTransfer: {
    effectAllowed: '',
    setData: vi.fn(),
    getData: vi.fn(),
  },
} as unknown as DragEvent

export const createDragOverEvent = ({
  offsetHeight,
  offsetY,
  dataTransfer = { dropEffect: 'none' },
}: {
  offsetHeight: number
  offsetY: number
  dataTransfer?: Partial<DataTransfer>
}) =>
  ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    currentTarget: { offsetHeight },
    nativeEvent: { offsetY },
    dataTransfer,
  } as unknown as DragEvent)
