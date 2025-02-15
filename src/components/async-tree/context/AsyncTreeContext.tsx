import { createContext, useContext } from 'react'
import { NodeParents } from '../types'

interface AsyncTreeContextData {
  nodeParents: NodeParents
}

export const AsyncTreeContext = createContext<AsyncTreeContextData | null>(null)

export const useAsyncTree = () => {
  const context = useContext(AsyncTreeContext)

  if (!context) {
    throw new Error('useAsyncTree must be used within an AsyncTreeContext.Provider')
  }

  return context
}
