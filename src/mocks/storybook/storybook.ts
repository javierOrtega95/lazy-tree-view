import type { TreeNode } from '../../types/tree'

export async function mockLoadChildren(children: TreeNode[]): Promise<TreeNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

  // Simulate a random error with 20% probability
  if (Math.random() < 0.2) {
    throw new Error('Network error: Failed to load folder contents')
  }

  return children
}
