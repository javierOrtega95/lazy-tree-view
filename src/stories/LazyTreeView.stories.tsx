import type { Meta, StoryObj } from '@storybook/react'
import { type FC, useRef, useState } from 'react'
import LazyTreeView from '../lazy-tree-view/LazyTreeView'
import type { LazyTreeViewHandle } from '../lazy-tree-view/types'
import { DropPosition } from '../types/dnd'
import type { TreeNode } from '../types/tree'
import {
  ClipboardListIcon,
  MoveIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from './assets/icons/file-icons'
import './assets/styles/imperative-api.css'
import { generateUUID } from '../lazy-tree-view/utils/uuid'

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

async function loadChildren(folder: { name: string }): Promise<TreeNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400))
  return LAZY_CHILDREN[folder.name] ?? []
}

const meta: Meta<typeof LazyTreeView> = {
  title: 'LazyTreeView',
  component: LazyTreeView,
  parameters: {
    docs: {
      description: {
        component: 'The core component with default styling and no customization.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    initialTree: DEMO_TREE,
    loadChildren,
    style: { minWidth: 300 },
  },
  argTypes: {
    // Required
    initialTree: {
      description: 'The initial tree structure to render.',
      control: 'object',
      table: { category: 'Required' },
    },
    loadChildren: {
      description: 'Async function called when a folder without children is expanded.',
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
    folder: {
      description: 'Custom React component to render folder nodes.',
      control: false,
      table: { category: 'Custom Components' },
    },
    item: {
      description: 'Custom React component to render item (leaf) nodes.',
      control: false,
      table: { category: 'Custom Components' },
    },
    folderProps: {
      description: 'Additional props passed to every folder component instance.',
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
      description: 'Called when a folder starts loading its children.',
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

export const WithoutDragAndDrop: Story = {
  args: {
    allowDragAndDrop: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tree with drag & drop disabled. Nodes cannot be reordered.',
      },
    },
  },
}

export const WithoutAnimations: Story = {
  args: {
    disableAnimations: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tree with expand/collapse animations disabled for instant transitions.',
      },
    },
  },
}

async function loadChildrenWithError(): Promise<TreeNode[]> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  throw new Error('Network error: Failed to load folder contents')
}

export const ErrorHandling: Story = {
  args: {
    loadChildren: loadChildrenWithError,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates error handling when `loadChildren` fails. Expand a folder to see the error state. Click again to retry.',
      },
    },
  },
}

// ---- Imperative API helpers ----

function collectFolders(nodes: TreeNode[], prefix = ''): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = []
  for (const node of nodes) {
    if ('children' in node) {
      const label = prefix ? `${prefix} / ${node.name}` : node.name
      result.push({ id: node.id, label })
      result.push(...collectFolders(node.children, label))
    }
  }
  return result
}

function useDialog() {
  const ref = useRef<HTMLDialogElement>(null)
  return {
    ref,
    open: () => ref.current?.showModal(),
    close: () => ref.current?.close(),
  }
}

// ---- Imperative API demo component ----

