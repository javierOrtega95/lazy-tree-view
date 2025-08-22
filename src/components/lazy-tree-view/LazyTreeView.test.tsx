import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LazyTreeView from './LazyTreeView'
import type { FolderNode, TreeNode } from './types'

describe('LazyTreeView Component', () => {
  describe('Basic rendering', () => {
    it('renders the AsyncTree component successfully with empty initialTree', () => {
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
    it('initializes foldersState with correct isOpen based on presence of children', () => {
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

      const $folderClosedGroup = $folderClosed.querySelector('.tree-group')
      expect($folderClosedGroup).toBeNull()
    })
  })

  describe('Folder toggle behavior (handleToggleOpen)', () => {
    it('opens a closed folder and loads children via loadChildren', async () => {
      const user = userEvent.setup()

      const folder = { id: '1', name: 'Folder', children: [] }
      const children = [{ id: '1-1', name: 'Child' }]

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

      await waitFor(() => {
        expect(screen.getByTestId(`tree-node-${children[0].id}`)).toBeInTheDocument()
      })

      const newTree: TreeNode[] = [{ ...folder, children }]

      expect(onChange).toHaveBeenCalledWith(newTree)
    })
    //   it('does not reload children if fetchOnce is true and hasFetched is true', async () => {})
    //   it('closes an open folder', () => {})
    //   it('handles errors during async children loading', async () => {})

    // describe('Drag and Drop behavior (handleDrop)', () => {
    //   it('moves a node and calls onDrop and onChange callbacks', () => {})
    //   it('updates the tree data correctly after moving a node', () => {})
    //   it('normalizes previous and next parents correctly', () => {})
    //   it('respects canDrop prop to allow or deny drops', () => {})
    // })

    // describe('Conditional rendering of nodes', () => {
    //   it('renders children only if folder is open', () => {})
    //   it('shows loading state when children are loading', () => {})
    // })

    // describe('Callbacks and prop interactions', () => {
    //   it('calls onChange when tree data changes', () => {})
    //   it('calls onDrop when a drop action occurs', () => {})
    //   it('canDrop prop controls if drop is allowed', () => {})
    // })

    // describe('Context provider (AsyncTreeContext)', () => {
    //   it('provides nodeParents data correctly via context', () => {})
    // })

    // describe('Internal utility functions (if exported for iting)', () => {
    //   it('updateFolderState updates folder state correctly', () => {})
    //   it('updateFolderChildren updates folder children correctly', () => {})
    //   it('renderNode recursively renders nodes with correct depth', () => {})
    // })
  })
})
