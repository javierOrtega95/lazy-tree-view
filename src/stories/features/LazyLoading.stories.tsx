import type { Meta, StoryObj } from '@storybook/react'
import { type FC, useCallback, useState } from 'react'
import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { TreeNode } from '../../types/tree'
import type { BranchNode } from '../../types/tree'
import { generateUUID } from '../../lazy-tree-view/utils/uuid'

// ---- Demo data ----

const TREE: TreeNode[] = [
  { id: generateUUID(), name: 'Always succeeds', children: [] },
  { id: generateUUID(), name: 'Always fails', children: [] },
  { id: generateUUID(), name: 'Slow load (3s)', children: [] },
  { id: generateUUID(), name: 'Random (50% error)', children: [] },
]

const SUCCESS_CHILDREN: TreeNode[] = [
  { id: generateUUID(), name: 'Child A' },
  { id: generateUUID(), name: 'Child B' },
  { id: generateUUID(), name: 'Child C' },
]

// ---- Story component ----

type LogEntry = {
  id: number
  type: 'start' | 'success' | 'error'
  branch: string
  message: string
}

type LazyLoadingProps = {
  disableAnimations: boolean
  animationDuration: number
}

const LazyLoadingDemo: FC<LazyLoadingProps> = ({
  disableAnimations = false,
  animationDuration = 300,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  let logId = 0

  const addLog = useCallback(
    (type: LogEntry['type'], branch: string, message: string) => {
      setLogs((prev) => [...prev.slice(-9), { id: ++logId, type, branch, message }])
    },
    [logId],
  )

  const loadChildren = useCallback(async (branch: BranchNode): Promise<TreeNode[]> => {
    switch (branch.name) {
      case 'Always succeeds': {
        await new Promise((r) => setTimeout(r, 800))
        return SUCCESS_CHILDREN.map((c) => ({ ...c, id: generateUUID() }))
      }
      case 'Always fails': {
        await new Promise((r) => setTimeout(r, 800))
        throw new Error('Server error: permission denied')
      }
      case 'Slow load (3s)': {
        await new Promise((r) => setTimeout(r, 3000))
        return [
          { id: generateUUID(), name: 'Finally loaded!' },
          { id: generateUUID(), name: 'Worth the wait' },
        ]
      }
      case 'Random (50% error)': {
        await new Promise((r) => setTimeout(r, 600))
        if (Math.random() < 0.5) throw new Error('Network timeout')
        return [{ id: generateUUID(), name: 'Lucky load' }]
      }
      default:
        return []
    }
  }, [])

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', minHeight: 350 }}>
      <LazyTreeView
        initialTree={TREE}
        loadChildren={loadChildren}
        disableAnimations={disableAnimations}
        animationDuration={animationDuration}
        allowDragAndDrop={false}
        onLoadStart={(branch) => addLog('start', branch.name, 'Loading...')}
        onLoadSuccess={(branch, children) =>
          addLog('success', branch.name, `Loaded ${children.length} items`)
        }
        onLoadError={(branch, error) => addLog('error', branch.name, (error as Error).message)}
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
          Callback Log
        </div>
        {logs.length === 0 && (
          <div style={{ color: '#8b949e' }}>Expand a branch to see callbacks...</div>
        )}
        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              padding: '3px 0',
              color:
                log.type === 'error' ? '#d1242f' : log.type === 'success' ? '#1a7f37' : '#656d76',
            }}
          >
            <span style={{ opacity: 0.6 }}>[{log.type}]</span> {log.branch}: {log.message}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Meta & Story ----

const SOURCE_CODE = `
import LazyTreeView from 'lazy-tree-view'

async function loadChildren(branch) {
  const res = await fetch(\`/api/branches/\${branch.id}/children\`)
  if (!res.ok) throw new Error('Failed to load')
  return res.json()
}

<LazyTreeView
  initialTree={tree}
  loadChildren={loadChildren}
  onLoadStart={(branch) => console.log('Loading:', branch.name)}
  onLoadSuccess={(branch, children) => console.log('Loaded:', children.length)}
  onLoadError={(branch, error) => console.error('Error:', error.message)}
/>
`.trim()

const meta: Meta<typeof LazyLoadingDemo> = {
  title: 'Features/Lazy Loading',
  component: LazyLoadingDemo,
  parameters: {
    docs: {
      description: {
        component:
          'Demonstrates the full lazy loading lifecycle: loading spinner, success, and error states with retry. Each branch simulates a different scenario. The callback log on the right shows `onLoadStart`, `onLoadSuccess`, and `onLoadError` events in real time.',
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
type Story = StoryObj<typeof LazyLoadingDemo>

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: SOURCE_CODE, language: 'tsx' },
    },
  },
}
