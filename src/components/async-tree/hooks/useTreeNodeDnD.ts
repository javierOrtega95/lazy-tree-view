import { useState } from 'react'
import { useAsyncTree } from '../context/AsyncTreeContext'
import { DropPosition, FolderNode, MoveData, OnDropNodeFn, TreeNode } from '../types'
import { calculateDragPosition, parseNodeData } from '../utils/tree-operations'
import { isFolderNode, isValidMove } from '../utils/validations'

export type TreeNodeDnDdata = {
  dragPosition: DropPosition | null
  handleDragStart: (event: React.DragEvent) => void
  handleDragLeave: (event: React.DragEvent) => void
  handleDragOver: (event: React.DragEvent) => void
  handleDrop: (event: React.DragEvent) => void
}

export default function useTreeNodeDnD(node: TreeNode, onDrop: OnDropNodeFn): TreeNodeDnDdata {
  const { nodeParents } = useAsyncTree()
  const [dragPosition, setDragPosition] = useState<DropPosition | null>(null)

  const handleDragStart = (event: React.DragEvent) => {
    event.stopPropagation()

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(node))
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.stopPropagation()
    event.preventDefault()

    setDragPosition(null)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    event.dataTransfer.dropEffect = 'move'

    const position = calculateDragPosition(event, isFolderNode(node))

    setDragPosition(position)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const source = parseNodeData(event.dataTransfer.getData('application/json'))
    const target = { ...node }

    const isSameNodeDrop = source?.id === target.id

    if (!dragPosition || !source || isSameNodeDrop) return setDragPosition(null)

    const isDroppingInside = dragPosition === DropPosition.Inside

    const prevParent = nodeParents[source.id]
    const nextParent = isDroppingInside ? (target as FolderNode) : nodeParents[target.id]

    if (!prevParent || !nextParent) return

    const data: MoveData = {
      source,
      position: dragPosition,
      target,
      prevParent,
      nextParent,
    }

    if (!isValidMove({ ...data, nodeParents })) return setDragPosition(null)

    /**@todo canDrop?.(data) */

    setDragPosition(null)
    onDrop(data)
  }

  return {
    dragPosition,
    handleDragStart,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  }
}
