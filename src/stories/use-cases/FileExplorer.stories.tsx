import type { Meta, StoryObj } from '@storybook/react'
import { type FC, useState } from 'react'

import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { BaseNodeProps, FolderProps } from '../../lazy-tree-view/types'
import type { FolderNode, TreeNode } from '../../types/tree'
import { isFolderNode } from '../../lazy-tree-view/utils/validations'
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  LoaderIcon,
} from '../assets/icons/file-icons'
import { FILE_COLORS, getFileIconConfig } from '../assets/icons/file-icon-utils'
import '../assets/styles/file-explorer.css'

import { FILE_EXPLORER_TREE, loadChildren } from './file-explorer.mock'

// ---- Shared types ----

type SelectedNode = {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: number
}

type OnSelectFn = (node: SelectedNode) => void

// ---- Custom Components ----

const ExplorerFolder: FC<FolderProps & { onSelect?: OnSelectFn }> = ({
  id,
  name,
  children,
  isOpen = false,
  isLoading = false,
  depth,
  onToggleOpen,
  onDragStart,
  onSelect,
}) => {
  const FolderIconComponent = isOpen ? FolderOpenIcon : FolderIcon
  const folderColor = isOpen ? FILE_COLORS.folderOpen : FILE_COLORS.folder

  return (
    <div
      className='file-explorer__item'
      style={{ '--depth': depth } as React.CSSProperties}
      onClick={(e) => {
        onToggleOpen(e)
        onSelect?.({ id, name, type: 'folder', children: children.length })
      }}
      draggable
      onDragStart={onDragStart}
    >
      <span className={`file-explorer__chevron ${isOpen ? 'file-explorer__chevron--open' : ''}`}>
        <ChevronRightIcon width={14} height={14} />
      </span>

      {isLoading ? (
        <span className='file-explorer__loader'>
          <LoaderIcon width={16} height={16} />
        </span>
      ) : (
        <span className='file-explorer__icon'>
          <FolderIconComponent style={{ color: folderColor }} />
        </span>
      )}

      <span className='file-explorer__name'>{name}</span>
    </div>
  )
}

const ExplorerItem: FC<BaseNodeProps & { onSelect?: OnSelectFn }> = ({
  id,
  name,
  depth,
  onDragStart,
  onSelect,
}) => {
  const { icon: IconComponent, color } = getFileIconConfig(name)

  return (
    <div
      className='file-explorer__item'
      style={{ '--depth': depth } as React.CSSProperties}
      onClick={() => onSelect?.({ id, name, type: 'file' })}
      draggable
      onDragStart={onDragStart}
    >
      <span className='file-explorer__chevron file-explorer__chevron--hidden'>
        <ChevronRightIcon width={14} height={14} />
      </span>

      <span className='file-explorer__icon'>
        <IconComponent style={{ color }} />
      </span>

      <span className='file-explorer__name'>{name}</span>
    </div>
  )
}

// ---- Shared tree config ----

const treeConfig = {
  initialTree: FILE_EXPLORER_TREE,
  loadChildren: (folder: FolderNode) => loadChildren(folder.name),
  folder: ExplorerFolder,
  item: ExplorerItem,
  allowDragAndDrop: true as const,
  canDrop: ({ source, target }: { source: TreeNode; target: TreeNode }) => {
    if (isFolderNode(source) && target.id === source.id) return false
    return true
  },
  dragClassNames: {
    dragOver: 'drag-over',
    dragBefore: 'drop-before',
    dragAfter: 'drop-after',
    dropNotAllowed: 'drop-not-allowed',
  },
}

// ---- Fake file content for preview ----

const FILE_CONTENT: Record<string, string> = {
  '.tsx': `import { useState } from 'react'\n\nexport default function Component() {\n  const [count, setCount] = useState(0)\n\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Count: {count}\n    </button>\n  )\n}`,
  '.ts': `export function debounce<T extends (...args: unknown[]) => void>(\n  fn: T,\n  delay: number\n): T {\n  let timer: ReturnType<typeof setTimeout>\n  return ((...args: unknown[]) => {\n    clearTimeout(timer)\n    timer = setTimeout(() => fn(...args), delay)\n  }) as T\n}`,
  '.css': `:root {\n  --color-primary: #3178c6;\n  --color-bg: #1e1e1e;\n  --font-mono: 'Fira Code', monospace;\n}\n\nbody {\n  margin: 0;\n  font-family: var(--font-mono);\n  background: var(--color-bg);\n}`,
  '.json': `{\n  "name": "my-project",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "preview": "vite preview"\n  }\n}`,
  '.md': `# My Project\n\nA modern React application built with\nTypeScript and Vite.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``,
}

function getFileContent(name: string): string {
  const ext = name.includes('.') ? '.' + name.split('.').slice(-1)[0] : ''
  return FILE_CONTENT[ext] ?? `// ${name}\n// No preview available`
}

// ---- Preview Panel ----

