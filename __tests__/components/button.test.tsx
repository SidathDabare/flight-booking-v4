import { describe, expect, test } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  test('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  test('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
  })

  test('should apply default variant classes', () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole('button', { name: /default button/i })
    expect(button).toHaveClass('bg-primary')
  })

  test('should apply destructive variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-destructive')
  })

  test('should apply outline variant classes', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button', { name: /outline/i })
    expect(button).toHaveClass('border')
  })

  test('should apply small size classes', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button', { name: /small/i })
    expect(button).toHaveClass('h-9')
  })

  test('should apply large size classes', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button', { name: /large/i })
    expect(button).toHaveClass('h-12')
  })

  test('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button', { name: /custom/i })
    expect(button).toHaveClass('custom-class')
  })

  test('should forward additional props', () => {
    render(<Button data-testid="test-button" aria-label="Test">Button</Button>)
    expect(screen.getByTestId('test-button')).toBeInTheDocument()
    expect(screen.getByLabelText('Test')).toBeInTheDocument()
  })

  test('should not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<Button disabled onClick={handleClick}>Disabled</Button>)

    const button = screen.getByRole('button', { name: /disabled/i })
    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })
})
