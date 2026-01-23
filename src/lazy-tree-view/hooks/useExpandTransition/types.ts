export interface UseExpandTransitionOptions {
  isOpen: boolean
  transitionDuration?: number
}

export interface UseExpandTransitionReturn {
  shouldRender: boolean
  className: string
}
