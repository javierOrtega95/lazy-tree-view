import { type FC, type MouseEvent, type ReactNode, CSSProperties, DragEvent } from 'react'
import { type DragClassNames, DropData, MoveData } from '../types/dnd'
import type { BaseNode, FolderNode, LoadChildrenFn, TreeNode } from '../types/tree'

type CustomFolderFC = FC<FolderProps>
type CustomItemFC = FC<BaseNodeProps>

export type CanDropFn = (data: DropData) => boolean

export interface LazyTreeViewProps {
  initialTree: TreeNode[]
  loadChildren: LoadChildrenFn
  folder?: CustomFolderFC
  item?: CustomItemFC
  allowDragAndDrop?: boolean
  useDragHandle?: boolean
  dragClassNames?: Partial<DragClassNames>
  className?: string
  style?: CSSProperties
  onLoadStart?: (folder: FolderNode) => void
  onLoadSuccess?: (folder: FolderNode, children: TreeNode[]) => void
  onLoadError?: (folder: FolderNode, error: unknown) => void
  onTreeChange?: (newTree: TreeNode[]) => void
  canDrop?: CanDropFn
  onDrop?: (data: DropData) => void
}

type Depth = number

export interface TreeNodeProps {
  node: TreeNode
  depth: Depth
  folder: FC<FolderProps>
  item: FC<BaseNodeProps>
  allowDragAndDrop: boolean
  useDragHandle: boolean
  dragClassNames: DragClassNames
  children?: ReactNode
  onToggleOpen: (folder: FolderNode) => void
  canDrop: CanDropFn
  onDrop: (data: MoveData) => void
}

type OnDragStartFn = (event: DragEvent) => void

export type BaseNodeProps<T = object> = BaseNode<T> & {
  depth: Depth
  onDragStart?: OnDragStartFn
}

export type FolderProps<T = object> = FolderNode<T> & {
  depth: Depth
  onToggleOpen: (event: MouseEvent<Element>) => void
  onDragStart?: OnDragStartFn
}
