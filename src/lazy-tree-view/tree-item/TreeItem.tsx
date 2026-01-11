import { type CSSProperties } from 'react'
import { BASE_NODE_INDENTATION } from '../constants'
import type { BaseNodeProps } from '../types'
import './TreeItem.css'

export default function TreeItem({ id, name, depth }: BaseNodeProps): JSX.Element {
  const indentation = BASE_NODE_INDENTATION * depth

  return (
    <div
      id={id}
      data-testid={id}
      className='tree-item'
      style={{ '--tree-item-indentation': `${indentation}px` } as CSSProperties}
    >
      <span>{name}</span>
    </div>
  )
}
