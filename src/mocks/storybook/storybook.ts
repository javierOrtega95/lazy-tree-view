import type { TreeNode } from '../../types/tree'

export const MOCK_SETTINGS_CHILDREN: TreeNode[] = [
  { id: crypto.randomUUID(), name: 'Preferences.docx' },
  { id: crypto.randomUUID(), name: 'Security.txt' },
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

export const MOCK_USERS_CHILDREN: TreeNode[] = [
  { id: crypto.randomUUID(), name: 'john_doe' },
  { id: crypto.randomUUID(), name: 'jane_smith' },
  { id: crypto.randomUUID(), name: 'alice_jones' },
]

export const LAZY_TREE_EXAMPLE: TreeNode[] = [
  { id: crypto.randomUUID(), name: 'index.html' },
  {
    id: crypto.randomUUID(),
    name: 'Work Files',
    children: [],
  },
  {
    id: crypto.randomUUID(),
    name: 'Images',
    children: [],
  },
  {
    id: crypto.randomUUID(),
    name: 'Users',
    children: MOCK_USERS_CHILDREN,
  },
  {
    id: crypto.randomUUID(),
    name: 'Settings',
    children: [],
  },
]

export const DEFAULT_TREE: TreeNode[] = [
  { id: crypto.randomUUID(), name: 'Work Files', children: [] },
  { id: crypto.randomUUID(), name: 'Images', children: [] },
  {
    id: crypto.randomUUID(),
    name: 'Users',
    children: MOCK_USERS_CHILDREN,
  },
  {
    id: crypto.randomUUID(),
    name: 'Settings',
    children: MOCK_SETTINGS_CHILDREN,
  },
]

export const CHILDREN_BY_FOLDER: Record<string, TreeNode[]> = {
  'Work Files': MOCK_WORK_FILES_CHILDREN,
  Images: MOCK_IMAGES_CHILDREN,
  Users: MOCK_USERS_CHILDREN,
  Settings: MOCK_SETTINGS_CHILDREN,
}

export async function mockLoadChildren(children: TreeNode[]): Promise<TreeNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

  // Simulate a random error with 20% probability
  if (Math.random() < 0.2) {
    throw new Error('Network error: Failed to load folder contents')
  }

  return children
}
