import type { FolderNode, TreeNode } from './tree'

/** Where a dragged node will be placed relative to the drop target. */
export enum DropPosition {
  Before = 'before',
  Inside = 'inside',
  After = 'after',
}

/**
 * CSS class names applied to a node during drag-and-drop interactions.
 * Pass a partial object via the `dragClassNames` prop to override defaults.
 */
export type DragClassNames = {
  /** Applied to the node currently being dragged over. */
  dragOver: string
  /** Applied when the drop indicator is above the target. */
  dragBefore: string
  /** Applied when the drop indicator is below the target. */
  dragAfter: string
  /** Applied when the drop is not allowed on the current target. */
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

/**
 * Data passed to the `onDrop` and `canDrop` callbacks.
 * Extends TreeMove with parent folder references (`null` when at root level).
 */
export type DropData = TreeMove & {
  /** The folder the node was in before the drop, or `null` if it was at root level. */
  prevParent: FolderNode | null
  /** The folder the node will be in after the drop, or `null` if dropping at root level. */
  nextParent: FolderNode | null
}
