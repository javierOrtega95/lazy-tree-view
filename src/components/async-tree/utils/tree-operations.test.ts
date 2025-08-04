import { type DragEvent } from 'react'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { ROOT_NODE } from '../constants'
import { DropPosition, type FolderNode, type TreeNode } from '../types'
import {
  calculateDragPosition,
  moveNode,
  normalizeNewParent,
  parseNodeData,
} from './tree-operations'

describe('tree-operations utilities', () => {
  describe('moveNode', () => {
    const firstChild: FolderNode = {
      id: crypto.randomUUID(),
      name: 'Folder 2',
      children: [],
    }

    const secondChild: TreeNode = {
      id: crypto.randomUUID(),
      name: 'Item 1',
    }

    const parentNode: FolderNode = {
      id: crypto.randomUUID(),
      name: 'Folder 1',
      children: [firstChild, secondChild],
    }

    const mockTree: TreeNode[] = [
      {
        ...ROOT_NODE,
        children: [parentNode],
      },
    ]

    describe('when moving nodes within the same parent', () => {
      it('should not modify the tree when source or target nodes are missing', () => {
        const source = {
          id: 'sourceId',
          name: 'Folder',
          children: [],
        }
        const target = {
          id: 'targetId',
          name: 'Item',
        }

        const moveData = {
          tree: mockTree,
          source,
          target,
          position: DropPosition.Before,
          prevParent: parentNode,
          nextParent: parentNode,
        }

        const result = moveNode(moveData)

        expect(result).toEqual(mockTree)
      })

      it('should move source before target', () => {
        const result = moveNode({
          tree: mockTree,
          source: secondChild,
          position: DropPosition.Before,
          target: firstChild,
          prevParent: parentNode,
          nextParent: parentNode,
        })

        const { children: rootChildren } = result[0] as FolderNode
        const { children } = rootChildren[0] as FolderNode

        expect(children[0]).toEqual(secondChild)
        expect(children[1]).toEqual(firstChild)
      })

      it('should move source after target', () => {
        const result = moveNode({
          tree: mockTree,
          source: firstChild,
          position: DropPosition.After,
          target: secondChild,
          prevParent: parentNode,
          nextParent: parentNode,
        })

        const { children: rootChildren } = result[0] as FolderNode
        const { children } = rootChildren[0] as FolderNode

        expect(children[0]).toEqual(secondChild)
        expect(children[1]).toEqual(firstChild)
      })
    })

    describe('when moving nodes between different parents', () => {
      it('should move source into a folder when dropped inside', () => {
        const moveData = {
          tree: mockTree,
          source: secondChild,
          position: DropPosition.Inside,
          target: firstChild,
          prevParent: parentNode,
          nextParent: firstChild, // target is a folder
        }

        const result = moveNode(moveData)

        const { children: rootChildren } = result[0] as FolderNode

        const parentFolder = rootChildren[0] as FolderNode
        const targetFolder = parentFolder.children[0] as FolderNode

        // verify that the source has been moved inside the target folder
        expect(parentFolder.children).not.toContain(secondChild)
        expect(targetFolder.children).toEqual([secondChild])
      })

      it('should move source before a target', () => {
        const nextParent = mockTree[0] as FolderNode

        const moveData = {
          tree: mockTree,
          source: firstChild,
          position: DropPosition.Before,
          target: parentNode,
          prevParent: parentNode,
          nextParent,
        }

        const result = moveNode(moveData)
        const { children: rootChildren } = result[0] as FolderNode

        const updatedParentNode = { ...parentNode, children: [secondChild] }
        const updatedTarget = rootChildren[1] as FolderNode

        expect(rootChildren[0]).toEqual(firstChild)
        expect(updatedTarget).toEqual(updatedParentNode)
        expect(updatedTarget.children).not.toContain(firstChild)
      })

      it('should move source after a target', () => {
        const nextParent = mockTree[0] as FolderNode

        const moveData = {
          tree: mockTree,
          source: firstChild,
          position: DropPosition.After,
          target: parentNode,
          prevParent: parentNode,
          nextParent,
        }

        const result = moveNode(moveData)

        const { children: rootChildren } = result[0] as FolderNode
        const updatedParentNode = { ...parentNode, children: [secondChild] }
        const updatedTarget = rootChildren[1] as FolderNode

        expect(rootChildren[0]).toEqual(updatedParentNode)
        expect(updatedTarget).toEqual(firstChild)
        expect(updatedTarget.children).not.toContain(firstChild)
      })
    })
  })

  describe('calculateDragPosition', () => {
    const defaultEvent: DragEvent = {
      currentTarget: { offsetHeight: 100 },
      nativeEvent: { offsetY: 50 },
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { dropEffect: '' },
    } as unknown as DragEvent

    describe('when node is a folder', () => {
      it('should return DropPosition.Before when offsetY is less than beforeThreshold', () => {
        const event = {
          ...defaultEvent,
          nativeEvent: { offsetY: 10 },
          currentTarget: { offsetHeight: 100 },
        } as unknown as DragEvent

        const result = calculateDragPosition(event, true)

        expect(result).toBe(DropPosition.Before)
      })

      it('should return DropPosition.After when offsetY is greater than afterThreshold', () => {
        const event = {
          ...defaultEvent,
          nativeEvent: { offsetY: 110 },
          currentTarget: { offsetHeight: 100 },
        } as unknown as DragEvent

        const result = calculateDragPosition(event, true)

        expect(result).toBe(DropPosition.After)
      })

      it('should return DropPosition.Inside when offsetY is between before and after thresholds', () => {
        const event = {
          ...defaultEvent,
          nativeEvent: { offsetY: 50 },
          currentTarget: { offsetHeight: 100 },
        } as unknown as DragEvent

        const result = calculateDragPosition(event, true)

        expect(result).toBe(DropPosition.Inside)
      })
    })

    describe('when node is an item', () => {
      it('should return DropPosition.Before when offsetY is less than midThreshold', () => {
        const event = {
          ...defaultEvent,
          nativeEvent: { offsetY: 10 },
          currentTarget: { offsetHeight: 100 },
        } as unknown as DragEvent

        const result = calculateDragPosition(event, false)

        expect(result).toBe(DropPosition.Before)
      })

      it('should return DropPosition.After when offsetY is greater than midThreshold', () => {
        const event = {
          ...defaultEvent,
          nativeEvent: { offsetY: 60 },
          currentTarget: { offsetHeight: 100 },
        } as unknown as DragEvent

        const result = calculateDragPosition(event, false)

        expect(result).toBe(DropPosition.After)
      })
    })
  })

  describe('parseNodeData', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterAll(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should parse valid JSON string and return TreeNode', () => {
      const validData = '{"id": 1, "name": "Node 1"}'
      const result = parseNodeData(validData)

      expect(result).toEqual({
        id: 1,
        name: 'Node 1',
      })
    })

    it('should return null for invalid JSON string', () => {
      const invalidData = '{"id": 1, "name": "Node 1"'
      const result = parseNodeData(invalidData)

      expect(result).toBeNull()
    })

    it('should return null for an empty string', () => {
      const emptyData = ''
      const result = parseNodeData(emptyData)

      expect(result).toBeNull()
    })

    it('should return null for a non-JSON string', () => {
      const nonJsonData = 'Hello, world!'
      const result = parseNodeData(nonJsonData)

      expect(result).toBeNull()
    })
  })

  describe('normalizeNewParent', () => {
    it('should return null if newParent is ROOT_NODE', () => {
      expect(normalizeNewParent(ROOT_NODE)).toBeNull()
    })

    it('should return newParent if it is not ROOT_NODE', () => {
      const newParent = { id: 'some-id' } as FolderNode
      expect(normalizeNewParent(newParent)).toBe(newParent)
    })

    it('should return null if newParent is null', () => {
      expect(normalizeNewParent(null)).toBeNull()
    })
  })
})
