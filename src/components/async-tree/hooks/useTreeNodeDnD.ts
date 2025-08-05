import { type DragEvent, useRef, useState } from 'react'
import { useAsyncTree } from '../context/AsyncTreeContext'
import {
  type canDropFn,
  DropPosition,
  type FolderNode,
  type MoveData,
  type OnDropNodeFn,
  type TreeNode,
} from '../types'
import { calculateDragPosition, normalizeNewParent, parseNodeData } from '../utils/tree-operations'
import { isFolderNode, isValidMove } from '../utils/validations'

type TreeNodeDnDParams = {
  dragPosition: DropPosition | null
  isDropAllowed: boolean
  handleDragStart: (event: DragEvent) => void
  handleDragLeave: (event: DragEvent) => void
  handleDragOver: (event: DragEvent) => void
  handleDrop: (event: DragEvent) => void
}

export default function useTreeNodeDnD(
  node: TreeNode,
  onDrop: OnDropNodeFn,
  canDrop: canDropFn = () => true
): TreeNodeDnDParams {
  const { nodeParents } = useAsyncTree()
  const isDropAllowedRef = useRef<boolean>(true)
  const [dragPosition, setDragPosition] = useState<DropPosition | null>(null)

  const handleDragStart = (event: DragEvent) => {
    event.stopPropagation()

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(node))
  }

  const handleDragLeave = (event: DragEvent) => {
    event.stopPropagation()
    event.preventDefault()

    setDragPosition(null)
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    event.dataTransfer.dropEffect = 'move'

    const position = calculateDragPosition(event, isFolderNode(node))
    setDragPosition(position)
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const source = parseNodeData(event.dataTransfer.getData('application/json'))
    const target = { ...node }

    if (!dragPosition || !source || source.id === target.id) return setDragPosition(null)

    const isDroppingInside = dragPosition === DropPosition.Inside

    const prevParent = nodeParents[source.id]
    const nextParent = isDroppingInside ? (target as FolderNode) : nodeParents[target.id]

    if (!prevParent || !nextParent) return

    const moveData: MoveData = {
      source,
      position: dragPosition,
      target,
      prevParent,
      nextParent,
    }

    if (!isValidMove({ ...moveData, nodeParents })) return setDragPosition(null)

    const isDropAllowed = canDrop({
      ...moveData,
      prevParent: normalizeNewParent(prevParent),
      nextParent: normalizeNewParent(nextParent),
    })

    isDropAllowedRef.current = isDropAllowed
    setDragPosition(null)

    if (!isDropAllowed) return

    onDrop(moveData)
  }

  return {
    dragPosition,
    isDropAllowed: isDropAllowedRef.current,
    handleDragStart,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  }
}
