import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TreeItem from './TreeItem'
import { calculateIndentation } from '../utils/tree-operations'

describe('TreeItem', () => {
  it('should render with the provided id', () => {
    render(<TreeItem id="item-1" name="Test Item" depth={0} />)

    const item = screen.getByTestId('item-1')

    expect(item.id).toBe('item-1')
  })

  it('should display the item name', () => {
    render(<TreeItem id="item-1" name="My Item Name" depth={0} />)

    expect(screen.getByText('My Item Name')).toBeInTheDocument()
  })

  it('should apply indentation based on depth', () => {
    render(<TreeItem id="item-1" name="Test" depth={2} />)

    const item = screen.getByTestId('item-1')
    const expectedIndentation = `${calculateIndentation(2)}px`

    expect(item.style.getPropertyValue('--tree-item-indentation')).toBe(expectedIndentation)
  })

  it('should have zero indentation at depth 0', () => {
    render(<TreeItem id="item-1" name="Test" depth={0} />)

    const item = screen.getByTestId('item-1')

    expect(item.style.getPropertyValue('--tree-item-indentation')).toBe('0px')
  })

  it('should increase indentation with depth', () => {
    const { rerender } = render(<TreeItem id="item-1" name="Test" depth={1} />)
    const item = screen.getByTestId('item-1')
    const indent1 = item.style.getPropertyValue('--tree-item-indentation')

    rerender(<TreeItem id="item-1" name="Test" depth={3} />)
    const indent3 = item.style.getPropertyValue('--tree-item-indentation')

    expect(parseFloat(indent3)).toBeGreaterThan(parseFloat(indent1))
  })
})