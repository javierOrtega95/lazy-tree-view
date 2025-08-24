import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { dragStartEvent } from '../../mocks/DnD'
import type { BaseNode, FolderNode } from '../../types/tree'
import { defaultDnDclassNames } from '../constants'
import { LazyTreeViewContext, LazyTreeViewContextData } from '../context/LazyTreeViewContext'
import type { TreeNodeDnDParams } from '../hooks/useTreeNodeDnD/types'
import TreeFolder from '../tree-folder/TreeFolder'
import TreeItem from '../tree-item/TreeItem'
import { type BaseNodeProps, type FolderProps, type TreeNodeProps } from '../types'
import TreeNode from './TreeNode'
import { DropPosition } from '../../types/dnd'

const mockHandleDragStart = vi.fn()
const mockHandleDragLeave = vi.fn()
const mockHandleDragOver = vi.fn()
const mockHandleDrop = vi.fn()

const defaultTreeNodeDnDdata: TreeNodeDnDParams = {
  isDropAllowed: true,
  handleDragStart: mockHandleDragStart,
  handleDragLeave: mockHandleDragLeave,
  handleDragOver: mockHandleDragOver,
  handleDrop: mockHandleDrop,
  dragPosition: null,
}

vi.mock('../hooks/useTreeNodeDnD/useTreeNodeDnD', () => ({
  default: () => ({ ...defaultTreeNodeDnDdata }),
}))

