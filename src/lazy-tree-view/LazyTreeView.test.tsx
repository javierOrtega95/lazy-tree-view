import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createDragOverEvent, dragStartEvent } from '../mocks/test/dndEvents'
import { DropPosition } from '../types/dnd'
import { type FolderNode, type TreeNode } from '../types/tree'
import LazyTreeView from './LazyTreeView'

describe('LazyTreeView Component', () => {
  describe('Basic rendering', () => {
    it('renders successfully with empty initialTree', () => {
      render(<LazyTreeView initialTree={[]} loadChildren={async () => []} />)

      const $tree = screen.getByRole('tree')
      expect($tree).toBeInTheDocument()
    })

    it('renders correctly with a non-empty initialTree', () => {
      const initialTree: TreeNode[] = [
        { id: '1', name: 'Root Folder', children: [] },
        { id: '2', name: 'Item 1' },
      ]

      const [folder, item] = initialTree

      render(<LazyTreeView initialTree={initialTree} loadChildren={async () => []} />)

      const $rootNode = screen.getByText(folder.name)
      expect($rootNode).toBeInTheDocument()

      const $itemNode = screen.getByText(item.name)
      expect($itemNode).toBeInTheDocument()
    })
  })

  describe('Initial state', () => {
    it('initializes foldersState with correct isOpen', () => {
      const folderClosed: FolderNode = { id: '1', name: 'Folder Closed', children: [] }
      const folderOpen: FolderNode = {
        id: '2',
        name: 'Folder Open',
        children: [{ id: '2-1', name: 'Child' }],
      }

      const initialTree: TreeNode[] = [folderClosed, folderOpen]

      render(<LazyTreeView initialTree={initialTree} loadChildren={async () => []} />)

      const $folderClosed = screen.getByTestId(`tree-node-${folderClosed.id}`)
      const $folderOpen = screen.getByTestId(`tree-node-${folderOpen.id}`)

      expect($folderClosed).toBeInTheDocument()
      expect($folderOpen).toBeInTheDocument()

      const $folderOpenChild = screen.getByTestId(`tree-node-${folderOpen.children[0].id}`)
      expect($folderOpenChild).toBeInTheDocument()
    })
  })

  describe('Folder toggle behavior', () => {
    it('should call onError when loadChildren throws', async () => {
      const user = userEvent.setup()
      const loadChildreError = new Error('Load failed')
      const failingLoadChildren = vi.fn().mockRejectedValue(loadChildreError)
      const onError = vi.fn()

      const folder: FolderNode = { id: '1', name: 'root', children: [] }

      render(
        <LazyTreeView initialTree={[folder]} loadChildren={failingLoadChildren} onError={onError} />
      )

      const $toggleIcon = screen.getByTestId(`${folder.id}-chevron-icon`)
      await user.click($toggleIcon)

      await waitFor(() => expect(onError).toBeCalledWith(loadChildreError, folder))
    })

    it('opens a closed folder and loads children via loadChildren', async () => {
      const user = userEvent.setup()

      const folder: FolderNode = { id: '1', name: 'Folder', children: [] }
      const child: TreeNode = { id: '1-1', name: 'Child' }
      const children = [child]

      const loadChildren = vi.fn().mockResolvedValue(children)
      const onChange = vi.fn()

      render(
        <LazyTreeView initialTree={[folder]} loadChildren={loadChildren} onChange={onChange} />
      )

      const $folderNode = screen.getByTestId(`tree-node-${folder.id}`)
      expect($folderNode).toBeInTheDocument()

      const $toggleIcon = screen.getByTestId(`${folder.id}-chevron-icon`)
      await user.click($toggleIcon)

      expect(loadChildren).toHaveBeenCalledWith(folder)

      const $childNode = screen.queryByTestId(`tree-node-${child.id}`)

      await waitFor(() => expect($childNode).toBeInTheDocument())

      const newTree: TreeNode[] = [{ ...folder, children }]

      expect(onChange).toHaveBeenCalledWith(newTree)
    })

    it('does not reload children if fetchOnce is true and hasFetched is true', async () => {
      const user = userEvent.setup()

      const folder: FolderNode = { id: '1', name: 'Folder', children: [] }
      const node: TreeNode = { id: '1-1', name: 'Child' }
      const loadChildren = vi.fn().mockResolvedValue([node])

      render(<LazyTreeView initialTree={[folder]} fetchOnce={true} loadChildren={loadChildren} />)

      const $toggleIcon = screen.getByTestId(`${folder.id}-chevron-icon`)
      await user.click($toggleIcon)

      const $childNode = screen.getByTestId(`tree-node-${node.id}`)

      await waitFor(() => expect($childNode).toBeInTheDocument())

      // closing + reopening the folder should NOT trigger a reload
      await user.click($toggleIcon)

      await user.click($toggleIcon)

      expect(loadChildren).toHaveBeenCalledTimes(1)
    })

    it('reloads children every time if fetchOnce is false', async () => {
      const user = userEvent.setup()

      const folder: FolderNode = { id: '1', name: 'Folder', children: [] }
      const child: TreeNode = { id: '1-1', name: 'Child' }
      const loadChildren = vi.fn().mockResolvedValue([child])

      render(<LazyTreeView initialTree={[folder]} fetchOnce={false} loadChildren={loadChildren} />)

      const toggleIcon = screen.getByTestId(`${folder.id}-chevron-icon`)

      await user.click(toggleIcon)
      await waitFor(() => expect(screen.getByTestId(`tree-node-${child.id}`)).toBeInTheDocument())

      // closing + reopening the folder should trigger a reload
      await user.click(toggleIcon)
      await user.click(toggleIcon)

      await waitFor(() => expect(loadChildren).toHaveBeenCalledTimes(2))
    })

    it('closes an open folder', async () => {
      const user = userEvent.setup()

      const child: TreeNode = { id: '1-1', name: 'Child' }
      const folder: FolderNode = { id: '1', name: 'Folder', children: [child] }

      render(<LazyTreeView initialTree={[folder]} loadChildren={vi.fn()} />)

      const toggleIcon = screen.getByTestId(`${folder.id}-chevron-icon`)

      const nodeId = `tree-node-${child.id}`
      const $node = screen.getByTestId(nodeId)

      // child must be visible initially
      expect($node).toBeInTheDocument()

      await user.click(toggleIcon)

      // child must be hidden after closing the folder
      expect($node).not.toBeInTheDocument()
    })

    it('handles errors during async children loading', async () => {
      const user = userEvent.setup()

      const folder: FolderNode = { id: '1', name: 'Folder', children: [] }
      const loadChildren = vi.fn().mockRejectedValue(new Error('Failed to load children'))

      render(<LazyTreeView initialTree={[folder]} loadChildren={loadChildren} />)

      const toggleIcon = screen.getByTestId(`${folder.id}-chevron-icon`)

      const $folder = screen.getByTestId(`tree-node-${folder.id}`)

      await user.click(toggleIcon)

      await waitFor(() => expect(loadChildren).toHaveBeenCalledTimes(1))

      const $errorIcon = screen.getByTestId(`${folder.id}-error-icon`)

      // folder should remain closed after error
      expect($folder).not.toHaveClass('open')
      expect($errorIcon).toBeInTheDocument()
    })
  })

  describe('Drag and Drop', () => {
    const parent: FolderNode = { id: '1', name: 'Parent', children: [] }
    const child: TreeNode = { id: '1-1', name: 'Child' }
    const folder: FolderNode = { id: '2', name: 'Folder', children: [] }

    it('moves a node from one parent to another and calls onDrop and onChange', () => {
      const mockOnDrop = vi.fn()
      const mockOnChange = vi.fn()

      const initialTree: TreeNode[] = [{ ...parent, children: [child] }, folder]

      render(
        <LazyTreeView
          initialTree={initialTree}
          loadChildren={vi.fn()}
          onDrop={mockOnDrop}
          onChange={mockOnChange}
        />
      )

      const $childNode = screen.getByTestId(`tree-node-${child.id}`)
      const $folderNode = screen.getByTestId(`tree-node-${folder.id}`)

      const dragEvent = createDragOverEvent({
        offsetHeight: 100,
        offsetY: 50,
        dataTransfer: {
          setData: vi.fn(),
          getData: vi.fn().mockReturnValue(JSON.stringify(child)),
        },
      })

      fireEvent.dragStart($childNode, dragStartEvent)
      fireEvent.dragOver($folderNode, dragEvent)
      fireEvent.drop($folderNode, dragEvent)

      const newTree: TreeNode[] = [
        { ...parent, children: [] },
        { ...folder, children: [child] },
      ]

      expect(mockOnDrop).toHaveBeenCalledWith(
        expect.objectContaining({
          source: child,
          target: folder,
          position: DropPosition.Inside,
        })
      )

      expect(mockOnDrop.mock.calls[0][0].prevParent.id).toBe(parent.id)
      expect(mockOnDrop.mock.calls[0][0].nextParent.id).toBe(folder.id)

      expect(mockOnChange).toHaveBeenCalledWith(newTree)
    })

    it('does not move a node if canDrop returns false', () => {
      const mockOnDrop = vi.fn()
      const mockOnChange = vi.fn()

      const initialTree: TreeNode[] = [{ ...parent, children: [child] }, folder]

      render(
        <LazyTreeView
          initialTree={initialTree}
          loadChildren={vi.fn()}
          onDrop={mockOnDrop}
          onChange={mockOnChange}
          canDrop={() => false}
        />
      )

      const $childNode = screen.getByTestId(`tree-node-${child.id}`)
      const $folderNode = screen.getByTestId(`tree-node-${folder.id}`)

      const dragEvent = createDragOverEvent({
        offsetHeight: 100,
        offsetY: 50,
        dataTransfer: {
          setData: vi.fn(),
          getData: vi.fn().mockReturnValue(JSON.stringify(child)),
        },
      })

      fireEvent.dragStart($childNode, dragStartEvent)
      fireEvent.dragOver($folderNode, dragEvent)
      fireEvent.drop($folderNode, dragEvent)

      expect(mockOnDrop).not.toHaveBeenCalled()
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })
})
