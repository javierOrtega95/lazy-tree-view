export interface UseExpandTransitionOptions {
  isOpen: boolean
  transitionDuration?: number
  disableAnimations?: boolean
}

export interface UseExpandTransitionReturn {
  shouldRender: boolean
  className: string
}
