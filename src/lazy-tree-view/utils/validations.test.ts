import { describe, it, expect } from 'vitest'
import { isFolderNode, isBaseNode, isMovingFolderIntoDescendant } from './validations'
import type { FolderNode, TreeNode, NodeParents } from '../../types/tree'

describe('isFolderNode', () => {
  it('should return true for a node with children property', () => {
    const folder: FolderNode = { id: '1', name: 'Folder', children: [] }

    expect(isFolderNode(folder)).toBe(true)
  })

  it('should return true for a folder with nested children', () => {
    const folder: FolderNode = {
      id: '1',
      name: 'Folder',
      children: [{ id: '2', name: 'Child', children: [] }],
    }

    expect(isFolderNode(folder)).toBe(true)
  })

  it('should return false for a node without children property', () => {
    const item: TreeNode = { id: '1', name: 'Item' }

    expect(isFolderNode(item)).toBe(false)
  })
})

describe('isBaseNode', () => {
  it('should return true for a node without children property', () => {
    const item: TreeNode = { id: '1', name: 'Item' }

    expect(isBaseNode(item)).toBe(true)
  })

  it('should return false for a node with children property', () => {
    const folder: FolderNode = { id: '1', name: 'Folder', children: [] }

    expect(isBaseNode(folder)).toBe(false)
  })
})

describe('isMovingFolderIntoDescendant', () => {
  it('should return true when moving a folder into its direct child', () => {
    const parent: FolderNode = { id: 'parent', name: 'Parent', children: [] }
    const child: FolderNode = { id: 'child', name: 'Child', children: [] }

    const nodeParents: NodeParents = {
      child: parent,
    }

    expect(isMovingFolderIntoDescendant(parent, child, nodeParents)).toBe(true)
  })

  it('should return true when moving a folder into a nested descendant', () => {
    const grandparent: FolderNode = { id: 'grandparent', name: 'Grandparent', children: [] }
    const parent: FolderNode = { id: 'parent', name: 'Parent', children: [] }
    const child: FolderNode = { id: 'child', name: 'Child', children: [] }

    const nodeParents: NodeParents = {
      parent: grandparent,
      child: parent,
    }

    expect(isMovingFolderIntoDescendant(grandparent, child, nodeParents)).toBe(true)
  })

  it('should return false when moving a folder to a sibling', () => {
    const root: FolderNode = { id: 'root', name: 'Root', children: [] }
    const folder1: FolderNode = { id: 'folder1', name: 'Folder 1', children: [] }
    const folder2: FolderNode = { id: 'folder2', name: 'Folder 2', children: [] }

    const nodeParents: NodeParents = {
      folder1: root,
      folder2: root,
    }

    expect(isMovingFolderIntoDescendant(folder1, folder2, nodeParents)).toBe(false)
  })

  it('should return false when moving a folder to an unrelated node', () => {
    const root: FolderNode = { id: 'root', name: 'Root', children: [] }
    const folder1: FolderNode = { id: 'folder1', name: 'Folder 1', children: [] }
    const folder2: FolderNode = { id: 'folder2', name: 'Folder 2', children: [] }
    const child2: FolderNode = { id: 'child2', name: 'Child 2', children: [] }

    const nodeParents: NodeParents = {
      folder1: root,
      folder2: root,
      child2: folder2,
    }

    expect(isMovingFolderIntoDescendant(folder1, child2, nodeParents)).toBe(false)
  })

  it('should return false when target has no parent', () => {
    const folder: FolderNode = { id: 'folder', name: 'Folder', children: [] }
    const orphan: TreeNode = { id: 'orphan', name: 'Orphan' }

    const nodeParents: NodeParents = {}

    expect(isMovingFolderIntoDescendant(folder, orphan, nodeParents)).toBe(false)
  })
})