const PreviewPanel: FC<{ selected: SelectedNode | null }> = ({ selected }) => {
  if (!selected) {
    return (
      <div className='fe-preview__empty'>
        <FileIcon width={32} height={32} />
        <p>Select a file to preview</p>
      </div>
    )
  }

  if (selected.type === 'folder') {
    const FolderIconComponent = FolderOpenIcon
    return (
      <div className='fe-preview__content'>
        <div className='fe-preview__header'>
          <FolderIconComponent style={{ color: FILE_COLORS.folderOpen }} width={18} height={18} />
          <span className='fe-preview__filename'>{selected.name}</span>
        </div>
        <div className='fe-preview__meta'>
          <span className='fe-preview__tag'>Folder</span>
          <span className='fe-preview__info'>
            {selected.children ?? 0} item{selected.children !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    )
  }

  const { icon: IconComponent, color } = getFileIconConfig(selected.name)

  return (
    <div className='fe-preview__content'>
      <div className='fe-preview__header'>
        <IconComponent style={{ color }} width={18} height={18} />
        <span className='fe-preview__filename'>{selected.name}</span>
      </div>
      <div className='fe-preview__meta'>
        <span className='fe-preview__tag' style={{ color }}>
          {selected.name.split('.').pop()?.toUpperCase()}
        </span>
      </div>
      <pre className='fe-preview__code'>{getFileContent(selected.name)}</pre>
    </div>
  )
}

// ---- Story Component ----

type FileExplorerProps = {
  allowDragAndDrop: boolean
  disableAnimations: boolean
  animationDuration: number
}

const FileExplorerDemo: FC<FileExplorerProps> = ({
  allowDragAndDrop = true,
  disableAnimations = false,
  animationDuration = 300,
}) => {
  const [selected, setSelected] = useState<SelectedNode | null>(null)

  return (
    <div className='fe-window'>
      <div className='fe-window__titlebar'>
        <span className='fe-window__dot fe-window__dot--red' />
        <span className='fe-window__dot fe-window__dot--yellow' />
        <span className='fe-window__dot fe-window__dot--green' />
      </div>
      <div className='fe-split'>
        <div className='file-explorer fe-split__sidebar'>
          <div className='file-explorer__header'>Explorer</div>
          <LazyTreeView
            {...treeConfig}
            allowDragAndDrop={allowDragAndDrop}
            disableAnimations={disableAnimations}
            animationDuration={animationDuration}
            folderProps={{ onSelect: setSelected }}
            itemProps={{ onSelect: setSelected }}
          />
        </div>
        <div className='fe-preview'>
          <PreviewPanel selected={selected} />
        </div>
      </div>
    </div>
  )
}

// ---- Meta & Story ----

const meta: Meta<typeof FileExplorerDemo> = {
  title: 'Use Cases/File Explorer',
  component: FileExplorerDemo,
  parameters: {
    docs: {
      description: {
        component:
          'A GitHub-inspired file explorer built with **LazyTreeView**. Demonstrates custom `folder` and `item` components, lazy loading, drag & drop reordering, and selection state synced with a preview panel.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    allowDragAndDrop: true,
    disableAnimations: false,
    animationDuration: 300,
  },
  argTypes: {
    allowDragAndDrop: {
      description: 'Enable or disable drag & drop reordering of files and folders.',
      control: 'boolean',
      table: { category: 'Behavior', defaultValue: { summary: 'true' } },
    },
    disableAnimations: {
      description: 'Disable expand/collapse animations.',
      control: 'boolean',
      table: { category: 'Behavior', defaultValue: { summary: 'false' } },
    },
    animationDuration: {
      description: 'Duration of expand/collapse animations in milliseconds.',
      control: { type: 'range', min: 0, max: 1000, step: 50 },
      table: { category: 'Behavior', defaultValue: { summary: '300' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof FileExplorerDemo>

const SOURCE_CODE = `
import LazyTreeView from 'lazy-tree-view'

// Custom folder component
const ExplorerFolder = ({ name, isOpen, isLoading, depth, onToggleOpen }) => (
  <div className="file-explorer__item" onClick={onToggleOpen}>
    <ChevronIcon open={isOpen} />
    {isLoading ? <Spinner /> : <FolderIcon open={isOpen} />}
    <span>{name}</span>
  </div>
)

// Custom item component
const ExplorerItem = ({ name, depth }) => (
  <div className="file-explorer__item">
    <FileIcon name={name} />
    <span>{name}</span>
  </div>
)

<LazyTreeView
  initialTree={fileTree}
  loadChildren={(folder) => fetchFiles(folder.name)}
  folder={ExplorerFolder}
  item={ExplorerItem}
  allowDragAndDrop
  canDrop={({ source, target }) =>
    !(isFolderNode(source) && target.id === source.id)
  }
  dragClassNames={{
    dragOver: 'drag-over',
    dragBefore: 'drop-before',
    dragAfter: 'drop-after',
    dropNotAllowed: 'drop-not-allowed',
  }}
/>
`.trim()

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: SOURCE_CODE,
        language: 'tsx',
      },
    },
  },
}
