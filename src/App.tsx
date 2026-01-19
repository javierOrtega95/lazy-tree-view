import { FC, useCallback, useState, useRef } from 'react'
import './App.css'
import LazyTreeView from './lazy-tree-view/LazyTreeView'
import type { BaseNodeProps, FolderProps } from './lazy-tree-view/types'
import {
  CHILDREN_BY_FOLDER,
  DEFAULT_TREE,
  LAZY_TREE_EXAMPLE,
  mockLoadChildren,
} from './mocks/storybook/storybook'
import type { DropData } from './types/dnd'
import type { FolderNode, TreeNode } from './types/tree'

// Custom Components for testing
const CustomFolder: FC<FolderProps> = ({
  name,
  isOpen,
  isLoading,
  error,
  depth,
  onDragStart,
  onToggleOpen,
}) => {
  const folderRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (event: React.DragEvent) => {
    // Use the entire folder element as drag image
    if (folderRef.current) {
      event.dataTransfer.setDragImage(folderRef.current, 0, 0)
    }
    onDragStart?.(event)
  }

  return (
    <div
      ref={folderRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: `${depth}px`,
        backgroundColor: isOpen ? '#e3f2fd' : '#f5f5f5',
        border: error ? '2px solid red' : '1px solid #ccc',
        borderRadius: '4px',
        margin: '2px 0',
        padding: '8px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onToggleOpen}
    >
      <div draggable='true' onDragStart={handleDragStart} style={{ cursor: 'grab' }}>
        <svg
          style={{ width: '1em', height: '1em', fontSize: 18 }}
          className='MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy'
          focusable='false'
          aria-hidden='true'
          viewBox='0 0 24 24'
        >
          <path d='M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9-2-2-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2'></path>
        </svg>
      </div>
      📁 {name} {isLoading && '⏳'} {isOpen ? '📂' : '📁'}
    </div>
  )
}

const CustomItem: FC<BaseNodeProps> = ({ name, depth, onDragStart }) => {
  const itemRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (event: React.DragEvent) => {
    // Use the entire item element as drag image
    if (itemRef.current) {
      event.dataTransfer.setDragImage(itemRef.current, 0, 0)
    }
    onDragStart?.(event)
  }

  return (
    <div
      ref={itemRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: `${depth}px`,
        backgroundColor: '#080807',
        border: '1px solid #ffb74d',
        borderRadius: '4px',
        margin: '2px 0',
        padding: '8px',
        gap: '8px',
        userSelect: 'none',
      }}
    >
      <div draggable='true' onDragStart={handleDragStart} style={{ cursor: 'grab' }}>
        <svg
          style={{ width: '1em', height: '1em', fontSize: 14 }}
          className='MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-iguwhy'
          focusable='false'
          aria-hidden='true'
          viewBox='0 0 24 24'
        >
          <path d='M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9-2-2-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2'></path>
        </svg>
      </div>
      📄 {name}
    </div>
  )
}

