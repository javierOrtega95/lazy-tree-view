import { useEffect, useMemo, useRef, useState } from 'react'
import type { MoveData } from '../types/dnd'
import type { FolderNode, FoldersState, FolderState, TreeNode as Node, NodeId } from '../types/tree'
import { defaultDnDclassNames, ROOT_NODE } from './constants'
import { LazyTreeViewContext } from './context/LazyTreeViewContext'
import './LazyTreeView.css'
import { default as DefaultFolder } from './tree-folder/TreeFolder'
import { default as DefaultItem } from './tree-item/TreeItem'
import TreeNode from './tree-node/TreeNode'
import type { LazyTreeViewProps } from './types'
import { moveNode, normalizeNewParent } from './utils/tree-operations'
import { getFoldersState, getNodeParents, recursiveTreeMap } from './utils/tree-recursive'
import { isFolderNode } from './utils/validations'

export default function LazyTreeView({
  initialTree,
  folder: Folder = DefaultFolder,
  item: Item = DefaultItem,
  fetchOnce = true,
  dragClassNames = defaultDnDclassNames,
  loadChildren,
  canDrop = () => true,
  onDrop,
  onChange,
  onError,
}: LazyTreeViewProps): JSX.Element {
  const firstRenderRef = useRef<boolean>(true)

  const [treeData, setTreeData] = useState<Node[]>(initialTree)
  const [foldersState, setFoldersState] = useState<FoldersState>(() => getFoldersState(initialTree))

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }

    setFoldersState((prev) => getFoldersState(treeData, prev))
  }, [treeData])

  const tree = useMemo(() => [{ ...ROOT_NODE, children: treeData }], [treeData])

  const nodeParents = useMemo(() => getNodeParents(tree), [tree])

  const updateFolderState = (folderId: NodeId, newFolderState: Partial<FolderState>) => {
    setFoldersState((prev) => {
      const updatedFolderState = { ...prev[folderId], ...newFolderState }

      return { ...prev, [folderId]: updatedFolderState }
    })
  }

  const updateFolderChildren = (tree: Node[], folderId: NodeId, updatedChildren: Node[]) => {
    return recursiveTreeMap(tree, (node) => {
      if (isFolderNode(node) && node.id === folderId) {
        return { ...node, children: updatedChildren }
      }

      return node
    })
  }

  const handleToggleOpen = async (folder: FolderNode) => {
    const { id } = folder
    const { isOpen = false, hasFetched = false } = foldersState[id] ?? {}

    if (isOpen) return updateFolderState(id, { isOpen: false })

    if (fetchOnce && hasFetched) return updateFolderState(id, { isOpen: true })

    try {
      updateFolderState(id, { isLoading: true })

      const children = await loadChildren(folder)

      setTreeData((prevData) => {
        const prevTree = [{ ...ROOT_NODE, children: prevData }]
        const newTree = updateFolderChildren(prevTree, id, children)
        const { children: rootChildren } = newTree[0] as FolderNode

        onChange?.(rootChildren)

        return rootChildren
      })

      updateFolderState(id, { isOpen: true, isLoading: false, hasFetched: true })
    } catch (error) {
      updateFolderState(id, { isOpen: false, isLoading: false, error })
      onError?.(error, folder)
    }
  }

  const handleDrop = (dropData: MoveData) => {
    const { source, target, position, prevParent, nextParent } = dropData

    setTreeData((prevData) => {
      const prevTree = [{ ...ROOT_NODE, children: prevData }]
      const newTree = moveNode({ tree: prevTree, ...dropData })

      const { children: rootChildren } = newTree[0] as FolderNode

      onDrop?.({
        source,
        target,
        position,
        prevParent: normalizeNewParent(prevParent),
        nextParent: normalizeNewParent(nextParent),
      })

      onChange?.(rootChildren)

      return rootChildren
    })
  }

  const renderNode = (node: Node, depth: number = 0) => {
    const { isOpen = false, isLoading = false, error } = foldersState[node.id] ?? {}

    return (
      <TreeNode
        key={node.id}
        node={node}
        depth={depth}
        isOpen={isOpen}
        isLoading={isLoading}
        error={error}
        folder={Folder}
        item={Item}
        dragClassNames={dragClassNames}
        onToggleOpen={handleToggleOpen}
        canDrop={canDrop}
        onDrop={handleDrop}
      >
        {isFolderNode(node) && isOpen && node.children.map((child) => renderNode(child, depth + 1))}
      </TreeNode>
    )
  }

  return (
    <LazyTreeViewContext.Provider value={{ nodeParents }}>
      <ul role='tree' className='lazy-tree-view'>
        {tree[0].children.map((node) => renderNode(node))}
      </ul>
    </LazyTreeViewContext.Provider>
  )
}
