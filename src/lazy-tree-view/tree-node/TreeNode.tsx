import { type MouseEvent, useMemo } from 'react'
import { DropPosition } from '../../types/dnd'
import type { FolderNode } from '../../types/tree'
import DropIndicator from '../drop-indicator/DropIndicator'
import useTreeNodeDragAndDrop from '../hooks/useTreeNodeDnD/useTreeNodeDnD'
import type { TreeNodeProps } from '../types'
import { isBaseNode, isFolderNode } from '../utils/validations'
import './TreeNode.css'

export default function TreeNode({
  node,
  depth,
  folder: Folder,
  item: Item,
  children,
  allowDragAndDrop = true,
  dragClassNames,
  onToggleOpen,
  canDrop,
  onDrop,
}: TreeNodeProps): JSX.Element {
  const {
    dragPosition,
    isDropAllowed,
    handleDragStart,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useTreeNodeDragAndDrop(node, onDrop, canDrop)

  const isFolder = isFolderNode(node)
  const isItem = isBaseNode(node)

  const nodeId = `tree-node-${node.id}`

  const isDroppingBefore = allowDragAndDrop && dragPosition === DropPosition.Before
  const isDroppingAfter = allowDragAndDrop && dragPosition === DropPosition.After

  const DnDClassName = useMemo(() => {
    if (!allowDragAndDrop || !dragPosition) return ''

    const isDroppingInside = dragPosition === DropPosition.Inside

    const { dragOver, dropNotAllowed } = dragClassNames
    const dropAllowedClassName = isDropAllowed ? '' : dropNotAllowed

    return isDroppingInside ? `${dragOver} ${dropAllowedClassName}` : ''
  }, [allowDragAndDrop, dragPosition, isDropAllowed, dragClassNames])

  const indicatorClassName = useMemo(() => {
    if (!allowDragAndDrop || !dragPosition) return ''

    const { dragBefore, dragAfter, dropNotAllowed } = dragClassNames
    const positionClass = isDroppingBefore ? dragBefore : dragAfter
    const allowedClass = isDropAllowed ? '' : dropNotAllowed

    return `${positionClass} ${allowedClass}`
  }, [allowDragAndDrop, dragPosition, isDropAllowed, dragClassNames, isDroppingBefore])

  const dragAndDropHandlers = useMemo(() => {
    if (!allowDragAndDrop) return {}

    return {
      onDragStart: handleDragStart,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      onDragEnd: handleDragEnd,
    }
  }, [
    allowDragAndDrop,
    handleDragStart,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  ])

  const handleToggleOpen = (event: MouseEvent, folder: FolderNode) => {
    event.stopPropagation()

    onToggleOpen(folder)
  }

  return (
    <li
      id={nodeId}
      data-testid={nodeId}
      role='treeitem'
      draggable={allowDragAndDrop}
      className={`tree-node ${DnDClassName} ${allowDragAndDrop ? 'draggable' : ''}`}
      {...dragAndDropHandlers}
    >
      {isDroppingBefore && (
        <DropIndicator id={`indicator-before-${node.id}`} className={indicatorClassName} />
      )}

      {isFolder && (
        <Folder
          {...node}
          isOpen={node.isOpen ?? false}
          isLoading={node.isLoading ?? false}
          depth={depth}
          onToggleOpen={(event) => handleToggleOpen(event, node)}
        />
      )}

      {isItem && <Item {...node} depth={depth} />}

      {isFolder && (
        <ul
          role='group'
          className={`tree-group ${node.isOpen ? 'open' : ''}`}
          onDragOver={(e) => {
            if (!allowDragAndDrop) return

            e.stopPropagation()
            e.preventDefault()
          }}
        >
          {children}
        </ul>
      )}

      {isDroppingAfter && (
        <DropIndicator id={`indicator-after-${node.id}`} className={indicatorClassName} />
      )}
    </li>
  )
}
