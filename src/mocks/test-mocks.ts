import { ROOT_NODE } from '../components/async-tree/constants'
import { FolderNode, TreeNode } from '../components/async-tree/types'

const firstChild: FolderNode = {
  id: crypto.randomUUID(),
  name: 'Folder 2',
  children: [],
}

const secondChild: TreeNode = {
  id: crypto.randomUUID(),
  name: 'Item 1',
}

const parentNode: FolderNode = {
  id: crypto.randomUUID(),
  name: 'Folder 1',
  children: [firstChild, secondChild],
}

const mockTree: TreeNode[] = [
  {
    ...ROOT_NODE,
    children: [parentNode],
  },
]

export { mockTree, parentNode, firstChild, secondChild }
