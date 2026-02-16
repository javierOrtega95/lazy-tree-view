import type { Meta, StoryObj } from '@storybook/react'
import { type FC, useCallback, useRef, useState } from 'react'
import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { TreeNode } from '../../types/tree'
import type { BranchNode } from '../../types/tree'
import type { DropData } from '../../types/dnd'
import { generateUUID } from '../../lazy-tree-view/utils/uuid'

// ---- Demo data ----

const TREE: TreeNode[] = [
  {
    id: generateUUID(),
    name: 'Documents',
    children: [
      { id: generateUUID(), name: 'README.md' },
      { id: generateUUID(), name: 'LICENSE' },
    ],
    isOpen: true,
    hasFetched: true,
  },
  {
    id: generateUUID(),
    name: 'Source',
    children: [],
  },
  {
    id: generateUUID(),
    name: 'Unstable (50% error)',
    children: [],
  },
  { id: generateUUID(), name: 'config.yaml' },
]

const LAZY_CHILDREN: Record<string, TreeNode[]> = {
  Source: [
    { id: generateUUID(), name: 'index.ts' },
    { id: generateUUID(), name: 'utils.ts' },
  ],
}

// ---- Log types ----

type LogEntry = {
  id: number
  timestamp: string
  callback: string
  color: string
  details: string
}

const CALLBACK_COLORS: Record<string, string> = {
  onLoadStart: '#9a6700',
  onLoadSuccess: '#1a7f37',
  onLoadError: '#d1242f',
  onDrop: '#0969da',
  onTreeChange: '#656d76',
}

// ---- Filter chips ----

const ALL_CALLBACKS = ['onLoadStart', 'onLoadSuccess', 'onLoadError', 'onDrop', 'onTreeChange']

type FilterChipProps = {
  label: string
  active: boolean
  color: string
  onClick: () => void
}

const FilterChip: FC<FilterChipProps> = ({ label, active, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      fontSize: 10,
      fontFamily: 'monospace',
      padding: '2px 8px',
      borderRadius: 12,
      border: `1px solid ${active ? color : '#d1d9e0'}`,
      background: active ? `${color}14` : 'transparent',
      color: active ? color : '#8b949e',
      cursor: 'pointer',
      fontWeight: active ? 600 : 400,
    }}
  >
    {label}
  </button>
)

// ---- Story component ----

