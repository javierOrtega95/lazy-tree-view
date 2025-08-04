import type { FolderNode, FoldersState, NodeParents, TreeNode } from '../types'
import { isFolderNode } from './validations'

export function recursiveTreeMap(tree: TreeNode[], fn: (item: TreeNode) => TreeNode): TreeNode[] {
  return tree.map((item) => {
    const newNode = fn({ ...item })

    if (isFolderNode(newNode) && newNode.children.length > 0) {
      newNode.children = recursiveTreeMap(newNode.children, fn)
    }

    return newNode
  })
}

export function getNodeParents(tree: TreeNode[]): NodeParents {
  const nodeParents: NodeParents = {}

  initializeNodeParents(tree, null)

  function initializeNodeParents(nodes: TreeNode[], parent: FolderNode | null) {
    for (const node of nodes) {
      nodeParents[node.id] = parent

      if (isFolderNode(node) && node.children.length > 0) {
        initializeNodeParents(node.children, node)
      }
    }
  }

  return nodeParents
}

export function getFoldersState(tree: TreeNode[]): FoldersState {
  const foldersState: FoldersState = {}

  initializeFoldersState(tree)

  function initializeFoldersState(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (isFolderNode(node)) {
        const isOpen = node.children.length > 0

        foldersState[node.id] = {
          isOpen,
          isLoading: false,
          hasFetched: false,
        }

        if (node.children.length > 0) initializeFoldersState(node.children)
      }
    }
  }

  return foldersState
}
