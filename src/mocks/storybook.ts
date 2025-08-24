import type { FolderNode, TreeNode } from '../types/tree'

export const DEFAULT_TREE: TreeNode[] = [
  // {
  //   id: crypto.randomUUID(),
  //   name: 'Work Files',
  //   children: [],
  // },
  // {
  //   id: crypto.randomUUID(),
  //   name: 'Images',
  //   children: [],
  // },
  {
    id: crypto.randomUUID(),
    name: 'Users',
    children: [{ id: 'robot', name: 'Custom Robot' }],
  },
]

export const MOCK_WORK_FILES_CHILDREN: TreeNode[] = [
  {
    id: crypto.randomUUID(),
    name: 'Project.docx',
  },
  {
    id: crypto.randomUUID(),
    name: 'Notes.txt',
  },
]

export const MOCK_IMAGES_CHILDREN: TreeNode[] = [
  {
    id: crypto.randomUUID(),
    name: 'Beach.jpg',
  },
  {
    id: crypto.randomUUID(),
    name: 'Mountains.png',
  },
]

const MOCK_USERS_CHILDREN: TreeNode[] = [
  {
    id: crypto.randomUUID(),
    name: 'john_doe',
  },
  {
    id: crypto.randomUUID(),
    name: 'jane_smith',
  },
  {
    id: crypto.randomUUID(),
    name: 'alice_jones',
  },
]

export const CHILDREN_BY_FOLDER: Record<FolderNode['name'], TreeNode[]> = {
  ['Work Files']: MOCK_WORK_FILES_CHILDREN,
  Images: MOCK_IMAGES_CHILDREN,
  Users: MOCK_USERS_CHILDREN,
}

export function mockLoadChildren(children: TreeNode[]): Promise<TreeNode[]> {
  return new Promise<TreeNode[]>((resolve) => {
    setTimeout(() => resolve(children), 500)
  })
}
