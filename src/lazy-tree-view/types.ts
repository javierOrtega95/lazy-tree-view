import { type FC, type MouseEvent, type ReactNode, CSSProperties, DragEvent } from 'react'
import { type DragClassNames, DropData, DropPosition, MoveData } from '../types/dnd'
import type { BaseNode, FolderNode, LoadChildrenFn, NodeId, TreeNode } from '../types/tree'

/**
 * Handle to interact with the LazyTreeView component imperatively
 */
export type LazyTreeViewHandle = {
  /** Add a node to a folder. Use `null` as parentId to add to root level. */
  addNode: (parentId: NodeId | null, node: TreeNode) => void
  /** Remove a node and all its children */
  removeNode: (nodeId: NodeId) => void
  /** Update properties of a node */
  updateNode: (nodeId: NodeId, updates: Partial<TreeNode>) => void
  /** Move a node to a new position. Use `null` as targetId with `Inside` position to move to root level. */
  moveNode: (nodeId: NodeId, targetId: NodeId, position: DropPosition) => void

  /** Replace the entire tree with a new one */
  setTree: (newTree: TreeNode[]) => void
  /** Get the current tree structure */
  getTree: () => TreeNode[]
  /** Get a node by its ID */
  getNode: (nodeId: NodeId) => TreeNode | undefined
}

/** Callback that determines whether a drop is allowed. Return `false` to prevent the move. */
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
  folderProps?: Record<string, unknown>
  itemProps?: Record<string, unknown>
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

/** Props for the `LazyTreeView` component. */
export interface LazyTreeViewProps
  extends Partial<DragAndDropConfig>, Partial<CustomComponents>, LoadCallbacks, AnimationConfig {
  /** Initial tree data. Only read on mount — use the imperative API to update afterwards. */
  initialTree: TreeNode[]
  /** Async function called to fetch children when a folder is expanded for the first time. */
  loadChildren: LoadChildrenFn
  /** CSS class name for the root `<ul>` element. */
  className?: string
  /** Inline styles for the root `<ul>` element. */
  style?: CSSProperties
  /** Called whenever the tree structure changes (expand, collapse, drag, imperative mutations). */
  onTreeChange?: (newTree: TreeNode[]) => void
  /** Called after a successful drag-and-drop operation. */
  onDrop?: (data: DropData) => void
}

export interface TreeNodeProps
  extends Required<DragAndDropConfig>, Required<CustomComponents>, Required<AnimationConfig> {
  node: TreeNode
  depth: Depth
  children?: ReactNode
  onToggleOpen: (folder: FolderNode) => void
  onDrop: (data: MoveData) => void
}

type Depth = number

type OnDragStartFn = (event: DragEvent) => void

/** Props received by a custom leaf-node (item) renderer passed via the `item` prop. */
export type BaseNodeProps<T = object> = BaseNode<T> & {
  /** Nesting depth (0 = root level). Useful for indentation. */
  depth: Depth
  /** When `useDragHandle` is enabled, attach this handler to your drag handle element. */
  onDragStart?: OnDragStartFn
}

/** Props received by a custom folder renderer passed via the `folder` prop. */
export type FolderProps<T = object> = FolderNode<T> & {
  /** Nesting depth (0 = root level). Useful for indentation. */
  depth: Depth
  /** Call this to toggle the folder's open/closed state. */
  onToggleOpen: (event: MouseEvent<Element>) => void
  /** When `useDragHandle` is enabled, attach this handler to your drag handle element. */
  onDragStart?: OnDragStartFn
}
