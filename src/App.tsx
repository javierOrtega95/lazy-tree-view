import './App.css'
import LazyTreeView from './lazy-tree-view/LazyTreeView'
import type { TreeNode } from './types/tree'

const initialTree: TreeNode[] = [
  {
    id: crypto.randomUUID(),
    name: 'Projects',
    children: [
      {
        id: crypto.randomUUID(),
        name: 'Website Redesign',
        children: [
          { id: crypto.randomUUID(), name: 'wireframes.pdf' },
          { id: crypto.randomUUID(), name: 'colors.png' },
        ],
      },
      {
        id: crypto.randomUUID(),
        name: 'Mobile App',
        children: [],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: 'Personal',
    children: [],
  },
  {
    id: crypto.randomUUID(),
    name: 'Photos',
    children: [],
  },
]

function App() {
  const loadChildren = async (folder: TreeNode): Promise<TreeNode[]> => {
    console.info(`Fetching children of folder "${folder.name}" (${folder.id})`)

    await new Promise((resolve) => setTimeout(resolve, 800))

    if (folder.name === 'Mobile App') {
      return [
        { id: crypto.randomUUID(), name: 'design.sketch' },
        { id: crypto.randomUUID(), name: 'api-specs.yaml' },
      ]
    }

    if (folder.name === 'Photos') {
      return [
        {
          id: crypto.randomUUID(),
          name: 'Vacation 2024',
          children: [
            { id: crypto.randomUUID(), name: 'beach.jpg' },
            { id: crypto.randomUUID(), name: 'mountains.jpg' },
          ],
        },
        { id: crypto.randomUUID(), name: 'profile.jpg' },
      ]
    }

    if (folder.name === 'Personal') {
      return [
        { id: crypto.randomUUID(), name: 'Resume.docx' },
        { id: crypto.randomUUID(), name: 'Taxes.xlsx' },
      ]
    }

    return [
      {
        id: crypto.randomUUID(),
        name: 'New Folder',
        children: [],
      },
      {
        id: crypto.randomUUID(),
        name: 'note.txt',
      },
    ]
  }

  return (
    <>
      <h1>Async Tree Demo</h1>

      <main className='tree-container'>
        <LazyTreeView initialTree={initialTree} loadChildren={loadChildren} />
      </main>
    </>
  )
}

export default App
