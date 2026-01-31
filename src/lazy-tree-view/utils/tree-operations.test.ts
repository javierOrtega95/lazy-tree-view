import { describe, it, expect } from 'vitest'
import {
  calculateIndentation,
  calculateMoveIndices,
  moveNode,
  normalizeNewParent,
} from './tree-operations'
import { DropPosition } from '../../types/dnd'
import type { FolderNode } from '../../types/tree'
import { ROOT_NODE } from '../constants'
import { createTree, createFolder, createItem } from '../../test/test-utils'

describe('calculateIndentation', () => {
  it('should return 0 for depth 0', () => {
    expect(calculateIndentation(0)).toBe(0)
  })

  it('should return 20 for depth 1', () => {
    expect(calculateIndentation(1)).toBe(20)
  })

  it('should use logarithmic progression', () => {
    const depth2 = calculateIndentation(2)
    const depth3 = calculateIndentation(3)
    const depth4 = calculateIndentation(4)

    // Logarithmic: each increment should be smaller than the previous
    const increment2to3 = depth3 - depth2
    const increment3to4 = depth4 - depth3

    expect(increment3to4).toBeLessThan(increment2to3)
  })

  it('should return expected values for common depths', () => {
    // depth=0→0px, depth=1→20px, depth=2→~31.7px, depth=3→40px, depth=4→~46.4px
    expect(calculateIndentation(0)).toBeCloseTo(0, 1)
    expect(calculateIndentation(1)).toBeCloseTo(20, 1)
    expect(calculateIndentation(2)).toBeCloseTo(31.7, 0)
    expect(calculateIndentation(3)).toBeCloseTo(40, 1)
    expect(calculateIndentation(4)).toBeCloseTo(46.4, 0)
  })
})

describe('normalizeNewParent', () => {
  it('should return null when parent is ROOT_NODE', () => {
    const result = normalizeNewParent(ROOT_NODE)

    expect(result).toBeNull()
  })

  it('should return the parent when it is not ROOT_NODE', () => {
    const folder = createFolder('f1')

    const result = normalizeNewParent(folder)

    expect(result).toBe(folder)
  })
})

describe('calculateMoveIndices', () => {
  describe('dropping inside a folder', () => {
    it('should return nextIndex as folder children length', () => {
      const source = createItem('1')
      const target = createFolder('f1', [createItem('a'), createItem('b')])
      const prevParent = createFolder('prev', [source])
      const nextParent = target

      const result = calculateMoveIndices({
        source,
        target,
        position: DropPosition.Inside,
        prevParent,
        nextParent,
      })

      expect(result.prevIndex).toBe(0)
      expect(result.nextIndex).toBe(2) // folder has 2 children
    })
  })

  describe('same container reordering', () => {
    it('should calculate correct indices when moving before a later sibling', () => {
      const item1 = createItem('1')
      const item2 = createItem('2')
      const item3 = createItem('3')
      const parent = createFolder('parent', [item1, item2, item3])

      const result = calculateMoveIndices({
        source: item1,
        target: item3,
        position: DropPosition.Before,
        prevParent: parent,
        nextParent: parent,
      })

      expect(result.prevIndex).toBe(0)
      expect(result.nextIndex).toBe(1) // After removing item1, item3 is at index 1
    })

    it('should calculate correct indices when moving after a later sibling', () => {
      const item1 = createItem('1')
      const item2 = createItem('2')
      const item3 = createItem('3')
      const parent = createFolder('parent', [item1, item2, item3])

      const result = calculateMoveIndices({
        source: item1,
        target: item3,
        position: DropPosition.After,
        prevParent: parent,
        nextParent: parent,
      })

      expect(result.prevIndex).toBe(0)
      expect(result.nextIndex).toBe(2) // After removing item1, insert after item3 (now at index 1)
    })

    it('should calculate correct indices when moving before an earlier sibling', () => {
      const item1 = createItem('1')
      const item2 = createItem('2')
      const item3 = createItem('3')
      const parent = createFolder('parent', [item1, item2, item3])

      const result = calculateMoveIndices({
        source: item3,
        target: item1,
        position: DropPosition.Before,
        prevParent: parent,
        nextParent: parent,
      })

      expect(result.prevIndex).toBe(2)
      expect(result.nextIndex).toBe(0)
    })
  })

  describe('different container', () => {
    it('should calculate correct indices when moving to different parent before target', () => {
      const source = createItem('1')
      const target = createItem('a')
      const prevParent = createFolder('prev', [source])
      const nextParent = createFolder('next', [target, createItem('b')])

      const result = calculateMoveIndices({
        source,
        target,
        position: DropPosition.Before,
        prevParent,
        nextParent,
      })

      expect(result.prevIndex).toBe(0)
      expect(result.nextIndex).toBe(0)
    })

    it('should calculate correct indices when moving to different parent after target', () => {
      const source = createItem('1')
      const target = createItem('a')
      const prevParent = createFolder('prev', [source])
      const nextParent = createFolder('next', [target, createItem('b')])

      const result = calculateMoveIndices({
        source,
        target,
        position: DropPosition.After,
        prevParent,
        nextParent,
      })

      expect(result.prevIndex).toBe(0)
      expect(result.nextIndex).toBe(1)
    })
  })
})

