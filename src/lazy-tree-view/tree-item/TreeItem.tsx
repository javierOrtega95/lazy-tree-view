import { type CSSProperties } from 'react'
import type { BaseNodeProps } from '../types'
import { calculateIndentation } from '../utils/tree-operations'
import './TreeItem.css'

export default function TreeItem({ id, name, depth }: BaseNodeProps): JSX.Element {
  return (
    <div
      id={id}
      data-testid={id}
      className='tree-item'
      style={{ '--tree-item-indentation': `${calculateIndentation(depth)}px` } as CSSProperties}
    >
      <span>{name}</span>
    </div>
  )
}
