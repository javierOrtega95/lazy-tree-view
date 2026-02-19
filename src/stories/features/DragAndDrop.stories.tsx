import type { Meta, StoryObj } from '@storybook/react'
import { type FC, useCallback, useRef, useState } from 'react'
import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { TreeNode } from '../../types/tree'
import type { BaseNodeProps, BranchProps } from '../../lazy-tree-view/types'
import { isBranchNode } from '../../lazy-tree-view/utils/validations'
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
        canDrop={({ source, target, nextParent }) => {
          if (isBranchNode(source) && target.id === source.id) return false
          if (target.id === 'folder-locked' || nextParent?.id === 'folder-locked') return false
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
import { isBranchNode } from 'lazy-tree-view/utils'

<LazyTreeView
  initialTree={tree}
  loadChildren={loadChildren}
  allowDragAndDrop
  canDrop={({ source, target, nextParent }) => {
    // Prevent dropping a branch inside itself
    if (isBranchNode(source) && target.id === source.id) return false
    // Prevent dropping into or between items of locked folders
    if (target.id === 'folder-locked' || nextParent?.id === 'folder-locked') return false
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
          '- **Validation via `canDrop`**: the "Locked (no drop)" folder blocks drops on it and between its children (uses `nextParent`), and branches cannot be dropped inside themselves',
          '- **`onDrop` callback**: the log panel shows every drop event with source, target, and position',
          '',
          'Try dragging nodes between branches, reordering items, and dropping onto the locked folder to see the validation in action.',
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

// ---- Drag Handle Story ----

const DragHandleIcon: FC = () => (
  <svg
    width='14'
    height='14'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    style={{ cursor: 'grab', color: '#9ca3af', flexShrink: 0 }}
  >
    <circle cx='9' cy='5' r='1' /><circle cx='15' cy='5' r='1' />
    <circle cx='9' cy='12' r='1' /><circle cx='15' cy='12' r='1' />
    <circle cx='9' cy='19' r='1' /><circle cx='15' cy='19' r='1' />
  </svg>
)

const HandleBranch: FC<BranchProps> = ({ name, isOpen = false, depth, onToggleOpen, onDragStart }) => {
  const nodeRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent) => {
    if (nodeRef.current) e.dataTransfer.setDragImage(nodeRef.current, 0, 0)
    onDragStart?.(e)
  }

  return (
    <div
      ref={nodeRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        paddingLeft: `${8 + depth * 16}px`,
        borderRadius: 4,
        cursor: 'default',
      }}
      onClick={onToggleOpen}
    >
      <span draggable onDragStart={handleDragStart} style={{ display: 'flex', alignItems: 'center' }}>
        <DragHandleIcon />
      </span>
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ color: '#6b7280', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>
        <path d='m9 18 6-6-6-6' />
      </svg>
      <span style={{ fontSize: 14 }}>{name}</span>
    </div>
  )
}

const HandleItem: FC<BaseNodeProps> = ({ name, depth, onDragStart }) => {
  const nodeRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent) => {
    if (nodeRef.current) e.dataTransfer.setDragImage(nodeRef.current, 0, 0)
    onDragStart?.(e)
  }

  return (
    <div
      ref={nodeRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        paddingLeft: `${8 + depth * 16}px`,
        borderRadius: 4,
        cursor: 'default',
      }}
    >
      <span draggable onDragStart={handleDragStart} style={{ display: 'flex', alignItems: 'center' }}>
        <DragHandleIcon />
      </span>
      <span style={{ fontSize: 14, color: '#6b7280' }}>─</span>
      <span style={{ fontSize: 14 }}>{name}</span>
    </div>
  )
}

const DRAG_HANDLE_SOURCE_CODE = `
import LazyTreeView, { type BranchProps, type BaseNodeProps } from 'lazy-tree-view'

const DragHandleIcon = () => (/* your handle icon */)

const MyBranch = ({ name, isOpen, depth, onToggleOpen, onDragStart }: BranchProps) => (
  <div onClick={onToggleOpen}>
    {/* Only this element is draggable */}
    <span draggable onDragStart={onDragStart}>
      <DragHandleIcon />
    </span>
    <span>{name}</span>
  </div>
)

const MyItem = ({ name, depth, onDragStart }: BaseNodeProps) => (
  <div>
    <span draggable onDragStart={onDragStart}>
      <DragHandleIcon />
    </span>
    <span>{name}</span>
  </div>
)

<LazyTreeView
  initialTree={tree}
  loadChildren={loadChildren}
  useDragHandle         // disables drag on the whole node
  branch={MyBranch}
  item={MyItem}
/>
`.trim()

export const WithDragHandle: Story = {
  render: (args) => (
    <LazyTreeView
      {...args}
      initialTree={TREE}
      loadChildren={noop}
      useDragHandle
      branch={HandleBranch}
      item={HandleItem}
      style={{ minWidth: 260 }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: [
          'When `useDragHandle` is enabled, the entire node is no longer draggable.',
          'Instead, `onDragStart` is passed to your custom renderer so you can attach it to a specific handle element.',
          '',
          'This gives users precise control — they can click anywhere on the node without accidentally starting a drag.',
        ].join('\n'),
      },
      source: { code: DRAG_HANDLE_SOURCE_CODE, language: 'tsx' },
    },
  },
}
