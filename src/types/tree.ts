export type NodeId = string

export type BaseNode<T = object> = { id: NodeId; name: string } & T

export type FolderNode<T = object> = BaseNode & {
  children: TreeNode<T>[]
} & T &
  FolderState

export type TreeNode<T = object> = BaseNode<T> | FolderNode<T>

export type TreeWithRoot = [root: FolderNode, ...children: TreeNode[]]

export type FolderState = {
  isOpen?: boolean
  isLoading?: boolean
  hasFetched?: boolean
  error?: unknown
}

export type LoadChildrenFn = (folder: FolderNode) => Promise<TreeNode[]>

export type NodeParents = Record<NodeId, FolderNode>
