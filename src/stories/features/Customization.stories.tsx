import type { Meta, StoryObj } from '@storybook/react'
import { type FC, useCallback, useRef } from 'react'
import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { BaseNodeProps, FolderProps, LazyTreeViewHandle } from '../../lazy-tree-view/types'
import type { TreeNode } from '../../types/tree'
import '../assets/styles/customization.css'

// ---- Types ----

type Priority = 'high' | 'medium' | 'low'

type TaskData = {
  priority: Priority
  done: boolean
}

type CategoryData = {
  color: string
}

type TaskExtra = {
  onToggle?: (id: string) => void
}

// ---- Demo data ----

const INITIAL_TREE: TreeNode<{ data?: TaskData | CategoryData }>[] = [
  {
    id: 'cat-work',
    name: 'Work',
    data: { color: '#3b82f6' },
    children: [
      { id: 'task-1', name: 'Review pull requests', data: { priority: 'high', done: false } },
      { id: 'task-2', name: 'Update documentation', data: { priority: 'medium', done: true } },
      { id: 'task-3', name: 'Fix failing tests', data: { priority: 'high', done: false } },
      { id: 'task-4', name: 'Prepare demo', data: { priority: 'low', done: false } },
    ],
    isOpen: true,
    hasFetched: true,
  },
  {
    id: 'cat-personal',
    name: 'Personal',
    data: { color: '#10b981' },
    children: [
      { id: 'task-5', name: 'Grocery shopping', data: { priority: 'medium', done: false } },
      { id: 'task-6', name: 'Book dentist appointment', data: { priority: 'low', done: true } },
      { id: 'task-7', name: 'Pay electricity bill', data: { priority: 'high', done: false } },
    ],
    isOpen: true,
    hasFetched: true,
  },
  {
    id: 'cat-learning',
    name: 'Learning',
    data: { color: '#f59e0b' },
    children: [
      { id: 'task-8', name: 'Read React docs', data: { priority: 'medium', done: true } },
      { id: 'task-9', name: 'Watch TypeScript course', data: { priority: 'low', done: false } },
    ],
    isOpen: true,
    hasFetched: true,
  },
]

async function noop(): Promise<TreeNode[]> {
  return []
}

// ---- SVG Icons ----

const svgDefaults = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 14,
  height: 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const ChevronIcon: FC = () => (
  <svg {...svgDefaults}>
    <path d='m9 18 6-6-6-6' />
  </svg>
)

const CheckIcon: FC = () => (
  <svg {...svgDefaults} width={12} height={12}>
    <path d='M20 6 9 17l-5-5' />
  </svg>
)

// ---- Custom Renderers ----

const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Mid',
  low: 'Low',
}

const TaskFolder: FC<FolderProps<{ data?: CategoryData }> & TaskExtra> = ({
  name,
  children,
  isOpen = false,
  depth,
  data,
  onToggleOpen,
}) => {
  const doneCount = children.filter(
    (c) => (c as { data?: TaskData }).data && (c as { data?: TaskData }).data?.done,
  ).length

  return (
    <div
      className='cust-folder'
      style={{ '--depth': depth } as React.CSSProperties}
      onClick={onToggleOpen}
    >
      <span className={`cust-folder__chevron ${isOpen ? 'cust-folder__chevron--open' : ''}`}>
        <ChevronIcon />
      </span>
      <span className='cust-folder__color' style={{ background: data?.color ?? '#94a3b8' }} />
      <span className='cust-folder__name'>{name}</span>
      <span className='cust-folder__progress'>
        {doneCount}/{children.length}
      </span>
    </div>
  )
}