const ImperativeApiDemo: FC = () => {
  const treeRef = useRef<LazyTreeViewHandle>(null)
  const nodeCounterRef = useRef(100)

  // Dialog state
  const addDialog = useDialog()
  const removeDialog = useDialog()
  const renameDialog = useDialog()
  const treeDialog = useDialog()

  // Form state
  const [addName, setAddName] = useState('')
  const [addType, setAddType] = useState<'item' | 'folder'>('item')
  const [addParent, setAddParent] = useState<string>('__root__')
  const [removeTarget, setRemoveTarget] = useState<string>('')
  const [renameName, setRenameName] = useState('')
  const [renameTarget, setRenameTarget] = useState<string>('')
  const [treeJson, setTreeJson] = useState('')

  const getFolders = () => collectFolders(treeRef.current?.getTree() ?? [])
  const getAllNodes = () => {
    const flat: { id: string; name: string }[] = []
    const walk = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        flat.push({ id: n.id, name: n.name })
        if ('children' in n) walk(n.children)
      }
    }
    walk(treeRef.current?.getTree() ?? [])
    return flat
  }

  const handleAddOpen = () => {
    setAddName('')
    setAddType('item')
    setAddParent('__root__')
    addDialog.open()
  }

  const handleAddConfirm = () => {
    if (!addName.trim()) return
    const nodeId = `imp-${++nodeCounterRef.current}`
    const parentId = addParent === '__root__' ? null : addParent
    const node: TreeNode =
      addType === 'folder'
        ? { id: nodeId, name: addName.trim(), children: [], hasFetched: true }
        : { id: nodeId, name: addName.trim() }
    treeRef.current?.addNode(parentId, node)
    addDialog.close()
  }

  const handleRemoveOpen = () => {
    const nodes = getAllNodes()
    if (!nodes.length) return
    setRemoveTarget(nodes[0].id)
    removeDialog.open()
  }

  const handleRemoveConfirm = () => {
    if (!removeTarget) return
    treeRef.current?.removeNode(removeTarget)
    removeDialog.close()
  }

  const handleRenameOpen = () => {
    const nodes = getAllNodes()
    if (!nodes.length) return
    setRenameTarget(nodes[0].id)
    setRenameName(nodes[0].name)
    renameDialog.open()
  }

  const handleRenameConfirm = () => {
    if (!renameName.trim() || !renameTarget) return
    treeRef.current?.updateNode(renameTarget, { name: renameName.trim() })
    renameDialog.close()
  }

  const handleMove = () => {
    const tree = treeRef.current?.getTree()
    if (!tree || tree.length < 2) return
    const last = tree[tree.length - 1]
    const first = tree[0]
    treeRef.current?.moveNode(last.id, first.id, DropPosition.Before)
  }

  const handleGetTree = () => {
    const tree = treeRef.current?.getTree()
    setTreeJson(JSON.stringify(tree, null, 2))
    treeDialog.open()
  }

  return (
    <div className='imp-demo'>
      {/* Toolbar */}
      <div className='imp-toolbar'>
        <button className='imp-toolbar__btn' onClick={handleAddOpen}>
          <PlusIcon /> Add
        </button>
        <button className='imp-toolbar__btn' onClick={handleRemoveOpen}>
          <TrashIcon /> Remove
        </button>
        <button className='imp-toolbar__btn' onClick={handleRenameOpen}>
          <PencilIcon /> Rename
        </button>
        <div className='imp-toolbar__separator' />
        <button className='imp-toolbar__btn' onClick={handleMove}>
          <MoveIcon /> Move
        </button>
        <button className='imp-toolbar__btn' onClick={handleGetTree}>
          <ClipboardListIcon /> Tree
        </button>
      </div>

      {/* Tree */}
      <div className='imp-tree'>
        <LazyTreeView ref={treeRef} initialTree={DEMO_TREE} loadChildren={loadChildren} />
      </div>

      {/* Add Node Dialog */}
      <dialog ref={addDialog.ref} className='imp-dialog'>
        <div className='imp-dialog__header'>
          <h3 className='imp-dialog__title'>Add Node</h3>
          <p className='imp-dialog__subtitle'>Create a new node in the tree.</p>
        </div>
        <div className='imp-dialog__body'>
          <div className='imp-dialog__field'>
            <label className='imp-dialog__label'>Name</label>
            <input
              className='imp-dialog__input'
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder='Node name'
              onKeyDown={(e) => e.key === 'Enter' && handleAddConfirm()}
            />
          </div>
          <div className='imp-dialog__field'>
            <label className='imp-dialog__label'>Type</label>
            <select
              className='imp-dialog__select'
              value={addType}
              onChange={(e) => setAddType(e.target.value as 'item' | 'folder')}
            >
              <option value='item'>Item</option>
              <option value='folder'>Folder</option>
            </select>
          </div>
          <div className='imp-dialog__field'>
            <label className='imp-dialog__label'>Parent</label>
            <select
              className='imp-dialog__select'
              value={addParent}
              onChange={(e) => setAddParent(e.target.value)}
            >
              <option value='__root__'>Root</option>
              {getFolders().map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='imp-dialog__footer'>
          <button className='imp-dialog__btn imp-dialog__btn--secondary' onClick={addDialog.close}>
            Cancel
          </button>
          <button className='imp-dialog__btn imp-dialog__btn--primary' onClick={handleAddConfirm}>
            Add
          </button>
        </div>
      </dialog>

      {/* Remove Node Dialog */}
      <dialog ref={removeDialog.ref} className='imp-dialog'>
        <div className='imp-dialog__header'>
          <h3 className='imp-dialog__title'>Remove Node</h3>
          <p className='imp-dialog__subtitle'>Select a node to remove from the tree.</p>
        </div>
        <div className='imp-dialog__body'>
          <div className='imp-dialog__field'>
            <label className='imp-dialog__label'>Node</label>
            <select
              className='imp-dialog__select'
              value={removeTarget}
              onChange={(e) => setRemoveTarget(e.target.value)}
            >
              {getAllNodes().map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='imp-dialog__footer'>
          <button
            className='imp-dialog__btn imp-dialog__btn--secondary'
            onClick={removeDialog.close}
          >
            Cancel
          </button>
          <button
            className='imp-dialog__btn imp-dialog__btn--primary'
            onClick={handleRemoveConfirm}
          >
            Remove
          </button>
        </div>
      </dialog>

      {/* Rename Dialog */}
      <dialog ref={renameDialog.ref} className='imp-dialog'>
        <div className='imp-dialog__header'>
          <h3 className='imp-dialog__title'>Rename Node</h3>
          <p className='imp-dialog__subtitle'>Update the name of a node.</p>
        </div>
        <div className='imp-dialog__body'>
          <div className='imp-dialog__field'>
            <label className='imp-dialog__label'>Node</label>
            <select
              className='imp-dialog__select'
              value={renameTarget}
              onChange={(e) => {
                setRenameTarget(e.target.value)
                const node = getAllNodes().find((n) => n.id === e.target.value)
                if (node) setRenameName(node.name)
              }}
            >
              {getAllNodes().map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
          <div className='imp-dialog__field'>
            <label className='imp-dialog__label'>New name</label>
            <input
              className='imp-dialog__input'
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()}
            />
          </div>
        </div>
        <div className='imp-dialog__footer'>
          <button
            className='imp-dialog__btn imp-dialog__btn--secondary'
            onClick={renameDialog.close}
          >
            Cancel
          </button>
          <button
            className='imp-dialog__btn imp-dialog__btn--primary'
            onClick={handleRenameConfirm}
          >
            Rename
          </button>
        </div>
      </dialog>

      {/* Get Tree Dialog */}
      <dialog ref={treeDialog.ref} className='imp-dialog'>
        <div className='imp-dialog__header'>
          <h3 className='imp-dialog__title'>Current Tree</h3>
          <p className='imp-dialog__subtitle'>JSON snapshot of the tree structure.</p>
        </div>
        <div className='imp-dialog__body'>
          <div className='imp-dialog__json'>{treeJson}</div>
        </div>
        <div className='imp-dialog__footer'>
          <button className='imp-dialog__btn imp-dialog__btn--secondary' onClick={treeDialog.close}>
            Close
          </button>
        </div>
      </dialog>
    </div>
  )
}

export const ImperativeAPI: Story = {
  render: () => <ImperativeApiDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the imperative API via `ref`. Use the toolbar to manipulate the tree externally.',
      },
    },
  },
}
