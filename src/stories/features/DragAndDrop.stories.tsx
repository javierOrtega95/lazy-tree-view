import type { Meta, StoryObj } from '@storybook/react'
import { type FC, useCallback, useState } from 'react'
import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { TreeNode } from '../../types/tree'
import { isFolderNode } from '../../lazy-tree-view/utils/validations'
import type { DropData } from '../../types/dnd'

// ---- Demo data ----

const TREE: TreeNode[] = [
  {
    id: 'folder-docs',
    name: 'Documents',
    children: [
      { id: 'file-readme', name: 'README.md' },
      { id: 'file-license', name: 'LICENSE' },
      { id: 'file-changelog', name: 'CHANGELOG.md' },
    ],
    isOpen: true,
    hasFetched: true,
  },
  {
    id: 'folder-src',
    name: 'Source',
    children: [
      { id: 'file-index', name: 'index.ts' },
      { id: 'file-utils', name: 'utils.ts' },
      { id: 'file-types', name: 'types.ts' },
    ],
    isOpen: true,
    hasFetched: true,
  },
  {
    id: 'folder-locked',
    name: 'Locked (no drop)',
    children: [
      { id: 'file-secret', name: 'secret.env' },
      { id: 'file-keys', name: 'keys.json' },
    ],
    isOpen: true,
    hasFetched: true,
  },
  { id: 'file-config', name: 'config.yaml' },
  { id: 'file-package', name: 'package.json' },
]

async function noop(): Promise<TreeNode[]> {
  return []
}

// ---- Story component ----

type DropLogEntry = {
  id: number
  source: string
  target: string
  position: string
}

type DragAndDropProps = {
  disableAnimations: boolean
  animationDuration: number
}

const DragAndDropDemo: FC<DragAndDropProps> = ({
  disableAnimations = false,
  animationDuration = 300,
}) => {
  const [logs, setLogs] = useState<DropLogEntry[]>([])
  let logId = 0

  const handleDrop = useCallback(
    (data: DropData) => {
      setLogs((prev) => [
        ...prev.slice(-7),
        {
          id: ++logId,
          source: data.source.name,
          target: data.target.name,
          position: data.position,
        },
      ])
    },
    [logId],
  )

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', minHeight: 400 }}>
      <LazyTreeView
        initialTree={TREE}
        loadChildren={noop}
        allowDragAndDrop
        disableAnimations={disableAnimations}
        animationDuration={animationDuration}
        canDrop={({ source, target }) => {
          if (isFolderNode(source) && target.id === source.id) return false
          if (target.id === 'folder-locked') return false
          return true
        }}
        onDrop={handleDrop}
        style={{ minWidth: 260 }}
      />

      <div
        style={{
          flex: 1,
          minWidth: 280,
          fontSize: 12,
          fontFamily: 'monospace',
          background: '#f6f8fa',
          borderRadius: 6,
          padding: 12,
          minHeight: 200,
          maxHeight: 300,
          overflow: 'auto',
          border: '1px solid #d1d9e0',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#656d76', fontSize: 11 }}>
          Drop Log
        </div>
        {logs.length === 0 && (
          <div style={{ color: '#8b949e' }}>Drag a node to see drop events...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} style={{ padding: '3px 0', color: '#1f2328' }}>
            <strong>{log.source}</strong> <span style={{ color: '#656d76' }}>{log.position}</span>{' '}
            <strong>{log.target}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Meta & Story ----

const SOURCE_CODE = `
import LazyTreeView from 'lazy-tree-view'
import { isFolderNode } from 'lazy-tree-view/utils'

<LazyTreeView
  initialTree={tree}
  loadChildren={loadChildren}
  allowDragAndDrop
  canDrop={({ source, target }) => {
    // Prevent dropping a folder inside itself
    if (isFolderNode(source) && target.id === source.id) return false
    // Prevent dropping into locked folders
    if (target.id === 'folder-locked') return false
    return true
  }}
  onDrop={({ source, target, position }) => {
    console.log(\`Moved "\${source.name}" \${position} "\${target.name}"\`)
  }}
/>
`.trim()

const meta: Meta<typeof DragAndDropDemo> = {
  title: 'Features/Drag & Drop',
  component: DragAndDropDemo,
  parameters: {
    docs: {
      description: {
        component: [
          'Demonstrates all drag & drop features:',
          '',
          '- **Drop positions**: before, inside, and after any node',
          '- **Validation via `canDrop`**: the "Locked (no drop)" folder rejects all drops, and folders cannot be dropped inside themselves',
          '- **`onDrop` callback**: the log panel shows every drop event with source, target, and position',
          '',
          'Try dragging nodes between folders, reordering items, and dropping onto the locked folder to see the validation in action.',
        ].join('\n'),
      },
    },
  },
  tags: ['autodocs'],
  args: {
    disableAnimations: false,
    animationDuration: 300,
  },
  argTypes: {
    disableAnimations: {
      description: 'Disable expand/collapse animations.',
      control: 'boolean',
      table: { category: 'Animation', defaultValue: { summary: 'false' } },
    },
    animationDuration: {
      description: 'Duration of expand/collapse animations in milliseconds.',
      control: { type: 'range', min: 0, max: 1000, step: 50 },
      table: { category: 'Animation', defaultValue: { summary: '300' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof DragAndDropDemo>

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: SOURCE_CODE, language: 'tsx' },
    },
  },
}
