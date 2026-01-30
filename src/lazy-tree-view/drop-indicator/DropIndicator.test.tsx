import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DropIndicator from './DropIndicator'

describe('DropIndicator', () => {
  it('should render a span element', () => {
    render(<DropIndicator id="test-indicator" />)

    const indicator = screen.getByTestId('test-indicator')

    expect(indicator.tagName).toBe('SPAN')
  })

  it('should apply the provided id', () => {
    render(<DropIndicator id="my-indicator" />)

    const indicator = screen.getByTestId('my-indicator')

    expect(indicator.id).toBe('my-indicator')
  })

  it('should have accessibility attributes', () => {
    render(<DropIndicator id="test-indicator" />)

    const indicator = screen.getByTestId('test-indicator')

    expect(indicator.getAttribute('role')).toBe('presentation')
    expect(indicator.getAttribute('aria-hidden')).toBe('true')
  })

  it('should apply custom className alongside default styles', () => {
    render(<DropIndicator id="test-indicator" className="custom-class" />)

    const indicator = screen.getByTestId('test-indicator')

    expect(indicator.className).toContain('custom-class')
  })

  it('should pass through additional HTML attributes', () => {
    render(<DropIndicator id="test-indicator" data-custom="value" style={{ height: 2 }} />)

    const indicator = screen.getByTestId('test-indicator')

    expect(indicator.getAttribute('data-custom')).toBe('value')
    expect(indicator.style.height).toBe('2px')
  })
})