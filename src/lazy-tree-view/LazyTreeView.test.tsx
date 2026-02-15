import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DropPosition } from '../types/dnd'
import { createBranch, createItem } from '../test/test-utils'
import LazyTreeView from './LazyTreeView'
import type { LazyTreeViewHandle } from './types'

const mockLoadChildren = vi.fn(() => Promise.resolve([]))

describe('LazyTreeView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render an empty tree', () => {
      render(<LazyTreeView initialTree={[]} loadChildren={mockLoadChildren} />)

      expect(screen.getByRole('tree')).toBeInTheDocument()
    })

    it('should render items', () => {
      const tree = [createItem('item-1', 'Item 1'), createItem('item-2', 'Item 2')]

      render(<LazyTreeView initialTree={tree} loadChildren={mockLoadChildren} />)

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('should render branches', () => {
      const tree = [createBranch('branch-1', [], { name: 'Branch 1' })]

      render(<LazyTreeView initialTree={tree} loadChildren={mockLoadChildren} />)

      expect(screen.getByText('Branch 1')).toBeInTheDocument()
    })

    it('should render nested structure when branch is open', () => {
      const tree = [
        createBranch('branch-1', [createItem('item-1', 'Child Item')], {
          name: 'Parent Branch',
          isOpen: true,
          hasFetched: true,
        }),
      ]

      render(<LazyTreeView initialTree={tree} loadChildren={mockLoadChildren} />)

      expect(screen.getByText('Parent Branch')).toBeInTheDocument()
      expect(screen.getByText('Child Item')).toBeInTheDocument()
    })

    it('should not render children when branch is closed', () => {
      const tree = [
        createBranch('branch-1', [createItem('item-1', 'Child Item')], {
          name: 'Parent Branch',
          isOpen: false,
          hasFetched: true,
        }),
      ]

      render(<LazyTreeView initialTree={tree} loadChildren={mockLoadChildren} />)

      expect(screen.getByText('Parent Branch')).toBeInTheDocument()
      expect(screen.queryByText('Child Item')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have role="tree"', () => {
      render(<LazyTreeView initialTree={[]} loadChildren={mockLoadChildren} />)

      expect(screen.getByRole('tree')).toBeInTheDocument()
    })

    it('should have aria-label', () => {
      render(<LazyTreeView initialTree={[]} loadChildren={mockLoadChildren} />)

      expect(screen.getByRole('tree')).toHaveAttribute('aria-label', 'Tree view')
    })

    it('should be focusable', () => {
      render(<LazyTreeView initialTree={[]} loadChildren={mockLoadChildren} />)

      expect(screen.getByRole('tree')).toHaveAttribute('tabindex', '0')
    })
  })

  describe('styling props', () => {
    it('should apply custom className', () => {
      render(
        <LazyTreeView initialTree={[]} loadChildren={mockLoadChildren} className='custom-class' />,
      )

      expect(screen.getByRole('tree').className).toContain('custom-class')
    })

    it('should apply custom style', () => {
      render(
        <LazyTreeView
          initialTree={[]}
          loadChildren={mockLoadChildren}
          style={{ maxHeight: '500px' }}
        />,
      )

      expect(screen.getByRole('tree')).toHaveStyle({ maxHeight: '500px' })
    })
  })

  describe('lazy loading', () => {
    it('should call loadChildren when opening a branch without fetched children', async () => {
      const loadChildren = vi.fn(() => Promise.resolve([createItem('child-1', 'Child')]))
      const tree = [createBranch('branch-1', [], { name: 'Branch' })]

      render(<LazyTreeView initialTree={tree} loadChildren={loadChildren} />)

      await userEvent.click(screen.getByText('Branch'))

      await waitFor(() => {
        expect(loadChildren).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'branch-1', name: 'Branch' }),
        )
      })
    })

    it('should call onLoadStart when starting to load', async () => {
      const onLoadStart = vi.fn()
      const loadChildren = vi.fn(() => Promise.resolve([]))
      const tree = [createBranch('branch-1', [], { name: 'Branch' })]

      render(
        <LazyTreeView initialTree={tree} loadChildren={loadChildren} onLoadStart={onLoadStart} />,
      )

      await userEvent.click(screen.getByText('Branch'))

      await waitFor(() => {
        expect(onLoadStart).toHaveBeenCalled()
      })
    })

    it('should call onLoadSuccess after successful load', async () => {
      const children = [createItem('child-1', 'Child')]
      const onLoadSuccess = vi.fn()
      const loadChildren = vi.fn(() => Promise.resolve(children))
      const tree = [createBranch('branch-1', [], { name: 'Branch' })]

      render(
        <LazyTreeView
          initialTree={tree}
          loadChildren={loadChildren}
          onLoadSuccess={onLoadSuccess}
        />,
      )

      await userEvent.click(screen.getByText('Branch'))

      await waitFor(() => {
        expect(onLoadSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'branch-1' }),
          children,
        )
      })
    })

    it('should call onLoadError when load fails', async () => {
      const error = new Error('Load failed')
      const onLoadError = vi.fn()
      const loadChildren = vi.fn(() => Promise.reject(error))
      const tree = [createBranch('branch-1', [], { name: 'Branch' })]

      render(
        <LazyTreeView initialTree={tree} loadChildren={loadChildren} onLoadError={onLoadError} />,
      )

      await userEvent.click(screen.getByText('Branch'))

      await waitFor(() => {
        expect(onLoadError).toHaveBeenCalledWith(expect.objectContaining({ id: 'branch-1' }), error)
      })
    })

    it('should render loaded children after successful load', async () => {
      const loadChildren = vi.fn(() => Promise.resolve([createItem('child-1', 'Loaded Child')]))
      const tree = [createBranch('branch-1', [], { name: 'Branch' })]

      render(<LazyTreeView initialTree={tree} loadChildren={loadChildren} />)

      await userEvent.click(screen.getByText('Branch'))

      await waitFor(() => {
        expect(screen.getByText('Loaded Child')).toBeInTheDocument()
      })
    })
  })

  describe('toggle branch', () => {
    it('should close an open branch when clicked', async () => {
      const tree = [
        createBranch('branch-1', [createItem('item-1', 'Child')], {
          name: 'Branch',
          isOpen: true,
          hasFetched: true,
        }),
      ]

      render(<LazyTreeView initialTree={tree} loadChildren={mockLoadChildren} />)

      expect(screen.getByText('Child')).toBeInTheDocument()

      await userEvent.click(screen.getByText('Branch'))

      await waitFor(() => {
        expect(screen.queryByText('Child')).not.toBeInTheDocument()
      })
    })

    it('should not call loadChildren when opening already fetched branch', async () => {
      const loadChildren = vi.fn(() => Promise.resolve([]))
      const tree = [
        createBranch('branch-1', [createItem('item-1', 'Child')], {
          name: 'Branch',
          isOpen: false,
          hasFetched: true,
        }),
      ]

      render(<LazyTreeView initialTree={tree} loadChildren={loadChildren} />)

      await userEvent.click(screen.getByText('Branch'))

      await waitFor(() => {
        expect(screen.getByText('Child')).toBeInTheDocument()
      })

      expect(loadChildren).not.toHaveBeenCalled()
    })
  })

  describe('onTreeChange callback', () => {
    it('should call onTreeChange when tree structure changes', async () => {
      const onTreeChange = vi.fn()
      const loadChildren = vi.fn(() => Promise.resolve([createItem('child-1', 'Child')]))
      const tree = [createBranch('branch-1', [], { name: 'Branch' })]

      render(
        <LazyTreeView initialTree={tree} loadChildren={loadChildren} onTreeChange={onTreeChange} />,
      )

      await userEvent.click(screen.getByText('Branch'))

      await waitFor(() => {
        expect(onTreeChange).toHaveBeenCalled()
      })
    })
  })

  describe('imperative handle', () => {
    describe('addNode', () => {
      it('should add a node to a branch', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const tree = [
          createBranch('branch-1', [], { name: 'Branch', isOpen: true, hasFetched: true }),
        ]

        render(<LazyTreeView ref={ref} initialTree={tree} loadChildren={mockLoadChildren} />)

        act(() => {
          ref.current?.addNode('branch-1', createItem('new-item', 'New Item'))
        })

        expect(screen.getByText('New Item')).toBeInTheDocument()
      })

      it('should add a node to root level', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const tree = [createItem('item-1', 'Item 1')]

        render(<LazyTreeView ref={ref} initialTree={tree} loadChildren={mockLoadChildren} />)

        act(() => {
          ref.current?.addNode(null, createItem('new-item', 'New Item'))
        })

        expect(screen.getByText('New Item')).toBeInTheDocument()
      })
    })

    describe('removeNode', () => {
      it('should remove a node from the tree', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const tree = [createItem('item-1', 'Item 1'), createItem('item-2', 'Item 2')]

        render(<LazyTreeView ref={ref} initialTree={tree} loadChildren={mockLoadChildren} />)

        expect(screen.getByText('Item 1')).toBeInTheDocument()

        act(() => {
          ref.current?.removeNode('item-1')
        })

        expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()
      })

      it('should remove a node from a branch', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const tree = [
          createBranch('branch-1', [createItem('child-1', 'Child')], {
            name: 'Branch',
            isOpen: true,
            hasFetched: true,
          }),
        ]

        render(<LazyTreeView ref={ref} initialTree={tree} loadChildren={mockLoadChildren} />)

        expect(screen.getByText('Child')).toBeInTheDocument()

        act(() => {
          ref.current?.removeNode('child-1')
        })

        expect(screen.queryByText('Child')).not.toBeInTheDocument()
      })
    })

    describe('updateNode', () => {
      it('should update node properties', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const tree = [createItem('item-1', 'Original Name')]

        render(<LazyTreeView ref={ref} initialTree={tree} loadChildren={mockLoadChildren} />)

        expect(screen.getByText('Original Name')).toBeInTheDocument()

        act(() => {
          ref.current?.updateNode('item-1', { name: 'Updated Name' })
        })

        expect(screen.queryByText('Original Name')).not.toBeInTheDocument()
        expect(screen.getByText('Updated Name')).toBeInTheDocument()
      })
    })

    describe('moveNode', () => {
      it('should move a node to another position', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const onTreeChange = vi.fn()
        const tree = [
          createItem('item-1', 'Item 1'),
          createItem('item-2', 'Item 2'),
          createItem('item-3', 'Item 3'),
        ]

        render(
          <LazyTreeView
            ref={ref}
            initialTree={tree}
            loadChildren={mockLoadChildren}
            onTreeChange={onTreeChange}
          />,
        )

        act(() => {
          ref.current?.moveNode('item-3', 'item-1', DropPosition.Before)
        })

        expect(onTreeChange).toHaveBeenCalled()
        const newTree = onTreeChange.mock.calls[0][0]
        expect(newTree[0].id).toBe('item-3')
        expect(newTree[1].id).toBe('item-1')
        expect(newTree[2].id).toBe('item-2')
      })

      it('should move a node inside a branch', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const onTreeChange = vi.fn()
        const tree = [
          createBranch('branch-1', [], { name: 'Branch', isOpen: true, hasFetched: true }),
          createItem('item-1', 'Item 1'),
        ]

        render(
          <LazyTreeView
            ref={ref}
            initialTree={tree}
            loadChildren={mockLoadChildren}
            onTreeChange={onTreeChange}
          />,
        )

        act(() => {
          ref.current?.moveNode('item-1', 'branch-1', DropPosition.Inside)
        })

        expect(onTreeChange).toHaveBeenCalled()
        const newTree = onTreeChange.mock.calls[0][0]
        expect(newTree.length).toBe(1)
        expect(newTree[0].children[0].id).toBe('item-1')
      })

      it('should move a node from inside a branch to root level', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const onTreeChange = vi.fn()
        const tree = [
          createBranch('branch-1', [createItem('child-1', 'Child')], {
            name: 'Branch',
            isOpen: true,
            hasFetched: true,
          }),
        ]

        render(
          <LazyTreeView
            ref={ref}
            initialTree={tree}
            loadChildren={mockLoadChildren}
            onTreeChange={onTreeChange}
          />,
        )

        // Move child-1 after branch (to root level)
        act(() => {
          ref.current?.moveNode('child-1', 'branch-1', DropPosition.After)
        })

        expect(onTreeChange).toHaveBeenCalled()
        const newTree = onTreeChange.mock.calls[0][0]
        expect(newTree.length).toBe(2)
        expect(newTree[0].id).toBe('branch-1')
        expect(newTree[0].children.length).toBe(0)
        expect(newTree[1].id).toBe('child-1')
      })
    })

    describe('setTree', () => {
      it('should replace the entire tree', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const tree = [createItem('item-1', 'Item 1'), createItem('item-2', 'Item 2')]

        render(<LazyTreeView ref={ref} initialTree={tree} loadChildren={mockLoadChildren} />)

        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()

        act(() => {
          ref.current?.setTree([createItem('item-3', 'Item 3')])
        })

        expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Item 2')).not.toBeInTheDocument()
        expect(screen.getByText('Item 3')).toBeInTheDocument()
      })

      it('should call onTreeChange when tree is replaced', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const onTreeChange = vi.fn()
        const tree = [createItem('item-1', 'Item 1')]
        const newTree = [createItem('item-2', 'Item 2'), createItem('item-3', 'Item 3')]

        render(
          <LazyTreeView
            ref={ref}
            initialTree={tree}
            loadChildren={mockLoadChildren}
            onTreeChange={onTreeChange}
          />,
        )

        act(() => {
          ref.current?.setTree(newTree)
        })

        expect(onTreeChange).toHaveBeenCalledWith(newTree)
      })

      it('should replace tree with an empty array', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const tree = [createItem('item-1', 'Item 1')]

        render(<LazyTreeView ref={ref} initialTree={tree} loadChildren={mockLoadChildren} />)

        expect(screen.getByText('Item 1')).toBeInTheDocument()

        act(() => {
          ref.current?.setTree([])
        })

        expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
      })
    })

    describe('getTree', () => {
      it('should return current tree state', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const tree = [createItem('item-1', 'Item 1'), createItem('item-2', 'Item 2')]

        render(<LazyTreeView ref={ref} initialTree={tree} loadChildren={mockLoadChildren} />)

        const currentTree = ref.current?.getTree()

        expect(currentTree).toHaveLength(2)
        expect(currentTree?.[0].id).toBe('item-1')
        expect(currentTree?.[1].id).toBe('item-2')
      })

      it('should reflect changes after mutations', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const tree = [createItem('item-1', 'Item 1')]

        render(<LazyTreeView ref={ref} initialTree={tree} loadChildren={mockLoadChildren} />)

        act(() => {
          ref.current?.addNode(null, createItem('item-2', 'Item 2'))
        })

        const currentTree = ref.current?.getTree()

        expect(currentTree).toHaveLength(2)
      })
    })

    describe('getNode', () => {
      it('should return a node by id', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const tree = [createItem('item-1', 'Item 1'), createItem('item-2', 'Item 2')]

        render(<LazyTreeView ref={ref} initialTree={tree} loadChildren={mockLoadChildren} />)

        const node = ref.current?.getNode('item-1')

        expect(node?.id).toBe('item-1')
        expect(node?.name).toBe('Item 1')
      })

      it('should return undefined for non-existent node', () => {
        const ref = createRef<LazyTreeViewHandle>()
        const tree = [createItem('item-1', 'Item 1')]

        render(<LazyTreeView ref={ref} initialTree={tree} loadChildren={mockLoadChildren} />)

        const node = ref.current?.getNode('non-existent')

        expect(node).toBeUndefined()
      })
    })
  })
})
