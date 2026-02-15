import type { Meta, StoryObj } from '@storybook/react'
import { type FC, useRef, useState } from 'react'
import LazyTreeView from '../../lazy-tree-view/LazyTreeView'
import type { LazyTreeViewHandle } from '../../lazy-tree-view/types'
import { DropPosition } from '../../types/dnd'
import type { TreeNode } from '../../types/tree'
import { generateUUID } from '../../lazy-tree-view/utils/uuid'
import {
  ClipboardListIcon,
  MoveIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
} from '../assets/icons/file-icons'
import '../assets/styles/imperative-api.css'

// ---- Demo data ----

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
      { id: generateUUID(), name: 'Inputs', children: [] },
      { id: generateUUID(), name: 'Navigation', children: [] },
    ],
    isOpen: true,
    hasFetched: true,
  },
  { id: generateUUID(), name: 'Guides', children: [] },
  { id: generateUUID(), name: 'API Reference', children: [] },
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

// ---- Preset trees for setTree demo ----

const PRESET_TREES: Record<string, TreeNode[]> = {
  Minimal: [
    { id: 'min-1', name: 'Alpha' },
    { id: 'min-2', name: 'Beta' },
    { id: 'min-3', name: 'Gamma' },
  ],
  Nested: [
    {
      id: 'nest-1',
      name: 'Section A',
      children: [
        { id: 'nest-2', name: 'Item 1' },
        { id: 'nest-3', name: 'Item 2' },
      ],
      isOpen: true,
      hasFetched: true,
    },
    {
      id: 'nest-4',
      name: 'Section B',
      children: [
        { id: 'nest-5', name: 'Item 3' },
        { id: 'nest-6', name: 'Item 4' },
      ],
      isOpen: true,
      hasFetched: true,
    },
    { id: 'nest-7', name: 'Standalone' },
  ],
  Empty: [],
}

const PRESET_NAMES = Object.keys(PRESET_TREES)

// ---- Helpers ----

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

// ---- Demo component ----

