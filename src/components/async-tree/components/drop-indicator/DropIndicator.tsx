import { DropIndicatorProps } from '../../types'

export default function DropIndicator({
  id,
  indentation,
  className = '',
  ...props
}: DropIndicatorProps): JSX.Element {
  return (
    <span
      id={id}
      data-testid={id}
      role='presentation'
      aria-hidden='true'
      className={`drop-indicator ${className}`}
      style={{ left: indentation }}
      {...props}
    />
  )
}
