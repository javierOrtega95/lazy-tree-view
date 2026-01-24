import { useCallback, useMemo, useState } from 'react'
import type { MoveData } from '../types/dnd'
import { FolderNode, TreeNode as Node, NodeId, NodeParents, TreeWithRoot } from '../types/tree'
import { defaultDnDclassNames, ROOT_NODE } from './constants'
import { LazyTreeViewContext } from './context/LazyTreeViewContext'
import './LazyTreeView.css'
import { default as DefaultFolder } from './tree-folder/TreeFolder'
import { default as DefaultItem } from './tree-item/TreeItem'
import TreeNode from './tree-node/TreeNode'
import type { LazyTreeViewProps, TreeNodeProps } from './types'
import { moveNode, normalizeNewParent } from './utils/tree-operations'
import { editRecursive, indexNodeParents } from './utils/tree-recursive'
import { isFolderNode } from './utils/validations'

export default function LazyTreeView({
  initialTree,
  loadChildren,
  folder = DefaultFolder,
  item = DefaultItem,
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
}: LazyTreeViewProps): JSX.Element {
  const [tree, setTree] = useState<TreeWithRoot>(() => {
    return [{ ...ROOT_NODE, children: initialTree }]
  })

  const [draggingNode, setDraggingNode] = useState<Node | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<NodeId | null>(null)

  const nodeParents: NodeParents = useMemo(() => indexNodeParents(tree), [tree])

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

  const handleToggleOpen = async (folder: FolderNode) => {
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
      allowDragAndDrop,
      useDragHandle,
      dragClassNames: { ...defaultDnDclassNames, ...dragClassNames },
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
        setDraggingNode,
        setHoveredNodeId,
      }}
    >
      <ul role='tree' className={`lazy-tree-view ${className}`} style={style}>
        {tree[0].children.map((node) => renderNode(node))}
      </ul>
    </LazyTreeViewContext.Provider>
  )
}
