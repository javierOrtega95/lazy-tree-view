import { type CSSProperties } from 'react'
import { BASE_NODE_INDENTATION } from '../constants'
import type { BaseNodeProps } from '../types'
import './TreeItem.css'

export default function TreeItem({ node, depth }: BaseNodeProps): JSX.Element {
  const indentation = BASE_NODE_INDENTATION * depth

  return (
    <div
      id={node.id}
      data-testid={node.id}
      className='tree-item'
      style={{ '--tree-item-indentation': `${indentation}px` } as CSSProperties}
    >
      <span>{node.name}</span>
    </div>
  )
}
