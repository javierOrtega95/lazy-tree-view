import { createContext, useContext } from 'react'
import { NodeParents } from '../types'

interface LazyTreeViewContextData {
  nodeParents: NodeParents
}

export const LazyTreeViewContext = createContext<LazyTreeViewContextData | null>(null)

export const useLazyTreeView = () => {
  const context = useContext(LazyTreeViewContext)

  if (!context) {
    throw new Error('useLazyTreeView must be used within an LazyTreeViewContext.Provider')
  }

  return context
}
