import { MouseEvent } from 'react'
import { TREE_NODE_INDENTATION } from '../../constants'
import useTreeNodeDragAndDrop from '../../hooks/useTreeNodeDnD'
import { DropPosition, FolderNode, TreeNode as Node, TreeNodeProps } from '../../types'
import { isBaseNode, isFolderNode } from '../../utils/validations'
import DropIndicator from '../drop-indicator/DropIndicator'
import './TreeNode.css'

export default function TreeNode({
  node,
  level,
  isOpen,
  isLoading,
  folder: Folder,
  item: Item,
  children,
  dragClassNames,
  onFolderClick,
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

  const isFolder = isFolderNode(node)
  const isItem = isBaseNode(node)

  const isDroppingBefore = dragPosition === DropPosition.Before
  const isDroppingAfter = dragPosition === DropPosition.After
  const dropAllowedClassName = isDropAllowed ? '' : dragClassNames.dropNotAllowed

  const getNodeDnDClassName = () => {
    if (!dragPosition) return ''

    const isDroppingInside = dragPosition === DropPosition.Inside

    return isDroppingInside ? `${dragClassNames.dragOver} ${dropAllowedClassName}` : ''
  }

  const getDropIndicatorClassName = () => {
    if (!dragPosition) return ''

    if (isDroppingBefore) return `${dragClassNames.dragBefore} ${dropAllowedClassName}`
    if (isDroppingAfter) return `${dragClassNames.dragAfter} ${dropAllowedClassName}`
  }

  const left = TREE_NODE_INDENTATION * level

  const handleToggleOpen = (event: MouseEvent, node: Node) => {
    event.stopPropagation()

    onFolderClick(node as FolderNode)
  }

  return (
    <li
      id={`tree-node-${node.id}`}
      data-testid={`tree-node-${node.id}`}
      role='treeitem'
      draggable={true}
      className={`tree-node ${getNodeDnDClassName()}`}
      style={{ paddingLeft: left }}
      onDragStart={handleDragStart}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDroppingBefore && (
        <DropIndicator
          id={`drop-indicator-before-${node.id}`}
          className={getDropIndicatorClassName()}
          indentation={left}
        />
      )}

      {isFolder && (
        <Folder
          node={node}
          level={level}
          isLoading={isLoading}
          isOpen={isOpen}
          onToggleOpen={handleToggleOpen}
        />
      )}

      {isItem && <Item node={node} level={level} />}

      {isDroppingAfter && (
        <DropIndicator
          id={`drop-indicator-after-${node.id}`}
          className={getDropIndicatorClassName()}
          indentation={left}
        />
      )}

      <ul role='group' className='tree-group'>
        {children}
      </ul>
    </li>
  )
}
