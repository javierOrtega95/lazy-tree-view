import type { Meta, StoryObj } from '@storybook/react'
import type { FC } from 'react'
import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { TreeNode } from '../../types/tree'
import { generateUUID } from '../../lazy-tree-view/utils/uuid'

// ---- Demo data ----

const TREE: TreeNode[] = [
  {
    id: generateUUID(),
    name: 'Fruits',
    children: [
      { id: generateUUID(), name: 'Apple' },
      { id: generateUUID(), name: 'Banana' },
      { id: generateUUID(), name: 'Cherry' },
    ],
    isOpen: true,
    hasFetched: true,
  },
  {
    id: generateUUID(),
    name: 'Vegetables',
    children: [
      { id: generateUUID(), name: 'Carrot' },
      { id: generateUUID(), name: 'Broccoli' },
      {
        id: generateUUID(),
        name: 'Peppers',
        children: [
          { id: generateUUID(), name: 'Red' },
          { id: generateUUID(), name: 'Green' },
          { id: generateUUID(), name: 'Yellow' },
        ],
        hasFetched: true,
      },
    ],
    isOpen: true,
    hasFetched: true,
  },
  { id: generateUUID(), name: 'Grains' },
  { id: generateUUID(), name: 'Dairy' },
]

async function noop(): Promise<TreeNode[]> {
  return []
}

// ---- Keyboard shortcut table ----

const SHORTCUTS = [
  { key: '↑ / ↓', action: 'Navigate between visible nodes' },
  { key: '→', action: 'Expand folder or move to first child' },
  { key: '←', action: 'Collapse folder or move to parent' },
  { key: 'Enter / Space', action: 'Toggle folder open/close' },
  { key: 'Home', action: 'Jump to the first node' },
  { key: 'End', action: 'Jump to the last visible node' },
  { key: 'Tab', action: 'Move to next node' },
  { key: 'Shift + Tab', action: 'Move to previous node' },
]

// ---- Story component ----

type KeyboardNavProps = {
  disableAnimations: boolean
  animationDuration: number
}

const KeyboardNavigationDemo: FC<KeyboardNavProps> = ({
  disableAnimations = false,
  animationDuration = 300,
}) => {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', minHeight: 380 }}>
      <div style={{ minWidth: 240 }}>
        <LazyTreeView
          initialTree={TREE}
          loadChildren={noop}
          allowDragAndDrop={false}
          disableAnimations={disableAnimations}
          animationDuration={animationDuration}
          style={{ minWidth: 220 }}
        />
      </div>

      <table
        style={{
          fontSize: 13,
          borderCollapse: 'collapse',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: '8px 16px',
                borderBottom: '2px solid #d1d9e0',
                color: '#1f2328',
                fontWeight: 600,
              }}
            >
              Key
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '8px 16px',
                borderBottom: '2px solid #d1d9e0',
                color: '#1f2328',
                fontWeight: 600,
              }}
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {SHORTCUTS.map((s) => (
            <tr key={s.key}>
              <td style={{ padding: '6px 16px', borderBottom: '1px solid #e8eaed' }}>
                <kbd
                  style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: '#1f2328',
                    background: '#f6f8fa',
                    border: '1px solid #d1d9e0',
                    borderRadius: 4,
                    boxShadow: '0 1px 0 #d1d9e0',
                  }}
                >
                  {s.key}
                </kbd>
              </td>
              <td
                style={{
                  padding: '6px 16px',
                  borderBottom: '1px solid #e8eaed',
                  color: '#656d76',
                }}
              >
                {s.action}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---- Meta & Story ----

const SOURCE_CODE = `
import LazyTreeView from 'lazy-tree-view'

// Keyboard navigation is built-in.
// Just render the tree and it works:
// Arrow keys, Home/End, Enter/Space, Tab

<LazyTreeView
  initialTree={tree}
  loadChildren={loadChildren}
/>
`.trim()

const meta: Meta<typeof KeyboardNavigationDemo> = {
  title: 'Features/Keyboard Navigation',
  component: KeyboardNavigationDemo,
  parameters: {
    docs: {
      description: {
        component:
          'Full ARIA tree keyboard navigation following the [WAI-ARIA TreeView pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/). Click any node to set focus, then navigate with the keyboard. The table on the right shows all supported shortcuts.',
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
type Story = StoryObj<typeof KeyboardNavigationDemo>

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: SOURCE_CODE, language: 'tsx' },
    },
  },
}
