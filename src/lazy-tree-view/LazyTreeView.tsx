import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { DropPosition, type MoveData } from '../types/dnd'
import type {
  FolderNode,
  NodeId,
  NodeIndex,
  NodeParents,
  TreeNode as Node,
  TreeWithRoot,
} from '../types/tree'
import { ROOT_NODE } from './constants'
import { LazyTreeViewContext } from './context/LazyTreeViewContext'
import styles from './LazyTreeView.module.css'
import { default as DefaultFolder } from './tree-folder/TreeFolder'
import { default as DefaultItem } from './tree-item/TreeItem'
import TreeNode from './tree-node/TreeNode'
import type { LazyTreeViewHandle, LazyTreeViewProps, TreeNodeProps } from './types'
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation/useKeyboardNavigation'
import {
  addNode as addNodeToTree,
  calculateMoveIndices,
  isDroppingInsideFolder,
  moveNode,
  normalizeNewParent,
  removeFromContainer,
  updateNode as updateNodeInTree,
} from './utils/tree-operations'
import { createNodeIndex, editRecursive, indexNodeParents } from './utils/tree-recursive'
import { isFolderNode } from './utils/validations'

/**
 * A tree view component with lazy-loaded children, drag-and-drop, keyboard
 * navigation, and an imperative API via `ref`.
 *
 * @see {@link LazyTreeViewProps} for available props.
 * @see {@link LazyTreeViewHandle} for imperative methods (addNode, removeNode, etc.).
 */
