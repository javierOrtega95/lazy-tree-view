import { memo, type HTMLAttributes } from 'react'
import styles from './DropIndicator.module.css'

function DropIndicator({
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

export default memo(DropIndicator)