const TaskItem: FC<BaseNodeProps<{ data?: TaskData }> & TaskExtra> = ({
  id,
  name,
  depth,
  data,
  onToggle,
}) => {
  const done = data?.done ?? false
  const priority = data?.priority ?? 'low'

  return (
    <div
      className={`cust-item ${done ? 'cust-item--done' : ''}`}
      style={{ '--depth': depth } as React.CSSProperties}
    >
      <button
        className={`cust-item__check ${done ? 'cust-item__check--checked' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggle?.(id)
        }}
      >
        {done && <CheckIcon />}
      </button>
      <span className='cust-item__name'>{name}</span>
      <span className={`cust-item__priority cust-item__priority--${priority}`}>
        {PRIORITY_LABELS[priority]}
      </span>
    </div>
  )
}

// ---- Story Component ----

type CustomizationProps = {
  disableAnimations: boolean
  animationDuration: number
}

const CustomizationDemo: FC<CustomizationProps> = ({
  disableAnimations = false,
  animationDuration = 300,
}) => {
  const treeRef = useRef<LazyTreeViewHandle>(null)

  const handleToggle = useCallback((taskId: string) => {
    const node = treeRef.current?.getNode(taskId) as { data?: TaskData } | undefined
    if (!node?.data) return
    treeRef.current?.updateNode(taskId, { data: { ...node.data, done: !node.data.done } })
  }, [])

  return (
    <div className='cust-demo'>
      <div className='cust-window'>
        <div className='cust-window__titlebar'>
          <div className='cust-window__dots'>
            <span className='cust-window__dot cust-window__dot--red' />
            <span className='cust-window__dot cust-window__dot--yellow' />
            <span className='cust-window__dot cust-window__dot--green' />
          </div>
          <span className='cust-window__title'>Tasks</span>
        </div>
        <div className='cust-tree'>
          <LazyTreeView
            ref={treeRef}
            initialTree={INITIAL_TREE}
            loadChildren={noop}
            folder={TaskFolder}
            item={TaskItem}
            itemProps={{ onToggle: handleToggle }}
            disableAnimations={disableAnimations}
            animationDuration={animationDuration}
          />
        </div>
      </div>
    </div>
  )
}

// ---- Meta & Story ----

const SOURCE_CODE = `
import { useCallback, useState } from 'react'
import LazyTreeView, { type BaseNodeProps, type FolderProps } from 'lazy-tree-view'

type TaskData = { priority: 'high' | 'medium' | 'low'; done: boolean }
type CategoryData = { color: string }

// Custom folder renderer
const TaskFolder: FC<FolderProps<{ data?: CategoryData }>> = ({
  name, children, isOpen, depth, data, onToggleOpen,
}) => (
  <div onClick={onToggleOpen}>
    <span style={{ background: data?.color }} />
    <span>{name}</span>
    <span>{doneCount}/{children.length}</span>
  </div>
)

// Custom item renderer with extra props via itemProps
const TaskItem: FC<BaseNodeProps<{ data?: TaskData }> & { onToggle?: (id: string) => void }> = ({
  id, name, data, onToggle,
}) => (
  <div>
    <button onClick={() => onToggle?.(id)}>
      {data?.done ? '✓' : '○'}
    </button>
    <span>{name}</span>
    <span>{data?.priority}</span>
  </div>
)

<LazyTreeView
  initialTree={tree}
  loadChildren={loadChildren}
  folder={TaskFolder}             // custom folder component
  item={TaskItem}                 // custom item component
  itemProps={{ onToggle: handleToggle }}  // extra props for items
/>
`.trim()

const meta: Meta<typeof CustomizationDemo> = {
  title: 'Features/Customization',
  component: CustomizationDemo,
  parameters: {
    docs: {
      description: {
        component: [
          'Demonstrates how to fully customize the tree appearance using custom renderers:',
          '',
          '- **Custom `folder` component**: category header with color dot, name, and progress counter (done/total)',
          '- **Custom `item` component**: task row with checkbox, name, and priority badge',
          '- **`itemProps` for callbacks**: the `onToggle` function is passed via `itemProps` so each task item can toggle its done state',
          '- **Generic types**: `FolderProps<{ data?: CategoryData }>` and `BaseNodeProps<{ data?: TaskData }>` provide type-safe access to custom data',
          '',
          'Click any checkbox to toggle a task. The category progress counter updates automatically.',
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
type Story = StoryObj<typeof CustomizationDemo>

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: SOURCE_CODE, language: 'tsx' },
    },
  },
}
