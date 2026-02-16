import type { Meta, StoryObj } from '@storybook/react'
import { type FC, useCallback, useRef } from 'react'
import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { TreeNode } from '../../types/tree'
import type { BranchNode } from '../../types/tree'
import { generateUUID } from '../../lazy-tree-view/utils/uuid'

// ---- Demo data ----

const IDS = {
  failsTwice: generateUUID(),
  alwaysFails: generateUUID(),
  timeout: generateUUID(),
  intermittent: generateUUID(),
}

const TREE: TreeNode[] = [
  { id: IDS.failsTwice, name: 'Fails twice, then succeeds', children: [] },
  { id: IDS.alwaysFails, name: 'Always fails', children: [] },
  { id: IDS.timeout, name: 'Timeout error', children: [] },
  { id: IDS.intermittent, name: 'Intermittent (30% success)', children: [] },
]

const SUCCESS_CHILDREN: TreeNode[] = [
  { id: generateUUID(), name: 'Child A' },
  { id: generateUUID(), name: 'Child B' },
  { id: generateUUID(), name: 'Child C' },
]

// ---- Story component ----

type RetryLogEntry = {
  id: number
  branch: string
  attempt: number
  outcome: 'error' | 'success'
  message: string
}

const ErrorAndRetryDemo: FC = () => {
  const attemptsRef = useRef<Record<string, number>>({})
  const logsRef = useRef<RetryLogEntry[]>([])
  const logContainerRef = useRef<HTMLDivElement>(null)
  let logId = 0

  const addLog = useCallback((entry: Omit<RetryLogEntry, 'id'>) => {
    logsRef.current = [...logsRef.current.slice(-14), { ...entry, id: ++logId }]
    if (logContainerRef.current) {
      logContainerRef.current.innerHTML = logsRef.current
        .map(
          (log) =>
            `<div style="padding:3px 0;color:${log.outcome === 'error' ? '#d1242f' : '#1a7f37'}">` +
            `<span style="opacity:0.5">#${log.attempt}</span> ` +
            `<strong>${log.branch}</strong>: ${log.message}` +
            `</div>`,
        )
        .join('')
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [])

  const loadChildren = useCallback(
    async (branch: BranchNode): Promise<TreeNode[]> => {
      const key = branch.id
      attemptsRef.current[key] = (attemptsRef.current[key] ?? 0) + 1
      const attempt = attemptsRef.current[key]

      await new Promise((r) => setTimeout(r, 800))

      switch (branch.id) {
        case IDS.failsTwice: {
          if (attempt <= 2) {
            addLog({
              branch: branch.name,
              attempt,
              outcome: 'error',
              message: `Server error (attempt ${attempt}/2)`,
            })
            throw new Error(`Server error (attempt ${attempt})`)
          }
          addLog({
            branch: branch.name,
            attempt,
            outcome: 'success',
            message: 'Loaded successfully!',
          })
          return SUCCESS_CHILDREN.map((c) => ({ ...c, id: generateUUID() }))
        }

        case IDS.alwaysFails: {
          addLog({
            branch: branch.name,
            attempt,
            outcome: 'error',
            message: `403 Forbidden (attempt ${attempt})`,
          })
          throw new Error('403 Forbidden — access denied')
        }

        case IDS.timeout: {
          await new Promise((r) => setTimeout(r, 2000))
          addLog({
            branch: branch.name,
            attempt,
            outcome: 'error',
            message: `Request timeout (attempt ${attempt})`,
          })
          throw new Error('Request timeout after 3s')
        }

        case IDS.intermittent: {
          if (Math.random() > 0.3) {
            addLog({
              branch: branch.name,
              attempt,
              outcome: 'error',
              message: `Connection reset (attempt ${attempt})`,
            })
            throw new Error('Connection reset')
          }
          addLog({
            branch: branch.name,
            attempt,
            outcome: 'success',
            message: `Loaded on attempt ${attempt}`,
          })
          return [
            { id: generateUUID(), name: 'Lucky item' },
            { id: generateUUID(), name: 'Another item' },
          ]
        }

        default:
          return []
      }
    },
    [addLog],
  )

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', minHeight: 350 }}>
      <LazyTreeView
        initialTree={TREE}
        loadChildren={loadChildren}
        allowDragAndDrop={false}
        style={{ minWidth: 300 }}
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
          Retry Log
        </div>
        <div ref={logContainerRef}>
          <div style={{ color: '#8b949e' }}>
            Expand a branch to see error &amp; retry behavior...
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Meta & Story ----

const SOURCE_CODE = `
import LazyTreeView from 'lazy-tree-view'

// When loadChildren throws, the branch shows an error indicator.
// Clicking the branch again retries the load automatically.
async function loadChildren(branch) {
  const res = await fetch(\`/api/branches/\${branch.id}/children\`)
  if (!res.ok) throw new Error(\`\${res.status} \${res.statusText}\`)
  return res.json()
}

<LazyTreeView
  initialTree={tree}
  loadChildren={loadChildren}
  onLoadError={(branch, error) => {
    console.error(\`Failed to load "\${branch.name}":\`, error)
  }}
/>
`.trim()

const meta: Meta<typeof ErrorAndRetryDemo> = {
  title: 'Features/Error & Retry',
  component: ErrorAndRetryDemo,
  parameters: {
    docs: {
      description: {
        component: [
          'When `loadChildren` throws an error, the branch displays an error indicator (red dot) and stays collapsed.',
          'Clicking the branch again retries the load — no extra code needed.',
          '',
          'This demo showcases four scenarios:',
          '',
          '- **Fails twice, then succeeds** — Simulates a transient error that resolves on the third attempt',
          '- **Always fails** — Simulates a persistent 403 error',
          '- **Timeout error** — Simulates a slow request that times out',
          '- **Intermittent (30% success)** — Random failures that eventually succeed with enough retries',
          '',
          'The retry log on the right tracks every attempt with its outcome.',
        ].join('\n'),
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ErrorAndRetryDemo>

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: SOURCE_CODE, language: 'tsx' },
    },
  },
}
