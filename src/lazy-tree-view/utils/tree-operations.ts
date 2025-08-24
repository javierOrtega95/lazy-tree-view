import { type DragEvent } from 'react'
import { DropPosition, type MoveData } from '../../types/dnd'
import type { FolderNode, TreeNode } from '../../types/tree'
import { DROP_BEFORE_FOLDER_PERCENT, DROP_MID_PERCENT, ROOT_NODE } from '../constants'
import { recursiveTreeMap } from './tree-recursive'
import { isFolderNode } from './validations'

export function moveNode(data: { tree: TreeNode[] } & MoveData): TreeNode[] {
  const { tree, source, target, position, prevParent, nextParent } = data

  const isDroppedInSameParent = prevParent.id === nextParent.id

  return isDroppedInSameParent
    ? handleSameParentMove({ tree, source, target, position, prevParent })
    : handleDifferentParentMove(data)
}

function handleSameParentMove({
  tree,
  source,
  target,
  position,
  prevParent,
}: Omit<MoveData, 'nextParent'> & { tree: TreeNode[] }): TreeNode[] {
  const { id, children } = prevParent

  const sourceIndex = children.findIndex((child) => child.id === source.id)
  const targetIndex = children.findIndex((child) => child.id === target.id)

  if (sourceIndex === -1 || targetIndex === -1) return tree

  // adjust target index when the source node is before the target node
  const newTargetIndex = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex

  const newPosition = position === DropPosition.Before ? newTargetIndex : newTargetIndex + 1

  const newChildren = [...children]

  // remove the source node from its current position
  newChildren.splice(sourceIndex, 1)

  // insert the source node in the new position
  newChildren.splice(newPosition, 0, source)

  return recursiveTreeMap(tree, (node) => {
    if (node.id === id) {
      return {
        ...node,
        children: newChildren,
      }
    }

    return node
  })
}

function handleDifferentParentMove({
  tree,
  source,
  target,
  position,
  prevParent,
  nextParent,
}: MoveData & { tree: TreeNode[] }): TreeNode[] {
  const isDroppingInsideFolder = isFolderNode(target) && position === DropPosition.Inside

  return recursiveTreeMap(tree, (node) => {
    if (node.id === prevParent.id) {
      const filteredChildren = prevParent.children.filter((child) => child.id !== source.id)

      // update children of prev parent
      return {
        ...node,
        children: filteredChildren,
      }
    }

    if (node.id === target.id && isDroppingInsideFolder) {
      const { children } = node as FolderNode

      return { ...node, children: [...children, source] }
    }

    if (node.id === nextParent.id && !isDroppingInsideFolder) {
      const { children } = nextParent
      const targetIndex = children.findIndex((child) => child.id === target.id)

      const newPosition = position === DropPosition.Before ? targetIndex : targetIndex + 1

      const newChildren = [...children]

      newChildren.splice(newPosition, 0, source)

      return {
        ...node,
        children: newChildren,
      }
    }

    return node
  })
}

export function calculateDragPosition(event: DragEvent, isFolder: boolean): DropPosition {
  const target = event.currentTarget as HTMLElement
  const offsetY = event.nativeEvent.offsetY

  const height = target.offsetHeight

  // not a folder, so just check is dragging before or after
  if (!isFolder) {
    const midThreshold = height * DROP_MID_PERCENT

    return offsetY <= midThreshold ? DropPosition.Before : DropPosition.After
  }

  const beforeThreshold = height * DROP_BEFORE_FOLDER_PERCENT

  if (offsetY <= beforeThreshold) return DropPosition.Before

  if (offsetY >= height) return DropPosition.After

  return DropPosition.Inside
}

export function parseNodeData(data: string): TreeNode | null {
  try {
    return JSON.parse(data)
  } catch (error) {
    console.error('Invalid JSON data:', error)
    return null
  }
}

export function normalizeNewParent(newParent: FolderNode | null): FolderNode | null {
  const parent = newParent?.id === ROOT_NODE.id ? null : newParent

  return parent
}
