import { type MouseEvent, type ReactNode } from 'react'

export enum DropPosition {
  Before = 'before',
  Inside = 'inside',
  After = 'after',
}

export type NodeId = string

export type BaseNode = {
  id: NodeId
  name: string
}

export type TreeNode<T = object> = (FolderNode | BaseNode) & T

export interface FolderNode extends BaseNode {
  isOpen?: boolean
  children: TreeNode[]
}

export type FoldersState = Record<NodeId, FolderState>
export type NodeParents = Record<NodeId, FolderNode | null>

export type FolderState = {
  isOpen?: boolean
  isLoading?: boolean
  hasFetched?: boolean
}

export type DragClassNames = {
  dragOver: string
  dragBefore: string
  dragAfter: string
  dropNotAllowed: string
}

type CustomFolderFC = React.FC<FolderProps>
type CustomItemFC = React.FC<BaseNodeProps>

export interface AsyncTreeProps {
  data: TreeNode[]
  loadChildren: (node: TreeNode) => Promise<TreeNode[]>
  fetchOnce?: boolean
  folder?: CustomFolderFC
  item?: CustomItemFC
  dragClassNames?: DragClassNames
  canDrop?: canDropFn
  onDrop?: (data: DropData) => void
  onChange?: (tree: TreeNode[]) => void
}

export type canDropFn = (data: DropData) => boolean
export type OnDropNodeFn = (data: MoveData) => void

export type BaseNodeProps = {
  node: TreeNode
  depth: number
}

export interface TreeNodeProps extends BaseNodeProps, Pick<FolderProps, 'isOpen' | 'isLoading'> {
  folder: CustomFolderFC
  item: CustomItemFC
  dragClassNames: DragClassNames
  children: ReactNode
  onToggleOpen: (node: FolderNode) => void
  canDrop: canDropFn
  onDrop: OnDropNodeFn
}

export interface FolderProps extends BaseNodeProps {
  isOpen: boolean
  isLoading: boolean
  onToggleOpen: (event: MouseEvent<Element>, folder: FolderNode) => void
}

export type TreeMove = {
  source: TreeNode
  target: TreeNode
  position: DropPosition
}

export type MoveData = TreeMove & {
  prevParent: FolderNode
  nextParent: FolderNode
}

export type DropData = TreeMove & {
  prevParent: FolderNode | null
  nextParent: FolderNode | null
}
