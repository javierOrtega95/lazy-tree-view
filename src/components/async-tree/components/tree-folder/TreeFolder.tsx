import { FolderProps } from '../../types'
import './TreeFolder.css'

export default function TreeFolder({
  node,
  isOpen = false,
  isLoading = false,
  onToggleOpen,
}: FolderProps): JSX.Element {
  return (
    <div
      id={node.id}
      data-testid={node.id}
      className='tree-folder'
      onClick={(e) => onToggleOpen(e, node)}
    >
      <svg
        data-testid={`${node.id}-${isLoading ? 'loading-icon' : 'chevron-icon'}`}
        width={isLoading ? '12' : '24'}
        height={isLoading ? '12' : '24'}
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={`icon ${isLoading ? 'loading' : `chevron ${isOpen ? 'open' : ''}`}`}
      >
        {isLoading ? (
          <path d='M21 12a9 9 0 1 1-6.219-8.56'></path>
        ) : (
          <path d='m9 18 6-6-6-6'></path>
        )}
      </svg>

      <span className='folder-name'>{node.name}</span>
    </div>
  )
}
