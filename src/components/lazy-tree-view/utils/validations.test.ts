import { describe, expect, it } from 'vitest'
import { ROOT_NODE } from '../constants'
import { BaseNode, DropPosition, FolderNode, TreeNode } from '../types'
import { getNodeParents } from './tree-recursive'
import { isBaseNode, isFolderNode, isValidMove } from './validations'

describe('isValidMove', () => {
  const mockTree: TreeNode[] = [
    {
      id: crypto.randomUUID(),
      name: 'Folder 1',
      children: [
        {
          id: crypto.randomUUID(),
          name: 'Folder 2',
          children: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Item 1',
        },
      ],
    },
  ]

  const rootFolder = { ...mockTree[0] } as FolderNode
  const [childrenFolder, childrenItem] = rootFolder.children

  const nodeParents = getNodeParents(mockTree)

  it('should return false if source node is already inside target folder', () => {
    const result = isValidMove({
      source: childrenItem,
      target: rootFolder,
      position: DropPosition.Inside,
      prevParent: rootFolder,
      nextParent: rootFolder,
      nodeParents,
    })

    expect(result).toBe(false)
  })

  it('should return false if moving folder into one of its descendants', () => {
    const result = isValidMove({
      source: rootFolder,
      target: childrenFolder,
      position: DropPosition.Before,
      prevParent: ROOT_NODE,
      nextParent: rootFolder,
      nodeParents,
    })

    expect(result).toBe(false)
  })

  it("should return false if ordering is the same and position hasn't changed", () => {
    const result = isValidMove({
      source: childrenFolder,
      position: DropPosition.Before,
      target: childrenItem,
      prevParent: rootFolder,
      nextParent: rootFolder,
      nodeParents,
    })

    expect(result).toBe(false)
  })

  it('should return true if the move is valid', () => {
    const result = isValidMove({
      source: childrenFolder,
      position: DropPosition.After,
      target: childrenItem,
      prevParent: rootFolder,
      nextParent: rootFolder,
      nodeParents,
    })

    expect(result).toBe(true)
  })
})

describe('TreeNode type', () => {
  const mockFolderNode: FolderNode = {
    id: 'folder-1',
    name: 'Folder 1',
    children: [],
  }

  const mockItemNode: BaseNode = {
    id: 'item-1',
    name: 'Item 1',
  }

  describe('isFolderNode', () => {
    it('should return true for a folder node', () => {
      expect(isFolderNode(mockFolderNode)).toBe(true)
    })

    it('should return false for an item node', () => {
      expect(isFolderNode(mockItemNode)).toBe(false)
    })
  })

  describe('isBaseNode', () => {
    it('should return true for an item node', () => {
      expect(isBaseNode(mockItemNode)).toBe(true)
    })

    it('should return false for a folder node', () => {
      expect(isBaseNode(mockFolderNode)).toBe(false)
    })
  })
})
