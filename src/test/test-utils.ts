import { ROOT_NODE } from '../lazy-tree-view/constants'
import type { FolderNode, TreeNode, TreeWithRoot } from '../types/tree'

/**
 * Create a simple item node for testing
 */
export const createItem = (id: string, name?: string): TreeNode => ({
  id,
  name: name ?? `Item ${id}`,
})

/**
 * Create a folder node for testing
 */
export const createFolder = (
  id: string,
  children: TreeNode[] = [],
  options: Partial<FolderNode> = {},
): FolderNode => ({
  id,
  name: `Folder ${id}`,
  children,
  ...options,
})

/**
 * Create a root node for testing
 */
export const createRoot = (children: TreeNode[] = []): FolderNode => ({ ...ROOT_NODE, children })

/**
 * Create a tree with root for testing
 */
export const createTree = (children: TreeNode[] = []): TreeWithRoot => [createRoot(children)]
