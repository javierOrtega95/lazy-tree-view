import { createContext, useContext } from 'react'
import type { NodeId, NodeParents, TreeNode } from '../../types/tree'

export type LazyTreeViewContextData = {
  nodeParents: NodeParents
  draggingNode: TreeNode | null
  hoveredNodeId: NodeId | null
  focusedNodeId: NodeId | null
  setDraggingNode: (node: TreeNode | null) => void
  setHoveredNodeId: (id: NodeId | null) => void
  setFocusedNodeId: (id: NodeId | null) => void
}

export const LazyTreeViewContext = createContext<LazyTreeViewContextData | null>(null)

export const useLazyTreeView = () => {
  const context = useContext(LazyTreeViewContext)

  if (!context) {
    throw new Error('useLazyTreeView must be used within an LazyTreeViewContext.Provider')
  }

  return context
}
