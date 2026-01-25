import type { FolderNode, TreeNode } from './tree'

export enum DropPosition {
  Before = 'before',
  Inside = 'inside',
  After = 'after',
}

export type DragClassNames = {
  dragOver: string
  dragBefore: string
  dragAfter: string
  dropNotAllowed: string
}

export type TreeMove = {
  source: TreeNode
  target: TreeNode
  position: DropPosition
  prevIndex: number
  nextIndex: number
}

export type MoveData = TreeMove & {
  prevParent: FolderNode
  nextParent: FolderNode
}

export type DropData = TreeMove & {
  prevParent: FolderNode | null
  nextParent: FolderNode | null
}
