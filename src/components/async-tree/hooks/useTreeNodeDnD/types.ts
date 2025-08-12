import { type DragEvent } from 'react'
import type { DropPosition } from '../../types'

export type TreeNodeDnDParams = {
  dragPosition: DropPosition | null
  isDropAllowed: boolean
  handleDragStart: (event: DragEvent) => void
  handleDragLeave: (event: DragEvent) => void
  handleDragOver: (event: DragEvent) => void
  handleDrop: (event: DragEvent) => void
}
