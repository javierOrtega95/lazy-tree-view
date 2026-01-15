import { type DragEvent, useEffect, useState } from 'react'
import { DropPosition, type MoveData } from '../../../types/dnd'
import type { TreeNode } from '../../../types/tree'
import { useLazyTreeView } from '../../context/LazyTreeViewContext'
import type { CanDropFn } from '../../types'
import { calculateDragPosition } from '../../utils/tree-operations'
import { isFolderNode, isMovingFolderIntoDescendant, isValidMove } from '../../utils/validations'
import type { TreeNodeDnDReturn } from './types'

export default function useTreeNodeDnD(
  node: TreeNode,
  onDrop: (data: MoveData) => void,
  canDrop: CanDropFn = () => true
): TreeNodeDnDReturn {
  const { nodeParents, draggingNode, hoveredNodeId, setDraggingNode, setHoveredNodeId } =
    useLazyTreeView()

  const [isDropAllowed, setIsDropAllowed] = useState<boolean>(true)
  const [dragPosition, setDragPosition] = useState<DropPosition | null>(null)

  useEffect(() => {
    const isCurrentlyHovered = hoveredNodeId === node.id

    if (!isCurrentlyHovered && dragPosition !== null) {
      setDragPosition(null)
      setIsDropAllowed(true)
    }
  }, [hoveredNodeId, node.id, dragPosition])

  const handleDragStart = (event: DragEvent) => {
    event.stopPropagation()
    event.dataTransfer.effectAllowed = 'move'

    setDraggingNode(node)
  }

  const handleDragLeave = (event: DragEvent) => {
    event.stopPropagation()

    const relatedTarget = event.relatedTarget as HTMLElement
    const currentTarget = event.currentTarget as HTMLElement

    if (!currentTarget.contains(relatedTarget)) {
      setDragPosition(null)
      setIsDropAllowed(true)

      if (hoveredNodeId === node.id) {
        setHoveredNodeId(null)
      }
    }
  }

  const handleDragEnd = () => {
    setDraggingNode(null)
    setDragPosition(null)
    setIsDropAllowed(true)
    setHoveredNodeId(null)
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!draggingNode) return

    setHoveredNodeId(node.id)

    const position = calculateDragPosition(event)

    const moveData = buildMoveData(draggingNode, node, position)
    const { source, target } = moveData

    const isFolderIntoDescendant =
      isFolderNode(source) && isMovingFolderIntoDescendant(source, target, nodeParents)

    const isInvalidMove = source.id === target.id || isFolderIntoDescendant

    const dropAllowed = !isInvalidMove && canDrop(moveData)

    event.dataTransfer.dropEffect = dropAllowed ? 'move' : 'none'

    setIsDropAllowed(dropAllowed)
    setDragPosition(position)
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!draggingNode) {
      handleDragEnd()

      return
    }

    const source = { ...draggingNode }
    const target = { ...node }

    const isSameNodeDrop = source?.id === target.id

    if (!dragPosition || !source || isSameNodeDrop) {
      handleDragEnd()

      return
    }

    const moveData = buildMoveData(draggingNode, node, dragPosition)

    if (!isValidMove({ ...moveData, nodeParents }) || !isDropAllowed) {
      handleDragEnd()

      return
    }

    onDrop(moveData)

    handleDragEnd()
  }

  const buildMoveData = (source: TreeNode, target: TreeNode, position: DropPosition): MoveData => {
    const prevParent = nodeParents[source.id]
    const nextParent = calculateNextParent(target, position)

    return { source, target, position, prevParent, nextParent }
  }

  const calculateNextParent = (target: TreeNode, position: DropPosition) => {
    if (!isFolderNode(target)) return nodeParents[target.id]

    const isDroppingInside = position === DropPosition.Inside
    const isDroppingBefore = position === DropPosition.Before

    if (isDroppingInside) return target

    if (isDroppingBefore) return nodeParents[target.id]

    return nodeParents[target.id]
  }

  return {
    dragPosition,
    isDropAllowed,
    handleDragStart,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  }
}
