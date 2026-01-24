import { type FC, type MouseEvent, type ReactNode, CSSProperties, DragEvent } from 'react'
import { type DragClassNames, DropData, MoveData } from '../types/dnd'
import type { BaseNode, FolderNode, LoadChildrenFn, TreeNode } from '../types/tree'

export type CanDropFn = (data: DropData) => boolean

interface DragAndDropConfig {
  allowDragAndDrop: boolean
  useDragHandle: boolean
  dragClassNames?: Partial<DragClassNames>
  canDrop: CanDropFn
}

interface CustomComponents {
  folder: FC<FolderProps>
  item: FC<BaseNodeProps>
}

interface LoadCallbacks {
  onLoadStart?: (folder: FolderNode) => void
  onLoadSuccess?: (folder: FolderNode, children: TreeNode[]) => void
  onLoadError?: (folder: FolderNode, error: unknown) => void
}

interface AnimationConfig {
  disableAnimations?: boolean
  animationDuration?: number
}

export interface LazyTreeViewProps
  extends Partial<DragAndDropConfig>, Partial<CustomComponents>, LoadCallbacks, AnimationConfig {
  initialTree: TreeNode[]
  loadChildren: LoadChildrenFn
  className?: string
  style?: CSSProperties
  onTreeChange?: (newTree: TreeNode[]) => void
  onDrop?: (data: DropData) => void
}

export interface TreeNodeProps
  extends
    Required<Pick<DragAndDropConfig, 'allowDragAndDrop' | 'useDragHandle' | 'canDrop'>>,
    Required<Pick<CustomComponents, 'folder' | 'item'>>,
    Required<AnimationConfig> {
  node: TreeNode
  depth: Depth
  disableAnimations: boolean
  animationDuration: number
  dragClassNames: DragClassNames
  children?: ReactNode
  onToggleOpen: (folder: FolderNode) => void
  onDrop: (data: MoveData) => void
}

type Depth = number

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