describe('moveNode', () => {
  describe('reordering within same container', () => {
    it('should reorder items at root level', () => {
      const item1 = createItem('1')
      const item2 = createItem('2')
      const item3 = createItem('3')
      const tree = createTree([item1, item2, item3])

      const result = moveNode(tree, {
        source: item1,
        target: item3,
        position: DropPosition.After,
        prevParent: ROOT_NODE,
        nextParent: ROOT_NODE,
        prevIndex: 0,
        nextIndex: 2,
      })

      const [root] = result
      expect(root.children.map((c) => c.id)).toEqual(['2', '3', '1'])
    })

    it('should reorder items within a folder', () => {
      const item1 = createItem('1')
      const item2 = createItem('2')
      const folder = createFolder('f1', [item1, item2])
      const tree = createTree([folder])

      const result = moveNode(tree, {
        source: item2,
        target: item1,
        position: DropPosition.Before,
        prevParent: folder,
        nextParent: folder,
        prevIndex: 1,
        nextIndex: 0,
      })

      const [root] = result
      const updatedFolder = root.children[0] as FolderNode
      expect(updatedFolder.children.map((c) => c.id)).toEqual(['2', '1'])
    })
  })

  describe('moving between containers', () => {
    it('should move item from root to folder (inside)', () => {
      const item1 = createItem('1')
      const folder = createFolder('f1', [])
      const tree = createTree([item1, folder])

      const result = moveNode(tree, {
        source: item1,
        target: folder,
        position: DropPosition.Inside,
        prevParent: ROOT_NODE,
        nextParent: folder,
        prevIndex: 0,
        nextIndex: 0,
      })

      const [root] = result

      expect(root.children.length).toBe(1)
      expect(root.children[0].id).toBe('f1')

      const updatedFolder = root.children[0] as FolderNode
      expect(updatedFolder.children.length).toBe(1)
      expect(updatedFolder.children[0].id).toBe('1')
    })

    it('should move item from folder to root', () => {
      const item1 = createItem('1')
      const item2 = createItem('2')
      const folder = createFolder('f1', [item1])
      const tree = createTree([folder, item2])

      const result = moveNode(tree, {
        source: item1,
        target: item2,
        position: DropPosition.Before,
        prevParent: folder,
        nextParent: ROOT_NODE,
        prevIndex: 0,
        nextIndex: 1,
      })

      const [root] = result
      expect(root.children.map((c) => c.id)).toEqual(['f1', '1', '2'])
    })

    it('should move item between folders', () => {
      const item1 = createItem('1')
      const item2 = createItem('2')
      const folder1 = createFolder('f1', [item1])
      const folder2 = createFolder('f2', [item2])
      const tree = createTree([folder1, folder2])

      const result = moveNode(tree, {
        source: item1,
        target: folder2,
        position: DropPosition.Inside,
        prevParent: folder1,
        nextParent: folder2,
        prevIndex: 0,
        nextIndex: 1,
      })

      const [root] = result
      const updatedFolder1 = root.children[0] as FolderNode
      const updatedFolder2 = root.children[1] as FolderNode

      expect(updatedFolder1.children.length).toBe(0)
      expect(updatedFolder2.children.map((c) => c.id)).toEqual(['2', '1'])
    })
  })

  describe('moving folders', () => {
    it('should move a folder with its children', () => {
      const item1 = createItem('1')
      const folder = createFolder('f1', [item1])
      const item2 = createItem('2')
      const tree = createTree([folder, item2])

      const result = moveNode(tree, {
        source: folder,
        target: item2,
        position: DropPosition.After,
        prevParent: ROOT_NODE,
        nextParent: ROOT_NODE,
        prevIndex: 0,
        nextIndex: 1,
      })

      const [root] = result
      expect(root.children.map((c) => c.id)).toEqual(['2', 'f1'])

      const movedFolder = root.children[1] as FolderNode
      expect(movedFolder.children.length).toBe(1)
      expect(movedFolder.children[0].id).toBe('1')
    })
  })
})
