import type { BaseNode, FolderNode, NodeParents, TreeNode } from '../../types/tree'

function isDescendant(source: TreeNode, target: TreeNode, nodeParents: NodeParents): boolean {
  let currentParent = nodeParents[target.id]

  while (currentParent) {
    if (currentParent.id === source.id) return true

    currentParent = nodeParents[currentParent.id]
  }

  return false
}

export function isMovingFolderIntoDescendant(
  source: FolderNode,
  target: TreeNode,
  nodeParents: NodeParents,
): boolean {
  if (isDescendant(source, target, nodeParents)) return true

  return false
}

export function isFolderNode(node: TreeNode): node is FolderNode {
  return 'children' in node
}

export function isBaseNode(node: TreeNode): node is BaseNode {
  return !isFolderNode(node)
}
