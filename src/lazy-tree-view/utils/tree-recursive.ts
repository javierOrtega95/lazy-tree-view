import { FolderNode, NodeParents, TreeNode, TreeWithRoot } from '../../types/tree'
import { isFolderNode } from './validations'
import { ROOT_NODE } from '../constants'

export function recursiveTreeMap(
  tree: TreeWithRoot,
  fn: (item: TreeNode) => TreeNode
): TreeWithRoot {
  // TreeWithRoot has an invisible root [root] where only root.children are visible/rendered
  if (tree.length === 0) return tree

  const [root] = tree

  // Do NOT apply fn to the invisible root - only to its visible children
  const processedRoot = { ...root }

  // Process only the visible children recursively
  if (root.children.length > 0) {
    processedRoot.children = processChildren(root.children, fn)
  }

  return [processedRoot]
}

// Helper function to process regular TreeNode arrays (not TreeWithRoot)
function processChildren(children: TreeNode[], fn: (item: TreeNode) => TreeNode): TreeNode[] {
  return children.map((item) => {
    const newNode = fn({ ...item })

    if (isFolderNode(newNode) && newNode.children.length > 0) {
      newNode.children = processChildren(newNode.children, fn)
    }

    return newNode
  })
}

export function editRecursive(tree: TreeWithRoot, newNode: TreeNode): TreeWithRoot {
  const newTree = recursiveTreeMap(tree, (node) => {
    if (node.id === newNode.id) return { ...node, ...newNode }
    return node
  })

  return newTree
}

export function indexNodeParents(tree: TreeWithRoot): NodeParents {
  const nodeParents: NodeParents = {}
  const [root] = tree

  initializeNodeParents(root.children, ROOT_NODE)

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