function App() {
  const [logs, setLogs] = useState<string[]>([])
  const [treeData, setTreeData] = useState(LAZY_TREE_EXAMPLE)
  const [errorSimulation, setErrorSimulation] = useState(false)

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 19)])
  }, [])

  // Basic lazy loading
  const loadChildren = useCallback(
    async (folder: FolderNode): Promise<TreeNode[]> => {
      addLog(`🔄 Loading children for: ${folder.name}`)

      const children = CHILDREN_BY_FOLDER[folder.name]

      if (!children) {
        throw new Error(`No children found for folder: ${folder.name}`)
      }

      return mockLoadChildren(children)
    },
    [addLog],
  )

  // Loading with forced errors for testing
  const loadChildrenWithErrors = useCallback(
    async (folder: FolderNode): Promise<TreeNode[]> => {
      addLog(`🔄 Loading children for: ${folder.name}`)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (errorSimulation || folder.name === 'Settings') {
        throw new Error(`Simulated network error for ${folder.name}`)
      }

      const children = CHILDREN_BY_FOLDER[folder.name] || []
      return children
    },
    [addLog, errorSimulation],
  )

  // No delay loading for quick testing
  const loadChildrenFast = useCallback(
    async (folder: FolderNode): Promise<TreeNode[]> => {
      const children = CHILDREN_BY_FOLDER[folder.name] || []
      addLog(`⚡ Fast loaded ${children.length} items for: ${folder.name}`)
      return children
    },
    [addLog],
  )

  const handleLoadStart = useCallback(
    (folder: FolderNode) => {
      addLog(`🔄 Loading started for: ${folder.name}`)
    },
    [addLog],
  )

  const handleLoadSuccess = useCallback(
    (folder: FolderNode, children: TreeNode[]) => {
      addLog(`✅ Successfully loaded ${children.length} items for: ${folder.name}`)
    },
    [addLog],
  )

  const handleLoadError = useCallback(
    (folder: FolderNode, error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addLog(`❌ Error loading ${folder.name}: ${errorMessage}`)
    },
    [addLog],
  )

  const handleDrop = useCallback(
    ({ source, target, position, prevParent, nextParent }: DropData) => {
      addLog(`🎯 Dropped ${source.name} ${position} ${target.name}`)
      addLog(`   Parent change: ${prevParent?.name || 'root'} → ${nextParent?.name || 'root'}`)
    },
    [addLog],
  )

  const handleTreeChange = useCallback(
    (newTree: TreeNode[]) => {
      // Defer state updates to avoid "setState during render" warning
      setTimeout(() => {
        addLog(`🌳 Tree structure changed (${newTree.length} root items)`)
        setTreeData(newTree)
      }, 0)
    },
    [addLog],
  )

  // Restrictive canDrop - only allow dropping files in specific folders
  const restrictiveCanDrop = useCallback(({ source, target, nextParent }: DropData) => {
    // Don't allow dropping folders
    if ('children' in source) return false

    // Only allow dropping in 'Work Files' or 'Images' folders
    const allowedParents = ['Work Files', 'Images']
    return allowedParents.includes(nextParent?.name || '')
  }, [])

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      {/* Main Content */}
      <div style={{ flex: 2 }}>
        <h1>Lazy Tree View - Demo</h1>

        {/* Section 1: Basic Lazy Loading */}
        <section
          style={{
            marginBottom: '40px',
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>🚀 1. Basic Lazy Loading</h2>
          <p>Standard lazy loading with random delays and 20% error simulation</p>
          <div className='tree-container' style={{ height: '300px', overflow: 'auto' }}>
            <LazyTreeView
              initialTree={LAZY_TREE_EXAMPLE}
              loadChildren={loadChildren}
              onLoadStart={handleLoadStart}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
              onDrop={handleDrop}
              onTreeChange={handleTreeChange}
            />
          </div>
        </section>

        {/* Section 2: Error Handling */}
        <section
          style={{
            marginBottom: '40px',
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>❌ 2. Error Handling</h2>
          <div style={{ marginBottom: '10px' }}>
            <label>
              <input
                type='checkbox'
                checked={errorSimulation}
                onChange={(e) => setErrorSimulation(e.target.checked)}
              />
              Force all loads to fail
            </label>
          </div>
          <p>Settings folder always fails, others fail based on checkbox</p>
          <div className='tree-container' style={{ height: '300px', overflow: 'auto' }}>
            <LazyTreeView
              initialTree={LAZY_TREE_EXAMPLE}
              loadChildren={loadChildrenWithErrors}
              onLoadStart={handleLoadStart}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
            />
          </div>
        </section>

        {/* Section 3: Custom Components */}
        <section
          style={{
            marginBottom: '40px',
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>🎨 3. Custom Components with Drag Handles</h2>
          <p>
            Custom folder and item renderers with dedicated drag handles. Only the grip icon (⋮⋮)
            triggers drag - clicking elsewhere expands folders.
          </p>
          <div className='tree-container' style={{ height: '300px', overflow: 'auto' }}>
            <LazyTreeView
              initialTree={DEFAULT_TREE}
              loadChildren={loadChildrenFast}
              folder={CustomFolder}
              item={CustomItem}
              useDragHandle={true}
              onDrop={handleDrop}
            />
          </div>
        </section>

        {/* Section 4: Disabled Drag & Drop */}
        <section
          style={{
            marginBottom: '40px',
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>🔒 4. Disabled Drag & Drop</h2>
          <p>Tree view with drag and drop functionality disabled</p>
          <div className='tree-container' style={{ height: '300px', overflow: 'auto' }}>
            <LazyTreeView
              initialTree={DEFAULT_TREE}
              loadChildren={loadChildrenFast}
              allowDragAndDrop={false}
            />
          </div>
        </section>

        {/* Section 5: Restrictive Drop Validation */}
        <section
          style={{
            marginBottom: '40px',
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>🛡️ 5. Restrictive Drop Rules</h2>
          <p>Only files can be dropped, and only in 'Work Files' or 'Images' folders</p>
          <div className='tree-container' style={{ height: '300px', overflow: 'auto' }}>
            <LazyTreeView
              initialTree={DEFAULT_TREE}
              loadChildren={loadChildrenFast}
              canDrop={restrictiveCanDrop}
              onDrop={handleDrop}
            />
          </div>
        </section>

        {/* Section 6: Custom Styling */}
        <section
          style={{
            marginBottom: '40px',
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>🎭 6. Custom Styling</h2>
          <p>Tree with custom CSS classes and drag styling</p>
          <div className='tree-container' style={{ height: '300px', overflow: 'auto' }}>
            <LazyTreeView
              initialTree={DEFAULT_TREE}
              loadChildren={loadChildrenFast}
              className='custom-tree'
              style={{ backgroundColor: '#f0f8ff', padding: '10px', borderRadius: '8px' }}
              dragClassNames={{
                dragOver: 'custom-over',
                dropNotAllowed: 'custom-cannot-drop',
              }}
              onDrop={handleDrop}
            />
          </div>
        </section>
      </div>

      {/* Sidebar with logs */}
      <div style={{ flex: 1, maxWidth: '400px' }}>
        <div style={{ position: 'sticky', top: '20px' }}>
          <h3>📋 Activity Log</h3>
          <button onClick={() => setLogs([])} style={{ marginBottom: '10px', padding: '5px 10px' }}>
            Clear Logs
          </button>
          <div
            style={{
              height: '500px',
              overflow: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
            }}
          >
            {logs.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No activity yet...</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: '4px 0',
                    borderBottom: index < logs.length - 1 ? '1px solid #eee' : 'none',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                >
                  {log}
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4>🌳 Current Tree State</h4>
            <div style={{ fontSize: '12px', color: '#666' }}>Root items: {treeData.length}</div>
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer' }}>View JSON</summary>
              <pre
                style={{
                  fontSize: '10px',
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                {JSON.stringify(treeData, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
