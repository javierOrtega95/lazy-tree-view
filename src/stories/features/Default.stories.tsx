import type { Meta, StoryObj } from '@storybook/react'
import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { TreeNode } from '../../types/tree'
import { generateUUID } from '../../lazy-tree-view/utils/uuid'

const DEMO_TREE: TreeNode[] = [
  {
    id: generateUUID(),
    name: 'Getting Started',
    children: [
      { id: generateUUID(), name: 'Installation' },
      { id: generateUUID(), name: 'Quick Start' },
      { id: generateUUID(), name: 'TypeScript Setup' },
    ],
    isOpen: true,
    hasFetched: true,
  },
  {
    id: generateUUID(),
    name: 'Components',
    children: [
      {
        id: generateUUID(),
        name: 'Data Display',
        children: [
          { id: generateUUID(), name: 'Tree View' },
          { id: generateUUID(), name: 'Table' },
          { id: generateUUID(), name: 'List' },
        ],
        hasFetched: true,
      },
      {
        id: generateUUID(),
        name: 'Inputs',
        children: [],
      },
      {
        id: generateUUID(),
        name: 'Navigation',
        children: [],
      },
    ],
    isOpen: true,
    hasFetched: true,
  },
  {
    id: generateUUID(),
    name: 'Guides',
    children: [],
  },
  {
    id: generateUUID(),
    name: 'API Reference',
    children: [],
  },
  { id: generateUUID(), name: 'Changelog' },
  { id: generateUUID(), name: 'Contributing' },
]

const LAZY_CHILDREN: Record<string, TreeNode[]> = {
  Inputs: [
    { id: generateUUID(), name: 'Text Field' },
    { id: generateUUID(), name: 'Select' },
    { id: generateUUID(), name: 'Checkbox' },
    { id: generateUUID(), name: 'Radio' },
  ],
  Navigation: [
    { id: generateUUID(), name: 'Breadcrumbs' },
    { id: generateUUID(), name: 'Tabs' },
    { id: generateUUID(), name: 'Sidebar' },
  ],
  Guides: [
    { id: generateUUID(), name: 'Theming' },
    { id: generateUUID(), name: 'Customization' },
    { id: generateUUID(), name: 'Performance' },
    { id: generateUUID(), name: 'Accessibility' },
  ],
  'API Reference': [
    { id: generateUUID(), name: 'Props' },
    { id: generateUUID(), name: 'Hooks' },
    { id: generateUUID(), name: 'Types' },
    { id: generateUUID(), name: 'Utilities' },
  ],
}

async function loadChildren(branch: { name: string }): Promise<TreeNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400))
  return LAZY_CHILDREN[branch.name] ?? []
}

const meta: Meta<typeof LazyTreeView> = {
  title: 'Features/Default',
  component: LazyTreeView,
  parameters: {
    docs: {
      description: {
        component:
          'The core LazyTreeView component with default styling. Use the controls below to explore the available props.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    initialTree: DEMO_TREE,
    loadChildren,
    style: { minWidth: 300, minHeight: 400 },
  },
  argTypes: {
    // Required
    initialTree: {
      description: 'The initial tree structure to render.',
      control: 'object',
      table: { category: 'Required' },
    },
    loadChildren: {
      description: 'Async function called when a branch without children is expanded.',
      control: false,
      table: { category: 'Required' },
    },

    // Drag & Drop
    allowDragAndDrop: {
      description: 'Enable or disable drag & drop reordering.',
      control: 'boolean',
      table: { category: 'Drag & Drop', defaultValue: { summary: 'true' } },
    },
    useDragHandle: {
      description:
        'When enabled, nodes are only draggable via the `onDragStart` handler passed to custom components.',
      control: 'boolean',
      table: { category: 'Drag & Drop', defaultValue: { summary: 'false' } },
    },
    canDrop: {
      description: 'Validation function called during drag to determine if a drop is allowed.',
      control: false,
      table: { category: 'Drag & Drop' },
    },
    dragClassNames: {
      description:
        'Custom CSS class names applied during drag states (`dragOver`, `dragBefore`, `dragAfter`, `dropNotAllowed`).',
      control: 'object',
      table: { category: 'Drag & Drop' },
    },

    // Animation
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

    // Custom Components
    branch: {
      description: 'Custom React component to render branch nodes.',
      control: false,
      table: { category: 'Custom Components' },
    },
    item: {
      description: 'Custom React component to render item (leaf) nodes.',
      control: false,
      table: { category: 'Custom Components' },
    },
    branchProps: {
      description: 'Additional props passed to every branch component instance.',
      control: 'object',
      table: { category: 'Custom Components' },
    },
    itemProps: {
      description: 'Additional props passed to every item component instance.',
      control: 'object',
      table: { category: 'Custom Components' },
    },

    // Callbacks
    onDrop: {
      description: 'Called after a node is dropped in a new position.',
      table: { category: 'Callbacks' },
    },
    onTreeChange: {
      description: 'Called whenever the tree structure changes (drop, load, imperative mutations).',
      table: { category: 'Callbacks' },
    },
    onLoadStart: {
      description: 'Called when a branch starts loading its children.',
      table: { category: 'Callbacks' },
    },
    onLoadSuccess: {
      description: 'Called when children are successfully loaded.',
      table: { category: 'Callbacks' },
    },
    onLoadError: {
      description: 'Called when loading children fails.',
      table: { category: 'Callbacks' },
    },

    // Styling
    className: {
      description: 'Additional CSS class for the root `<ul>` element.',
      control: 'text',
      table: { category: 'Styling' },
    },
    style: {
      description: 'Inline styles for the root `<ul>` element.',
      control: 'object',
      table: { category: 'Styling' },
    },
  },
}

export default meta
type Story = StoryObj<typeof LazyTreeView>

export const Default: Story = {}
