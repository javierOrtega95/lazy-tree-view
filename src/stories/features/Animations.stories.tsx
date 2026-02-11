import type { Meta, StoryObj } from '@storybook/react'
import type { FC } from 'react'
import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { TreeNode } from '../../types/tree'
import { generateUUID } from '../../lazy-tree-view/utils/uuid'

// ---- Demo data (factory for independent tree instances) ----

function createTree(): TreeNode[] {
  return [
    {
      id: generateUUID(),
      name: 'Components',
      children: [
        { id: generateUUID(), name: 'Button' },
        { id: generateUUID(), name: 'Input' },
        { id: generateUUID(), name: 'Modal' },
      ],
      hasFetched: true,
    },
    {
      id: generateUUID(),
      name: 'Hooks',
      children: [
        { id: generateUUID(), name: 'useState' },
        { id: generateUUID(), name: 'useEffect' },
        { id: generateUUID(), name: 'useCallback' },
      ],
      hasFetched: true,
    },
    {
      id: generateUUID(),
      name: 'Utils',
      children: [
        { id: generateUUID(), name: 'format' },
        { id: generateUUID(), name: 'validate' },
      ],
      hasFetched: true,
    },
  ]
}

async function noop(): Promise<TreeNode[]> {
  return []
}

// ---- Story component ----

type AnimationsProps = {
  animationDuration: number
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#656d76',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: 8,
}

const AnimationsDemo: FC<AnimationsProps> = ({ animationDuration = 300 }) => {
  return (
    <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', minHeight: 350 }}>
      <div>
        <div style={labelStyle}>Animated ({animationDuration}ms)</div>
        <LazyTreeView
          initialTree={createTree()}
          loadChildren={noop}
          allowDragAndDrop={false}
          animationDuration={animationDuration}
          style={{ minWidth: 200 }}
        />
      </div>

      <div>
        <div style={labelStyle}>No animations</div>
        <LazyTreeView
          initialTree={createTree()}
          loadChildren={noop}
          allowDragAndDrop={false}
          disableAnimations
          style={{ minWidth: 200 }}
        />
      </div>
    </div>
  )
}

// ---- Meta & Story ----

const SOURCE_CODE = `
import LazyTreeView from 'lazy-tree-view'

// With custom animation duration
<LazyTreeView
  initialTree={tree}
  loadChildren={loadChildren}
  animationDuration={500}
/>

// With animations disabled
<LazyTreeView
  initialTree={tree}
  loadChildren={loadChildren}
  disableAnimations
/>
`.trim()

const meta: Meta<typeof AnimationsDemo> = {
  title: 'Features/Animations',
  component: AnimationsDemo,
  parameters: {
    docs: {
      description: {
        component:
          'Side-by-side comparison of expand/collapse animations. The left tree uses the configured duration, the right tree has animations disabled. Use the slider to adjust the animation speed.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    animationDuration: 300,
  },
  argTypes: {
    animationDuration: {
      description: 'Duration of expand/collapse animations in milliseconds.',
      control: { type: 'range', min: 0, max: 1000, step: 50 },
      table: { defaultValue: { summary: '300' } },
    },
  },
}

export default meta
type Story = StoryObj<typeof AnimationsDemo>

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: SOURCE_CODE, language: 'tsx' },
    },
  },
}
