import { useEffect, useMemo, useRef, useState } from 'react'
import './AsyncTree.css'
import { default as DefaultFolder } from './components/tree-folder/TreeFolder'
import { default as DefaultItem } from './components/tree-item/TreeItem'
import TreeNode from './components/tree-node/TreeNode'
import { defaultDnDclassNames, ROOT_NODE } from './constants'
import { AsyncTreeContext } from './context/AsyncTreeContext'
import type {
  AsyncTreeProps,
  FolderNode,
  FoldersState,
  FolderState,
  MoveData,
  TreeNode as Node,
  NodeId,
} from './types'
import { moveNode, normalizeNewParent } from './utils/tree-operations'
import { getFoldersState, getNodeParents, recursiveTreeMap } from './utils/tree-recursive'
import { isFolderNode } from './utils/validations'

export default function AsyncTree({
  initialTree,
  folder: Folder = DefaultFolder,
  item: Item = DefaultItem,
  fetchOnce = true,
  dragClassNames = defaultDnDclassNames,
  loadChildren,
  canDrop = () => true,
  onDrop,
  onChange,
}: AsyncTreeProps): JSX.Element {
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
      const updatedFolderState = {
        ...prev[folderId],
        ...newFolderState,
      }

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
      console.error(`Error loading children for folder ${id}`, error)
      updateFolderState(id, { isOpen: false, isLoading: false })
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
    const { isOpen = false, isLoading = false } = foldersState[node.id] ?? {}

    return (
      <TreeNode
        key={node.id}
        node={node}
        depth={depth}
        isOpen={isOpen}
        isLoading={isLoading}
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
    <AsyncTreeContext.Provider value={{ nodeParents }}>
      <ul role='tree' className='async-tree'>
        {tree[0].children.map((node) => renderNode(node))}
      </ul>
    </AsyncTreeContext.Provider>
  )
}
