import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FolderNode, TreeNode as TreeNodeType } from '../../types/tree'
import { LazyTreeViewContext, type LazyTreeViewContextData } from '../context/LazyTreeViewContext'
import TreeNode from './TreeNode'

// Mock components
const MockFolder = vi.fn(({ id, name }: { id: string; name: string }) => (
  <div data-testid={`folder-${id}`}>{name}</div>
))

const MockItem = vi.fn(({ id, name }: { id: string; name: string }) => (
  <div data-testid={`item-${id}`}>{name}</div>
))

const defaultContextValue: LazyTreeViewContextData = {
  nodeParents: {},
  draggingNode: null,
  hoveredNodeId: null,
  focusedNodeId: null,
  setDraggingNode: vi.fn(),
  setHoveredNodeId: vi.fn(),
  setFocusedNodeId: vi.fn(),
}

const defaultProps = {
  folder: MockFolder,
  item: MockItem,
  folderProps: {},
  itemProps: {},
  allowDragAndDrop: false,
  useDragHandle: false,
  dragClassNames: {},
  disableAnimations: true,
  animationDuration: 0,
  onToggleOpen: vi.fn(),
  canDrop: () => true,
  onDrop: vi.fn(),
}

const renderWithContext = (
  ui: React.ReactElement,
  contextValue: LazyTreeViewContextData = defaultContextValue,
) => {
  return render(
    <LazyTreeViewContext.Provider value={contextValue}>{ui}</LazyTreeViewContext.Provider>,
  )
}

const createItem = (id: string, name: string): TreeNodeType => ({ id, name })

const createFolder = (id: string, name: string, children: TreeNodeType[] = []): FolderNode => ({
  id,
  name,
  children,
})

describe('TreeNode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering items', () => {
    it('should render an item node', () => {
      const item = createItem('item-1', 'Test Item')

      renderWithContext(<TreeNode {...defaultProps} node={item} depth={0} />)

      expect(screen.getByTestId('item-item-1')).toBeInTheDocument()
      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })

    it('should pass correct props to Item component', () => {
      const item = createItem('item-1', 'Test Item')

      renderWithContext(<TreeNode {...defaultProps} node={item} depth={2} />)

      expect(MockItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'item-1',
          name: 'Test Item',
          depth: 2,
        }),
        expect.anything(),
      )
    })
  })

  describe('rendering folders', () => {
    it('should render a folder node', () => {
      const folder = createFolder('folder-1', 'Test Folder')

      renderWithContext(<TreeNode {...defaultProps} node={folder} depth={0} />)

      expect(screen.getByTestId('folder-folder-1')).toBeInTheDocument()
      expect(screen.getByText('Test Folder')).toBeInTheDocument()
    })

    it('should pass correct props to Folder component', () => {
      const folder = createFolder('folder-1', 'Test Folder')

      renderWithContext(<TreeNode {...defaultProps} node={folder} depth={1} />)

      expect(MockFolder).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'folder-1',
          name: 'Test Folder',
          depth: 1,
          isOpen: false,
          isLoading: false,
        }),
        expect.anything(),
      )
    })
  })

  describe('accessibility attributes', () => {
    it('should have role="treeitem"', () => {
      const item = createItem('item-1', 'Test')

      renderWithContext(<TreeNode {...defaultProps} node={item} depth={0} />)

      expect(screen.getByRole('treeitem')).toBeInTheDocument()
    })

    it('should set aria-level based on depth', () => {
      const item = createItem('item-1', 'Test')

      renderWithContext(<TreeNode {...defaultProps} node={item} depth={2} />)

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-level', '3')
    })

    it('should set aria-expanded for folders', () => {
      const folder = createFolder('folder-1', 'Test Folder')

      renderWithContext(<TreeNode {...defaultProps} node={folder} depth={0} />)

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-expanded', 'false')
    })

    it('should set aria-expanded="true" when folder is open', () => {
      const folder: FolderNode = { ...createFolder('folder-1', 'Test Folder'), isOpen: true }

      renderWithContext(<TreeNode {...defaultProps} node={folder} depth={0} />)

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-expanded', 'true')
    })

    it('should not have aria-expanded for items', () => {
      const item = createItem('item-1', 'Test')

      renderWithContext(<TreeNode {...defaultProps} node={item} depth={0} />)

      expect(screen.getByRole('treeitem')).not.toHaveAttribute('aria-expanded')
    })
  })

  describe('data attributes', () => {
    it('should set data-type="item" for items', () => {
      const item = createItem('item-1', 'Test')

      renderWithContext(<TreeNode {...defaultProps} node={item} depth={0} />)

      expect(screen.getByTestId('item-1')).toHaveAttribute('data-type', 'item')
    })

    it('should set data-type="folder" for folders', () => {
      const folder = createFolder('folder-1', 'Test Folder')

      renderWithContext(<TreeNode {...defaultProps} node={folder} depth={0} />)

      expect(screen.getByTestId('folder-1')).toHaveAttribute('data-type', 'folder')
    })
  })

  describe('focus behavior', () => {
    it('should set tabIndex="-1" when not focused', () => {
      const item = createItem('item-1', 'Test')

      renderWithContext(<TreeNode {...defaultProps} node={item} depth={0} />)

      expect(screen.getByRole('treeitem')).toHaveAttribute('tabindex', '-1')
    })

    it('should set tabIndex="0" when focused', () => {
      const item = createItem('item-1', 'Test')
      const contextValue = { ...defaultContextValue, focusedNodeId: 'item-1' }

      renderWithContext(<TreeNode {...defaultProps} node={item} depth={0} />, contextValue)

      expect(screen.getByRole('treeitem')).toHaveAttribute('tabindex', '0')
    })

    it('should call setFocusedNodeId when clicked', async () => {
      const setFocusedNodeId = vi.fn()
      const item = createItem('item-1', 'Test')
      const contextValue = { ...defaultContextValue, setFocusedNodeId }

      renderWithContext(<TreeNode {...defaultProps} node={item} depth={0} />, contextValue)

      await userEvent.click(screen.getByRole('treeitem'))

      expect(setFocusedNodeId).toHaveBeenCalledWith('item-1')
    })
  })
})
