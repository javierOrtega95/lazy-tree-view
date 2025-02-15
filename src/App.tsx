import { useState } from 'react'
import './App.css'
import AsyncTree from './components/async-tree/AsyncTree'
import { DropData, TreeNode } from './components/async-tree/types'
import { DEFAULT_TREE } from './mocks/tree-mocks'

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
          onDrop={handleDrop}
          onChange={setTreeData}
        />
      </main>
    </>
  )
}

export default App