const ImperativeApiDemo: FC = () => {
  const treeRef = useRef<LazyTreeViewHandle>(null)
  const nodeCounterRef = useRef(100)

  // Dialog state
  const addDialog = useDialog()
  const removeDialog = useDialog()
  const renameDialog = useDialog()
  const setTreeDialog = useDialog()
  const treeDialog = useDialog()

  // Form state
  const [addName, setAddName] = useState('')
  const [addType, setAddType] = useState<'item' | 'folder'>('item')
  const [addParent, setAddParent] = useState<string>('__root__')
  const [removeTarget, setRemoveTarget] = useState<string>('')
  const [renameName, setRenameName] = useState('')
  const [renameTarget, setRenameTarget] = useState<string>('')
  const [setTreePreset, setSetTreePreset] = useState(PRESET_NAMES[0])
  const [newTreeJson, setNewTreeJson] = useState('')
  const [setTreeError, setSetTreeError] = useState('')
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

  const handleSetTreeOpen = () => {
    const preset = PRESET_NAMES[0]
    setSetTreePreset(preset)
    setNewTreeJson(JSON.stringify(PRESET_TREES[preset], null, 2))
    setSetTreeError('')
    setTreeDialog.open()
  }

  const handleSetTreePresetChange = (name: string) => {
    setSetTreePreset(name)
    if (name === '__custom__') return
    setNewTreeJson(JSON.stringify(PRESET_TREES[name], null, 2))
    setSetTreeError('')
  }

  const handleSetTreeConfirm = () => {
    try {
      const parsed = JSON.parse(newTreeJson)
      if (!Array.isArray(parsed)) {
        setSetTreeError('Must be a JSON array.')
        return
      }
      treeRef.current?.setTree(parsed)
      setTreeDialog.close()
    } catch (error) {
      setSetTreeError(error instanceof SyntaxError ? 'Invalid JSON.' : String(error))
    }
  }

  const handleGetTree = () => {
    const tree = treeRef.current?.getTree()
    setTreeJson(JSON.stringify(tree, null, 2))
    treeDialog.open()
  }

  return (
    <div className='imp-demo'>
      {/* Actions */}
      <div className='imp-actions'>
        <button className='imp-actions__btn' onClick={handleAddOpen}>
          <PlusIcon /> Add
        </button>
        <button className='imp-actions__btn' onClick={handleRemoveOpen}>
          <TrashIcon /> Remove
        </button>
        <button className='imp-actions__btn' onClick={handleRenameOpen}>
          <PencilIcon /> Rename
        </button>
        <button className='imp-actions__btn' onClick={handleMove}>
          <MoveIcon /> Move
        </button>
        <button className='imp-actions__btn' onClick={handleSetTreeOpen}>
          <RefreshCwIcon /> Set Tree
        </button>
        <button className='imp-actions__btn' onClick={handleGetTree}>
          <ClipboardListIcon /> Get Tree
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

      {/* Set Tree Dialog */}
      <dialog ref={setTreeDialog.ref} className='imp-dialog'>
        <div className='imp-dialog__header'>
          <h3 className='imp-dialog__title'>Set Tree</h3>
          <p className='imp-dialog__subtitle'>Replace the entire tree with a new structure.</p>
        </div>
        <div className='imp-dialog__body'>
          <div className='imp-dialog__field'>
            <label className='imp-dialog__label'>Preset</label>
            <select
              className='imp-dialog__select'
              value={setTreePreset}
              onChange={(e) => handleSetTreePresetChange(e.target.value)}
            >
              {PRESET_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
              <option value='__custom__'>Custom JSON</option>
            </select>
          </div>
          <div className='imp-dialog__field'>
            <label className='imp-dialog__label'>JSON</label>
            <textarea
              className='imp-dialog__textarea'
              value={newTreeJson}
              onChange={(e) => {
                setNewTreeJson(e.target.value)
                setSetTreePreset('__custom__')
                setSetTreeError('')
              }}
            />
            {setTreeError && <p className='imp-dialog__hint' style={{ color: '#cf222e' }}>{setTreeError}</p>}
          </div>
        </div>
        <div className='imp-dialog__footer'>
          <button className='imp-dialog__btn imp-dialog__btn--secondary' onClick={setTreeDialog.close}>
            Cancel
          </button>
          <button className='imp-dialog__btn imp-dialog__btn--primary' onClick={handleSetTreeConfirm}>
            Apply
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

// ---- Meta & Story ----

const SOURCE_CODE = `
import { useRef } from 'react'
import LazyTreeView, { type LazyTreeViewHandle } from 'lazy-tree-view'

const treeRef = useRef<LazyTreeViewHandle>(null)

// Add a node
treeRef.current?.addNode(parentId, { id: 'new', name: 'New Node' })

// Remove a node
treeRef.current?.removeNode('node-id')

// Update a node
treeRef.current?.updateNode('node-id', { name: 'Renamed' })

// Move a node
treeRef.current?.moveNode('node-id', 'target-id', 'before')

// Replace the entire tree
treeRef.current?.setTree([
  { id: '1', name: 'New Root Item' },
  { id: '2', name: 'New Folder', children: [] },
])

// Read the tree
const tree = treeRef.current?.getTree()
const node = treeRef.current?.getNode('node-id')

<LazyTreeView
  ref={treeRef}
  initialTree={tree}
  loadChildren={loadChildren}
/>
`.trim()

const meta: Meta<typeof ImperativeApiDemo> = {
  title: 'Features/Imperative API',
  component: ImperativeApiDemo,
  parameters: {
    docs: {
      description: {
        component:
          'Control the tree externally via `ref` using the imperative API. Methods: `addNode`, `removeNode`, `updateNode`, `moveNode`, `setTree`, `getTree`, `getNode`.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ImperativeApiDemo>

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: SOURCE_CODE, language: 'tsx' },
    },
  },
}
