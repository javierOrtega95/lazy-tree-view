import { createContext, useContext } from 'react'
import type { NodeParents } from '../../types/tree'

type LazyTreeViewContextData = { nodeParents: NodeParents } | null

export const LazyTreeViewContext = createContext<LazyTreeViewContextData>(null)

export const useLazyTreeView = () => {
  const context = useContext(LazyTreeViewContext)

  if (!context) {
    throw new Error('useLazyTreeView must be used within an LazyTreeViewContext.Provider')
  }

  return context
}
