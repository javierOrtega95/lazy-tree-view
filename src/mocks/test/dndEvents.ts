import { DragEvent } from 'react'
import { vi } from 'vitest'

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
