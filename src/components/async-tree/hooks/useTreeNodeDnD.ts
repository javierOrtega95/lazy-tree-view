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

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()

    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/json', JSON.stringify(node))
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    e.preventDefault()

    setDragPosition(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    e.dataTransfer.dropEffect = 'move'

    const position = calculateDragPosition(e, isFolderNode(node))

    setDragPosition(position)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const source = parseNodeData(e.dataTransfer.getData('application/json'))
    const target = { ...node }

    const isSameNodeDrop = source?.id === target.id

    if (!dragPosition || !source || isSameNodeDrop) return setDragPosition(null)

    const isDroppingInside = dragPosition === DropPosition.Inside

    const prevParent = nodeParents[source.id]
    const nextParent = isDroppingInside ? (target as FolderNode) : nodeParents[target.id]

    if (!prevParent || !nextParent) return

    const data: MoveData = {
      source,
      target,
      position: dragPosition,
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
