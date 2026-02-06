import { memo, useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { DropPosition } from '../../types/dnd'
import { useLazyTreeView } from '../context/LazyTreeViewContext'
import DropIndicator from '../drop-indicator/DropIndicator'
import { useExpandTransition } from '../hooks/useExpandTransition/useExpandTransition'
import useTreeNodeDragAndDrop from '../hooks/useTreeNodeDnD/useTreeNodeDnD'
import type { TreeNodeProps } from '../types'
import { isBaseNode, isFolderNode } from '../utils/validations'
import styles from './TreeNode.module.css'

function TreeNode({
  node,
  depth,
  folder: Folder,
  item: Item,
  folderProps,
  itemProps,
  children,
  allowDragAndDrop,
  useDragHandle,
  dragClassNames,
  disableAnimations,
  animationDuration,
  onToggleOpen,
  canDrop,
  onDrop,
}: TreeNodeProps): JSX.Element {
  const nodeRef = useRef<HTMLLIElement>(null)

  const isFolder = isFolderNode(node)
  const isOpen = isFolder && (node.isOpen ?? false)

  const {
    dragPosition,
    isDropAllowed,
    handleDragStart,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useTreeNodeDragAndDrop(node, onDrop, canDrop)

  const { focusedNodeId, setFocusedNodeId } = useLazyTreeView()
  const isFocused = focusedNodeId === node.id

  const { shouldRender, transitionState } = useExpandTransition({
    isOpen,
    transitionDuration: animationDuration,
    disableAnimations,
  })

  useEffect(() => {
    if (!nodeRef.current || !isFocused) return

    nodeRef.current.focus()
  }, [isFocused])

  const renderFolderContent = shouldRender && Array.isArray(children) && children.length > 0

  const { isDroppingBefore, isDroppingAfter } = useMemo(() => {
    if (!allowDragAndDrop || !dragPosition) {
      return { isDroppingBefore: false, isDroppingAfter: false }
    }

    const isDroppingBefore = dragPosition === DropPosition.Before
    const isDroppingAfter = dragPosition === DropPosition.After

    return { isDroppingBefore, isDroppingAfter }
  }, [allowDragAndDrop, dragPosition])

  const DnDClassName = useMemo(() => {
    if (!allowDragAndDrop || !dragPosition) return ''

    const isDroppingInside = dragPosition === DropPosition.Inside

    const { dragOver = styles.dragOver, dropNotAllowed = '' } = dragClassNames
    const allowedClass = isDropAllowed ? '' : dropNotAllowed

    return isDroppingInside ? `${dragOver} ${allowedClass}` : ''
  }, [allowDragAndDrop, dragPosition, isDropAllowed, dragClassNames])

  const indicatorClassName = useMemo(() => {
    if (!allowDragAndDrop || !dragPosition) return ''

    const { dragBefore = 'before', dragAfter = 'after', dropNotAllowed = '' } = dragClassNames

    const positionClass = isDroppingBefore ? dragBefore : dragAfter

    const allowedClass = isDropAllowed ? '' : dropNotAllowed

    return `${positionClass} ${allowedClass}`
  }, [allowDragAndDrop, dragPosition, isDropAllowed, dragClassNames, isDroppingBefore])

  const animationStyle = useMemo(() => {
    const duration = disableAnimations ? 0 : animationDuration

    return { '--animation-duration': `${duration}ms` } as CSSProperties
  }, [disableAnimations, animationDuration])

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

  return (
    <li
      ref={nodeRef}
      id={node.id}
      data-testid={node.id}
      data-type={isFolder ? 'folder' : 'item'}
      role='treeitem'
      tabIndex={isFocused ? 0 : -1}
      aria-expanded={isFolder ? isOpen : undefined}
      aria-level={depth + 1}
      draggable={allowDragAndDrop && !useDragHandle}
      className={`${styles.treeNode} ${DnDClassName}`}
      style={animationStyle}
      onClick={(e) => {
        e.stopPropagation()
        setFocusedNodeId(node.id)
      }}
      {...dragAndDropHandlers}
    >
      {isDroppingBefore && (
        <DropIndicator id={`indicator-before-${node.id}`} className={indicatorClassName} />
      )}

      {isFolder && (
        <Folder
          {...folderProps}
          {...node}
          isOpen={isOpen}
          isLoading={node.isLoading ?? false}
          depth={depth}
          onDragStart={useDragHandle ? handleDragStart : undefined}
          onToggleOpen={() => onToggleOpen(node)}
        />
      )}

      {isBaseNode(node) && (
        <Item
          {...itemProps}
          {...node}
          depth={depth}
          onDragStart={useDragHandle ? handleDragStart : undefined}
        />
      )}

      {isFolder && renderFolderContent && (
        <ul
          role='group'
          className={`${styles.treeGroup} ${transitionState === 'open' ? styles.open : ''}`}
          onDragOver={(event) => {
            if (!allowDragAndDrop) return

            event.stopPropagation()
            event.preventDefault()
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

export default memo(TreeNode)
