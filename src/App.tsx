import { useCallback } from 'react'
import './App.css'
import LazyTreeView from './lazy-tree-view/LazyTreeView'
import {
  CHILDREN_BY_FOLDER,
  LAZY_TREE_EXAMPLE,
  mockLoadChildren,
} from './mocks/storybook/storybook'
import type { DropData } from './types/dnd'
import type { FolderNode, TreeNode } from './types/tree'

function App() {
  const loadChildren = useCallback(async (folder: FolderNode): Promise<TreeNode[]> => {
    console.log(`Loading children for: ${folder.name}`)

    const children = CHILDREN_BY_FOLDER[folder.name]

    if (!children) {
      throw new Error(`No children found for folder: ${folder.name}`)
    }

    return mockLoadChildren(children)
  }, [])

  const handleLoadStart = useCallback((folder: FolderNode) => {
    console.log(`🔄 Loading started for: ${folder.name}`)
  }, [])

  const handleLoadSuccess = useCallback((folder: FolderNode, children: TreeNode[]) => {
    console.log(`✅ Successfully loaded ${children.length} items for: ${folder.name}`)
  }, [])

  const handleLoadError = useCallback((folder: FolderNode, error: unknown) => {
    console.error(
      `❌ Error loading ${folder.name}:`,
      error instanceof Error ? error.message : error
    )
  }, [])

  const handleDrop = useCallback(
    ({ source, target, position, prevParent, nextParent }: DropData) => {
      console.log(`Dropping node ${source.name} ${position} node ${target.name}`)

      console.log(
        `Prev Parent of ${source.name}: ${prevParent?.name} and Next Parent: ${nextParent?.name}`
      )
    },
    []
  )

  return (
    <>
      <h1>Lazy Tree View Demo</h1>

      <main className='tree-container'>
        <LazyTreeView
          initialTree={LAZY_TREE_EXAMPLE}
          loadChildren={loadChildren}
          onLoadStart={handleLoadStart}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          onDrop={handleDrop}
        />
      </main>
    </>
  )
}

export default App
