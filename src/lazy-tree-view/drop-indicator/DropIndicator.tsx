import { type HTMLAttributes } from 'react'
import styles from './DropIndicator.module.css'

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
      className={`${styles.dropIndicator} ${className}`}
      {...props}
    />
  )
}
