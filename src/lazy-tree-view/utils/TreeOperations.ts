import { DragEvent } from 'react'
import { DropPosition, MoveData } from '../../types/dnd'
import { FolderNode, NodeId, TreeNode, TreeWithRoot } from '../../types/tree'
import { DROP_AFTER_FOLDER_PERCENT, DROP_BEFORE_FOLDER_PERCENT, ROOT_NODE } from '../constants'
import { isFolderNode } from './validations'

// ===== UTILITY FUNCTIONS =====

function isMovingToRoot(nextParent?: FolderNode | null): boolean {
  return nextParent?.id === ROOT_NODE.id
}

function isMovingFromRoot(prevParent?: FolderNode | null): boolean {
  return prevParent?.id === ROOT_NODE.id
}

function isDroppingInsideFolder(target: TreeNode, position: DropPosition): boolean {
  return isFolderNode(target) && position === DropPosition.Inside
}

function calculateInsertPosition(
  sourceIndex: number,
  targetIndex: number,
  position: DropPosition
): number {
  const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
  return position === DropPosition.Before ? adjustedTargetIndex : adjustedTargetIndex + 1
}

function calculatePositionRelativeToTarget(targetIndex: number, position: DropPosition): number {
  return position === DropPosition.Before ? targetIndex : targetIndex + 1
}

function findNodeIndex(children: TreeNode[], nodeId: NodeId): number {
  return children.findIndex((child) => child.id === nodeId)
}

function createNewRoot(root: FolderNode, newChildren: TreeNode[]): TreeWithRoot {
  return [{ ...root, children: newChildren }]
}

function mapTree(tree: TreeWithRoot, mapper: (node: TreeNode) => TreeNode): TreeWithRoot {
  const mapNodeRecursive = (node: TreeNode): TreeNode => {
    const mappedNode = mapper(node)

    if (isFolderNode(mappedNode)) {
      return { ...mappedNode, children: mappedNode.children.map(mapNodeRecursive) }
    }

    return mappedNode
  }

  const [root] = tree
  const mappedRoot = { ...root, children: root.children.map(mapNodeRecursive) }

  return [mappedRoot]
}

function addNode(
  tree: TreeWithRoot,
  parentId: NodeId,
  node: TreeNode,
  position: number = -1
): TreeWithRoot {
  if (parentId === ROOT_NODE.id) return addToContainer(tree, null, node, position)

  return mapTree(tree, (currentNode) => {
    if (isFolderNode(currentNode) && currentNode.id === parentId) {
      const folder = currentNode
      const newChildren = [...folder.children]

      const insertPosition = position === -1 ? newChildren.length : position
      newChildren.splice(insertPosition, 0, node)

      return { ...folder, children: newChildren }
    }

    return currentNode
  })
}

function updateNode(
  tree: TreeWithRoot,
  nodeId: NodeId,
  updater: (node: TreeNode) => TreeNode
): TreeWithRoot {
  if (nodeId === ROOT_NODE.id) {
    const updatedRoot = updater(tree[0])

    return [updatedRoot, ...tree.slice(1)] as TreeWithRoot
  }

  return mapTree(tree, (currentNode) => {
    if (currentNode.id === nodeId) return updater(currentNode)

    return currentNode
  })
}

function reorderWithinContainer(tree: TreeWithRoot, moveData: MoveData): TreeWithRoot {
  const { source, target, position, prevParent } = moveData

  if (isMovingFromRoot(prevParent)) {
    return reorderInContainer(tree, null, moveData)
  }

  const parent = prevParent as FolderNode
  return updateNode(tree, parent.id, (node) => {
    if (!isFolderNode(node)) return node

    const folder = node as FolderNode
    const sourceIndex = findNodeIndex(folder.children, source.id)
    const targetIndex = findNodeIndex(folder.children, target.id)

    if (sourceIndex === -1 || targetIndex === -1) return node

    const newChildren = [...folder.children]
    newChildren.splice(sourceIndex, 1)

    const insertIndex = calculateInsertPosition(sourceIndex, targetIndex, position)
    newChildren.splice(insertIndex, 0, source)

    return { ...folder, children: newChildren }
  })
}

