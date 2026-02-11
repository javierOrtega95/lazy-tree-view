/**
 * File Explorer Mock Data
 * Simulates a realistic React/Vite project structure
 */
import { generateUUID } from '../../lazy-tree-view/utils/uuid'
import type { TreeNode } from '../../types/tree'

// Helper to create a file node
const file = (name: string): TreeNode => ({ id: generateUUID(), name })

// Helper to create a folder node
const folder = (
  name: string,
  children: TreeNode[] = [],
  opts?: { isOpen?: boolean },
): TreeNode => ({
  id: generateUUID(),
  name,
  children,
  ...(children.length > 0 && { hasFetched: true }),
  ...opts,
})

// Main project structure
export const FILE_EXPLORER_TREE: TreeNode[] = [
  folder(
    'src',
    [
      folder('components', [
      folder('Button', [
        file('Button.tsx'),
        file('Button.test.tsx'),
        file('Button.module.css'),
        file('index.ts'),
      ]),
      folder('Input', [
        file('Input.tsx'),
        file('Input.test.tsx'),
        file('Input.module.css'),
        file('index.ts'),
      ]),
      folder('Modal', []),
      file('index.ts'),
    ]),
    folder('hooks', [file('useDebounce.ts'), file('useLocalStorage.ts'), file('index.ts')]),
    folder('utils', [file('cn.ts'), file('format.ts'), file('index.ts')]),
    folder('styles', [file('globals.css'), file('variables.css')]),
      file('App.tsx'),
      file('main.tsx'),
      file('vite-env.d.ts'),
    ],
  ),
  folder('public', [file('favicon.ico'), file('robots.txt')]),
  folder('tests', []),
  file('package.json'),
  file('tsconfig.json'),
  file('vite.config.ts'),
  file('README.md'),
  file('.gitignore'),
  file('.env'),
]

// Lazy-loaded children for specific folders
export const LAZY_CHILDREN: Record<string, TreeNode[]> = {
  Modal: [
    file('Modal.tsx'),
    file('Modal.test.tsx'),
    file('Modal.module.css'),
    file('ModalHeader.tsx'),
    file('ModalFooter.tsx'),
    file('index.ts'),
  ],
  tests: [
    file('setup.ts'),
    folder('e2e', [file('home.spec.ts'), file('auth.spec.ts')]),
    folder('unit', [file('utils.test.ts'), file('hooks.test.ts')]),
  ],
}

// Simulate async loading with delay
export async function loadChildren(folderName: string): Promise<TreeNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400))

  // Simulate random error (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Failed to load folder contents')
  }

  return LAZY_CHILDREN[folderName] || []
}
