import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TreeFolder from './TreeFolder'
import { calculateIndentation } from '../utils/tree-operations'

const defaultProps = {
  id: 'folder-1',
  name: 'Test Folder',
  depth: 0,
  children: [],
  onToggleOpen: vi.fn(),
}

describe('TreeFolder', () => {
  it('should render with the provided id', () => {
    render(<TreeFolder {...defaultProps} />)

    const folder = screen.getByTestId('folder-1')

    expect(folder.id).toBe('folder-1')
  })

  it('should display the folder name', () => {
    render(<TreeFolder {...defaultProps} name="My Folder" />)

    expect(screen.getByText('My Folder')).toBeInTheDocument()
  })

  it('should apply indentation based on depth', () => {
    render(<TreeFolder {...defaultProps} depth={2} />)

    const folder = screen.getByTestId('folder-1')
    const expectedIndentation = `${calculateIndentation(2)}px`

    expect(folder.style.getPropertyValue('--tree-item-indentation')).toBe(expectedIndentation)
  })

  describe('chevron icon', () => {
    it('should show chevron icon by default', () => {
      render(<TreeFolder {...defaultProps} />)

      expect(screen.getByTestId('folder-1-chevron-icon')).toBeInTheDocument()
    })

    it('should not have open class when closed', () => {
      render(<TreeFolder {...defaultProps} isOpen={false} />)

      const chevron = screen.getByTestId('folder-1-chevron-icon')

      expect(chevron.getAttribute('class')).not.toMatch(/open/)
    })

    it('should have open class when open', () => {
      render(<TreeFolder {...defaultProps} isOpen={true} />)

      const chevron = screen.getByTestId('folder-1-chevron-icon')

      expect(chevron.getAttribute('class')).toMatch(/open/)
    })
  })

  describe('loading state', () => {
    it('should show loading icon when isLoading is true', () => {
      render(<TreeFolder {...defaultProps} isLoading={true} />)

      expect(screen.getByTestId('folder-1-loading-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('folder-1-chevron-icon')).not.toBeInTheDocument()
    })

    it('should not show loading icon when isLoading is false', () => {
      render(<TreeFolder {...defaultProps} isLoading={false} />)

      expect(screen.queryByTestId('folder-1-loading-icon')).not.toBeInTheDocument()
      expect(screen.getByTestId('folder-1-chevron-icon')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should show error icon when error is defined', () => {
      render(<TreeFolder {...defaultProps} error={new Error('Failed')} />)

      expect(screen.getByTestId('folder-1-error-icon')).toBeInTheDocument()
    })

    it('should not show error icon when error is undefined', () => {
      render(<TreeFolder {...defaultProps} error={undefined} />)

      expect(screen.queryByTestId('folder-1-error-icon')).not.toBeInTheDocument()
    })
  })

  describe('click interaction', () => {
    it('should call onToggleOpen when clicked', async () => {
      const onToggleOpen = vi.fn()
      render(<TreeFolder {...defaultProps} onToggleOpen={onToggleOpen} />)

      await userEvent.click(screen.getByTestId('folder-1'))

      expect(onToggleOpen).toHaveBeenCalledTimes(1)
    })

    it('should pass the event to onToggleOpen', async () => {
      const onToggleOpen = vi.fn()
      render(<TreeFolder {...defaultProps} onToggleOpen={onToggleOpen} />)

      await userEvent.click(screen.getByTestId('folder-1'))

      expect(onToggleOpen).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }))
    })
  })
})