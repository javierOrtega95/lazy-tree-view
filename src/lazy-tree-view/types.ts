import { type MouseEvent, type ReactNode, type FC } from 'react'
import { type DragClassNames, DropData, MoveData } from '../types/dnd'
import type { FolderNode, TreeNode } from '../types/tree'

type CustomFolderFC = FC<FolderProps>
type CustomItemFC = FC<BaseNodeProps>

export type CanDropFn = (data: DropData) => boolean

export interface LazyTreeViewProps {
  initialTree: TreeNode[]
  loadChildren: (node: TreeNode) => Promise<TreeNode[]>
  fetchOnce?: boolean
  folder?: CustomFolderFC
  item?: CustomItemFC
  dragClassNames?: DragClassNames
  canDrop?: CanDropFn
  onDrop?: (data: DropData) => void
  onChange?: (tree: TreeNode[]) => void
  onError?: (error: unknown, folder: FolderNode) => void
}

export type BaseNodeProps = {
  node: TreeNode
  depth: number
}

export interface TreeNodeProps
  extends BaseNodeProps,
    Pick<FolderProps, 'isOpen' | 'isLoading' | 'error'> {
  folder: CustomFolderFC
  item: CustomItemFC
  dragClassNames: DragClassNames
  children?: ReactNode
  onToggleOpen: (node: FolderNode) => void
  canDrop: CanDropFn
  onDrop: (data: MoveData) => void
}

export interface FolderProps extends BaseNodeProps {
  isOpen: boolean
  isLoading: boolean
  error?: unknown
  onToggleOpen: (event: MouseEvent<Element>, folder: FolderNode) => void
}
