import { describe, expect, it } from 'vitest'
import { createBranch, createItem, createTree } from '../../test/test-utils'
import type { BranchNode, TreeNode } from '../../types/tree'
import { ROOT_NODE } from '../constants'
import {
  createNodeIndex,
  editRecursive,
  indexNodeParents,
  recursiveTreeMap,
} from './tree-recursive'

describe('recursiveTreeMap', () => {
  it('should return the same tree structure for empty children', () => {
    const tree = createTree()
    const result = recursiveTreeMap(tree, (node) => node)

    expect(result).toEqual(tree)
  })

  it('should apply function to all nodes at root level', () => {
    const tree = createTree([createItem('1'), createItem('2')])

    const result = recursiveTreeMap(tree, (node) => ({
      ...node,
      name: node.name.toUpperCase(),
    }))

    const [root] = result
    const [item1, item2] = root.children

    expect(item1.name).toBe('ITEM 1')
    expect(item2.name).toBe('ITEM 2')
  })

  it('should apply function recursively to nested nodes', () => {
    const tree = createTree([
      createBranch('f1', [createItem('1'), createItem('2')]),
      createItem('3'),
    ])

    const result = recursiveTreeMap(tree, (node) => ({
      ...node,
      name: `modified-${node.name}`,
    }))

    const [root] = result
    const [branch1, item3] = root.children

    expect(branch1.name).toBe('modified-Branch f1')
    expect((branch1 as BranchNode).children[0].name).toBe('modified-Item 1')
    expect((branch1 as BranchNode).children[1].name).toBe('modified-Item 2')
    expect(item3.name).toBe('modified-Item 3')
  })

  it('should handle deeply nested structures', () => {
    const tree = createTree([
      createBranch('f1', [createBranch('f2', [createBranch('f3', [createItem('deep')])])]),
    ])

    const visitedIds: string[] = []

    recursiveTreeMap(tree, (node) => {
      visitedIds.push(node.id)

      return node
    })

    expect(visitedIds).toEqual(['f1', 'f2', 'f3', 'deep'])
  })
})

describe('editRecursive', () => {
  it('should edit a node at root level', () => {
    const tree = createTree([createItem('1'), createItem('2')])

    const result = editRecursive(tree, { id: '1', name: 'Updated Item' })
    const [root] = result
    const [item1, item2] = root.children

    expect(item1.name).toBe('Updated Item')
    expect(item2.name).toBe('Item 2')
  })

  it('should edit a nested node', () => {
    const tree = createTree([createBranch('f1', [createItem('1'), createItem('2')])])

    const result = editRecursive(tree, { id: '2', name: 'Updated Nested' })
    const [root] = result
    const [branch] = root.children

    expect((branch as BranchNode).children[1].name).toBe('Updated Nested')
  })

  it('should merge properties when editing', () => {
    const treeNode: TreeNode<{ customProp: string }> = {
      id: '1',
      name: 'Item',
      customProp: 'original',
    }

    const tree = createTree([treeNode])

    const updatedNode = {
      ...treeNode,
      name: 'Updated',
      customProp: 'modified',
    }

    const result = editRecursive(tree, updatedNode)

    const [root] = result
    const [item] = root.children

    expect(item).toMatchObject({
      id: '1',
      name: 'Updated',
      customProp: 'modified',
    })
  })

  it('should not modify tree if node id not found', () => {
    const tree = createTree([createItem('1')])

    const result = editRecursive(tree, { id: 'nonexistent', name: 'Updated' })

    const [root] = result
    const [item] = root.children

    expect(item.name).toBe('Item 1')
  })
})

describe('indexNodeParents', () => {
  it('should return empty object for tree with no children', () => {
    const tree = createTree()

    const result = indexNodeParents(tree)

    expect(result).toEqual({})
  })

  it('should index root level children with root as parent', () => {
    const tree = createTree([createItem('1'), createItem('2')])

    const result = indexNodeParents(tree)

    expect(result['1'].id).toBe(ROOT_NODE.id)
    expect(result['2'].id).toBe(ROOT_NODE.id)
  })

  it('should index nested children with their direct parent', () => {
    const branch = createBranch('f1', [createItem('1'), createItem('2')])
    const tree = createTree([branch])

    const result = indexNodeParents(tree)

    expect(result['f1'].id).toBe(ROOT_NODE.id)
    expect(result['1'].id).toBe('f1')
    expect(result['2'].id).toBe('f1')
  })

  it('should handle deeply nested structures', () => {
    const tree = createTree([createBranch('f1', [createBranch('f2', [createItem('deep')])])])

    const result = indexNodeParents(tree)

    expect(result['f1'].id).toBe(ROOT_NODE.id)
    expect(result['f2'].id).toBe('f1')
    expect(result['deep'].id).toBe('f2')
  })
})

describe('createNodeIndex', () => {
  it('should return empty object for tree with no children', () => {
    const tree = createTree()

    const result = createNodeIndex(tree)

    expect(result).toEqual({})
  })

  it('should index nodes with their parent and sibling index', () => {
    const tree = createTree([createItem('1'), createItem('2'), createItem('3')])

    const result = createNodeIndex(tree)

    expect(result['1'].siblingIndex).toBe(0)
    expect(result['2'].siblingIndex).toBe(1)
    expect(result['3'].siblingIndex).toBe(2)
    expect(result['1'].parent.id).toBe(ROOT_NODE.id)
  })

  it('should include the node reference', () => {
    const item = createItem('1')
    const tree = createTree([item])

    const result = createNodeIndex(tree)

    expect(result['1'].node.id).toBe('1')
    expect(result['1'].node.name).toBe('Item 1')
  })

  it('should index nested nodes correctly', () => {
    const tree = createTree([
      createBranch('f1', [createItem('a'), createItem('b')]),
      createItem('c'),
    ])

    const result = createNodeIndex(tree)

    expect(result['f1'].siblingIndex).toBe(0)
    expect(result['f1'].parent.id).toBe(ROOT_NODE.id)

    expect(result['a'].siblingIndex).toBe(0)
    expect(result['a'].parent.id).toBe('f1')

    expect(result['b'].siblingIndex).toBe(1)
    expect(result['b'].parent.id).toBe('f1')

    expect(result['c'].siblingIndex).toBe(1)
    expect(result['c'].parent.id).toBe(ROOT_NODE.id)
  })
})
