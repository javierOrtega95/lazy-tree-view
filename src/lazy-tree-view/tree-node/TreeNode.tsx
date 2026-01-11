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
  // allowDragAndDrop,
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

  const isDroppingBefore = dragPosition === DropPosition.Before
  const isDroppingAfter = dragPosition === DropPosition.After

  const DnDClassName = useMemo(() => {
    if (!dragPosition) return ''

    const isDroppingInside = dragPosition === DropPosition.Inside

    const { dragOver, dropNotAllowed } = dragClassNames
    const dropAllowedClassName = isDropAllowed ? '' : dropNotAllowed

    return isDroppingInside ? `${dragOver} ${dropAllowedClassName}` : ''
  }, [dragPosition, isDropAllowed, dragClassNames])

  const indicatorClassName = useMemo(() => {
    if (!dragPosition) return ''

    const { dragBefore, dragAfter, dropNotAllowed } = dragClassNames
    const positionClass = isDroppingBefore ? dragBefore : dragAfter
    const allowedClass = isDropAllowed ? '' : dropNotAllowed

    return `${positionClass} ${allowedClass}`
  }, [dragPosition, isDropAllowed, dragClassNames, isDroppingBefore])

  const handleToggleOpen = (event: MouseEvent, folder: FolderNode) => {
    event.stopPropagation()

    onToggleOpen(folder)
  }

  return (
    <li
      id={nodeId}
      data-testid={nodeId}
      role='treeitem'
      draggable={true}
      className={`tree-node ${DnDClassName}`}
      onDragStart={handleDragStart}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
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
