import { describe, it, expect } from 'vitest'
import { isBranchNode, isBaseNode, isMovingBranchIntoDescendant } from './validations'
import type { BranchNode, TreeNode, NodeParents } from '../../types/tree'

describe('isBranchNode', () => {
  it('should return true for a node with children property', () => {
    const branch: BranchNode = { id: '1', name: 'Branch', children: [] }

    expect(isBranchNode(branch)).toBe(true)
  })

  it('should return true for a branch with nested children', () => {
    const branch: BranchNode = {
      id: '1',
      name: 'Branch',
      children: [{ id: '2', name: 'Child', children: [] }],
    }

    expect(isBranchNode(branch)).toBe(true)
  })

  it('should return false for a node without children property', () => {
    const item: TreeNode = { id: '1', name: 'Item' }

    expect(isBranchNode(item)).toBe(false)
  })
})

describe('isBaseNode', () => {
  it('should return true for a node without children property', () => {
    const item: TreeNode = { id: '1', name: 'Item' }

    expect(isBaseNode(item)).toBe(true)
  })

  it('should return false for a node with children property', () => {
    const branch: BranchNode = { id: '1', name: 'Branch', children: [] }

    expect(isBaseNode(branch)).toBe(false)
  })
})

describe('isMovingBranchIntoDescendant', () => {
  it('should return true when moving a branch into its direct child', () => {
    const parent: BranchNode = { id: 'parent', name: 'Parent', children: [] }
    const child: BranchNode = { id: 'child', name: 'Child', children: [] }

    const nodeParents: NodeParents = {
      child: parent,
    }

    expect(isMovingBranchIntoDescendant(parent, child, nodeParents)).toBe(true)
  })

  it('should return true when moving a branch into a nested descendant', () => {
    const grandparent: BranchNode = { id: 'grandparent', name: 'Grandparent', children: [] }
    const parent: BranchNode = { id: 'parent', name: 'Parent', children: [] }
    const child: BranchNode = { id: 'child', name: 'Child', children: [] }

    const nodeParents: NodeParents = {
      parent: grandparent,
      child: parent,
    }

    expect(isMovingBranchIntoDescendant(grandparent, child, nodeParents)).toBe(true)
  })

  it('should return false when moving a branch to a sibling', () => {
    const root: BranchNode = { id: 'root', name: 'Root', children: [] }
    const branch1: BranchNode = { id: 'branch1', name: 'Branch 1', children: [] }
    const branch2: BranchNode = { id: 'branch2', name: 'Branch 2', children: [] }

    const nodeParents: NodeParents = {
      branch1: root,
      branch2: root,
    }

    expect(isMovingBranchIntoDescendant(branch1, branch2, nodeParents)).toBe(false)
  })

  it('should return false when moving a branch to an unrelated node', () => {
    const root: BranchNode = { id: 'root', name: 'Root', children: [] }
    const branch1: BranchNode = { id: 'branch1', name: 'Branch 1', children: [] }
    const branch2: BranchNode = { id: 'branch2', name: 'Branch 2', children: [] }
    const child2: BranchNode = { id: 'child2', name: 'Child 2', children: [] }

    const nodeParents: NodeParents = {
      branch1: root,
      branch2: root,
      child2: branch2,
    }

    expect(isMovingBranchIntoDescendant(branch1, child2, nodeParents)).toBe(false)
  })

  it('should return false when target has no parent', () => {
    const branch: BranchNode = { id: 'branch', name: 'Branch', children: [] }
    const orphan: TreeNode = { id: 'orphan', name: 'Orphan' }

    const nodeParents: NodeParents = {}

    expect(isMovingBranchIntoDescendant(branch, orphan, nodeParents)).toBe(false)
  })
})