function moveBetweenContainers(tree: TreeWithRoot, moveData: MoveData): TreeWithRoot {
  const { source, target, position, prevParent, nextParent } = moveData
  const isDroppedInside = isDroppingInsideFolder(target, position)

  // remove from source container
  const result = removeFromContainer(tree, source.id, prevParent)

  // add to target container
  if (isDroppedInside) return addNode(result, target.id, source)

  // find position relative to target
  const targetContainer = isMovingToRoot(nextParent) ? result[0].children : nextParent!.children
  const targetIndex = findNodeIndex(targetContainer, target.id)
  const newPosition = calculatePositionRelativeToTarget(targetIndex, position)

  const containerId = isMovingToRoot(nextParent) ? ROOT_NODE.id : nextParent!.id

  return addNode(result, containerId, source, newPosition)
}

function reorderInContainer(
  tree: TreeWithRoot,
  container: FolderNode | null,
  moveData: MoveData
): TreeWithRoot {
  const { source, target, position } = moveData
  const [root] = tree
  const children = container ? container.children : root.children

  const sourceIndex = findNodeIndex(children, source.id)
  const targetIndex = findNodeIndex(children, target.id)

  if (sourceIndex === -1 || targetIndex === -1) return tree

  const newChildren = [...children]
  newChildren.splice(sourceIndex, 1)

  const insertIndex = calculateInsertPosition(sourceIndex, targetIndex, position)
  newChildren.splice(insertIndex, 0, source)

  return createNewRoot(root, newChildren)
}

function addToContainer(
  tree: TreeWithRoot,
  container: FolderNode | null,
  node: TreeNode,
  position: number
): TreeWithRoot {
  const [root] = tree
  const children = container ? container.children : root.children
  const insertPosition =
    position === -1 ? children.length : Math.max(0, Math.min(position, children.length))

  const newChildren = [...children]
  newChildren.splice(insertPosition, 0, node)

  return createNewRoot(root, newChildren)
}

function removeFromContainer(
  tree: TreeWithRoot,
  nodeId: NodeId,
  container?: FolderNode | null
): TreeWithRoot {
  if (isMovingFromRoot(container)) {
    const [root] = tree
    const filteredChildren = root.children.filter((child) => child.id !== nodeId)

    return createNewRoot(root, filteredChildren)
  }

  return updateNode(tree, container!.id, (node) => {
    if (isFolderNode(node)) {
      const folder = node as FolderNode
      const filteredChildren = folder.children.filter((child) => child.id !== nodeId)

      return { ...folder, children: filteredChildren }
    }

    return node
  })
}

// ===== PUBLIC API FUNCTIONS =====

/**
 * Calculate drag position based on mouse event and whether the node is a folder
 * For folders: top 15% = Before, bottom 15% = After, middle 70% = Inside
 * For non-folders: top 50% = Before, bottom 50% = After
 */
export function calculateDragPosition(event: DragEvent, isFolder: boolean): DropPosition {
  const target = event.currentTarget as HTMLElement
  const offsetY = event.nativeEvent.offsetY
  const height = target.offsetHeight

  if (!isFolder) {
    const threshold = height * 0.5

    return offsetY <= threshold ? DropPosition.Before : DropPosition.After
  }

  const beforeThreshold = height * DROP_BEFORE_FOLDER_PERCENT
  const afterThreshold = height * DROP_AFTER_FOLDER_PERCENT

  if (offsetY < beforeThreshold) return DropPosition.Before
  if (offsetY > afterThreshold) return DropPosition.After

  return DropPosition.Inside
}

/**
 * Move a node from one position to another - unified logic treating root as another folder
 */
export function moveNode(tree: TreeWithRoot, moveData: MoveData): TreeWithRoot {
  const { prevParent, nextParent } = moveData

  const isFromRoot = isMovingFromRoot(prevParent)
  const isToRoot = isMovingToRoot(nextParent)
  const isSameContainer = (isFromRoot && isToRoot) || prevParent?.id === nextParent?.id

  if (isSameContainer) {
    return reorderWithinContainer(tree, moveData)
  }

  // Different containers - move between them
  return moveBetweenContainers(tree, moveData)
}

/**
 * Normalize new parent to return null if it's the root node
 */
export function normalizeNewParent(parent: FolderNode): FolderNode | null {
  return parent?.id === ROOT_NODE.id ? null : parent
}
