import { type KeyboardEvent } from 'react'
import type { FolderNode, NodeId, NodeIndex, TreeWithRoot } from '../../../types/tree'

export interface UseKeyboardNavigationOptions {
  tree: TreeWithRoot
  nodeIndex: NodeIndex
  focusedNodeId: NodeId | null
  setFocusedNodeId: (nodeId: NodeId | null) => void
  disabled?: boolean
  onToggleOpen: (folder: FolderNode) => void
}

export interface UseKeyboardNavigationResult {
  handleKeyDown: (event: KeyboardEvent) => void
}
