import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFolder, createItem } from '../test/test-utils'
import LazyTreeView from './LazyTreeView'

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

    it('should render folders', () => {
      const tree = [createFolder('folder-1', [], { name: 'Folder 1' })]

      render(<LazyTreeView initialTree={tree} loadChildren={mockLoadChildren} />)

      expect(screen.getByText('Folder 1')).toBeInTheDocument()
    })

    it('should render nested structure when folder is open', () => {
      const tree = [
        createFolder('folder-1', [createItem('item-1', 'Child Item')], {
          name: 'Parent Folder',
          isOpen: true,
          hasFetched: true,
        }),
      ]

      render(<LazyTreeView initialTree={tree} loadChildren={mockLoadChildren} />)

      expect(screen.getByText('Parent Folder')).toBeInTheDocument()
      expect(screen.getByText('Child Item')).toBeInTheDocument()
    })

    it('should not render children when folder is closed', () => {
      const tree = [
        createFolder('folder-1', [createItem('item-1', 'Child Item')], {
          name: 'Parent Folder',
          isOpen: false,
          hasFetched: true,
        }),
      ]

      render(<LazyTreeView initialTree={tree} loadChildren={mockLoadChildren} />)

      expect(screen.getByText('Parent Folder')).toBeInTheDocument()
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
    it('should call loadChildren when opening a folder without fetched children', async () => {
      const loadChildren = vi.fn(() => Promise.resolve([createItem('child-1', 'Child')]))
      const tree = [createFolder('folder-1', [], { name: 'Folder' })]

      render(<LazyTreeView initialTree={tree} loadChildren={loadChildren} />)

      await userEvent.click(screen.getByText('Folder'))

      await waitFor(() => {
        expect(loadChildren).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'folder-1', name: 'Folder' }),
        )
      })
    })

    it('should call onLoadStart when starting to load', async () => {
      const onLoadStart = vi.fn()
      const loadChildren = vi.fn(() => Promise.resolve([]))
      const tree = [createFolder('folder-1', [], { name: 'Folder' })]

      render(
        <LazyTreeView initialTree={tree} loadChildren={loadChildren} onLoadStart={onLoadStart} />,
      )

      await userEvent.click(screen.getByText('Folder'))

      await waitFor(() => {
        expect(onLoadStart).toHaveBeenCalled()
      })
    })

    it('should call onLoadSuccess after successful load', async () => {
      const children = [createItem('child-1', 'Child')]
      const onLoadSuccess = vi.fn()
      const loadChildren = vi.fn(() => Promise.resolve(children))
      const tree = [createFolder('folder-1', [], { name: 'Folder' })]

      render(
        <LazyTreeView
          initialTree={tree}
          loadChildren={loadChildren}
          onLoadSuccess={onLoadSuccess}
        />,
      )

      await userEvent.click(screen.getByText('Folder'))

      await waitFor(() => {
        expect(onLoadSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'folder-1' }),
          children,
        )
      })
    })

    it('should call onLoadError when load fails', async () => {
      const error = new Error('Load failed')
      const onLoadError = vi.fn()
      const loadChildren = vi.fn(() => Promise.reject(error))
      const tree = [createFolder('folder-1', [], { name: 'Folder' })]

      render(
        <LazyTreeView initialTree={tree} loadChildren={loadChildren} onLoadError={onLoadError} />,
      )

      await userEvent.click(screen.getByText('Folder'))

      await waitFor(() => {
        expect(onLoadError).toHaveBeenCalledWith(expect.objectContaining({ id: 'folder-1' }), error)
      })
    })

    it('should render loaded children after successful load', async () => {
      const loadChildren = vi.fn(() => Promise.resolve([createItem('child-1', 'Loaded Child')]))
      const tree = [createFolder('folder-1', [], { name: 'Folder' })]

      render(<LazyTreeView initialTree={tree} loadChildren={loadChildren} />)

      await userEvent.click(screen.getByText('Folder'))

      await waitFor(() => {
        expect(screen.getByText('Loaded Child')).toBeInTheDocument()
      })
    })
  })

  describe('toggle folder', () => {
    it('should close an open folder when clicked', async () => {
      const tree = [
        createFolder('folder-1', [createItem('item-1', 'Child')], {
          name: 'Folder',
          isOpen: true,
          hasFetched: true,
        }),
      ]

      render(<LazyTreeView initialTree={tree} loadChildren={mockLoadChildren} />)

      expect(screen.getByText('Child')).toBeInTheDocument()

      await userEvent.click(screen.getByText('Folder'))

      await waitFor(() => {
        expect(screen.queryByText('Child')).not.toBeInTheDocument()
      })
    })

    it('should not call loadChildren when opening already fetched folder', async () => {
      const loadChildren = vi.fn(() => Promise.resolve([]))
      const tree = [
        createFolder('folder-1', [createItem('item-1', 'Child')], {
          name: 'Folder',
          isOpen: false,
          hasFetched: true,
        }),
      ]

      render(<LazyTreeView initialTree={tree} loadChildren={loadChildren} />)

      await userEvent.click(screen.getByText('Folder'))

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
      const tree = [createFolder('folder-1', [], { name: 'Folder' })]

      render(
        <LazyTreeView initialTree={tree} loadChildren={loadChildren} onTreeChange={onTreeChange} />,
      )

      await userEvent.click(screen.getByText('Folder'))

      await waitFor(() => {
        expect(onTreeChange).toHaveBeenCalled()
      })
    })
  })
})
