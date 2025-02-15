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
  onFolderClick,
  onDrop,
}: TreeNodeProps): JSX.Element {
  const { dragPosition, handleDragStart, handleDragLeave, handleDragOver, handleDrop } =
    useTreeNodeDragAndDrop(node, onDrop)

  const isFolder = isFolderNode(node)
  const isItem = isBaseNode(node)

  const isDroppingInside = dragPosition === DropPosition.Inside
  const isDroppingBefore = dragPosition === DropPosition.Before
  const isDroppingAfter = dragPosition === DropPosition.After

  const left = TREE_NODE_INDENTATION * level

  const dropOverClassName = isDroppingInside ? 'drag-over' : ''

  const handleToggleOpen = (e: MouseEvent, node: Node) => {
    e.stopPropagation()

    onFolderClick(node as FolderNode)
  }

  return (
    <li
      id={`tree-node-${node.id}`}
      data-testid={`tree-node-${node.id}`}
      role='treeitem'
      draggable={true}
      className={`tree-node ${dropOverClassName}`}
      style={{ paddingLeft: left }}
      onDragStart={handleDragStart}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDroppingBefore && (
        <DropIndicator id={`drop-indicator-before-${node.id}`} indentation={left} />
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
        <DropIndicator id={`drop-indicator-after-${node.id}`} indentation={left} />
      )}

      <ul role='group' className='tree-group'>
        {children}
      </ul>
    </li>
  )
}