describe('TreeNode Component', () => {
  const mockFolderNode: FolderNode = {
    id: crypto.randomUUID(),
    name: 'Test Folder',
    children: [],
  }

  const mockItemNode: BaseNode = {
    id: crypto.randomUUID(),
    name: 'Test Folder',
  }

  const defaultProps: Omit<TreeNodeProps, 'node'> = {
    depth: 0,
    item: TreeItem,
    folder: TreeFolder,
    isOpen: false,
    isLoading: false,
    dragClassNames: defaultDnDclassNames,
    canDrop: vi.fn(),
    onToggleOpen: vi.fn(),
    onDrop: vi.fn(),
  }

  const renderWithContext = (
    ui: React.ReactElement,
    contextValue: LazyTreeViewContextData = { nodeParents: {} }
  ) => {
    return render(
      <LazyTreeViewContext.Provider value={contextValue}>{ui}</LazyTreeViewContext.Provider>
    )
  }

  describe('rendering', () => {
    it('should render a tree node correctly', () => {
      const folderProps = { ...defaultProps, node: mockFolderNode }

      const { node } = folderProps
      const id = `tree-node-${node.id}`

      renderWithContext(<TreeNode {...folderProps} />)

      const $treeNode = screen.getByTestId(id)

      expect($treeNode).toBeInTheDocument()
      expect($treeNode).toHaveRole('treeitem')
      expect($treeNode).toHaveAttribute('id', id)
      expect($treeNode).toHaveAttribute('draggable', 'true')
      expect($treeNode).toHaveClass('tree-node')
    })

    it('should render default folder node correctly', () => {
      const folderProps = { ...defaultProps, node: mockFolderNode }

      renderWithContext(<TreeNode {...folderProps} />)

      const $folderNode = screen.getByTestId(`tree-node-${mockFolderNode.id}`)
      expect($folderNode).toBeInTheDocument()
    })

    it('should render default item node correctly', () => {
      const itemProps = { ...defaultProps, node: mockItemNode }

      renderWithContext(<TreeNode {...itemProps} />)

      const $itemNode = screen.getByTestId(`tree-node-${mockItemNode.id}`)
      expect($itemNode).toBeInTheDocument()
    })

    it('should render a custom folder node correctly', () => {
      const CusmtomFolder = ({ node }: FolderProps) => {
        return <div data-testid={`custom-folder-${node.id}`}>Custom folder</div>
      }

      const props: TreeNodeProps = { ...defaultProps, node: mockFolderNode, folder: CusmtomFolder }

      renderWithContext(<TreeNode {...props} />)

      const $customFolder = screen.getByTestId(`custom-folder-${mockFolderNode.id}`)
      expect($customFolder).toBeInTheDocument()
    })

    it('should render a custom item node correctly', () => {
      const CusmtomItem = ({ node }: BaseNodeProps) => (
        <div data-testid={`custom-item-${node.id}`}>Custom item</div>
      )

      const props: TreeNodeProps = { ...defaultProps, node: mockItemNode, item: CusmtomItem }

      renderWithContext(<TreeNode {...props} />)

      const $customItem = screen.getByTestId(`custom-item-${mockItemNode.id}`)
      expect($customItem).toBeInTheDocument()
    })
  })

  it('should handle onFolderOpen correctly', async () => {
    const user = userEvent.setup()

    const props = { ...defaultProps, node: mockFolderNode }
    const { node, onToggleOpen } = props

    renderWithContext(<TreeNode {...props} />)

    const $folderNode = screen.getByTestId(node.id)

    await user.click($folderNode)

    expect(onToggleOpen).toHaveBeenCalledWith(node)
  })

  describe('TreeNode drag and drop', () => {
    afterEach(() => {
      vi.clearAllMocks()
      defaultTreeNodeDnDdata.dragPosition = null
      defaultTreeNodeDnDdata.isDropAllowed = true
    })

    it('should call handleDragStart when dragging starts', () => {
      const props = { ...defaultProps, node: mockFolderNode }
      renderWithContext(<TreeNode {...props} />)

      const $treeNode = screen.getByTestId(`tree-node-${mockFolderNode.id}`)

      fireEvent.dragStart($treeNode, dragStartEvent)

      expect(mockHandleDragStart).toHaveBeenCalled()
    })

    it('should call handleDragLeave when dragging leaves the node', () => {
      const props = { ...defaultProps, node: mockFolderNode }
      renderWithContext(<TreeNode {...props} />)

      const $treeNode = screen.getByTestId(`tree-node-${mockFolderNode.id}`)

      fireEvent.dragLeave($treeNode)

      expect(mockHandleDragLeave).toHaveBeenCalled()
    })

    it('should apply drag-over class when dragging over a folder', () => {
      defaultTreeNodeDnDdata.dragPosition = DropPosition.Inside

      const props = { ...defaultProps, node: mockFolderNode }
      renderWithContext(<TreeNode {...props} />)

      const $treeNode = screen.getByTestId(`tree-node-${mockFolderNode.id}`)

      fireEvent.dragOver($treeNode)

      expect($treeNode).toHaveClass('tree-node drag-over')
      expect(mockHandleDragOver).toHaveBeenCalled()
    })

    it('should apply custom drag-over class when dragging over ', () => {
      defaultTreeNodeDnDdata.dragPosition = DropPosition.Inside

      const customClassName = 'custom-drag-over'

      const props = {
        ...defaultProps,
        node: mockFolderNode,
        dragClassNames: { ...defaultProps.dragClassNames, dragOver: customClassName },
      }

      renderWithContext(<TreeNode {...props} />)

      const $treeNode = screen.getByTestId(`tree-node-${mockFolderNode.id}`)

      fireEvent.dragOver($treeNode)

      expect($treeNode).toHaveClass(`tree-node ${customClassName}`)
      expect(mockHandleDragOver).toHaveBeenCalled()
    })

    it('should call handleDrop when a node is dropped', async () => {
      const props = { ...defaultProps, node: mockFolderNode }
      renderWithContext(<TreeNode {...props} />)

      const $treeNode = screen.getByTestId(`tree-node-${mockFolderNode.id}`)

      fireEvent.drop($treeNode)

      expect(mockHandleDrop).toHaveBeenCalled()
    })

    it('should display a drop indicator before the tree node', () => {
      defaultTreeNodeDnDdata.dragPosition = DropPosition.Before

      const props = { ...defaultProps, node: mockFolderNode }
      renderWithContext(<TreeNode {...props} />)

      const $dropIndicator = screen.getByTestId(
        `drop-indicator-${DropPosition.Before}-${mockFolderNode.id}`
      )

      expect($dropIndicator).toBeInTheDocument()
      expect($dropIndicator).toHaveClass('drag-before')
    })

    it('should apply custom className to drop indicator when position is before', () => {
      defaultTreeNodeDnDdata.dragPosition = DropPosition.Before

      const customClassName = 'custom-drag-before'

      const props = {
        ...defaultProps,
        node: mockFolderNode,
        dragClassNames: { ...defaultProps.dragClassNames, dragBefore: customClassName },
      }

      renderWithContext(<TreeNode {...props} />)

      const $dropIndicator = screen.getByTestId(
        `drop-indicator-${DropPosition.Before}-${mockFolderNode.id}`
      )

      expect($dropIndicator).toBeInTheDocument()
      expect($dropIndicator).toHaveClass(customClassName)
    })

    it('should display a drop indicator after the tree node', () => {
      defaultTreeNodeDnDdata.dragPosition = DropPosition.After

      const props = { ...defaultProps, node: mockFolderNode }
      renderWithContext(<TreeNode {...props} />)

      const $dropIndicator = screen.getByTestId(
        `drop-indicator-${DropPosition.After}-${mockFolderNode.id}`
      )

      expect($dropIndicator).toBeInTheDocument()
      expect($dropIndicator).toHaveClass('drag-after')
    })

    it('should apply custom className to drop indicator when position is after', () => {
      defaultTreeNodeDnDdata.dragPosition = DropPosition.After

      const customClassName = 'custom-drag-after'

      const props = {
        ...defaultProps,
        node: mockFolderNode,
        dragClassNames: { ...defaultProps.dragClassNames, dragAfter: customClassName },
      }

      renderWithContext(<TreeNode {...props} />)

      const $dropIndicator = screen.getByTestId(
        `drop-indicator-${DropPosition.After}-${mockFolderNode.id}`
      )

      expect($dropIndicator).toBeInTheDocument()
      expect($dropIndicator).toHaveClass(customClassName)
    })
  })
})
