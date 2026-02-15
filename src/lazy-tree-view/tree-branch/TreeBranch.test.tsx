import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TreeBranch from './TreeBranch'
import { calculateIndentation } from '../utils/tree-operations'

const defaultProps = {
  id: 'branch-1',
  name: 'Test Branch',
  depth: 0,
  children: [],
  onToggleOpen: vi.fn(),
}

describe('TreeBranch', () => {
  it('should render with the provided id', () => {
    render(<TreeBranch {...defaultProps} />)

    const branch = screen.getByTestId('branch-1')

    expect(branch.id).toBe('branch-1')
  })

  it('should display the branch name', () => {
    render(<TreeBranch {...defaultProps} name="My Branch" />)

    expect(screen.getByText('My Branch')).toBeInTheDocument()
  })

  it('should apply indentation based on depth', () => {
    render(<TreeBranch {...defaultProps} depth={2} />)

    const branch = screen.getByTestId('branch-1')
    const expectedIndentation = `${calculateIndentation(2)}px`

    expect(branch.style.getPropertyValue('--tree-item-indentation')).toBe(expectedIndentation)
  })

  describe('chevron icon', () => {
    it('should show chevron icon by default', () => {
      render(<TreeBranch {...defaultProps} />)

      expect(screen.getByTestId('branch-1-chevron-icon')).toBeInTheDocument()
    })

    it('should not have open class when closed', () => {
      render(<TreeBranch {...defaultProps} isOpen={false} />)

      const chevron = screen.getByTestId('branch-1-chevron-icon')

      expect(chevron.getAttribute('class')).not.toMatch(/open/)
    })

    it('should have open class when open', () => {
      render(<TreeBranch {...defaultProps} isOpen={true} />)

      const chevron = screen.getByTestId('branch-1-chevron-icon')

      expect(chevron.getAttribute('class')).toMatch(/open/)
    })
  })

  describe('loading state', () => {
    it('should show loading icon when isLoading is true', () => {
      render(<TreeBranch {...defaultProps} isLoading={true} />)

      expect(screen.getByTestId('branch-1-loading-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('branch-1-chevron-icon')).not.toBeInTheDocument()
    })

    it('should not show loading icon when isLoading is false', () => {
      render(<TreeBranch {...defaultProps} isLoading={false} />)

      expect(screen.queryByTestId('branch-1-loading-icon')).not.toBeInTheDocument()
      expect(screen.getByTestId('branch-1-chevron-icon')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should show error icon when error is defined', () => {
      render(<TreeBranch {...defaultProps} error={new Error('Failed')} />)

      expect(screen.getByTestId('branch-1-error-icon')).toBeInTheDocument()
    })

    it('should not show error icon when error is undefined', () => {
      render(<TreeBranch {...defaultProps} error={undefined} />)

      expect(screen.queryByTestId('branch-1-error-icon')).not.toBeInTheDocument()
    })
  })

  describe('click interaction', () => {
    it('should call onToggleOpen when clicked', async () => {
      const onToggleOpen = vi.fn()
      render(<TreeBranch {...defaultProps} onToggleOpen={onToggleOpen} />)

      await userEvent.click(screen.getByTestId('branch-1'))

      expect(onToggleOpen).toHaveBeenCalledTimes(1)
    })

    it('should pass the event to onToggleOpen', async () => {
      const onToggleOpen = vi.fn()
      render(<TreeBranch {...defaultProps} onToggleOpen={onToggleOpen} />)

      await userEvent.click(screen.getByTestId('branch-1'))

      expect(onToggleOpen).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }))
    })
  })
})
