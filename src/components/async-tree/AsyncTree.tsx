import React, { useEffect, useMemo, useRef, useState } from 'react'
import './AsyncTree.css'
import { default as DefaultFolder } from './components/tree-folder/TreeFolder'
import { default as DefaultItem } from './components/tree-item/TreeItem'
import TreeNode from './components/tree-node/TreeNode'
import { ROOT_NODE } from './constants'
import { AsyncTreeContext } from './context/AsyncTreeContext'
import {
  AsyncTreeProps,
  FolderNode,
  FoldersState,
  FolderState,
  MoveData,
  TreeNode as Node,
} from './types'
import { moveNode } from './utils/tree-operations'
import { getFoldersState, getNodeParents, recursiveTreeMap } from './utils/tree-recursive'
import { isFolderNode } from './utils/validations'

export default function AsyncTree({
  treeData,
  folder: Folder = DefaultFolder,
  item: Item = DefaultItem,
  fetchOnce = true,
  loadChildren,
  onDrop,
  onChange,
}: AsyncTreeProps): JSX.Element {
  const firstRenderRef = useRef(true)
  const [foldersState, setFoldersState] = useState<FoldersState>(getFoldersState(treeData))

  useEffect(() => {
    if (firstRenderRef.current) return

    firstRenderRef.current = false

    setFoldersState(getFoldersState(treeData))
  }, [treeData])

  const tree = useMemo(() => [{ ...ROOT_NODE, children: treeData }], [treeData])

  const nodeParents = useMemo(() => getNodeParents(tree), [tree])

  const updateFolderState = (folderId: FolderNode['id'], newFolderState: Partial<FolderState>) => {
    setFoldersState((prev) => {
      const updatedFolderState = {
        ...prev[folderId],
        ...newFolderState,
      }

      return { ...prev, [folderId]: updatedFolderState }
    })
  }

  const updateFolderChildren = (
    tree: Node[],
    folderId: FolderNode['id'],
    updatedChildren: Node[]
  ) => {
    return recursiveTreeMap(tree, (node) => {
      if (isFolderNode(node) && node.id === folderId) {
        return { ...node, children: updatedChildren }
      }

      return node
    })
  }

  const handleFolderClick = async (folder: FolderNode) => {
    const { id } = folder
    console.log(foldersState)
    const { isOpen = false, hasFetched = false } = foldersState[id] ?? {}

    if (isOpen) return updateFolderState(id, { isOpen: false })

    if (fetchOnce && hasFetched) return updateFolderState(id, { isOpen: true })

    try {
      updateFolderState(id, { isLoading: true })

      const children = await loadChildren(folder)

      const newTree = updateFolderChildren(tree, id, children)
      const { children: rootChildren } = newTree[0] as FolderNode

      onChange?.(rootChildren)

      updateFolderState(id, {
        isOpen: true,
        isLoading: false,
        hasFetched: true,
      })
    } catch (error) {
      console.error(`Error loading children for folder ${id}`, error)
      updateFolderState(id, { isOpen: false, isLoading: false })
    }
  }

  const handleDrop = (dropData: MoveData) => {
    const { source, target, position, prevParent, nextParent } = dropData

    const newTree = moveNode({ tree, ...dropData })
    const { children: rootChildren } = newTree[0] as FolderNode

    onDrop?.({
      source,
      target,
      position,
      prevParent: prevParent.id === ROOT_NODE.id ? null : prevParent,
      nextParent: nextParent.id === ROOT_NODE.id ? null : nextParent,
    })

    onChange?.(rootChildren)
  }

  const renderNode = (node: Node, level: number = 0) => {
    const { isOpen = false, isLoading = false } = foldersState[node.id] ?? {}
    const isFolder = isFolderNode(node)

    return (
      <React.Fragment key={node.id}>
        <TreeNode
          node={node}
          level={level}
          isOpen={isOpen}
          isLoading={isLoading}
          folder={Folder}
          item={Item}
          onFolderClick={handleFolderClick}
          onDrop={handleDrop}
        >
          {isFolder && isOpen && node.children.map((child) => renderNode(child, level + 1))}
        </TreeNode>
      </React.Fragment>
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
