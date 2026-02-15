import { ROOT_NODE } from '../lazy-tree-view/constants'
import type { BranchNode, TreeNode, TreeWithRoot } from '../types/tree'

/**
 * Create a simple item node for testing
 */
export const createItem = (id: string, name?: string): TreeNode => ({
  id,
  name: name ?? `Item ${id}`,
})

/**
 * Create a branch node for testing
 */
export const createBranch = (
  id: string,
  children: TreeNode[] = [],
  options: Partial<BranchNode> = {},
): BranchNode => ({
  id,
  name: `Branch ${id}`,
  children,
  ...options,
})

/**
 * Create a root node for testing
 */
export const createRoot = (children: TreeNode[] = []): BranchNode => ({ ...ROOT_NODE, children })

/**
 * Create a tree with root for testing
 */
export const createTree = (children: TreeNode[] = []): TreeWithRoot => [createRoot(children)]
