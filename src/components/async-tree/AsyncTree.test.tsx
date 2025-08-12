import { render, screen } from '@testing-library/react'
import AsyncTree from './AsyncTree'
import { describe, expect, it } from 'vitest'
import type { FolderNode, TreeNode } from './types'

describe('AsyncTree Component', () => {
  describe('Basic rendering', () => {
    it('renders the AsyncTree component successfully with empty initialTree', () => {
      render(<AsyncTree initialTree={[]} loadChildren={async () => []} />)

      const $tree = screen.getByRole('tree')
      expect($tree).toBeInTheDocument()
    })

    it('renders correctly with a non-empty initialTree', () => {
      const initialTree: TreeNode[] = [
        { id: '1', name: 'Root Folder', children: [] },
        { id: '2', name: 'Item 1' },
      ]

      const [folder, item] = initialTree

      render(<AsyncTree initialTree={initialTree} loadChildren={async () => []} />)

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

      render(<AsyncTree initialTree={initialTree} loadChildren={async () => []} />)

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
})
