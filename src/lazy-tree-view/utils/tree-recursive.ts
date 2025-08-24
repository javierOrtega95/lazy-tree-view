import { FolderNode, FoldersState, NodeParents, TreeNode } from '../../types/tree'
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

export function getFoldersState(tree: TreeNode[], initialState: FoldersState = {}): FoldersState {
  const foldersState: FoldersState = { ...initialState }

  initializeFoldersState(tree)

  function initializeFoldersState(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (isFolderNode(node)) {
        const hasChildren = node.children.length > 0

        const { isOpen = hasChildren, hasFetched = false } = foldersState[node.id] || {}

        foldersState[node.id] = { isOpen, isLoading: false, hasFetched }

        if (hasChildren) initializeFoldersState(node.children)
      }
    }
  }

  return foldersState
}
