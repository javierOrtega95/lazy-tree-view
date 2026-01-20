import { type DragEvent, useCallback, useEffect, useState } from 'react'
import { DropPosition, type MoveData } from '../../../types/dnd'
import type { TreeNode } from '../../../types/tree'
import { useLazyTreeView } from '../../context/LazyTreeViewContext'
import type { CanDropFn } from '../../types'
import { calculateDragPosition } from '../../utils/tree-operations'
import { isFolderNode, isMovingFolderIntoDescendant } from '../../utils/validations'
import type { TreeNodeDnDReturn } from './types'

export default function useTreeNodeDnD(
  node: TreeNode,
  onDrop: (data: MoveData) => void,
  canDrop: CanDropFn = () => true,
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

  const buildMoveData = useCallback(
    (source: TreeNode, target: TreeNode, position: DropPosition): MoveData => {
      const prevParent = nodeParents[source.id]

      const droppingInsideFolder = isFolderNode(target) && position === DropPosition.Inside
      const nextParent = droppingInsideFolder ? target : nodeParents[target.id]

      return { source, target, position, prevParent, nextParent }
    },
    [nodeParents],
  )

  const validateMove = useCallback(
    (moveData: MoveData): boolean => {
      const { source, target } = moveData

      if (source.id === target.id) return false

      const isFolderIntoDescendant =
        isFolderNode(source) && isMovingFolderIntoDescendant(source, target, nodeParents)

      if (isFolderIntoDescendant) return false

      return canDrop(moveData)
    },
    [nodeParents, canDrop],
  )

  const handleDragStart = useCallback(
    (event: DragEvent) => {
      event.stopPropagation()
      event.dataTransfer.effectAllowed = 'move'

      setDraggingNode(node)
    },
    [node, setDraggingNode],
  )

  const handleDragLeave = useCallback(
    (event: DragEvent) => {
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
    },
    [hoveredNodeId, node.id, setHoveredNodeId],
  )

  const handleDragEnd = useCallback(() => {
    setDraggingNode(null)
    setDragPosition(null)
    setIsDropAllowed(true)
    setHoveredNodeId(null)
  }, [setDraggingNode, setHoveredNodeId])

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (!draggingNode) return

      setHoveredNodeId(node.id)

      const position = calculateDragPosition(event)
      const moveData = buildMoveData(draggingNode, node, position)
      const dropAllowed = validateMove(moveData)

      event.dataTransfer.dropEffect = dropAllowed ? 'move' : 'none'

      setIsDropAllowed(dropAllowed)
      setDragPosition(position)
    },
    [draggingNode, node, setHoveredNodeId, buildMoveData, validateMove],
  )

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (!draggingNode || !dragPosition || !isDropAllowed) {
        handleDragEnd()

        return
      }

      const moveData = buildMoveData(draggingNode, node, dragPosition)
      onDrop(moveData)
      handleDragEnd()
    },
    [draggingNode, dragPosition, isDropAllowed, node, buildMoveData, onDrop, handleDragEnd],
  )

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
