import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DropIndicator from './DropIndicator'

describe('DropIndicator Component', () => {
  it('renders correctly with required props', () => {
    render(<DropIndicator id='test-id' />)
    const indicator = screen.getByTestId('test-id')

    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('drop-indicator')
    expect(indicator).toHaveAttribute('role', 'presentation')
    expect(indicator).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies additional className prop', () => {
    render(<DropIndicator id='test-class' className='additional-class' />)
    const indicator = screen.getByTestId('test-class')

    expect(indicator).toHaveClass('drop-indicator additional-class')
  })

  it('inherits and applies additional props', () => {
    const handleClick = vi.fn()

    render(<DropIndicator id='test-props' data-testid='custom-testid' onClick={handleClick} />)
    const indicator = screen.getByTestId('custom-testid')

    expect(indicator).toBeInTheDocument()

    fireEvent.click(indicator)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