const CallbacksDemo: FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filters, setFilters] = useState<Set<string>>(new Set(ALL_CALLBACKS))
  const logIdRef = useRef(0)
  const logEndRef = useRef<HTMLDivElement>(null)

  const now = () => new Date().toLocaleTimeString('en-US', { hour12: false })

  const addLog = useCallback((callback: string, details: string) => {
    setLogs((prev) => [
      ...prev.slice(-29),
      {
        id: ++logIdRef.current,
        timestamp: now(),
        callback,
        color: CALLBACK_COLORS[callback],
        details,
      },
    ])
    requestAnimationFrame(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }, [])

  const toggleFilter = useCallback((cb: string) => {
    setFilters((prev) => {
      const next = new Set(prev)
      if (next.has(cb)) next.delete(cb)
      else next.add(cb)
      return next
    })
  }, [])

  const loadChildren = useCallback(
    async (branch: BranchNode): Promise<TreeNode[]> => {
      await new Promise((r) => setTimeout(r, 800))

      if (branch.name === 'Unstable (50% error)') {
        if (Math.random() < 0.5) throw new Error('Connection refused')
        return [{ id: generateUUID(), name: 'Recovered item' }]
      }

      return (LAZY_CHILDREN[branch.name] ?? []).map((c) => ({ ...c, id: generateUUID() }))
    },
    [],
  )

  const handleLoadStart = useCallback(
    (branch: BranchNode) => addLog('onLoadStart', `"${branch.name}" loading...`),
    [addLog],
  )

  const handleLoadSuccess = useCallback(
    (branch: BranchNode, children: TreeNode[]) =>
      addLog('onLoadSuccess', `"${branch.name}" → ${children.length} children`),
    [addLog],
  )

  const handleLoadError = useCallback(
    (branch: BranchNode, error: unknown) =>
      addLog('onLoadError', `"${branch.name}" → ${(error as Error).message}`),
    [addLog],
  )

  const handleDrop = useCallback(
    (data: DropData) =>
      addLog('onDrop', `"${data.source.name}" ${data.position} "${data.target.name}"`),
    [addLog],
  )

  const handleTreeChange = useCallback(
    () => addLog('onTreeChange', 'Tree structure updated'),
    [addLog],
  )

  const filteredLogs = logs.filter((log) => filters.has(log.callback))

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', minHeight: 350 }}>
      <LazyTreeView
        initialTree={TREE}
        loadChildren={loadChildren}
        allowDragAndDrop
        onLoadStart={handleLoadStart}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        onDrop={handleDrop}
        onTreeChange={handleTreeChange}
        style={{ minWidth: 260 }}
      />

      <div
        style={{
          flex: 1,
          minWidth: 320,
          fontSize: 12,
          fontFamily: 'monospace',
          background: '#f6f8fa',
          borderRadius: 6,
          padding: 12,
          border: '1px solid #d1d9e0',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 600, color: '#656d76', fontSize: 11 }}>Event Log</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {ALL_CALLBACKS.map((cb) => (
              <FilterChip
                key={cb}
                label={cb}
                active={filters.has(cb)}
                color={CALLBACK_COLORS[cb]}
                onClick={() => toggleFilter(cb)}
              />
            ))}
          </div>
        </div>

        <div style={{ minHeight: 200, maxHeight: 300, overflow: 'auto' }}>
          {filteredLogs.length === 0 && (
            <div style={{ color: '#8b949e', padding: '8px 0' }}>
              Expand, collapse, or drag nodes to see events...
            </div>
          )}
          {filteredLogs.map((log) => (
            <div key={log.id} style={{ padding: '3px 0', color: '#1f2328' }}>
              <span style={{ color: '#8b949e' }}>{log.timestamp}</span>{' '}
              <span style={{ color: log.color, fontWeight: 600 }}>{log.callback}</span>{' '}
              {log.details}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  )
}

// ---- Meta & Story ----

const SOURCE_CODE = `
import LazyTreeView from 'lazy-tree-view'

<LazyTreeView
  initialTree={tree}
  loadChildren={loadChildren}
  onLoadStart={(branch) =>
    console.log('Loading:', branch.name)
  }
  onLoadSuccess={(branch, children) =>
    console.log('Loaded:', branch.name, children.length)
  }
  onLoadError={(branch, error) =>
    console.error('Error:', branch.name, error.message)
  }
  onDrop={({ source, target, position }) =>
    console.log(\`Moved "\${source.name}" \${position} "\${target.name}"\`)
  }
  onTreeChange={(tree) =>
    console.log('Tree changed:', tree.length, 'root nodes')
  }
/>
`.trim()

const meta: Meta<typeof CallbacksDemo> = {
  title: 'Features/Callbacks',
  component: CallbacksDemo,
  parameters: {
    docs: {
      description: {
        component: [
          'All available callbacks in a single demo. The event log on the right shows every callback as it fires in real time.',
          '',
          '| Callback | Fires when |',
          '| --- | --- |',
          '| `onLoadStart` | A branch begins fetching children |',
          '| `onLoadSuccess` | Children are loaded successfully |',
          '| `onLoadError` | Loading children fails |',
          '| `onDrop` | A node is dropped in a new position |',
          '| `onTreeChange` | The tree structure changes (load, drop, expand, collapse) |',
          '',
          'Use the filter chips to focus on specific callbacks.',
        ].join('\n'),
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CallbacksDemo>

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: SOURCE_CODE, language: 'tsx' },
    },
  },
}
