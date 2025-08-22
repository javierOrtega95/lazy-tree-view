import { type MouseEvent, useMemo } from 'react'
import useTreeNodeDragAndDrop from '../../hooks/useTreeNodeDnD/useTreeNodeDnD'
import { DropPosition, type FolderNode, type TreeNodeProps } from '../../types'
import { isBaseNode, isFolderNode } from '../../utils/validations'
import DropIndicator from '../drop-indicator/DropIndicator'
import './TreeNode.css'

export default function TreeNode({
  node,
  depth,
  isOpen,
  isLoading,
  folder: Folder,
  item: Item,
  children,
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
  } = useTreeNodeDragAndDrop(node, onDrop, canDrop)

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
    const className = isDroppingBefore ? dragBefore : dragAfter

    return `${className} ${dropNotAllowed}`
  }, [dragPosition, dragClassNames, isDroppingBefore])

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
    >
      {isDroppingBefore && (
        <DropIndicator id={`drop-indicator-before-${node.id}`} className={indicatorClassName} />
      )}

      {isFolderNode(node) && (
        <Folder
          node={node}
          depth={depth}
          isLoading={isLoading}
          isOpen={isOpen}
          onToggleOpen={handleToggleOpen}
        />
      )}

      {isBaseNode(node) && <Item node={node} depth={depth} />}

      {isDroppingAfter && (
        <DropIndicator id={`drop-indicator-after-${node.id}`} className={indicatorClassName} />
      )}

      {children && (
        <ul role='group' className='tree-group'>
          {children}
        </ul>
      )}
    </li>
  )
}
