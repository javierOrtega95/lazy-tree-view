import { useState } from 'react'
import './App.css'
import AsyncTree from './components/async-tree/AsyncTree'
import { DropData, ItemProps, TreeNode } from './components/async-tree/types'
import { DEFAULT_TREE } from './mocks/storybook'

function CustomTreeItem({ node }: ItemProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 40, gap: 8 }}>
      <img
        src='https://gravatar.com/avatar/0f3d4029eb9512f57e885abbb1b12dd6?s=400&d=robohash&r=x'
        alt='robot-avatar'
        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
      />

      <p>{node.name}</p>
    </div>
  )
}

function App() {
  const [treeData, setTreeData] = useState<TreeNode[]>(DEFAULT_TREE)
  const loadChildren = async (folder: TreeNode): Promise<TreeNode[]> => {
    console.log(`Fetching children of folder ${folder.id}`)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return [
      {
        id: crypto.randomUUID(),
        name: 'Folder',
        children: [],
      },
      {
        id: crypto.randomUUID(),
        name: 'item.pdf',
      },
    ]
  }

  const handleDrop = (data: DropData) => {
    console.log(data)
  }

  return (
    <>
      <h1>Async Tree Demo</h1>

      <main className='tree-container'>
        <AsyncTree
          treeData={treeData}
          loadChildren={loadChildren}
          item={CustomTreeItem}
          onDrop={handleDrop}
          onChange={setTreeData}
        />
      </main>
    </>
  )
}

export default App
