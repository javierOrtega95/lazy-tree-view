import { HTMLAttributes } from 'react'
import './DropIndicator.css'

export default function DropIndicator({
  id,
  className = '',
  ...props
}: HTMLAttributes<HTMLSpanElement>): JSX.Element {
  return (
    <span
      id={id}
      data-testid={id}
      role='presentation'
      aria-hidden='true'
      className={`drop-indicator ${className}`}
      {...props}
    />
  )
}
