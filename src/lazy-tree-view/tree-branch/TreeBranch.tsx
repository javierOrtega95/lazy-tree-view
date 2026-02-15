import { memo, type CSSProperties } from 'react'
import type { BranchProps } from '../types'
import { calculateIndentation } from '../utils/tree-operations'
import styles from './TreeBranch.module.css'

function TreeBranch({
  id,
  name,
  isOpen = false,
  isLoading = false,
  error,
  depth,
  onToggleOpen,
}: BranchProps): JSX.Element {
  return (
    <div
      id={id}
      data-testid={id}
      className={styles.treeBranch}
      style={{ '--tree-item-indentation': `${calculateIndentation(depth)}px` } as CSSProperties}
      onClick={(event) => onToggleOpen(event)}
    >
      <div className={styles.iconWrapper}>
        {error !== undefined && (
          <span data-testid={`${id}-error-icon`} className={styles.errorIcon} />
        )}

        <svg
          data-testid={`${id}-${isLoading ? 'loading-icon' : 'chevron-icon'}`}
          width={isLoading ? '16' : '24'}
          height={isLoading ? '16' : '24'}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className={`${styles.icon} ${isLoading ? styles.loading : `${styles.chevron} ${isOpen ? styles.open : ''}`}`}
        >
          {isLoading ? (
            <path d='M21 12a9 9 0 1 1-6.219-8.56'></path>
          ) : (
            <path d='m9 18 6-6-6-6'></path>
          )}
        </svg>
      </div>

      <span>{name}</span>
    </div>
  )
}

export default memo(TreeBranch)
