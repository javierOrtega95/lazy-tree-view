import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BranchNode, TreeNode as TreeNodeType } from '../../types/tree'
import { LazyTreeViewContext, type LazyTreeViewContextData } from '../context/LazyTreeViewContext'
import TreeNode from './TreeNode'

// Mock components
const MockBranch = vi.fn(({ id, name }: { id: string; name: string }) => (
  <div data-testid={`branch-${id}`}>{name}</div>
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
  branch: MockBranch,
  item: MockItem,
  branchProps: {},
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

const createBranch = (id: string, name: string, children: TreeNodeType[] = []): BranchNode => ({
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

  describe('rendering branches', () => {
    it('should render a branch node', () => {
      const branch = createBranch('branch-1', 'Test Branch')

      renderWithContext(<TreeNode {...defaultProps} node={branch} depth={0} />)

      expect(screen.getByTestId('branch-branch-1')).toBeInTheDocument()
      expect(screen.getByText('Test Branch')).toBeInTheDocument()
    })

    it('should pass correct props to Branch component', () => {
      const branch = createBranch('branch-1', 'Test Branch')

      renderWithContext(<TreeNode {...defaultProps} node={branch} depth={1} />)

      expect(MockBranch).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'branch-1',
          name: 'Test Branch',
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

    it('should set aria-expanded for branches', () => {
      const branch = createBranch('branch-1', 'Test Branch')

      renderWithContext(<TreeNode {...defaultProps} node={branch} depth={0} />)

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-expanded', 'false')
    })

    it('should set aria-expanded="true" when branch is open', () => {
      const branch: BranchNode = { ...createBranch('branch-1', 'Test Branch'), isOpen: true }

      renderWithContext(<TreeNode {...defaultProps} node={branch} depth={0} />)

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

    it('should set data-type="branch" for branches', () => {
      const branch = createBranch('branch-1', 'Test Branch')

      renderWithContext(<TreeNode {...defaultProps} node={branch} depth={0} />)

      expect(screen.getByTestId('branch-1')).toHaveAttribute('data-type', 'branch')
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