const LazyTreeView = forwardRef<LazyTreeViewHandle, LazyTreeViewProps>(function LazyTreeView(
  {
    initialTree,
    loadChildren,
    folder = DefaultFolder,
    item = DefaultItem,
    folderProps = {},
    itemProps = {},
    allowDragAndDrop = true,
    useDragHandle = false,
    dragClassNames = {},
    disableAnimations = false,
    animationDuration = 300,
    className = '',
    style = {},
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    canDrop = () => true,
    onDrop,
    onTreeChange,
  }: LazyTreeViewProps,
  ref,
): JSX.Element {
  const [tree, setTree] = useState<TreeWithRoot>(() => {
    return [{ ...ROOT_NODE, children: initialTree }]
  })

  const [draggingNode, setDraggingNode] = useState<Node | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<NodeId | null>(null)
  const [focusedNodeId, setFocusedNodeId] = useState<NodeId | null>(null)

  const nodeParents: NodeParents = useMemo(() => indexNodeParents(tree), [tree])
  const nodeIndex: NodeIndex = useMemo(() => createNodeIndex(tree), [tree])

  const { handleKeyDown } = useKeyboardNavigation({
    tree,
    nodeIndex,
    focusedNodeId,
    setFocusedNodeId,
    onToggleOpen: handleToggleOpen,
  })

  const updateTree = useCallback(
    (updater: (prev: TreeWithRoot) => TreeWithRoot) => {
      setTree((prev) => {
        const newTree = updater(prev)
        const [root] = newTree

        onTreeChange?.(root.children)

        return newTree
      })
    },
    [onTreeChange],
  )

  useImperativeHandle(
    ref,
    () => ({
      addNode: (parentId: NodeId | null, node: Node) => {
        const normalizedParentId = parentId ?? ROOT_NODE.id

        updateTree((prev) => addNodeToTree(prev, normalizedParentId, node))
      },

      removeNode: (nodeId: NodeId) => {
        const parent = nodeParents[nodeId]

        updateTree((prev) => removeFromContainer(prev, nodeId, parent ?? null))
      },

      updateNode: (nodeId: NodeId, updates: Partial<Node>) => {
        updateTree((prev) => {
          return updateNodeInTree(prev, nodeId, (node) => ({ ...node, ...updates }))
        })
      },

      moveNode: (nodeId: NodeId, targetId: NodeId, position: DropPosition) => {
        const source = nodeIndex[nodeId]
        const target = nodeIndex[targetId]

        if (!source || !target) return

        const nextParent = isDroppingInsideFolder(target.node, position)
          ? (target.node as FolderNode)
          : target.parent

        const { prevIndex, nextIndex } = calculateMoveIndices({
          source: source.node,
          target: target.node,
          position,
          prevParent: source.parent,
          nextParent,
        })

        const moveData: MoveData = {
          source: source.node,
          target: target.node,
          position,
          prevParent: source.parent,
          nextParent,
          prevIndex,
          nextIndex,
        }

        updateTree((prev) => moveNode(prev, moveData))
      },

      setTree: (newTree: Node[]) => {
        updateTree(() => [{ ...ROOT_NODE, children: newTree }])
      },

      getTree: () => tree[0].children,

      getNode: (nodeId: NodeId) => nodeIndex[nodeId]?.node,
    }),
    [nodeIndex, nodeParents, tree, updateTree],
  )

  async function handleToggleOpen(folder: FolderNode) {
    // if currently open, close it
    if (folder.isOpen) {
      updateTree((prev) => {
        const newTree = editRecursive(prev, { ...folder, isOpen: false })

        return newTree
      })

      return
    }

    // if currently closed and doesn't have children loaded, load them
    if (!folder.isOpen && !folder.hasFetched) {
      updateTree((prev) => {
        const newTree = editRecursive(prev, { ...folder, isLoading: true, error: undefined })

        return newTree
      })

      try {
        onLoadStart?.(folder)

        const children = await loadChildren(folder)

        const newFolder: FolderNode = {
          ...folder,
          isOpen: true,
          isLoading: false,
          hasFetched: true,
          error: undefined,
          children,
        }

        onLoadSuccess?.(newFolder, children)

        updateTree((prev) => {
          const newTree = editRecursive(prev, newFolder)

          return newTree
        })
      } catch (error) {
        onLoadError?.(folder, error)

        updateTree((prev) => {
          const newTree = editRecursive(prev, { ...folder, isLoading: false, error })

          return newTree
        })
      }

      return
    }

    // if currently closed and has children loaded, just open it
    updateTree((prev) => {
      const newTree = editRecursive(prev, { ...folder, isOpen: true })

      return newTree
    })
  }

  const handleDrop = useCallback(
    (moveData: MoveData) => {
      onDrop?.({
        ...moveData,
        prevParent: normalizeNewParent(moveData.prevParent),
        nextParent: normalizeNewParent(moveData.nextParent),
      })

      updateTree((prevTree) => {
        const newTree = moveNode(prevTree, moveData)

        return newTree
      })
    },
    [onDrop, updateTree],
  )

  const renderNode = (node: Node, depth: number = 0) => {
    const commonProps: TreeNodeProps = {
      node,
      depth,
      item,
      folder,
      itemProps,
      folderProps,
      allowDragAndDrop,
      useDragHandle,
      dragClassNames,
      disableAnimations,
      animationDuration,
      canDrop,
      onDrop: handleDrop,
      onToggleOpen: handleToggleOpen,
    }

    if (!isFolderNode(node)) return <TreeNode key={node.id} {...commonProps} />

    return (
      <TreeNode key={node.id} {...commonProps}>
        {node.children.map((child) => renderNode(child, depth + 1))}
      </TreeNode>
    )
  }

  return (
    <LazyTreeViewContext.Provider
      value={{
        nodeParents,
        draggingNode,
        hoveredNodeId,
        focusedNodeId,
        setDraggingNode,
        setHoveredNodeId,
        setFocusedNodeId,
      }}
    >
      <ul
        role='tree'
        className={`${styles.lazyTreeView} ${className}`}
        style={style}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label='Tree view'
      >
        {tree[0].children.map((node) => renderNode(node))}
      </ul>
    </LazyTreeViewContext.Provider>
  )
})

export default LazyTreeView
