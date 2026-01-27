export interface UseExpandTransitionOptions {
  isOpen: boolean
  transitionDuration?: number
  disableAnimations?: boolean
}

export interface UseExpandTransitionReturn {
  shouldRender: boolean
  transitionState: TransitionState
}

export type TransitionState = 'closed' | 'opening' | 'open' | 'closing'
