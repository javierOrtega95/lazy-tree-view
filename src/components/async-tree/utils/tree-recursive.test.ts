import { describe, expect, it } from 'vitest'
import type { FolderNode, FoldersState, TreeNode } from '../types'
import { getFoldersState, getNodeParents, recursiveTreeMap } from './tree-recursive'

describe('tree-recursive utilities', () => {
  const rootFolder = {
    id: crypto.randomUUID(),
    name: 'Folder 1',
  }

  const childrenFolder = {
    id: crypto.randomUUID(),
    name: 'Folder 2',
    children: [],
  }

  const mockTree: TreeNode[] = [
    {
      ...rootFolder,
      children: [
        childrenFolder,
        {
          id: crypto.randomUUID(),
          name: 'Item 1',
        },
      ],
    },
  ]

  describe('recursiveTreeMap', () => {
    it('should apply the transformation function to each node', () => {
      const mockName = 'name mapped'
      const mockTransformFn = (node: TreeNode): TreeNode => ({
        ...node,
        name: `${node.name} ${mockName}`,
      })

      const mappedTree = recursiveTreeMap(mockTree, mockTransformFn)

      const [firstNode] = mappedTree
      const [firstChild, secondChild] = (firstNode as FolderNode).children

      expect(firstNode.name).toBe(`Folder 1 ${mockName}`)
      expect(firstChild.name).toBe(`Folder 2 ${mockName}`)
      expect(secondChild.name).toBe(`Item 1 ${mockName}`)
    })
  })

  describe('getNodeParents', () => {
    it('should map each node to its parent correctly', () => {
      const nodeParents = getNodeParents(mockTree)

      const [rootFolder] = mockTree
      const { children } = rootFolder as FolderNode

      const parentOfFirstNode = nodeParents[rootFolder.id]
      expect(parentOfFirstNode).toBeNull()

      for (const child of children) {
        const childParent = nodeParents[child.id]
        expect(childParent).toBe(rootFolder)
      }
    })

    it('should return an empty object for an empty tree', () => {
      const nodeParents = getNodeParents([])

      expect(nodeParents).toEqual({})
    })
  })

  describe('getFoldersState', () => {
    it('should return an empty object for an empty tree', () => {
      const foldersState = getFoldersState([])

      expect(foldersState).toEqual({})
    })

    it('should return an empty object when there are no folders', () => {
      const tree: TreeNode[] = [
        { id: 'item1', name: 'Item 1' },
        { id: 'item2', name: 'Item 2' },
      ]
      const foldersState = getFoldersState(tree)

      expect(foldersState).toEqual({})
    })

    it('should map all folders with default states', () => {
      const foldersState = getFoldersState(mockTree)

      const defaultState = {
        isOpen: false,
        isLoading: false,
        hasFetched: false,
      }

      const expectedState = {
        [rootFolder.id]: {
          ...defaultState,
          isOpen: true,
        },
        [childrenFolder.id]: defaultState,
      }

      expect(foldersState).toEqual(expectedState)
    })

    it('should respect isOpen from initialState if provided', () => {
      const initialState: FoldersState = {
        [rootFolder.id]: { isOpen: false, isLoading: true, hasFetched: true },
      }

      const foldersState = getFoldersState(mockTree, initialState)

      expect(foldersState[rootFolder.id].isOpen).toBe(false)
      expect(foldersState[rootFolder.id].isLoading).toBe(false)
      expect(foldersState[rootFolder.id].hasFetched).toBe(false)
    })

    it('should use default isOpen if not present in initialState', () => {
      const initialState: FoldersState = {
        [rootFolder.id]: { isOpen: true, isLoading: true, hasFetched: true },
      }

      const foldersState = getFoldersState(mockTree, initialState)

      expect(foldersState[childrenFolder.id].isOpen).toBe(false)
    })

    it('should handle partial initialState', () => {
      const initialState: FoldersState = {
        [rootFolder.id]: { isOpen: false, isLoading: false, hasFetched: false },
      }

      const foldersState = getFoldersState(mockTree, initialState)

      expect(foldersState[rootFolder.id].isOpen).toBe(false)
      expect(foldersState[childrenFolder.id].isOpen).toBe(false)
    })
  })
})
