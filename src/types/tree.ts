/** Unique identifier for a tree node. */
export type NodeId = string

/** Base node with an id, name, and optional custom data via generic. */
export type BaseNode<T = object> = { id: NodeId; name: string } & T

/** A folder node that can contain children and tracks its expand/load state. */
export type FolderNode<T = object> = BaseNode & {
  children: TreeNode<T>[]
} & T &
  FolderState

/** A tree node — either a leaf (`BaseNode`) or a folder (`FolderNode`). */
export type TreeNode<T = object> = BaseNode<T> | FolderNode<T>

export type TreeWithRoot = [root: FolderNode, ...children: TreeNode[]]

/** Internal state tracked for each folder node. */
export type FolderState = {
  /** Whether the folder is currently expanded. */
  isOpen?: boolean
  /** Whether children are being loaded asynchronously. */
  isLoading?: boolean
  /** Whether children have already been fetched at least once. */
  hasFetched?: boolean
  /** Error from the last failed `loadChildren` call, if any. */
  error?: unknown
}

/** Async function that fetches and returns the children of a folder. */
export type LoadChildrenFn = (folder: FolderNode) => Promise<TreeNode[]>

export type NodeParents = Record<NodeId, FolderNode>

export type NodeIndexEntry = {
  node: TreeNode
  parent: FolderNode
  siblingIndex: number
}

export type NodeIndex = Record<NodeId, NodeIndexEntry>
