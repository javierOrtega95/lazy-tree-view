/** Unique identifier for a tree node. */
export type NodeId = string

/** Base node with an id, name, and optional custom data via generic. */
export type BaseNode<T = object> = { id: NodeId; name: string } & T

/** A branch node that can contain children and tracks its expand/load state. */
export type BranchNode<T = object> = BaseNode & {
  children: TreeNode<T>[]
} & T &
  BranchState

/** A tree node — either a leaf (`BaseNode`) or a branch (`BranchNode`). */
export type TreeNode<T = object> = BaseNode<T> | BranchNode<T>

export type TreeWithRoot = [root: BranchNode, ...children: TreeNode[]]

/** Internal state tracked for each branch node. */
export type BranchState = {
  /** Whether the branch is currently expanded. */
  isOpen?: boolean
  /** Whether children are being loaded asynchronously. */
  isLoading?: boolean
  /** Whether children have already been fetched at least once. */
  hasFetched?: boolean
  /** Error from the last failed `loadChildren` call, if any. */
  error?: unknown
}

/** Async function that fetches and returns the children of a branch. */
export type LoadChildrenFn = (branch: BranchNode) => Promise<TreeNode[]>

export type NodeParents = Record<NodeId, BranchNode>

export type NodeIndexEntry = {
  node: TreeNode
  parent: BranchNode
  siblingIndex: number
}

export type NodeIndex = Record<NodeId, NodeIndexEntry>
