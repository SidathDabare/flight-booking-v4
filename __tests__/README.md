# Testing Guide

This directory contains all test files for the flight booking application.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
__tests__/
├── lib/                    # Tests for utility functions
│   ├── utils.test.ts
│   └── password-utils.test.ts
├── components/             # Tests for React components
│   └── button.test.tsx
└── api/                    # Tests for API routes
    └── example-api.test.ts
```

## Writing Tests

### 1. Unit Tests (Utility Functions)

Test pure functions in isolation:

```typescript
import { describe, expect, test } from '@jest/globals'
import { myFunction } from '@/lib/my-utils'

describe('myFunction', () => {
  test('should do something', () => {
    expect(myFunction('input')).toBe('expected output')
  })
})
```

### 2. Component Tests

Test React components with user interactions:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '@/components/MyComponent'

test('should handle user interaction', async () => {
  const user = userEvent.setup()
  render(<MyComponent />)

  const button = screen.getByRole('button')
  await user.click(button)

  expect(screen.getByText('Result')).toBeInTheDocument()
})
```

### 3. API Route Tests

Test Next.js API routes:

```typescript
import { GET } from '@/app/api/my-route/route'

test('should return success response', async () => {
  const req = new NextRequest('http://localhost:3000/api/my-route')
  const response = await GET(req)
  const data = await response.json()

  expect(response.status).toBe(200)
  expect(data).toHaveProperty('message')
})
```

## Testing Patterns

### Arrange-Act-Assert (AAA)

```typescript
test('example test', () => {
  // Arrange - Set up test data
  const input = 'test'

  // Act - Execute the function
  const result = myFunction(input)

  // Assert - Verify the result
  expect(result).toBe('expected')
})
```

### Test Coverage Goals

- **Utility Functions**: Aim for 90%+ coverage
- **Components**: Focus on user interactions and edge cases
- **API Routes**: Test authentication, validation, and error handling

## Common Matchers

```typescript
// Equality
expect(value).toBe(expected)
expect(value).toEqual(expected)

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeDefined()
expect(value).toBeNull()

// Numbers
expect(number).toBeGreaterThan(3)
expect(number).toBeLessThanOrEqual(5)

// Strings
expect(string).toMatch(/pattern/)
expect(string).toContain('substring')

// Arrays/Objects
expect(array).toContain(item)
expect(object).toHaveProperty('key')

// DOM (with @testing-library/jest-dom)
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toBeDisabled()
expect(element).toHaveClass('className')
```

## Mocking

### Mock Functions

```typescript
const mockFn = jest.fn()
mockFn('arg')

expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith('arg')
expect(mockFn).toHaveBeenCalledTimes(1)
```

### Mock Modules

```typescript
jest.mock('@/lib/db', () => ({
  connectDB: jest.fn(),
  findUser: jest.fn(),
}))
```

### Mock Return Values

```typescript
const mockFn = jest.fn()
mockFn.mockReturnValue('value')
mockFn.mockResolvedValue('async value')
```

## Best Practices

1. **Test Behavior, Not Implementation** - Focus on what the code does, not how it does it
2. **Keep Tests Isolated** - Each test should be independent
3. **Use Descriptive Names** - Test names should explain what is being tested
4. **Test Edge Cases** - Include boundary values, empty inputs, error conditions
5. **Mock External Dependencies** - Database calls, API requests, file system operations
6. **Avoid Over-Mocking** - Only mock what's necessary
7. **Keep Tests Fast** - Slow tests discourage running them frequently

## Debugging Tests

```bash
# Run a specific test file
npm test -- utils.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should format string"

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- --updateSnapshot
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testingjavascript.com/)
