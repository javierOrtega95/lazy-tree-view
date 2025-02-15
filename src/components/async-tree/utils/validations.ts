import { BaseNode, DropPosition, FolderNode, MoveData, NodeParents, TreeNode } from '../types'

export function isValidMove({
  source,
  target,
  position,
  prevParent,
  nextParent,
  nodeParents,
}: Omit<MoveData, 'tree'> & {
  nodeParents: NodeParents
}): boolean {
  if (isAlreadyInsideFolder(source, target, position)) return false

  if (isFolderNode(source) && isMovingFolderIntoDescendant(source, target, nodeParents)) {
    return false
  }

  const isOrderingSameParent = position !== DropPosition.Inside && prevParent.id === nextParent.id

  if (isOrderingSameParent && isSamePosition({ source, target, position, prevParent })) {
    return false
  }

  return true
}

function isDescendant(source: TreeNode, target: TreeNode, nodeParents: NodeParents): boolean {
  let currentParent = nodeParents[target.id]

  while (currentParent) {
    if (currentParent.id === source.id) return true

    currentParent = nodeParents[currentParent.id]
  }

  return false
}

function isMovingFolderIntoDescendant(
  source: FolderNode,
  target: TreeNode,
  nodeParents: NodeParents
): boolean {
  if (isDescendant(source, target, nodeParents)) return true

  return false
}

function isAlreadyInsideFolder(
  source: TreeNode,
  target: TreeNode,
  position: DropPosition
): boolean {
  if (position === DropPosition.Inside) {
    const { children } = target as FolderNode

    if (children.some((child) => child.id === source.id)) return true
  }

  return false
}

function isSamePosition({
  source,
  target,
  position,
  prevParent,
}: Omit<MoveData, 'tree' | 'nextParent'>): boolean {
  const { children } = prevParent

  const sourceIndex = children.findIndex((child) => child.id === source.id)
  const targetIndex = children.findIndex((child) => child.id === target.id)

  if (sourceIndex === -1 || targetIndex === -1) return false

  const newTargetIndex = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex

  const newPosition = position === DropPosition.Before ? newTargetIndex : newTargetIndex + 1

  if (sourceIndex === newPosition) return true

  return false
}

export function isFolderNode(node: TreeNode): node is FolderNode {
  return 'children' in (node as FolderNode)
}

export function isBaseNode(node: TreeNode): node is BaseNode {
  return !('children' in (node as FolderNode))
}
