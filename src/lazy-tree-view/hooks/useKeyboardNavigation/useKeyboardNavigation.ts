import { KeyboardEvent, useCallback } from 'react'
import type { BranchNode, NodeId, TreeNode } from '../../../types/tree'
import { isBranchNode } from '../../utils/validations'
import type { UseKeyboardNavigationOptions, UseKeyboardNavigationResult } from './types'

export function useKeyboardNavigation({
  tree,
  nodeIndex,
  focusedNodeId,
  setFocusedNodeId,
  onToggleOpen,
  disabled = false,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationResult {
  const getCurrentNode = useCallback((): TreeNode | null => {
    if (!focusedNodeId) return null

    return nodeIndex[focusedNodeId]?.node ?? null
  }, [focusedNodeId, nodeIndex])

  const getNextSibling = useCallback(
    (nodeId: NodeId): TreeNode | null => {
      const entry = nodeIndex[nodeId]

      if (!entry) return null

      const { parent, siblingIndex } = entry
      const nextIndex = siblingIndex + 1

      if (nextIndex >= parent.children.length) return null

      return parent.children[nextIndex]
    },
    [nodeIndex],
  )

  const getPrevSibling = useCallback(
    (nodeId: NodeId): TreeNode | null => {
      const entry = nodeIndex[nodeId]

      if (!entry) return null

      const { parent, siblingIndex } = entry
      const prevIndex = siblingIndex - 1

      if (prevIndex < 0) return null

      return parent.children[prevIndex]
    },
    [nodeIndex],
  )

  const getLastVisibleDescendant = useCallback((node: TreeNode): TreeNode => {
    if (!isBranchNode(node) || !node.isOpen || node.children.length === 0) {
      return node
    }

    const lastChild = node.children[node.children.length - 1]

    return getLastVisibleDescendant(lastChild)
  }, [])

  const getVisibleParent = useCallback(
    (nodeId: NodeId): BranchNode | null => {
      const entry = nodeIndex[nodeId]

      if (!entry) return null

      const { parent } = entry

      if (!nodeIndex[parent.id]) return null

      return parent
    },
    [nodeIndex],
  )

  const navigateDown = useCallback(() => {
    const currentNode = getCurrentNode()
    if (!currentNode) return

    // If open branch with children → first child
    if (isBranchNode(currentNode) && currentNode.isOpen && currentNode.children.length > 0) {
      setFocusedNodeId(currentNode.children[0].id)
      return
    }

    // If has next sibling → next sibling
    const nextSibling = getNextSibling(currentNode.id)

    if (nextSibling) {
      setFocusedNodeId(nextSibling.id)
      return
    }

    // Go up ancestors to find one with next sibling
    let ancestor = getVisibleParent(currentNode.id)

    while (ancestor) {
      const ancestorNextSibling = getNextSibling(ancestor.id)

      if (ancestorNextSibling) {
        setFocusedNodeId(ancestorNextSibling.id)
        return
      }

      ancestor = getVisibleParent(ancestor.id)
    }
  }, [getCurrentNode, getNextSibling, getVisibleParent, setFocusedNodeId])

  const navigateUp = useCallback(() => {
    const currentNode = getCurrentNode()
    if (!currentNode) return

    // If has previous sibling → last visible descendant of that sibling
    const prevSibling = getPrevSibling(currentNode.id)
    if (prevSibling) {
      setFocusedNodeId(getLastVisibleDescendant(prevSibling).id)
      return
    }

    // Otherwise → go to parent
    const parent = getVisibleParent(currentNode.id)

    if (!parent) return

    setFocusedNodeId(parent.id)
  }, [getCurrentNode, getPrevSibling, getLastVisibleDescendant, getVisibleParent, setFocusedNodeId])

  const expandOrNavigateToChild = useCallback(() => {
    const currentNode = getCurrentNode()
    if (!currentNode || !isBranchNode(currentNode)) return
    if (currentNode.isLoading) return

    if (!currentNode.isOpen) {
      onToggleOpen(currentNode)
      return
    }

    if (currentNode.children.length > 0) {
      setFocusedNodeId(currentNode.children[0].id)
    }
  }, [getCurrentNode, onToggleOpen, setFocusedNodeId])

  const collapseOrNavigateToParent = useCallback(() => {
    const currentNode = getCurrentNode()
    if (!currentNode) return

    if (isBranchNode(currentNode) && currentNode.isLoading) return

    if (isBranchNode(currentNode) && currentNode.isOpen) {
      onToggleOpen(currentNode)

      return
    }

    const parent = getVisibleParent(currentNode.id)

    if (!parent) return

    setFocusedNodeId(parent.id)
  }, [getCurrentNode, getVisibleParent, onToggleOpen, setFocusedNodeId])

  const navigateToStart = useCallback(() => {
    const [root] = tree
    if (root.children.length === 0) return

    setFocusedNodeId(root.children[0].id)
  }, [tree, setFocusedNodeId])

  const navigateToEnd = useCallback(() => {
    const [root] = tree

    if (root.children.length === 0) return

    const lastTopLevel = root.children[root.children.length - 1]

    setFocusedNodeId(getLastVisibleDescendant(lastTopLevel).id)
  }, [tree, getLastVisibleDescendant, setFocusedNodeId])

  const toggleCurrentNode = useCallback(() => {
    const currentNode = getCurrentNode()

    if (!currentNode || !isBranchNode(currentNode)) return

    if (currentNode.isLoading) return

    onToggleOpen(currentNode)
  }, [getCurrentNode, onToggleOpen])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return

      const preventDefault = () => {
        event.preventDefault()
        event.stopPropagation()
      }

      const keyActions: Record<string, () => void> = {
        ArrowDown: () => {
          preventDefault()
          navigateDown()
        },
        ArrowUp: () => {
          preventDefault()
          navigateUp()
        },
        ArrowRight: () => {
          preventDefault()
          expandOrNavigateToChild()
        },
        ArrowLeft: () => {
          preventDefault()
          collapseOrNavigateToParent()
        },
        Home: () => {
          preventDefault()
          navigateToStart()
        },
        End: () => {
          preventDefault()
          navigateToEnd()
        },
        Enter: () => {
          preventDefault()
          toggleCurrentNode()
        },
        ' ': () => {
          preventDefault()
          toggleCurrentNode()
        },
        Tab: () => {
          preventDefault()
          if (!focusedNodeId) {
            navigateToStart()
            return
          }
          navigateDown()
        },
      }

      keyActions[event.key]?.()

      if (event.key === 'Tab' && event.shiftKey) {
        preventDefault()
        navigateUp()
      }
    },
    [
      disabled,
      focusedNodeId,
      navigateDown,
      navigateUp,
      expandOrNavigateToChild,
      collapseOrNavigateToParent,
      navigateToStart,
      navigateToEnd,
      toggleCurrentNode,
    ],
  )

  return { handleKeyDown }
}
