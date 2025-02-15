import { HTMLAttributes, MouseEvent, PropsWithChildren } from 'react'

export enum DropPosition {
  Before = 'before',
  Inside = 'inside',
  After = 'after',
}

export interface BaseNode {
  id: string
  name: string
}

export type TreeNode<T = object> = (FolderNode | BaseNode) & T

export interface FolderNode extends BaseNode {
  isOpen?: boolean
  children: TreeNode[]
}

export type FoldersState = Record<FolderNode['id'], FolderState>
export type NodeParents = Record<FolderNode['id'], FolderNode | null>

export type FolderState = {
  isOpen?: boolean
  isLoading?: boolean
  hasFetched?: boolean
}

export interface AsyncTreeProps {
  treeData: TreeNode[]
  loadChildren: (node: TreeNode) => Promise<TreeNode[]>
  fetchOnce?: boolean
  folder?: React.FC<FolderProps>
  item?: React.FC<ItemProps>
  onDrop?: (data: DropData) => void
  onChange?: (tree: TreeNode[]) => void
}

export type OnDropNodeFn = (data: MoveData) => void

export interface TreeNodeProps
  extends PropsWithChildren,
    Omit<FolderProps, 'onToggleOpen'>,
    ItemProps {
  folder: React.FC<FolderProps>
  item: React.FC<ItemProps>
  onFolderClick: (node: FolderNode) => void
  onDrop: OnDropNodeFn
}

export interface DropIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  indentation: number
}

export interface FolderProps {
  node: TreeNode
  level: number
  isOpen: boolean
  isLoading: boolean
  onToggleOpen: (e: MouseEvent<Element>, node: TreeNode) => void
}

export interface ItemProps {
  node: TreeNode
  level: number
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
