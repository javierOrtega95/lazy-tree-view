export type NodeId = string

export type BaseNode = {
  id: NodeId
  name: string
}

export type TreeNode<T = object> = (FolderNode | BaseNode) & T

export interface FolderNode extends BaseNode {
  children: TreeNode[]
}

export type FolderState = {
  isOpen?: boolean
  isLoading?: boolean
  hasFetched?: boolean
  error?: unknown
}

export type FoldersState = Record<NodeId, FolderState>
export type NodeParents = Record<NodeId, FolderNode | null>
